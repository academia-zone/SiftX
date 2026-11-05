import React, { useState, useRef } from 'react';
import { 
  RefreshCw, 
  Upload, 
  Download, 
  Sliders, 
  Check 
} from 'lucide-react';
import { 
  loadVideoMetadata, 
  compressVideo, 
  downloadFile, 
  type VideoMeta, 
  formatTime 
} from '../engines/videoEngine';

export const VideoConverterTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [targetFormat, setTargetFormat] = useState<'webm' | 'mp4' | 'mkv'>('webm');
  const [resolution, setResolution] = useState<'1080p' | '720p' | '480p'>('720p');
  const [convertedResult, setConvertedResult] = useState<{ blob: Blob; dataUrl: string } | null>(null);
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
      console.error('Video converter init error:', err);
    }
  };

  const runConvert = async () => {
    if (!file || !meta) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const scale = resolution === '1080p' ? 1.0 : resolution === '720p' ? 0.75 : 0.5;
      const bitrate = resolution === '1080p' ? 2500 : resolution === '720p' ? 1500 : 800;

      const res = await compressVideo(file, bitrate, scale, (pct) => {
        setProgress(pct);
      });
      setConvertedResult(res);
    } catch (err) {
      console.error('Convert failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!convertedResult || !file) return;
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadFile(convertedResult.blob, `${base}-converted.${targetFormat}`);
  };

  const handleReset = () => {
    setFile(null);
    setMeta(null);
    setConvertedResult(null);
    setProgress(0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <RefreshCw className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Video Format Converter</h1>
                <span className="text-sm font-urdu font-medium text-indigo-700 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-200">
                  ویڈیو فارمیٹ کنورٹر
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Convert videos between WebM, MP4, and MKV with customizable resolution scaling.
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
              disabled={!convertedResult || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download .{targetFormat.toUpperCase()}
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
            <RefreshCw className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your video here to convert formats</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Supports MP4, WebM, MOV, and MKV. Fast hardware-accelerated conversion.
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
              Target Settings
            </h3>

            {/* Target Container Format */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Target Format:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'webm', label: 'WebM', desc: 'Modern Web' },
                  { id: 'mp4', label: 'MP4', desc: 'Universal' },
                  { id: 'mkv', label: 'MKV', desc: 'High Quality' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setTargetFormat(fmt.id as any)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      targetFormat === fmt.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-bold text-xs">{fmt.label}</div>
                    <div className={`text-[10px] mt-0.5 ${targetFormat === fmt.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {fmt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Resolution Scaling:
              </label>
              <div className="space-y-1.5">
                {[
                  { id: '1080p', label: '1080p Full HD', sub: 'Original / Crisp High-Res' },
                  { id: '720p', label: '720p HD', sub: 'Recommended Balance' },
                  { id: '480p', label: '480p Standard', sub: 'Faster & Smaller Size' },
                ].map((res) => (
                  <button
                    key={res.id}
                    onClick={() => setResolution(res.id as any)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition cursor-pointer ${
                      resolution === res.id
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{res.label}</span>
                    <span className="text-[10px] text-gray-400">{res.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Convert Trigger Button */}
            <button
              onClick={runConvert}
              disabled={isProcessing}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Transcoding ({progress}%)...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Convert Video
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
                  <span>Duration:</span>
                  <span className="font-semibold">{formatTime(meta.duration)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Video Preview */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col justify-center space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Transcoded Video Player</h3>

            <div className="rounded-2xl border border-gray-200 bg-black overflow-hidden flex items-center justify-center min-h-[360px] relative">
              {convertedResult ? (
                <video
                  src={convertedResult.dataUrl}
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
                  <div className="text-sm font-bold">Transcoding to {targetFormat.toUpperCase()}...</div>
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
