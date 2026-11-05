import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  Download, 
  RefreshCw, 
  Clock, 
  Repeat 
} from 'lucide-react';
import { 
  loadVideoMetadata, 
  createGifClip, 
  downloadFile, 
  type VideoMeta, 
  formatTime 
} from '../engines/videoEngine';

export const GifMakerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(3);
  const [fps, setFps] = useState<number>(15);
  const [gifResult, setGifResult] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('video/')) return;
    setFile(selectedFile);
    try {
      const vMeta = await loadVideoMetadata(selectedFile);
      setMeta(vMeta);
      setStartTime(0);
    } catch (err) {
      console.error('GIF Maker init error:', err);
    }
  };

  const runGifGeneration = async () => {
    if (!file || !meta) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const res = await createGifClip(file, startTime, duration, (pct) => {
        setProgress(pct);
      });
      setGifResult(res);
    } catch (err) {
      console.error('GIF generation failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!gifResult || !file) return;
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadFile(gifResult.blob, `${base}-animated.webm`);
  };

  const handleReset = () => {
    setFile(null);
    setMeta(null);
    setGifResult(null);
    setProgress(0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">GIF Maker & Animator</h1>
                <span className="text-sm font-urdu font-medium text-indigo-700 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-200">
                  اینیمیٹڈ GIF بنائیں
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Meme Ready
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Convert video segments into lightweight animated looping GIFs for Discord, Slack, and social memes.
              </p>
            </div>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Upload New
            </button>
            <button
              onClick={handleDownload}
              disabled={!gifResult || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Animated Loop
            </button>
          </div>
        )}
      </div>

      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-white border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
            isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-5 shadow-xs">
            <Repeat className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your video here to make a GIF</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Select any short segment and turn it into an infinite looping animated reaction GIF.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition shadow-sm">
            <Upload className="w-4 h-4" />
            Select Video File
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Segment & Frame Rate
            </h3>

            {/* Start Time */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                <span>Start Point:</span>
                <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {formatTime(startTime)} ({startTime.toFixed(1)}s)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={meta ? Math.max(0, meta.duration - 1) : 100}
                step="0.1"
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Duration Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                <span>Loop Length:</span>
                <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {duration} Seconds
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Short (1s)</span>
                <span>Long (8s)</span>
              </div>
            </div>

            {/* FPS Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Smoothness (FPS):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { fpsVal: 10, label: '10 FPS', sub: 'Tiny File' },
                  { fpsVal: 15, label: '15 FPS', sub: 'Balanced' },
                  { fpsVal: 24, label: '24 FPS', sub: 'Ultra Smooth' },
                ].map((item) => (
                  <button
                    key={item.fpsVal}
                    onClick={() => setFps(item.fpsVal)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      fps === item.fpsVal
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className={`text-[10px] ${fps === item.fpsVal ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {item.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={runGifGeneration}
              disabled={isProcessing}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Looping GIF ({progress}%)...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Animated Loop
                </>
              )}
            </button>
          </div>

          {/* Looping Viewport */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col justify-center space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">
              {gifResult ? 'Infinite Loop Preview' : 'Source Video Preview'}
            </h3>

            <div className="rounded-2xl border border-gray-200 bg-black overflow-hidden flex items-center justify-center min-h-[360px] relative">
              {gifResult ? (
                <video
                  src={gifResult.dataUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="max-h-[380px] w-auto max-w-full"
                />
              ) : meta ? (
                <video
                  src={meta.url}
                  controls
                  className="max-h-[380px] w-auto max-w-full"
                />
              ) : null}

              {isProcessing && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-3 p-6 text-center text-white">
                  <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
                  <div className="text-sm font-bold">Capturing Frames for GIF...</div>
                  <div className="w-64 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {gifResult && (
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-center text-xs font-semibold text-indigo-800">
                ✨ Infinite auto-looping animation ready for social sharing
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
