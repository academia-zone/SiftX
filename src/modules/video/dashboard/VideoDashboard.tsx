import React, { useState } from 'react';
import { 
  Search, 
  Video, 
  Minimize2, 
  Scissors, 
  Film, 
  Music, 
  RefreshCw, 
  Sparkles, 
  Maximize2, 
  Subtitles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  CheckCircle2
} from 'lucide-react';
import { VIDEO_TOOLS, type VideoToolId } from '../types/videoTypes';

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

interface VideoDashboardProps {
  onSelectTool: (toolId: VideoToolId) => void;
}

export const VideoDashboard: React.FC<VideoDashboardProps> = ({ onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Editing' | 'Compression & Conversion' | 'Animation & Captions'>('All');

  const filteredTools = VIDEO_TOOLS.filter((tool) => {
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.nameUrdu.includes(searchQuery) ||
      tool.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10 font-sans">
      
      {/* Hero Banner with Cinematic Deep Midnight Blue & Royal Indigo */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white p-8 sm:p-12 shadow-2xl border border-indigo-900/50">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 backdrop-blur-md text-indigo-300 text-xs font-bold tracking-wide uppercase border border-indigo-500/30">
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            <span>Studio 5 • Video & Animation Lab</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Video & Animation Studio
            <span className="block text-indigo-200 text-2xl sm:text-3xl font-urdu font-medium mt-1">
              ویڈیو ایڈیٹنگ، کمپریشن اور اینیمیشن لیب
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Professional high-performance video suite running directly inside your browser. Compress for WhatsApp, trim clips, convert formats, make GIFs, and generate synchronized subtitles with zero server uploads.
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-indigo-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 8 Powerful Video Engines
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Client-Side Privacy
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Hardware Accelerated
            </span>
          </div>
        </div>

        {/* Decorative Ambient Radial Glow */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {(['All', 'Editing', 'Compression & Conversion', 'Animation & Captions'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat === 'All' ? 'All 8 Engines' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search video tools..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Large 2-Card Per Row Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredTools.map((tool) => {
          const Icon = ICON_MAP[tool.iconName] || Video;

          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="group bg-white rounded-3xl p-8 border border-indigo-100/80 shadow-sm hover:shadow-2xl hover:border-indigo-400 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 flex items-center justify-center shadow-xs border border-indigo-200/60">
                    <Icon className="w-7 h-7" />
                  </div>
                  {tool.badge && (
                    <span className="text-xs font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {tool.name}
                    </h3>
                    <span className="font-urdu text-sm text-indigo-700 font-semibold bg-indigo-50/70 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                      {tool.nameUrdu}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed pt-1">
                    {tool.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                  {tool.highlights.map((hl, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <span className="truncate">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {tool.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-indigo-700 group-hover:translate-x-1 transition-all">
                  Open Engine Workspace
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
