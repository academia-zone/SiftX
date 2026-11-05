import React, { useRef } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { CvCreatorTool } from './tools/CvCreatorTool';

interface CvCreatorStudioAppProps {
  onExitToMain: () => void;
}

export const CvCreatorStudioApp: React.FC<CvCreatorStudioAppProps> = ({ onExitToMain }) => {
  const toolStageRef = useRef<HTMLDivElement>(null);

  const scrollToTool = () => {
    toolStageRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors">
      
      {/* Top Studio Navbar with Signature Royal Indigo / Violet Theme */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-indigo-100 dark:border-indigo-950">
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
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20 shadow-2xs">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                    CV Creator Studio
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-mono font-bold text-[10px] border border-indigo-200 dark:border-indigo-800">
                    ATS Architect
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Executive Resume & Career Portfolio Builder
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={scrollToTool}
              className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create CV</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        
        {/* GRAND UNIFIED HERO SECTION (Matching Zoom / SiftX Master Template with Indigo Theme) */}
        <section className="relative overflow-hidden rounded-3xl border border-indigo-100 dark:border-indigo-950 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-950 p-8 sm:p-14 text-center space-y-6 shadow-sm">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>SIFTX CV CREATOR & RESUME ARCHITECT • 100% PRIVATE CLIENT ENGINE</span>
          </div>

          {/* Refined Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Build ATS-Friendly Resumes <span className="text-indigo-600 italic">in Minutes</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Design, customize, and export career-ready CVs with real-time live preview, multiple executive templates, and instant PDF download — no signup, no subscriptions, and 100% private.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={scrollToTool}
              className="px-8 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <span>Build My CV Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('how-it-works-cv');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-7 py-3.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer border border-slate-300 dark:border-slate-700 shadow-2xs"
            >
              <span>Explore Templates</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>ATS Parsable Formatting</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Real-Time Live A4 Preview</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>100% In-Browser Privacy</span>
            </span>
          </div>

        </section>

        {/* WORKSPACE TOOL STAGE */}
        <section ref={toolStageRef} className="pt-2">
          <CvCreatorTool />
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works-cv" className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Why Professionals Choose SiftX CV Architect
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Engineered with clean ATS typography and instant client-side PDF rendering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 font-black flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Fill Career Details</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add your experience, education, key skills, and accomplishments or start with our 1-click sample template.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 font-black flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Pick Style & Palette</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose between Modern Executive, Minimal Clean, or Creative Banner layouts with custom accent colors.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 font-black flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Export Clean PDF</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download a crisp, vector-rendered A4 PDF ready for job applications and HR automated screening.
              </p>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
};
