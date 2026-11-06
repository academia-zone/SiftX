import http from 'http';

/**
 * SiftX Website Deep Auditor & Multi-Device SEO Service
 * Crawls live websites, evaluates SEO, Security, Performance & Tech Stack
 */

function isSafeAuditUrl(targetUrl) {
  const protocol = targetUrl.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    return false;
  }
  const hostname = targetUrl.hostname.toLowerCase();

  // Block localhost, loopback, and local network names
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return false;
  }

  // Block Cloud Metadata IP
  if (hostname === '169.254.169.254') {
    return false;
  }

  // Block private IPv4 ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  if (match) {
    const p1 = parseInt(match[1], 10);
    const p2 = parseInt(match[2], 10);
    if (p1 === 10) return false;
    if (p1 === 127) return false;
    if (p1 === 169 && p2 === 254) return false;
    if (p1 === 192 && p2 === 168) return false;
    if (p1 === 172 && p2 >= 16 && p2 <= 31) return false;
    if (p1 === 0) return false;
  }

  return true;
}

export async function handleAuditWebsiteRequest(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST or GET.' }));
    return;
  }

  let rawUrl = '';

  if (req.method === 'GET') {
    const urlObj = new URL(req.url, 'http://localhost');
    rawUrl = urlObj.searchParams.get('url') || '';
  } else {
    try {
      const body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      const parsed = JSON.parse(body || '{}');
      rawUrl = parsed.url || '';
    } catch {
      rawUrl = '';
    }
  }

  rawUrl = (rawUrl || '').trim();
  if (!rawUrl) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing target website URL' }));
    return;
  }

  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = 'https://' + rawUrl;
  }

  try {
    const targetUrl = new URL(rawUrl);
    if (!isSafeAuditUrl(targetUrl)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Invalid or restricted website URL. Scanning internal, private or localhost network addresses is strictly prohibited.'
      }));
      return;
    }

    const auditResult = await performDeepWebsiteAudit(targetUrl.toString());

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(auditResult));
  } catch (err) {
    console.error('[Website Audit Error]', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: `Failed to crawl and scan website: ${err.message || 'Unknown network error'}`
    }));
  }
}

export async function performDeepWebsiteAudit(url) {
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

  let response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 SiftXAuditBot/2.0 (+https://siftx.dev)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ur;q=0.8'
      }
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const responseTimeMs = Date.now() - startTime;
  const finalUrl = response.url || url;
  if (!isSafeAuditUrl(new URL(finalUrl))) {
    throw new Error('Target website redirected to an unauthorized or internal address.');
  }
  const statusCode = response.status;
  const isHttps = finalUrl.startsWith('https://');

  const headers = Object.fromEntries(response.headers.entries());
  const html = await response.text();
  const htmlSizeKb = Number((Buffer.byteLength(html, 'utf8') / 1024).toFixed(2));

  return parseAndAuditHtml(html, finalUrl, headers, {
    statusCode,
    responseTimeMs,
    htmlSizeKb,
    isHttps
  });
}

