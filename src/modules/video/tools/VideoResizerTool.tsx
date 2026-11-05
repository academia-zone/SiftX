import React, { useState, useRef } from 'react';
import { 
  Maximize2, 
  Upload, 
  Download, 
  RefreshCw, 
  Smartphone, 
  Video, 
  Camera, 
  Sliders 
} from 'lucide-react';
import { 
  loadVideoMetadata, 
  resizeVideo, 
  downloadFile, 
  type VideoMeta 
} from '../engines/videoEngine';

interface SocialPreset {
  id: string;
  name: string;
  ratio: string;
  w: number;
  h: number;
  icon: React.FC<{ className?: string }>;
}

const SOCIAL_PRESETS: SocialPreset[] = [
  { id: 'tiktok', name: 'TikTok / Reels / Shorts', ratio: '9:16', w: 1080, h: 1920, icon: Smartphone },
  { id: 'youtube', name: 'YouTube Landscape', ratio: '16:9', w: 1920, h: 1080, icon: Video },
  { id: 'insta-sq', name: 'Instagram Square', ratio: '1:1', w: 1080, h: 1080, icon: Camera },
  { id: 'portrait', name: 'Social Portrait', ratio: '4:5', w: 1080, h: 1350, icon: Smartphone },
];

export const VideoResizerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<SocialPreset>(SOCIAL_PRESETS[0]);
  const [fitMode, setFitMode] = useState<'blur-pad' | 'cover' | 'contain'>('blur-pad');
  const [resizedResult, setResizedResult] = useState<{ blob: Blob; dataUrl: string } | null>(null);
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
    } catch (err) {
      console.error('Video resizer init error:', err);
    }
  };

  const runResize = async () => {
    if (!file || !meta) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const res = await resizeVideo(file, selectedPreset.w, selectedPreset.h, fitMode, (pct) => {
        setProgress(pct);
      });
      setResizedResult(res);
    } catch (err) {
      console.error('Resize failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resizedResult || !file) return;
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadFile(resizedResult.blob, `${base}-${selectedPreset.id}.webm`);
  };

  const handleReset = () => {
    setFile(null);
    setMeta(null);
    setResizedResult(null);
    setProgress(0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <Maximize2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Video Resizer & Social Cropper</h1>
                <span className="text-sm font-urdu font-medium text-indigo-700 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-200">
                  سوشل میڈیا ویڈیو سائزنگ
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  TikTok / Reels
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Adapt landscape videos for TikTok (9:16), Shorts, and Instagram with blurred padding or smart centered crop.
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
              disabled={!resizedResult || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Resized Video
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
            <Maximize2 className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your video here to resize</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Fit videos to mobile vertical format without ugly black bars using intelligent blurred padding.
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
              Format & Backdrop
            </h3>

            {/* Social Preset Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Target Platform:
              </label>
              <div className="space-y-1.5">
                {SOCIAL_PRESETS.map((p) => {
                  const Icon = p.icon;
                  const isCurrent = selectedPreset.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPreset(p)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-indigo-600" />
                        <span>{p.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-gray-400">{p.ratio}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fit Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Aspect Ratio Fit Style:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'blur-pad', label: 'Blur Pad', sub: 'Cinematic' },
                  { id: 'cover', label: 'Crop Fill', sub: 'Full Screen' },
                  { id: 'contain', label: 'Black Bars', sub: 'Original' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setFitMode(mode.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      fitMode === mode.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-bold text-xs">{mode.label}</div>
                    <div className={`text-[10px] ${fitMode === mode.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {mode.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={runResize}
              disabled={isProcessing}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Rendering {selectedPreset.ratio} Video ({progress}%)...
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  Render Resized Video
                </>
              )}
            </button>

            {meta && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span className="font-semibold">{meta.width} × {meta.height}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span className="font-bold text-indigo-700">{selectedPreset.w} × {selectedPreset.h}</span>
                </div>
              </div>
            )}
          </div>

          {/* Video Player */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col justify-center space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Resized Video Preview</h3>

            <div className="rounded-2xl border border-gray-200 bg-black overflow-hidden flex items-center justify-center min-h-[420px] relative">
              {resizedResult ? (
                <video
                  src={resizedResult.dataUrl}
                  controls
                  className="max-h-[420px] w-auto max-w-full"
                />
              ) : meta ? (
                <video
                  src={meta.url}
                  controls
                  className="max-h-[420px] w-auto max-w-full"
                />
              ) : null}

              {isProcessing && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-3 p-6 text-center text-white">
                  <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
                  <div className="text-sm font-bold">Scaling to {selectedPreset.name}...</div>
                  <div className="w-64 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
