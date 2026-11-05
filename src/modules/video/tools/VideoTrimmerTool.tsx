import React, { useState, useRef } from 'react';
import { 
  Scissors, 
  Upload, 
  Download, 
  RefreshCw, 
  Play, 
  Pause,
  Clock
} from 'lucide-react';
import { 
  loadVideoMetadata, 
  trimVideo, 
  downloadFile, 
  type VideoMeta, 
  formatTime 
} from '../engines/videoEngine';

export const VideoTrimmerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trimmedResult, setTrimmedResult] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('video/')) return;
    setFile(selectedFile);
    try {
      const vMeta = await loadVideoMetadata(selectedFile);
      setMeta(vMeta);
      setStartTime(0);
      const initialEnd = Math.min(vMeta.duration, 15);
      setEndTime(initialEnd);
    } catch (err) {
      console.error('Failed to load video meta:', err);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    if (cur >= endTime) {
      videoRef.current.currentTime = startTime;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStartChange = (val: number) => {
    const safeVal = Math.max(0, Math.min(val, endTime - 0.5));
    setStartTime(safeVal);
    if (videoRef.current) {
      videoRef.current.currentTime = safeVal;
    }
  };

  const handleEndChange = (val: number) => {
    if (!meta) return;
    const safeVal = Math.min(meta.duration, Math.max(val, startTime + 0.5));
    setEndTime(safeVal);
    if (videoRef.current) {
      videoRef.current.currentTime = safeVal;
    }
  };

  const runTrim = async () => {
    if (!file || !meta) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const res = await trimVideo(file, startTime, endTime, (pct) => {
        setProgress(pct);
      });
      setTrimmedResult(res);
    } catch (err) {
      console.error('Trim error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!trimmedResult || !file) return;
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadFile(trimmedResult.blob, `${base}-trimmed.webm`);
  };

  const handleReset = () => {
    setFile(null);
    setMeta(null);
    setTrimmedResult(null);
    setProgress(0);
  };

  const clipDuration = Math.max(0, endTime - startTime);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <Scissors className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Video Trimmer & Cutter</h1>
                <span className="text-sm font-urdu font-medium text-indigo-700 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-200">
                  ویڈیو کٹ اور ٹرم کریں
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Visual timeline scrubbing with millisecond precision. Cut unwanted intros and outros.
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
              disabled={!trimmedResult || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Trimmed Clip
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
            <Scissors className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your video here to trim</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Scrub through timeline frames and cut exact video clips right in your browser.
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
              Trim Coordinates
            </h3>

            {/* Time Controls */}
            <div className="space-y-4">
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
                  max={meta ? meta.duration : 100}
                  step="0.1"
                  value={startTime}
                  onChange={(e) => handleStartChange(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                  <span>End Point:</span>
                  <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {formatTime(endTime)} ({endTime.toFixed(1)}s)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={meta ? meta.duration : 100}
                  step="0.1"
                  value={endTime}
                  onChange={(e) => handleEndChange(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Clip Duration Card */}
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-gray-500 font-semibold uppercase">Selected Clip Length</div>
                <div className="text-base font-black text-indigo-700">{formatTime(clipDuration)}</div>
              </div>
              <span className="text-xs font-bold text-gray-500">
                Total: {meta ? formatTime(meta.duration) : '0:00'}
              </span>
            </div>

            {/* Cut Button */}
            <button
              onClick={runTrim}
              disabled={isProcessing}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Rendering Trimmed Segment ({progress}%)...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4" />
                  Export Trimmed Video
                </>
              )}
            </button>
          </div>

          {/* Video Player Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col justify-center space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Interactive Player</span>
              <span className="font-mono">Current: {formatTime(currentTime)}</span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-black overflow-hidden flex items-center justify-center min-h-[360px] relative">
              {trimmedResult ? (
                <video
                  src={trimmedResult.dataUrl}
                  controls
                  className="max-h-[380px] w-auto max-w-full"
                />
              ) : meta ? (
                <video
                  ref={videoRef}
                  src={meta.url}
                  onTimeUpdate={handleTimeUpdate}
                  className="max-h-[380px] w-auto max-w-full"
                />
              ) : null}

              {isProcessing && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-3 p-6 text-center text-white">
                  <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
                  <div className="text-sm font-bold">Cutting Video Clip...</div>
                  <div className="w-64 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {!trimmedResult && meta && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={togglePlay}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-sm transition cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime = startTime;
                  }}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Jump to Start ({formatTime(startTime)})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
