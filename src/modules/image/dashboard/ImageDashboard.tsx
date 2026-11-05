import React, { useState } from 'react';
import { 
  Search, 
  Wand2, 
  Minimize2, 
  Maximize2, 
  Crop, 
  RefreshCw, 
  FileText, 
  Sparkles, 
  Pipette, 
  QrCode, 
  Stamp, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { IMAGE_TOOLS, type ImageToolId } from '../types/imageTypes';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Wand2,
  Minimize2,
  Maximize2,
  Crop,
  RefreshCw,
  FileText,
  Sparkles,
  Pipette,
  QrCode,
  Stamp,
};

interface ImageDashboardProps {
  onSelectTool: (toolId: ImageToolId) => void;
}

export const ImageDashboard: React.FC<ImageDashboardProps> = ({ onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Optimization' | 'Editing' | 'Extraction & Utilities'>('All');

  const filteredTools = IMAGE_TOOLS.filter((tool) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10 font-sans">
      
      {/* Hero Banner with Signature Violet / Purple Gradient */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-700 text-white p-8 sm:p-12 shadow-xl shadow-purple-900/10">
        
        {/* Subtle Background Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-fuchsia-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>SiftX Studio Module • 100% In-Browser Hardware Acceleration</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Image & Graphic Studio
            <span className="block text-xl sm:text-2xl font-bold font-urdu text-purple-200 mt-1">
              امیج اور گرافکس اسٹوڈیو
            </span>
          </h1>

          <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
            AI background cutout, lossless compression, smart cropping, social media resizing, OCR scanner, 
            super-resolution upscaling, color palettes, and branded QR codes—all executing locally on your device.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-purple-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Zero Server Uploads • 100% Private</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Canvas 2D & WebGL Native Speed</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>10 Professional Engines</span>
            </span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search image tools (e.g. background, compress, resize, OCR)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 shadow-2xs transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {(['All', 'Optimization', 'Editing', 'Extraction & Utilities'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat === 'All' ? 'All (10)' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid (Clean 2-3 Column Card Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const Icon = ICON_MAP[tool.iconName] || Wand2;

          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="group bg-white rounded-3xl border border-slate-200/90 hover:border-purple-400 p-6 flex flex-col justify-between shadow-2xs hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer relative"
            >
              <div className="space-y-4">
                {/* Header: Icon & Category */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>

                  {tool.badge && (
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                      {tool.badge}
                    </span>
                  )}
                </div>

                {/* Title & Urdu Subtitle */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-600 transition-colors">
                      {tool.name}
                    </h3>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 font-urdu mt-0.5">
                    {tool.nameUrdu}
                  </p>
                </div>

                {/* Tagline & Description */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>

                {/* Feature Highlights Pills */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {tool.highlights.slice(0, 3).map((hl, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100"
                    >
                      {hl}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600 group-hover:text-purple-700">
                <span className="flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Launch Tool</span>
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
