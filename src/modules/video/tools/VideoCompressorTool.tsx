import React, { useState, useRef } from 'react';
import { 
  Minimize2, 
  Upload, 
  Download, 
  RefreshCw, 
  Sliders, 
  Smartphone, 
  Mail, 
  MessageSquare,
  TrendingDown
} from 'lucide-react';
import { 
  loadVideoMetadata, 
  compressVideo, 
  downloadFile, 
  type VideoMeta, 
  formatTime 
} from '../engines/videoEngine';

interface Preset {
  name: string;
  targetMB: number;
  icon: React.FC<{ className?: string }>;
  sub: string;
}

const PRESETS: Preset[] = [
  { name: 'WhatsApp', targetMB: 16, icon: MessageSquare, sub: 'Under 16 MB max limit' },
  { name: 'Email', targetMB: 25, icon: Mail, sub: 'Under 25 MB attachment' },
  { name: 'Discord', targetMB: 8, icon: Smartphone, sub: 'Under 8 MB free limit' },
];

export const VideoCompressorTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [targetPercent, setTargetPercent] = useState<number>(50);
  const [compressedResult, setCompressedResult] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('video/')) return;
    setFile(selectedFile);
    try {
      const vMeta = await loadVideoMetadata(selectedFile);
      setMeta(vMeta);
    } catch (err) {
      console.error('Failed to load video meta:', err);
    }
  };

  const runCompression = async (targetPct: number) => {
    if (!file || !meta) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const origSizeMB = file.size / (1024 * 1024);
      const targetMB = Math.max(1, origSizeMB * (targetPct / 100));
      const targetKbps = Math.max(300, Math.round(((targetMB * 8 * 1024) / Math.max(1, meta.duration))));
      const scale = targetPct < 40 ? 0.6 : targetPct < 70 ? 0.75 : 0.9;

      const res = await compressVideo(file, targetKbps, scale, (pct) => {
        setProgress(pct);
      });
      setCompressedResult(res);
    } catch (err) {
      console.error('Compression failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetClick = (preset: Preset) => {
    if (!file) return;
    const origMB = file.size / (1024 * 1024);
    const calculatedPct = Math.min(90, Math.max(15, Math.round((preset.targetMB / origMB) * 100)));
    setTargetPercent(calculatedPct);
    runCompression(calculatedPct);
  };

  const handleDownload = () => {
    if (!compressedResult || !file) return;
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadFile(compressedResult.blob, `${base}-compressed.webm`);
  };

  const handleReset = () => {
    setFile(null);
    setMeta(null);
    setCompressedResult(null);
    setProgress(0);
  };

  const origMB = file ? (file.size / (1024 * 1024)).toFixed(1) : '0';
  const estimatedMB = file ? Math.max(0.5, ((file.size * (targetPercent / 100)) / (1024 * 1024))).toFixed(1) : '0';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <Minimize2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Video Compressor</h1>
                <span className="text-sm font-urdu font-medium text-indigo-700 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-200">
                  ویڈیو سائز چھوٹا کریں
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Compress MP4, WebM, and MOV videos for WhatsApp (16MB), Email, and social sharing.
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
              disabled={!compressedResult || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download ({compressedResult ? formatFileSize(compressedResult.blob.size) : 'Ready'})
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
            <Upload className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your video here to compress</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Supports MP4, WebM, MOV, and MKV. Pure client-side hardware compression.
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
              <Sliders className="w-4 h-4 text-indigo-600" />
              Target Compression
            </h3>

            {/* Quick Share Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Quick Sharing Presets:
              </label>
              <div className="space-y-2">
                {PRESETS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.name}
                      onClick={() => handlePresetClick(p)}
                      disabled={isProcessing}
                      className="w-full p-2.5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Icon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-800">{p.name} Target</div>
                          <div className="text-[10px] text-gray-400">{p.sub}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        &lt;{p.targetMB} MB
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Percentage Slider */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                <span>Target File Size:</span>
                <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {targetPercent}% ({estimatedMB} MB)
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="85"
                value={targetPercent}
                onChange={(e) => setTargetPercent(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Maximum Savings</span>
                <span>High Quality</span>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={() => runCompression(targetPercent)}
              disabled={isProcessing}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Compressing Video ({progress}%)...
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4" />
                  Apply Compression
                </>
              )}
            </button>

            {/* Video Meta Info */}
            {meta && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-1.5 text-gray-600">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold text-gray-800">{formatTime(meta.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolution:</span>
                  <span className="font-semibold text-gray-800">{meta.width} × {meta.height}</span>
                </div>
                <div className="flex justify-between">
                  <span>Original Size:</span>
                  <span className="font-semibold text-gray-800">{origMB} MB</span>
                </div>
              </div>
            )}
          </div>

          {/* Preview Viewport */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col justify-center space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Video Player & Compressed Preview</h3>

            <div className="rounded-2xl border border-gray-200 bg-black overflow-hidden flex items-center justify-center min-h-[360px] relative">
              {compressedResult ? (
                <video
                  src={compressedResult.dataUrl}
                  controls
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
                  <div className="text-sm font-bold">Compressing Video Frames...</div>
                  <div className="w-64 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">{progress}% complete • In-browser encoding</div>
                </div>
              )}
            </div>

            {compressedResult && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                <span>Compressed successfully: {formatFileSize(compressedResult.blob.size)}</span>
                <span className="font-bold text-emerald-600">
                  Savings: -{Math.round(((file!.size - compressedResult.blob.size) / file!.size) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
