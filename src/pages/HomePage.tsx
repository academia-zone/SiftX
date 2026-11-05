import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Calculator, 
  Mic, 
  Code2, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  ChevronDown, 
  Star, 
  Zap,
} from 'lucide-react';

// Interactive Scroll-Driven Feature Story (Animates on scroll down, rewinds on scroll up)
interface ScrollStoryProps {
  badge: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
  ctaText: string;
  onCtaClick: () => void;
  features: string[];
}

const ScrollStoryCard: React.FC<ScrollStoryProps> = ({
  badge,
  title,
  description,
  image,
  imageAlt,
  reverse = false,
  ctaText,
  onCtaClick,
  features
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 85%', 'end 20%']
  });

  // Dynamic transforms directly linked to scroll progress (rewinds automatically when scrolling up)
  const imageScale = useTransform(scrollYProgress, [0, 0.45, 0.9], [0.85, 1.03, 1]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.25], [0.3, 1]);
  const imageRotate = useTransform(scrollYProgress, [0, 0.5], [reverse ? -2.5 : 2.5, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.35], [50, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const bulletY = useTransform(scrollYProgress, [0.15, 0.45], [40, 0]);
  const bulletOpacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);

  return (
    <div ref={containerRef} className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Animated Image Column */}
        <motion.div 
          style={{ 
            scale: imageScale, 
            opacity: imageOpacity, 
            rotate: imageRotate 
          }}
          className={`lg:col-span-6 ${reverse ? 'lg:order-2' : 'lg:order-1'}`}
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group bg-slate-100">
            <img 
              src={image} 
              alt={imageAlt} 
              className="w-full h-80 sm:h-[440px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Live Interactive Badge Overlay */}
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/50 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#01bbfd] animate-pulse" />
                <span className="text-xs font-bold text-slate-800">Local Client-Side Engine</span>
              </div>
              <span className="text-[11px] font-mono font-bold bg-[#01bbfd]/20 text-slate-900 px-2.5 py-0.5 rounded-full border border-[#01bbfd]">
                0 KB Cloud
              </span>
            </div>
          </div>
        </motion.div>

        {/* Animated Text Column */}
        <motion.div 
          style={{ y: textY, opacity: textOpacity }}
          className={`lg:col-span-6 space-y-6 text-left ${reverse ? 'lg:order-1' : 'lg:order-2'}`}
        >
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200">
            {badge}
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#020f22] tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            {description}
          </p>

          <motion.ul 
            style={{ y: bulletY, opacity: bulletOpacity }}
            className="space-y-3 pt-2"
          >
            {features.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-black fill-[#01bbfd] shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </motion.ul>

          <div className="pt-2 flex items-center gap-4">
            <button 
              onClick={onCtaClick}
              className="px-7 py-3.5 rounded-full siftx-pill-btn font-extrabold text-sm shadow-md cursor-pointer transition-all"
            >
              {ctaText}
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

interface HomePageProps {
  onNavigateToStudio: () => void;
  onNavigateToAbout: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToStudio,
  onNavigateToAbout: _onNavigateToAbout
}) => {
  const [activeRibbon, setActiveRibbon] = useState<'ai' | 'pdf' | 'calc' | 'media' | 'dev'>('ai');
  const [openHomeFaq, setOpenHomeFaq] = useState<number | null>(0);

  const ribbonItems = [
    { id: 'ai', label: 'AI Companion', icon: Sparkles },
    { id: 'pdf', label: 'Docs & PDF', icon: FileText },
    { id: 'calc', label: 'Calculators', icon: Calculator },
    { id: 'media', label: 'Audio & Voice', icon: Mic },
    { id: 'dev', label: 'Developer Hub', icon: Code2 }
  ];

  // Auto-switch tabs every 5 seconds like Zoom
  useEffect(() => {
    const ribbonIds: Array<'ai' | 'pdf' | 'calc' | 'media' | 'dev'> = ['ai', 'pdf', 'calc', 'media', 'dev'];
    const interval = setInterval(() => {
      setActiveRibbon((prev) => {
        const nextIdx = (ribbonIds.indexOf(prev) + 1) % ribbonIds.length;
        return ribbonIds[nextIdx];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Zoom-style Auto-Moving Horizontal Feature Tools with rich images
  const movingTools = [
    {
      id: 'pdf-merger',
      tag: 'PDF & DOCS',
      title: 'PDF Studio & Merger',
      desc: 'Merge, split, compress, and convert Word to PDF in 1 click.',
      image: '/portals/pdf-studio.jpg',
      badge: 'Popular'
    },
    {
      id: 'electricity-bill',
      tag: 'SMART CALCULATOR',
      title: 'Electricity Bill Estimator',
      desc: 'Pakistan tariff slabs, protected users, GST & fuel adjustment.',
      image: '/portals/calculator-studio.jpg',
      badge: 'Pakistan 2026'
    },
    {
      id: 'speech-to-text',
      tag: 'AI VOICE LAB',
      title: 'Speech to Text (STT)',
      desc: 'Live audio & meeting transcription with timestamped exports.',
      image: '/portals/audio-studio.jpg',
      badge: 'AI Powered'
    },
    {
      id: 'bg-remove',
      tag: 'IMAGE LAB',
      title: 'Background Remover',
      desc: 'Instant 1-click subject extraction with 100% private offline WASM.',
      image: '/portals/image-studio.jpg',
      badge: 'High Precision'
    },
    {
      id: 'gpa-calc',
      tag: 'ACADEMIC',
      title: 'GPA & CGPA Calculator',
      desc: 'Calculate university semester GPAs and predict cumulative honors.',
      image: '/portals/calculator-studio.jpg',
      badge: 'Students'
    },
    {
      id: 'video-compress',
      tag: 'VIDEO SUITE',
      title: 'Video Compressor & GIF',
      desc: 'Compress large MP4s and make animated GIFs without quality loss.',
      image: '/portals/video-studio.jpg',
      badge: 'Zero Limit'
    },
    {
      id: 'json-format',
      tag: 'DEV TOOLS',
      title: 'JSON & Code Formatter',
      desc: 'Prettify JSON, minify CSS/JS, and validate schemas instantly.',
      image: '/portals/developer-studio.jpg',
      badge: 'Dev Suite'
    },
    {
      id: 'voice-gen',
      tag: 'VOICE AI',
      title: 'AI Voice Generator (TTS)',
      desc: 'Turn scripts, articles, and notes into natural studio voices.',
      image: '/portals/audio-studio.jpg',
      badge: 'Multilingual'
    }
  ];

  return (
    <div className="bg-white text-[#020f22] font-sans antialiased selection:bg-[#01bbfd] selection:text-black">
      
      {/* 1. ZOOM'S TOP NOTICE ANNOUNCEMENT BAR */}
      <div className="bg-[#020f22] text-white text-xs sm:text-sm py-2.5 px-4 text-center flex items-center justify-center gap-2 border-b border-white/10">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#01bbfd] text-black font-extrabold text-[10px] tracking-wider uppercase">
          NEW
        </span>
        <span className="text-white/90">
          Meet SiftX Tool Workplace: All-in-one platform for daily documents, calculations & media.
        </span>
        <button 
          onClick={onNavigateToStudio}
          className="text-[#01bbfd] font-bold hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer"
        >
          <span>Explore Platform</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. ZOOM'S CLEAN ENTERPRISE HERO SECTION WITH BACKGROUND IMAGE */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-20 px-4 text-center border-b border-slate-100">
        
        {/* Full-width Hero Background Image & Atmospheric Blue Glow */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2400&q=85" 
            alt="Hero Background"
            className="w-full h-full object-cover object-center opacity-25" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/85 to-white" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-[#01bbfd]/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto space-y-7 relative">
          {/* Eyebrow Pill Badge (Zoom style) */}
          <div 
            onClick={onNavigateToStudio}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 hover:bg-slate-100/90 transition-all border border-slate-200 text-[#020f22] text-xs sm:text-sm font-semibold shadow-2xs cursor-pointer group backdrop-blur-sm"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#01bbfd] animate-pulse" />
            <span className="font-roman italic text-slate-700">One platform to connect, solve, and create</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Refined Roman Editorial Headline (Not thick/motta, perfectly proportioned) */}
          <h1 className="font-roman text-4xl sm:text-6xl lg:text-[68px] font-semibold text-[#020f22] tracking-tight leading-[1.12] max-w-5xl mx-auto">
            One platform for all your <span className="italic font-normal text-[#0176fd]">everyday tools</span>
          </h1>

        {/* Subtitle */}
        <p className="text-slate-600 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
          Streamline daily tasks, convert documents, calculate bills and taxes, edit media, and code with 62+ fast, privacy-first tools — all with AI built directly in.
        </p>

        {/* Dual Action Buttons (Zoom Style) */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onNavigateToStudio}
            className="px-8 py-4 rounded-full siftx-pill-btn font-extrabold text-base shadow-lg shadow-[#0176fd]/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Get Started, It's Free</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('zoom-ribbon-stage');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base transition-all cursor-pointer border border-slate-300 shadow-2xs hover:border-slate-400"
          >
            <span>Explore All 62 Tools</span>
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No credit card required</span>
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

        {/* ZOOM'S ICONIC CURVED PRODUCT SHOWCASE / 80-FRAMES VIDEO PLAYER (WITH FLOATING PRODUCT CARDS) */}
        <div className="pt-6 max-w-6xl mx-auto relative">

          {/* Left Floating Product Card with Image */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
            className="hidden xl:flex absolute -left-14 top-1/4 z-20 items-center gap-3 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl max-w-xs text-left"
          >
            <img 
              src="/portals/bento-documents.jpg" 
              alt="PDF doc preview" 
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-xs shrink-0" 
            />
            <div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[9px] tracking-wider uppercase">
                PDF E-SIGNED
              </span>
              <p className="font-extrabold text-xs text-slate-900 mt-0.5 line-clamp-1">Financial_Audit.pdf</p>
              <p className="text-[10px] text-slate-500 font-medium">2.4 MB (Compressed -82%)</p>
            </div>
          </motion.div>

          {/* Right Floating Product Card with Image */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            className="hidden xl:flex absolute -right-14 bottom-1/4 z-20 items-center gap-3 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl max-w-xs text-left"
          >
            <img 
              src="/portals/bento-calculators.jpg" 
              alt="Electricity bill preview" 
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-xs shrink-0" 
            />
            <div>
              <span className="px-2 py-0.5 rounded-full bg-[#01bbfd]/20 text-slate-900 font-extrabold text-[9px] tracking-wider uppercase border border-[#01bbfd]/40">
                SMART CALCULATOR
              </span>
              <p className="font-extrabold text-xs text-slate-900 mt-0.5">Electricity Bill: Rs 14,820</p>
              <p className="text-[10px] text-slate-500 font-medium">340 kWh · IESCO Tariff</p>
            </div>
          </motion.div>

          <div className="relative rounded-3xl bg-white p-2.5 sm:p-4 shadow-2xl shadow-slate-300/50 border border-slate-200 overflow-hidden">
            
            {/* Top Browser Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="ml-3 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>https://siftxtool.app/workspace</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Studio Preview</span>
                </span>
              </div>
            </div>

            {/* Native High-Performance HTML5 Video Stream */}
            <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-100 shadow-inner group">
              <video
                autoPlay
                loop
                muted
                playsInline
                poster="/hero-poster.png"
                className="w-full h-full object-cover block"
              >
                <source src="/hero-preview.webm" type="video/webm" />
                <source src="/hero-preview.mp4" type="video/mp4" />
              </video>
            </div>

          </div>
        </div>

        </div>
      </section>

      {/* 2.5 ZOOM'S AUTO-MOVING HORIZONTAL FEATURE SHOWCASE (MOVES AUTOMATICALLY) */}
      <section className="py-12 bg-white overflow-hidden border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[#020f22] text-xs font-bold font-mono tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-[#01bbfd] animate-ping" />
            <span>CORE EVERYDAY TOOLS · LIVE AUTO-SHOWCASE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#020f22] tracking-tight">
            Explore 71+ Problem-Solving Utilities
          </h2>
          <p className="text-sm text-slate-500 font-normal">
            Hover over any tool card to pause and explore features in real-time.
          </p>
        </div>

        {/* The Continuous Infinite Auto-Moving Marquee Track */}
        <div className="relative w-full overflow-hidden">
          {/* Subtle gradient fades on left and right */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee flex gap-6 py-4 cursor-pointer">
            {[...movingTools, ...movingTools].map((tool, idx) => (
              <div
                key={`${tool.id}-${idx}`}
                onClick={onNavigateToStudio}
                className="w-72 sm:w-80 rounded-2xl bg-white border border-slate-200 hover:border-[#020f22] hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between shrink-0 group hover:-translate-y-1.5"
              >
                {/* Big Image Preview */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={tool.image}
                    alt={tool.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[#01bbfd] font-mono font-bold text-[10px] tracking-wider uppercase border border-white/10">
                      {tool.tag}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-full bg-[#01bbfd] text-black font-extrabold text-[10px] shadow-sm">
                      {tool.badge}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-2 text-left">
                  <h3 className="font-extrabold text-base text-[#020f22] group-hover:text-[#0176fd] transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium text-[11px]">Free & Local WASM</span>
                  <span className="font-bold text-[#020f22] group-hover:text-[#0176fd] inline-flex items-center gap-1 group-hover:translate-x-1 transition-all">
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#01bbfd]" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ZOOM'S METRICS & SOCIAL PROOF RIBBON */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            TRUSTED BY MODERN TEAMS, STUDENTS & HOUSEHOLDS WORLDWIDE
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center pt-2">
            <div>
              <p className="text-3xl sm:text-5xl font-extrabold text-[#020f22]">71+</p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Built-in Daily Tools</p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-extrabold text-[#020f22]">100%</p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Free Forever (No Paywalls)</p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-extrabold text-[#020f22]">0 KB</p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Cloud Data Retention</p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-extrabold text-[#020f22]">0.0s</p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Instant Client-Side Speed</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ZOOM'S SIGNATURE INTERACTIVE PRODUCT SUITE RIBBON & BIG IMAGE STAGE */}
      <section id="zoom-ribbon-stage" className="max-w-7xl mx-auto px-4 py-20 space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#020f22] tracking-tight">
            A modern platform for all the ways you work
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Whether preparing assignments, computing utility bills, editing contracts, or processing media — SiftX Tool connects your workflow seamlessly.
          </p>
        </div>

        {/* Zoom's Signature Horizontal Ribbon Bar */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
          {ribbonItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeRibbon === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveRibbon(item.id as any)}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#020f22] text-white shadow-md'
                    : 'text-slate-700 hover:text-black hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#01bbfd]' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Zoom's Expansive Interactive Stage with BIG IMAGE Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center p-8 sm:p-14 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
          
          {/* Left Details Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#01bbfd] text-black">
              {activeRibbon.toUpperCase()} WORKSPACE
            </span>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#020f22] tracking-tight leading-tight">
              {activeRibbon === 'ai' && 'AI-Powered Daily Automation'}
              {activeRibbon === 'pdf' && 'Complete PDF & Document Studio'}
              {activeRibbon === 'calc' && 'Smart Everyday & Academic Calculators'}
              {activeRibbon === 'media' && 'AI Audio & Speech Workstation'}
              {activeRibbon === 'dev' && 'Developer & SEO Utilities'}
            </h3>

            <p className="text-slate-600 text-base leading-relaxed font-normal">
              {activeRibbon === 'ai' && 'Accelerate daily productivity with automated speech transcription, OCR text recognition, and background removal — all running privately in your browser memory.'}
              {activeRibbon === 'pdf' && 'Compress file size by 80%, convert two-way with Microsoft Word, add digital signatures, and reorder pages without third-party cloud uploads.'}
              {activeRibbon === 'calc' && 'Estimate Pakistan electricity bills with protected/unprotected kWh slabs, compute university GPAs, and project loan EMIs with amortization schedules.'}
              {activeRibbon === 'media' && 'Convert text to natural speech, trim audio ringtones, cut videos, and generate animated GIFs directly on your device.'}
              {activeRibbon === 'dev' && 'Format messy JSON, clean HTML, minify CSS/JS bundles, and generate cryptographically secure passwords and UUID identifiers.'}
            </p>

            <ul className="space-y-3 pt-2">
              <li className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-black fill-[#01bbfd] shrink-0" />
                <span>100% Free with zero credit card requirements</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-black fill-[#01bbfd] shrink-0" />
                <span>Runs client-side with complete offline privacy</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-black fill-[#01bbfd] shrink-0" />
                <span>Zero file size limits or artificial paywalls</span>
              </li>
            </ul>

            <div className="pt-4">
              <button
                onClick={onNavigateToStudio}
                className="px-8 py-4 rounded-full bg-[#020f22] hover:bg-[#020f22]/90 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch {activeRibbon.toUpperCase()} Suite</span>
                <ArrowRight className="w-4 h-4 text-[#01bbfd]" />
              </button>
            </div>
          </div>

          {/* Right EXPANSIVE PRODUCT UI IMAGE / MOCKUP SHOWCASE */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
              
              {/* TAB 1: AI COMPANION UI */}
              {activeRibbon === 'ai' && (
                <div className="p-6 bg-slate-900 text-white space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs font-mono text-white/60 ml-2">siftxtool://ai-companion</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#01bbfd] text-black font-bold text-[10px]">
                      AI ACTIVE
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <p className="text-[11px] font-mono text-[#01bbfd] uppercase tracking-wider font-bold">User Prompt</p>
                    <p className="text-xs text-white/90">"Summarize meeting audio, format key action items, and calculate electricity expense."</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/10 border border-[#01bbfd]/40 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#01bbfd]">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Companion Response</span>
                    </div>
                    <ul className="text-xs space-y-1.5 text-white/80">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#01bbfd]" />
                        <span>Transcribed 14 minutes of Urdu & English speech with 99.2% accuracy.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#01bbfd]" />
                        <span>Calculated 320 kWh bill: Rs 14,820 (includes fuel adjustment).</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#01bbfd]" />
                        <span>Generated clean PDF summary report ready for download.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-[11px] text-white/60">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Processed in 0.4 seconds (Client-Side)</span>
                    </div>
                    <button 
                      onClick={onNavigateToStudio}
                      className="px-4 py-1.5 rounded-full bg-[#01bbfd] text-black font-bold text-xs hover:bg-[#01bbfd]/90 transition-all cursor-pointer"
                    >
                      Try AI Now
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PDF & DOCUMENT STUDIO UI */}
              {activeRibbon === 'pdf' && (
                <div className="p-6 bg-slate-50 text-slate-900 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-500" />
                      <span className="text-xs font-bold text-slate-800">Quarterly_Financial_Report.pdf</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                      Compressed -82%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                      <p className="text-[10px] text-slate-500 font-bold">Original Size</p>
                      <p className="text-sm font-extrabold text-slate-800">14.2 MB</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#01bbfd]/15 border border-[#01bbfd] text-center shadow-xs">
                      <p className="text-[10px] text-black font-bold">Compressed Size</p>
                      <p className="text-sm font-extrabold text-black">2.5 MB</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                      <p className="text-[10px] text-slate-500 font-bold">Pages</p>
                      <p className="text-sm font-extrabold text-slate-800">28 Pages</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-slate-700">Digital Signature & Stamp Verified</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#01bbfd] bg-black px-2 py-0.5 rounded">
                      E-SIGNED
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">100% Client-Side WebAssembly</span>
                    <button 
                      onClick={onNavigateToStudio}
                      className="px-4 py-1.5 rounded-full bg-[#020f22] text-white font-bold text-xs hover:bg-black transition-all cursor-pointer"
                    >
                      Open PDF Tools
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: CALCULATORS UI */}
              {activeRibbon === 'calc' && (
                <div className="p-6 bg-slate-900 text-white space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-[#01bbfd]" />
                      <span className="text-xs font-bold text-white">Electricity Bill Estimator (Pakistan)</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#01bbfd] text-black font-bold text-[10px]">
                      LIVE TARIFF 2026
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-[10px] text-white/50">Units Consumed</p>
                      <p className="text-lg font-bold text-white">340 kWh</p>
                      <p className="text-[10px] text-amber-400">Non-Protected Slab</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-[10px] text-white/50">Est. Total Bill</p>
                      <p className="text-lg font-bold text-[#01bbfd]">Rs 16,450</p>
                      <p className="text-[10px] text-white/60">Includes GST & FPA</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-xs text-white/80">
                    <div className="flex justify-between">
                      <span className="text-white/60">Base Energy Cost:</span>
                      <span className="font-mono">Rs 11,220</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Fuel Charges Adjustment (FPA):</span>
                      <span className="font-mono">Rs 2,380</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Govt Taxes & Surcharges:</span>
                      <span className="font-mono">Rs 2,850</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-white/50">IESCO / LESCO / KE Compatible</span>
                    <button 
                      onClick={onNavigateToStudio}
                      className="px-4 py-1.5 rounded-full bg-[#01bbfd] text-black font-bold text-xs hover:bg-[#01bbfd]/90 transition-all cursor-pointer"
                    >
                      Calculate Your Bill
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIO & VOICE UI */}
              {activeRibbon === 'media' && (
                <div className="p-6 bg-slate-50 text-slate-900 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-[#01bbfd]" />
                      <span className="text-xs font-bold text-slate-800">Voice AI & Transcription Studio</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-300">
                      RECORDING ACTIVE
                    </span>
                  </div>

                  {/* Audio Waveform visualization */}
                  <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-1.5 h-20 px-6">
                    {[35, 60, 20, 85, 45, 95, 30, 75, 50, 100, 40, 65, 80, 25, 90, 45, 70, 30, 85, 55].map((h, i) => (
                      <div 
                        key={i} 
                        style={{ height: `${h}%` }} 
                        className="w-1.5 bg-[#01bbfd] rounded-full animate-pulse" 
                      />
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Live Transcribed Text:</p>
                    <p className="font-medium text-slate-800 italic">"Welcome to SiftX Tool. All voice processing happens locally on your computer with zero cloud delays."</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">Supports WAV, MP3, AAC, FLAC</span>
                    <button 
                      onClick={onNavigateToStudio}
                      className="px-4 py-1.5 rounded-full bg-[#020f22] text-white font-bold text-xs hover:bg-black transition-all cursor-pointer"
                    >
                      Start Voice AI
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: DEVELOPER HUB UI */}
              {activeRibbon === 'dev' && (
                <div className="p-6 bg-slate-950 text-white font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#01bbfd]" />
                      <span className="text-xs text-white/90">package.json — JSON Formatter</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      VALID JSON
                    </span>
                  </div>

                  <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
{`{
  "name": "universal-toolkit",
  "tools": 71,
  "privacy": "100% Client-Side",
  "speed": "0.0s",
  "features": ["PDF", "Calculators", "VoiceAI"]
}`}
                  </pre>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-white/50 font-sans">Minify, Prettify, Validate in 1-Click</span>
                    <button 
                      onClick={onNavigateToStudio}
                      className="px-4 py-1.5 rounded-full bg-[#01bbfd] text-black font-sans font-bold text-xs hover:bg-[#01bbfd]/90 transition-all cursor-pointer"
                    >
                      Format Code
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </section>

      {/* 5. ZOOM'S TWO-COLUMN FEATURE STORIES (INTERACTIVE SCROLL-DRIVEN REVEAL & REWIND) */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        
        {/* Story 1: Document Productivity */}
        <ScrollStoryCard
          badge="COLLABORATIVE DOCUMENT SUITE"
          title="Turn hours of document work into seconds"
          description="Merge PDFs, split multi-page reports, compress bloated attachments, and convert between Microsoft Office formats in one click — with absolute privacy guaranteed."
          image="/portals/pdf-studio.jpg"
          imageAlt="Team collaborating on documents"
          ctaText="Explore PDF Tools"
          onCtaClick={onNavigateToStudio}
          features={[
            "100% Client-side local compression (up to 85% file shrink)",
            "Two-way Microsoft Word, Excel & JPG converters",
            "Cryptographic digital signature and tamper verification"
          ]}
        />

        {/* Story 2: AI Companion Integration */}
        <ScrollStoryCard
          badge="AI-FIRST PRODUCTIVITY"
          title="AI Companion that works where you work"
          description="From transcribing voice notes and converting text to speech, to estimating complex utility bills and optimizing images — AI Companion simplifies every routine task."
          image="/portals/developer-studio.jpg"
          imageAlt="AI Workplace in action"
          reverse={true}
          ctaText="Discover AI Companion"
          onCtaClick={onNavigateToStudio}
          features={[
            "Multilingual speech recognition with 99.2% accuracy",
            "Instant Pakistan electricity bill & fuel adjustment calculator",
            "Automatic meeting action item extractor and PDF report exporter"
          ]}
        />

      </section>

      {/* 6. ZOOM'S BENTO GRID ("HOW WORK GETS DONE ACROSS TOOL STUDIO") */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 px-3.5 py-1 rounded-full border border-slate-200">
            Workplace Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#020f22] tracking-tight">
            How work gets done across SiftX Tool
          </h2>
          <p className="text-base text-slate-600 font-normal">
            An ecosystem built to replace multiple expensive individual tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden hover:border-[#020f22] hover:shadow-xl transition-all group flex flex-col justify-between">
            <img 
              src="/portals/bento-documents.jpg" 
              alt="Document Workflows" 
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="p-8 space-y-4">
              <h3 className="text-2xl font-bold text-[#020f22]">Document Workflows</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Merge, compress, edit, annotate, and convert PDFs without monthly fees or page limits.
              </p>
              <div 
                onClick={onNavigateToStudio}
                className="pt-2 text-sm font-bold text-slate-900 flex items-center gap-1.5 cursor-pointer hover:underline"
              >
                <span>Explore Documents</span>
                <ChevronRight className="w-4 h-4 text-[#01bbfd]" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden hover:border-[#020f22] hover:shadow-xl transition-all group flex flex-col justify-between">
            <img 
              src="/portals/bento-calculators.jpg" 
              alt="Everyday Calculations" 
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="p-8 space-y-4">
              <h3 className="text-2xl font-bold text-[#020f22]">Everyday Calculations</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Calculate electricity bills, semester GPAs, loans, exact age, and fuel expenses in 1 click.
              </p>
              <div 
                onClick={onNavigateToStudio}
                className="pt-2 text-sm font-bold text-slate-900 flex items-center gap-1.5 cursor-pointer hover:underline"
              >
                <span>Explore Calculators</span>
                <ChevronRight className="w-4 h-4 text-[#01bbfd]" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden hover:border-[#020f22] hover:shadow-xl transition-all group flex flex-col justify-between">
            <img 
              src="/portals/bento-media.jpg" 
              alt="Media & Voice Lab" 
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="p-8 space-y-4">
              <h3 className="text-2xl font-bold text-[#020f22]">Media & Voice Lab</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Generate speech, transcribe audio recordings, remove photo backgrounds, and crop images.
              </p>
              <div 
                onClick={onNavigateToStudio}
                className="pt-2 text-sm font-bold text-slate-900 flex items-center gap-1.5 cursor-pointer hover:underline"
              >
                <span>Explore Media Tools</span>
                <ChevronRight className="w-4 h-4 text-[#01bbfd]" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. ZOOM'S 3-COLUMN CUSTOMER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold font-mono tracking-wider text-[#0176fd] uppercase bg-sky-100/70 px-3.5 py-1 rounded-full border border-sky-200">
            CUSTOMER TESTIMONIALS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#020f22] tracking-tight">
            Loved by 300,000+ professionals worldwide
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            See how teams ditch expensive legacy subscriptions for local SiftX speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="rounded-3xl bg-slate-50 border border-slate-200 p-8 flex flex-col justify-between hover:shadow-lg transition-all space-y-6">
            <div className="space-y-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                "SiftX Tool replaced Adobe Acrobat and Smallpdf subscriptions across our 30-person team. Zero upload lag, 100% airtight client privacy."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80" 
                alt="Sarah Jenkins"
                className="w-11 h-11 rounded-full object-cover border-2 border-[#01bbfd]"
              />
              <div>
                <p className="font-bold text-xs text-[#020f22]">Sarah Jenkins</p>
                <p className="text-[11px] text-slate-500">Director of Operations, NY</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-[#0176fd]/40 p-8 flex flex-col justify-between shadow-md hover:shadow-xl transition-all space-y-6 relative">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full siftx-pill-btn text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
              VERIFIED REVIEW
            </div>
            <div className="space-y-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                "The 2026 Pakistan Electricity Bill and GPA calculators are an absolute game changer. Accurate NEPRA slab calculations with zero guesswork!"
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80" 
                alt="Usman Tariq"
                className="w-11 h-11 rounded-full object-cover border-2 border-[#0176fd]"
              />
              <div>
                <p className="font-bold text-xs text-[#020f22]">Usman Tariq, CA</p>
                <p className="text-[11px] text-slate-500">Senior Tax Consultant, Lahore</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 border border-slate-200 p-8 flex flex-col justify-between hover:shadow-lg transition-all space-y-6">
            <div className="space-y-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                "Having developer utilities, JSON tree formatters, and Base64 encoders executing directly in browser RAM with zero server roundtrips is incredible."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80" 
                alt="David Miller"
                className="w-11 h-11 rounded-full object-cover border-2 border-[#01bbfd]"
              />
              <div>
                <p className="font-bold text-xs text-[#020f22]">David Miller</p>
                <p className="text-[11px] text-slate-500">Lead DevOps Engineer, SF</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 8. ZOOM'S EXPANDABLE FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold font-mono tracking-wider text-[#0176fd] uppercase bg-sky-100/70 px-3.5 py-1 rounded-full border border-sky-200">
            KNOWLEDGE BASE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#020f22] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Clear answers to common questions about SiftX tools and privacy.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Is SiftX really 100% free with all 62 tools unlocked?',
              a: 'Yes, every single tool in SiftX is completely free forever. There are zero credit card requirements, zero ads, zero watermarks, and zero paywalls.'
            },
            {
              q: 'How does client-side WebAssembly keep my documents private?',
              a: 'When you drop a file into SiftX, it is processed entirely inside your computer memory using WebAssembly. The file is never transmitted to external cloud servers, preventing data interception.'
            },
            {
              q: 'How does the Pakistan Electricity Bill 2026 Calculator work?',
              a: 'The engine uses official NEPRA consumer tariffs for 2026 across DISCOs (LESCO, MEPCO, IESCO, FESCO, K-Electric, etc.), computing units, slab tiers, fuel price adjustments, and government taxes.'
            },
            {
              q: 'Can I use SiftX offline without internet access?',
              a: 'Yes, SiftX bundles service worker caching so you can use all PDF tools, calculators, audio trimmers, and code converters even with Wi-Fi turned off.'
            }
          ].map((item, idx) => {
            const isOpen = openHomeFaq === idx;
            return (
              <div key={idx} className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs">
                <button
                  onClick={() => setOpenHomeFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-[#020f22]">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#0176fd]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. ZOOM'S SIGNATURE BOTTOM CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="p-10 sm:p-20 rounded-3xl bg-[#020f22] text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#01bbfd]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#01bbfd]/20 border border-[#01bbfd] text-[#01bbfd] text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#01bbfd]" />
            <span>NO SUBSCRIPTIONS • 100% FREE FOREVER</span>
          </div>

          <h2 className="text-3xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Ready to get started? Join SiftX Tool for free today.
          </h2>

          <p className="text-white/75 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
            Access all 62 essential daily tools in one clean, private, and lightning-fast studio.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onNavigateToStudio}
              className="px-10 py-4 rounded-full siftx-pill-btn font-extrabold text-base shadow-xl shadow-[#0176fd]/30 transition-all cursor-pointer"
            >
              <span>Get Started Now — It's Free</span>
            </button>
            <button
              onClick={onNavigateToStudio}
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-base transition-all cursor-pointer border border-white/20"
            >
              <span>View All 62 Tools</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
