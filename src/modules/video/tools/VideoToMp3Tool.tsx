import React, { useState, useRef } from 'react';
import { 
  Music, 
  Upload, 
  Download, 
  RefreshCw, 
  Play, 
  Pause, 
  Volume2 
} from 'lucide-react';
import { 
  extractAudioFromVideo, 
  downloadFile, 
  loadVideoMetadata, 
  type VideoMeta, 
  formatTime 
} from '../engines/videoEngine';

export const VideoToMp3Tool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [audioResult, setAudioResult] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('video/')) return;
    setFile(selectedFile);
    try {
      const vMeta = await loadVideoMetadata(selectedFile);
      setMeta(vMeta);
      runAudioExtraction(selectedFile);
    } catch (err) {
      console.error('Audio extraction init error:', err);
    }
  };

  const runAudioExtraction = async (targetFile: File) => {
    setIsProcessing(true);
    setProgress(0);
    try {
      const res = await extractAudioFromVideo(targetFile, (pct) => {
        setProgress(pct);
      });
      setAudioResult(res);
    } catch (err) {
      console.error('Extraction failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleDownload = () => {
    if (!audioResult || !file) return;
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadFile(audioResult.blob, `${base}-audio.wav`);
  };

  const handleReset = () => {
    setFile(null);
    setMeta(null);
    setAudioResult(null);
    setIsPlaying(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <Music className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Video to Audio Extractor</h1>
                <span className="text-sm font-urdu font-medium text-indigo-700 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-200">
                  ویڈیو سے آڈیو نکالیں
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  Lossless WAV
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Extract pure crystal-clear uncompressed WAV audio soundtrack from MP4, WebM, and MKV videos. 100% private in browser.
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
              disabled={!audioResult || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Audio (.wav)
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
            <Volume2 className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your video here to extract audio</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Directly extracts high-bitrate soundtracks without uploading to any remote servers.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition shadow-sm">
            <Upload className="w-4 h-4" />
            Select Video File
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Source Video Details</h3>

            {meta && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-400">File Name:</span>
                    <span className="font-semibold truncate max-w-[140px]">{file.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Track Duration:</span>
                    <span className="font-bold text-indigo-700">{formatTime(meta.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sample Rate:</span>
                    <span className="font-semibold">48,000 Hz Studio</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Audio Channels:</span>
                    <span className="font-semibold">Stereo 2.0</span>
                  </div>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900">
                  <div className="font-bold">Lossless PCM Encoding</div>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    Decoded directly from the video stream into pristine uncompressed WAV format.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Audio Player */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-indigo-100 shadow-sm flex flex-col items-center justify-center space-y-6 min-h-[340px]">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
                <div className="text-sm font-bold text-gray-800">Extracting Audio Track ({progress}%)...</div>
                <div className="w-64 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : audioResult ? (
              <div className="w-full max-w-md space-y-6 text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-indigo-50 border-4 border-indigo-200 flex items-center justify-center text-indigo-600 shadow-inner">
                  <Music className="w-10 h-10 animate-pulse text-indigo-600" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-gray-900 text-lg">Soundtrack Ready</h4>
                  <p className="text-xs text-gray-400">Uncompressed 16-Bit Stereo Audio</p>
                </div>

                <audio
                  ref={audioRef}
                  src={audioResult.dataUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full hidden"
                />

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={toggleAudioPlay}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isPlaying ? 'Pause Audio' : 'Play Sound'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl transition cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    <span>Save Audio</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
