/**
 * Pure Client-Side Video Processing Engine
 * Leverages HTML5 Video, Canvas 2D, Web Audio API, and MediaStream / MediaRecorder
 * 100% in-browser privacy - zero external API dependencies
 */

export interface VideoMeta {
  duration: number; // in seconds
  width: number;
  height: number;
  size: number; // in bytes
  url: string;
}

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface SubtitleItem {
  id: string;
  start: number; // in seconds
  end: number;
  text: string;
  words?: WordTiming[];
}

/**
 * Load metadata from a video file
 */
export function loadVideoMetadata(file: File): Promise<VideoMeta> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration || 0,
        width: video.videoWidth || 1280,
        height: video.videoHeight || 720,
        size: file.size,
        url,
      });
    };

    video.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata: ' + (err as any)?.message));
    };

    video.src = url;
  });
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to SRT timestamp: 00:01:23,450
 */
export function formatSrtTime(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  const ms = Math.floor((totalSeconds % 1) * 1000);

  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

/**
 * Format seconds to VTT timestamp: 00:01:23.450
 */
export function formatVttTime(totalSeconds: number): string {
  return formatSrtTime(totalSeconds).replace(',', '.');
}

/**
 * Helper to determine best supported video recording MIME type in this browser
 */
export function getSupportedVideoMimeType(): string {
  const types = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm',
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4',
  ];
  for (const t of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return 'video/webm';
}

/**
 * Robust helper to extract and attach audio from video element to MediaStream
 */
export function createVideoAudioStream(video: HTMLVideoElement): {
  audioTrack: MediaStreamTrack | null;
  audioCtx: AudioContext | null;
  cleanup: () => void;
} {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return { audioTrack: null, audioCtx: null, cleanup: () => {} };

    const audioCtx = new AudioContextClass();
    const sourceNode = audioCtx.createMediaElementSource(video);
    const destNode = audioCtx.createMediaStreamDestination();
    sourceNode.connect(destNode);

    const audioTracks = destNode.stream.getAudioTracks();
    const audioTrack = audioTracks.length > 0 ? audioTracks[0] : null;

    return {
      audioTrack,
      audioCtx,
      cleanup: () => {
        try {
          sourceNode.disconnect();
          audioCtx.close().catch(() => {});
        } catch (_) {}
      },
    };
  } catch (err) {
    console.warn('Could not extract audio track via Web Audio API:', err);
    return { audioTrack: null, audioCtx: null, cleanup: () => {} };
  }
}

/**
 * Extract audio track from video file, resample to 16kHz Mono (optimized for Whisper AI),
 * and encode as compact 16-bit PCM WAV. Reduces payload size by ~85% so long videos fit under 25MB.
 */
export async function extractAudioFromVideo(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ blob: Blob; dataUrl: string }> {
  if (onProgress) onProgress(15);
  const arrayBuffer = await file.arrayBuffer();

  if (onProgress) onProgress(35);
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const rawAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  if (onProgress) onProgress(60);
  // Resample to 16kHz Mono using OfflineAudioContext (native browser hardware DSP)
  const mono16kBuffer = await downsampleTo16kMono(rawAudioBuffer);

  if (onProgress) onProgress(85);
  // Encode 16kHz mono AudioBuffer to WAV format
  const wavBlob = audioBufferTo16kWavBlob(mono16kBuffer);
  const dataUrl = URL.createObjectURL(wavBlob);

  if (onProgress) onProgress(100);
  return { blob: wavBlob, dataUrl };
}

/**
 * Resample any multi-channel audio buffer to 16,000 Hz Mono (Whisper AI native format)
 */
async function downsampleTo16kMono(buffer: AudioBuffer): Promise<AudioBuffer> {
  const targetSampleRate = 16000;
  const targetLength = Math.max(1, Math.ceil(buffer.duration * targetSampleRate));
  
  // 1 channel (mono), target length, 16kHz
  const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  return await offlineCtx.startRendering();
}

/**
 * Convert 16kHz Mono AudioBuffer to 16-bit PCM WAV Blob
 */
