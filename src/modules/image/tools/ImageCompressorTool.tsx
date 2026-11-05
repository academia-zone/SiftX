import React, { useState, useRef } from 'react';
import { 
  Minimize2, 
  Upload, 
  Download, 
  RefreshCw, 
  Sliders, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { compressImage, downloadFile } from '../engines/imageEngine';

export const ImageCompressorTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedResult, setCompressedResult] = useState<{
    blob: Blob;
    dataUrl: string;
    width: number;
    height: number;
  } | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const runCompression = async (
    targetFile: File,
    q: number,
    fmt: 'image/jpeg' | 'image/webp' | 'image/png'
  ) => {
    setIsProcessing(true);
    try {
      const res = await compressImage(targetFile, q, fmt);
      setCompressedResult(res);
    } catch (err) {
      console.error('Compression failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    runCompression(selectedFile, quality, format);
  };

  const handleQualityChange = (newQ: number) => {
    setQuality(newQ);
    if (file) {
      runCompression(file, newQ, format);
    }
  };

  const handleFormatChange = (newFmt: 'image/jpeg' | 'image/webp' | 'image/png') => {
    setFormat(newFmt);
    if (file) {
      runCompression(file, quality, newFmt);
    }
  };

  const handleDownload = () => {
    if (!compressedResult || !file) return;
    const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadFile(compressedResult.blob, `${base}-compressed.${ext}`);
  };

  const handleReset = () => {
    setFile(null);
    setOriginalUrl(null);
    setCompressedResult(null);
    setOriginalSize(0);
  };

  const savedPercent =
    file && compressedResult
      ? Math.max(0, Math.round(((originalSize - compressedResult.blob.size) / originalSize) * 100))
      : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200">
              <Minimize2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Image Compressor</h1>
                <span className="text-sm font-urdu font-medium text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  سائز چھوٹا کریں
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Reduce image file size with real-time target percentage control and zero noticeable visual degradation.
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
              disabled={!compressedResult || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download ({compressedResult ? formatFileSize(compressedResult.blob.size) : 'Ready'})
            </button>
          </div>
        )}
      </div>

      {/* Main Area */}
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
            accept="image/png,image/jpeg,image/webp"
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your image here to compress</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Supports JPG, PNG, and WebP. Adjust quality percentage interactively and preview the exact size savings.
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
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
              <Sliders className="w-5 h-5 text-purple-600" />
              Compression Settings
            </h3>

            {/* Quality Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-700">Target Quality:</span>
                <span className="text-purple-600 font-bold bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                  {quality}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Maximum Compression (Smaller)</span>
                <span>Best Quality</span>
              </div>
            </div>

            {/* Format Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Output Format:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/jpeg', label: 'JPG' },
                  { id: 'image/webp', label: 'WebP (Best)' },
                  { id: 'image/png', label: 'PNG' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => handleFormatChange(fmt.id as any)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      format === fmt.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Size Stats Card */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-purple-700 font-medium uppercase tracking-wider">
                <span>Compression Metric</span>
                <span className="flex items-center gap-1 font-bold text-emerald-600">
                  <TrendingDown className="w-3.5 h-3.5" /> -{savedPercent}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                  <div className="text-xs text-gray-400">Original</div>
                  <div className="text-sm font-bold text-gray-700">{formatFileSize(originalSize)}</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                  <div className="text-xs text-gray-400">Compressed</div>
                  <div className="text-sm font-bold text-purple-700">
                    {compressedResult ? formatFileSize(compressedResult.blob.size) : '...'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-sm font-medium text-gray-500">
              <span>Original ({formatFileSize(originalSize)})</span>
              <ArrowRight className="w-4 h-4 text-purple-500" />
              <span className="text-purple-700 font-semibold">
                Compressed ({compressedResult ? formatFileSize(compressedResult.blob.size) : '...'})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-2 bg-gray-50/50 flex flex-col items-center justify-center min-h-[300px]">
                {originalUrl && (
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="max-h-[360px] w-auto max-w-full object-contain rounded-lg"
                  />
                )}
                <span className="text-xs text-gray-400 mt-2">Original Resolution</span>
              </div>

              <div className="rounded-xl border border-purple-200 p-2 bg-gray-50/50 flex flex-col items-center justify-center min-h-[300px]">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                    <span className="text-xs text-purple-700 font-medium">Compressing...</span>
                  </div>
                ) : compressedResult ? (
                  <img
                    src={compressedResult.dataUrl}
                    alt="Compressed"
                    className="max-h-[360px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                  />
                ) : null}
                <span className="text-xs text-purple-600 font-medium mt-2">
                  Optimized ({compressedResult?.width}x{compressedResult?.height})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
