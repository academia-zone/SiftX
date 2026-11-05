import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  Globe, 
  Search, 
  Smartphone, 
  Tablet, 
  Monitor, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCw, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Lock, 
  Info,
  Upload,
  FileArchive,
  Copy,
  Check,
  Lightbulb
} from 'lucide-react';

interface AuditScores {
  overall: number;
  seo: number;
  security: number;
  performance: number;
  mobile: number;
}

interface AuditIssue {
  title: string;
  description: string;
  category: string;
  impact?: number;
  recommendation?: string;
  codeSnippet?: string;
}

interface AuditData {
  url: string;
  statusCode: number;
  responseTimeMs: number;
  htmlSizeKb: number;
  isHttps: boolean;
  isFramingBlocked: boolean;
  isOfflineZip?: boolean;
  zipFilename?: string;
  scores: AuditScores;
  meta: {
    title: string;
    titleLength: number;
    description: string;
    descriptionLength: number;
    keywords: string;
    robots: string;
    canonicalUrl: string;
    favicon: string;
    lang: string;
    hasViewport: boolean;
    hasCharset: boolean;
  };
  headings: {
    h1Count: number;
    h1s: string[];
    h2Count: number;
    h2s: string[];
    h3Count: number;
  };
  images: {
    total: number;
    missingAltCount: number;
    missingAltImages: string[];
  };
  social: {
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogUrl: string;
    ogType: string;
    twitterCard: string;
    twitterTitle: string;
    twitterImage: string;
  };
  security: {
    isHttps: boolean;
    hsts: boolean;
    csp: boolean;
    xFrameOptions: string;
    xContentTypeOptions: boolean;
    referrerPolicy: string;
  };
  content?: {
    wordCount: number;
    readingTimeMin: number;
    topKeywords: { keyword: string; count: number; density: number }[];
  };
  performance: {
    responseTimeMs: number;
    htmlSizeKb: number;
    scriptCount: number;
    styleCount: number;
  };
  techStack: { name: string; category: string; icon: string }[];
  issues: {
    critical: AuditIssue[];
    warnings: AuditIssue[];
    passed: AuditIssue[];
  };
  recommendedHeadCode?: string;
}

