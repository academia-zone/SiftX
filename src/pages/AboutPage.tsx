import React from 'react';
import { Target, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-[#01bbfd]/10 px-3 py-1 rounded-full border border-[#01bbfd]/30">
          About Us
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Our Story & Vision
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          We believe everyday digital tools should be accessible, private, and effortless for everyone — without paywalls or subscriptions.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Why We Created SiftX</h2>
        <p>
          In today's digital world, completing even basic daily tasks has become frustrating. If a student wants to calculate their GPA or compress an assignment PDF, they encounter invasive advertisements and subscription popups. If a homeowner wants to estimate their electricity bill or fuel cost, they are forced to register accounts on ad-cluttered sites.
        </p>
        <p>
          <strong className="text-slate-900 dark:text-white font-black">SiftX</strong> was born out of a commitment to solve this exact problem. 
          We designed a unified, clean, and reliable hub that brings together everyday calculators, document converters, image tools, and productivity utilities under one roof.
        </p>
      </div>

      {/* Mission & Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#01bbfd]/20 border border-[#01bbfd] flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Our Mission</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            To provide students, office professionals, and households with a single, trustworthy platform containing every utility tool required for daily computer and mobile tasks.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#01bbfd]/20 border border-[#01bbfd] flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Community First</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Built as an open, accessible initiative. We do not monetize by collecting user data or placing aggressive limitations on how many files you can process.
          </p>
        </div>
      </div>

      {/* Commitments Checklist */}
      <div className="p-8 rounded-2xl bg-[#01bbfd]/10 border border-[#01bbfd]/30 dark:bg-slate-900/60 dark:border-cyan-500/30 space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <span>Our Core Commitments</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-200 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Zero mandatory user logins</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% Free forever with no subscriptions</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Local file processing with complete privacy</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Offline browser caching via Service Worker</span>
          </div>
        </div>
      </div>

    </div>
  );
};
