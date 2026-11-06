export type DeveloperCategory = 
  | 'website-audit'
  | 'types-and-schemas'
  | 'security-and-env'
  | 'ai-context'
  | 'formatters'
  | 'utilities';

export type DeveloperToolId =
  | 'website-auditor'
  | 'type-schema-converter'
  | 'env-doctor'
  | 'ai-context-optimizer'
  | 'json-formatter'
  | 'base64'
  | 'uuid-password'
  | 'regex-tester'
  | 'jwt-inspector'
  | 'curl-to-code'
  | 'git-conflict-resolver'
  | 'opengraph-previewer'
  | 'svg-to-react';

export interface DeveloperToolItem {
  id: DeveloperToolId;
  name: string;
  nameUrdu: string;
  category: DeveloperCategory;
  tagline: string;
  description: string;
  badge?: '2026 Flagship' | 'High Impact' | 'Security' | 'AI-Native';
  icon: string;
  keywords: string[];
}

export const DEVELOPER_TOOLS: DeveloperToolItem[] = [
  // 1. Website Deep Auditor & 3-Screen Simulator
  {
    id: 'website-auditor',
    name: 'Website Deep Auditor & 3-Screen Simulator',
    nameUrdu: 'مکمل ویب سائٹ لائیو اسکینر، ایس ای او اور موبائل سمیلیٹر',
    category: 'website-audit',
    tagline: 'Deep crawl any website URL: SEO health, missing headings, image alts, security headers, tech stack, and interactive 3-screen mobile/tablet/desktop simulator',
    description: 'Enter any live website link to run an exhaustive audit: meta titles, description, H1-H3 hierarchy, image alt tags, SSL/HTTPS headers, Wappalyzer-style tech stack detection, and test live responsiveness across iPhone, iPad, and Desktop viewports.',
    badge: '2026 Flagship',
    icon: 'Globe',
    keywords: ['seo auditor', 'website scan', 'site audit', 'mobile simulator', 'headings', 'alt tags', 'security headers', 'tech stack']
  },
  // 2. Type & Schema Transpiler
  {
    id: 'type-schema-converter',
    name: 'Universal Type & Schema Transpiler',
    nameUrdu: 'یونیورسل اسکیما اور ٹائپ کنورٹر',
    category: 'types-and-schemas',
    tagline: 'Instantly convert raw JSON into TypeScript, Zod, Python Pydantic & Go structs',
    description: 'Never write manual boilerplate types again. Paste raw JSON or API response and get strictly typed TypeScript interfaces, runtime Zod validation schemas, Pydantic v2 models, or Go structs with 1 click.',
    badge: 'High Impact',
    icon: 'Boxes',
    keywords: ['typescript', 'json to ts', 'zod', 'pydantic', 'go struct', 'schema', 'types']
  },
  // 3. .env Doctor & Secret Leak Auditor
  {
    id: 'env-doctor',
    name: '.env Doctor & Secret Auditor',
    nameUrdu: 'ماحولیاتی متغیرات اور ڈاٹ اینو ڈاکٹر',
    category: 'security-and-env',
    tagline: 'Compare .env files, catch missing variables, fix unquoted spaces, and prevent 2 AM deployment crashes',
    description: 'Drop .env.example, .env.local, or .env.production. Instantly highlights missing keys, malformed values, duplicate variables, unquoted whitespace, and warns if sensitive production keys are leaking.',
    badge: 'Security',
    icon: 'FileCheck',
    keywords: ['env', 'environment variables', 'dotenv', 'audit', 'secret', 'diff']
  },
  // 4. AI Context Optimizer & Token Calculator
  {
    id: 'ai-context-optimizer',
    name: 'AI Context Optimizer & Token Counter',
    nameUrdu: 'اے آئی کانٹیکسٹ سکیڑنے والا اور ٹوکن کیلکولیٹر',
    category: 'ai-context',
    tagline: 'Compress prompt context, strip comments, calculate token count & estimate API costs for GPT-4o, Claude & Gemini',
    description: 'Reduces prompt token bloat by up to 60%. Automatically cleans dead comments, trims whitespace, condenses JSON, and calculates exact tokens and pricing across major LLMs before submitting.',
    badge: 'AI-Native',
    icon: 'Sparkles',
    keywords: ['token counter', 'prompt optimizer', 'compress context', 'gpt-4o', 'claude', 'gemini cost']
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    nameUrdu: 'جے ایس او این فارمیٹر اور ویلیڈیٹر',
    category: 'formatters',
    tagline: 'Format, validate, prettify and minify JSON with syntax highlighting',
    description: 'Format unreadable JSON, spot syntax errors instantly, and minify for production.',
    badge: 'High Impact',
    icon: 'Code2',
    keywords: ['json', 'format', 'minify', 'prettify', 'beautify']
  },
  {
    id: 'base64',
    name: 'Base64 Encoder & Decoder',
    nameUrdu: 'بیس 64 انکوڈر اور ڈیکوڈر',
    category: 'utilities',
    tagline: 'Encode and decode Base64 strings, binary payloads, and Data URIs',
    description: 'Fast client-side Base64 conversion with URL-safe format and Data URI generator.',
    icon: 'Code2',
    keywords: ['base64', 'encode', 'decode', 'data uri']
  },
  {
    id: 'uuid-password',
    name: 'UUID & Password Generator',
    nameUrdu: 'یو یو آئی ڈی اور پاس ورڈ جنریٹر',
    category: 'utilities',
    tagline: 'Generate cryptographically secure UUIDs (v4) and high-entropy passwords',
    description: 'Bulk UUID generation and customizable password strength with zero storage.',
    badge: 'Security',
    icon: 'FileCheck',
    keywords: ['uuid', 'guid', 'password', 'random', 'security']
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester & Debugger',
    nameUrdu: 'ریجیکس ٹیسٹر اور ڈیبگر',
    category: 'utilities',
    tagline: 'Real-time regular expression testing with match group inspection',
    description: 'Test regex expressions live against sample text with flag toggles and match counts.',
    icon: 'Code2',
    keywords: ['regex', 'regular expression', 'test', 'pattern', 'match']
  },
  {
    id: 'jwt-inspector',
    name: 'JWT Token Inspector',
    nameUrdu: 'جے ڈبلیو ٹی ٹوکن انسپکٹر',
    category: 'security-and-env',
    tagline: 'Decode, inspect, and verify JSON Web Tokens client-side without leaks',
    description: 'Inspect JWT header, payload claims, expiration timestamps, and signature status.',
    badge: 'Security',
    icon: 'FileCheck',
    keywords: ['jwt', 'token', 'auth', 'bearer', 'decode']
  },
  {
    id: 'curl-to-code',
    name: 'cURL to Code Converter',
    nameUrdu: 'سی یو آر ایل ٹو کوڈ کنورٹر',
    category: 'utilities',
    tagline: 'Convert cURL terminal commands into JavaScript, Python, and Go request snippets',
    description: 'Paste any curl command to generate fetch, axios, requests, or native HTTP code.',
    icon: 'Code2',
    keywords: ['curl', 'fetch', 'axios', 'python requests', 'http']
  },
  {
    id: 'git-conflict-resolver',
    name: 'Git Conflict 3-Way Merger',
    nameUrdu: 'گٹ کنفلکٹ ریزولور',
    category: 'utilities',
    tagline: 'Resolve merge conflicts with interactive split-diff and one-click resolution',
    description: 'Paste conflicted git files, pick ours or theirs, and copy clean output.',
    icon: 'Boxes',
    keywords: ['git', 'merge', 'conflict', 'diff']
  },
  {
    id: 'opengraph-previewer',
    name: 'OpenGraph & Social Meta Previewer',
    nameUrdu: 'اوپن گراف اور سوشل میڈیا پریویو',
    category: 'website-audit',
    tagline: 'Preview how your links appear on Twitter/X, LinkedIn, Facebook, and Slack',
    description: 'Test og:title, og:image, and Twitter cards to ensure perfect social sharing.',
    badge: 'High Impact',
    icon: 'Globe',
    keywords: ['opengraph', 'og', 'twitter card', 'social preview', 'meta tags']
  },
  {
    id: 'svg-to-react',
    name: 'SVG to React JSX Component',
    nameUrdu: 'ایس وی جی ٹو ری ایکٹ کنورٹر',
    category: 'types-and-schemas',
    tagline: 'Clean and transform raw SVG code into production-ready React TSX/JSX components',
    description: 'Removes hardcoded dimensions, cleans IDs, camelCases attributes, and exports components.',
    icon: 'Boxes',
    keywords: ['svg', 'react', 'jsx', 'tsx', 'icon']
  }
];
