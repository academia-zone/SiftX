import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Laptop, 
  Cpu, 
  DownloadCloud, 
  Layers, 
  Sparkles 
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: 'Instant Execution',
      desc: 'No queue waiting, no artificial upload delays. Tools compute calculations and process files directly using your device hardware.'
    },
    {
      icon: ShieldCheck,
      title: 'Guaranteed Client-Side Privacy',
      desc: 'Whether editing contracts, calculating taxes, or compressing photos, sensitive files remain 100% on your local machine.'
    },
    {
      icon: Laptop,
      title: 'Cross-Platform Web & Desktop',
      desc: 'Use in your favorite web browser or download the standalone executable desktop app for Windows and macOS with offline capabilities.'
    },
    {
      icon: Cpu,
      title: 'High-Performance WebAssembly (WASM)',
      desc: 'PDF editing, OCR text recognition, and media processing powered by client-side WebAssembly for near-native desktop speeds.'
    },
    {
      icon: Layers,
      title: 'Modular Plugin Architecture',
      desc: 'Every tool operates independently in its own folder. Adding new features or customizing specific tools never affects the rest of the studio.'
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
        <span className="text-xs font-black uppercase tracking-wider text-black bg-[#01bbfd]/20 px-3 py-1 rounded-full border border-[#01bbfd]">
          Platform Capabilities
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
          Engineered for Speed, Privacy & Simplicity
        </h1>
        <p className="text-sm sm:text-base text-black/70 leading-relaxed">
          Discover the technology and architectural principles that make Tool Studio the most reliable daily utility platform.
        </p>
      </div>

      {/* 6 Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div 
              key={idx}
              className="p-8 rounded-2xl bg-white border border-black/10 hover:border-[#01bbfd] hover:shadow-md transition-all space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#01bbfd]/20 border border-[#01bbfd] flex items-center justify-center text-black">
                <Icon className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-black text-black">{f.title}</h3>
              <p className="text-xs text-black/70 leading-relaxed">
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* High-Level Comparison Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-black text-white space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#01bbfd]" />
          <h3 className="text-xl sm:text-2xl font-black text-white">Traditional Web Tools vs. Tool Studio</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-white/80">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="font-bold text-white text-sm">❌ Traditional Online Tools:</h4>
            <p>• Restrict free usage to 2–3 files per day.</p>
            <p>• Upload your private documents to unknown cloud servers.</p>
            <p>• Bombard you with popups, timers, and mandatory signups.</p>
            <p>• Stop working without an active internet connection.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#01bbfd]/10 border border-[#01bbfd] space-y-2 text-white">
            <h4 className="font-bold text-[#01bbfd] text-sm">✅ Tool Studio Guarantee:</h4>
            <p>• Unlimited usage without any countdowns or artificial limits.</p>
            <p>• 100% client-side privacy: files never leave your machine.</p>
            <p>• Clean, ad-free interface designed solely for productivity.</p>
            <p>• Available as an offline desktop application.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