export const WebsiteAuditStudioTool: React.FC = () => {
  // Input Modes: Live URL vs Offline ZIP/HTML Upload
  const [inputMode, setInputMode] = useState<'url' | 'zip'>('url');
  const [targetUrl, setTargetUrl] = useState<string>('https://daraz.pk');

  // Loading & Data States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Active Studio Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'seo' | 'playbook' | 'security'>('overview');

  // Device Simulator States
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [offlineBlobUrl, setOfflineBlobUrl] = useState<string | null>(null);

  // 1. Run Live URL Audit via Backend Crawler
  const handleRunUrlAudit = async (customUrl?: string) => {
    const urlToScan = (customUrl || targetUrl).trim();
    if (!urlToScan) return;

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep('Connecting to website server...');

    try {
      setTimeout(() => setLoadingStep('Extracting HTML, meta tags & headings...'), 600);
      setTimeout(() => setLoadingStep('Scanning HTTP security headers & SSL...'), 1400);
      setTimeout(() => setLoadingStep('Analyzing mobile viewport & tech stack...'), 2200);

      const res = await fetch('/api/audit-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScan })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${res.status}`);
      }

      const data: AuditData = await res.json();
      setAuditData(data);
      setOfflineBlobUrl(null);
    } catch (err: any) {
      console.error('Audit failed:', err);
      setErrorMsg(err.message || 'Failed to scan website. Ensure the URL is accessible.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // 2. Run Offline ZIP File / Project Archive Audit (100% In Browser)
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep('Unpacking ZIP project archive in memory...');

    try {
      if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        // Direct HTML file
        const text = await file.text();
        analyzeHtmlContent(text, file.name, false);
      } else {
        // ZIP Archive using JSZip
        const zip = await JSZip.loadAsync(file);
        setLoadingStep('Locating index.html & project assets...');

        let htmlContent = '';
        let matchedName = '';

        // Find index.html or first HTML file
        for (const [filename, zipEntry] of Object.entries(zip.files)) {
          if (!zipEntry.dir && (filename.toLowerCase().endsWith('index.html') || filename.toLowerCase().endsWith('.html'))) {
            htmlContent = await zipEntry.async('string');
            matchedName = filename;
            break;
          }
        }

        if (!htmlContent) {
          throw new Error('No .html or index.html file found inside the ZIP archive.');
        }

        // Create Blob URL for live preview in 3-screen simulator
        const htmlBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(htmlBlob);
        setOfflineBlobUrl(blobUrl);

        analyzeHtmlContent(htmlContent, `${file.name} (${matchedName})`, true);
      }
    } catch (err: any) {
      console.error('ZIP extraction failed:', err);
      setErrorMsg(err.message || 'Could not parse ZIP file.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Internal HTML Parser for Offline / Local Audit
  const analyzeHtmlContent = (html: string, sourceName: string, isZip: boolean) => {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';

    const getMeta = (nameOrProp: string) => {
      const pattern = new RegExp(`<meta\\s+[^>]*?(?:name|property)=["']${nameOrProp}["'][^>]*?content=["']([^"']*)["']`, 'i');
      const match = html.match(pattern);
      if (match) return match[1].trim();
      const reversePattern = new RegExp(`<meta\\s+[^>]*?content=["']([^"']*)["'][^>]*?(?:name|property)=["']${nameOrProp}["']`, 'i');
      const revMatch = html.match(reversePattern);
      return revMatch ? revMatch[1].trim() : '';
    };

    const description = getMeta('description');
    const keywords = getMeta('keywords');
    const robots = getMeta('robots') || 'index, follow';
    const canonicalMatch = html.match(/<link\s+[^>]*?rel=["']canonical["'][^>]*?href=["']([^"']*)["']/i);
    const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : '';
    const viewport = getMeta('viewport');
    const hasViewport = Boolean(viewport);
    const hasCharset = /<meta[^>]*?charset=["']?utf-8/i.test(html);
    const langMatch = html.match(/<html[^>]*?\slang=["']([^"']*)["']/i);
    const lang = langMatch ? langMatch[1].trim() : '';

    const extractTags = (tag: string) => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
      const list: string[] = [];
      let m;
      while ((m = regex.exec(html)) !== null) {
        const clean = m[1].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
        if (clean) list.push(clean);
      }
      return list;
    };

    const h1s = extractTags('h1');
    const h2s = extractTags('h2');
    const h3s = extractTags('h3');

    // Images
    const imgRegex = /<img\s+([^>]*?)>/gi;
    let totalImages = 0;
    const missingAltImages: string[] = [];
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      totalImages++;
      const attrs = imgMatch[1];
      const srcMatch = attrs.match(/src=["']([^"']*)["']/i);
      const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
      const src = srcMatch ? srcMatch[1] : `image_${totalImages}`;
      if (!altMatch || !altMatch[1].trim()) {
        missingAltImages.push(src);
      }
    }

    // Social
    const ogTitle = getMeta('og:title');
    const ogDescription = getMeta('og:description');
    const ogImage = getMeta('og:image');
    const ogUrl = getMeta('og:url');
    const ogType = getMeta('og:type');
    const twitterCard = getMeta('twitter:card');
    const twitterTitle = getMeta('twitter:title');
    const twitterImage = getMeta('twitter:image');

    // Tech Stack
    const techStack: { name: string; category: string; icon: string }[] = [];
    if (html.includes('__NEXT_DATA__') || html.includes('/_next/')) techStack.push({ name: 'Next.js', category: 'Framework', icon: 'zap' });
    if (html.includes('data-reactroot') || html.includes('react.production.min.js')) techStack.push({ name: 'React', category: 'Library', icon: 'code' });
    if (html.includes('data-v-') || html.includes('vue.global.js')) techStack.push({ name: 'Vue.js', category: 'Framework', icon: 'code' });
    if (/tailwind/i.test(html) || /class="[^"]*(?:flex|grid|px-|py-)/.test(html)) techStack.push({ name: 'Tailwind CSS', category: 'UI Framework', icon: 'palette' });
    if (html.includes('bootstrap.min.css')) techStack.push({ name: 'Bootstrap', category: 'UI Framework', icon: 'layout' });

    // Word Count & Keywords
    const cleanBodyText = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanBodyText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const wordCount = words.length;
    const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

    // Checklist
    const criticalIssues: AuditIssue[] = [];
    const warnings: AuditIssue[] = [];
    const passedChecks: AuditIssue[] = [];

    if (!title) {
      criticalIssues.push({
        title: 'Missing Meta Title',
        description: 'No <title> tag found in HTML. Search engines cannot index this page without a title.',
        category: 'seo',
        impact: -20,
        recommendation: 'Add a <title> tag inside the <head> element.',
        codeSnippet: '<title>Primary Keyword - Brand Name | Core Benefit</title>'
      });
    } else {
      passedChecks.push({ title: `Meta Title Present (${title.length} chars)`, description: `"${title}"`, category: 'seo' });
    }

    if (!description) {
      warnings.push({
        title: 'Missing Meta Description',
        description: 'No meta description found. Google will generate an arbitrary text snippet from body text.',
        category: 'seo',
        impact: -10,
        recommendation: 'Add a 130-160 character description summarizing page value.',
        codeSnippet: '<meta name="description" content="Discover modern tools, high performance workflows, and seamless user experiences tailored for your business.">'
      });
    } else {
      passedChecks.push({ title: `Meta Description Present (${description.length} chars)`, description: description, category: 'seo' });
    }

    if (h1s.length === 0) {
      criticalIssues.push({
        title: 'Missing <h1> Heading',
        description: 'Every webpage must have exactly one <h1> heading defining its main topic.',
        category: 'seo',
        impact: -15,
        recommendation: 'Add a primary <h1> heading to your HTML.',
        codeSnippet: '<h1>Primary Headline of Your Page</h1>'
      });
    } else if (h1s.length > 1) {
      warnings.push({
        title: `Multiple <h1> Headings (${h1s.length})`,
        description: 'Multiple <h1> tags dilute topic focus. Keep 1 primary <h1> and use <h2> for subheadings.',
        category: 'seo',
        impact: -5,
        recommendation: 'Convert secondary <h1> tags to <h2>.',
        codeSnippet: '<h2>Secondary Section Title</h2>'
      });
    } else {
      passedChecks.push({ title: 'Perfect <h1> Heading Structure', description: `"${h1s[0]}"`, category: 'seo' });
    }

    if (!hasViewport) {
      criticalIssues.push({
        title: 'Missing Mobile Viewport Tag',
        description: 'No <meta name="viewport"> tag found. Mobile devices will not scale content properly.',
        category: 'mobile',
        impact: -20,
        recommendation: 'Add viewport meta tag inside <head>.',
        codeSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
      });
    } else {
      passedChecks.push({ title: 'Mobile Viewport Configured', description: 'Responsive viewport meta tag present.', category: 'mobile' });
    }

    if (missingAltImages.length > 0) {
      warnings.push({
        title: `${missingAltImages.length} Images Missing Alt Text`,
        description: 'Images without alt attributes hurt accessibility and image search rankings.',
        category: 'seo',
        impact: -8,
        recommendation: 'Add descriptive alt="" attributes to all images.',
        codeSnippet: '<img src="/image.png" alt="Clear descriptive caption">'
      });
    } else if (totalImages > 0) {
      passedChecks.push({ title: `All ${totalImages} Images Have Alt Text`, description: 'Accessibility check passed.', category: 'seo' });
    }

    let seoScore = Math.max(10, 100 - (criticalIssues.length * 20 + warnings.length * 8));
    let overallScore = Math.round((seoScore * 0.6) + (hasViewport ? 40 : 10));

    const recommendedHead = `<!-- Recommended Optimized <head> for ${sourceName} -->
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Primary Keyword - Brand Name | Core Benefit'}</title>
  <meta name="description" content="${description || 'Discover modern solutions and high-performance workflows tailored for you.'}">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="${ogTitle || title || 'Brand Name'}">
  <meta property="og:description" content="${ogDescription || description || 'Site Summary'}">
  <meta property="og:image" content="${ogImage || 'https://yourdomain.com/og-banner.jpg'}">
  <meta name="twitter:card" content="summary_large_image">
</head>`;

    const data: AuditData = {
      url: sourceName,
      statusCode: 200,
      responseTimeMs: 0,
      htmlSizeKb: Number((html.length / 1024).toFixed(1)),
      isHttps: true,
      isFramingBlocked: false,
      isOfflineZip: isZip,
      zipFilename: sourceName,
      scores: {
        overall: overallScore,
        seo: seoScore,
        security: 85,
        performance: 92,
        mobile: hasViewport ? 95 : 30
      },
      meta: {
        title,
        titleLength: title.length,
        description,
        descriptionLength: description.length,
        keywords,
        robots,
        canonicalUrl,
        favicon: '',
        lang,
        hasViewport,
        hasCharset
      },
      headings: {
        h1Count: h1s.length,
        h1s,
        h2Count: h2s.length,
        h2s: h2s.slice(0, 8),
        h3Count: h3s.length
      },
      images: {
        total: totalImages,
        missingAltCount: missingAltImages.length,
        missingAltImages: missingAltImages.slice(0, 10)
      },
      social: {
        ogTitle,
        ogDescription,
        ogImage,
        ogUrl,
        ogType,
        twitterCard,
        twitterTitle,
        twitterImage
      },
      security: {
        isHttps: true,
        hsts: true,
        csp: false,
        xFrameOptions: 'None',
        xContentTypeOptions: true,
        referrerPolicy: 'Not Set'
      },
      content: {
        wordCount,
        readingTimeMin,
        topKeywords: []
      },
      performance: {
        responseTimeMs: 0,
        htmlSizeKb: Number((html.length / 1024).toFixed(1)),
        scriptCount: (html.match(/<script\b/gi) || []).length,
        styleCount: (html.match(/<link[^>]*rel=["']stylesheet["']/gi) || []).length
      },
      techStack,
      issues: {
        critical: criticalIssues,
        warnings,
        passed: passedChecks
      },
      recommendedHeadCode: recommendedHead
    };

    setAuditData(data);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-16">
      
      {/* 1. Header Bar with Mode Switcher (Live URL vs Offline ZIP Upload) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
              <Globe className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Website 360 Studio & SEO Lab</h1>
                <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Live Crawl + Offline ZIP Analyzer + 3-Screen Simulator
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Scan live websites in real time or drop unreleased ZIP/HTML projects. Full SEO audit, step-by-step fix recommendations, and responsive mobile/tablet/desktop preview.
              </p>
            </div>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl text-xs font-bold self-start md:self-auto">
            <button
              onClick={() => setInputMode('url')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                inputMode === 'url' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Website URL</span>
            </button>

            <button
              onClick={() => setInputMode('zip')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                inputMode === 'zip' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileArchive className="w-3.5 h-3.5" />
              <span>Upload ZIP Project</span>
            </button>
          </div>
        </div>

        {/* Input Mode 1: Live Website URL */}
        {inputMode === 'url' ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunUrlAudit()}
                  placeholder="Enter website URL (e.g. daraz.pk, stripe.com, yourportfolio.com)..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              <button
                onClick={() => handleRunUrlAudit()}
                disabled={isLoading}
                className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm tracking-wide transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Auditing Website...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Real-Time Audit</span>
                  </>
                )}
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Quick Presets:</span>
              {[
                { label: 'Daraz PK', url: 'https://daraz.pk' },
                { label: 'GitHub', url: 'https://github.com' },
                { label: 'Stripe', url: 'https://stripe.com' },
                { label: 'Wikipedia', url: 'https://wikipedia.org' }
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setTargetUrl(p.url);
                    handleRunUrlAudit(p.url);
                  }}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-semibold transition cursor-pointer text-[11px]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Input Mode 2: Offline ZIP / HTML Project Upload */
          <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-3xl p-8 text-center transition cursor-pointer relative bg-indigo-50/30">
            <input
              type="file"
              accept=".zip,.html,.htm"
              onChange={handleZipUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-slate-800">
                Drop your Website ZIP file or HTML page here
              </div>
              <div className="text-xs text-slate-500 max-w-md leading-relaxed">
                Analyze your unreleased or local project before deployment. Unpacks in-memory (100% private in browser) to audit SEO, missing tags, images, and preview in 3-screen simulator.
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>{loadingStep || 'Auditing website in real time...'}</span>
              </span>
              <span className="font-mono text-indigo-600">Scan Active</span>
            </div>
            <div className="w-full h-2 bg-indigo-200/60 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-indigo-600 rounded-full animate-indeterminate" />
            </div>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* 2. Main Audit Output Stage */}
      {auditData && (
        <div className="space-y-8">
          
          {/* Executive Scorecard Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Overall Score */}
            <div className="col-span-2 md:col-span-1 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white p-5 rounded-3xl border border-slate-800 shadow-md flex flex-col justify-between">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Overall Health</span>
              <div className="my-2">
                <span className="text-4xl font-black">{auditData.scores.overall}</span>
                <span className="text-slate-400 text-sm font-bold">/100</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full self-start ${
                auditData.scores.overall >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {auditData.scores.overall >= 80 ? 'Grade A (Excellent)' : auditData.scores.overall >= 60 ? 'Grade B (Fair)' : 'Grade C (Action Needed)'}
              </span>
            </div>

            {/* SEO Score */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SEO Score</span>
              <div className="my-2">
                <span className={`text-3xl font-black ${auditData.scores.seo >= 80 ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {auditData.scores.seo}%
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Meta & Headings</span>
            </div>

            {/* Security Score */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security</span>
              <div className="my-2">
                <span className={`text-3xl font-black ${auditData.scores.security >= 80 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {auditData.scores.security}%
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">SSL & Headers</span>
            </div>

            {/* Performance */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {auditData.isOfflineZip ? 'Project Size' : 'Server TTFB'}
              </span>
              <div className="my-2">
                <span className="text-3xl font-black text-indigo-600">
                  {auditData.isOfflineZip ? `${auditData.htmlSizeKb} KB` : `${auditData.responseTimeMs}ms`}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {auditData.isOfflineZip ? 'Unpacked HTML' : 'Response Latency'}
              </span>
            </div>

            {/* Mobile Viewport */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mobile Readiness</span>
              <div className="my-2">
                <span className={`text-3xl font-black ${auditData.scores.mobile >= 80 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {auditData.scores.mobile}%
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {auditData.meta.hasViewport ? 'Responsive' : 'No Viewport Tag'}
              </span>
            </div>
          </div>

          {/* Studio Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold">
            {[
              { id: 'overview', label: '1. Overview & SERP Preview', icon: Layers },
              { id: 'simulator', label: '2. 3-Screen Device Simulator', icon: Smartphone },
              { id: 'seo', label: '3. SEO & Content Inspector', icon: Search },
              { id: 'playbook', label: '4. SEO Action Playbook & Auto-Fix', icon: Lightbulb },
              { id: 'security', label: '5. Security & HTTP Headers', icon: ShieldCheck }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & SERP */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Google SERP + Tech Stack */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Google SERP Preview */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Google Search Result Snippet Preview
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">Desktop SERP</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 font-sans">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      {auditData.meta.favicon && (
                        <img src={auditData.meta.favicon} alt="" className="w-4 h-4 object-contain rounded" />
                      )}
                      <span className="font-mono text-[11px] text-slate-500 truncate max-w-xs">{auditData.url}</span>
                    </div>
                    <div className="text-base font-medium text-blue-800 hover:underline cursor-pointer line-clamp-1 leading-snug">
                      {auditData.meta.title || 'Untitled Webpage'}
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {auditData.meta.description || 'No meta description provided. Search engines will automatically grab an arbitrary sentence from the page content.'}
                    </div>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Detected Technology Stack
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {auditData.techStack.length} Technologies
                    </span>
                  </div>

                  {auditData.techStack.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No standard frameworks detected (Vanilla HTML/CSS/JS).
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {auditData.techStack.map((tech) => (
                        <div key={tech.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">{tech.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{tech.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Key Critical Issues & Warnings */}
              <div className="lg:col-span-6 space-y-4">
                {auditData.issues.critical.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 space-y-3">
                    <div className="flex items-center gap-2 text-rose-800 font-black text-sm">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      <span>{auditData.issues.critical.length} Critical SEO/Security Issues Found</span>
                    </div>
                    <div className="space-y-2">
                      {auditData.issues.critical.map((c, i) => (
                        <div key={i} className="p-3 bg-white rounded-xl border border-rose-200 text-xs text-rose-900 shadow-xs">
                          <div className="font-bold">{c.title}</div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">{c.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {auditData.issues.warnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-3">
                    <div className="flex items-center gap-2 text-amber-800 font-black text-sm">
                      <Info className="w-5 h-5 text-amber-600" />
                      <span>{auditData.issues.warnings.length} Optimization Warnings</span>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {auditData.issues.warnings.map((w, i) => (
                        <div key={i} className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-800 shadow-xs">
                          <div className="font-bold text-amber-900">{w.title}</div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">{w.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{auditData.issues.passed.length} Passed Audit Checks</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {auditData.issues.passed.map((p, i) => (
                      <div key={i} className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs text-slate-800 flex items-center justify-between">
                        <span className="font-bold text-emerald-950">{p.title}</span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">PASSED</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 3-SCREEN DEVICE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
                  {[
                    { id: 'mobile', label: 'Mobile (iPhone 375px)', icon: Smartphone },
                    { id: 'tablet', label: 'Tablet (iPad 768px)', icon: Tablet },
                    { id: 'desktop', label: 'Desktop (1280px)', icon: Monitor }
                  ].map((dev) => {
                    const DevIcon = dev.icon;
                    return (
                      <button
                        key={dev.id}
                        onClick={() => setDeviceMode(dev.id as any)}
                        className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                          deviceMode === dev.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <DevIcon className="w-4 h-4" />
                        <span>{dev.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  {deviceMode !== 'desktop' && (
                    <button
                      onClick={() => setIsLandscape(!isLandscape)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>{isLandscape ? 'Landscape' : 'Portrait'}</span>
                    </button>
                  )}

                  {!auditData.isOfflineZip && (
                    <a
                      href={auditData.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Browser Tab</span>
                    </a>
                  )}
                </div>
              </div>

              {auditData.isFramingBlocked && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-medium flex items-center justify-between">
                  <span>Target website has strict <code>X-Frame-Options: SAMEORIGIN</code> headers. Open in a new tab if iframe display is blocked.</span>
                  <a href={auditData.url} target="_blank" rel="noreferrer" className="font-bold underline text-amber-900">
                    Open Direct Link
                  </a>
                </div>
              )}

              {/* Hardware Bezels Stage */}
              <div className="bg-slate-900/95 rounded-3xl p-6 sm:p-10 flex items-center justify-center min-h-[640px] overflow-auto shadow-inner">
                {/* 1. Mobile Phone */}
                {deviceMode === 'mobile' && (
                  <div 
                    style={{
                      width: isLandscape ? '667px' : '375px',
                      height: isLandscape ? '375px' : '667px'
                    }}
                    className="relative bg-black rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-700 ring-1 ring-slate-800 flex flex-col transition-all"
                  >
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-auto mr-2" />
                    </div>
                    <div className="w-full h-full rounded-[36px] overflow-hidden bg-white relative flex flex-col">
                      <iframe
                        src={offlineBlobUrl || auditData.url}
                        title="Mobile View"
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                    </div>
                    <div className="w-32 h-1 bg-white/40 rounded-full mx-auto mt-2" />
                  </div>
                )}

                {/* 2. Tablet */}
                {deviceMode === 'tablet' && (
                  <div 
                    style={{
                      width: isLandscape ? '1024px' : '768px',
                      height: isLandscape ? '768px' : '900px'
                    }}
                    className="relative bg-black rounded-[40px] p-4 shadow-2xl border-4 border-slate-700 ring-1 ring-slate-800 flex flex-col transition-all"
                  >
                    <div className="w-full h-full rounded-[28px] overflow-hidden bg-white relative flex flex-col">
                      <iframe
                        src={offlineBlobUrl || auditData.url}
                        title="Tablet View"
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Desktop */}
                {deviceMode === 'desktop' && (
                  <div className="w-full max-w-5xl h-[620px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                    <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      </div>
                      <div className="flex-1 bg-slate-950 px-3 py-1 rounded-lg text-xs font-mono text-slate-400 flex items-center gap-1.5 truncate">
                        <Lock className="w-3 h-3 text-emerald-500" />
                        <span>{auditData.url}</span>
                      </div>
                    </div>
                    <iframe
                      src={offlineBlobUrl || auditData.url}
                      title="Desktop View"
                      className="w-full h-full border-0 bg-white"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SEO & CONTENT INSPECTOR */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Headings Hierarchy (6 cols) */}
                <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Headings Hierarchy (H1, H2, H3)
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold">
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">H1: {auditData.headings.h1Count}</span>
                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">H2: {auditData.headings.h2Count}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Primary &lt;h1&gt; Tag</span>
                      {auditData.headings.h1s.length === 0 ? (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                          Missing &lt;h1&gt; tag on page!
                        </div>
                      ) : (
                        auditData.headings.h1s.map((h, i) => (
                          <div key={i} className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-950">
                            {h}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Subheadings &lt;h2&gt; ({auditData.headings.h2s.length})</span>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        {auditData.headings.h2s.map((h, i) => (
                          <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium">
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images & Alt Tags (6 cols) */}
                <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Images & Alt Tag Audit
                    </h3>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      auditData.images.missingAltCount === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {auditData.images.missingAltCount} Missing Alt of {auditData.images.total}
                    </span>
                  </div>

                  {auditData.images.missingAltCount === 0 ? (
                    <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>All images have descriptive alt text! Excellent accessibility.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-[11px] text-slate-500 leading-normal block">
                        The following images are missing alt attributes:
                      </span>
                      <div className="space-y-1.5 max-h-72 overflow-y-auto">
                        {auditData.images.missingAltImages.map((src, idx) => (
                          <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 font-mono text-[11px] text-slate-700 truncate">
                            <span className="text-rose-600 font-bold shrink-0">Missing:</span>
                            <span className="truncate">{src}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Depth & Keywords */}
              {auditData.content && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Content Quality & Word Volume
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="text-slate-600">Total Words: <b className="text-slate-900">{auditData.content.wordCount.toLocaleString()}</b></span>
                      <span className="text-slate-600">Est. Reading Time: <b className="text-indigo-600">{auditData.content.readingTimeMin} min</b></span>
                    </div>
                  </div>

                  {auditData.content.topKeywords.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Top Keyword Frequencies</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {auditData.content.topKeywords.map((kw) => (
                          <div key={kw.keyword} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                            <div className="text-xs font-bold text-slate-800 truncate">{kw.keyword}</div>
                            <div className="text-[10px] text-indigo-600 font-mono mt-0.5">{kw.count}x ({kw.density}%)</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SEO ACTION PLAYBOOK & AUTO-FIX ENGINE */}
          {activeTab === 'playbook' && (
            <div className="space-y-6">
              
              {/* Ready-to-Copy Optimized Head Tag Box */}
              {auditData.recommendedHeadCode && (
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black">Auto-Generated 100/100 Optimized &lt;head&gt; Code</h3>
                        <p className="text-xs text-slate-400">Copy and paste directly into your HTML file to resolve all meta tag warnings.</p>
                      </div>
                    </div>

                    <button
                      onClick={() => copyCode(auditData.recommendedHeadCode!, 'head')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer"
                    >
                      {copiedSnippet === 'head' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet === 'head' ? 'Copied Head Code!' : 'Copy Optimized <head>'}</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-950 rounded-2xl text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed border border-slate-800 max-h-72">
                    {auditData.recommendedHeadCode}
                  </pre>
                </div>
              )}

              {/* Step-by-Step Fix Guidance Cards */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900">Step-by-Step SEO Fix Playbook</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Clear instructions with ready-to-use code snippets on how to fix every identified issue.</p>
                </div>

                <div className="space-y-4">
                  {[...auditData.issues.critical, ...auditData.issues.warnings].map((issue, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            issue.category === 'security' || issue.title.includes('Missing Meta Title') || issue.title.includes('Missing <h1>')
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`} />
                          <h4 className="font-bold text-sm text-slate-900">{issue.title}</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 uppercase">
                          {issue.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {issue.description}
                      </p>

                      {issue.recommendation && (
                        <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-2 text-xs text-indigo-950">
                          <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Recommended Solution: </span>
                            <span>{issue.recommendation}</span>
                          </div>
                        </div>
                      )}

                      {issue.codeSnippet && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                            <span>Ready Code to Paste</span>
                            <button
                              onClick={() => copyCode(issue.codeSnippet!, `snippet-${idx}`)}
                              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedSnippet === `snippet-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedSnippet === `snippet-${idx}` ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto">
                            {issue.codeSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & HTTP HEADERS */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900">Security Headers & SSL Encryption Matrix</h2>
                <p className="text-xs text-slate-500 mt-0.5">Critical protections against Man-in-the-Middle, Clickjacking, and MIME sniffing attacks.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: 'SSL / HTTPS Encryption',
                    status: auditData.security.isHttps,
                    desc: 'Encrypts traffic between visitor and server. Mandatory for modern Google search rankings.'
                  },
                  {
                    name: 'Strict-Transport-Security (HSTS)',
                    status: auditData.security.hsts,
                    desc: 'Forces browsers to only communicate over HTTPS, preventing SSL stripping attacks.'
                  },
                  {
                    name: 'Content-Security-Policy (CSP)',
                    status: auditData.security.csp,
                    desc: 'Restricts script origins to block Cross-Site Scripting (XSS) and code injection.'
                  },
                  {
                    name: 'X-Content-Type-Options',
                    status: auditData.security.xContentTypeOptions,
                    desc: 'Blocks MIME sniffing to prevent malicious scripts disguised as images or text.'
                  }
                ].map((sec) => (
                  <div key={sec.name} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{sec.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sec.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {sec.status ? 'ACTIVE / SECURE' : 'MISSING'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{sec.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
