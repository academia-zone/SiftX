import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Share2
} from 'lucide-react';
import type { ResolvedToolInfo } from '../utils/toolResolver';
import { ALL_TOOLS } from '../data/toolsData';

interface ToolLandingPageProps {
  toolInfo: ResolvedToolInfo;
  onLaunchTool: () => void;
  onNavigateHome: () => void;
  onNavigateToCategory: () => void;
  onSelectOtherTool: (toolId: string) => void;
}

export const ToolLandingPage: React.FC<ToolLandingPageProps> = ({
  toolInfo,
  onLaunchTool,
  onNavigateHome,
  onNavigateToCategory,
  onSelectOtherTool,
}) => {
  const { tool, studio, seoTitle, seoDescription } = toolInfo;

  // Dynamically update document title and meta description for SEO
  useEffect(() => {
    document.title = seoTitle;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seoDescription);

    // Inject JSON-LD Schema
    const scriptId = 'tool-jsonld-schema';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': tool.name,
      'operatingSystem': 'Any (Web Browser)',
      'applicationCategory': 'UtilitiesApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
      },
      'description': seoDescription,
    });

    return () => {
      document.title = 'SiftX Tool | One platform for all your daily tools';
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [toolInfo, seoTitle, seoDescription, tool.name]);

  const relatedTools = ALL_TOOLS.filter(
    (t) => t.mainCategory === tool.mainCategory && t.id !== tool.id
  ).slice(0, 4);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: seoTitle,
          text: seoDescription,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <button 
              onClick={onNavigateHome}
              className="hover:text-[#0176fd] dark:hover:text-[#01bbfd] transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <button 
              onClick={onNavigateToCategory}
              className="hover:text-[#0176fd] dark:hover:text-[#01bbfd] transition-colors cursor-pointer capitalize"
            >
              {studio} Studio
            </button>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">{tool.name}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-[#0176fd] dark:hover:text-[#01bbfd] transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Hero Dedicated Tool Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8">
        
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#01bbfd] animate-pulse" />
          <span>OFFICIAL SIFTX ENGINE • 100% PRIVATE</span>
          {tool.badge && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#01bbfd]/20 text-[#0176fd] dark:text-[#01bbfd] text-[10px] font-mono">
              {tool.badge}
            </span>
          )}
        </div>

        {/* Big Crisp Title & Tagline */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black text-[#020f22] dark:text-white tracking-tight leading-[1.1]">
            {tool.name}
          </h1>
          <p className="text-lg sm:text-2xl text-slate-600 dark:text-slate-300 font-medium">
            {tool.tagline}
          </p>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {tool.description} No daily file limits, no ads, and no cloud uploads — everything runs inside your browser with millisecond latency.
          </p>
        </div>

        {/* Primary Interactive CTA: Launch Engine */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLaunchTool}
            className="w-full sm:w-auto px-9 py-4 rounded-full siftx-pill-btn font-extrabold text-base shadow-xl hover:shadow-2xl hover:shadow-[#0176fd]/30 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span>Launch {tool.name} Now</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </motion.button>

          <button
            onClick={onNavigateToCategory}
            className="w-full sm:w-auto px-6 py-4 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            Explore All {studio.toUpperCase()} Tools
          </button>
        </div>

        {/* Trust & Spec Chips */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>0 KB Cloud Upload</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#01bbfd]" />
            <span>Zero Server Latency</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>GDPR & Privacy Safe</span>
          </span>
        </div>

      </section>

      {/* 3 Steps: How It Works */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-t border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#020f22] dark:text-white">
              How {tool.name} Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Three simple steps to process your files securely in browser memory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#01bbfd] to-[#0176fd] text-white flex items-center justify-center font-black text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Select or Drop File</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose your source file or drag and drop it directly onto the canvas. Files remain on your machine.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#01bbfd] to-[#0176fd] text-white flex items-center justify-center font-black text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Instant Client Processing</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Adjust precision controls and let the WebAssembly engine execute transformations in milliseconds.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#01bbfd] to-[#0176fd] text-white flex items-center justify-center font-black text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Export & Cross-Tool Pass</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Download your result with 1-click or pass directly into another SiftX tool via the Workspace Tray.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Head-to-Head Comparison vs Competitors */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#020f22] dark:text-white">
            Why SiftX Beats Legacy Competitors
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Compare our client-side architecture against typical cloud tool sites like TinyWow & Smallpdf.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5 sm:p-4">Feature</th>
                <th className="p-3.5 sm:p-4 text-emerald-600 dark:text-emerald-400">SiftX Workplace</th>
                <th className="p-3.5 sm:p-4 text-slate-500">Traditional Web Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold">File Privacy</td>
                <td className="p-3.5 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">✅ 100% In-Browser Memory</td>
                <td className="p-3.5 sm:p-4 text-red-500">❌ Uploaded to 3rd-party servers</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold">Processing Latency</td>
                <td className="p-3.5 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">✅ Instant (0s upload)</td>
                <td className="p-3.5 sm:p-4 text-red-500">❌ Slow upload & queue wait</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold">Advertisements & Spam</td>
                <td className="p-3.5 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">✅ Zero Ads</td>
                <td className="p-3.5 sm:p-4 text-red-500">❌ Popups & deceptive banners</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold">Daily Limits / Paywalls</td>
                <td className="p-3.5 sm:p-4 text-emerald-600 dark:text-emerald-400 font-bold">✅ Completely Unlimited</td>
                <td className="p-3.5 sm:p-4 text-red-500">❌ Paywall after 2 files</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Related Tools in Same Category */}
      {relatedTools.length > 0 && (
        <section className="py-12 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#020f22] dark:text-white">
                More {studio.toUpperCase()} Tools
              </h3>
              <button
                onClick={onNavigateToCategory}
                className="text-xs font-bold text-[#0176fd] dark:text-[#01bbfd] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedTools.map((rt) => (
                <div
                  key={rt.id}
                  onClick={() => onSelectOtherTool(rt.id)}
                  className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-md hover:border-[#0176fd] transition-all cursor-pointer space-y-2 group"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0176fd] dark:group-hover:text-[#01bbfd] transition-colors">
                    {rt.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {rt.tagline}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
