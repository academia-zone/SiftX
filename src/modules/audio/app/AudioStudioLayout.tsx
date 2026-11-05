import React from 'react';
import { 
  ArrowLeft, 
  Headphones, 
  ShieldCheck, 
  Volume2, 
  Mic, 
  Sparkles, 
  Cpu, 
  LayoutDashboard
} from 'lucide-react';
import type { AudioStudioRoute } from '../types/audioTypes';

interface AudioStudioLayoutProps {
  currentRoute: AudioStudioRoute;
  onNavigate: (route: AudioStudioRoute) => void;
  onExitToMain: () => void;
  children: React.ReactNode;
}

const NAV_TABS = [
  { route: '/audio' as AudioStudioRoute, label: 'Overview', icon: LayoutDashboard },
  { route: '/audio/text-to-speech' as AudioStudioRoute, label: 'Text to Speech', icon: Volume2 },
  { route: '/audio/speech-to-text' as AudioStudioRoute, label: 'Speech to Text', icon: Mic },
  { route: '/audio/voice-changer' as AudioStudioRoute, label: 'Voice Changer', icon: Sparkles },
  { route: '/audio/ai-voice-generator' as AudioStudioRoute, label: 'AI Voice', icon: Cpu },
];

export const AudioStudioLayout: React.FC<AudioStudioLayoutProps> = ({
  currentRoute,
  onNavigate,
  onExitToMain,
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
      {/* Top Application Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center justify-between">
            <div 
              onClick={() => onNavigate('/audio')} 
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-[#01bbfd] to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">
                    SiftX
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    Audio Studio
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Private Local Audio Engine</span>
                </div>
              </div>
            </div>

            {/* Mobile Controls (Exit) */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={onExitToMain}
                className="p-2 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100"
                title="Return to All Tools"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center: Sleek Horizontal Tool Switcher */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {NAV_TABS.map((tab) => {
              const isActive = currentRoute === tab.route;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.route}
                  type="button"
                  onClick={() => onNavigate(tab.route)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-1 ring-blue-500'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Exit Button (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={onExitToMain}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Return to All Tools</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Full-Width Canvas without Sidebar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
