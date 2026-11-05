import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Trash2, 
  RotateCcw, 
  Layers, 
  Type, 
  Crop, 
  MousePointer, 
  PackageCheck, 
  Scissors
} from 'lucide-react';
import { extractElementFromCanvas, inpaintRegionOnCanvas } from '../engines/segmentationEngine';
import type { DetectedElement } from '../types/imageSeparatorTypes';

interface TextLayerItem {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'bold' | 'normal';
}

export const ImageSeparatorTool: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  
  // Interaction Modes: 'snip' = draw box to cut icon/text; 'move' = select and drag layers
  const [activeMode, setActiveMode] = useState<'snip' | 'move'>('snip');
  
  // Layer states
  const [extractedLayers, setExtractedLayers] = useState<DetectedElement[]>([]);
  const [textLayers, setTextLayers] = useState<TextLayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Settings for cutting
  const [autoTransparent, setAutoTransparent] = useState<boolean>(true);
  const [eraseFromBase, setEraseFromBase] = useState<boolean>(false);

  // Box Snipping Drag state
  const [isSnapping, setIsSnapping] = useState<boolean>(false);
  const [snipStart, setSnipStart] = useState<{ x: number; y: number } | null>(null);
  const [snipCurrent, setSnipCurrent] = useState<{ x: number; y: number } | null>(null);

  // Layer Moving Drag state
  const isDraggingLayerRef = useRef<boolean>(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [statusMessage, setStatusMessage] = useState<string>(
    'Upload your image, then drag a box over any icon or text to extract it into a separate layer.'
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load Base Image
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      setBaseImage(img);

      const baseCanvas = baseCanvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      if (!baseCanvas || !overlayCanvas) return;

      baseCanvas.width = img.naturalWidth;
      baseCanvas.height = img.naturalHeight;
      overlayCanvas.width = img.naturalWidth;
      overlayCanvas.height = img.naturalHeight;

      const baseCtx = baseCanvas.getContext('2d');
      if (!baseCtx) return;

      // Draw pure untouched original image
      baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
      baseCtx.drawImage(img, 0, 0);

      setExtractedLayers([]);
      setTextLayers([]);
      setSelectedLayerId(null);
      setStatusMessage(`Image loaded (${img.naturalWidth} × ${img.naturalHeight}px). Drag a box around any icon or text.`);
    };
  }, [imageSrc]);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Load Sample Graphic
  const handleLoadSample = () => {
    const sample = document.createElement('canvas');
    sample.width = 900;
    sample.height = 600;
    const ctx = sample.getContext('2d');
    if (!ctx) return;

    // Scenic gradient background
    const gradient = ctx.createLinearGradient(0, 0, 900, 600);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 900, 600);

    // Some icons on cards
    // Icon Card 1 (Star)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(100, 100, 140, 140, [24]);
    ctx.fill();
    ctx.font = 'bold 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', 170, 170);

    // Icon Card 2 (Lightning)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(300, 100, 140, 140, [24]);
    ctx.fill();
    ctx.fillText('⚡', 370, 170);

    // Icon Card 3 (Rocket)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(500, 100, 140, 140, [24]);
    ctx.fill();
    ctx.fillText('🚀', 570, 170);

    // Icon Card 4 (Shield)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(700, 100, 140, 140, [24]);
    ctx.fill();
    ctx.fillText('🛡️', 770, 170);

    // Headline Text
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 36px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CANVA ASSET & ICON PACK', 100, 340);

    // Subtitle Text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 20px sans-serif';
    ctx.fillText('Drag a box over any star, rocket, or text above to extract its layer.', 100, 390);

    // Button Badge
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(100, 460, 260, 60, [30]);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXTRACT ASSETS →', 230, 497);

    setImageSrc(sample.toDataURL('image/png'));
  };

  // Convert Mouse Coordinates to Canvas Space
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  // Mouse Down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageSrc) return;
    const coords = getCanvasCoords(e);

    if (activeMode === 'snip') {
      setIsSnapping(true);
      setSnipStart(coords);
      setSnipCurrent(coords);
    } else if (activeMode === 'move') {
      // Check if user clicked on an extracted layer
      for (let i = extractedLayers.length - 1; i >= 0; i--) {
        const el = extractedLayers[i];
        if (
          el.visible &&
          coords.x >= el.x &&
          coords.x <= el.x + el.width &&
          coords.y >= el.y &&
          coords.y <= el.y + el.height
        ) {
          setSelectedLayerId(el.id);
          isDraggingLayerRef.current = true;
          dragOffsetRef.current = { x: coords.x - el.x, y: coords.y - el.y };
          return;
        }
      }

      // Check text layers
      for (let i = textLayers.length - 1; i >= 0; i--) {
        const t = textLayers[i];
        if (Math.abs(coords.x - t.x) < 150 && Math.abs(coords.y - t.y) < 30) {
          setSelectedLayerId(t.id);
          isDraggingLayerRef.current = true;
          dragOffsetRef.current = { x: coords.x - t.x, y: coords.y - t.y };
          return;
        }
      }

      setSelectedLayerId(null);
    }
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (activeMode === 'snip' && isSnapping) {
      setSnipCurrent(coords);
    } else if (activeMode === 'move' && isDraggingLayerRef.current && selectedLayerId) {
      const newX = coords.x - dragOffsetRef.current.x;
      const newY = coords.y - dragOffsetRef.current.y;

      // Update extracted layer or text layer
      setExtractedLayers((prev) =>
        prev.map((el) => (el.id === selectedLayerId ? { ...el, x: newX, y: newY } : el))
      );
      setTextLayers((prev) =>
        prev.map((t) => (t.id === selectedLayerId ? { ...t, x: newX, y: newY } : t))
      );
    }
  };

  // Mouse Up -> Complete Snipping
  const handleMouseUp = () => {
    if (activeMode === 'snip' && isSnapping && snipStart && snipCurrent) {
      setIsSnapping(false);

      const x = Math.min(snipStart.x, snipCurrent.x);
      const y = Math.min(snipStart.y, snipCurrent.y);
      const width = Math.abs(snipCurrent.x - snipStart.x);
      const height = Math.abs(snipCurrent.y - snipStart.y);

      // Require minimum size of 15x15 to prevent accidental clicks
      if (width > 15 && height > 15 && baseCanvasRef.current) {
        const box = { x, y, width, height };

        const newElement = extractElementFromCanvas(baseCanvasRef.current, box, {
          makeTransparent: autoTransparent,
          tolerance: 28,
          label: `Extracted ${width > height * 2 ? 'Text' : 'Icon'} #${extractedLayers.length + 1}`,
        });

        // Optionally erase region from base canvas
        if (eraseFromBase) {
          inpaintRegionOnCanvas(baseCanvasRef.current, box);
        }

        setExtractedLayers((prev) => [...prev, newElement]);
        setSelectedLayerId(newElement.id);
        setStatusMessage(`Extracted "${newElement.name}" (${width}×${height}px). It is now an independent layer!`);
      }

      setSnipStart(null);
      setSnipCurrent(null);
    } else if (activeMode === 'move') {
      isDraggingLayerRef.current = false;
    }
  };

  // Render Overlays: Extracted layers, Selection Box, Text Layers
  useEffect(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // 1. Draw Extracted Layers on top
    extractedLayers.forEach((el) => {
      if (!el.visible) return;

      const img = new Image();
      img.src = el.customImage || el.dataUrl;
      if (img.complete) {
        ctx.save();
        ctx.globalAlpha = el.opacity;
        ctx.drawImage(img, el.x, el.y, el.width, el.height);

        // Highlight selected
        if (el.id === selectedLayerId) {
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(el.x - 2, el.y - 2, el.width + 4, el.height + 4);
          ctx.setLineDash([]);
        }
        ctx.restore();
      } else {
        img.onload = () => {
          ctx.drawImage(img, el.x, el.y, el.width, el.height);
        };
      }
    });

    // 2. Draw Text Layers
    textLayers.forEach((t) => {
      ctx.save();
      ctx.fillStyle = t.color;
      ctx.font = `${t.fontWeight} ${t.fontSize}px sans-serif`;
      ctx.fillText(t.text, t.x, t.y);

      if (t.id === selectedLayerId) {
        const metrics = ctx.measureText(t.text);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(t.x - 4, t.y - t.fontSize - 2, metrics.width + 8, t.fontSize + 6);
      }
      ctx.restore();
    });

    // 3. Draw Active Snip Box (When dragging to cut)
    if (activeMode === 'snip' && isSnapping && snipStart && snipCurrent) {
      const bx = Math.min(snipStart.x, snipCurrent.x);
      const by = Math.min(snipStart.y, snipCurrent.y);
      const bw = Math.abs(snipCurrent.x - snipStart.x);
      const bh = Math.abs(snipCurrent.y - snipStart.y);

      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.restore();
    }
  }, [extractedLayers, textLayers, selectedLayerId, activeMode, isSnapping, snipStart, snipCurrent]);

  // Replace Extracted Element with Custom Logo/Image
  const handleReplaceElement = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const customUrl = event.target?.result as string;
      setExtractedLayers((prev) =>
        prev.map((el) => (el.id === id ? { ...el, customImage: customUrl } : el))
      );
      setStatusMessage(`Replaced layer with your custom icon!`);
    };
    reader.readAsDataURL(file);
  };

  // Download Single Transparent Asset
  const downloadSingleAsset = (elem: DetectedElement) => {
    const link = document.createElement('a');
    link.download = `${elem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    link.href = elem.customImage || elem.dataUrl;
    link.click();
    setStatusMessage(`Downloaded ${elem.name} as clean transparent PNG.`);
  };

  // Download All Assets
  const downloadAllAssets = () => {
    extractedLayers.forEach((elem, idx) => {
      setTimeout(() => {
        downloadSingleAsset(elem);
      }, idx * 250);
    });
    setStatusMessage(`Exporting all ${extractedLayers.length} extracted icon assets...`);
  };

  // Export Full Redesigned Picture
  const exportFullImage = () => {
    const baseCanvas = baseCanvasRef.current;
    const overlay = overlayCanvasRef.current;
    if (!baseCanvas || !overlay) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = baseCanvas.width;
    exportCanvas.height = baseCanvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Draw base + overlays
    ctx.drawImage(baseCanvas, 0, 0);
    ctx.drawImage(overlay, 0, 0);

    const link = document.createElement('a');
    link.download = 'siftx-edited-graphic.png';
    link.href = exportCanvas.toDataURL('image/png', 1.0);
    link.click();
    setStatusMessage('Exported full edited graphic with high-resolution quality.');
  };

  // Add Editable Text Layer
  const handleAddTextLayer = () => {
    const newText: TextLayerItem = {
      id: `text-${Date.now()}`,
      text: 'My Custom Text',
      x: 80,
      y: 120,
      fontSize: 32,
      color: '#ffffff',
      fontWeight: 'bold',
    };
    setTextLayers((prev) => [...prev, newText]);
    setSelectedLayerId(newText.id);
    setActiveMode('move');
    setStatusMessage('Added text layer. You can drag and position it anywhere.');
  };

  // Reset to original image
  const handleReset = () => {
    if (!baseImage) return;
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) return;
    const ctx = baseCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
    ctx.drawImage(baseImage, 0, 0);
    setExtractedLayers([]);
    setTextLayers([]);
    setSelectedLayerId(null);
    setStatusMessage('Reset to original picture.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {!imageSrc ? (
        <div className="rounded-3xl border-2 border-dashed border-violet-200 dark:border-violet-900 bg-violet-50/40 dark:bg-violet-950/20 p-10 sm:p-16 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-violet-500/10 text-violet-600 flex items-center justify-center border border-violet-200 dark:border-violet-800 shadow-sm">
            <Scissors className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Upload Image to Extract Icons & Text Layers
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Preserves 100% of your photo. Drag a box over any icon, logo, badge, or text block to cut it into a separate transparent layer or replace it like in Canva.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <label className="px-8 py-3.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm shadow-lg shadow-violet-600/25 cursor-pointer transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Choose Image</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleLoadSample}
              className="px-6 py-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span>Try with Sample Graphic</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Action Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            
            {/* Mode Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveMode('snip')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeMode === 'snip'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                title="Draw a box over any icon or text to extract it"
              >
                <Crop className="w-4 h-4" />
                <span>Box Snip Tool</span>
              </button>

              <button
                onClick={() => setActiveMode('move')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeMode === 'move'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                title="Select and drag extracted layers"
              >
                <MousePointer className="w-4 h-4" />
                <span>Select & Move</span>
              </button>

              <button
                onClick={handleAddTextLayer}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Type className="w-3.5 h-3.5 text-violet-600" />
                <span>Add Text</span>
              </button>
            </div>

            {/* Snip Options */}
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={autoTransparent}
                  onChange={(e) => setAutoTransparent(e.target.checked)}
                  className="rounded text-violet-600 cursor-pointer"
                />
                <span>Auto-Transparent Icon</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={eraseFromBase}
                  onChange={(e) => setEraseFromBase(e.target.checked)}
                  className="rounded text-violet-600 cursor-pointer"
                />
                <span>Erase from Original Picture</span>
              </label>
            </div>

            {/* Export & Reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={downloadAllAssets}
                disabled={extractedLayers.length === 0}
                className="px-4 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-bold text-xs hover:bg-violet-100 transition-all cursor-pointer flex items-center gap-1.5 border border-violet-200 dark:border-violet-800 disabled:opacity-40"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Export Icons ({extractedLayers.length})</span>
              </button>

              <button
                onClick={exportFullImage}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save Full Image</span>
              </button>

              <button
                onClick={handleReset}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 text-xs cursor-pointer"
                title="Reset to original picture"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Canva Workspace: Left Layers, Right Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Layers Panel (4 cols) */}
            <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-600" />
                  <h3 className="font-extrabold text-xs tracking-wider uppercase text-slate-900 dark:text-white">
                    Layers ({extractedLayers.length + textLayers.length})
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeMode === 'snip' ? 'Box Snip Active' : 'Move Mode'}
                </span>
              </div>

              <div className="p-3 space-y-2 max-h-[640px] overflow-y-auto">
                {extractedLayers.length === 0 && textLayers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                    <Crop className="w-8 h-8 mx-auto opacity-40 text-violet-500" />
                    <p>No layers extracted yet.</p>
                    <p className="text-[11px] text-slate-500">
                      Drag a box over any icon, logo, or text on the image to snip it!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Extracted Icon / Object Layers */}
                    {extractedLayers.map((elem) => (
                      <div
                        key={elem.id}
                        onClick={() => {
                          setSelectedLayerId(elem.id);
                          setActiveMode('move');
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          selectedLayerId === elem.id
                            ? 'border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden bg-checkered">
                          <img 
                            src={elem.customImage || elem.dataUrl} 
                            alt="Layer" 
                            className="max-w-full max-h-full object-contain" 
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                            {elem.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {elem.width}×{elem.height}px at ({elem.x},{elem.y})
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSingleAsset(elem);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-violet-100 hover:text-violet-600 text-slate-600 text-xs cursor-pointer"
                            title="Download transparent PNG"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-600 text-xs cursor-pointer"
                            title="Replace with your own icon/image"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleReplaceElement(elem.id, e)}
                              className="hidden"
                            />
                          </label>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExtractedLayers((prev) =>
                                prev.map((el) => (el.id === elem.id ? { ...el, visible: !el.visible } : el))
                              );
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {elem.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExtractedLayers((prev) => prev.filter((el) => el.id !== elem.id));
                              if (selectedLayerId === elem.id) setSelectedLayerId(null);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    ))}

                    {/* Text Layers */}
                    {textLayers.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedLayerId(t.id);
                          setActiveMode('move');
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          selectedLayerId === t.id
                            ? 'border-violet-600 bg-violet-50/60 dark:bg-violet-950/40'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-violet-600 flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5" />
                            <span>Text Layer</span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTextLayers((prev) => prev.filter((item) => item.id !== t.id));
                              if (selectedLayerId === t.id) setSelectedLayerId(null);
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={t.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTextLayers((prev) =>
                              prev.map((item) => (item.id === t.id ? { ...item, text: val } : item))
                            );
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        />

                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={t.color}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTextLayers((prev) =>
                                prev.map((item) => (item.id === t.id ? { ...item, color: val } : item))
                              );
                            }}
                            className="w-6 h-6 rounded cursor-pointer border border-slate-300"
                            title="Text Color"
                          />
                          <input
                            type="range"
                            min={14}
                            max={72}
                            value={t.fontSize}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setTextLayers((prev) =>
                                prev.map((item) => (item.id === t.id ? { ...item, fontSize: val } : item))
                              );
                            }}
                            className="w-24 accent-violet-600 cursor-pointer"
                          />
                          <span className="text-[10px] font-mono text-slate-500">{t.fontSize}px</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

            </div>

            {/* Right Column: Interactive Canvas Stage (8 cols) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
                <span className="flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-violet-600" />
                  <span>
                    {activeMode === 'snip'
                      ? 'SNIP MODE: Click and drag a box directly over any icon or text'
                      : 'MOVE MODE: Click any layer to select and drag'}
                  </span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {selectedLayerId ? `Selected: ${selectedLayerId}` : 'No layer selected'}
                </span>
              </div>

              {/* Dual-Canvas Container: Base untouched image + Overlay */}
              <div 
                ref={containerRef}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-4 sm:p-6 overflow-auto max-h-[700px] flex items-center justify-center relative shadow-inner select-none"
              >
                <div className="relative inline-block border border-slate-700 shadow-2xl rounded-lg overflow-hidden bg-checkered">
                  
                  {/* Layer 1: Untouched High-Fidelity Base Photo */}
                  <canvas ref={baseCanvasRef} className="block max-w-full h-auto" />

                  {/* Layer 2: Interactive Overlay (Snip box, extracted layers, text) */}
                  <canvas
                    ref={overlayCanvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className={`absolute inset-0 ${
                      activeMode === 'snip' ? 'cursor-crosshair' : 'cursor-move'
                    }`}
                  />

                </div>
              </div>

            </div>

          </div>

          {/* Status Message */}
          <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-xs font-medium text-violet-800 dark:text-violet-300 flex items-center justify-between">
            <span>{statusMessage}</span>
            <span className="hidden sm:inline font-mono text-[11px] opacity-75">100% Client-Side Asset Precision</span>
          </div>

        </div>
      )}

    </div>
  );
};
