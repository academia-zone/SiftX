export type DeveloperCategory = 
  | 'website-audit'
  | 'types-and-schemas'
  | 'security-and-env'
  | 'ai-context';

export type DeveloperToolId =
  | 'website-auditor'
  | 'type-schema-converter'
  | 'env-doctor'
  | 'ai-context-optimizer';

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
  }
];
