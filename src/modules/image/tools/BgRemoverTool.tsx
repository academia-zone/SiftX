import React, { useState, useRef } from 'react';
import { 
  Wand2, 
  Upload, 
  Download, 
  RefreshCw, 
  Check, 
  ArrowRight, 
  Zap, 
  Sliders, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { 
  removeBackgroundFast, 
  removeBackgroundAI, 
  compositeOnBackground, 
  downloadFile 
} from '../engines/imageEngine';

const PRESET_COLORS = [
  { name: 'Transparent', value: null, bgClass: 'bg-stripes' },
  { name: 'White', value: '#ffffff', bgClass: 'bg-white' },
  { name: 'Studio Black', value: '#111827', bgClass: 'bg-gray-900' },
  { name: 'Warm Amber', value: '#f59e0b', bgClass: 'bg-amber-500' },
  { name: 'Royal Purple', value: '#7c3aed', bgClass: 'bg-purple-600' },
  { name: 'Mint Green', value: '#10b981', bgClass: 'bg-emerald-500' },
  { name: 'Sky Blue', value: '#0ea5e9', bgClass: 'bg-sky-500' },
  { name: 'Ruby Red', value: '#e11d48', bgClass: 'bg-rose-600' },
];

type EngineMode = 'fast' | 'ai';

export const BgRemoverTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [engineMode, setEngineMode] = useState<EngineMode>('fast');
  const [tolerance, setTolerance] = useState<number>(35);
  const [feather, setFeather] = useState<number>(2);
  
  const [cutoutResult, setCutoutResult] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const [displayResult, setDisplayResult] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const [replacementColor, setReplacementColor] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState<string>('#ffffff');
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    setErrorNotice(null);
    const url = URL.createObjectURL(selectedFile);
    setOriginalPreview(url);
    runRemoval(selectedFile, engineMode, tolerance, feather, replacementColor);
  };

  const runRemoval = async (
    targetFile: File,
    mode: EngineMode,
    tol: number,
    fth: number,
    currentColor: string | null
  ) => {
    setIsProcessing(true);
    setErrorNotice(null);

    try {
      let cutout: { blob: Blob; dataUrl: string };

      if (mode === 'fast') {
        setProgressMessage('Instant 1-second local matting...');
        setProgressPercent(50);
        cutout = await removeBackgroundFast(targetFile, tol, fth);
        setProgressPercent(100);
      } else {
        cutout = await removeBackgroundAI(targetFile, (msg, pct) => {
          setProgressMessage(msg);
          setProgressPercent(pct);
        });
      }

      setCutoutResult(cutout);
      const composited = await compositeOnBackground(cutout.dataUrl, currentColor);
      setDisplayResult(composited);
    } catch (err: any) {
      console.error('BG removal error:', err);
      // Fallback to fast mode if AI takes too long
      if (mode === 'ai') {
        try {
          setProgressMessage('Switching to Turbo Fast mode...');
          const fallbackCutout = await removeBackgroundFast(targetFile, tol, fth);
          setCutoutResult(fallbackCutout);
          const composited = await compositeOnBackground(fallbackCutout.dataUrl, currentColor);
          setDisplayResult(composited);
          setErrorNotice('AI mode was slow or timed out; automatically used Turbo Instant mode.');
        } catch (e: any) {
          setErrorNotice('Processing failed. Please try another image.');
        }
      } else {
        setErrorNotice(err?.message || 'Processing failed. Please try another image.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModeChange = (newMode: EngineMode) => {
    setEngineMode(newMode);
    if (file) {
      runRemoval(file, newMode, tolerance, feather, replacementColor);
    }
  };

  const handleToleranceChange = (newTol: number) => {
    setTolerance(newTol);
    if (file && engineMode === 'fast') {
      runRemoval(file, 'fast', newTol, feather, replacementColor);
    }
  };

  const handleFeatherChange = (newFth: number) => {
    setFeather(newFth);
    if (file && engineMode === 'fast') {
      runRemoval(file, 'fast', tolerance, newFth, replacementColor);
    }
  };

  const handleColorChange = async (color: string | null) => {
    setReplacementColor(color);
    if (cutoutResult) {
      const composited = await compositeOnBackground(cutoutResult.dataUrl, color);
      setDisplayResult(composited);
    }
  };

  const handleCustomColorChange = async (hex: string) => {
    setCustomColor(hex);
    setReplacementColor(hex);
    if (cutoutResult) {
      const composited = await compositeOnBackground(cutoutResult.dataUrl, hex);
      setDisplayResult(composited);
    }
  };

  const handleDownload = () => {
    if (!displayResult || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const suffix = replacementColor ? 'solid-bg' : 'cutout-transparent';
    const filename = `${baseName}-${suffix}.png`;
    downloadFile(displayResult.blob, filename);
  };

  const handleReset = () => {
    setFile(null);
    setOriginalPreview(null);
    setCutoutResult(null);
    setDisplayResult(null);
    setReplacementColor(null);
    setProgressPercent(0);
    setProgressMessage('');
    setErrorNotice(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">AI Background Remover</h1>
                <span className="text-sm font-urdu font-medium text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  بیک گراؤنڈ ریموور
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  1-Sec Turbo Engine
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Instant 1-second cutout or deep neural segmentation. 100% private in-browser memory.
              </p>
            </div>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Upload New
            </button>
            <button
              onClick={handleDownload}
              disabled={!displayResult || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download {replacementColor ? 'Custom PNG' : 'Transparent PNG'}
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
            isDragging ? 'border-purple-500 bg-purple-50/50 scale-[0.99]' : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 shadow-inner">
            <Zap className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop image here to remove background</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Blazing fast 1-second cutout. Works on portraits, products, anime, signatures, and objects.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition shadow-sm">
            <Upload className="w-4 h-4" />
            Select Image
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-6">
            
            {/* Engine Mode Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Processing Speed & Engine:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleModeChange('fast')}
                  className={`p-3 rounded-xl border text-left transition ${
                    engineMode === 'fast'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>⚡ Turbo (1 Sec)</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${engineMode === 'fast' ? 'text-purple-200' : 'text-gray-400'}`}>
                    Instant • Zero wait
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('ai')}
                  className={`p-3 rounded-xl border text-left transition ${
                    engineMode === 'ai'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                    <span>🧠 Deep Neural</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${engineMode === 'ai' ? 'text-purple-200' : 'text-gray-400'}`}>
                    Quantized 8-Bit
                  </div>
                </button>
              </div>
            </div>

            {/* Fast Mode Sensitivity Sliders */}
            {engineMode === 'fast' && (
              <div className="space-y-4 p-3.5 bg-purple-50/50 rounded-xl border border-purple-100">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-purple-600" />
                      Cutout Sensitivity:
                    </span>
                    <span className="text-purple-700 font-bold bg-white px-2 py-0.5 rounded border border-purple-200">
                      {tolerance}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="75"
                    value={tolerance}
                    onChange={(e) => handleToleranceChange(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Keep foreground</span>
                    <span>Aggressive cut</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                    <span>Edge Softness (Feather):</span>
                    <span className="text-purple-700 font-bold bg-white px-2 py-0.5 rounded border border-purple-200">
                      {feather}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={feather}
                    onChange={(e) => handleFeatherChange(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Background Color Swatches */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Choose New Background Color:
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {PRESET_COLORS.map((col) => {
                  const isSelected = replacementColor === col.value;
                  return (
                    <button
                      key={col.name}
                      onClick={() => handleColorChange(col.value)}
                      title={col.name}
                      className={`h-12 rounded-xl border flex items-center justify-center transition-all ${
                        isSelected ? 'border-purple-600 ring-2 ring-purple-600/40 scale-105' : 'border-gray-200 hover:border-gray-300'
                      } ${col.bgClass}`}
                      style={{
                        backgroundImage: col.value === null ? 'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%) 50% / 12px 12px' : undefined
                      }}
                    >
                      {isSelected && (
                        <Check className={`w-4 h-4 ${col.value === '#ffffff' || col.value === null ? 'text-purple-600' : 'text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Picker */}
              <div className="pt-2 flex items-center gap-3">
                <label className="text-xs font-semibold text-gray-600">Custom Color:</label>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {errorNotice && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                {errorNotice}
              </div>
            )}
          </div>

          {/* Preview Viewport */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-sm font-medium text-gray-500">
              <span className="flex items-center gap-1.5">Original Image</span>
              <ArrowRight className="w-4 h-4 text-purple-500" />
              <div className="flex items-center gap-2">
                <span className="text-purple-700 font-semibold">
                  {replacementColor ? 'Composited Studio Preview' : 'Transparent Cutout Preview'}
                </span>
                {cutoutResult && !isProcessing && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Done
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Photo */}
              <div className="rounded-xl border border-gray-200 p-2 bg-gray-50/50 flex flex-col items-center justify-center min-h-[340px]">
                {originalPreview && (
                  <img
                    src={originalPreview}
                    alt="Original"
                    className="max-h-[360px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                  />
                )}
                <span className="text-xs text-gray-400 mt-2">Original</span>
              </div>

              {/* Processed Preview */}
              <div 
                className="rounded-xl border border-purple-200 p-2 flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden transition-colors"
                style={{
                  backgroundImage: replacementColor ? undefined : 'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%) 50% / 16px 16px',
                  backgroundColor: replacementColor || undefined
                }}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center text-center p-6 space-y-4 w-full max-w-xs">
                    <RefreshCw className="w-10 h-10 text-purple-600 animate-spin" />
                    <div className="space-y-2 w-full">
                      <div className="text-xs font-bold text-purple-900">{progressMessage}</div>
                      <div className="w-full bg-purple-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {progressPercent}% • Fast In-Browser Processing
                      </div>
                    </div>
                  </div>
                ) : displayResult ? (
                  <img
                    src={displayResult.dataUrl}
                    alt="Cutout"
                    className="max-h-[360px] w-auto max-w-full object-contain rounded-lg drop-shadow-md"
                  />
                ) : null}

                {!isProcessing && displayResult && (
                  <span className="text-xs font-medium text-gray-600 mt-2 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                    {replacementColor ? `Solid Backing (${replacementColor})` : 'Transparent PNG'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
