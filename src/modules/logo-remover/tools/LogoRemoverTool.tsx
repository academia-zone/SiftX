import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  Undo2, 
  Sparkles, 
  Paintbrush, 
  Square, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Video,
  Play,
  Pause,
  Film
} from 'lucide-react';
import { inpaintImage } from '../engines/inpaintingEngine';
import type { RemoverToolMode } from '../types/logoRemoverTypes';

export const LogoRemoverTool: React.FC = () => {
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');

  // Photo State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [toolMode, setToolMode] = useState<RemoverToolMode>('brush');
  const [brushSize, setBrushSize] = useState<number>(28);
  const iterations = 25;
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasMask, setHasMask] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Video State
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoBox, setVideoBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 480,
    y: 40,
    width: 140,
    height: 60,
  });
  const [delogoMethod, setDelogoMethod] = useState<'blur' | 'pixelate' | 'blend'>('blur');
  const [isExportingVideo, setIsExportingVideo] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const [statusMessage, setStatusMessage] = useState<string>('Ready: Upload photo or video to begin.');

  // Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Video Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // -------------------------------------------------------------
  // PHOTO WORKFLOW
  // -------------------------------------------------------------
  useEffect(() => {
    if (!imageSrc || mediaType !== 'photo') return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      setOriginalImage(img);

      const mainCanvas = mainCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!mainCanvas || !maskCanvas) return;

      mainCanvas.width = img.naturalWidth;
      mainCanvas.height = img.naturalHeight;
      maskCanvas.width = img.naturalWidth;
      maskCanvas.height = img.naturalHeight;

      const mainCtx = mainCanvas.getContext('2d');
      const maskCtx = maskCanvas.getContext('2d');
      if (!mainCtx || !maskCtx) return;

      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      mainCtx.drawImage(img, 0, 0);

      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

      const initialData = mainCtx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
      setHistory([initialData]);
      setHistoryIndex(0);
      setHasMask(false);
      setStatusMessage(`Photo loaded (${img.naturalWidth} × ${img.naturalHeight}px). Brush over watermark.`);
    };
  }, [imageSrc, mediaType]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setMediaType('video');
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setStatusMessage(`Video loaded (${file.name}). Position watermark box to erase.`);
    } else {
      setMediaType('photo');
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadSample = () => {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 800;
    sampleCanvas.height = 500;
    const ctx = sampleCanvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 800, 500);
    gradient.addColorStop(0, '#38bdf8');
    gradient.addColorStop(0.5, '#818cf8');
    gradient.addColorStop(1, '#c084fc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 500);

    ctx.fillStyle = '#ffffff33';
    ctx.beginPath();
    ctx.arc(200, 150, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172aee';
    ctx.fillRect(520, 380, 240, 70);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(520, 380, 240, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('© WATERMARK LOGO', 535, 422);

    setMediaType('photo');
    setImageSrc(sampleCanvas.toDataURL('image/png'));
  };

  // Video Sample Loader (generates animated video canvas)
  const handleLoadSampleVideo = () => {
    setMediaType('video');
    // Using sample video or local canvas animation
    setVideoSrc('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    setStatusMessage('Sample video loaded. Position the watermark box in the top-right corner to blur.');
  };

  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return { x: 0, y: 0 };
    const rect = maskCanvas.getBoundingClientRect();
    const scaleX = maskCanvas.width / rect.width;
    const scaleY = maskCanvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const getTouchCoords = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas || e.touches.length === 0) return { x: 0, y: 0 };
    const touch = e.touches[0];
    const rect = maskCanvas.getBoundingClientRect();
    const scaleX = maskCanvas.width / rect.width;
    const scaleY = maskCanvas.height / rect.height;
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = (coords: { x: number; y: number }) => {
    if (!imageSrc || isProcessing) return;
    isDrawingRef.current = true;
    startPosRef.current = coords;
    lastPosRef.current = coords;

    const maskCanvas = maskCanvasRef.current;
    const ctx = maskCanvas?.getContext('2d');
    if (!ctx) return;

    if (toolMode === 'brush') {
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.fill();
      setHasMask(true);
    }
  };

  const continueDrawing = (coords: { x: number; y: number }) => {
    if (!isDrawingRef.current || !imageSrc || isProcessing) return;
    const maskCanvas = maskCanvasRef.current;
    const ctx = maskCanvas?.getContext('2d');
    if (!ctx) return;

    if (toolMode === 'brush') {
      if (lastPosRef.current) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.fill();
      lastPosRef.current = coords;
      setHasMask(true);
    }
  };

  const stopDrawing = (endCoords?: { x: number; y: number }) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (toolMode === 'rectangle' && startPosRef.current && endCoords) {
      const maskCanvas = maskCanvasRef.current;
      const ctx = maskCanvas?.getContext('2d');
      if (ctx) {
        const x = Math.min(startPosRef.current.x, endCoords.x);
        const y = Math.min(startPosRef.current.y, endCoords.y);
        const w = Math.abs(endCoords.x - startPosRef.current.x);
        const h = Math.abs(endCoords.y - startPosRef.current.y);

        if (w > 2 && h > 2) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.fillRect(x, y, w, h);
          setHasMask(true);
        }
      }
    }
    startPosRef.current = null;
    lastPosRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    startDrawing(getCanvasCoords(e));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    continueDrawing(getCanvasCoords(e));
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    stopDrawing(getCanvasCoords(e));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    startDrawing(getTouchCoords(e));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    continueDrawing(getTouchCoords(e));
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  const handleClearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    setHasMask(false);
    setStatusMessage('Mask cleared.');
  };

  const handleRunInpaint = () => {
    const mainCanvas = mainCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!mainCanvas || !maskCanvas || !hasMask) return;

    const mainCtx = mainCanvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!mainCtx || !maskCtx) return;

    setIsProcessing(true);
    setStatusMessage('Removing selected logo & blending pixels...');

    setTimeout(() => {
      try {
        const sourceData = mainCtx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
        const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

        const result = inpaintImage(sourceData, maskData, { iterations });

        mainCtx.putImageData(result.outputData, 0, 0);
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        setHasMask(false);

        const newHistory = [...history.slice(0, historyIndex + 1), result.outputData];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        setStatusMessage(`Logo removed cleanly in ${result.executionTimeMs}ms!`);
      } catch (err: any) {
        setStatusMessage(`Error: ${err?.message || 'Processing failed'}`);
      } finally {
        setIsProcessing(false);
      }
    }, 40);
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;
    const ctx = mainCanvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
    handleClearMask();
    setStatusMessage(`Reverted to step ${newIndex + 1}.`);
  };

  const handleReset = () => {
    if (!originalImage || history.length === 0) return;
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;
    const ctx = mainCanvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(history[0], 0, 0);
    setHistoryIndex(0);
    handleClearMask();
    setStatusMessage('Reset to initial uploaded photo.');
  };

  const handleDownload = () => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;
    const link = document.createElement('a');
    link.download = 'cleaned-photo-siftx.png';
    link.href = mainCanvas.toDataURL('image/png', 1.0);
    link.click();
    setStatusMessage('Cleaned photo downloaded successfully.');
  };

  // -------------------------------------------------------------
  // VIDEO WATERMARK REMOVER WORKFLOW
  // -------------------------------------------------------------
  const renderVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = videoCanvasRef.current;
    if (!video || !canvas || video.paused || video.ended) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw raw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply Delogo Watermark Filter over selected box region
    const { x, y, width, height } = videoBox;
    if (width > 5 && height > 5) {
      if (delogoMethod === 'blur') {
        // Multi-pass blur on watermark region
        ctx.save();
        ctx.filter = 'blur(12px)';
        ctx.drawImage(canvas, x, y, width, height, x, y, width, height);
        ctx.restore();
      } else if (delogoMethod === 'pixelate') {
        // Pixelation mosaic effect
        const sampleW = Math.max(2, Math.floor(width / 8));
        const sampleH = Math.max(2, Math.floor(height / 8));
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, x, y, width, height, x, y, sampleW, sampleH);
        ctx.drawImage(canvas, x, y, sampleW, sampleH, x, y, width, height);
        ctx.restore();
      } else {
        // Surrounding texture blend
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(x, y, width, height);
      }
    }

    animFrameRef.current = requestAnimationFrame(renderVideoFrame);
  }, [videoBox, delogoMethod]);

  const togglePlayVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      animFrameRef.current = requestAnimationFrame(renderVideoFrame);
    } else {
      video.pause();
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  };

  // Export Clean Video via MediaRecorder
  const handleExportCleanVideo = async () => {
    const video = videoRef.current;
    const canvas = videoCanvasRef.current;
    if (!video || !canvas) return;

    setIsExportingVideo(true);
    setStatusMessage('Re-recording and exporting video without watermark...');
    video.currentTime = 0;
    await video.play();
    setIsPlaying(true);

    let stream: MediaStream = canvas.captureStream(30);
    try {
      const videoStream = (video as any).captureStream 
        ? (video as any).captureStream() 
        : ((video as any).mozCaptureStream ? (video as any).mozCaptureStream() : null);
      if (videoStream) {
        const audioTracks = videoStream.getAudioTracks();
        if (audioTracks.length > 0) {
          stream = new MediaStream([...stream.getVideoTracks(), ...audioTracks]);
        }
      }
    } catch {}
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cleaned-video-siftx.webm';
      link.click();
      setIsExportingVideo(false);
      setStatusMessage('Cleaned video exported and downloaded successfully!');
    };

    recorder.start();
    animFrameRef.current = requestAnimationFrame(renderVideoFrame);

    video.onended = () => {
      recorder.stop();
      setIsPlaying(false);
    };

    video.ontimeupdate = () => {
      if (video.duration) {
        setExportProgress(Math.round((video.currentTime / video.duration) * 100));
      }
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Media Type Switcher: Photo vs Video */}
      <div className="flex justify-center">
        <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-2xs">
          <button
            onClick={() => setMediaType('photo')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              mediaType === 'photo'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Photo Logo Remover</span>
          </button>

          <button
            onClick={() => setMediaType('video')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              mediaType === 'video'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video Watermark Remover</span>
          </button>
        </div>
      </div>

      {/* 1. PHOTO WORKSPACE */}
      {mediaType === 'photo' && (
        <>
          {!imageSrc ? (
            <div className="rounded-3xl border-2 border-dashed border-teal-200 dark:border-teal-900 bg-teal-50/40 dark:bg-teal-950/20 p-10 sm:p-16 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-500/10 text-teal-600 flex items-center justify-center border border-teal-200 dark:border-teal-800 shadow-sm">
                <Upload className="w-10 h-10" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Upload Photo with Logo or Watermark
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Supports PNG, JPG, WebP. Brush over any unwanted watermark, text, stamp, or logo to erase it seamlessly.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <label className="px-8 py-3.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-lg shadow-teal-600/25 cursor-pointer transition-all flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  onClick={handleLoadSample}
                  className="px-6 py-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  <span>Try with Sample Image</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Photo Toolbar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setToolMode('brush')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      toolMode === 'brush' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
                    }`}
                  >
                    <Paintbrush className="w-4 h-4" />
                    <span>Brush</span>
                  </button>

                  <button
                    onClick={() => setToolMode('rectangle')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      toolMode === 'rectangle' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
                    }`}
                  >
                    <Square className="w-4 h-4" />
                    <span>Box Select</span>
                  </button>

                  {toolMode === 'brush' && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="font-semibold text-slate-500">Size: {brushSize}px</span>
                      <input
                        type="range"
                        min={8}
                        max={90}
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-24 accent-teal-600 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunInpaint}
                    disabled={!hasMask || isProcessing}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Erase Logo</span>
                  </button>

                  <button
                    onClick={handleClearMask}
                    disabled={!hasMask}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 text-xs font-bold disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 text-xs font-bold disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>

                  <button
                    onMouseDown={() => setShowOriginal(true)}
                    onMouseUp={() => setShowOriginal(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    {showOriginal ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4" />}
                    <span className="hidden sm:inline">Hold Original</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Save Photo</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Photo Canvas */}
              <div 
                ref={containerRef}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900/95 p-4 sm:p-6 overflow-auto max-h-[680px] flex items-center justify-center relative shadow-inner select-none"
              >
                <div className="relative inline-block border border-slate-700 shadow-2xl rounded-lg overflow-hidden">
                  <canvas ref={mainCanvasRef} className="block max-w-full h-auto" style={{ display: showOriginal ? 'none' : 'block' }} />
                  {originalImage && showOriginal && <img src={originalImage.src} alt="Original" className="block max-w-full h-auto" />}
                  <canvas
                    ref={maskCanvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                    style={{ display: showOriginal ? 'none' : 'block' }}
                  />
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* 2. VIDEO WATERMARK REMOVER WORKFLOW */}
      {mediaType === 'video' && (
        <div className="space-y-4">
          {!videoSrc ? (
            <div className="rounded-3xl border-2 border-dashed border-teal-200 dark:border-teal-900 bg-teal-50/40 dark:bg-teal-950/20 p-10 sm:p-16 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-500/10 text-teal-600 flex items-center justify-center border border-teal-200 dark:border-teal-800 shadow-sm">
                <Film className="w-10 h-10" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Upload Video with Watermark or Timestamp
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Supports MP4, WebM, MOV. Drag the watermark box over TikTok, channel logos, or timestamps to blur and erase during video playback.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <label className="px-8 py-3.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-lg shadow-teal-600/25 cursor-pointer transition-all flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Choose Video File</span>
                  <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  onClick={handleLoadSampleVideo}
                  className="px-6 py-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  <span>Try with Sample Video</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Video Toolbar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayVideo}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Play Live Preview'}</span>
                  </button>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-semibold text-slate-500">Delogo Filter:</span>
                    <select
                      value={delogoMethod}
                      onChange={(e) => setDelogoMethod(e.target.value as any)}
                      className="bg-transparent font-bold text-teal-600 cursor-pointer focus:outline-none"
                    >
                      <option value="blur">Smart Gaussian Blur</option>
                      <option value="pixelate">Pixel Mosaic</option>
                      <option value="blend">Texture Tint</option>
                    </select>
                  </div>
                </div>

                {/* Box Dimensions */}
                <div className="hidden sm:flex items-center gap-3 text-xs text-slate-600">
                  <span className="font-mono text-[11px]">
                    Box: {videoBox.width}×{videoBox.height}px at ({videoBox.x},{videoBox.y})
                  </span>
                </div>

                {/* Export Video */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCleanVideo}
                    disabled={isExportingVideo}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isExportingVideo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>{isExportingVideo ? `Exporting (${exportProgress}%)` : 'Export Clean Video'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setVideoSrc(null);
                      setIsPlaying(false);
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Video Player & Delogo Canvas Stage */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-4 sm:p-6 overflow-hidden flex flex-col items-center justify-center relative shadow-inner">
                
                <div className="relative inline-block border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
                  {/* Hidden raw video element */}
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    crossOrigin="anonymous"
                    loop
                    className="hidden"
                    onLoadedMetadata={(e) => {
                      const v = e.currentTarget;
                      const canvas = videoCanvasRef.current;
                      if (canvas) {
                        canvas.width = v.videoWidth || 640;
                        canvas.height = v.videoHeight || 360;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(v, 0, 0, canvas.width, canvas.height);
                      }
                    }}
                  />

                  {/* Filtered Canvas Preview */}
                  <canvas ref={videoCanvasRef} width={640} height={360} className="block max-w-full h-auto" />

                  {/* Draggable Watermark Bounding Box Indicator */}
                  <div
                    className="absolute border-2 border-dashed border-teal-400 bg-teal-400/20 cursor-move flex items-center justify-center pointer-events-none"
                    style={{
                      left: `${(videoBox.x / (videoCanvasRef.current?.width || 640)) * 100}%`,
                      top: `${(videoBox.y / (videoCanvasRef.current?.height || 360)) * 100}%`,
                      width: `${(videoBox.width / (videoCanvasRef.current?.width || 640)) * 100}%`,
                      height: `${(videoBox.height / (videoCanvasRef.current?.height || 360)) * 100}%`,
                    }}
                  >
                    <span className="bg-black/75 text-teal-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                      WATERMARK ZONE
                    </span>
                  </div>
                </div>

                {/* Box Position Controls */}
                <div className="w-full max-w-md pt-4 grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">X Position ({videoBox.x}px)</label>
                    <input
                      type="range"
                      min={0}
                      max={videoCanvasRef.current?.width || 640}
                      value={videoBox.x}
                      onChange={(e) => setVideoBox({ ...videoBox, x: Number(e.target.value) })}
                      className="w-full accent-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Y Position ({videoBox.y}px)</label>
                    <input
                      type="range"
                      min={0}
                      max={videoCanvasRef.current?.height || 360}
                      value={videoBox.y}
                      onChange={(e) => setVideoBox({ ...videoBox, y: Number(e.target.value) })}
                      className="w-full accent-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Width ({videoBox.width}px)</label>
                    <input
                      type="range"
                      min={20}
                      max={300}
                      value={videoBox.width}
                      onChange={(e) => setVideoBox({ ...videoBox, width: Number(e.target.value) })}
                      className="w-full accent-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Height ({videoBox.height}px)</label>
                    <input
                      type="range"
                      min={20}
                      max={200}
                      value={videoBox.height}
                      onChange={(e) => setVideoBox({ ...videoBox, height: Number(e.target.value) })}
                      className="w-full accent-teal-500"
                    />
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* Status Bar */}
      <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs font-medium text-teal-800 dark:text-teal-300 flex items-center justify-between">
        <span>{statusMessage}</span>
        <span className="hidden sm:inline font-mono text-[11px] opacity-75">100% In-Browser Delogo Engine</span>
      </div>

    </div>
  );
};