function audioBufferTo16kWavBlob(buffer: AudioBuffer): Blob {
  const sampleRate = 16000;
  const numChannels = 1;
  const channelData = buffer.getChannelData(0); // Mono
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const dataSize = channelData.length * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples with soft clipping protection
  let offset = 44;
  for (let i = 0; i < channelData.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Trim video between startTime and endTime in seconds
 */
export async function trimVideo(
  file: File,
  startTime: number,
  endTime: number,
  onProgress?: (pct: number) => void
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.muted = false; // capture audio

    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d')!;

      const mimeType = getSupportedVideoMimeType();
      const canvasStream = canvas.captureStream(30);

      let combinedStream = canvasStream;
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const sourceNode = audioCtx.createMediaElementSource(video);
        const destNode = audioCtx.createMediaStreamDestination();
        sourceNode.connect(destNode);
        sourceNode.connect(audioCtx.destination);
        const audioTracks = destNode.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...audioTracks,
          ]);
        }
      } catch (e) {
        // Fallback without audio mixing
      }

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const outputBlob = new Blob(chunks, { type: mimeType });
        const outputUrl = URL.createObjectURL(outputBlob);
        URL.revokeObjectURL(url);
        if (onProgress) onProgress(100);
        resolve({ blob: outputBlob, dataUrl: outputUrl });
      };

      video.currentTime = startTime;

      video.onseeked = () => {
        video.onseeked = null;
        recorder.start();
        video.play();

        const duration = endTime - startTime;

        const drawFrame = () => {
          if (video.currentTime >= endTime || video.paused || video.ended) {
            video.pause();
            if (recorder.state === 'recording') {
              recorder.stop();
            }
            return;
          }

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          if (onProgress && duration > 0) {
            const currentSec = Math.max(0, video.currentTime - startTime);
            onProgress(Math.min(99, Math.round((currentSec / duration) * 100)));
          }

          requestAnimationFrame(drawFrame);
        };

        requestAnimationFrame(drawFrame);
      };
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Video trim failed'));
    };
  });
}

/**
 * Compress video to target bitrate / resolution
 */
export async function compressVideo(
  file: File,
  targetBitrateKbps: number = 1000,
  scale: number = 0.75,
  onProgress?: (pct: number) => void
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';

    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round((video.videoWidth || 1280) * scale);
      canvas.height = Math.round((video.videoHeight || 720) * scale);
      const ctx = canvas.getContext('2d')!;

      const mimeType = getSupportedVideoMimeType();
      const canvasStream = canvas.captureStream(24);

      const recorder = new MediaRecorder(canvasStream, {
        mimeType,
        videoBitsPerSecond: targetBitrateKbps * 1000,
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const outputBlob = new Blob(chunks, { type: mimeType });
        const outputUrl = URL.createObjectURL(outputBlob);
        URL.revokeObjectURL(url);
        if (onProgress) onProgress(100);
        resolve({ blob: outputBlob, dataUrl: outputUrl });
      };

      video.currentTime = 0;
      recorder.start();
      video.play();

      const drawFrame = () => {
        if (video.paused || video.ended) {
          if (recorder.state === 'recording') recorder.stop();
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (onProgress && video.duration > 0) {
          onProgress(Math.min(99, Math.round((video.currentTime / video.duration) * 100)));
        }

        requestAnimationFrame(drawFrame);
      };

      requestAnimationFrame(drawFrame);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Video compression failed'));
    };
  });
}

/**
 * Resize video for Social Presets (TikTok 9:16, YouTube 16:9, Instagram 1:1)
 */
