import React from 'react';
import { 
  Laptop, 
  ShieldCheck, 
  Globe, 
  FileText, 
  Mic, 
  Calculator, 
  Image as ImageIcon, 
  Video, 
  Code2,
  CheckCircle2
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-28 border-t border-slate-200 bg-[#020f22] text-white">
      
      {/* 1. TOP NEWSLETTER & PLATFORM HIGHLIGHT BANNER */}
      <div className="border-b border-white/10 bg-black/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#01bbfd]">
              STAY PRODUCTIVE EVERY DAY
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Get new daily tools and productivity updates
            </h3>
            <p className="text-xs text-white/60">
              No spam. Just release notes when new client-side utilities are launched.
            </p>
          </div>

          <div className="flex w-full md:w-auto items-center gap-2 max-w-md">
            <input 
              type="email" 
              placeholder="Enter your email..." 
              className="px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#0176fd] w-full"
            />
            <button className="px-5 py-2.5 rounded-full siftx-pill-btn font-extrabold text-xs shrink-0 transition-all cursor-pointer shadow-sm">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* 2. MASSIVE MULTI-COLUMN ENTERPRISE SITEMAP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          
          {/* Brand Bio Column */}
          <div className="col-span-2 space-y-4">
            <div 
              onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center cursor-pointer select-none group py-1"
            >
              <img 
                src="/logo-white.png" 
                alt="SiftX Tool" 
                className="h-12 sm:h-13 w-auto object-contain hover:opacity-95 transition-all" 
              />
            </div>

            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              The AI-first workplace platform consolidating 62 practical everyday utilities for documents, audio, calculations, imagery, video, and code. Built for complete client-side privacy with zero cloud data retention.
            </p>

            {/* Platform Status */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 max-w-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All 62 Systems Operational</span>
              </div>
              <p className="text-[10px] text-white/50">
                Pure client-side WebAssembly. No server dependencies or downtime.
              </p>
            </div>
          </div>

          {/* Column 1: Products */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-white text-xs uppercase tracking-wider font-mono text-[#01bbfd]">
              Product Studios
            </h5>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <button onClick={() => onNavigate('tool-studio')} className="hover:text-white hover:underline cursor-pointer flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>PDF & Documents</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool-studio')} className="hover:text-white hover:underline cursor-pointer flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-slate-400" />
                  <span>Voice AI & Audio</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool-studio')} className="hover:text-white hover:underline cursor-pointer flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-slate-400" />
                  <span>Smart Calculators</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool-studio')} className="hover:text-white hover:underline cursor-pointer flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Image Lab & OCR</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool-studio')} className="hover:text-white hover:underline cursor-pointer flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-slate-400" />
                  <span>Video & Animation</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool-studio')} className="hover:text-white hover:underline cursor-pointer flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Developer Hub</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Popular Tools */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-white text-xs uppercase tracking-wider font-mono text-[#01bbfd]">
              Popular Tools
            </h5>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <button onClick={() => onNavigate('tool-studio')} className="hover:text-white hover:underline cursor-pointer">
                  Electricity Bill Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool-studio')} className="hover:text-white hover:underline cursor-pointer">
                  PDF Compressor (-85%)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool-studio')} className="hover:text-white hover:underline cursor-pointer">
                  Speech to Text (STT)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool-studio')} className="hover:text-white hover:underline cursor-pointer">
                  AI Background Remover
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool-studio')} className="hover:text-white hover:underline cursor-pointer">
                  GPA & CGPA Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool-studio')} className="hover:text-white hover:underline cursor-pointer">
                  JSON Formatter & Validator
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-white text-xs uppercase tracking-wider font-mono text-[#01bbfd]">
              Solutions
            </h5>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-white hover:underline cursor-pointer">
                  For Students & College
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-white hover:underline cursor-pointer">
                  For Finance & Business
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-white hover:underline cursor-pointer">
                  For Creators & Video Editors
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-white hover:underline cursor-pointer">
                  For Software Developers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-white hover:underline cursor-pointer">
                  For Everyday Households
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Company & Legal */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-white text-xs uppercase tracking-wider font-mono text-[#01bbfd]">
              Company & Trust
            </h5>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white hover:underline cursor-pointer">
                  About SiftX Tool
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white hover:underline cursor-pointer">
                  Privacy Architecture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white hover:underline cursor-pointer">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white hover:underline cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white hover:underline cursor-pointer">
                  Security Whitepaper
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* 3. MIDDLE UTILITY & TRUST HIGHLIGHTS */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-6 text-xs text-white/70">
          
          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5 text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Free Forever</span>
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Server Tracking</span>
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <Laptop className="w-4 h-4 text-[#01bbfd]" />
              <span>Web & Desktop Native</span>
            </span>
          </div>

          {/* Language / Region */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs">
              <Globe className="w-3.5 h-3.5 text-[#01bbfd]" />
              <span>English (US) / International</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-mono">
              v2.4.0 (2026 Production)
            </div>
          </div>

        </div>

        {/* 4. BOTTOM COPYRIGHT & LEGAL NOTICE */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© 2026 SiftX Tool, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <span className="hover:text-white cursor-pointer">Privacy Statement</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Legal Policies</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Cookie Preferences</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Do Not Sell My Info</span>
          </div>
        </div>

      </div>

    </footer>
  );
};
