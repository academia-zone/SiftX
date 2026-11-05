import React, { useState, useRef } from 'react';
import { 
  Film, 
  Upload, 
  Download, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Plus
} from 'lucide-react';
import { 
  loadVideoMetadata, 
  downloadFile, 
  type VideoMeta, 
  formatTime,
  getSupportedVideoMimeType
} from '../engines/videoEngine';

interface ClipItem {
  id: string;
  file: File;
  meta: VideoMeta;
}

export const VideoMergerTool: React.FC = () => {
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [mergedResult, setMergedResult] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentClipIndex, setCurrentClipIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = async (files: FileList | File[]) => {
    const newItems: ClipItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type.startsWith('video/')) {
        try {
          const meta = await loadVideoMetadata(f);
          newItems.push({
            id: `${Date.now()}-${i}-${Math.random()}`,
            file: f,
            meta,
          });
        } catch (e) {
          console.error('Error loading clip:', e);
        }
      }
    }
    setClips((prev) => [...prev, ...newItems]);
  };

  const moveClip = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= clips.length) return;
    const updated = [...clips];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setClips(updated);
  };

  const removeClip = (id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
  };

  const runMerge = async () => {
    if (clips.length < 2) return;
    setIsProcessing(true);
    setProgress(0);
    setCurrentClipIndex(0);

    try {
      const primaryW = clips[0].meta.width || 1280;
      const primaryH = clips[0].meta.height || 720;

      const canvas = document.createElement('canvas');
      canvas.width = primaryW;
      canvas.height = primaryH;
      const ctx = canvas.getContext('2d')!;

      const mimeType = getSupportedVideoMimeType();
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const totalClips = clips.length;

      const mergePromise = new Promise<{ blob: Blob; dataUrl: string }>((resolve) => {
        recorder.onstop = () => {
          const finalBlob = new Blob(chunks, { type: mimeType });
          const finalUrl = URL.createObjectURL(finalBlob);
          resolve({ blob: finalBlob, dataUrl: finalUrl });
        };
      });

      recorder.start();

      for (let idx = 0; idx < clips.length; idx++) {
        setCurrentClipIndex(idx);
        const clip = clips[idx];

        const video = document.createElement('video');
        video.src = clip.meta.url;
        video.crossOrigin = 'anonymous';
        await new Promise((res) => {
          video.onloadeddata = res;
        });

        await new Promise<void>((resolveClip) => {
          video.currentTime = 0;
          video.play();

          const render = () => {
            if (video.paused || video.ended) {
              resolveClip();
              return;
            }

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, primaryW, primaryH);

            const vW = video.videoWidth || primaryW;
            const vH = video.videoHeight || primaryH;
            const scale = Math.min(primaryW / vW, primaryH / vH);
            const drawW = vW * scale;
            const drawH = vH * scale;
            const dx = (primaryW - drawW) / 2;
            const dy = (primaryH - drawH) / 2;
            ctx.drawImage(video, dx, dy, drawW, drawH);

            const clipProgress = (idx / totalClips) * 100 + (video.currentTime / video.duration) * (100 / totalClips);
            setProgress(Math.min(99, Math.round(clipProgress)));

            requestAnimationFrame(render);
          };

          requestAnimationFrame(render);
        });
      }

      recorder.stop();
      const result = await mergePromise;
      setMergedResult(result);
      setProgress(100);
    } catch (err) {
      console.error('Merge error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedResult) return;
    downloadFile(mergedResult.blob, 'merged-movie.webm');
  };

  const totalDuration = clips.reduce((acc, c) => acc + c.meta.duration, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <Film className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Video Merger</h1>
                <span className="text-sm font-urdu font-medium text-indigo-700 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-200">
                  ویڈیوز جوڑیں
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Combine multiple video clips into one continuous video file with automatic resolution matching.
              </p>
            </div>
          </div>
        </div>

        {clips.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setClips([]); setMergedResult(null); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reset All
            </button>
            <button
              onClick={handleDownload}
              disabled={!mergedResult || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Merged Movie
            </button>
          </div>
        )}
      </div>

      {clips.length === 0 ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) {
              handleFilesSelect(e.dataTransfer.files);
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
            multiple
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFilesSelect(e.target.files);
              }
            }}
          />
          <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-5 shadow-xs">
            <Film className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop multiple videos to join them</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Select 2 or more video clips. You can re-order clips and join them without quality loss.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition shadow-sm">
            <Upload className="w-4 h-4" />
            Select Videos
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clips List & Reordering */}
          <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Clips Queue ({clips.length})</h3>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFilesSelect(e.target.files);
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Clip
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {clips.map((clip, index) => (
                <div
                  key={clip.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {index + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-gray-800 truncate">{clip.file.name}</div>
                      <div className="text-[10px] text-gray-400">
                        {formatTime(clip.meta.duration)} • {clip.meta.width}x{clip.meta.height}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveClip(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveClip(index, 'down')}
                      disabled={index === clips.length - 1}
                      className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeClip(clip.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs flex justify-between font-medium">
              <span>Total Movie Length:</span>
              <span className="font-bold text-indigo-700">{formatTime(totalDuration)}</span>
            </div>

            <button
              onClick={runMerge}
              disabled={isProcessing || clips.length < 2}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Merging Clip {currentClipIndex + 1}/{clips.length} ({progress}%)...
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  Merge All Videos Now
                </>
              )}
            </button>
          </div>

          {/* Preview Viewport */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col justify-center space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">
              {mergedResult ? 'Final Merged Video Preview' : 'Current Clip Preview'}
            </h3>

            <div className="rounded-2xl border border-gray-200 bg-black overflow-hidden flex items-center justify-center min-h-[360px] relative">
              {mergedResult ? (
                <video
                  src={mergedResult.dataUrl}
                  controls
                  className="max-h-[380px] w-auto max-w-full"
                />
              ) : clips.length > 0 ? (
                <video
                  src={clips[0].meta.url}
                  controls
                  className="max-h-[380px] w-auto max-w-full"
                />
              ) : null}

              {isProcessing && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-3 p-6 text-center text-white">
                  <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
                  <div className="text-sm font-bold">Joining Video Streams...</div>
                  <div className="w-64 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">Processing clip {currentClipIndex + 1} of {clips.length}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
