import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:support@siftx.dev?subject=${encodeURIComponent(formData.subject || 'SiftX Feedback')}&body=${encodeURIComponent(`From: ${formData.name} (${formData.email})\n\n${formData.message}`)}`;
    try {
      window.open(mailto, '_blank');
    } catch {}
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-[#01bbfd]/10 px-3 py-1 rounded-full border border-[#01bbfd]/30">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Contact & Support
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Have a suggestion for a new daily utility tool? Encountered a problem? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Contact Information Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#01bbfd]/20 border border-[#01bbfd] flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">Direct Email</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Reach our product and developer team directly:</p>
            <a href="mailto:support@siftx.dev" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono hover:underline block">
              support@siftx.dev
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#01bbfd]/20 border border-[#01bbfd] flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">Community Feedback</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Suggest a tool for students, office, or everyday household routines.</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Thank you for your message!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                We have received your inquiry. If your email client did not open automatically, reach us directly at <span className="font-semibold text-slate-700 dark:text-slate-200">support@siftx.dev</span>.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                }}
                className="mt-4 px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#01bbfd] focus:ring-1 focus:ring-[#01bbfd]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#01bbfd] focus:ring-1 focus:ring-[#01bbfd]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Tool suggestion, feedback or bug report"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#01bbfd] focus:ring-1 focus:ring-[#01bbfd]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your suggestion or question..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#01bbfd] focus:ring-1 focus:ring-[#01bbfd]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#01bbfd] hover:bg-[#01bbfd]/90 text-slate-950 font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-cyan-400/20"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4 text-slate-950" />
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
