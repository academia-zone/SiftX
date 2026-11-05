import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  UploadCloud, 
  Copy, 
  Download, 
  Trash2, 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  Sparkles,
  Volume2,
  StopCircle,
  Radio
} from 'lucide-react';
import { AudioVisualizer } from '../../shared/AudioVisualizer';
import { AudioUploadZone } from '../../shared/AudioUploadZone';
import { isSpeechRecognitionSupported, createSpeechRecognizer, transcribeAudioFile } from '../../services/sttService';
import type { AudioStudioRoute } from '../../types/audioTypes';

export const SpeechToTextPage: React.FC<{ onNavigate: (route: AudioStudioRoute) => void }> = ({ onNavigate }) => {
  const [inputMode, setInputMode] = useState<'live' | 'upload'>('live');
  const [language, setLanguage] = useState<string>('ur-PK');
  const [transcript, setTranscript] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isTranscribingFile, setIsTranscribingFile] = useState<boolean>(false);
  const [isAiRefining, setIsAiRefining] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const timerRef = useRef<any>(null);
  const baseTranscriptRef = useRef<string>('');
  const reconnectTranscriptRef = useRef<string>('');
  const currentInstanceFinalRef = useRef<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  const isRtl = language === 'ur-PK' || language === 'ar-SA';

  useEffect(() => {
    return () => {
      stopRecordingSession();
    };
  }, []);

  // Real-Time Live Dictation (Word-by-Word Instant Typing)
  const startListening = async () => {
    if (!isSpeechRecognitionSupported()) {
      alert("Live Speech Recognition is not supported on this browser engine. Please use Google Chrome, Microsoft Edge, or use Mode B (Audio Upload) for full Groq Whisper transcription.");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);

      // Initialize MediaRecorder to capture live mic for optional AI Whisper refinement
      recordedChunksRef.current = [];
      try {
        const recorder = new MediaRecorder(mediaStream);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          if (recordedChunksRef.current.length > 0) {
            const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
            setRecordedAudioBlob(blob);
          }
        };
        recorder.start(500);
        mediaRecorderRef.current = recorder;
      } catch (recErr) {
        console.warn('MediaRecorder not available or failed to start:', recErr);
      }

      baseTranscriptRef.current = transcript.trim();
      reconnectTranscriptRef.current = '';
      currentInstanceFinalRef.current = '';
      setInterimText('');
      isListeningRef.current = true;
      setIsListening(true);
      setRecordingSeconds(0);

      const recognizer = createSpeechRecognizer(
        language,
        (sessionFinal, liveInterim) => {
          // Instant Live Typing Feedback with Strict De-duplication:
          // sessionFinal contains the full finalized text for the current recognizer instance
          currentInstanceFinalRef.current = sessionFinal.trim();
          setInterimText(liveInterim.trim());

          const combined = [
            baseTranscriptRef.current,
            reconnectTranscriptRef.current,
            sessionFinal.trim(),
            liveInterim.trim()
          ].filter(Boolean).join(' ');

          setTranscript(combined);
        },
        (err) => {
          console.warn('Speech recognition event:', err?.error);
        },
        () => {
          // Reconnection logic: flush current instance final to reconnect buffer to prevent loss or repetition
          if (isListeningRef.current) {
            if (currentInstanceFinalRef.current) {
              reconnectTranscriptRef.current = [
                reconnectTranscriptRef.current,
                currentInstanceFinalRef.current
              ].filter(Boolean).join(' ');
              currentInstanceFinalRef.current = '';
            }

            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // Ignore already active errors
              }
            }
          }
        }
      );

      if (!recognizer) return;

      recognitionRef.current = recognizer;
      recognizer.start();

      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone permission was denied or no input device found. Please allow microphone access.");
      stopRecordingSession();
    }
  };

  const stopRecordingSession = () => {
    isListeningRef.current = false;
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // already stopped
      }
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
      mediaRecorderRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Flush any pending interim text into final transcript
    const finalConsolidated = [
      baseTranscriptRef.current,
      reconnectTranscriptRef.current,
      currentInstanceFinalRef.current,
      interimText.trim()
    ].filter(Boolean).join(' ').trim();

    if (finalConsolidated) {
      setTranscript(finalConsolidated);
      baseTranscriptRef.current = finalConsolidated;
      reconnectTranscriptRef.current = '';
      currentInstanceFinalRef.current = '';
      setInterimText('');
    }
  };

  // One-Click AI Whisper Refinement
  const handleRefineWithWhisper = async () => {
    if (!recordedAudioBlob) return;
    setIsAiRefining(true);

    try {
      const file = new File([recordedAudioBlob], 'recorded_speech.webm', { type: 'audio/webm' });
      const result = await transcribeAudioFile(file, language.split('-')[0]);
      if (result.transcript) {
        setTranscript(result.transcript);
        baseTranscriptRef.current = result.transcript;
        reconnectTranscriptRef.current = '';
        currentInstanceFinalRef.current = '';
      }
    } catch (err: any) {
      alert(err?.message || "AI Whisper refinement encountered an issue.");
    } finally {
      setIsAiRefining(false);
    }
  };

  const handleTranscribeFile = async (file: File) => {
    setIsTranscribingFile(true);
    setUploadedFile(file);
    try {
      const result = await transcribeAudioFile(file, language.split('-')[0]);
      setTranscript(result.transcript);
      baseTranscriptRef.current = result.transcript;
      reconnectTranscriptRef.current = '';
      currentInstanceFinalRef.current = '';
    } catch (err: any) {
      setTranscript(err?.message || "Error processing audio file. Please verify file integrity.");
    } finally {
      setIsTranscribingFile(false);
    }
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
    const rem = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 text-slate-900">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={() => onNavigate('/audio')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0176fd] hover:underline cursor-pointer mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Audio Studio Overview</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Speech to Text Workspace
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Live Real-Time Dictation & Whisper AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            بولتے ہی فوری اسکرین پر ٹائپ ہوتا ہے۔ مائیک میں بولیں یا آڈیو فائل اپلوڈ کر کے مکمل ٹرانسکرپٹ حاصل کریں۔
          </p>
        </div>

        {/* Input Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <button
            onClick={() => {
              if (isListening) stopRecordingSession();
              setInputMode('live');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              inputMode === 'live'
                ? 'bg-white text-[#0176fd] shadow-sm ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Mode A: Live Real-Time Mic</span>
          </button>
          <button
            onClick={() => {
              if (isListening) stopRecordingSession();
              setInputMode('upload');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              inputMode === 'upload'
                ? 'bg-white text-[#0176fd] shadow-sm ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Mode B: Audio Upload (Whisper)</span>
          </button>
        </div>
      </div>

      {/* Main Working Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Input Stage */}
        <div className="lg:col-span-2 space-y-5">
          {inputMode === 'live' ? (
            <div className="p-8 rounded-3xl border border-slate-200 bg-white text-center flex flex-col items-center justify-center space-y-6 relative overflow-hidden transition-all shadow-sm">
              
              {/* Status Header */}
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                <span className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                <span>
                  {isListening ? `Live Recording: ${formatTimer(recordingSeconds)}` : 'Microphone Ready — Click to Dictate'}
                </span>
              </div>

              {/* Glowing Interactive Microphone Button */}
              <button
                type="button"
                onClick={isListening ? stopRecordingSession : startListening}
                aria-label={isListening ? 'Stop live recording' : 'Start live recording'}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer relative shadow-xl hover:scale-105 active:scale-95 ${
                  isListening
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 ring-8 ring-rose-500/25 animate-pulse'
                    : 'bg-gradient-to-r from-[#01bbfd] to-[#0176fd] shadow-[#0176fd]/30 ring-4 ring-blue-100'
                }`}
              >
                {isListening ? (
                  <StopCircle className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </button>

              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  {isListening ? 'بولنا جاری رکھیں — الفاظ فوری ٹائپ ہو رہے ہیں...' : 'مائیک پر کلک کریں اور بولنا شروع کریں'}
                </p>
                <p className="text-xs text-slate-500">
                  {isListening 
                    ? 'Speak clearly into your mic. Your speech is converted to text instantly without delay.' 
                    : 'Instant speech recognition powered by Web Speech streaming + Groq Whisper AI.'}
                </p>
              </div>

              {/* Real Audio Visualizer Canvas */}
              <div className="w-full max-w-sm h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-2">
                <AudioVisualizer stream={stream} isActive={isListening} />
              </div>

              {/* Live Streaming Word Typing Indicator */}
              {isListening && interimText && (
                <div className="w-full max-w-md p-3 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-center gap-2 text-left animate-fadeIn">
                  <span className="w-2 h-2 rounded-full bg-[#0176fd] animate-ping flex-shrink-0" />
                  <span className="font-bold flex-shrink-0">Live Hearing:</span>
                  <span className="font-semibold italic text-[#0176fd] truncate">"{interimText}"</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <AudioUploadZone
                selectedFile={uploadedFile}
                onFileSelect={handleTranscribeFile}
                onClear={() => {
                  setUploadedFile(null);
                  setTranscript('');
                  baseTranscriptRef.current = '';
                  reconnectTranscriptRef.current = '';
                  currentInstanceFinalRef.current = '';
                }}
              />
              {isTranscribingFile && (
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-3 text-xs font-semibold text-[#0176fd]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Groq Whisper AI (whisper-large-v3-turbo) is decoding and transcribing your file...</span>
                </div>
              )}
            </div>
          )}

          {/* Editable Live Transcript Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5 font-bold">
                <Radio className="w-3.5 h-3.5 text-[#0176fd]" />
                <span>Generated Transcript (Live & Editable):</span>
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span>{transcript ? `${transcript.trim().split(/\s+/).filter(Boolean).length} words` : '0 words'}</span>
                <span>•</span>
                <span>{transcript.length} characters</span>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={7}
                dir={isRtl ? 'rtl' : 'ltr'}
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  baseTranscriptRef.current = e.target.value;
                  reconnectTranscriptRef.current = '';
                  currentInstanceFinalRef.current = '';
                }}
                placeholder={isRtl 
                  ? 'آپ کا بولا ہوا جملہ یہاں فوری خودکار طریقے سے ٹائپ ہوگا۔ آپ اسے کسی بھی وقت ایڈٹ یا کاپی کر سکتے ہیں...'
                  : 'Your transcribed text will type out here in real time as you speak. You can edit, copy, or export it anytime...'}
                className={`w-full p-4 sm:p-5 rounded-2xl border text-sm leading-relaxed focus:outline-none focus:border-[#0176fd] focus:ring-2 focus:ring-[#01bbfd]/25 transition-all shadow-inner font-sans bg-white border-slate-300 text-slate-900 ${
                  isListening ? 'ring-2 ring-blue-400/30 border-blue-400' : ''
                }`}
              />

              {/* Pulsing Active Dictation Dot */}
              {isListening && (
                <div className={`absolute bottom-4 ${isRtl ? 'left-4' : 'right-4'} flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700 shadow-xs`}>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>Real-Time Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Transcript Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!transcript}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 disabled:opacity-40 shadow-xs'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={() => {
                  setTranscript('');
                  setInterimText('');
                  baseTranscriptRef.current = '';
                  reconnectTranscriptRef.current = '';
                  currentInstanceFinalRef.current = '';
                  setRecordedAudioBlob(null);
                }}
                disabled={!transcript}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-500 hover:border-rose-200 transition-colors text-xs font-semibold cursor-pointer disabled:opacity-40 shadow-xs"
                title="Clear Transcript"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Optional AI Whisper Refine Button */}
              {recordedAudioBlob && !isListening && (
                <button
                  onClick={handleRefineWithWhisper}
                  disabled={isAiRefining}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 text-purple-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isAiRefining ? 'Refining...' : 'Refine with Groq Whisper'}</span>
                </button>
              )}
            </div>

            <button
              onClick={handleDownloadTxt}
              disabled={!transcript}
              className="px-6 py-2.5 rounded-full siftx-pill-btn font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Text (.txt)</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Transcription Settings */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-white space-y-5 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider font-mono flex items-center gap-2 text-slate-500">
              <Mic className="w-4 h-4 text-[#0176fd]" />
              <span>Recognition Settings</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Dictation Language:</label>
              <select
                value={language}
                onChange={(e) => {
                  if (isListening) stopRecordingSession();
                  setLanguage(e.target.value);
                }}
                disabled={isListening}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#0176fd] focus:bg-white cursor-pointer"
              >
                <option value="ur-PK">🇵🇰 اردو (Urdu - Pakistan)</option>
                <option value="en-US">🇺🇸 English (US)</option>
                <option value="en-GB">🇬🇧 English (UK)</option>
                <option value="ar-SA">🇸🇦 Arabic (Saudi Arabia)</option>
                <option value="hi-IN">🇮🇳 Hindi (India)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>فوری لائیو ٹائپنگ (Zero Delay)</span>
              </span>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                جیسے جیسے آپ مائیکروفون میں بولیں گے، الفاظ فوری طور پر اسکرین پر ظاہر ہوتے جائیں گے۔ بولنے کے بعد آپ کسی بھی لفظ کو ایڈٹ یا کاپی کر سکتے ہیں۔
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Groq Whisper Integration</span>
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Mode B uses our backend Groq Whisper large-v3-turbo engine for 100% accurate file transcription across Urdu, English, and Arabic.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Client-Side Privacy</span>
            </span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Your live microphone stream never leaves your browser during live dictation. Zero recording data is stored on remote servers.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
