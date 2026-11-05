import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  Sparkles, 
  ArrowRight,
  GraduationCap,
  Briefcase,
  FileCheck,
  Laptop
} from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
  onSelectTool: (toolId: string) => void;
  onSelectPersona: (persona: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExplore,
  onSelectTool,
  onSelectPersona: _onSelectPersona
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-cyan-500/15 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Universal Toolkit 2026: 25+ Genuinely Useful Daily Tools</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Every Daily Tool You Need.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
            Under One Roof.
          </span>
        </h1>

        {/* Subtitle in Roman Urdu / English */}
        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          No more visiting 20 different websites or downloading sketchy apps. 
          From <span className="text-white font-medium">Electricity Bill</span> and <span className="text-white font-medium">GPA Calculator</span> to <span className="text-white font-medium">100% Free PDF Studio</span> and <span className="text-white font-medium">Voice AI</span> — everything is free, private, and runs directly on your machine.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onExplore}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center gap-2 group text-sm sm:text-base cursor-pointer"
          >
            <span>Explore All 25 Tools</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onSelectTool('all-in-one-pdf-suite')}
            className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 font-semibold transition-all flex items-center gap-2 text-sm sm:text-base cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-rose-400" />
            <span>Open PDF Studio (100% Free)</span>
          </button>
        </div>

        {/* Quick Launch Shortcuts */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 mr-1">Trending Daily Tools:</span>
          <button
            onClick={() => onSelectTool('electricity-bill-calculator')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3 h-3" />
            <span>Electricity Bill Estimator</span>
          </button>
          <button
            onClick={() => onSelectTool('gpa-cgpa-calculator')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <GraduationCap className="w-3 h-3" />
            <span>GPA / CGPA Calc</span>
          </button>
          <button
            onClick={() => onSelectTool('quick-invoice-generator')}
            className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Briefcase className="w-3 h-3" />
            <span>Invoice Maker</span>
          </button>
          <button
            onClick={() => onSelectTool('notes-maker-todo')}
            className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Smart Notes & Todo</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-900 text-left">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">100% Client-Side</p>
              <p className="text-[11px] text-slate-400">Files never leave your local computer</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Zero Paywalls</p>
              <p className="text-[11px] text-slate-400">No subscriptions, no artificial page limits</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <Laptop className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Web & Desktop</p>
              <p className="text-[11px] text-slate-400">Use on browser or export as Windows .exe</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Instant Speed</p>
              <p className="text-[11px] text-slate-400">Zero wait queues, no upload timeouts</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
