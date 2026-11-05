import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Layers, 
  Scissors, 
  Minimize2, 
  FileType, 
  Table, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Lock, 
  LayoutGrid, 
  Stamp, 
  Edit3, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Zap
} from 'lucide-react';
import { PDF_TOOLS, type PdfToolId } from '../types/pdfTypes';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Layers,
  Scissors,
  Minimize2,
  FileText,
  FileType,
  Table,
  Image: ImageIcon,
  FileSpreadsheet,
  Lock,
  LayoutGrid,
  Stamp,
  Edit3,
};

interface PdfDashboardProps {
  onSelectTool: (toolId: PdfToolId) => void;
}

export const PdfDashboard: React.FC<PdfDashboardProps> = ({ onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredTools = PDF_TOOLS.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 pb-16 font-sans">
      
      {/* Hero Section with Signature Crimson / Rose Theme Accent */}
      <div className="rounded-3xl p-6 sm:p-10 border border-rose-100 bg-gradient-to-b from-rose-50/80 via-red-50/30 to-white text-slate-900 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-mono font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>SIFTX PDF & DOCUMENT STUDIO • 100% PRIVATE CLIENT ENGINE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-slate-900">
            Professional PDF Processing, Conversion & E-Sign Suite
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl">
            Merge, split, compress, convert, watermark, and electronically sign PDF documents right in your browser.
            Your sensitive files, financial records, and contracts never touch an external server.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectTool('pdf-merger')}
              className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <span>Merge PDF Files</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectTool('pdf-compressor')}
              className="px-6 py-3 rounded-full border border-rose-300 bg-white hover:bg-rose-50/50 text-rose-800 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
            >
              <span>Compress PDF</span>
            </button>
            <button
              onClick={() => onSelectTool('pdf-editor')}
              className="px-6 py-3 rounded-full border border-rose-300 bg-white hover:bg-rose-50/50 text-rose-800 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
            >
              <span>E-Sign & Annotate</span>
            </button>
          </div>

          {/* Quick Feature Badges */}
          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 border-t border-rose-100">
            <span className="flex items-center gap-1.5 text-rose-700">
              <CheckCircle2 className="w-4 h-4 text-rose-600" />
              <span>12 Specialized PDF Tools</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% In-Browser Privacy • Zero Uploads</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Zap className="w-4 h-4 text-slate-500" />
              <span>High-Speed Vector Processing</span>
            </span>
          </div>

        </div>

        {/* Ambient Crimson Glows */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-rose-200/40 via-red-100/30 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-64 h-64 rounded-full bg-gradient-to-tl from-pink-200/30 to-transparent blur-2xl pointer-events-none" />
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {(['All', 'Organization & Security', 'Converters', 'Document Editing'] as const).map((cat) => {
            const count = cat === 'All' 
              ? PDF_TOOLS.length 
              : PDF_TOOLS.filter(t => t.category === cat).length;
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 12 PDF tools..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all"
          />
        </div>

      </div>

      {/* 12 Modern PDF Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const Icon = ICON_MAP[tool.iconName] || FileText;

          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="bg-white rounded-3xl border border-slate-200/90 hover:border-rose-500/60 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Header: Icon + Category Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all flex items-center justify-center shadow-xs">
                    <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {tool.badge && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {tool.badge}
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {tool.category}
                    </span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-rose-700 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {tool.tagline}
                  </p>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tool.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-600"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 group-hover:text-rose-600 transition-colors">
                  Open Tool
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-rose-600 group-hover:text-white text-slate-700 flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Corner Ambient Glow */}
              <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-rose-500/10 group-hover:scale-150 transition-transform blur-xl pointer-events-none" />
            </div>
          );
        })}
      </div>

    </div>
  );
};
