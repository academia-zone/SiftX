import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Globe, 
  Code2
} from 'lucide-react';

export const OpenGraphPreviewerTool: React.FC = () => {
  const [url, setUrl] = useState<string>('https://siftx.dev');
  const [title, setTitle] = useState<string>('SiftX - Universal 2026 Developer & Creator Studio');
  const [description, setDescription] = useState<string>('100% Client-side developer tools, video subtitle editor, audio synthesizers, and document transformers running completely private in your browser.');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=630&q=80');
  const [siteName, setSiteName] = useState<string>('SiftX Suite');
  const [twitterCardType, setTwitterCardType] = useState<'summary_large_image' | 'summary'>('summary_large_image');
  const [activePlatform, setActivePlatform] = useState<'whatsapp' | 'twitter' | 'linkedin' | 'discord' | 'google'>('twitter');
  const [copied, setCopied] = useState<boolean>(false);

  const cleanDomain = (() => {
    try {
      const u = new URL(url);
      return u.hostname;
    } catch {
      return 'siftx.dev';
    }
  })();

  const generatedMetaTags = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">

<!-- Open Graph / Facebook / WhatsApp / LinkedIn -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:site_name" content="${siteName}">

<!-- Twitter / X -->
<meta property="twitter:card" content="${twitterCardType}">
<meta property="twitter:url" content="${url}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
<meta property="twitter:image" content="${imageUrl}">`;

  const handleCopyMeta = () => {
    navigator.clipboard.writeText(generatedMetaTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">OpenGraph & Social Share Simulator</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                Live Preview
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live interactive previews for WhatsApp, Twitter/X, LinkedIn, Discord & Google search cards with 1-click meta tag generation.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyMeta}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer self-start md:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Meta Tags!' : 'Copy HTML Meta Tags'}</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Social Meta Attributes</h2>

          {/* URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Page URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-slate-800"
            />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Title</span>
              <span className={title.length > 60 ? 'text-amber-600' : 'text-slate-400'}>
                {title.length}/60
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Description</span>
              <span className={description.length > 155 ? 'text-amber-600' : 'text-slate-400'}>
                {description.length}/155
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed text-slate-800 resize-none"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>OG Image URL (1200x630 recommended)</span>
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-slate-800"
            />
          </div>

          {/* Site Name & Card Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Site Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Twitter Card</label>
              <select
                value={twitterCardType}
                onChange={(e) => setTwitterCardType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-medium"
              >
                <option value="summary_large_image">Large Image</option>
                <option value="summary">Small Thumbnail</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mockup Stages (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Platform Tabs Switcher */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
            {[
              { id: 'twitter', label: 'Twitter / X' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'linkedin', label: 'LinkedIn' },
              { id: 'discord', label: 'Discord' },
              { id: 'google', label: 'Google Search' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activePlatform === p.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Interactive Live Preview Box */}
          <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 min-h-[380px] flex items-center justify-center">
            {/* 1. Twitter / X Card Preview */}
            {activePlatform === 'twitter' && (
              <div className="w-full max-w-md bg-black text-white rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                <div className="relative aspect-[1.91/1] bg-slate-900 overflow-hidden">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-medium text-slate-300">
                    {cleanDomain}
                  </div>
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="text-xs font-bold text-slate-400 truncate">{cleanDomain}</div>
                  <div className="text-sm font-bold text-white line-clamp-1">{title}</div>
                  <div className="text-xs text-slate-400 line-clamp-2">{description}</div>
                </div>
              </div>
            )}

            {/* 2. WhatsApp Chat Bubble Preview */}
            {activePlatform === 'whatsapp' && (
              <div className="w-full max-w-sm bg-[#e7ffdb] p-2.5 rounded-2xl shadow-md border border-emerald-100 text-slate-900 space-y-2">
                <div className="bg-white/80 rounded-xl overflow-hidden border border-emerald-200">
                  <div className="aspect-[1.91/1] bg-slate-200 overflow-hidden">
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 leading-tight">{description}</div>
                    <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1 font-mono">
                      <span>{cleanDomain}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-medium">10:42 PM ✓✓</div>
              </div>
            )}

            {/* 3. LinkedIn Feed Card Preview */}
            {activePlatform === 'linkedin' && (
              <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
                <div className="aspect-[1.91/1] bg-slate-100 overflow-hidden">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
                <div className="p-3.5 bg-slate-50 border-t border-slate-100 space-y-1">
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">{title}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">{cleanDomain}</div>
                </div>
              </div>
            )}

            {/* 4. Discord Rich Embed Preview */}
            {activePlatform === 'discord' && (
              <div className="w-full max-w-md bg-[#2b2d31] text-slate-200 p-4 rounded-lg border-l-4 border-indigo-500 shadow-xl space-y-2">
                <div className="text-[11px] text-slate-400 font-bold">{siteName}</div>
                <div className="text-sm font-bold text-sky-400 hover:underline cursor-pointer">{title}</div>
                <div className="text-xs text-slate-300 leading-relaxed">{description}</div>
                <div className="rounded-md overflow-hidden aspect-[1.91/1] max-w-xs mt-2">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* 5. Google SERP Preview */}
            {activePlatform === 'google' && (
              <div className="w-full max-w-lg bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{url}</span>
                </div>
                <div className="text-base font-medium text-blue-800 hover:underline cursor-pointer line-clamp-1">
                  {title}
                </div>
                <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {description}
                </div>
              </div>
            )}
          </div>

          {/* Generated Code Snippet */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-xs border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 font-bold">
                <Code2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Generated HTML Meta Tags</span>
              </span>
              <button
                onClick={handleCopyMeta}
                className="text-xs text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
              >
                Copy All
              </button>
            </div>
            <pre className="max-h-36 overflow-y-auto leading-relaxed text-slate-300">
              {generatedMetaTags}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