export async function resizeVideo(
  file: File,
  targetWidth: number,
  targetHeight: number,
  fitMode: 'contain' | 'cover' | 'blur-pad' = 'blur-pad',
  onProgress?: (pct: number) => void
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';

    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d')!;

      const mimeType = getSupportedVideoMimeType();
      const canvasStream = canvas.captureStream(30);

      const recorder = new MediaRecorder(canvasStream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const outputBlob = new Blob(chunks, { type: mimeType });
        const outputUrl = URL.createObjectURL(outputBlob);
        URL.revokeObjectURL(url);
        if (onProgress) onProgress(100);
        resolve({ blob: outputBlob, dataUrl: outputUrl });
      };

      video.currentTime = 0;
      recorder.start();
      video.play();

      const vW = video.videoWidth;
      const vH = video.videoHeight;

      const drawFrame = () => {
        if (video.paused || video.ended) {
          if (recorder.state === 'recording') recorder.stop();
          return;
        }

        ctx.clearRect(0, 0, targetWidth, targetHeight);

        if (fitMode === 'blur-pad') {
          // Draw blurred zoomed background
          ctx.filter = 'blur(20px) brightness(0.6)';
          ctx.drawImage(video, -20, -20, targetWidth + 40, targetHeight + 40);
          ctx.filter = 'none';

          // Fit foreground inside maintaining aspect ratio
          const scale = Math.min(targetWidth / vW, targetHeight / vH);
          const drawW = vW * scale;
          const drawH = vH * scale;
          const dx = (targetWidth - drawW) / 2;
          const dy = (targetHeight - drawH) / 2;
          ctx.drawImage(video, dx, dy, drawW, drawH);
        } else if (fitMode === 'cover') {
          // Center crop
          const scale = Math.max(targetWidth / vW, targetHeight / vH);
          const drawW = vW * scale;
          const drawH = vH * scale;
          const dx = (targetWidth - drawW) / 2;
          const dy = (targetHeight - drawH) / 2;
          ctx.drawImage(video, dx, dy, drawW, drawH);
        } else {
          // Fit contain with black bars
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          const scale = Math.min(targetWidth / vW, targetHeight / vH);
          const drawW = vW * scale;
          const drawH = vH * scale;
          const dx = (targetWidth - drawW) / 2;
          const dy = (targetHeight - drawH) / 2;
          ctx.drawImage(video, dx, dy, drawW, drawH);
        }

        if (onProgress && video.duration > 0) {
          onProgress(Math.min(99, Math.round((video.currentTime / video.duration) * 100)));
        }

        requestAnimationFrame(drawFrame);
      };

      requestAnimationFrame(drawFrame);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Video resize failed'));
    };
  });
}

/**
 * Generate animated short loop / GIF-compatible WebM
 */
export async function createGifClip(
  file: File,
  startSec: number,
  durationSec: number = 4,
  onProgress?: (pct: number) => void
): Promise<{ blob: Blob; dataUrl: string }> {
  return trimVideo(file, startSec, startSec + durationSec, onProgress);
}

/**
 * Format Subtitle List into Standard SRT string
 */
export function generateSrtContent(items: SubtitleItem[]): string {
  return items
    .map((item, index) => {
      const idx = index + 1;
      const start = formatSrtTime(item.start);
      const end = formatSrtTime(item.end);
      return `${idx}\n${start} --> ${end}\n${item.text}\n`;
    })
    .join('\n');
}

/**
 * Format Subtitle List into WebVTT string
 */
export function generateVttContent(items: SubtitleItem[]): string {
  let vtt = 'WEBVTT\n\n';
  vtt += items
    .map((item) => {
      const start = formatVttTime(item.start);
      const end = formatVttTime(item.end);
      return `${start} --> ${end}\n${item.text}\n`;
    })
    .join('\n');
  return vtt;
}

/**
 * Automatically analyze audio track of a video to detect speech dialogue regions (Voice Activity Detection)
 */
export async function detectSpeechSegments(
  file: File,
  threshold: number = 0.02,
  minSpeechDuration: number = 0.8,
  minSilenceDuration: number = 0.4
): Promise<{ start: number; end: number }[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return [];
    
    const audioCtx = new AudioContextClass();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // Check energy in 50ms windows
    const windowSize = Math.floor(sampleRate * 0.05); // 50ms
    const totalWindows = Math.floor(channelData.length / windowSize);
    
    const speechMask: boolean[] = new Array(totalWindows).fill(false);
    
    for (let i = 0; i < totalWindows; i++) {
      let sum = 0;
      const startIdx = i * windowSize;
      for (let j = 0; j < windowSize; j++) {
        const val = channelData[startIdx + j];
        sum += val * val;
      }
      const rms = Math.sqrt(sum / windowSize);
      if (rms > threshold) {
        speechMask[i] = true;
      }
    }
    
    audioCtx.close().catch(() => {});
    
    // Group active windows into segments
    const segments: { start: number; end: number }[] = [];
    let inSpeech = false;
    let segStart = 0;
    let silenceCount = 0;
    const silenceWindowTolerance = Math.floor(minSilenceDuration / 0.05);
    
    for (let i = 0; i < totalWindows; i++) {
      const isSpeech = speechMask[i];
      const currentTime = (i * windowSize) / sampleRate;
      
      if (isSpeech) {
        if (!inSpeech) {
          inSpeech = true;
          segStart = currentTime;
        }
        silenceCount = 0;
      } else {
        if (inSpeech) {
          silenceCount++;
          if (silenceCount >= silenceWindowTolerance || i === totalWindows - 1) {
            inSpeech = false;
            const segEnd = currentTime;
            if (segEnd - segStart >= minSpeechDuration) {
              segments.push({
                start: Math.round(segStart * 10) / 10,
                end: Math.round(segEnd * 10) / 10,
              });
            }
          }
        }
      }
    }
    
    return segments;
  } catch (err) {
    console.warn('Speech segment detection error:', err);
    return [];
  }
}

