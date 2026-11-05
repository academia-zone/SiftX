import React from 'react';
import { 
  Home, 
  Volume2, 
  Mic, 
  Sparkles, 
  Cpu, 
  ArrowLeft,
  X
} from 'lucide-react';
import type { AudioStudioRoute } from '../types/audioTypes';

interface NavItem {
  route: AudioStudioRoute;
  name: string;
  nameUrdu: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    route: '/audio',
    name: 'Overview',
    nameUrdu: 'جائزہ',
    icon: Home,
  },
  {
    route: '/audio/text-to-speech',
    name: 'Text to Speech',
    nameUrdu: 'آواز میں تبدیل',
    badge: 'Multi-Lingual',
    icon: Volume2,
  },
  {
    route: '/audio/speech-to-text',
    name: 'Speech to Text',
    nameUrdu: 'تحریر میں تبدیل',
    badge: 'Live Mic',
    icon: Mic,
  },
  {
    route: '/audio/voice-changer',
    name: 'Voice Changer',
    nameUrdu: 'آواز کا اثر',
    badge: 'DSP Filters',
    icon: Sparkles,
  },
  {
    route: '/audio/ai-voice-generator',
    name: 'AI Voice Generator',
    nameUrdu: 'اے آئی آواز',
    badge: '5 Personas',
    icon: Cpu,
  },
];

interface AudioStudioNavigationProps {
  currentRoute: AudioStudioRoute;
  onNavigate: (route: AudioStudioRoute) => void;
  onExitToMain: () => void;
  isMobile?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const AudioStudioNavigation: React.FC<AudioStudioNavigationProps> = ({
  currentRoute,
  onNavigate,
  onExitToMain,
  isMobile = false,
  onCloseMobileDrawer,
}) => {
  return (
    <div className="flex flex-col h-full select-none">
      {/* Mobile Drawer Top Bar */}
      {isMobile && (
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
              S
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white leading-none">
                SiftX Studio
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Audio Workstation
              </div>
            </div>
          </div>
          {onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Nav Section Header */}
      <div className="px-4 pt-5 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Studio Workspace
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = currentRoute === item.route;
          const Icon = item.icon;

          return (
            <button
              key={item.route}
              type="button"
              onClick={() => {
                onNavigate(item.route);
                if (isMobile && onCloseMobileDrawer) onCloseMobileDrawer();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Return Action */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => {
            onExitToMain();
            if (isMobile && onCloseMobileDrawer) onCloseMobileDrawer();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          <span>Return to All Tools</span>
        </button>
      </div>
    </div>
  );
};
