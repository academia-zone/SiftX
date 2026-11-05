import React, { useRef } from 'react';
import { 
  Layers, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { ImageSeparatorTool } from './tools/ImageSeparatorTool';

interface ImageSeparatorStudioAppProps {
  onExitToMain: () => void;
}

export const ImageSeparatorStudioApp: React.FC<ImageSeparatorStudioAppProps> = ({ onExitToMain }) => {
  const toolStageRef = useRef<HTMLDivElement>(null);

  const scrollToTool = () => {
    toolStageRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors">
      
      {/* Top Studio Navbar with Signature Violet / Indigo Theme */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-violet-100 dark:border-violet-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left: Exit to Main Website */}
          <div className="flex items-center gap-4">
            <button
              onClick={onExitToMain}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to SiftX</span>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Studio Identity Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center border border-violet-500/20 shadow-2xs">
                <Layers className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                    Image Layer & Icon Separator
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 font-mono font-bold text-[10px] border border-violet-200 dark:border-violet-800">
                    Canva Studio
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Automated Graphic Deconstructor, Asset Extractor & Layer Editor
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={scrollToTool}
              className="px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs shadow-md shadow-violet-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Studio</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        
        {/* GRAND UNIFIED HERO SECTION (Matching SiftX Master Template with Violet Theme) */}
        <section className="relative overflow-hidden rounded-3xl border border-violet-100 dark:border-violet-950 bg-gradient-to-b from-violet-50/70 via-white to-slate-50 dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-950 p-8 sm:p-14 text-center space-y-6 shadow-sm">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
            <span>SIFTX IMAGE LAYER & ICON SEPARATOR • CANVA ASSET DECONSTRUCTOR</span>
          </div>

          {/* Refined Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Deconstruct Graphics into <span className="text-violet-600 italic">Movable Layers & Icons</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Upload any poster, flyer, UI mockup, or icon sheet. Automatically isolate every element into independent Canva-style layers, replace icons with your own, and export transparent PNG assets — 100% in your browser.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={scrollToTool}
              className="px-8 py-3.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm shadow-lg shadow-violet-600/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <span>Upload & Separate Elements</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('how-it-works-separator');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-7 py-3.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer border border-slate-300 dark:border-slate-700 shadow-2xs"
            >
              <span>See Workflow</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
              <span>Auto Connected-Component CV</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-violet-600 shrink-0" />
              <span>Canva Drag, Replace & Reorder</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0" />
              <span>1-Click Individual Asset Export</span>
            </span>
          </div>

        </section>

        {/* WORKSPACE TOOL STAGE */}
        <section ref={toolStageRef} className="pt-2">
          <ImageSeparatorTool />
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works-separator" className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              How Graphic Deconstruction & Asset Extraction Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Our in-browser computer vision separates flattened images into editable components in 3 steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 font-black flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Upload Any Graphic</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Drop in any JPEG, PNG, or WebP design. It stays 100% private in browser memory without cloud processing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 font-black flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Automatic Layer Isolation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Computer vision detects boundaries, separating every icon, badge, text, and shape into its own transparent layer.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 font-black flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Edit, Replace & Export</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Reposition elements on canvas, replace icons with your own, or export individual transparent PNG assets in 1 click.
              </p>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
};
