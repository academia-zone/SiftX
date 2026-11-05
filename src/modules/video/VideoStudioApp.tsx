import React, { useState } from 'react';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  Video, 
  Minimize2, 
  Scissors, 
  Film, 
  Music, 
  RefreshCw, 
  Sparkles, 
  Maximize2, 
  Subtitles, 
  ChevronDown, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';
import { VIDEO_TOOLS, type VideoToolId } from './types/videoTypes';
import { VideoDashboard } from './dashboard/VideoDashboard';

// All 8 Video Tools
import { VideoCompressorTool } from './tools/VideoCompressorTool';
import { VideoTrimmerTool } from './tools/VideoTrimmerTool';
import { VideoMergerTool } from './tools/VideoMergerTool';
import { VideoToMp3Tool } from './tools/VideoToMp3Tool';
import { VideoConverterTool } from './tools/VideoConverterTool';
import { GifMakerTool } from './tools/GifMakerTool';
import { VideoResizerTool } from './tools/VideoResizerTool';
import { SubtitleGeneratorTool } from './tools/SubtitleGeneratorTool';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Minimize2,
  Scissors,
  Film,
  Music,
  RefreshCw,
  Sparkles,
  Maximize2,
  Subtitles,
  Video,
};

interface VideoStudioAppProps {
  onBackToTools?: () => void;
  initialToolId?: VideoToolId;
}

export const VideoStudioApp: React.FC<VideoStudioAppProps> = ({
  onBackToTools,
  initialToolId,
}) => {
  const [activeToolId, setActiveToolId] = useState<VideoToolId | null>(initialToolId || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeTool = VIDEO_TOOLS.find((t) => t.id === activeToolId);

  const renderActiveTool = () => {
    switch (activeToolId) {
      case 'video-compressor':
        return <VideoCompressorTool />;
      case 'video-trimmer':
        return <VideoTrimmerTool />;
      case 'video-merger':
        return <VideoMergerTool />;
      case 'video-to-mp3':
        return <VideoToMp3Tool />;
      case 'video-format-converter':
        return <VideoConverterTool />;
      case 'gif-maker':
        return <GifMakerTool />;
      case 'video-resizer':
        return <VideoResizerTool />;
      case 'subtitle-generator':
        return <SubtitleGeneratorTool />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 flex flex-col">
      {/* Studio Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-indigo-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Navigation */}
          <div className="flex items-center gap-3">
            {onBackToTools && (
              <button
                onClick={onBackToTools}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-700 bg-gray-50 hover:bg-indigo-50 px-3 py-2 rounded-xl transition border border-gray-200"
                title="Return to Main Suite"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">All Studios</span>
              </button>
            )}

            <button
              onClick={() => setActiveToolId(null)}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30 group-hover:scale-105 transition">
                <Video className="w-5 h-5 text-indigo-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-gray-900 tracking-tight text-base">
                    SiftX <span className="text-indigo-600">Video</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                    Studio
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 -mt-0.5 hidden md:block">
                  Client-Side Video & Animation Suite
                </p>
              </div>
            </button>
          </div>

          {/* Center: Tool Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition text-sm font-semibold cursor-pointer ${
                activeToolId
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-950 hover:bg-indigo-100/60'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {activeTool ? (
                <>
                  <span className="truncate max-w-[140px] sm:max-w-none">
                    {activeTool.name}
                  </span>
                  <span className="font-urdu text-xs font-semibold text-indigo-700 hidden sm:inline">
                    ({activeTool.nameUrdu})
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-2 text-gray-600">
                  <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                  Dashboard (تمام ٹولز)
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[460px] overflow-y-auto">
                  <button
                    onClick={() => {
                      setActiveToolId(null);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition mb-1 cursor-pointer ${
                      activeToolId === null
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard / Overview</span>
                    <span className="ml-auto font-urdu text-xs font-normal">تمام ٹولز</span>
                  </button>

                  <div className="h-px bg-gray-100 my-1" />

                  {VIDEO_TOOLS.map((t) => {
                    const Icon = ICON_MAP[t.iconName] || Video;
                    const isCurrent = activeToolId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveToolId(t.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-indigo-600'}`} />
                          <span>{t.name}</span>
                        </div>
                        <span className={`font-urdu text-[11px] ${isCurrent ? 'text-indigo-100' : 'text-gray-400'}`}>
                          ({t.nameUrdu})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Right: Security & Dashboard Toggle */}
          <div className="flex items-center gap-2">
            {activeToolId && (
              <button
                onClick={() => setActiveToolId(null)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-indigo-700 bg-gray-50 hover:bg-indigo-50 rounded-xl border border-gray-200 transition cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                All Tools
              </button>
            )}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Client-Side Privacy
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 py-8 px-4 sm:px-8">
        {activeToolId === null ? (
          <VideoDashboard onSelectTool={(toolId) => setActiveToolId(toolId)} />
        ) : (
          renderActiveTool()
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SiftX Video Studio • Built with HTML5 Video, Canvas 2D & Web Audio API</p>
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Zero Upload Wait
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> In-Browser Hardware Accelerated
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
