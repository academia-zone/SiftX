import React, { useState, useRef, useMemo } from 'react';
import { 
  Subtitles, 
  Upload, 
  Download, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Sparkles, 
  Flame, 
  SplitSquareVertical, 
  Volume2, 
  VolumeX, 
  Check, 
  Copy,
  AlertCircle,
  Clock,
  Palette,
  AlignVerticalJustifyCenter,
  Type,
  BookOpen
} from 'lucide-react';
import { 
  loadVideoMetadata, 
  extractAudioFromVideo,
  generateSrtContent, 
  generateVttContent, 
  downloadFile, 
  computeWordTimings,
  burnSubtitlesToVideo,
  isRtlString,
  type VideoMeta, 
  type SubtitleItem,
  type BurnSubtitleOptions,
  formatTime 
} from '../engines/videoEngine';

const SUPPORTED_LANGUAGES = [
  { code: 'ur-PK', label: 'اردو (Urdu - Pakistan)', flag: '🇵🇰' },
  { code: 'en-US', label: 'English (United States)', flag: '🇺🇸' },
  { code: 'en-GB', label: 'English (United Kingdom)', flag: '🇬🇧' },
  { code: 'hi-IN', label: 'اردو-ہندی / Hindi (India)', flag: '🇮🇳' },
  { code: 'ar-SA', label: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'es-ES', label: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'auto', label: 'Auto Detect Language', flag: '🌐' },
];

type CaptionStyle = 'tiktok' | 'neon' | 'classic' | 'badge' | 'minimal';
type VerticalPosition = 'bottom' | 'middle' | 'top';
type FontOption = 'nastaliq' | 'gulzar' | 'sans';
type DirectionOption = 'auto' | 'rtl' | 'ltr';

interface PresetStyleOption {
  id: CaptionStyle;
  name: string;
  nameUrdu: string;
  tag: string;
  previewBg: string;
  previewText: string;
  previewHighlight: string;
}

const PRESET_STYLES: PresetStyleOption[] = [
  {
    id: 'tiktok',
    name: 'TikTok / Reels Viral',
    nameUrdu: 'ٹک ٹاک وائرل',
    tag: 'Popular',
    previewBg: 'bg-black',
    previewText: 'text-white',
    previewHighlight: 'text-amber-400 font-black',
  },
  {
    id: 'classic',
    name: 'CapCut Classic Box',
    nameUrdu: 'کیپ کٹ باکس',
    tag: 'Clean',
    previewBg: 'bg-slate-900/90',
    previewText: 'text-slate-100',
    previewHighlight: 'text-amber-300 font-bold',
  },
  {
    id: 'neon',
    name: 'Cyber Neon Glow',
    nameUrdu: 'نیون گلو',
    tag: 'Glow',
    previewBg: 'bg-slate-950',
    previewText: 'text-slate-200',
    previewHighlight: 'text-cyan-400 font-black shadow-cyan-500',
  },
  {
    id: 'badge',
    name: 'Solid Pill Badge',
    nameUrdu: 'سالڈ بیج',
    tag: 'Bold',
    previewBg: 'bg-indigo-950',
    previewText: 'text-indigo-200',
    previewHighlight: 'text-emerald-400 font-black',
  },
  {
    id: 'minimal',
    name: 'Minimalist Clean',
    nameUrdu: 'سادہ و جدید',
    tag: 'Subtle',
    previewBg: 'bg-black/60',
    previewText: 'text-white',
    previewHighlight: 'text-sky-300 font-bold',
  },
];

