import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  RotateCcw,
  Sparkles,
  Sliders,
  Volume2
} from 'lucide-react';
import { AudioPlayer } from '../../shared/AudioPlayer';
import { chunkText, isUrduOrArabicScript } from '../../services/ttsService';
import type { AudioStudioRoute } from '../../types/audioTypes';
import { STRICT_VOICE_REGISTRY, STRICT_VOICE_LIST, type VoiceRegistryItem } from '../../types/voiceRegistry';

interface ExamplePreset {
  id: string;
  category: string;
  title: string;
  recommendedVoiceId: string;
  text: string;
}

const EXAMPLE_PRESETS: ExamplePreset[] = [
  {
    id: 'urdu-welcome',
    category: 'Urdu (PK)',
    title: 'Urdu Greeting',
    recommendedVoiceId: 'uzma',
    text: 'السلام علیکم! سیفٹ ایکس آڈیو اسٹوڈیو میں خوش آمدید۔ آپ یہاں اردو رسم الخط، رومن اردو، یا انگلش میں لکھ کر قدرتی آواز میں سن سکتے ہیں۔',
  },
  {
    id: 'podcast',
    category: 'Podcast',
    title: 'Podcast Intro',
    recommendedVoiceId: 'aoede',
    text: "Welcome to today's episode of The Audio Frontier. In this session, we dive into how multimodal neural models are redefining human-computer interaction.",
  },
  {
    id: 'story',
    category: 'Story',
    title: 'Narration',
    recommendedVoiceId: 'charon',
    text: 'In a quiet observatory perched high atop the snow-covered mountains, the astronomer noticed a signal pulse that defied every standard celestial model.',
  },
  {
    id: 'urdu-dignified',
    category: 'Urdu (PK)',
    title: 'Urdu Formal',
    recommendedVoiceId: 'saad',
    text: 'معزز سامعین، سیفٹ ایکس جدید ترین ڈیجیٹل آڈیو ٹیکنالوجی کے ذریعے آپ کے کام کو تیز اور مؤثر بنانے کے لیے ہمہ وقت تیار ہے۔',
  },
];

type VoiceCategoryFilter = 'all' | 'urdu' | 'gemini' | 'fish';

