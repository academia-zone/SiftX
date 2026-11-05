import React, { useState } from 'react';
import { 
  Search, 
  Code2, 
  Globe, 
  Boxes, 
  FileCheck, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Zap 
} from 'lucide-react';
import { DEVELOPER_TOOLS, type DeveloperToolId } from '../types/developerTypes';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Globe,
  Boxes,
  FileCheck,
  Sparkles,
  Code2
};

interface DeveloperDashboardProps {
  onSelectTool: (toolId: DeveloperToolId) => void;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = DEVELOPER_TOOLS.filter((tool) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.nameUrdu.includes(q) ||
      tool.tagline.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 font-sans">
      {/* Hero Banner with Modern Deep Slate & Cyber Indigo */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 backdrop-blur-md text-indigo-300 text-xs font-bold tracking-wide uppercase border border-indigo-500/30">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Studio 6 • 4 Essential High-Value Developer Engines</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Developer Studio
            <span className="block text-indigo-200 text-2xl sm:text-3xl font-medium mt-1">
              4 انتہائی مفید اور ضروری ٹولز
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            No clutter. Only the 4 most indispensable tools every developer needs: Live full-website SEO & 3-screen mobile simulator, universal JSON to TypeScript/Zod/Pydantic/Go transpiler, production .env auditor, and AI prompt context optimizer.
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-indigo-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 4 Core High-Impact Engines
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Client-Side Privacy
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Instant Execution
            </span>
          </div>
        </div>

        {/* Ambient Glow Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-indigo-600/15 via-purple-600/10 to-transparent pointer-events-none" />
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within the 4 tools..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Exactly 4 High-Impact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTools.map((tool) => {
          const IconComp = ICON_MAP[tool.icon] || Code2;

          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="group bg-white rounded-3xl p-7 border border-slate-200 hover:border-indigo-400 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Icon & Badge Row */}
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 text-slate-700 group-hover:text-indigo-600 flex items-center justify-center transition-colors border border-slate-100 group-hover:border-indigo-200">
                    <IconComp className="w-7 h-7" />
                  </div>

                  {tool.badge && (
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {tool.badge}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {tool.name}
                  </h3>
                  <div className="text-xs font-medium text-slate-400 mt-0.5">
                    {tool.nameUrdu}
                  </div>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                  100% Client-Side Privacy
                </span>
                <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
