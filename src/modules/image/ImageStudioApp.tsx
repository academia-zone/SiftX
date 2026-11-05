import React, { useState } from 'react';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  Wand2, 
  Minimize2, 
  Maximize2, 
  Crop, 
  FileType, 
  FileText, 
  Sparkles, 
  Pipette, 
  QrCode, 
  Stamp, 
  ChevronDown,
  ShieldCheck,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { IMAGE_TOOLS, type ImageToolId } from './types/imageTypes';
import { ImageDashboard } from './dashboard/ImageDashboard';

// 10 Image Tools
import { BgRemoverTool } from './tools/BgRemoverTool';
import { ImageCompressorTool } from './tools/ImageCompressorTool';
import { ImageResizerTool } from './tools/ImageResizerTool';
import { ImageCropperTool } from './tools/ImageCropperTool';
import { ImageConverterTool } from './tools/ImageConverterTool';
import { ImageOcrTool } from './tools/ImageOcrTool';
import { ImageUpscalerTool } from './tools/ImageUpscalerTool';
import { ColorPickerTool } from './tools/ColorPickerTool';
import { QrGeneratorTool } from './tools/QrGeneratorTool';
import { ImageWatermarkTool } from './tools/ImageWatermarkTool';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Wand2,
  Minimize2,
  Maximize2,
  Crop,
  FileType,
  FileText,
  Sparkles,
  Pipette,
  QrCode,
  Stamp,
};

interface ImageStudioAppProps {
  onBackToTools?: () => void;
  initialToolId?: ImageToolId;
}

export const ImageStudioApp: React.FC<ImageStudioAppProps> = ({
  onBackToTools,
  initialToolId,
}) => {
  const [activeToolId, setActiveToolId] = useState<ImageToolId | null>(initialToolId || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeTool = IMAGE_TOOLS.find((t) => t.id === activeToolId);

  const renderActiveTool = () => {
    switch (activeToolId) {
      case 'bg-remover':
        return <BgRemoverTool />;
      case 'image-compressor':
        return <ImageCompressorTool />;
      case 'image-resizer':
        return <ImageResizerTool />;
      case 'image-cropper':
        return <ImageCropperTool />;
      case 'image-converter':
        return <ImageConverterTool />;
      case 'image-ocr':
        return <ImageOcrTool />;
      case 'image-upscaler':
        return <ImageUpscalerTool />;
      case 'color-picker':
        return <ColorPickerTool />;
      case 'qr-generator':
        return <QrGeneratorTool />;
      case 'image-watermark':
        return <ImageWatermarkTool />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-gray-800 flex flex-col">
      {/* Studio Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Navigation */}
          <div className="flex items-center gap-3">
            {onBackToTools && (
              <button
                onClick={onBackToTools}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-purple-700 bg-gray-50 hover:bg-purple-50 px-3 py-2 rounded-xl transition border border-gray-200"
                title="Return to Main Suite"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">All Studios</span>
              </button>
            )}

            <button
              onClick={() => setActiveToolId(null)}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-purple-600/30 group-hover:scale-105 transition">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-gray-900 tracking-tight text-base">
                    SiftX <span className="text-purple-600">Image</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                    Studio
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 -mt-0.5 hidden md:block">
                  Next-Gen Client-Side Graphic Suite
                </p>
              </div>
            </button>
          </div>

          {/* Center: Tool Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition text-sm font-semibold ${
                activeToolId
                  ? 'bg-purple-50/80 border-purple-200 text-purple-900 hover:bg-purple-100/60'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {activeTool ? (
                <>
                  <span className="truncate max-w-[140px] sm:max-w-none">
                    {activeTool.name}
                  </span>
                  <span className="font-urdu text-xs font-medium text-purple-700 hidden sm:inline">
                    ({activeTool.nameUrdu})
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-2 text-gray-600">
                  <LayoutDashboard className="w-4 h-4 text-purple-600" />
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
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition mb-1 ${
                      activeToolId === null
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard / Overview</span>
                    <span className="ml-auto font-urdu text-xs font-normal">تمام ٹولز</span>
                  </button>

                  <div className="h-px bg-gray-100 my-1" />

                  {IMAGE_TOOLS.map((t) => {
                    const Icon = ICON_MAP[t.iconName] || ImageIcon;
                    const isCurrent = activeToolId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveToolId(t.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition ${
                          isCurrent
                            ? 'bg-purple-600 text-white font-bold'
                            : 'text-gray-700 hover:bg-purple-50 hover:text-purple-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-purple-600'}`} />
                          <span>{t.name}</span>
                        </div>
                        <span className={`font-urdu text-[11px] ${isCurrent ? 'text-purple-100' : 'text-gray-400'}`}>
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
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-purple-700 bg-gray-50 hover:bg-purple-50 rounded-xl border border-gray-200 transition"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-purple-600" />
                All Tools
              </button>
            )}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% In-Browser Privacy
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 py-8 px-4 sm:px-8">
        {activeToolId === null ? (
          <ImageDashboard onSelectTool={(toolId) => setActiveToolId(toolId)} />
        ) : (
          renderActiveTool()
        )}
      </main>

      {/* Footer info */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SiftX Image Studio • Built with Canvas 2D & WebGL acceleration</p>
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Zero Upload Delays
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Client-Side Memory
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