export const TextToSpeechPage: React.FC<{ onNavigate: (route: AudioStudioRoute) => void }> = ({ onNavigate }) => {
  const [text, setText] = useState<string>(
    'السلام علیکم! سیفٹ ایکس آڈیو اسٹوڈیو میں خوش آمدید۔ آپ یہاں اردو رسم الخط، رومن اردو، یا انگلش میں لکھ کر قدرتی آواز میں سن سکتے ہیں۔'
  );
  const [selectedVoice, setSelectedVoice] = useState<string>('uzma');
  const [rate, setRate] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedVoiceMeta, setGeneratedVoiceMeta] = useState<VoiceRegistryItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<VoiceCategoryFilter>('all');
  const [showSpeedControls, setShowSpeedControls] = useState<boolean>(false);

  // Status & Error
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [activeVoiceName, setActiveVoiceName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const generationAbortControllerRef = useRef<AbortController | null>(null);
  const activeGenerationIdRef = useRef<number>(0);
  const generatedUrlRef = useRef<string | null>(null);

  const isRtl = isUrduOrArabicScript(text);

  // Filter voices based on selected category tab
  const filteredVoices = useMemo(() => {
    if (activeCategory === 'all') return STRICT_VOICE_LIST;
    return STRICT_VOICE_LIST.filter(v => v.category === activeCategory);
  }, [activeCategory]);

  const selectedVoiceMeta = STRICT_VOICE_REGISTRY[selectedVoice] || STRICT_VOICE_LIST[0];

  // Helper to safely clear and revoke old generated blob URLs
  const clearGeneratedAudio = () => {
    if (generatedUrlRef.current) {
      URL.revokeObjectURL(generatedUrlRef.current);
      generatedUrlRef.current = null;
    }
    setGeneratedAudioUrl(null);
    setGeneratedVoiceMeta(null);
  };

  useEffect(() => {
    return () => {
      if (generationAbortControllerRef.current) {
        generationAbortControllerRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = '';
      }
      if (generatedUrlRef.current) {
        URL.revokeObjectURL(generatedUrlRef.current);
      }
    };
  }, []);

  // Voice Selection Handler
  const handleVoiceSelect = (voiceId: string) => {
    if (selectedVoice === voiceId) return;

    if (generationAbortControllerRef.current) {
      generationAbortControllerRef.current.abort();
      generationAbortControllerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsSpeaking(false);
    setIsPaused(false);
    clearGeneratedAudio();
    setErrorMessage(null);
    setSelectedVoice(voiceId);
  };

  // Quick Voice Preview (Sample Playback)
  const handlePreviewVoice = async (voice: VoiceRegistryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setErrorMessage(null);

    if (previewingVoiceId === voice.id) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }
      setPreviewingVoiceId(null);
      return;
    }

    if (previewAudioRef.current) previewAudioRef.current.pause();
    if (audioRef.current) audioRef.current.pause();

    const sampleUrl = `/api/tts?q=${encodeURIComponent(voice.sampleText)}&voice=${encodeURIComponent(voice.id)}`;
    
    try {
      setPreviewingVoiceId(voice.id);
      const res = await fetch(sampleUrl);
      if (res.ok) {
        const prov = res.headers.get('X-Audio-Provider') || voice.provider;
        const rawVName = res.headers.get('X-Voice-Name');
        const vName = rawVName ? decodeURIComponent(rawVName) : voice.name;
        setActiveProvider(prov);
        setActiveVoiceName(vName);

        const blob = await res.blob();
        const bUrl = URL.createObjectURL(blob);
        const previewAudio = new Audio(bUrl);
        previewAudioRef.current = previewAudio;

        previewAudio.onended = () => setPreviewingVoiceId(null);
        previewAudio.onerror = () => setPreviewingVoiceId(null);
        await previewAudio.play();
      } else {
        const errJson = await res.json().catch(() => ({}));
        setErrorMessage(errJson.error || `Could not preview voice '${voice.name}' (HTTP ${res.status}).`);
        setPreviewingVoiceId(null);
      }
    } catch {
      setErrorMessage(`Network error connecting to voice service for '${voice.name}'.`);
      setPreviewingVoiceId(null);
    }
  };

  // Full Text Speech Synthesis
  const handleSpeak = () => {
    if (!text.trim()) return;
    setErrorMessage(null);

    if (isPaused && audioRef.current) {
      audioRef.current.play();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    if (generationAbortControllerRef.current) {
      generationAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    generationAbortControllerRef.current = abortController;

    const generationId = ++activeGenerationIdRef.current;
    const currentVoiceKey = selectedVoice;
    const currentVoiceMeta = STRICT_VOICE_REGISTRY[currentVoiceKey] || STRICT_VOICE_LIST[0];

    clearGeneratedAudio();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
    }

    const chunks = chunkText(text, 220);
    let currentIdx = 0;

    const audio = new Audio();
    audioRef.current = audio;
    setIsSpeaking(true);
    setIsPaused(false);

    const playChunk = async (idx: number) => {
      if (idx >= chunks.length) {
        if (generationId === activeGenerationIdRef.current) {
          setIsSpeaking(false);
          setIsPaused(false);
        }
        return;
      }

      if (generationId !== activeGenerationIdRef.current || abortController.signal.aborted) {
        return;
      }

      const chunk = chunks[idx];
      const url = `/api/tts?q=${encodeURIComponent(chunk)}&voice=${encodeURIComponent(currentVoiceKey)}`;

      try {
        const fetchRes = await fetch(url, { signal: abortController.signal });

        if (generationId !== activeGenerationIdRef.current || abortController.signal.aborted) {
          return;
        }

        if (fetchRes.ok) {
          const providerHdr = fetchRes.headers.get('X-Audio-Provider') || currentVoiceMeta.provider;
          const rawVoiceHdr = fetchRes.headers.get('X-Voice-Name');
          const voiceHdr = rawVoiceHdr ? decodeURIComponent(rawVoiceHdr) : currentVoiceMeta.name;

          setActiveProvider(providerHdr);
          setActiveVoiceName(voiceHdr);
          setErrorMessage(null);

          const blob = await fetchRes.blob();
          
          if (generationId !== activeGenerationIdRef.current || abortController.signal.aborted) {
            return;
          }

          if (generatedUrlRef.current) {
            URL.revokeObjectURL(generatedUrlRef.current);
          }

          const blobUrl = URL.createObjectURL(blob);
          generatedUrlRef.current = blobUrl;
          setGeneratedAudioUrl(blobUrl);
          setGeneratedVoiceMeta(currentVoiceMeta);

          audio.src = blobUrl;
          audio.playbackRate = rate;

          audio.onended = () => {
            if (generationId === activeGenerationIdRef.current) {
              currentIdx++;
              playChunk(currentIdx);
            }
          };

          audio.onerror = () => {
            if (generationId === activeGenerationIdRef.current) {
              setIsSpeaking(false);
              setErrorMessage(`Audio decoder error playing generated speech for '${currentVoiceMeta.name}'.`);
            }
          };

          audio.play().catch((err) => {
            console.warn('Playback error:', err);
            if (generationId === activeGenerationIdRef.current) {
              setIsSpeaking(false);
            }
          });
        } else {
          if (generationId === activeGenerationIdRef.current) {
            setIsSpeaking(false);
            clearGeneratedAudio();
            const errData = await fetchRes.json().catch(() => ({}));
            setErrorMessage(errData.error || `Voice generation failed for '${currentVoiceMeta.name}' (HTTP ${fetchRes.status}).`);
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (generationId === activeGenerationIdRef.current) {
          setIsSpeaking(false);
          clearGeneratedAudio();
          setErrorMessage(`Network error reaching speech engine for '${currentVoiceMeta.name}'.`);
        }
      }
    };

    playChunk(0);
  };

  const handlePause = () => {
    if (audioRef.current && isSpeaking) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const handleStop = () => {
    if (generationAbortControllerRef.current) {
      generationAbortControllerRef.current.abort();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('/audio')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0176fd] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Audio Studio</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0176fd] border border-blue-200/80">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Strict AI Voice Engine • Zero Silent Fallback</span>
          </span>
        </div>
      </div>

      {/* Strict Error Alert Banner (When Provider Fails) */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Voice Generation Halted</p>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={handleSpeak}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-sm transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Main Studio 2-Column Clean Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Text to Speech Workspace Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between min-h-[580px]">
          
          <div className="space-y-5">
            {/* Tabs / Switcher Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  className="text-base sm:text-lg font-extrabold text-slate-900 border-b-2 border-slate-900 pb-1 cursor-default"
                >
                  Text to speech
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/audio/voice-changer')}
                  className="text-base sm:text-lg font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer pb-1"
                >
                  Voice changer
                </button>
              </div>

              {/* Character & Word Count */}
              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                {isRtl && (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Urdu RTL</span>
                  </span>
                )}
                <span>{wordCount} words • {charCount} chars</span>
              </div>
            </div>

            {/* Clean Modern Text Area */}
            <div className="relative">
              <textarea
                rows={9}
                value={text}
                dir={isRtl ? 'rtl' : 'ltr'}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here, then pick a voice to bring it to life..."
                className={`w-full p-4 sm:p-5 rounded-2xl border border-transparent hover:border-slate-200 focus:border-[#0176fd]/40 focus:ring-4 focus:ring-[#0176fd]/10 text-base leading-relaxed placeholder-slate-400 focus:outline-none resize-none transition-all ${
                  isRtl ? 'text-right text-lg font-serif' : 'text-left font-sans'
                } bg-slate-50/70 text-slate-900`}
              />

              {text && (
                <button
                  onClick={() => setText('')}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 transition-colors shadow-sm cursor-pointer"
                  title="Clear text"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom of Left Card: Example Presets */}
          <div className="pt-6 border-t border-slate-100 space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                No text yet? Try these examples
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Click any card to load
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EXAMPLE_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    setText(preset.text);
                    handleVoiceSelect(preset.recommendedVoiceId);
                  }}
                  className="p-3 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#0176fd] transition-colors">
                      {preset.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-500 border border-slate-200/60">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {preset.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Voice Library & Generation Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between min-h-[580px]">
          
          <div className="space-y-4">
            {/* Header with Title and Counter */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Select a voice
              </h2>
              <span className="text-xs font-bold text-slate-400">
                Library ({STRICT_VOICE_LIST.length})
              </span>
            </div>

            {/* Category Filter Pills (All English) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'urdu', label: 'Urdu (PK)' },
                  { id: 'gemini', label: 'Gemini Live' },
                  { id: 'fish', label: 'Fish Audio' },
                ] as const
              ).map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Voices List (Clean Modern Cards with Avatars) */}
            <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
              {filteredVoices.map((v) => {
                const isSelected = selectedVoice === v.id;
                const isPreviewing = previewingVoiceId === v.id;

                return (
                  <div
                    key={v.id}
                    onClick={() => handleVoiceSelect(v.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#0176fd] bg-blue-50/50 shadow-sm ring-2 ring-[#0176fd]/20'
                        : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Left: Avatar + Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${v.avatarColor} text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        {v.avatarInitials}
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-slate-900 truncate">
                            {v.name}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#0176fd] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {v.title}
                        </p>
                      </div>
                    </div>

                    {/* Right: Badge & Quick Preview Button */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.provider === 'edge-tts'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.provider === 'gemini'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-cyan-100 text-cyan-800'
                      }`}>
                        {v.badge}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handlePreviewVoice(v, e)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isPreviewing
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="Quick preview"
                      >
                        {isPreviewing ? (
                          <Square className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Footer (Preview & Speak Controls) */}
          <div className="pt-4 border-t border-slate-100 space-y-3 mt-4">
            
            {/* Speed Tempo Toggle Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <button
                  type="button"
                  onClick={() => setShowSpeedControls(!showSpeedControls)}
                  className="inline-flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>Speed: <span className="text-[#0176fd] font-bold">{rate.toFixed(1)}x</span></span>
                </button>

                <div className="flex items-center gap-1">
                  {[0.8, 1.0, 1.2, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setRate(speed)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        rate === speed
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {showSpeedControls && (
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-bold">0.6x</span>
                  <input
                    type="range"
                    min="0.6"
                    max="1.6"
                    step="0.05"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    aria-label="Fine speed adjustment"
                    className="w-full accent-[#0176fd] cursor-pointer h-1.5"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">1.6x</span>
                </div>
              )}
            </div>

            {/* Speaking / Streaming Indicator */}
            {isSpeaking && (
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#0176fd] flex items-center justify-between animate-pulse">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0176fd] animate-ping" />
                  <span>Streaming with {activeVoiceName || selectedVoiceMeta.name}{activeProvider ? ` (${activeProvider.toUpperCase()})` : ''}...</span>
                </span>
                <button
                  onClick={handleStop}
                  className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 cursor-pointer"
                >
                  Stop
                </button>
              </div>
            )}

            {/* Main Action Buttons (Preview 5s & Speak) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePreviewVoice(selectedVoiceMeta)}
                disabled={isSpeaking}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/90 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Preview 5s</span>
              </button>

              {!isSpeaking ? (
                <button
                  type="button"
                  onClick={handleSpeak}
                  disabled={!text.trim()}
                  className="py-3 px-4 rounded-2xl bg-[#0176fd] hover:bg-[#005cd6] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-40"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Generate</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={isPaused ? handleSpeak : handlePause}
                  className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
              )}
            </div>

            {/* Generated Audio Player */}
            {generatedAudioUrl && generatedVoiceMeta && (
              <div className="pt-2">
                <AudioPlayer
                  src={generatedAudioUrl}
                  title={`${generatedVoiceMeta.name} (${generatedVoiceMeta.badge})`}
                  subtitle={`Provider: ${generatedVoiceMeta.provider.toUpperCase()}`}
                  downloadFilename={`siftx_${generatedVoiceMeta.id}_${Date.now()}.${generatedVoiceMeta.provider === 'gemini' ? 'wav' : 'mp3'}`}
                />
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