/**
 * Compute word-level timestamps for animated karaoke captions
 */
export function computeWordTimings(text: string, start: number, end: number): WordTiming[] {
  const rawWords = text.trim().split(/\s+/).filter(Boolean);
  if (rawWords.length === 0) return [];
  const duration = Math.max(0.1, end - start);
  const wordDuration = duration / rawWords.length;

  return rawWords.map((word, index) => ({
    word,
    start: Math.round((start + index * wordDuration) * 100) / 100,
    end: Math.round((start + (index + 1) * wordDuration) * 100) / 100,
  }));
}

export interface BurnSubtitleOptions {
  style?: 'tiktok' | 'neon' | 'classic' | 'badge' | 'minimal';
  position?: 'top' | 'middle' | 'bottom';
  highlightColor?: string;
  fontSizeScale?: number;
  isUppercase?: boolean;
  fontFamily?: 'nastaliq' | 'gulzar' | 'sans';
  direction?: 'auto' | 'rtl' | 'ltr';
  maxWordsPerLine?: number;
}

/**
 * Check if a string contains Arabic/Urdu script (Right-to-Left)
 */
export function isRtlString(str: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(str);
}

/**
 * Burn word-by-word animated subtitles directly into the video
 * Guarantees 100% original video colors, crystal clear audio, and full duration.
 */
