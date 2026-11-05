import React from 'react';
import { Volume2, FileAudio, Mic, Sparkles, ArrowRight } from 'lucide-react';
import { useAudioTheme } from '../shared/AudioThemeContext';
import type { AudioToolMeta, AudioStudioRoute } from '../types/audioTypes';

interface AudioToolCardProps {
  tool: AudioToolMeta;
  onNavigate: (route: AudioStudioRoute) => void;
}

export const AudioToolCard: React.FC<AudioToolCardProps> = ({ tool, onNavigate }) => {
  const { theme } = useAudioTheme();

  const getIcon = (name: string) => {
    switch (name) {
      case 'Volume2': return Volume2;
      case 'FileAudio': return FileAudio;
      case 'Mic': return Mic;
      default: return Sparkles;
    }
  };

  const Icon = getIcon(tool.iconName);

  return (
    <div
      onClick={() => onNavigate(tool.route)}
      className={`rounded-3xl p-6 sm:p-7 border transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-1 ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 hover:border-[#0176fd] hover:shadow-[#0176fd]/15'
          : 'bg-white border-slate-200 hover:border-[#0176fd] hover:shadow-xl shadow-sm'
      }`}
    >
      <div className="space-y-4">
        {/* Top Icon & Badge */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#01bbfd]/20 to-[#0176fd]/20 text-[#0176fd] flex items-center justify-center shadow-inner group-hover:scale-108 transition-transform">
            <Icon className="w-6 h-6 text-[#0176fd]" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-500/10 text-[#01bbfd] border border-[#01bbfd]/25">
            {tool.badge}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold tracking-tight group-hover:text-[#0176fd] transition-colors">
              {tool.name}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
              {tool.nameUrdu}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {tool.description}
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tool.highlights.map((h, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
            >
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
          Open Workspace
        </span>
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-[#0176fd] group-hover:text-white transition-all">
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
