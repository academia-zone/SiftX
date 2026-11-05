import React from 'react';
import { 
  X, 
  ExternalLink, 
  Sparkles, 
  Folder, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  ArrowLeft 
} from 'lucide-react';
import type { ToolItem } from '../types';

interface ToolModalProps {
  tool: ToolItem | null;
  onClose: () => void;
}

export const ToolModal: React.FC<ToolModalProps> = ({ tool, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!tool) return null;

  const copyPath = () => {
    navigator.clipboard.writeText(`tools/${tool.folderName}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Top Bar - Navy & White */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-blue-950 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-blue-900/60 hover:bg-blue-900 text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">{tool.name}</h3>
                {tool.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-800 text-blue-100 border border-blue-700">
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200 font-medium">{tool.tagline}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-blue-900/60 hover:bg-blue-900 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Workspace Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          {/* Tool Highlights */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Independent Module</span>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                {tool.description}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <Folder className="w-3.5 h-3.5 text-blue-950" />
                <span>tools/{tool.folderName}</span>
              </span>
              <button
                onClick={copyPath}
                title="Copy folder path"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Dedicated Tool Workbench Container */}
          <div className="border border-slate-200 rounded-2xl p-8 bg-white text-center min-h-[300px] flex flex-col items-center justify-center shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-950 mb-4 shadow-xs">
              <Sparkles className="w-8 h-8 text-blue-950" />
            </div>

            <h4 className="text-lg font-bold text-blue-950">Tool Container Ready</h4>
            <p className="text-sm text-slate-700 max-w-md mt-1 mb-6">
              This tool operates in its dedicated isolated folder: <code className="text-blue-950 bg-blue-50 px-2 py-0.5 rounded text-xs font-mono">F:\toolkit\tools\{tool.folderName}</code>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left text-xs text-slate-700 mb-6">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Client-Side</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-900 shrink-0" />
                <span>Zero Subscription</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-900 shrink-0" />
                <span>Desktop & Web App</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm transition-colors cursor-pointer"
            >
              Back to Categories
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-700">
          <span>Category: <strong className="text-blue-950 capitalize">{tool.mainCategory}</strong> &gt; {tool.subCategory}</span>
          <span className="text-emerald-700 font-semibold">Verified Active Module</span>
        </div>

      </div>
    </div>
  );
};