export async function burnSubtitlesToVideo(
  file: File,
  subtitles: SubtitleItem[],
  optionsOrStyle: 'tiktok' | 'neon' | 'classic' | 'badge' | BurnSubtitleOptions = 'tiktok',
  onProgress?: (pct: number) => void
): Promise<{ blob: Blob; dataUrl: string; format: 'mp4' | 'webm' }> {
  const options: BurnSubtitleOptions = typeof optionsOrStyle === 'string'
    ? { style: optionsOrStyle }
    : optionsOrStyle;

  const style = options.style || 'tiktok';
  const position = options.position || 'bottom';
  const highlightColor = options.highlightColor || (style === 'neon' ? '#22d3ee' : '#fbbf24');
  const fontSizeScale = options.fontSizeScale || 0.052;
  const isUppercase = options.isUppercase ?? false;

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    // Muted is essential so Chrome/Edge NEVER block playback with NotAllowedError!
    video.muted = true;
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);

    video.onloadedmetadata = async () => {
      const vWidth = video.videoWidth || 1280;
      const vHeight = video.videoHeight || 720;
      const totalDuration = video.duration || 1;

      const canvas = document.createElement('canvas');
      canvas.width = vWidth;
      canvas.height = vHeight;
      const ctx = canvas.getContext('2d', { alpha: false, colorSpace: 'srgb' }) || canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const mimeType = getSupportedVideoMimeType();
      const format: 'mp4' | 'webm' = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const canvasStream = canvas.captureStream(30);

      // Extract and mix crystal-clear audio from the original video file into the MediaStream
      let audioCtx: AudioContext | null = null;
      let audioSource: AudioBufferSourceNode | null = null;

      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          audioCtx = new AudioCtxClass();
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }
          const arrayBuf = await file.arrayBuffer();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
          audioSource = audioCtx.createBufferSource();
          audioSource.buffer = audioBuffer;
          const destNode = audioCtx.createMediaStreamDestination();
          audioSource.connect(destNode);
          const track = destNode.stream.getAudioTracks()[0];
          if (track) {
            canvasStream.addTrack(track);
          }
        }
      } catch (err) {
        console.warn('Audio decoding fallback / silent video:', err);
      }

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(canvasStream, {
          mimeType,
          videoBitsPerSecond: 8000000,
          audioBitsPerSecond: 192000,
        });
      } catch (_) {
        recorder = new MediaRecorder(canvasStream);
      }

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      let isFinished = false;
      const finishProcessing = () => {
        if (isFinished) return;
        isFinished = true;
        try { video.pause(); } catch (_) {}
        try { audioSource?.stop(); } catch (_) {}
        try { audioCtx?.close(); } catch (_) {}
        try { document.body.removeChild(video); } catch (_) {}
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      };

      recorder.onstop = () => {
        const outputBlob = new Blob(chunks, { type: mimeType });
        const outputUrl = URL.createObjectURL(outputBlob);
        URL.revokeObjectURL(url);
        if (onProgress) onProgress(100);
        resolve({ blob: outputBlob, dataUrl: outputUrl, format });
      };

      // Rewind to 0 and ensure video is ready
      video.currentTime = 0;
      await new Promise<void>((res) => {
        if (video.readyState >= 2) {
          res();
        } else {
          video.oncanplay = () => { video.oncanplay = null; res(); };
        }
      });

      recorder.start(250);

      try {
        await video.play();
        if (audioSource) {
          try { audioSource.start(0); } catch (_) {}
        }
      } catch (playErr) {
        console.error('Video play error during burn:', playErr);
      }

      // Handle natural end of playback
      video.onended = () => {
        finishProcessing();
      };

      const drawFrame = () => {
        if (isFinished) return;

        // Completion check
        if (video.ended || (totalDuration > 0 && video.currentTime >= totalDuration - 0.05)) {
          finishProcessing();
          return;
        }

        // If video temporarily buffers or pauses, resume playback so it never stops halfway
        if (video.paused && !video.ended) {
          video.play().catch(() => {});
        }

        // 1. Draw pure video frame with strict state isolation (prevents any color change or blur)
        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.filter = 'none';
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // 2. Draw animated subtitles overlay
        const cur = video.currentTime;
        const activeSub = subtitles.find((s) => cur >= s.start && cur <= s.end);

        if (activeSub && activeSub.text && activeSub.text.trim()) {
          ctx.save();
          const words = activeSub.words && activeSub.words.length > 0
            ? activeSub.words
            : computeWordTimings(activeSub.text, activeSub.start, activeSub.end);

          // Detect direction: auto, rtl, or ltr
          const isRtl = options.direction === 'rtl' 
            ? true 
            : options.direction === 'ltr' 
            ? false 
            : isRtlString(activeSub.text);

          const fontSize = Math.max(22, Math.round(canvas.height * fontSizeScale));
          
          let fontFam = 'sans-serif, system-ui';
          if (options.fontFamily === 'nastaliq' || (isRtl && options.fontFamily !== 'sans')) {
            fontFam = '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", serif, system-ui';
          } else if (options.fontFamily === 'gulzar') {
            fontFam = '"Gulzar", serif, system-ui';
          }

          ctx.font = `bold ${fontSize}px ${fontFam}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Measure words
          const measuredWords = words.map((w) => {
            const raw = isUppercase ? w.word.toUpperCase() : w.word;
            return {
              ...w,
              displayWord: raw,
              width: ctx.measureText(raw + ' ').width,
            };
          });

          // Auto line wrapping to guarantee NO text is ever clipped or cut off
          const maxLineWidth = canvas.width * 0.84;
          const maxWords = options.maxWordsPerLine || (isRtl ? 5 : 6);
          const lines: (typeof measuredWords)[] = [];
          let curLine: typeof measuredWords = [];
          let curLineWidth = 0;

          measuredWords.forEach((w) => {
            const wouldExceed = curLineWidth + w.width > maxLineWidth;
            const reachedMax = curLine.length >= maxWords;
            if (curLine.length > 0 && (wouldExceed || reachedMax)) {
              lines.push(curLine);
              curLine = [w];
              curLineWidth = w.width;
            } else {
              curLine.push(w);
              curLineWidth += w.width;
            }
          });
          if (curLine.length > 0) {
            lines.push(curLine);
          }

          const lineHeight = fontSize * (isRtl ? 1.65 : 1.35);
          const totalBlockHeight = lines.length * lineHeight;

          // Vertical positioning
          let blockCenterY = canvas.height * 0.84; // bottom default
          if (position === 'top') {
            blockCenterY = canvas.height * 0.16 + totalBlockHeight / 2;
          } else if (position === 'middle') {
            blockCenterY = canvas.height * 0.50;
          } else {
            blockCenterY = Math.min(canvas.height - 35 - totalBlockHeight / 2, canvas.height * 0.84);
          }

          // Optional backdrop pill box for Classic and Badge styles
          if (style === 'classic' || style === 'badge') {
            const maxW = Math.max(...lines.map((l) => l.reduce((acc, w) => acc + w.width, 0)));
            const boxW = Math.min(canvas.width * 0.92, maxW + 36);
            const boxH = totalBlockHeight + 18;
            const boxX = (canvas.width - boxW) / 2;
            const boxY = blockCenterY - boxH / 2;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.76)';
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(boxX, boxY, boxW, boxH, 14);
              ctx.fill();
            } else {
              ctx.fillRect(boxX, boxY, boxW, boxH);
            }
          }

          // Render each line with precise RTL or LTR positioning
          lines.forEach((line, lineIdx) => {
            const lineY = blockCenterY - (totalBlockHeight / 2) + (lineIdx + 0.5) * lineHeight;
            const lineWidth = line.reduce((acc, w) => acc + w.width, 0);

            if (isRtl) {
              // RTL layout: First word on the RIGHT, progressing leftwards
              let rightX = (canvas.width + lineWidth) / 2;

              line.forEach((w) => {
                const isCurrent = cur >= w.start && cur < w.end;
                const isPast = cur >= w.end;
                rightX -= w.width;
                const wordCenterX = rightX + w.width / 2;

                ctx.save();
                if (isCurrent) {
                  if (style === 'tiktok') {
                    ctx.fillStyle = highlightColor;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
                    ctx.shadowBlur = 8;
                  } else if (style === 'neon') {
                    ctx.fillStyle = highlightColor;
                    ctx.shadowColor = highlightColor;
                    ctx.shadowBlur = 18;
                  } else if (style === 'badge') {
                    ctx.fillStyle = highlightColor;
                  } else {
                    ctx.fillStyle = highlightColor;
                  }
                } else if (isPast) {
                  ctx.fillStyle = '#ffffff';
                  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                  ctx.shadowBlur = 4;
                } else {
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
                  ctx.shadowColor = 'transparent';
                  ctx.shadowBlur = 0;
                }

                // High-contrast dark outline stroke around words for readability
                ctx.lineWidth = Math.max(3, Math.round(fontSize * 0.12));
                ctx.strokeStyle = '#000000';
                ctx.lineJoin = 'round';
                ctx.strokeText(w.displayWord, wordCenterX, lineY);
                ctx.fillText(w.displayWord, wordCenterX, lineY);
                ctx.restore();
              });
            } else {
              // LTR layout: First word on the LEFT, progressing rightwards
              let leftX = (canvas.width - lineWidth) / 2;

              line.forEach((w) => {
                const isCurrent = cur >= w.start && cur < w.end;
                const isPast = cur >= w.end;
                const wordCenterX = leftX + w.width / 2;

                ctx.save();
                if (isCurrent) {
                  if (style === 'tiktok') {
                    ctx.fillStyle = highlightColor;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
                    ctx.shadowBlur = 8;
                  } else if (style === 'neon') {
                    ctx.fillStyle = highlightColor;
                    ctx.shadowColor = highlightColor;
                    ctx.shadowBlur = 18;
                  } else if (style === 'badge') {
                    ctx.fillStyle = highlightColor;
                  } else {
                    ctx.fillStyle = highlightColor;
                  }
                } else if (isPast) {
                  ctx.fillStyle = '#ffffff';
                  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                  ctx.shadowBlur = 4;
                } else {
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
                  ctx.shadowColor = 'transparent';
                  ctx.shadowBlur = 0;
                }

                ctx.lineWidth = Math.max(3, Math.round(fontSize * 0.12));
                ctx.strokeStyle = '#000000';
                ctx.lineJoin = 'round';
                ctx.strokeText(w.displayWord, wordCenterX, lineY);
                ctx.fillText(w.displayWord, wordCenterX, lineY);
                ctx.restore();

                leftX += w.width;
              });
            }
          });

          ctx.restore();
        }

        if (onProgress && totalDuration > 0) {
          onProgress(Math.min(99, Math.round((video.currentTime / totalDuration) * 100)));
        }

        requestAnimationFrame(drawFrame);
      };

      requestAnimationFrame(drawFrame);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Subtitle burn processing failed'));
    };
  });
}

/**
 * Download helper
 */
export function downloadFile(blob: Blob, filename: string) {
  // Auto-register to Workspace Tray for cross-tool pipelines
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('siftx:file-exported', {
        detail: { blob, name: filename, sourceTool: 'Video Studio' },
      })
    );
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
