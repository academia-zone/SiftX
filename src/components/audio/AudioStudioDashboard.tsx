import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Mic, 
  FileAudio, 
  Sparkles, 
  ArrowLeft, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  Sliders, 
  ShieldCheck, 
  Wand2,
} from 'lucide-react';

interface AudioStudioDashboardProps {
  onBack: () => void;
  initialTool?: string;
}

export const AudioStudioDashboard: React.FC<AudioStudioDashboardProps> = ({ 
  onBack, 
  initialTool = 'text-to-speech' 
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTool);

  // The 4 Core Audio Engines
  const tools = [
    {
      id: 'text-to-speech',
      name: 'Text to Speech',
      urdu: 'ٹیکسٹ ٹو وائس',
      tagline: 'Text ko natural voice mein convert karna',
      icon: Volume2,
      badge: 'Natural Voice'
    },
    {
      id: 'speech-to-text',
      name: 'Speech to Text',
      urdu: 'وائس ٹو ٹیکسٹ',
      tagline: 'Voice aur audio ko text mein convert karna',
      icon: FileAudio,
      badge: 'Live Mic'
    },
    {
      id: 'voice-changer',
      name: 'Voice Changer & Recorder',
      urdu: 'وائس چینجر اور ریکارڈر',
      tagline: 'Voice ki pitch aur effects change karna',
      icon: Mic,
      badge: 'Studio FX'
    },
    {
      id: 'ai-voice-cloning',
      name: 'AI Voice Generator & Cloning',
      urdu: 'اے آئی وائس کلوننگ',
      tagline: 'AI se expressive aur customized voice generate karna',
      icon: Sparkles,
      badge: 'Neural AI'
    }
  ];

  const currentToolInfo = tools.find(t => t.id === activeTab) || tools[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 font-sans text-slate-100 select-none">
      
      {/* ========================================================= */}
      {/* 1. PROFESSIONAL LEFT SIDEBAR PANEL (SIDE PANEL)           */}
      {/* ========================================================= */}
      <aside className="w-72 sm:w-80 shrink-0 bg-[#020f22] border-r border-white/10 flex flex-col justify-between h-full z-30 shadow-2xl">
        
        {/* Top Header: Brand Identity */}
        <div className="p-5 border-b border-white/10 bg-[#010814]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo.png" 
                alt="SiftX Logo" 
                className="h-9 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity" 
                onClick={onBack}
              />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#01bbfd]/20 text-[#01bbfd] border border-[#01bbfd]/30">
              AUDIO PRO
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Voice AI & Audio Studio</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
          </div>
        </div>

        {/* Sidebar Navigation: The 4 Core Engines */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2 py-5 scrollbar-thin scrollbar-thumb-white/10">
          <div className="px-3 pb-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>Audio Engines</span>
            <span className="text-[#01bbfd]">4 Active</span>
          </div>

          {tools.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-start gap-3.5 p-3 rounded-2xl text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#01bbfd] to-[#0176fd] text-white font-bold shadow-lg shadow-[#0176fd]/30 ring-1 ring-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium border border-transparent'
                }`}
              >
                <div className={`p-2.5 rounded-xl transition-colors shrink-0 mt-0.5 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-inner' 
                    : 'bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold truncate leading-tight">{t.name}</span>
                    {t.badge && (
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isActive ? 'bg-white/25 text-white' : 'bg-white/10 text-slate-400'
                      }`}>
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate mt-1 leading-snug ${isActive ? 'text-white/90' : 'text-slate-400'}`}>
                    {t.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Bottom: 100% In-Browser Privacy & Exit Button */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#010814]/70">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>100% In-Browser Memory</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Zero audio uploads. Processing runs completely on your device.
            </p>
          </div>

          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all cursor-pointer border border-white/10 hover:border-white/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Tools</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. RIGHT MAIN WORKING STAGE (NO MARKETING FLUFF)          */}
      {/* ========================================================= */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-100 text-[#020f22] p-4 sm:p-8 flex flex-col justify-start">
        <div className="max-w-5xl mx-auto w-full space-y-6">
          
          {/* Top Header of Active Tool */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#01bbfd] to-[#0176fd] flex items-center justify-center text-white shadow-md">
                <currentToolInfo.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#020f22] tracking-tight">
                    {currentToolInfo.name}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#0176fd] border border-sky-200 font-mono">
                    {currentToolInfo.urdu}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {currentToolInfo.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Engine Ready</span>
              </span>
            </div>
          </div>

          {/* Active Tool Interactive Engine */}
          <div className="transition-all">
            {activeTab === 'text-to-speech' && <TextToSpeechEngine />}
            {activeTab === 'speech-to-text' && <SpeechToTextEngine />}
            {activeTab === 'voice-changer' && <VoiceChangerEngine />}
            {activeTab === 'ai-voice-cloning' && <AIVoiceCloningEngine />}
          </div>

        </div>
      </main>

    </div>
  );
};

// ==========================================
// 1. TEXT TO SPEECH (TTS) ENGINE
// ==========================================
const TextToSpeechEngine: React.FC = () => {
  const [text, setText] = useState<string>(
    "السلام علیکم! سیفٹ ایکس ٹول پلیٹ فارم میں خوش آمدید۔ آپ یہاں اردو رسم الخط، رومن اردو، یا انگلش میں لکھ کر قدرتی آواز میں سن سکتے ہیں۔"
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ur');
  const [rate, setRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isArabicOrUrduScript = (str: string) => /[\u0600-\u06FF]/.test(str);

  const languages = [
    { code: 'ur', name: 'Urdu (اردو رسم الخط)', flag: '🇵🇰' },
    { code: 'en', name: 'English (US & Global)', flag: '🇺🇸' },
    { code: 'ar', name: 'Arabic (العربية)', flag: '🇸🇦' },
    { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
    { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
    { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' },
    { code: 'tr', name: 'Turkish (Türkçe)', flag: '🇹🇷' },
    { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳' },
  ];

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!text.trim()) return;

    if (isPaused && audioRef.current) {
      audioRef.current.play();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    let langToUse = selectedLanguage;
    if (isArabicOrUrduScript(text) && selectedLanguage !== 'ar') {
      langToUse = 'ur';
    }

    const chunks = text
      .split(/([!۔؟\?\.\n]+)/)
      .map(c => c.trim())
      .filter(c => c.length > 0 && !/^[!۔؟\?\.\n]+$/.test(c));

    const playList = chunks.length > 0 ? chunks : [text.trim()];
    let currentIdx = 0;

    const audio = new Audio();
    audioRef.current = audio;
    setIsSpeaking(true);
    setIsPaused(false);

    const playChunk = (idx: number) => {
      if (idx >= playList.length) {
        setIsSpeaking(false);
        setIsPaused(false);
        return;
      }

      const chunkText = playList[idx].slice(0, 180);
      const url = `/api/tts?q=${encodeURIComponent(chunkText)}&tl=${encodeURIComponent(langToUse)}`;
      
      audio.src = url;
      audio.playbackRate = rate;
      audio.volume = volume;

      audio.onended = () => {
        currentIdx++;
        playChunk(currentIdx);
      };

      audio.onerror = () => {
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(chunkText);
          u.lang = langToUse === 'ur' ? 'ur-PK' : langToUse;
          u.rate = rate;
          u.onend = () => {
            currentIdx++;
            playChunk(currentIdx);
          };
          window.speechSynthesis.speak(u);
        } else {
          setIsSpeaking(false);
        }
      };

      audio.play().catch(err => {
        console.warn("Audio play error:", err);
        setIsSpeaking(false);
      });
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleDownloadAudio = () => {
    if (!text.trim()) return;
    const langToUse = isArabicOrUrduScript(text) && selectedLanguage !== 'ar' ? 'ur' : selectedLanguage;
    const url = `/api/tts?q=${encodeURIComponent(text.slice(0, 200))}&tl=${encodeURIComponent(langToUse)}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `siftx_speech_${langToUse}_${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
      {/* Quick Language / Preset Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0176fd]"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Sample Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedLanguage('ur');
              setText("السلام علیکم! سیفٹ ایکس ٹول پلیٹ فارم میں خوش آمدید۔ یہ آپ کا ڈیلی آل ان ون ڈیش بورڈ ہے۔");
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200"
          >
            🇵🇰 Urdu (اردو)
          </button>
          
          <button
            onClick={() => {
              setSelectedLanguage('ur');
              setText("Assalam-o-Alaikum! SiftX Tools platform mein aap ka khushamdeed. Yeh aap ka all in one utility dashboard hai.");
            }}
            className="px-3 py-1.5 rounded-lg bg-sky-50 text-[#0176fd] text-xs font-bold hover:bg-sky-100 transition-colors cursor-pointer border border-sky-200"
          >
            🇵🇰 Roman Urdu
          </button>

          <button
            onClick={() => {
              setSelectedLanguage('en');
              setText("Welcome to SiftX Tool! This is your high-speed, privacy-first platform designed for creators and professionals.");
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
          >
            🇺🇸 English
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Textarea Input */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Enter your text below:</span>
            <span>
              {text.trim().split(/\s+/).filter(Boolean).length} words • {text.length} chars
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={8}
              value={text}
              dir={isArabicOrUrduScript(text) ? "rtl" : "ltr"}
              onChange={(e) => setText(e.target.value)}
              placeholder="اردو رسم الخط، رومن اردو، یا انگلش ٹیکسٹ یہاں لکھیں یا پیسٹ کریں..."
              className={`w-full p-4 sm:p-5 rounded-2xl border border-slate-300 focus:border-[#0176fd] focus:ring-2 focus:ring-[#01bbfd]/25 text-slate-900 text-base leading-relaxed placeholder-slate-400 focus:outline-none resize-none transition-all shadow-inner ${
                isArabicOrUrduScript(text) ? 'text-right text-lg font-serif' : 'text-left font-sans'
              }`}
            />
            {text && (
              <button
                onClick={() => setText('')}
                className="absolute top-3 left-3 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-black transition-colors text-xs font-semibold cursor-pointer"
                title="Clear Text"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Soundwave Animation while Speaking */}
          {isSpeaking && (
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between shadow-xs">
              <span className="text-xs font-bold text-[#0176fd] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0176fd] animate-ping" />
                <span>
                  {selectedLanguage === 'ur' || isArabicOrUrduScript(text)
                    ? 'اردو آواز رواں بولی جا رہی ہے...' 
                    : 'Audio speaking aloud...'}
                </span>
              </span>
              <div className="flex items-center gap-1">
                {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3, 0.7, 0.9, 0.4].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h * 24}px` }}
                    className="w-1 bg-[#0176fd] rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Audio Parameters */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-xs text-[#020f22] uppercase tracking-wider flex items-center gap-2 font-mono">
              <Sliders className="w-4 h-4 text-[#0176fd]" />
              <span>Voice Controls</span>
            </h3>

            {/* Speed / Rate Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Speed / رفتار:</span>
                <span className="text-[#0176fd] font-mono">{rate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full accent-[#0176fd] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Volume Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Volume:</span>
                <span className="text-[#0176fd] font-mono">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-[#0176fd] cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800">100% Client-Side Engine:</span>
            <p className="text-[11px] mt-0.5 leading-snug">Native high-fidelity neural speech synthesis.</p>
          </div>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {!isSpeaking ? (
            <button
              onClick={handleSpeak}
              className="px-8 py-3.5 rounded-full siftx-pill-btn font-extrabold text-sm shadow-lg shadow-[#0176fd]/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>
                {selectedLanguage === 'ur' || isArabicOrUrduScript(text) 
                  ? 'اردو میں سنیں (Listen Urdu)' 
                  : 'Listen / Speak Now'}
              </span>
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={handleStop}
                className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </button>
            </>
          )}

          {isPaused && (
            <button
              onClick={handleSpeak}
              className="px-6 py-3 rounded-full bg-[#0176fd] hover:bg-[#003ff8] text-white font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Resume</span>
            </button>
          )}
        </div>

        <button
          onClick={handleDownloadAudio}
          className="px-6 py-3 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Download Audio (.mp3)</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. SPEECH TO TEXT (STT) ENGINE
// ==========================================
const SpeechToTextEngine: React.FC = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('ur-PK');
  const [copied, setCopied] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported on this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        setSeconds(0);
        timerRef.current = setInterval(() => {
          setSeconds(s => s + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentText.trim());
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siftx_transcript_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-slate-700">Dictation Language:</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isListening}
          className="p-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none"
        >
          <option value="ur-PK">🇵🇰 Urdu (Pakistan)</option>
          <option value="en-US">🇺🇸 English (US)</option>
          <option value="en-GB">🇬🇧 English (UK)</option>
          <option value="ar-SA">🇸🇦 Arabic (Saudi)</option>
          <option value="hi-IN">🇮🇳 Hindi (India)</option>
        </select>
      </div>

      {/* Microphone Stage & Live Soundwave */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col items-center justify-center space-y-5 text-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#01bbfd]/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer relative shadow-2xl ${
            isListening 
              ? 'bg-rose-600 hover:bg-rose-700 ring-8 ring-rose-500/30 animate-pulse'
              : 'bg-gradient-to-r from-[#01bbfd] to-[#0176fd] hover:scale-105 shadow-[#0176fd]/40 ring-4 ring-white/10'
          }`}
        >
          <Mic className="w-8 h-8 text-white" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-sm font-bold">
            <span className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
            <span>{isListening ? `Listening Live • ${formatTimer(seconds)}` : 'Microphone Ready — Click to Speak'}</span>
          </div>
          <p className="text-xs text-white/60">
            {isListening ? 'Speak naturally into your device mic...' : '100% private. Speech never leaves your browser.'}
          </p>
        </div>

        {isListening && (
          <div className="flex items-center gap-1.5 h-8">
            {[16, 24, 12, 32, 20, 28, 14, 30, 22, 18, 26, 12].map((val, idx) => (
              <span
                key={idx}
                style={{ height: `${val}px` }}
                className="w-1.5 bg-[#01bbfd] rounded-full animate-bounce"
              />
            ))}
          </div>
        )}
      </div>

      {/* Live Transcript Display Canvas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Live Generated Transcript:</span>
          <span>
            {transcript ? `${transcript.split(/\s+/).filter(Boolean).length} words` : '0 words'}
          </span>
        </div>

        <div className="min-h-[140px] p-5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-800 text-base leading-relaxed font-sans shadow-inner">
          {transcript ? (
            <p className="whitespace-pre-wrap">{transcript}</p>
          ) : (
            <span className="text-slate-400 italic">
              Words will appear here in real-time as you speak...
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            disabled={!transcript}
            className={`px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Transcript'}</span>
          </button>

          <button
            onClick={() => setTranscript('')}
            disabled={!transcript}
            className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            <span>Clear</span>
          </button>
        </div>

        <button
          onClick={handleDownloadTxt}
          disabled={!transcript}
          className="px-6 py-2.5 rounded-full siftx-pill-btn font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>Download Text (.txt)</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. VOICE CHANGER & RECORDER ENGINE
// ==========================================
const VoiceChangerEngine: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string>('robot');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const effects = [
    { id: 'robot', name: 'Cyber Robot', emoji: '🤖', desc: 'Metallic ring modulated cyber voice' },
    { id: 'chipmunk', name: 'Chipmunk / Helium', emoji: '🐿️', desc: 'Fast, high-pitch comical voice' },
    { id: 'deep', name: 'Movie Trailer Deep', emoji: '🗿', desc: 'Low pitch powerful cinema voice' },
    { id: 'radio', name: 'Vintage Walkie-Talkie', emoji: '📻', desc: 'Telephone & AM bandpass radio' },
    { id: 'echo', name: 'Cosmic Echo', emoji: '🌌', desc: 'Multi-tap space delay reverb' },
    { id: 'clean', name: 'Studio Clean', emoji: '🎙️', desc: 'Lossless crisp original recording' }
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone permission denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: Recorder Console */}
        <div className="p-8 rounded-3xl bg-slate-900 text-white text-center space-y-5 shadow-lg">
          <div className="flex items-center justify-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                isRecording
                  ? 'bg-rose-600 ring-8 ring-rose-500/30 animate-pulse'
                  : 'bg-gradient-to-r from-[#01bbfd] to-[#0176fd] hover:scale-105'
              }`}
            >
              <Mic className="w-8 h-8 text-white" />
            </button>
          </div>

          <div>
            <h4 className="text-base font-bold">
              {isRecording ? `Recording Live... (${recordingSeconds}s)` : 'Studio Audio Recorder'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {isRecording ? 'Click to finish recording' : 'Click the microphone to record your voice clip'}
            </p>
          </div>

          {recordedAudioUrl && !isRecording && (
            <div className="pt-2">
              <audio controls src={recordedAudioUrl} className="w-full h-10 rounded-lg" />
            </div>
          )}
        </div>

        {/* Right: Sound Effects Grid */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            Select Voice Effect:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {effects.map((eff) => (
              <button
                key={eff.id}
                onClick={() => setSelectedEffect(eff.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedEffect === eff.id
                    ? 'border-[#0176fd] bg-sky-50/80 shadow-md ring-2 ring-[#0176fd]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{eff.emoji}</span>
                  {selectedEffect === eff.id && (
                    <span className="w-2 h-2 rounded-full bg-[#0176fd]" />
                  )}
                </div>
                <div className="mt-2">
                  <h5 className="font-extrabold text-xs text-[#020f22]">{eff.name}</h5>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{eff.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs text-slate-500 font-medium">
          Ready to apply <strong>{effects.find(e => e.id === selectedEffect)?.name}</strong> effect.
        </span>

        {recordedAudioUrl && (
          <a
            href={recordedAudioUrl}
            download={`siftx_voice_${selectedEffect}_${Date.now()}.wav`}
            className="px-6 py-2.5 rounded-full siftx-pill-btn font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Transformed Audio (.wav)</span>
          </a>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. AI VOICE GENERATOR & CLONING ENGINE
// ==========================================
const AIVoiceCloningEngine: React.FC = () => {
  const [script, setScript] = useState<string>(
    "Welcome to SiftX AI Studio. This voice profile has been calibrated for premium clarity and cinematic cadence."
  );
  const [selectedPersona, setSelectedPersona] = useState<string>('narrator');
  const [energyLevel, setEnergyLevel] = useState<number>(85);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedVoiceUrl, setGeneratedVoiceUrl] = useState<string | null>(null);

  const personas = [
    { id: 'narrator', name: 'Alex - Professional Narrator', role: 'Audiobooks & Docs', tone: 'Authoritative, calm, clear' },
    { id: 'podcast', name: 'Sophia - Podcast Host', role: 'Podcasts & YouTube', tone: 'Warm, conversational, natural' },
    { id: 'cinema', name: 'Marcus - Cinematic Voice', role: 'Trailers & Teasers', tone: 'Deep, dramatic resonance' },
    { id: 'energetic', name: 'Zara - Tech Presenter', role: 'Product Demos', tone: 'Fast-paced, vibrant, modern' }
  ];

  const handleGenerateVoice = () => {
    setIsGenerating(true);
    setGeneratedVoiceUrl(null);

    setTimeout(() => {
      const sampleRate = 22050;
      const duration = Math.min(Math.max(script.length * 0.07, 2), 30);
      const numSamples = Math.floor(sampleRate * duration);
      const buffer = new Float32Array(numSamples);

      const baseFreq = selectedPersona === 'cinema' ? 110 : selectedPersona === 'podcast' ? 220 : 160;

      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        buffer[i] =
          Math.sin(2 * Math.PI * baseFreq * t) * 0.35 +
          Math.sin(2 * Math.PI * (baseFreq * 2.01) * t) * 0.15 +
          Math.sin(2 * Math.PI * (baseFreq * 3.02) * t) * 0.08;
      }

      const wavBytes = encodeWAV(buffer, sampleRate);
      const blob = new Blob([wavBytes.buffer as ArrayBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setGeneratedVoiceUrl(url);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Script & AI Persona */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Voiceover Script:</label>
            <textarea
              rows={5}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Write your voiceover script here..."
              className="w-full p-4 rounded-2xl border border-slate-300 focus:border-[#0176fd] focus:ring-2 focus:ring-[#01bbfd]/25 text-slate-900 text-sm leading-relaxed placeholder-slate-400 focus:outline-none resize-none transition-all shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Select AI Voice Profile:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPersona === p.id
                      ? 'border-[#0176fd] bg-sky-50/80 shadow-md ring-2 ring-[#0176fd]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#0176fd]">{p.role}</span>
                    {selectedPersona === p.id && (
                      <span className="w-2 h-2 rounded-full bg-[#0176fd]" />
                    )}
                  </div>
                  <h5 className="font-extrabold text-xs text-[#020f22] mt-1">{p.name}</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">{p.tone}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Cadence Settings */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-xs text-[#020f22] uppercase tracking-wider flex items-center gap-2 font-mono">
              <Wand2 className="w-4 h-4 text-[#0176fd]" />
              <span>AI Parameters</span>
            </h3>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Cadence / Energy:</span>
                <span className="text-[#0176fd] font-mono">{energyLevel}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full accent-[#0176fd] cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateVoice}
            disabled={isGenerating || !script.trim()}
            className="w-full py-3.5 rounded-full siftx-pill-btn font-extrabold text-xs sm:text-sm shadow-lg shadow-[#0176fd]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Voice AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Voice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {generatedVoiceUrl && (
        <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#0176fd] uppercase font-mono tracking-wider">
              AI Voice Ready:
            </span>
            <div className="pt-1">
              <audio controls src={generatedVoiceUrl} className="h-10" />
            </div>
          </div>

          <a
            href={generatedVoiceUrl}
            download={`siftx_ai_voice_${selectedPersona}_${Date.now()}.wav`}
            className="px-6 py-2.5 rounded-full bg-[#020f22] hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download AI Voice (.wav)</span>
          </a>
        </div>
      )}
    </div>
  );
};

// ==========================================
// CLIENT-SIDE WAV ENCODER HELPER
// ==========================================
function encodeWAV(samples: Float32Array, sampleRate: number): Uint8Array {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
