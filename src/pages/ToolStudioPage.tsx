import { AudioStudioDashboard } from '../components/audio/AudioStudioDashboard';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Mic, 
  Calculator, 
  Image as ImageIcon, 
  Video, 
  Code2, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Zap, 
  ShieldCheck, 
  Search,
  Check,
  Sparkles,
  Eraser,
  Layers
} from 'lucide-react';
import { ALL_TOOLS } from '../data/toolsData';

interface CategoryPortal {
  id: string;
  title: string;
  subtitle: string;
  toolsCount: number;
  tag: string;
  image: string;
  icon: React.FC<{ className?: string }>;
  description: string;
  highlightTools: string[];
  gradient: string;
}

interface ToolStudioPageProps {
  onLaunchAudio?: () => void;
  onLaunchCalculators?: () => void;
  onLaunchPdf?: () => void;
  onLaunchImage?: () => void;
  onLaunchVideo?: () => void;
  onLaunchDeveloper?: () => void;
  onOpenTool?: (toolId: string) => void;
}

export const ToolStudioPage: React.FC<ToolStudioPageProps> = ({ 
  onLaunchAudio, 
  onLaunchCalculators, 
  onLaunchPdf, 
  onLaunchImage, 
  onLaunchVideo,
  onLaunchDeveloper,
  onOpenTool
}) => {
  // Selected category for the "Alag hi duniya" (dedicated portal view)
  const [activeCategoryModal, setActiveCategoryModal] = useState<CategoryPortal | null>(null);
  const [activeStudioView, setActiveStudioView] = useState<{ categoryId: string; initialTool?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  const categoryPortals: CategoryPortal[] = [
    {
      id: 'pdf-tools',
      title: 'PDF & Document Studio',
      subtitle: 'Complete Local Document Suite',
      toolsCount: 12,
      tag: '12 SPECIALIZED TOOLS',
      image: '/portals/pdf-studio.jpg',
      icon: FileText,
      description: 'Merge, split, compress, edit, e-sign, and convert PDF documents to/from Word, Excel, and JPG with 100% client-side privacy.',
      highlightTools: ['PDF Merger', 'Lossless Compressor (-85%)', 'PDF to Word (.docx)', 'E-Sign Pad'],
      gradient: 'from-blue-600/20 to-transparent'
    },
    {
      id: 'audio-tools',
      title: 'Voice AI & Audio Lab',
      subtitle: 'Speech Synthesis & Voice Studio',
      toolsCount: 4,
      tag: '4 AUDIO ENGINES',
      image: '/portals/audio-studio.jpg',
      icon: Mic,
      description: 'Text to Speech (TTS), Speech to Text live transcription, Voice Changer & Studio Recorder, and AI Voice Generator & Cloning.',
      highlightTools: ['Text to Speech', 'Speech to Text', 'Voice Changer & Recorder', 'AI Voice Generator'],
      gradient: 'from-cyan-500/20 to-transparent'
    },
    {
      id: 'calculators',
      title: 'Smart Calculators Studio',
      subtitle: 'Everyday, Financial & Academic Math',
      toolsCount: 14,
      tag: '14 SMART CALCULATORS',
      image: '/portals/calculator-studio.jpg',
      icon: Calculator,
      description: 'Official 2026 Pakistan electricity bill estimator, semester GPA & CGPA forecasting, loan EMI amortization, currency, and scientific math.',
      highlightTools: ['Pakistan Electricity Bill 2026', 'GPA / CGPA 4.0 Tracker', 'Loan & Mortgage EMI', 'Scientific Calc'],
      gradient: 'from-emerald-500/20 to-transparent'
    },
    {
      id: 'image-tools',
      title: 'Image Lab & AI Studio',
      subtitle: 'Photo Optimization & Extraction',
      toolsCount: 10,
      tag: '10 IMAGE WORKSPACES',
      image: '/portals/image-studio.jpg',
      icon: ImageIcon,
      description: '1-click AI background removal, OCR image-to-text scanner, upscaler, lossless compressor, format converter, and color palettes.',
      highlightTools: ['AI Background Remover', 'Image to Text (OCR)', 'Image Compressor (-90%)', 'QR Code Creator'],
      gradient: 'from-purple-500/20 to-transparent'
    },
    {
      id: 'video-tools',
      title: 'Video & Animation Studio',
      subtitle: 'Video Editing & Social Resizing',
      toolsCount: 8,
      tag: '8 VIDEO ENGINES',
      image: '/portals/video-studio.jpg',
      icon: Video,
      description: 'Compress large 4K/1080p videos for WhatsApp, trim clips with millisecond precision, extract MP3 audio, and create animated GIFs.',
      highlightTools: ['Video Compressor', 'GIF Maker & Animator', 'Video to MP3 Converter', 'Subtitle Generator'],
      gradient: 'from-orange-500/20 to-transparent'
    },
    {
      id: 'developer-tools',
      title: 'Developer Studio & Web Auditor',
      subtitle: 'Live SEO Crawl, Types, .env & AI Tokens',
      toolsCount: 4,
      tag: '4 POWER ENGINES',
      image: '/portals/developer-studio.jpg',
      icon: Code2,
      description: 'Live full-website SEO crawl & 3-screen mobile/tablet/desktop simulator, universal JSON to TypeScript/Zod/Pydantic/Go transpiler, .env secret auditor, and AI prompt context optimizer.',
      highlightTools: ['Website Deep Auditor & Mobile Simulator', 'Type & Schema Transpiler', '.env Doctor', 'AI Context Optimizer'],
      gradient: 'from-indigo-500/20 to-transparent'
    },
    {
      id: 'logo-remover',
      title: 'Logo Remover Studio',
      subtitle: 'Watermark, Stamp & Logo Eraser',
      toolsCount: 1,
      tag: 'INPAINTING AI ENGINE',
      image: '/portals/image-studio.jpg',
      icon: Eraser,
      description: 'Erase watermarks, logos, timestamps, and unwanted objects from photos with boundary-weighted inpainting and zero cloud uploads.',
      highlightTools: ['Brush & Box Masking', 'Boundary Inpainting Diffusion', 'Lossless PNG Export', 'Before/After Comparison'],
      gradient: 'from-teal-500/20 to-transparent'
    },
    {
      id: 'cv-creator',
      title: 'CV Creator Studio',
      subtitle: 'ATS-Friendly Resume Architect',
      toolsCount: 1,
      tag: 'ATS EXECUTIVE ARCHITECT',
      image: '/portals/pdf-studio.jpg',
      icon: FileText,
      description: 'Create professional, ATS-optimized executive resumes with real-time live preview, customizable palettes, and 1-click A4 PDF export.',
      highlightTools: ['Modern Executive Layout', 'Minimalist Clean ATS', 'Real-Time A4 Live Preview', '1-Click PDF Download'],
      gradient: 'from-indigo-600/20 to-transparent'
    },
    {
      id: 'image-separator',
      title: 'Image Layer & Icon Separator',
      subtitle: 'Canva-Style Asset Deconstructor',
      toolsCount: 1,
      tag: 'CANVA LAYER STUDIO',
      image: '/portals/image-studio.jpg',
      icon: Layers,
      description: 'Deconstruct flattened images into movable Canva layers. Isolate every icon, badge, and text box into individual transparent PNG assets.',
      highlightTools: ['Computer Vision Segmentation', 'Individual Asset Extractor', 'Canva Drag & Replace', 'Custom Text & Icon Overlay'],
      gradient: 'from-violet-600/20 to-transparent'
    }
  ];

  // Filter calculations
  const filteredPortals = categoryPortals.filter(portal => {
    const matchesCategory = selectedCategoryFilter === 'all' || portal.id === selectedCategoryFilter;
    const matchesSearch = 
      portal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portal.highlightTools.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const matchingTools = searchQuery.trim()
    ? ALL_TOOLS.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (activeStudioView?.categoryId === 'audio-tools') {
    return (
      <AudioStudioDashboard
        initialTool={activeStudioView.initialTool || 'text-to-speech'}
        onBack={() => setActiveStudioView(null)}
      />
    );
  }

  return (
    <div className="bg-white text-[#020f22] font-sans antialiased min-h-screen">
      
      {/* 1. FULL-WIDTH CLEAN, EXPANSIVE & BRIGHT HERO SECTION (ZOOM ENTERPRISE STYLE) */}
      <section className="w-full border-b border-slate-200 bg-gradient-to-b from-sky-50/50 via-white to-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-center">
        
        {/* Subtle Background Photography with Soft Light Overlay */}
        <div className="absolute inset-0 pointer-events-none -z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=2000&q=80" 
            alt="Workspace Texture"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/85 to-white" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          
          {/* Eyebrow Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-all border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#01bbfd] animate-pulse" />
            <span>SIFTX WORKPLACE ECOSYSTEM</span>
          </div>

          {/* Refined Headline (Clear, crisp, perfectly sized) */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#020f22] tracking-tight leading-[1.12]">
              Every tool your workflow needs, in one unified studio
            </h1>
            <p className="text-slate-600 text-base sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto">
              Consolidate your daily tech stack with 6 specialized studios and 62 production-ready tools. 100% private in browser memory — zero cloud uploads and zero subscriptions.
            </p>
          </div>

          {/* Wide Rounded Search Bar */}
          <div className="pt-3 max-w-xl mx-auto">
            <div className="relative flex items-center bg-white rounded-full p-1.5 border border-slate-300 focus-within:border-[#0176fd] focus-within:ring-2 focus-within:ring-[#01bbfd]/30 shadow-lg transition-all">
              <Search className="w-5 h-5 ml-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all 62 tools (e.g. PDF, Bill, TTS, JSON)..."
                className="w-full px-3 py-2.5 text-slate-900 text-sm sm:text-base placeholder-slate-400 focus:outline-none bg-transparent font-medium"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-1 text-xs font-semibold text-slate-500 hover:text-black cursor-pointer"
                >
                  Clear
                </button>
              ) : (
                <button
                  className="px-6 py-2.5 rounded-full siftx-pill-btn font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
                >
                  SEARCH
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills (Zoom Style) */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {[
              { id: 'all', label: 'All 62 Tools' },
              { id: 'pdf-tools', label: 'PDF & Documents (12)' },
              { id: 'audio-tools', label: 'Voice AI (4)' },
              { id: 'calculators', label: 'Calculators (14)' },
              { id: 'image-tools', label: 'Image Lab (10)' },
              { id: 'video-tools', label: 'Video Studio (8)' },
              { id: 'developer-tools', label: 'Dev Studio (4)' },
            ].map((tab) => {
              const active = selectedCategoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategoryFilter(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'siftx-pill-btn shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Trust Badges */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>6 Dedicated Studios</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Client-Side Privacy</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#01bbfd] shrink-0" />
              <span>Instant Local Speed</span>
            </span>
          </div>

        </div>

        {/* Bottom Section Divider */}
        <div className="relative z-10 pt-10 flex flex-col items-center gap-2 text-slate-400">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-500">
            SELECT A STUDIO TO ENTER
          </span>
          <div className="w-10 h-1 bg-gradient-to-r from-[#01bbfd] via-[#0176fd] to-[#003ff8] rounded-full" />
        </div>

      </section>

      {/* INSTANT SEARCH TOOL MATCHES */}
      {matchingTools.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="bg-sky-50/70 border border-sky-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>Direct Tool Results ({matchingTools.length})</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#01bbfd]/20 text-[#0176fd] text-xs font-mono font-bold">
                  Instant Match
                </span>
              </h3>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-slate-500 hover:text-black cursor-pointer"
              >
                Clear Search
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchingTools.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onOpenTool ? onOpenTool(t.id) : null}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#0176fd] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#0176fd]">
                        {t.mainCategory.replace('-tools', '')}
                      </span>
                      {t.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-100 rounded text-slate-600 font-semibold">
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0176fd] transition-colors">
                      {t.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {t.tagline}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Private</span>
                    </span>
                    <button
                      className="px-3.5 py-1 rounded-full siftx-pill-btn font-extrabold text-xs flex items-center gap-1 shadow-2xs group-hover:shadow-sm"
                    >
                      <span>Launch</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. THE EXACT 6 BARE BARE CARDS IN 2-COLUMN LAYOUT (2 in row 1, 2 in row 2, 2 in row 3) */}
      <section className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {filteredPortals.map((portal, index) => {
            const Icon = portal.icon;

            return (
              <motion.div
                key={portal.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xl hover:shadow-2xl hover:border-[#0176fd] hover:shadow-[#0176fd]/15 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                onClick={() => {
                  if (portal.id === 'audio-tools') {
                    if (onLaunchAudio) {
                      onLaunchAudio();
                      return;
                    }
                    setActiveStudioView({ categoryId: 'audio-tools', initialTool: 'text-to-speech' });
                  } else if (portal.id === 'pdf-tools') {
                    if (onLaunchPdf) {
                      onLaunchPdf();
                      return;
                    }
                  } else if (portal.id === 'calculators') {
                    if (onLaunchCalculators) {
                      onLaunchCalculators();
                      return;
                    }
                  } else if (portal.id === 'image-tools') {
                    if (onLaunchImage) {
                      onLaunchImage();
                      return;
                    }
                  } else if (portal.id === 'video-tools') {
                    if (onLaunchVideo) {
                      onLaunchVideo();
                      return;
                    }
                  } else if (portal.id === 'developer-tools') {
                    if (onLaunchDeveloper) {
                      onLaunchDeveloper();
                      return;
                    }
                  } else if (portal.id === 'logo-remover') {
                    if (onOpenTool) {
                      onOpenTool('logo-remover');
                      return;
                    }
                  } else if (portal.id === 'cv-creator') {
                    if (onOpenTool) {
                      onOpenTool('cv-creator');
                      return;
                    }
                  } else if (portal.id === 'image-separator') {
                    if (onOpenTool) {
                      onOpenTool('image-separator');
                      return;
                    }
                  } else {
                    setActiveCategoryModal(portal);
                  }
                }}
              >
                {/* BARI COVER IMAGE WITH OVERLAY BADGES */}
                <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-slate-900">
                  <img 
                    src={portal.image} 
                    alt={portal.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-95 group-hover:opacity-100" 
                  />

                  {/* Subtle Gradient Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#020f22]/80 backdrop-blur-md text-[#01bbfd] font-mono font-bold text-[11px] tracking-wider uppercase border border-[#01bbfd]/30 shadow-xs">
                      {portal.tag}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md text-[#0176fd] flex items-center justify-center shadow-md">
                      <Icon className="w-5 h-5 text-[#0176fd]" />
                    </div>
                  </div>

                  {/* Bottom Image Title */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[11px] font-mono text-[#01bbfd] font-bold uppercase tracking-wider">
                      {portal.subtitle}
                    </p>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
                      {portal.title}
                    </h3>
                  </div>
                </div>

                {/* CARD BODY: THORA INTRODUCTION + KEY TOOLS */}
                <div className="p-7 space-y-5 flex-1 flex flex-col justify-between">
                  
                  {/* Introduction Paragraph */}
                  <p className="text-slate-600 text-sm leading-relaxed font-normal">
                    {portal.description}
                  </p>

                  {/* Highlighted Tools Pills */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Featured Inside:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {portal.highlightTools.map((tool, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold group-hover:bg-sky-50 group-hover:text-[#0176fd] transition-colors"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Free & Private</span>
                    </span>

                    <button
                      className="px-5 py-2.5 rounded-full siftx-pill-btn font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Enter Studio</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                </div>

              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. ZOOM-STYLE 3-STEP INTEGRATION ARCHITECTURE */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold font-mono tracking-wider text-[#0176fd] uppercase bg-sky-100/70 px-3.5 py-1 rounded-full border border-sky-200">
              SIMPLIFIED WORKFLOW PIPELINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#020f22] tracking-tight">
              How work gets done inside SiftX Workplace
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Experience the speed of client-side computing in three seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-5 relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#01bbfd] to-[#0176fd] text-white flex items-center justify-center font-extrabold text-lg shadow-md">
                01
              </div>
              <h3 className="text-xl font-extrabold text-[#020f22]">Select Your Utility</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Choose from 62 purpose-built engines across document manipulation, voice transcription, media optimization, or financial calculations without signing up.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#0176fd]">
                <span>No software install required</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 border border-[#0176fd]/40 shadow-md hover:shadow-xl transition-all space-y-5 relative">
              <div className="w-12 h-12 rounded-2xl bg-[#020f22] text-[#01bbfd] flex items-center justify-center font-extrabold text-lg shadow-md">
                02
              </div>
              <h3 className="text-xl font-extrabold text-[#020f22]">Local WASM Processing</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                WebAssembly and multi-threaded background workers compile and process your file in local device RAM with zero server latency and 100% airtight privacy.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero bytes sent to cloud</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-5 relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#01bbfd] to-[#003ff8] text-white flex items-center justify-center font-extrabold text-lg shadow-md">
                03
              </div>
              <h3 className="text-xl font-extrabold text-[#020f22]">Instant Lossless Export</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Save your high-resolution output files, documents, trimmed clips, or calculated spreadsheets instantly to your local disk with zero watermarks or download speed throttling.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#0176fd]">
                <span>Direct disk write speed</span>
                <Check className="w-4 h-4" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. CLEAN BOTTOM CALLOUT (FOCUSED 100% ON TOOLS) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#020f22] text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#01bbfd]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#01bbfd]/20 border border-[#01bbfd] text-[#01bbfd] text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#01bbfd]" />
            <span>62 PRODUCTION ENGINES READY</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Select any studio above to begin your workflow
          </h2>

          <p className="text-white/75 text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-normal">
            No signup barriers, no subscription paywalls, and zero file upload limits.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
              className="px-8 py-3.5 rounded-full siftx-pill-btn font-extrabold text-sm shadow-xl shadow-[#0176fd]/30 transition-all cursor-pointer"
            >
              Browse Studios
            </button>
          </div>
        </div>
      </section>

      {/* 5. DEDICATED CATEGORY WORKSPACE MODAL ("ALAG HI DUNIYA") */}
      <AnimatePresence>
        {activeCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => setActiveCategoryModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Modal Banner Header */}
              <div className="relative h-48 sm:h-56 bg-slate-950 overflow-hidden p-6 sm:p-10 flex flex-col justify-between">
                <img 
                  src={activeCategoryModal.image} 
                  alt={activeCategoryModal.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xs"
                />
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3.5 py-1.5 rounded-full siftx-pill-btn font-mono font-bold text-xs uppercase tracking-wider shadow-sm">
                    {activeCategoryModal.tag}
                  </span>
                  
                  <button 
                    onClick={() => setActiveCategoryModal(null)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative z-10 space-y-1">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {activeCategoryModal.title}
                  </h2>
                  <p className="text-sm text-white/80 max-w-2xl font-normal">
                    {activeCategoryModal.description}
                  </p>
                </div>
              </div>

              {/* Modal Tools List ("Alag Hi Duniya" of this category) */}
              <div className="p-6 sm:p-10 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-lg font-extrabold text-[#020f22]">
                    Available Tools in this Studio
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    Running locally via WebAssembly
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ALL_TOOLS.filter(t => t.mainCategory === activeCategoryModal.id).map((tool) => (
                    <div 
                      key={tool.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#0176fd] hover:bg-white hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {tool.subCategory}
                          </span>
                          {tool.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-[#01bbfd]/15 text-[#0176fd] font-bold text-[9px] border border-[#01bbfd]/30">
                              {tool.badge}
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-base text-[#020f22] group-hover:text-[#0176fd] transition-colors">
                          {tool.name}
                        </h4>

                        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {tool.tagline}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-mono text-slate-400">
                          {tool.folderName}
                        </span>
                        
                        <button
                          onClick={() => {
                            setActiveCategoryModal(null);
                            if (onOpenTool) {
                              onOpenTool(tool.id);
                              return;
                            }
                            if (activeCategoryModal.id === 'audio-tools') {
                              if (onLaunchAudio) onLaunchAudio();
                            } else if (activeCategoryModal.id === 'pdf-tools') {
                              if (onLaunchPdf) onLaunchPdf();
                            } else if (activeCategoryModal.id === 'calculators') {
                              if (onLaunchCalculators) onLaunchCalculators();
                            } else if (activeCategoryModal.id === 'image-tools') {
                              if (onLaunchImage) onLaunchImage();
                            } else if (activeCategoryModal.id === 'video-tools') {
                              if (onLaunchVideo) onLaunchVideo();
                            } else if (activeCategoryModal.id === 'developer-tools') {
                              if (onLaunchDeveloper) onLaunchDeveloper();
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-full siftx-pill-btn font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Zero Server Logs</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Zap className="w-4 h-4 text-[#01bbfd]" />
                    <span>Instant Execution</span>
                  </span>
                </div>

                <button
                  onClick={() => setActiveCategoryModal(null)}
                  className="px-5 py-2 rounded-full bg-white border border-slate-300 font-bold text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Close Studio
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
