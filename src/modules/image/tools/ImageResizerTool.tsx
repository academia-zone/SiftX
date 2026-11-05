import React, { useState, useRef } from 'react';
import { 
  Maximize2, 
  Upload, 
  Download, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Smartphone,
  Video,
  UserCheck
} from 'lucide-react';
import { resizeImage, downloadFile, loadImageFromFile } from '../engines/imageEngine';

interface Preset {
  label: string;
  width: number;
  height: number;
  icon: React.FC<{ className?: string }>;
}

const PRESETS: Preset[] = [
  { label: 'YouTube Thumbnail (16:9)', width: 1280, height: 720, icon: Video },
  { label: 'Instagram Square (1:1)', width: 1080, height: 1080, icon: Smartphone },
  { label: 'Instagram Story (9:16)', width: 1080, height: 1920, icon: Smartphone },
  { label: 'Facebook Cover', width: 820, height: 312, icon: Video },
  { label: 'Passport Photo (35x45mm)', width: 413, height: 531, icon: UserCheck },
];

export const ImageResizerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [resizedPreview, setResizedPreview] = useState<string | null>(null);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    try {
      const img = await loadImageFromFile(selectedFile);
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setOrigWidth(w);
      setOrigHeight(h);
      setWidth(w);
      setHeight(h);
      const ratio = w / h;
      setAspectRatio(ratio);
      runResize(selectedFile, w, h, format);
    } catch (err) {
      console.error('Failed to load image:', err);
    }
  };

  const runResize = async (
    targetFile: File,
    w: number,
    h: number,
    fmt: 'image/png' | 'image/jpeg' | 'image/webp'
  ) => {
    if (w <= 0 || h <= 0) return;
    setIsProcessing(true);
    try {
      const res = await resizeImage(targetFile, w, h, fmt);
      setResizedPreview(res.dataUrl);
      setResizedBlob(res.blob);
    } catch (err) {
      console.error('Resize error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && aspectRatio > 0) {
      const newH = Math.round(val / aspectRatio);
      setHeight(newH);
      if (file) runResize(file, val, newH, format);
    } else {
      if (file) runResize(file, val, height, format);
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && aspectRatio > 0) {
      const newW = Math.round(val * aspectRatio);
      setWidth(newW);
      if (file) runResize(file, newW, val, format);
    } else {
      if (file) runResize(file, width, val, format);
    }
  };

  const applyPreset = (preset: Preset) => {
    setWidth(preset.width);
    setHeight(preset.height);
    if (file) runResize(file, preset.width, preset.height, format);
  };

  const applyScale = (factor: number) => {
    if (!origWidth || !origHeight) return;
    const newW = Math.round(origWidth * factor);
    const newH = Math.round(origHeight * factor);
    setWidth(newW);
    setHeight(newH);
    if (file) runResize(file, newW, newH, format);
  };

  const handleDownload = () => {
    if (!resizedBlob || !file) return;
    const ext = format === 'image/webp' ? 'webp' : format === 'image/jpeg' ? 'jpg' : 'png';
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadFile(resizedBlob, `${base}-${width}x${height}.${ext}`);
  };

  const handleReset = () => {
    setFile(null);
    setResizedPreview(null);
    setResizedBlob(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200">
              <Maximize2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Image Resizer</h1>
                <span className="text-sm font-urdu font-medium text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  سائز و پیمائش بدلیں
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Resize by exact pixels, percentage scaling, or social media presets with high-fidelity interpolation.
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
              disabled={!resizedBlob || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download ({width}x{height})
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
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
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 shadow-inner">
            <Upload className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your image here to resize</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Supports YouTube, Instagram, Facebook, and passport photo dimensions.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition shadow-sm">
            <Upload className="w-4 h-4" />
            Select Image
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 text-base">Custom Dimensions</h3>

            {/* Width / Height Inputs with Lock */}
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-gray-500">Width (px)</label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 text-center focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <button
                type="button"
                onClick={() => setLockAspect(!lockAspect)}
                title={lockAspect ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'}
                className={`p-2.5 rounded-xl border mt-5 transition-colors ${
                  lockAspect
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}
              >
                {lockAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>

              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-gray-500">Height (px)</label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 text-center focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Quick Percentage Scaling */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500">Scale by %</label>
              <div className="grid grid-cols-4 gap-2">
                {[0.25, 0.5, 0.75, 1.5].map((scale) => (
                  <button
                    key={scale}
                    onClick={() => applyScale(scale)}
                    className="py-1.5 px-2 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 transition"
                  >
                    {scale * 100}%
                  </button>
                ))}
              </div>
            </div>

            {/* Social Media Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500">Social Presets</label>
              <div className="space-y-1.5">
                {PRESETS.map((p) => {
                  const Icon = p.icon;
                  const isCurrent = width === p.width && height === p.height;
                  return (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                        isCurrent
                          ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-purple-600" />
                        {p.label}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {p.width}x{p.height}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Format</label>
              <div className="grid grid-cols-3 gap-2">
                {(['image/png', 'image/jpeg', 'image/webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      setFormat(fmt);
                      if (file) runResize(file, width, height, fmt);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                      format === fmt
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {fmt.split('/')[1].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas Preview Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col items-center justify-center min-h-[440px]">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                <span className="text-xs text-purple-700 font-medium">Resizing image...</span>
              </div>
            ) : resizedPreview ? (
              <div className="space-y-3 w-full flex flex-col items-center">
                <div className="max-h-[380px] w-auto max-w-full overflow-hidden rounded-xl border border-purple-200 bg-stripes p-1 flex items-center justify-center">
                  <img
                    src={resizedPreview}
                    alt="Resized"
                    className="max-h-[360px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <span>Original: <strong>{origWidth}x{origHeight}</strong></span>
                  <span>→</span>
                  <span className="text-purple-700 font-bold">New: {width}x{height} px</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