const COLOR_CHIPS = [
  { hex: '#fbbf24', name: 'TikTok Amber' },
  { hex: '#22d3ee', name: 'Cyber Cyan' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#f43f5e', name: 'Hot Rose' },
  { hex: '#a855f7', name: 'Vibrant Violet' },
  { hex: '#ffffff', name: 'Pure White' },
];

export const SubtitleGeneratorTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Subtitles / Scenes
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);

  // Styling & Customization (CapCut Sidebar)
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>('tiktok');
  const [highlightColor, setHighlightColor] = useState<string>('#fbbf24');
  const [verticalPos, setVerticalPos] = useState<VerticalPosition>('bottom');
  const [fontSizePt, setFontSizePt] = useState<number>(30); // 10 pt to 70 pt
  const fontSizeScale = useMemo(() => {
    // Calibrated so 10pt is clean & readable (3.2%), 30pt is standard (5.0%), 60pt is large (7.7%)
    return Number((0.023 + (fontSizePt * 0.0009)).toFixed(4));
  }, [fontSizePt]);
  const [isUppercase, setIsUppercase] = useState<boolean>(false);

  // Typography & Urdu RTL Controls
  const [fontChoice, setFontChoice] = useState<FontOption>('nastaliq');
  const [directionChoice, setDirectionChoice] = useState<DirectionOption>('auto');
  const [maxWordsPerLine, setMaxWordsPerLine] = useState<number>(5);

  // Quality & Export Settings
  const [qualityMode, setQualityMode] = useState<'ultra' | 'high' | 'standard'>('ultra');
  const [exportType, setExportType] = useState<'hard' | 'soft'>('hard');

  // AI Whisper Transcription States
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ur-PK');
  const [isAiTranscribing, setIsAiTranscribing] = useState<boolean>(false);
  const [aiProgressText, setAiProgressText] = useState<string>('');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Burning / Export State
  const [isBurning, setIsBurning] = useState<boolean>(false);
  const [burnProgress, setBurnProgress] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When a video is selected
  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('video/')) {
      setVoiceNotice('برائے مہربانی صرف درست ویڈیو فائل (MP4, WebM, MOV) اپلوڈ کریں۔');
      return;
    }

    setFile(selectedFile);
    setVoiceNotice(null);

    try {
      const vMeta = await loadVideoMetadata(selectedFile);
      setMeta(vMeta);

      // Automatically auto-split video into neat 4-second scenes across its duration (e.g. 44s = 11 scenes)
      autoSplitScenes(vMeta.duration);
    } catch (err: any) {
      console.error('Metadata load error:', err);
      setVoiceNotice('ویڈیو لوڈ کرتے ہوئے خرابی: ' + (err.message || 'نامعلوم مسئلہ'));
    }
  };

  /**
   * Split entire video into synchronized 3.5s - 4s CapCut scenes
   */
  const autoSplitScenes = (duration: number) => {
    const sceneLength = 4.0;
    const totalScenes = Math.max(1, Math.ceil(duration / sceneLength));
    const generated: SubtitleItem[] = [];

    for (let i = 0; i < totalScenes; i++) {
      const start = Math.round(i * sceneLength * 10) / 10;
      const end = Math.min(Math.round(duration * 10) / 10, Math.round((i + 1) * sceneLength * 10) / 10);
      const defaultText = `سین نمبر ${i + 1} کیپشن لائن`;
      
      generated.push({
        id: `scene-${i + 1}-${Date.now()}`,
        start,
        end,
        text: defaultText,
        words: computeWordTimings(defaultText, start, end),
      });
    }

    setSubtitles(generated);
    if (generated.length > 0) {
      setActiveSceneId(generated[0].id);
    }
  };

  /**
   * Real AI Whisper Auto-Transcription
   */
  const handleAiAutoTranscribe = async () => {
    if (!file) return;

    setIsAiTranscribing(true);
    setVoiceNotice(null);
    setAiProgressText('ویڈیو سے آڈیو ٹریک نکالا جا رہا ہے...');

    try {
      const { blob: audioWav } = await extractAudioFromVideo(file, (pct) => {
        setAiProgressText(`آڈیو ایکسٹریکٹ ہو رہی ہے (${pct}%)...`);
      });

      setAiProgressText('Whisper AI آڈیو کا تجزیہ کر کے اردو الفاظ اور ٹائم اسٹیمپس بنا رہا ہے...');

      const langParam = selectedLanguage === 'auto' ? 'auto' : selectedLanguage.split('-')[0];
      const res = await fetch('/api/stt', {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/wav',
          'x-filename': encodeURIComponent(file.name.replace(/\.[^/.]+$/, '') + '.wav'),
          'x-lang': langParam,
        },
        body: audioWav,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'سرور سے ٹرانسکرپشن میں مسئلہ آیا۔');
      }

      const data = await res.json();

      if (Array.isArray(data.segments) && data.segments.length > 0) {
        const aiScenes: SubtitleItem[] = data.segments.map((seg: any, idx: number) => {
          const rawText = (seg.text || '').trim();
          const start = Math.max(0, Math.round(seg.start * 10) / 10);
          const end = Math.max(start + 0.8, Math.round(seg.end * 10) / 10);
          return {
            id: `ai-scene-${idx + 1}-${Date.now()}`,
            start,
            end,
            text: rawText,
            words: computeWordTimings(rawText, start, end),
          };
        });

        setSubtitles(aiScenes);
        if (aiScenes.length > 0) setActiveSceneId(aiScenes[0].id);
        setVoiceNotice(`کامیابی! Whisper AI نے ویڈیو سے ${aiScenes.length} بولے گئے جملے دائیں سے بائیں (RTL) خودکار طریقے سے نکال لیے ہیں۔`);
      } else if (data.transcript && data.transcript.trim()) {
        const words = data.transcript.trim().split(/\s+/);
        const dur = meta?.duration || 30;
        const totalScenes = Math.max(1, Math.ceil(dur / 4));
        const wordsPerScene = Math.max(3, Math.ceil(words.length / totalScenes));

        const aiScenes: SubtitleItem[] = [];
        for (let i = 0; i < totalScenes; i++) {
          const start = Math.round(i * 4 * 10) / 10;
          const end = Math.min(Math.round(dur * 10) / 10, Math.round((i + 1) * 4 * 10) / 10);
          const chunk = words.slice(i * wordsPerScene, (i + 1) * wordsPerScene).join(' ') || `Scene #${i + 1}`;
          aiScenes.push({
            id: `ai-scene-${i + 1}-${Date.now()}`,
            start,
            end,
            text: chunk,
            words: computeWordTimings(chunk, start, end),
          });
        }
        setSubtitles(aiScenes);
        setVoiceNotice(`ٹرانسکرپشن مکمل! ${aiScenes.length} سینز خودکار ٹیکسٹ کے ساتھ ترتیب دیے گئے۔`);
      } else {
        setVoiceNotice('ویڈیو کی آڈیو میں کوئی واضح گفتگو نہیں ملی۔ آپ نیچے موجود باکسز میں خود ٹیکسٹ ایڈ کر سکتے ہیں۔');
      }
    } catch (err: any) {
      console.warn('AI Transcription warning:', err);
      setVoiceNotice('Whisper AI ٹرانسکرپشن میں تاخیر یا مسئلہ: ' + (err.message || '') + '۔ 4 سیکنڈ کے فریمز خودکار طور پر تیار ہیں۔');
    } finally {
      setIsAiTranscribing(false);
      setAiProgressText('');
    }
  };

  // Video Player Controls
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

  const jumpToTime = (sec: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, sec);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    const active = subtitles.find((s) => cur >= s.start && cur <= s.end);
    if (active && active.id !== activeSceneId) {
      setActiveSceneId(active.id);
    }
  };

  // Subtitle Editing
  const updateSceneText = (id: string, newText: string) => {
    setSubtitles((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          text: newText,
          words: computeWordTimings(newText, item.start, item.end),
        };
      })
    );
  };

  const updateSceneTiming = (id: string, field: 'start' | 'end', val: number) => {
    setSubtitles((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: Math.max(0, val) };
        updated.words = computeWordTimings(updated.text, updated.start, updated.end);
        return updated;
      }).sort((a, b) => a.start - b.start)
    );
  };

  const deleteScene = (id: string) => {
    setSubtitles((prev) => prev.filter((s) => s.id !== id));
  };

  const addSceneAtCurrentTime = () => {
    const cur = videoRef.current ? videoRef.current.currentTime : 0;
    const start = Math.round(cur * 10) / 10;
    const end = Math.min(meta ? meta.duration : start + 4, Math.round((start + 4) * 10) / 10);
    const newText = 'نئی اردو کیپشن لائن';

    const newSub: SubtitleItem = {
      id: `scene-manual-${Date.now()}`,
      start,
      end,
      text: newText,
      words: computeWordTimings(newText, start, end),
    };

    setSubtitles((prev) => [...prev, newSub].sort((a, b) => a.start - b.start));
    setActiveSceneId(newSub.id);
  };

  // Fast CapCut Video Export with 100% Original Colors, Full Sound & True MP4
  const handleBurnAndDownload = async () => {
    if (!file || subtitles.length === 0) return;

    setIsBurning(true);
    setBurnProgress(10);
    setVoiceNotice(null);

    const exportOptions: BurnSubtitleOptions & { 
      videoWidth?: number; 
      videoHeight?: number;
      qualityMode?: 'ultra' | 'high' | 'standard';
      exportType?: 'hard' | 'soft';
    } = {
      style: captionStyle,
      position: verticalPos,
      highlightColor,
      fontSizeScale,
      isUppercase,
      fontFamily: fontChoice,
      direction: directionChoice,
      maxWordsPerLine,
      qualityMode,
      exportType,
      videoWidth: meta?.width || 1280,
      videoHeight: meta?.height || 720,
    };

    let progressTimer: any = null;
    try {
      setBurnProgress(15);
      progressTimer = setInterval(() => {
        setBurnProgress((prev) => {
          if (prev >= 92) return 92;
          return prev + Math.floor(Math.random() * 7) + 5;
        });
      }, 500);

      // 1. Primary Engine: High-speed server-side FFmpeg (CapCut-grade MP4 export via FormData)
      const formData = new FormData();
      formData.append('video', file, file.name);
      formData.append('subtitles', JSON.stringify(subtitles));
      formData.append('options', JSON.stringify(exportOptions));

      const res = await fetch('/api/export-video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      setBurnProgress(96);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server FFmpeg export returned error.');
      }

      const blob = await res.blob();
      setBurnProgress(100);

      const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const downloadFilename = `${base}-capcut.mp4`;
      downloadFile(blob, downloadFilename);

      setVoiceNotice(`🎉 زبردست! ویڈیو کیپ کٹ کوالٹی میں بغیر کسی خرابی یا اسٹک کے '${downloadFilename}' ڈاؤنلوڈ ہو چکی ہے۔ (100% اصلی آواز اور کلرز)`);
    } catch (err: any) {
      console.warn('FFmpeg export issue, attempting fallback engine:', err);
      setVoiceNotice('سرور انجن میں تاخیر، لوکل موڈ سے ایکسپورٹ کیا جا رہا ہے...');

      try {
        const result = await burnSubtitlesToVideo(file, subtitles, exportOptions, (pct) => {
          setBurnProgress(pct);
        });

        const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const downloadFilename = `${base}-capcut.${result.format}`;
        downloadFile(result.blob, downloadFilename);

        setVoiceNotice(`🎉 ویڈیو ڈاؤنلوڈ ہو چکی ہے!`);
      } catch (localErr: any) {
        console.error('Local export error:', localErr);
        setVoiceNotice('ایکسپورٹ میں خرابی: ' + (localErr.message || 'نامعلوم غلطی'));
      }
    } finally {
      if (progressTimer) clearInterval(progressTimer);
      setIsBurning(false);
    }
  };

  // Download SRT with UTF-8 BOM
  const handleDownloadSrt = () => {
    if (!file) return;
    const srtString = generateSrtContent(subtitles);
    const blob = new Blob(['\uFEFF' + srtString], { type: 'text/plain;charset=utf-8' });
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadFile(blob, `${base}-subtitles.srt`);
  };

  // Download VTT with UTF-8 BOM
  const handleDownloadVtt = () => {
    if (!file) return;
    const vttString = generateVttContent(subtitles);
    const blob = new Blob(['\uFEFF' + vttString], { type: 'text/vtt;charset=utf-8' });
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadFile(blob, `${base}-subtitles.vtt`);
  };

  const handleCopySrt = () => {
    const srtString = generateSrtContent(subtitles);
    navigator.clipboard.writeText(srtString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFile(null);
    setMeta(null);
    setSubtitles([]);
    setActiveSceneId(null);
  };

  // Active Subtitle for Canvas Overlay
  const currentActiveSub = useMemo(() => {
    return subtitles.find((s) => currentTime >= s.start && currentTime <= s.end);
  }, [subtitles, currentTime]);

  const activeWords = useMemo(() => {
    if (!currentActiveSub) return [];
    if (currentActiveSub.words && currentActiveSub.words.length > 0) {
      return currentActiveSub.words;
    }
    return computeWordTimings(currentActiveSub.text, currentActiveSub.start, currentActiveSub.end);
  }, [currentActiveSub]);

  // Is Current Active Subtitle RTL?
  const isCurrentSubRtl = useMemo(() => {
    if (directionChoice === 'rtl') return true;
    if (directionChoice === 'ltr') return false;
    return currentActiveSub ? isRtlString(currentActiveSub.text) : true;
  }, [directionChoice, currentActiveSub]);

  // Break active words into clean wrapped lines to prevent edge clipping
  const previewLines = useMemo(() => {
    if (activeWords.length === 0) return [];
    const limit = maxWordsPerLine || (isCurrentSubRtl ? 5 : 6);
    const lines: typeof activeWords[] = [];
    for (let i = 0; i < activeWords.length; i += limit) {
      lines.push(activeWords.slice(i, i + limit));
    }
    return lines;
  }, [activeWords, maxWordsPerLine, isCurrentSubRtl]);

  const previewFontFamily = useMemo(() => {
    if (fontChoice === 'nastaliq' || (isCurrentSubRtl && fontChoice !== 'sans')) {
      return '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", serif, system-ui';
    }
    if (fontChoice === 'gulzar') {
      return '"Gulzar", serif, system-ui';
    }
    return 'system-ui, -apple-system, sans-serif';
  }, [fontChoice, isCurrentSubRtl]);

  const isVerticalVideo = useMemo(() => {
    return meta ? meta.height > meta.width : false;
  }, [meta]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top CapCut Suite Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Subtitles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">CapCut Auto Subtitles Studio</h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                نستعلیق و RTL سپورٹ (Right-to-Left)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Word Karaoke
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              اردو نستعلیق دائیں سے بائیں (RTL) خودکار فلو، نوری نستعلیق خط، اور محفوظ آواز و رنگ کے ساتھ۔
            </p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition border border-slate-200 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>نئی ویڈیو</span>
            </button>
            <button
              onClick={handleDownloadSrt}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition border border-slate-200 shadow-2xs cursor-pointer"
              title="Download UTF-8 SubRip .SRT format"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>.SRT</span>
            </button>
            <button
              onClick={handleDownloadVtt}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition border border-slate-200 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>.VTT</span>
            </button>
            <button
              onClick={handleCopySrt}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition border border-slate-200 shadow-2xs cursor-pointer"
              title="Copy SRT to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'کاپی ہو گیا' : 'Copy SRT'}</span>
            </button>
            <button
              onClick={handleBurnAndDownload}
              disabled={isBurning || subtitles.length === 0}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-indigo-600/20 transition text-xs disabled:opacity-50 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{isBurning ? `ایکسپورٹ ہو رہی ہے (${burnProgress}%)...` : '🎬 ایکسپورٹ ویڈیو (CapCut MP4)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Status Notice Toast */}
      {voiceNotice && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs text-indigo-950 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-semibold leading-relaxed">{voiceNotice}</span>
          </div>
          <button
            onClick={() => setVoiceNotice(null)}
            className="text-slate-400 hover:text-slate-700 font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Dropzone */}
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
            isDragging 
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' 
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
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
          <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 shadow-inner border border-indigo-100">
            <Upload className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">
            ویڈیو یہاں ڈراپ کریں یا منتخب کریں (Drop Video Here)
          </h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto mb-5 leading-relaxed">
            اردو ویڈیو اپلوڈ کریں، Whisper AI خودکار طریقے سے اردو نستعلیق میں دائیں سے بائیں بولے گئے جملے اور وقت کے فریمز بنا دے گا۔
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm">
            <Upload className="w-4 h-4" />
            <span>Select Video File</span>
          </div>
        </div>
      ) : (
        /* Full CapCut Workspace: Video on Top, Interactive Timeline Scenes Below, Styling Sidebar on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Stage (8 Cols): Video Player + CapCut Scenes Timeline */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Top Video Stage with Live Real-time Subtitles Overlay */}
            <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-xl relative group">
              
              {/* HTML5 Native Video Tag */}
              <div className={`relative flex items-center justify-center bg-black ${isVerticalVideo ? 'h-[520px]' : 'aspect-video'}`}>
                <video
                  ref={videoRef}
                  src={meta?.url}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-contain"
                />

                {/* Live Animated Captions Overlay directly on Preview */}
                {currentActiveSub && currentActiveSub.text && currentActiveSub.text.trim() && (
                  <div 
                    className={`absolute left-0 right-0 px-8 pointer-events-none flex justify-center text-center transition-all ${
                      verticalPos === 'top' 
                        ? 'top-8' 
                        : verticalPos === 'middle' 
                        ? 'top-1/2 -translate-y-1/2' 
                        : 'bottom-12'
                    }`}
                  >
                    <div 
                      className={`inline-flex flex-col items-center justify-center gap-y-2 px-5 py-2.5 rounded-2xl transition-all ${
                        isVerticalVideo ? 'max-w-[85%]' : 'max-w-[90%]'
                      } ${
                        captionStyle === 'classic' || captionStyle === 'badge' 
                          ? 'bg-black/80 backdrop-blur-xs border border-white/10 shadow-xl' 
                          : ''
                      }`}
                    >
                      {previewLines.map((line, lineIdx) => (
                        <div
                          key={lineIdx}
                          dir={isCurrentSubRtl ? 'rtl' : 'ltr'}
                          className="flex items-center justify-center flex-wrap gap-x-2.5 gap-y-1"
                        >
                          {line.map((w, idx) => {
                            const isCurrent = currentTime >= w.start && currentTime < w.end;
                            const isPast = currentTime >= w.end;
                            const display = isUppercase ? w.word.toUpperCase() : w.word;

                            return (
                              <span
                                key={idx}
                                style={{
                                  fontFamily: previewFontFamily,
                                  color: isCurrent ? highlightColor : isPast ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                                  textShadow: isCurrent 
                                    ? captionStyle === 'neon' 
                                      ? `0 0 18px ${highlightColor}, 0 0 8px ${highlightColor}` 
                                      : '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.85)'
                                    : '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
                                  fontSize: `${Math.round(11 + fontSizePt * 0.35)}px`,
                                  lineHeight: isCurrentSubRtl ? '2.1' : '1.4',
                                }}
                                className={`font-black tracking-tight transition-all duration-75 inline-block ${
                                  isCurrent ? 'scale-110 -translate-y-0.5' : 'scale-100'
                                }`}
                              >
                                {display}
                              </span>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Player Scrub Bar & Controls */}
              <div className="bg-slate-900/90 backdrop-blur-md p-4 border-t border-slate-800 text-white flex flex-col gap-2">
                
                {/* Seek Bar */}
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max={meta?.duration || 100}
                    step="0.05"
                    value={currentTime}
                    onChange={(e) => jumpToTime(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                      title={isMuted ? 'Unmute preview' : 'Mute preview'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    </button>

                    <span className="font-mono text-slate-300 text-xs">
                      {formatTime(currentTime)} / {formatTime(meta?.duration || 0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span className="hidden sm:inline">
                      {meta?.width}x{meta?.height} px • {meta?.duration ? Math.round(meta.duration) : 0}s
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">
                      {subtitles.length} Scenes
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* CapCut Subtitles Timeline Bar: AI Generator & Scene Splitter */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-black text-sm text-slate-900">
                    CapCut Scenes & Timeline ({subtitles.length} فریمز)
                  </h3>
                </div>

                {/* AI Whisper & Split Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  
                  {/* Speech Language selector */}
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    disabled={isAiTranscribing}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.label}
                      </option>
                    ))}
                  </select>

                  {/* 1-Click AI Whisper Speech-to-Text */}
                  <button
                    onClick={handleAiAutoTranscribe}
                    disabled={isAiTranscribing}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                    title="Extract video audio and transcribe speech using Whisper AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                    <span>{isAiTranscribing ? (aiProgressText || 'AI کام کر رہا ہے...') : '✨ AI کیپشنز بنائیں'}</span>
                  </button>

                  {/* Auto Split 4s Scenes Button */}
                  <button
                    onClick={() => {
                      if (meta?.duration) {
                        autoSplitScenes(meta.duration);
                        setVoiceNotice(`ویڈیو کو 4 سیکنڈ کے ${Math.ceil(meta.duration / 4)} برابر سینز میں تقسیم کر دیا گیا ہے۔`);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                    title="Reset timeline into 4-second scenes across entire video"
                  >
                    <SplitSquareVertical className="w-3.5 h-3.5 text-slate-500" />
                    <span>4s سینز ری سیٹ</span>
                  </button>

                  {/* Add Custom Cue Button */}
                  <button
                    onClick={addSceneAtCurrentTime}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+ سین شامل کریں</span>
                  </button>
                </div>
              </div>

              {/* CapCut Interactive Scenes List (Editable Cards with Jump to Time) */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {subtitles.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs space-y-2">
                    <Clock className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-700">کوئی سین موجود نہیں ہے</p>
                    <p>اوپر دیے گئے بٹن '✨ AI کیپشنز بنائیں' پر کلک کریں تاکہ خودکار سینز بن جائیں۔</p>
                  </div>
                ) : (
                  subtitles.map((scene, idx) => {
                    const isActive = scene.id === activeSceneId;
                    const isRtl = isRtlString(scene.text);

                    return (
                      <div
                        key={scene.id}
                        onClick={() => {
                          setActiveSceneId(scene.id);
                          jumpToTime(scene.start);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-200 shadow-sm'
                            : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                          
                          {/* Scene Badge & Time Range */}
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-lg font-black text-[11px] ${
                              isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              Scene #{idx + 1}
                            </span>

                            <span className="font-mono text-xs font-bold text-slate-600 flex items-center gap-1">
                              <span>{formatTime(scene.start)}</span>
                              <span className="text-slate-400">→</span>
                              <span>{formatTime(scene.end)}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({Math.round((scene.end - scene.start) * 10) / 10}s)
                              </span>
                            </span>

                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold animate-pulse">
                                Active Playing
                              </span>
                            )}
                          </div>

                          {/* Quick Time Fine-tuning & Delete */}
                          <div 
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="text-slate-400">شروع:</span>
                              <input
                                type="number"
                                step="0.1"
                                value={scene.start}
                                onChange={(e) => updateSceneTiming(scene.id, 'start', Number(e.target.value))}
                                className="w-14 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                              />
                            </div>
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="text-slate-400">اختتام:</span>
                              <input
                                type="number"
                                step="0.1"
                                value={scene.end}
                                onChange={(e) => updateSceneTiming(scene.id, 'end', Number(e.target.value))}
                                className="w-14 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                              />
                            </div>

                            <button
                              onClick={() => deleteScene(scene.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete Scene"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Editable Text Area for this scene with RTL & Nastaliq Support */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <textarea
                            rows={2}
                            dir={isRtl ? 'rtl' : 'ltr'}
                            value={scene.text}
                            onChange={(e) => updateSceneText(scene.id, e.target.value)}
                            placeholder="یہاں کیپشن لکھیں..."
                            style={{
                              fontFamily: isRtl ? '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", serif' : 'inherit',
                              lineHeight: isRtl ? '2.1' : '1.5',
                            }}
                            className={`w-full p-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none transition leading-relaxed shadow-2xs resize-none ${
                              isRtl ? 'text-right' : 'text-left'
                            }`}
                          />
                        </div>

                        {/* Word Timing Previews Chips */}
                        {scene.words && scene.words.length > 0 && (
                          <div 
                            dir={isRtl ? 'rtl' : 'ltr'}
                            className="flex items-center gap-1.5 flex-wrap pt-2"
                          >
                            {scene.words.map((w, wIdx) => (
                              <span
                                key={wIdx}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-500 shadow-2xs"
                              >
                                {w.word}
                              </span>
                            ))}
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

          {/* Right Sidebar (4 Cols): CapCut Style & Customization Controls */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* 1. Animation Preset Styles */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-black text-sm text-slate-900">کیپشن اسٹائلز (Styles)</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Presets</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {PRESET_STYLES.map((preset) => {
                  const isSelected = captionStyle === preset.id;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => setCaptionStyle(preset.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-200 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900">{preset.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {preset.tag}
                          </span>
                        </div>
                        <span className="text-[11px] font-urdu text-slate-500 mt-0.5 block">
                          {preset.nameUrdu}
                        </span>
                      </div>

                      {/* Visual Mini Preview Badge */}
                      <div className={`px-3 py-1.5 rounded-xl ${preset.previewBg} border border-white/20 text-center shadow-xs`}>
                        <span className={`text-[11px] ${preset.previewHighlight}`}>
                          {isCurrentSubRtl ? 'لفظ' : 'WORD'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Typography & Urdu Nastaleeq Font Selection */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-black text-sm text-slate-900">فونٹ و خط (Urdu Font)</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  Nastaleeq
                </span>
              </div>

              {/* Font Choice Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFontChoice('nastaliq')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    fontChoice === 'nastaliq'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-xs ring-2 ring-indigo-200'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-black text-sm block" style={{ fontFamily: '"Noto Nastaliq Urdu", serif' }}>
                    نستعلیق
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Classic Urdu</span>
                </button>

                <button
                  onClick={() => setFontChoice('gulzar')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    fontChoice === 'gulzar'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-xs ring-2 ring-indigo-200'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-black text-sm block" style={{ fontFamily: '"Gulzar", serif' }}>
                    گلزار
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Modern Calligraphy</span>
                </button>

                <button
                  onClick={() => setFontChoice('sans')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    fontChoice === 'sans'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-xs ring-2 ring-indigo-200'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-black text-xs block">Modern Sans</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Bold Western</span>
                </button>
              </div>

              {/* Direction Selector: RTL / LTR / Auto */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  لکھائی کی سمت (Direction)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setDirectionChoice('auto')}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      directionChoice === 'auto'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    خودکار (Auto)
                  </button>
                  <button
                    onClick={() => setDirectionChoice('rtl')}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      directionChoice === 'rtl'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    RTL (اردو دائیں)
                  </button>
                  <button
                    onClick={() => setDirectionChoice('ltr')}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      directionChoice === 'ltr'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    LTR (English)
                  </button>
                </div>
              </div>

              {/* Max Words per Line Slider to prevent line overflow */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>زیادہ سے زیادہ الفاظ فی لائن (Wrap Line)</span>
                  <span className="font-mono text-indigo-600">{maxWordsPerLine} Words</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  step="1"
                  value={maxWordsPerLine}
                  onChange={(e) => setMaxWordsPerLine(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <p className="text-[10px] text-slate-400">
                  اس سے پوری لائن کٹے بغیر 2 لائنوں میں محفوظ طریقے سے ایڈجسٹ ہو جاتی ہے۔
                </p>
              </div>

            </div>

            {/* 3. Highlight Word Color */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-black text-sm text-slate-900">ہائی لائٹ رنگ (Word Color)</h3>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {COLOR_CHIPS.map((chip) => {
                  const isChosen = highlightColor.toLowerCase() === chip.hex.toLowerCase();

                  return (
                    <button
                      key={chip.hex}
                      onClick={() => setHighlightColor(chip.hex)}
                      className={`w-9 h-9 rounded-xl border-2 transition-transform cursor-pointer relative shadow-xs flex items-center justify-center ${
                        isChosen ? 'scale-110 border-indigo-600 ring-2 ring-indigo-300' : 'border-slate-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: chip.hex }}
                      title={chip.name}
                    >
                      {isChosen && (
                        <Check className={`w-4 h-4 ${chip.hex === '#ffffff' ? 'text-black' : 'text-slate-900 font-bold'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Position & Typography Scale */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <AlignVerticalJustifyCenter className="w-4 h-4 text-indigo-600" />
                <h3 className="font-black text-sm text-slate-900">پوزیشن اور سائز (Position & Size)</h3>
              </div>

              {/* Vertical Position */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">عمودی پوزیشن (Position)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bottom', 'middle', 'top'] as VerticalPosition[]).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setVerticalPos(pos)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                        verticalPos === pos
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {pos === 'bottom' ? 'نیچے (Bottom)' : pos === 'middle' ? 'درمیان (Center)' : 'اوپر (Top)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Scale */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>فونٹ سائز (Font Size)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFontSizePt(prev => Math.max(10, prev - 1))}
                      className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
                      title="Decrease font size"
                    >
                      -
                    </button>
                    <span className="font-mono text-indigo-600 min-w-[42px] text-center font-bold">
                      {fontSizePt} pt
                    </span>
                    <button
                      type="button"
                      onClick={() => setFontSizePt(prev => Math.min(70, prev + 1))}
                      className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
                      title="Increase font size"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  step="1"
                  value={fontSizePt}
                  onChange={(e) => setFontSizePt(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                {/* Quick Font Size Presets */}
                <div className="flex items-center justify-between gap-1 pt-0.5">
                  {[
                    { label: '10 pt (چھوٹا)', pt: 10 },
                    { label: '18 pt', pt: 18 },
                    { label: '30 pt (نارمل)', pt: 30 },
                    { label: '45 pt (بڑا)', pt: 45 },
                    { label: '60 pt (بولڈ)', pt: 60 }
                  ].map((p) => {
                    const isSelected = fontSizePt === p.pt;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setFontSizePt(p.pt)}
                        className={`text-[10px] py-0.5 px-1.5 rounded transition-colors font-medium ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Uppercase Toggle for English */}
              {!isCurrentSubRtl && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-slate-400" />
                    <span>ALL CAPS (بڑے حروف)</span>
                  </span>
                  <button
                    onClick={() => setIsUppercase(!isUppercase)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      isUppercase ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      isUppercase ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>
              )}

            </div>

            {/* 5. Instant Export Action Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-sm">ایکسپورٹ سیٹنگز (Export Quality)</h3>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                  100% Lossless
                </span>
              </div>

              {/* Mode Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">ایکسپورٹ موڈ (Export Type):</label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setExportType('hard')}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                      exportType === 'hard'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎬 آن اسکرین (CapCut)
                  </button>
                  <button
                    onClick={() => setExportType('soft')}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                      exportType === 'soft'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚡ سافٹ ٹریک (0% Re-encode)
                  </button>
                </div>
              </div>

              {/* Quality Preset */}
              {exportType === 'hard' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">ویڈیو کوالٹی (Video Quality):</label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setQualityMode('ultra')}
                      className={`py-2 px-1 rounded-xl text-center border transition cursor-pointer ${
                        qualityMode === 'ultra'
                          ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-black'
                          : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white text-xs'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">💎 Ultra HD</div>
                      <div className="text-[9px] opacity-80">100% اصل کوالٹی</div>
                    </button>
                    <button
                      onClick={() => setQualityMode('high')}
                      className={`py-2 px-1 rounded-xl text-center border transition cursor-pointer ${
                        qualityMode === 'high'
                          ? 'border-blue-400 bg-blue-400/10 text-blue-300 font-black'
                          : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white text-xs'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">⚡ 1080p Studio</div>
                      <div className="text-[9px] opacity-80">ہائی کوالٹی</div>
                    </button>
                    <button
                      onClick={() => setQualityMode('standard')}
                      className={`py-2 px-1 rounded-xl text-center border transition cursor-pointer ${
                        qualityMode === 'standard'
                          ? 'border-indigo-400 bg-indigo-400/10 text-indigo-300 font-black'
                          : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white text-xs'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">📱 سوشل فاسٹ</div>
                      <div className="text-[9px] opacity-80">لائٹ سائز</div>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-indigo-200/90 leading-relaxed font-normal">
                {exportType === 'hard' 
                  ? '💎 Ultra HD موڈ میں ویڈیو کی اوریجنل ریزولوشن، BT.709 کلرز اور 320k آڈیو کو 100% محفوظ رکھا جاتا ہے بغیر کسی بلر کے۔'
                  : '⚡ سافٹ ٹریک میں ویڈیو کے فریمز کو 0% ری انکوڈ کیا جاتا ہے (Bit-for-Bit Untouched)، ویڈیو بالکل ویسی ہی رہتی ہے۔'}
              </p>

              <button
                onClick={handleBurnAndDownload}
                disabled={isBurning || subtitles.length === 0}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-black" />
                <span>
                  {isBurning 
                    ? `ایکسپورٹ ہو رہی ہے (${burnProgress}%)...` 
                    : exportType === 'hard'
                    ? '🎬 ویڈیو ایکسپورٹ کریں (Ultra HD MP4)'
                    : '⚡ ڈاؤنلوڈ کریں (100% اصل ویڈیو MP4)'
                  }
                </span>
              </button>

              {isBurning && (
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full transition-all duration-150"
                    style={{ width: `${burnProgress}%` }}
                  />
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
