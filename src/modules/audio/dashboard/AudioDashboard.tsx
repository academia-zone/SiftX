import React from 'react';
import { Sparkles, ShieldCheck, Zap, Cpu, ArrowRight } from 'lucide-react';
import { AudioToolCard } from './AudioToolCard';
import { useAudioTheme } from '../shared/AudioThemeContext';
import type { AudioToolMeta, AudioStudioRoute } from '../types/audioTypes';

const AUDIO_TOOLS: AudioToolMeta[] = [
  {
    id: 'text-to-speech',
    route: '/audio/text-to-speech',
    name: 'Text to Speech',
    nameUrdu: 'ٹیکسٹ ٹو وائس',
    tagline: 'Convert written text into natural-sounding speech',
    description: 'High-fidelity speech synthesis supporting Urdu Nastaliq, Roman Urdu, English, and international languages with instant MP3 export.',
    iconName: 'Volume2',
    badge: 'Neural Voice',
    highlights: ['Urdu Nastaliq & Roman', 'English / Arabic / EU', 'MP3 Export', 'RTL Support'],
  },
  {
    id: 'speech-to-text',
    route: '/audio/speech-to-text',
    name: 'Speech to Text',
    nameUrdu: 'وائس ٹو ٹیکسٹ',
    tagline: 'Convert spoken audio and recordings into editable text',
    description: 'Dual-mode speech recognition: real-time live microphone dictation with audio spectrum visualizer, plus audio file upload transcription.',
    iconName: 'FileAudio',
    badge: 'Dual Mode',
    highlights: ['Live Dictation', 'Audio File Upload', 'Real-time Waveform', 'TXT Export'],
  },
  {
    id: 'voice-changer',
    route: '/audio/voice-changer',
    name: 'Voice Changer',
    nameUrdu: 'وائس چینجر',
    tagline: 'Transform audio with voice effects, pitch adjustment and noise reduction',
    description: 'Real Web Audio DSP engine featuring Cyber Robot, Chipmunk, Movie Trailer Deep, Vintage Radio, Cosmic Echo, and background noise suppression.',
    iconName: 'Mic',
    badge: 'Real DSP',
    highlights: ['True Pitch Shift', 'Bandpass Radio Filter', 'Echo & Delay', 'A/B Comparison'],
  },
  {
    id: 'ai-voice-generator',
    route: '/audio/ai-voice-generator',
    name: 'AI Voice Generator',
    nameUrdu: 'اے آئی وائس',
    tagline: 'Generate expressive AI speech with customizable delivery styles',
    description: 'Curated expressive voice personas (Authoritative Narrator, Warm Podcast Host, Cinematic Deep, Tech Presenter) generating genuine spoken audio.',
    iconName: 'Sparkles',
    badge: 'Multi-Persona',
    highlights: ['Alex & Sophia Profiles', 'Real Spoken Words', 'Cadence Sliders', 'WAV / MP3 Export'],
  },
];

export const AudioDashboard: React.FC<{ onNavigate: (route: AudioStudioRoute) => void }> = ({ onNavigate }) => {
  const { theme } = useAudioTheme();

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero / Introduction */}
      <div
        className={`rounded-3xl p-6 sm:p-10 border relative overflow-hidden transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[#031530] via-[#020f22] to-[#010a18] border-slate-800 text-white shadow-2xl'
            : 'bg-gradient-to-b from-sky-50/70 via-white to-slate-50 border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#01bbfd]/15 border border-[#01bbfd]/30 text-[#01bbfd] text-xs font-mono font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#01bbfd]" />
            <span>SIFTX AUDIO STUDIO PRO</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15]">
            Precision Voice AI & Audio Processing Suite
          </h1>

          <p className="text-sm sm:text-base text-slate-400 dark:text-slate-300 leading-relaxed font-normal max-w-2xl">
            A dedicated, distraction-free audio workplace featuring four high-performance sound engines. 
            Runs with 100% client-side memory privacy and instant local processing speed.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/audio/text-to-speech')}
              className="px-6 py-3 rounded-full siftx-pill-btn font-extrabold text-xs sm:text-sm shadow-lg shadow-[#0176fd]/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <span>Launch Text to Speech</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/audio/voice-changer')}
              className="px-6 py-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              <span>Explore Voice Changer</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#01bbfd]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* The 4 Tool Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Specialized Audio Engines
          </h2>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            4 Standalone Workspaces
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {AUDIO_TOOLS.map((tool) => (
            <AudioToolCard
              key={tool.id}
              tool={tool}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      {/* Section 4: Verified Technical Capabilities */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <h3 className="text-base font-extrabold tracking-tight mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#0176fd]" />
          <span>Verified Platform Capabilities & Processing Standards</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>In-Browser Processing</span>
            </span>
            <p>Audio effects, noise reduction, and pitch transformations are computed locally using Web Audio API nodes.</p>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Multi-Format Output</span>
            </span>
            <p>Generates standard 16-bit PCM uncompressed WAV and MP3 audio with valid RIFF headers.</p>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#01bbfd]" />
              <span>Multilingual Articulation</span>
            </span>
            <p>Native pronunciation support for Urdu Nastaliq script, Roman Urdu, Arabic, English, and major European languages.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
