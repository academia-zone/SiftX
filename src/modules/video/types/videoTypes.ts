export type VideoToolId =
  | 'video-compressor'
  | 'video-trimmer'
  | 'video-merger'
  | 'video-to-mp3'
  | 'video-format-converter'
  | 'gif-maker'
  | 'video-resizer'
  | 'subtitle-generator';

export interface VideoToolMeta {
  id: VideoToolId;
  name: string;
  nameUrdu: string;
  category: 'Editing' | 'Compression & Conversion' | 'Animation & Captions';
  tagline: string;
  description: string;
  iconName: string;
  badge?: string;
  highlights: string[];
}

export const VIDEO_TOOLS: VideoToolMeta[] = [
  {
    id: 'video-compressor',
    name: 'Video Compressor',
    nameUrdu: 'ویڈیو سائز چھوٹا کریں',
    category: 'Compression & Conversion',
    tagline: 'Compress MP4, MOV, and WebM videos for WhatsApp & Email',
    description: 'Smart resolution and bitrate optimization with 1-click WhatsApp (16MB), Email (25MB), or custom target compression presets.',
    iconName: 'Minimize2',
    badge: '-75% Size',
    highlights: ['WhatsApp 16MB preset', 'Email 25MB preset', 'Custom target percentage', '100% private in-browser'],
  },
  {
    id: 'video-trimmer',
    name: 'Video Trimmer & Cutter',
    nameUrdu: 'ویڈیو کٹ اور ٹرم کریں',
    category: 'Editing',
    tagline: 'Trim and cut video clips with visual timeline and millisecond accuracy',
    description: 'Scrub through timeline frames, set start and end points, and cut out unwanted sections without re-uploading.',
    iconName: 'Scissors',
    badge: 'Frame Accurate',
    highlights: ['Visual interactive timeline', 'Millisecond precision', 'Instant video preview', 'Zero loss export'],
  },
  {
    id: 'video-merger',
    name: 'Video Merger',
    nameUrdu: 'ویڈیوز جوڑیں',
    category: 'Editing',
    tagline: 'Combine multiple clips into a single continuous film',
    description: 'Merge separate video clips in custom sequence order with automatic resolution and aspect ratio matching.',
    iconName: 'Film',
    badge: 'Multi-Clip',
    highlights: ['Multi-video drag & drop', 'Reorderable clip list', 'Resolution auto-match', 'Seamless playback'],
  },
  {
    id: 'video-to-mp3',
    name: 'Video to MP3 & Audio',
    nameUrdu: 'ویڈیو سے آڈیو نکالیں',
    category: 'Compression & Conversion',
    tagline: 'Extract high-fidelity audio tracks from video files at 320 kbps',
    description: 'Direct audio track decoding from MP4, WebM, MKV, and MOV files into crystal-clear MP3 and WAV sound files.',
    iconName: 'Music',
    badge: '320 kbps High-Res',
    highlights: ['Pure audio extraction', 'MP3 & WAV format choices', 'Built-in audio player', 'Instant download'],
  },
  {
    id: 'video-format-converter',
    name: 'Video Format Converter',
    nameUrdu: 'ویڈیو فارمیٹ کنورٹر',
    category: 'Compression & Conversion',
    tagline: 'Convert between MP4, WebM, and MKV video formats',
    description: 'Client-side hardware-accelerated video transcoding with customizable resolution and quality settings.',
    iconName: 'RefreshCw',
    badge: 'Hardware Fast',
    highlights: ['MP4 / WebM / MKV outputs', 'Resolution scaling', 'Quality bitrate control', 'Batch readiness'],
  },
  {
    id: 'gif-maker',
    name: 'GIF Maker & Animator',
    nameUrdu: 'اینیمیٹڈ GIF بنائیں',
    category: 'Animation & Captions',
    tagline: 'Transform video clips or image sequences into animated GIFs',
    description: 'Capture exact video segments, set custom frame rate (10 to 30 FPS), adjust speed, and loop forever for social media memes.',
    iconName: 'Sparkles',
    badge: 'Meme Ready',
    highlights: ['FPS speed control', 'Infinite loop options', 'Resolution scaling', '1-click GIF download'],
  },
  {
    id: 'video-resizer',
    name: 'Video Resizer & Social Cropper',
    nameUrdu: 'سوشل میڈیا ویڈیو سائزنگ',
    category: 'Editing',
    tagline: 'Fit videos for TikTok (9:16), YouTube (16:9), and Instagram (1:1)',
    description: 'Adapt widescreen videos for portrait mobile screens with smart blurred background padding or centered crop.',
    iconName: 'Maximize2',
    badge: 'TikTok / Reels',
    highlights: ['TikTok 9:16 preset', 'YouTube 16:9 preset', 'Instagram 1:1 preset', 'Blurred padding backdrop'],
  },
  {
    id: 'subtitle-generator',
    name: 'Auto Subtitle & Caption Generator',
    nameUrdu: 'خودکار وائس سب ٹائٹلز',
    category: 'Animation & Captions',
    tagline: 'Generate subtitles automatically with voice recognition & export SRT/VTT',
    description: 'Auto-transcribe Urdu and English voice into synchronized subtitles with live overlay preview and instant SRT / VTT export.',
    iconName: 'Subtitles',
    badge: '🎙️ Voice AI Auto-Sync',
    highlights: ['Urdu & English voice sync', 'Live speech auto-transcribe', 'Dialogue silence detection', 'SRT & WebVTT export'],
  },
];
