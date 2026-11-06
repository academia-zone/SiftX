import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  Cpu, 
  DownloadCloud, 
  Layers, 
  Sparkles 
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: 'Instant In-Browser Speed',
      desc: 'No queue waiting, no artificial upload delays. Calculations and file operations process quickly using modern browser APIs.'
    },
    {
      icon: ShieldCheck,
      title: 'Privacy-First Architecture',
      desc: 'Document manipulation, calculators, and image tools run client-side in your browser memory, keeping your documents private.'
    },
    {
      icon: Smartphone,
      title: 'Cross-Device & Mobile Ready',
      desc: 'Use directly in your browser on desktop, tablet, or smartphone with responsive UI and zero mandatory software installation.'
    },
    {
      icon: Cpu,
      title: 'Client-Side Hardware Acceleration',
      desc: 'PDF handling, OCR text extraction, Canvas and WebGL image filters run efficiently with in-memory execution.'
    },
    {
      icon: Layers,
      title: 'Modular Studio Ecosystem',
      desc: '6 specialized studios (PDF, Audio, Calculators, Image, Video, Developer) give you dedicated, focused workspaces for every task.'
    },
    {
      icon: DownloadCloud,
      title: 'Zero Subscriptions or Accounts',
      desc: 'No monthly fees, no credit card requirements, and no mandatory logins. Just open the tool and get your work done.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-[#01bbfd]/10 px-3 py-1 rounded-full border border-[#01bbfd]/30">
          Platform Capabilities
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Engineered for Speed, Privacy & Simplicity
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Discover the technology and architectural principles that make SiftX a reliable daily utility platform.
        </p>
      </div>

      {/* 6 Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div 
              key={idx}
              className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#01bbfd] dark:hover:border-[#01bbfd] hover:shadow-md transition-all space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#01bbfd]/20 border border-[#01bbfd] flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{f.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* High-Level Comparison Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-950 text-white space-y-6 border border-slate-800">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#01bbfd]" />
          <h3 className="text-xl sm:text-2xl font-black text-white">Traditional Web Tools vs. SiftX</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-white/80">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="font-bold text-rose-400 text-sm">❌ Traditional Online Tools:</h4>
            <p>• Restrict free usage to 2–3 files per day.</p>
            <p>• Upload your private documents to third-party ad networks.</p>
            <p>• Bombard you with popups, countdown timers, and mandatory signups.</p>
            <p>• Slow server queues during peak hours.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#01bbfd]/10 border border-[#01bbfd]/30 space-y-2 text-white">
            <h4 className="font-bold text-[#01bbfd] text-sm">✅ SiftX Guarantee:</h4>
            <p>• Unlimited everyday usage without artificial paywalls.</p>
            <p>• Private local processing for client-side document and image engines.</p>
            <p>• Clean, uncluttered interface designed purely for productivity.</p>
            <p>• Lightweight offline caching support via Service Worker.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