export function parseAndAuditHtml(html, finalUrl, headers = {}, extraMeta = {}) {
  const isHttps = extraMeta.isHttps ?? finalUrl.startsWith('https://');
  const responseTimeMs = extraMeta.responseTimeMs ?? 150;
  const htmlSizeKb = extraMeta.htmlSizeKb ?? Number((Buffer.byteLength(html, 'utf8') / 1024).toFixed(2));
  const statusCode = extraMeta.statusCode ?? 200;

  // 1. Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';

  // 2. Meta Tags Helper
  const getMeta = (nameOrProp) => {
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

  // Favicon
  const faviconMatch = html.match(/<link\s+[^>]*?rel=["'](?:shortcut\s+)?icon["'][^>]*?href=["']([^"']*)["']/i);
  let favicon = faviconMatch ? faviconMatch[1].trim() : '/favicon.ico';
  if (favicon && !favicon.startsWith('http://') && !favicon.startsWith('https://')) {
    try {
      favicon = new URL(favicon, finalUrl).toString();
    } catch {
      favicon = '';
    }
  }

  // Language Tag
  const langMatch = html.match(/<html[^>]*?\slang=["']([^"']*)["']/i);
  const lang = langMatch ? langMatch[1].trim() : '';

  // Charset
  const hasCharset = /<meta[^>]*?charset=["']?utf-8/i.test(html) || /charset=utf-8/i.test(headers['content-type'] || '');

  // 3. Headings Hierarchy
  const extractTags = (tag) => {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const list = [];
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

  // 4. Images Audit
  const imgRegex = /<img\s+([^>]*?)>/gi;
  let totalImages = 0;
  const missingAltImages = [];
  let imgMatch;

  while ((imgMatch = imgRegex.exec(html)) !== null) {
    totalImages++;
    const attrs = imgMatch[1];
    const srcMatch = attrs.match(/src=["']([^"']*)["']/i);
    const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
    const src = srcMatch ? srcMatch[1] : `image_${totalImages}`;

    if (!altMatch || !altMatch[1].trim()) {
      let resolvedSrc = src;
      try {
        if (!src.startsWith('http') && !src.startsWith('data:')) {
          resolvedSrc = new URL(src, finalUrl).toString();
        }
      } catch {
        resolvedSrc = src;
      }
      missingAltImages.push(resolvedSrc);
    }
  }

  // 5. OpenGraph & Social Cards
  const ogTitle = getMeta('og:title');
  const ogDescription = getMeta('og:description');
  let ogImage = getMeta('og:image');
  if (ogImage && !ogImage.startsWith('http') && !ogImage.startsWith('data:')) {
    try {
      ogImage = new URL(ogImage, finalUrl).toString();
    } catch {
      // keep
    }
  }
  const ogUrl = getMeta('og:url');
  const ogType = getMeta('og:type');
  const twitterCard = getMeta('twitter:card');
  const twitterTitle = getMeta('twitter:title');
  const twitterImage = getMeta('twitter:image');

  // 6. Security Headers Audit
  const hsts = headers['strict-transport-security'];
  const csp = headers['content-security-policy'];
  const xFrameOptions = headers['x-frame-options'];
  const xContentTypeOptions = headers['x-content-type-options'];
  const referrerPolicy = headers['referrer-policy'];

  const isFramingBlocked = Boolean(xFrameOptions && (xFrameOptions.toUpperCase() === 'DENY' || xFrameOptions.toUpperCase() === 'SAMEORIGIN'));

  // 7. Tech Stack Detection
  const techStack = [];
  if (html.includes('__NEXT_DATA__') || html.includes('/_next/')) techStack.push({ name: 'Next.js', category: 'Framework', icon: 'zap' });
  if (html.includes('data-reactroot') || html.includes('react.production.min.js') || /_app-/.test(html)) techStack.push({ name: 'React', category: 'Library', icon: 'code' });
  if (html.includes('data-v-') || html.includes('vue.global.js') || html.includes('__VUE__')) techStack.push({ name: 'Vue.js', category: 'Framework', icon: 'code' });
  if (html.includes('/wp-content/') || html.includes('/wp-includes/') || /generator["'] content=["']WordPress/i.test(html)) techStack.push({ name: 'WordPress', category: 'CMS', icon: 'globe' });
  if (html.includes('cdn.shopify.com') || html.includes('Shopify.theme')) techStack.push({ name: 'Shopify', category: 'E-Commerce', icon: 'shopping-cart' });
  if (html.includes('data-wf-page') || html.includes('assets.website-files.com')) techStack.push({ name: 'Webflow', category: 'No-Code CMS', icon: 'layout' });
  if (/tailwind/i.test(html) || /class="[^"]*(?:flex|grid|px-|py-|text-|bg-)/.test(html)) techStack.push({ name: 'Tailwind CSS', category: 'UI Framework', icon: 'palette' });
  if (html.includes('bootstrap.min.css') || html.includes('bootstrap.bundle')) techStack.push({ name: 'Bootstrap', category: 'UI Framework', icon: 'layout' });
  if (html.includes('googletagmanager.com') || html.includes('google-analytics.com')) techStack.push({ name: 'Google Analytics / GTM', category: 'Analytics', icon: 'activity' });
  if (headers['cf-ray'] || headers['server']?.toLowerCase().includes('cloudflare')) techStack.push({ name: 'Cloudflare CDN', category: 'CDN & Security', icon: 'shield' });
  if (headers['x-vercel-id']) techStack.push({ name: 'Vercel Edge', category: 'Cloud Hosting', icon: 'cloud' });

  // 8. Word Count & Keyword Density
  const cleanBodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleanBodyText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const wordCount = words.length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'your', 'have',
    'more', 'about', 'will', 'what', 'when', 'which', 'their', 'there',
    'been', 'were', 'than', 'them', 'they', 'into', 'also', 'some', 'could'
  ]);

  const freqMap = {};
  words.forEach(w => {
    if (!stopWords.has(w)) {
      freqMap[w] = (freqMap[w] || 0) + 1;
    }
  });

  const topKeywords = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: Number(((count / (wordCount || 1)) * 100).toFixed(1))
    }));

  // 9. Performance signals
  const scriptCount = (html.match(/<script\b/gi) || []).length;
  const styleCount = (html.match(/<link[^>]*rel=["']stylesheet["']/gi) || []).length;

  // ==========================================
  // COMPUTE CHECKLIST, RECOMMENDATIONS & SCORES
  // ==========================================
  const criticalIssues = [];
  const warnings = [];
  const passedChecks = [];

  // --- Title Check ---
  if (!title) {
    criticalIssues.push({
      title: 'Missing Meta Title',
      description: 'The webpage has no <title> tag. Search engines cannot rank this page without a title.',
      category: 'seo',
      impact: -20,
      recommendation: 'Add a targeted <title> tag inside the <head> element including your main brand and primary keyword.',
      codeSnippet: '<title>Primary Keyword - Brand Name | Core Benefit</title>'
    });
  } else if (title.length < 25) {
    warnings.push({
      title: 'Meta Title is Too Short',
      description: `Current title is ${title.length} chars ("${title}"). Recommended length is 45-60 characters for optimal Google CTR.`,
      category: 'seo',
      impact: -5,
      recommendation: 'Expand your title to between 45 and 60 characters to capture more search visibility.',
      codeSnippet: `<title>${title} | Fast, Reliable & Professional Services</title>`
    });
  } else if (title.length > 70) {
    warnings.push({
      title: 'Meta Title Exceeds 70 Characters',
      description: `Current title is ${title.length} characters and will be truncated with ellipsis (...) in Google search results.`,
      category: 'seo',
      impact: -5,
      recommendation: 'Shorten your title to under 65 characters so it does not get cut off on mobile search screens.',
      codeSnippet: `<title>${title.slice(0, 55)}...</title>`
    });
  } else {
    passedChecks.push({
      title: `Optimal Meta Title (${title.length} chars)`,
      description: `"${title}" fits cleanly within Google SERP display limits.`,
      category: 'seo'
    });
  }

  // --- Meta Description Check ---
  if (!description) {
    warnings.push({
      title: 'Missing Meta Description',
      description: 'No <meta name="description"> tag found. Google will generate an arbitrary text snippet from your page body.',
      category: 'seo',
      impact: -10,
      recommendation: 'Add an enticing 130-160 character meta description with a clear call-to-action.',
      codeSnippet: '<meta name="description" content="Discover modern tools, high performance workflows, and seamless user experiences tailored for your business. Learn more today.">'
    });
  } else if (description.length < 70) {
    warnings.push({
      title: 'Meta Description is Too Short',
      description: `Current description is only ${description.length} characters. Aim for 120-160 characters for maximum search snippet real estate.`,
      category: 'seo',
      impact: -4,
      recommendation: 'Expand your description with secondary benefits and a prompt to click.',
      codeSnippet: `<meta name="description" content="${description} Discover all features and get started today.">`
    });
  } else if (description.length > 175) {
    warnings.push({
      title: 'Meta Description is Too Long',
      description: `Current description is ${description.length} characters and may be clipped on mobile search screens.`,
      category: 'seo',
      impact: -4,
      recommendation: 'Trim your description to under 160 characters to prevent truncation.',
      codeSnippet: `<meta name="description" content="${description.slice(0, 155)}...">`
    });
  } else {
    passedChecks.push({
      title: `Optimal Meta Description (${description.length} chars)`,
      description: 'Description length is within the sweet spot (120-160 chars).',
      category: 'seo'
    });
  }

  // --- H1 Hierarchy Check ---
  if (h1s.length === 0) {
    criticalIssues.push({
      title: 'No <h1> Heading Found',
      description: 'Every webpage must have exactly one <h1> heading defining its main topic for search engines and accessibility.',
      category: 'seo',
      impact: -15,
      recommendation: 'Add a single <h1> heading at the top of your main content area summarizing your page.',
      codeSnippet: `<h1>${title ? title.split('-')[0].trim() : 'Your Main Service or Topic'}</h1>`
    });
  } else if (h1s.length > 1) {
    warnings.push({
      title: `Multiple <h1> Headings Detected (${h1s.length})`,
      description: 'Multiple <h1> tags dilute keyword focus. Modern SEO best practice recommends one primary <h1>, followed by <h2> and <h3> subheadings.',
      category: 'seo',
      impact: -5,
      recommendation: 'Keep only one primary <h1> and convert secondary headings to <h2> tags.',
      codeSnippet: `<!-- Convert extra <h1> tags to <h2> -->\n<h2>${h1s[1] || 'Sub Topic'}</h2>`
    });
  } else {
    passedChecks.push({
      title: 'Perfect <h1> Heading Structure',
      description: `Single clean primary topic: "${h1s[0]}".`,
      category: 'seo'
    });
  }

  // --- Mobile Viewport Tag ---
  if (!hasViewport) {
    criticalIssues.push({
      title: 'Missing Mobile Viewport Tag',
      description: 'No <meta name="viewport" content="width=device-width, initial-scale=1"> tag found. Google will penalize this site in mobile search rankings.',
      category: 'mobile',
      impact: -20,
      recommendation: 'Add the standard responsive viewport meta tag inside <head>.',
      codeSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    });
  } else {
    passedChecks.push({
      title: 'Mobile Viewport Configured',
      description: 'Page scales responsively on mobile phones and tablets.',
      category: 'mobile'
    });
  }

  // --- SSL / HTTPS ---
  if (!isHttps) {
    criticalIssues.push({
      title: 'Insecure HTTP Connection (No SSL)',
      description: 'Site is served over unencrypted HTTP. Browsers display a "Not Secure" warning and Google demotes insecure sites.',
      category: 'security',
      impact: -30,
      recommendation: 'Enable an SSL certificate on your hosting provider or route DNS via Cloudflare to enforce HTTPS.',
      codeSnippet: '# Nginx HTTPS redirect block\nserver {\n    listen 80;\n    server_name yourdomain.com;\n    return 301 https://$host$request_uri;\n}'
    });
  } else {
    passedChecks.push({
      title: 'SSL / HTTPS Active',
      description: 'Connection is encrypted and secure.',
      category: 'security'
    });
  }

  // --- Image Alt Tags ---
  if (totalImages > 0 && missingAltImages.length > 0) {
    const pctMissing = Math.round((missingAltImages.length / totalImages) * 100);
    warnings.push({
      title: `${missingAltImages.length} Images Missing Alt Text (${pctMissing}%)`,
      description: `${missingAltImages.length} of ${totalImages} images do not have descriptive alt attributes, hurting Google Image search rankings and screen reader accessibility.`,
      category: 'seo',
      impact: Math.min(15, missingAltImages.length * 2),
      recommendation: 'Provide descriptive alt text for each image explaining what is shown.',
      codeSnippet: '<img src="/path/to/image.jpg" alt="Descriptive caption describing the graphic or product">'
    });
  } else if (totalImages > 0) {
    passedChecks.push({
      title: `All ${totalImages} Images Have Alt Text`,
      description: 'Images are properly tagged for SEO and accessibility.',
      category: 'seo'
    });
  }

  // --- OpenGraph Social Share ---
  if (!ogTitle || !ogImage) {
    warnings.push({
      title: 'Incomplete Social Media OpenGraph Tags',
      description: `${!ogTitle ? 'og:title ' : ''}${!ogImage ? 'og:image ' : ''}is missing. When shared on WhatsApp, Twitter, or LinkedIn, the link preview will appear blank or incomplete.`,
      category: 'social',
      impact: -8,
      recommendation: 'Add OpenGraph and Twitter card meta tags to customize how social media platforms display your link.',
      codeSnippet: `<meta property="og:title" content="${title || 'Site Title'}">\n<meta property="og:description" content="${description || 'Site Description'}">\n<meta property="og:image" content="https://yourdomain.com/og-banner.jpg">\n<meta name="twitter:card" content="summary_large_image">`
    });
  } else {
    passedChecks.push({
      title: 'Social OpenGraph Cards Configured',
      description: 'Rich preview cards with title and image will render when shared on social apps.',
      category: 'social'
    });
  }

  // --- Security Headers ---
  if (!hsts) {
    warnings.push({
      title: 'Missing HSTS Security Header',
      description: 'Strict-Transport-Security header is not present. Enables downgrade attacks.',
      category: 'security',
      impact: -5,
      recommendation: 'Add the Strict-Transport-Security header to your web server config.',
      codeSnippet: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'
    });
  } else {
    passedChecks.push({
      title: 'HSTS Header Active',
      description: 'Enforces HTTPS on all subsequent connections.',
      category: 'security'
    });
  }

  if (!xContentTypeOptions) {
    warnings.push({
      title: 'Missing X-Content-Type-Options Header',
      description: 'X-Content-Type-Options: nosniff is missing, leaving browsers vulnerable to MIME type spoofing.',
      category: 'security',
      impact: -3,
      recommendation: 'Instruct browsers to not sniff MIME types.',
      codeSnippet: 'X-Content-Type-Options: nosniff'
    });
  } else {
    passedChecks.push({
      title: 'X-Content-Type-Options: nosniff Active',
      description: 'Prevents MIME sniffing attacks.',
      category: 'security'
    });
  }

  // --- Canonical Tag ---
  if (canonicalUrl) {
    passedChecks.push({
      title: 'Canonical Tag Present',
      description: `Tells search engines the authoritative URL (${canonicalUrl}).`,
      category: 'seo'
    });
  } else {
    warnings.push({
      title: 'Missing Canonical Tag',
      description: 'No <link rel="canonical"> tag detected. This can cause duplicate content issues if your site is reachable via www and non-www.',
      category: 'seo',
      impact: -4,
      recommendation: 'Add a self-referencing canonical tag inside <head>.',
      codeSnippet: `<link rel="canonical" href="${finalUrl}">`
    });
  }

  // --- Charset & Lang ---
  if (hasCharset) {
    passedChecks.push({
      title: 'UTF-8 Charset Declared',
      description: 'Character encoding is explicitly set to UTF-8.',
      category: 'seo'
    });
  }

  if (lang) {
    passedChecks.push({
      title: `HTML Language Defined (lang="${lang}")`,
      description: 'Search engines can identify the target linguistic audience.',
      category: 'seo'
    });
  }

  // Calculate Scores
  let seoDeductions = 0;
  let secDeductions = 0;

  criticalIssues.forEach(c => {
    if (c.category === 'security') secDeductions += Math.abs(c.impact || 20);
    else seoDeductions += Math.abs(c.impact || 15);
  });

  warnings.forEach(w => {
    if (w.category === 'security') secDeductions += Math.abs(w.impact || 5);
    else seoDeductions += Math.abs(w.impact || 5);
  });

  const seoScore = Math.max(10, Math.min(100, 100 - seoDeductions));
  const securityScore = Math.max(10, Math.min(100, 100 - secDeductions));
  const performanceScore = responseTimeMs < 400 ? 95 : responseTimeMs < 1000 ? 82 : responseTimeMs < 2000 ? 68 : 45;
  const mobileScore = hasViewport ? 95 : 30;

  const overallScore = Math.round((seoScore * 0.4) + (securityScore * 0.25) + (performanceScore * 0.2) + (mobileScore * 0.15));

  // Generated Complete Ready-to-Paste Head Code
  const recommendedHeadCode = `<!-- Recommended Optimized <head> Snippet for ${new URL(finalUrl).hostname} -->
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Primary Keyword - Brand Name | Core Benefit'}</title>
  <meta name="description" content="${description || 'Discover modern solutions and high-performance workflows tailored for you. Learn more today.'}">
  <link rel="canonical" href="${canonicalUrl || finalUrl}">
  <meta name="robots" content="index, follow">

  <!-- Open Graph / Social Media Preview -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${finalUrl}">
  <meta property="og:title" content="${ogTitle || title || 'Brand Name'}">
  <meta property="og:description" content="${ogDescription || description || 'Site Summary'}">
  <meta property="og:image" content="${ogImage || 'https://yourdomain.com/og-image.jpg'}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${twitterTitle || title || 'Brand Name'}">
  <meta name="twitter:description" content="${description || 'Site Summary'}">
  <meta name="twitter:image" content="${twitterImage || ogImage || 'https://yourdomain.com/og-image.jpg'}">
</head>`;

  return {
    url: finalUrl,
    statusCode,
    responseTimeMs,
    htmlSizeKb,
    isHttps,
    isFramingBlocked,
    scores: {
      overall: overallScore,
      seo: seoScore,
      security: securityScore,
      performance: performanceScore,
      mobile: mobileScore
    },
    meta: {
      title,
      titleLength: title.length,
      description,
      descriptionLength: description.length,
      keywords,
      robots,
      canonicalUrl,
      favicon,
      lang,
      hasViewport,
      hasCharset
    },
    headings: {
      h1Count: h1s.length,
      h1s,
      h2Count: h2s.length,
      h2s: h2s.slice(0, 10),
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
      isHttps,
      hsts: Boolean(hsts),
      csp: Boolean(csp),
      xFrameOptions: xFrameOptions || 'None',
      xContentTypeOptions: Boolean(xContentTypeOptions),
      referrerPolicy: referrerPolicy || 'Not Set'
    },
    content: {
      wordCount,
      readingTimeMin,
      topKeywords
    },
    performance: {
      responseTimeMs,
      htmlSizeKb,
      scriptCount,
      styleCount
    },
    techStack,
    issues: {
      critical: criticalIssues,
      warnings,
      passed: passedChecks
    },
    recommendedHeadCode
  };
}
