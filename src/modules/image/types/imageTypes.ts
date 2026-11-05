export type ImageToolId =
  | 'image-compressor'
  | 'image-resizer'
  | 'image-cropper'
  | 'image-converter'
  | 'bg-remover'
  | 'image-ocr'
  | 'image-upscaler'
  | 'color-picker'
  | 'qr-generator'
  | 'image-watermark';

export interface ImageToolMeta {
  id: ImageToolId;
  name: string;
  nameUrdu: string;
  category: 'Optimization' | 'Editing' | 'Extraction & Utilities';
  tagline: string;
  description: string;
  iconName: string;
  badge?: string;
  highlights: string[];
}

export const IMAGE_TOOLS: ImageToolMeta[] = [
  {
    id: 'bg-remover',
    name: 'AI Background Remover',
    nameUrdu: 'بیک گراؤنڈ ریموور',
    category: 'Extraction & Utilities',
    tagline: '1-click transparent background cutout and replacement',
    description: 'Instantly cut out people, products, and objects from photos. Download with transparent background or replace with studio solid colors.',
    iconName: 'Wand2',
    badge: 'AI Powered',
    highlights: ['Automatic alpha cutout', 'Transparent PNG export', 'Solid background colors', '100% in-browser privacy'],
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    nameUrdu: 'تصویر کا سائز چھوٹا کریں',
    category: 'Optimization',
    tagline: 'Reduce file size up to 90% without visible quality loss',
    description: 'Compress JPG, PNG, and WebP images for websites, apps, and portfolios with interactive target percentage sliders and live size comparisons.',
    iconName: 'Minimize2',
    badge: '-90% Lossless',
    highlights: ['Interactive reduction slider', 'Live KB comparison', 'Instant preview', 'Batch support'],
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    nameUrdu: 'سائز و پیمائش بدلیں',
    category: 'Editing',
    tagline: 'Resize by pixels, percentages, or social media presets',
    description: 'Accurately scale photos for YouTube thumbnails, Instagram posts, Facebook covers, passport photos, or custom width/height dimensions.',
    iconName: 'Maximize2',
    badge: 'Social Presets',
    highlights: ['YouTube / Insta presets', 'Aspect ratio locking', 'Passport 35x45mm sizing', 'High-res resampling'],
  },
  {
    id: 'image-cropper',
    name: 'Smart Image Cropper',
    nameUrdu: 'تصویر کراپ کریں',
    category: 'Editing',
    tagline: 'Crop photos with standard aspect ratios or custom frames',
    description: 'Crop images with preset ratios (1:1 square, 16:9 widescreen, 4:3, 9:16 portrait) or drag freely to frame your subjects perfectly.',
    iconName: 'Crop',
    badge: 'Aspect Locking',
    highlights: ['1:1, 16:9, 4:3 ratios', 'Freeform crop grid', 'Exact pixel readout', 'Lossless crop download'],
  },
  {
    id: 'image-converter',
    name: 'Image Format Converter',
    nameUrdu: 'فارمیٹ تبدیل کریں',
    category: 'Editing',
    tagline: 'Convert between PNG, JPG, WebP, GIF, BMP, and SVG',
    description: 'Easily convert images across modern web and legacy formats with custom transparency handling and adjustable JPEG/WebP quality.',
    iconName: 'RefreshCw',
    badge: 'Multi-Format',
    highlights: ['PNG to JPG / WebP', 'SVG wrapper export', 'Quality compression', 'Instant batch convert'],
  },
  {
    id: 'image-ocr',
    name: 'Image to Text (OCR Scanner)',
    nameUrdu: 'تصویر سے ٹیکسٹ نکالیں',
    category: 'Extraction & Utilities',
    tagline: 'Extract printed and handwritten text from photos and screenshots',
    description: 'Scan documents, book pages, business cards, and receipts to extract editable text with dual English and Urdu script recognition.',
    iconName: 'FileText',
    badge: 'Urdu & English OCR',
    highlights: ['Screenshot reader', 'Book page digitizer', '1-click copy text', 'Export to TXT / Word'],
  },
  {
    id: 'image-upscaler',
    name: 'Image Upscaler & Enhancer',
    nameUrdu: 'تصویر بڑی اور واضح کریں',
    category: 'Optimization',
    tagline: 'Enlarge low-resolution photos 2x and 4x with sharpness enhancement',
    description: 'Super-sample low-resolution pictures and restore crisp details, sharpen edges, and tune exposure, contrast, and saturation.',
    iconName: 'Sparkles',
    badge: '2x & 4x Scale',
    highlights: ['2x / 4x bicubic super-sampling', 'Edge sharpening', 'Contrast & exposure boost', 'Crystal clear output'],
  },
  {
    id: 'color-picker',
    name: 'Color Palette & Eyedropper',
    nameUrdu: 'رنگ چنیں اور پیلیٹ بنائیں',
    category: 'Extraction & Utilities',
    tagline: 'Pick colors with an eyedropper loupe and extract 6-color palettes',
    description: 'Hover and click anywhere on an image with a precision magnifier to inspect exact HEX, RGB, and HSL values, and extract harmonious brand palettes.',
    iconName: 'Pipette',
    badge: 'Design Palette',
    highlights: ['Precision loupe zoom', 'HEX, RGB, HSL codes', 'Dominant palette extraction', '1-click clipboard copy'],
  },
  {
    id: 'qr-generator',
    name: 'QR Code & Barcode Studio',
    nameUrdu: 'کیو آر کوڈ جنریٹر',
    category: 'Extraction & Utilities',
    tagline: 'Generate custom branded QR codes for URLs, WiFi, and WhatsApp',
    description: 'Create high-resolution QR codes for websites, automatic WiFi login, WhatsApp direct chat, phone numbers, and vCard contact cards with custom colors.',
    iconName: 'QrCode',
    badge: 'Custom Colors',
    highlights: ['WiFi / WhatsApp / URL modes', 'Custom foreground/background', 'High-res PNG & SVG', 'Print ready'],
  },
  {
    id: 'image-watermark',
    name: 'Watermark & Text Stamping',
    nameUrdu: 'واٹر مارک اور لوگو لگائیں',
    category: 'Editing',
    tagline: 'Protect photos with copyright watermarks and logo overlays',
    description: 'Add transparent text watermarks, copyright notices, or business logos onto images with custom opacity, angles, shadows, and fonts.',
    iconName: 'Stamp',
    badge: 'Copyright Protect',
    highlights: ['Custom text & logo', 'Opacity & angle control', 'Tile or center placement', 'Batch photo stamping'],
  },
];
