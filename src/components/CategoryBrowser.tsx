import React, { useState } from 'react';
import { 
  Calculator, 
  FileText, 
  Sparkles, 
  Mic, 
  Briefcase,
  Zap,
  GraduationCap,
  Percent,
  Fuel,
  Calendar,
  TrendingUp,
  Binary,
  ArrowLeftRight,
  FileCheck,
  ScanText,
  FileSpreadsheet,
  Minimize2,
  Crop,
  Wand2,
  Film,
  Scissors,
  Volume2,
  FileAudio,
  Music,
  Radio,
  NotebookPen,
  Receipt,
  QrCode,
  ShieldCheck,
  Languages,
  ArrowUpRight,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import type { ToolItem, PersonaType } from '../types';
import { CATEGORIES, ALL_TOOLS } from '../data/toolsData';

interface CategoryBrowserProps {
  selectedPersona: PersonaType;
  searchQuery: string;
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectTool: (tool: ToolItem) => void;
}

const ICON_MAP: Record<string, any> = {
  Calculator,
  FileText,
  Sparkles,
  Mic,
  Briefcase,
  Zap,
  GraduationCap,
  Percent,
  Fuel,
  Calendar,
  TrendingUp,
  Binary,
  ArrowLeftRight,
  FileCheck,
  ScanText,
  FileSpreadsheet,
  Minimize2,
  Crop,
  Wand2,
  Film,
  Scissors,
  Volume2,
  FileAudio,
  Music,
  Radio,
  NotebookPen,
  Receipt,
  QrCode,
  ShieldCheck,
  Languages
};

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  selectedPersona,
  searchQuery,
  activeCategory,
  onSelectCategory,
  onSelectTool
}) => {
  const [internalCategory, setInternalCategory] = useState<string>(activeCategory || 'all');

  const currentCategory = activeCategory || internalCategory;

  const handleCategoryChange = (catId: string) => {
    setInternalCategory(catId);
    onSelectCategory(catId);
  };

  // Filter tools based on search query, persona, and main category
  const filteredTools = ALL_TOOLS.filter((tool) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tool.name.toLowerCase().includes(q);
      const matchTagline = tool.tagline.toLowerCase().includes(q);
      const matchCategory = tool.mainCategory.toLowerCase().includes(q);
      const matchSubCategory = tool.subCategory.toLowerCase().includes(q);
      const matchFolder = tool.folderName.toLowerCase().includes(q);
      if (!matchName && !matchTagline && !matchCategory && !matchSubCategory && !matchFolder) {
        return false;
      }
    }

    if (selectedPersona !== 'all' && !tool.personas.includes(selectedPersona)) {
      return false;
    }

    if (currentCategory !== 'all' && tool.mainCategory !== currentCategory) {
      return false;
    }

    return true;
  });

  return (
    <div className="py-6 space-y-8">
      {/* Category Pills Header - Navy & White */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            currentCategory === 'all'
              ? 'bg-blue-950 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:text-blue-950 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Categories ({filteredTools.length})
        </button>

        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || FolderOpen;
          const isSelected = currentCategory === cat.id;
          const count = ALL_TOOLS.filter((t) => t.mainCategory === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-blue-950 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:text-blue-950 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tools Content */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-2xl">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-blue-950">No tools match your criteria</h3>
          <p className="text-sm text-slate-700 mt-1">Try clearing your search query or selecting "All Tools".</p>
        </div>
      ) : (
        <div className="space-y-12">
          {CATEGORIES.filter((c) => currentCategory === 'all' || currentCategory === c.id).map((cat) => {
            const catTools = filteredTools.filter((t) => t.mainCategory === cat.id);
            if (catTools.length === 0) return null;

            const subCategoryGroups = cat.subCategories
              .map((subName) => ({
                name: subName,
                tools: catTools.filter((t) => t.subCategory === subName)
              }))
              .filter((group) => group.tools.length > 0);

            const CatIcon = ICON_MAP[cat.icon] || FolderOpen;

            return (
              <div key={cat.id} className="space-y-6">
                
                {/* Main Category Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-950">
                      <CatIcon className="w-5 h-5 text-blue-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-blue-950 tracking-tight">{cat.title}</h3>
                        <span className="text-xs text-blue-800 font-semibold font-mono">({cat.titleUrdu})</span>
                      </div>
                      <p className="text-xs text-slate-700">{cat.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-700 font-medium">
                    {catTools.length} {catTools.length === 1 ? 'Tool' : 'Tools'} Available
                  </span>
                </div>

                {/* Subcategories Blocks */}
                <div className="space-y-6">
                  {subCategoryGroups.map((group) => (
                    <div key={group.name} className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                        <ChevronRight className="w-3.5 h-3.5 text-blue-900" />
                        <span>{group.name}</span>
                        <div className="flex-1 h-[1px] bg-slate-200 ml-2" />
                      </div>

                      {/* Tool Cards Grid - Clean White with Navy Accents */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.tools.map((tool) => {
                          const ToolIcon = ICON_MAP[tool.icon] || Sparkles;

                          return (
                            <div
                              key={tool.id}
                              onClick={() => onSelectTool(tool)}
                              className="group p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-700 transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md relative"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-3">
                                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-950 group-hover:bg-blue-950 group-hover:text-white flex items-center justify-center transition-colors">
                                    <ToolIcon className="w-5 h-5" />
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    {tool.badge && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-950 border border-blue-200">
                                        {tool.badge}
                                      </span>
                                    )}
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 group-hover:text-white group-hover:bg-blue-950 flex items-center justify-center transition-all">
                                      <ArrowUpRight className="w-3.5 h-3.5" />
                                    </div>
                                  </div>
                                </div>

                                <h4 className="text-base font-bold text-blue-950 group-hover:text-blue-900 transition-colors">
                                  {tool.name}
                                </h4>
                                <p className="text-xs text-blue-800 font-semibold mt-0.5">
                                  {tool.tagline}
                                </p>
                                <p className="text-xs text-slate-700 mt-2 line-clamp-2 leading-relaxed">
                                  {tool.description}
                                </p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                                <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  tools/{tool.folderName}
                                </span>
                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  100% Free
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
