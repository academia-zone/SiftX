import React from 'react';
import { Target, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-black uppercase tracking-wider text-[#020f22] bg-[#01bbfd]/20 px-3 py-1 rounded-full border border-[#01bbfd]">
          About Us
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#020f22] tracking-tight">
          Our Story & Vision
        </h1>
        <p className="text-base text-[#020f22]/70 max-w-2xl mx-auto leading-relaxed">
          We believe everyday digital tools should be accessible, private, and effortless for everyone — without paywalls or subscriptions.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-[#020f22]/80 leading-relaxed text-sm sm:text-base">
        <h2 className="text-2xl font-black text-[#020f22]">Why We Created SiftX Tool</h2>
        <p>
          In today's digital world, completing even basic daily tasks has become frustrating. If a student wants to calculate their GPA or compress an assignment PDF, they encounter invasive advertisements and subscription popups. If a homeowner wants to estimate their electricity bill or fuel cost, they are forced to register accounts on ad-cluttered sites.
        </p>
        <p>
          <strong className="text-[#020f22] font-black">SiftX Tool</strong> was born out of a commitment to solve this exact problem. 
          We designed a unified, clean, and reliable hub that brings together everyday calculators, document converters, image tools, and productivity utilities under one roof.
        </p>
      </div>

      {/* Mission & Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#01bbfd]/20 border border-[#01bbfd] flex items-center justify-center text-[#020f22]">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-[#020f22]">Our Mission</h3>
          <p className="text-sm text-[#020f22]/70 leading-relaxed">
            To provide students, office professionals, and households with a single, trustworthy platform containing every utility tool required for daily computer and mobile tasks.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#01bbfd]/20 border border-[#01bbfd] flex items-center justify-center text-[#020f22]">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-[#020f22]">Community First</h3>
          <p className="text-sm text-[#020f22]/70 leading-relaxed">
            Built as an open, accessible initiative. We do not monetize by collecting user data or placing aggressive limitations on how many files you can process.
          </p>
        </div>
      </div>

      {/* Commitments Checklist */}
      <div className="p-8 rounded-2xl bg-[#01bbfd]/10 border border-[#01bbfd] space-y-4">
        <h3 className="text-lg font-black text-[#020f22] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#020f22]" />
          <span>Our Unbreakable Commitments</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#020f22] font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#020f22] shrink-0" />
            <span>Zero mandatory user logins</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#020f22] shrink-0" />
            <span>100% Free forever with no subscriptions</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#020f22] shrink-0" />
            <span>Local file processing with complete privacy</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#020f22] shrink-0" />
            <span>Full offline desktop app compatibility</span>
          </div>
        </div>
      </div>

    </div>
  );
};
