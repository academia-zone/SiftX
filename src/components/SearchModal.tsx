import React, { useEffect, useRef } from 'react';
import { Search, X, ArrowUpRight, Folder } from 'lucide-react';
import type { ToolItem } from '../types';
import { ALL_TOOLS } from '../data/toolsData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTool
}) => {
  const [query, setQuery] = React.useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = query.trim()
    ? ALL_TOOLS.filter((t) => {
        const q = query.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.subCategory.toLowerCase().includes(q) ||
          t.folderName.toLowerCase().includes(q)
        );
      })
    : ALL_TOOLS.slice(0, 8);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-blue-950 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type tool name (e.g. 'bill', 'pdf', 'gpa', 'age', 'ocr')..."
            className="w-full bg-transparent text-blue-950 text-base placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span>{query ? `Found (${results.length}) matching tools` : 'Popular Daily Tools'}</span>
            <span className="text-[10px] text-slate-700">Esc to close</span>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-700 text-sm">
              No matching tools found for "{query}".
            </div>
          ) : (
            results.map((tool) => (
              <div
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool);
                  onClose();
                }}
                className="p-3 rounded-xl hover:bg-blue-50/70 cursor-pointer flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-950 group-hover:bg-blue-950 group-hover:text-white transition-colors">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-950 group-hover:text-blue-900 transition-colors">
                        {tool.name}
                      </span>
                      {tool.badge && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-950 border border-blue-200">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700">{tool.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="font-mono text-[10px] hidden sm:inline text-slate-700">tools/{tool.folderName}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-blue-950" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-700">
          <span>Search covers all 25 tools</span>
          <span className="font-mono text-blue-950 font-bold">Universal Toolkit</span>
        </div>
      </div>
    </div>
  );
};
