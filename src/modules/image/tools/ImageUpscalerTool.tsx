import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  Download, 
  RefreshCw, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { upscaleImage, downloadFile, loadImageFromFile } from '../engines/imageEngine';

export const ImageUpscalerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origW, setOrigW] = useState<number>(0);
  const [origH, setOrigH] = useState<number>(0);
  const [scale, setScale] = useState<2 | 4>(2);
  const [sharpen, setSharpen] = useState<boolean>(true);
  const [upscaledResult, setUpscaledResult] = useState<{
    blob: Blob;
    dataUrl: string;
    width: number;
    height: number;
  } | null>(null);
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
      setOrigW(w);
      setOrigH(h);
      const url = URL.createObjectURL(selectedFile);
      setOriginalUrl(url);
      runUpscale(selectedFile, scale, sharpen);
    } catch (err) {
      console.error('Failed to load image:', err);
    }
  };

  const runUpscale = async (targetFile: File, sc: 2 | 4, sh: boolean) => {
    setIsProcessing(true);
    try {
      const res = await upscaleImage(targetFile, sc, sh);
      setUpscaledResult(res);
    } catch (err) {
      console.error('Upscale failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScaleChange = (newScale: 2 | 4) => {
    setScale(newScale);
    if (file) {
      runUpscale(file, newScale, sharpen);
    }
  };

  const handleSharpenToggle = (val: boolean) => {
    setSharpen(val);
    if (file) {
      runUpscale(file, scale, val);
    }
  };

  const handleDownload = () => {
    if (!upscaledResult || !file) return;
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadFile(upscaledResult.blob, `${base}-${scale}x-upscaled.png`);
  };

  const handleReset = () => {
    setFile(null);
    setOriginalUrl(null);
    setUpscaledResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Image Upscaler & Enhancer</h1>
                <span className="text-sm font-urdu font-medium text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  تصویر کا ریزولیوشن بڑھائیں
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Super-sample and boost clarity with 2x and 4x bicubic edge sharpening convolution.
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
              disabled={!upscaledResult || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download ({upscaledResult?.width}x{upscaledResult?.height})
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
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 shadow-inner">
            <Sparkles className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop image here to upscale</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Transform blurry or small photos into crisp high-resolution 2x/4x artwork.
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
            <h3 className="font-bold text-gray-900 text-base">Upscale Multiplier</h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { factor: 2 as const, label: '2x HD Boost', sub: `${origW * 2} × ${origH * 2} px` },
                { factor: 4 as const, label: '4x Ultra Boost', sub: `${origW * 4} × ${origH * 4} px` },
              ].map((m) => (
                <button
                  key={m.factor}
                  onClick={() => handleScaleChange(m.factor)}
                  className={`p-4 rounded-xl border text-center transition ${
                    scale === m.factor
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-lg font-black">{m.factor}X</div>
                  <div className="text-xs font-semibold mt-1">{m.label}</div>
                  <div className={`text-[10px] mt-0.5 ${scale === m.factor ? 'text-purple-200' : 'text-gray-400'}`}>
                    {m.sub}
                  </div>
                </button>
              ))}
            </div>

            {/* Sharpen Toggle */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="flex items-center justify-between text-sm font-semibold text-gray-700 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  Edge Sharpening Filter
                </span>
                <input
                  type="checkbox"
                  checked={sharpen}
                  onChange={(e) => handleSharpenToggle(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </label>
              <p className="text-xs text-gray-400">
                Enhances fine lines, micro-contrast, and text boundaries during scaling.
              </p>
            </div>
          </div>

          {/* Comparison Preview */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-sm font-medium text-gray-500">
              <span>Original ({origW} × {origH})</span>
              <ArrowRight className="w-4 h-4 text-purple-500" />
              <span className="text-purple-700 font-semibold">
                Enhanced ({upscaledResult?.width} × {upscaledResult?.height})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-2 bg-gray-50/50 flex flex-col items-center justify-center min-h-[300px]">
                {originalUrl && (
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="max-h-[360px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                  />
                )}
                <span className="text-xs text-gray-400 mt-2">1x Standard</span>
              </div>

              <div className="rounded-xl border border-purple-200 p-2 bg-gray-50/50 flex flex-col items-center justify-center min-h-[300px]">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                    <span className="text-xs text-purple-700 font-medium">Upscaling with high-res kernel...</span>
                  </div>
                ) : upscaledResult ? (
                  <img
                    src={upscaledResult.dataUrl}
                    alt="Upscaled"
                    className="max-h-[360px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                  />
                ) : null}
                <span className="text-xs text-purple-700 font-bold mt-2">
                  {scale}x Super-Resolution
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
