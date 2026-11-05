import { ALL_TOOLS } from '../data/toolsData';
import type { ToolItem } from '../types';

export interface ResolvedToolInfo {
  tool: ToolItem;
  studio: 'pdf' | 'audio' | 'calculators' | 'image' | 'video' | 'developer' | 'logo-remover' | 'cv-creator' | 'image-separator';
  studioRoute: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
}

export function resolveToolById(toolIdOrSlug: string): ResolvedToolInfo | null {
  if (!toolIdOrSlug) return null;
  const slug = toolIdOrSlug.toLowerCase().trim();

  // Find tool in ALL_TOOLS
  const tool = ALL_TOOLS.find((t) => t.id === slug || t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
  if (!tool) return null;

  let studio: ResolvedToolInfo['studio'] = 'pdf';
  let studioRoute = '/pdf';

  switch (tool.mainCategory) {
    case 'pdf-tools':
      studio = 'pdf';
      studioRoute = '/pdf';
      break;
    case 'audio-tools':
      studio = 'audio';
      studioRoute = '/audio';
      break;
    case 'calculators':
      studio = 'calculators';
      studioRoute = '/calculators';
      break;
    case 'image-tools':
      studio = 'image';
      studioRoute = '/image';
      break;
    case 'video-tools':
      studio = 'video';
      studioRoute = '/video';
      break;
    case 'developer-tools':
      studio = 'developer';
      studioRoute = '/developer';
      break;
    case 'logo-remover':
      studio = 'logo-remover';
      studioRoute = '/logo-remover';
      break;
    case 'cv-creator':
      studio = 'cv-creator';
      studioRoute = '/cv-creator';
      break;
    case 'image-separator':
      studio = 'image-separator';
      studioRoute = '/image-separator';
      break;
    default:
      studio = 'pdf';
      studioRoute = '/pdf';
  }

  const seoTitle = `${tool.name} | Free Online Tool (100% Private) - SiftX`;
  const seoDescription = `${tool.tagline}. ${tool.description} No cloud upload, runs client-side in browser memory.`;
  const keywords = [
    tool.name.toLowerCase(),
    'online tool',
    'free tool 2026',
    'private tool',
    'no watermark',
    'siftx workplace',
    tool.mainCategory.replace('-tools', ''),
  ];

  return {
    tool,
    studio,
    studioRoute,
    seoTitle,
    seoDescription,
    keywords,
  };
}
