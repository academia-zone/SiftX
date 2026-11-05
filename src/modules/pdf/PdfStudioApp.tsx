import React, { useState } from 'react';
import { 
  FileText, 
  ArrowLeft, 
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
  ShieldCheck, 
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { PDF_TOOLS, type PdfToolId } from './types/pdfTypes';
import { PdfDashboard } from './dashboard/PdfDashboard';

// All 12 PDF Tools
import { PdfMergerTool } from './tools/pdf-merger/PdfMergerTool';
import { PdfSplitterTool } from './tools/pdf-splitter/PdfSplitterTool';
import { PdfCompressorTool } from './tools/pdf-compressor/PdfCompressorTool';
import { PdfToWordTool } from './tools/pdf-to-word/PdfToWordTool';
import { WordToPdfTool } from './tools/word-to-pdf/WordToPdfTool';
import { PdfToExcelTool } from './tools/pdf-to-excel/PdfToExcelTool';
import { PdfToJpgTool } from './tools/pdf-to-jpg/PdfToJpgTool';
import { JpgToPdfTool } from './tools/jpg-to-pdf/JpgToPdfTool';
import { PdfUnlockerTool } from './tools/pdf-unlocker/PdfUnlockerTool';
import { PdfPageOrganizerTool } from './tools/pdf-page-organizer/PdfPageOrganizerTool';
import { PdfWatermarkTool } from './tools/pdf-watermark/PdfWatermarkTool';
import { PdfEditorTool } from './tools/pdf-editor/PdfEditorTool';

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

interface PdfStudioAppProps {
  initialToolId?: PdfToolId | 'dashboard';
  onExitToMain: () => void;
}

export const PdfStudioApp: React.FC<PdfStudioAppProps> = ({
  initialToolId = 'dashboard',
  onExitToMain,
}) => {
  const [currentView, setCurrentView] = useState<PdfToolId | 'dashboard'>(initialToolId);

  const activeToolMeta = PDF_TOOLS.find((t) => t.id === currentView);
  const ActiveIcon = activeToolMeta ? (ICON_MAP[activeToolMeta.iconName] || FileText) : FileText;

  const renderActiveTool = () => {
    switch (currentView) {
      case 'pdf-merger':
        return <PdfMergerTool />;
      case 'pdf-splitter':
        return <PdfSplitterTool />;
      case 'pdf-compressor':
        return <PdfCompressorTool />;
      case 'pdf-to-word':
        return <PdfToWordTool />;
      case 'word-to-pdf':
        return <WordToPdfTool />;
      case 'pdf-to-excel':
        return <PdfToExcelTool />;
      case 'pdf-to-jpg':
        return <PdfToJpgTool />;
      case 'jpg-to-pdf':
        return <JpgToPdfTool />;
      case 'pdf-unlocker':
        return <PdfUnlockerTool />;
      case 'pdf-page-organizer':
        return <PdfPageOrganizerTool />;
      case 'pdf-watermark':
        return <PdfWatermarkTool />;
      case 'pdf-editor':
        return <PdfEditorTool />;
      default:
        return <PdfMergerTool />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      
      {/* Top Studio Navbar with Signature Ruby Red / Rose Theme */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left Brand & Title */}
          <div className="flex items-center justify-between">
            <div 
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight text-slate-900">
                    SiftX
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    PDF Studio
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">100% Client-Side Private Document Suite</span>
              </div>
            </div>

            <button
              onClick={onExitToMain}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Tool Links / Dashboard Button */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Studio Dashboard</span>
            </button>

            {/* Quick Switch Dropdown */}
            <div className="relative">
              <select
                value={currentView === 'dashboard' ? '' : currentView}
                onChange={(e) => {
                  if (e.target.value) setCurrentView(e.target.value as PdfToolId);
                }}
                className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border-0 rounded-xl px-3 py-1.5 text-slate-700 cursor-pointer outline-none focus:ring-2 focus:ring-rose-500 transition-all appearance-none pr-8"
              >
                <option value="" disabled>Switch PDF Tool...</option>
                {PDF_TOOLS.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name} ({tool.nameUrdu})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 text-[10px]">
                ▼
              </div>
            </div>

            {/* Return to Main SiftX Button */}
            <button
              onClick={onExitToMain}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer ml-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to All Tools</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'dashboard' ? (
          <PdfDashboard onSelectTool={(toolId) => setCurrentView(toolId)} />
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
            
            {/* Tool Header Breadcrumb */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
                  title="Back to PDF Studio Dashboard"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                    <ActiveIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        {activeToolMeta?.name}
                      </h1>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-urdu">
                        {activeToolMeta?.nameUrdu}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {activeToolMeta?.tagline}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status / Privacy Pill */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  100% Client-Side Privacy
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  PDF Studio
                </span>
              </div>
            </div>

            {/* Active Tool Body */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-8 shadow-sm">
              {renderActiveTool()}
            </div>

          </div>
        )}
      </main>

      {/* Studio Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-400">
        <p className="font-medium">
          SiftX PDF & Document Studio — 12 High-Performance Client-Side Tools. No files are ever uploaded to any server.
        </p>
      </footer>

    </div>
  );
};
