import type { ToolItem, CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'pdf-tools',
    title: 'PDF Tools',
    titleUrdu: 'پی ڈی ایف ٹولز',
    description: '12 essential tools to merge, split, compress, convert, edit, and sign PDF documents.',
    icon: 'FileText',
    subCategories: ['Document Editing', 'Converters', 'Organization & Security']
  },
  {
    id: 'audio-tools',
    title: 'Audio Tools',
    titleUrdu: 'آواز اور آڈیو ٹولز',
    description: '9 tools for TTS, STT, AI voice generator, audio recorder, converters, and trimmers.',
    icon: 'Mic',
    subCategories: ['Speech AI', 'Audio Editing', 'Format Converters']
  },
  {
    id: 'calculators',
    title: 'Calculators',
    titleUrdu: 'تمام حسابی ٹولز',
    description: '14 everyday, scientific, financial, electricity bill, and academic calculators.',
    icon: 'Calculator',
    subCategories: ['Financial', 'Academic & Math', 'Everyday Life']
  },
  {
    id: 'image-tools',
    title: 'Image Tools',
    titleUrdu: 'امیج اور فوٹو ٹولز',
    description: '9 tools to compress, resize, crop, remove backgrounds, OCR text, and upscale.',
    icon: 'Sparkles',
    subCategories: ['Optimization', 'Editing', 'Extraction']
  },
  {
    id: 'video-tools',
    title: 'Video Tools',
    titleUrdu: 'ویڈیو اور اینیمیشن ٹولز',
    description: '8 tools to compress, trim, merge, convert to MP3, make GIFs, and generate subtitles.',
    icon: 'Video',
    subCategories: ['Video Editing', 'Conversion', 'Animation']
  },
  {
    id: 'developer-tools',
    title: 'Developer Tools',
    titleUrdu: 'ڈویلپرز اور کوڈنگ ٹولز',
    description: '10 tools for JSON/HTML formatting, CSS/JS minifying, Base64, UUID, and regex testing.',
    icon: 'Code2',
    subCategories: ['Formatters & Minifiers', 'Encoders & Decoders', 'Security & Testing']
  }
];

export const ALL_TOOLS: ToolItem[] = [
  // ==========================================
  // 1. PDF TOOLS (12 Tools)
  // Folder: F:\toolkit\tools\PDF Tools\
  // ==========================================
  {
    id: 'pdf-merger',
    folderName: 'PDF Tools/pdf-merger',
    name: 'PDF Merger',
    tagline: 'Combine multiple PDF files into one clean document',
    description: 'Rearrange pages, set custom file order, and merge PDF files with zero cloud upload.',
    mainCategory: 'pdf-tools',
    subCategory: 'Document Editing',
    personas: ['office', 'students'],
    icon: 'Layers',
    badge: 'Popular',
    status: 'ready'
  },
  {
    id: 'pdf-splitter',
    folderName: 'PDF Tools/pdf-splitter',
    name: 'PDF Splitter',
    tagline: 'Extract specific pages or split large PDFs into separate files',
    description: 'Split PDFs by page ranges, single pages, or extract chapters quickly.',
    mainCategory: 'pdf-tools',
    subCategory: 'Organization & Security',
    personas: ['office', 'students'],
    icon: 'Scissors',
    status: 'ready'
  },
  {
    id: 'pdf-compressor',
    folderName: 'PDF Tools/pdf-compressor',
    name: 'PDF Compressor',
    tagline: 'Optimize PDF file size while keeping text and vector layout crisp',
    description: 'Genuine in-browser stream and embedded image optimization without flattening pages or stripping selectable text.',
    mainCategory: 'pdf-tools',
    subCategory: 'Optimization',
    personas: ['students', 'office'],
    icon: 'Minimize2',
    badge: 'Smart Optimize',
    status: 'ready'
  },
  {
    id: 'pdf-to-word',
    folderName: 'PDF Tools/pdf-to-word',
    name: 'PDF to Word',
    tagline: 'Convert PDF documents into editable Microsoft Word (.docx) files',
    description: 'Preserves tables, headings, fonts, and layouts for seamless editing in Word.',
    mainCategory: 'pdf-tools',
    subCategory: 'Converters',
    personas: ['office', 'students'],
    icon: 'FileText',
    status: 'ready'
  },
  {
    id: 'word-to-pdf',
    folderName: 'PDF Tools/word-to-pdf',
    name: 'Word to PDF',
    tagline: 'Convert DOCX and DOC documents into clean, shareable PDFs',
    description: 'Ensure exact layout consistency across all devices, phones, and printers.',
    mainCategory: 'pdf-tools',
    subCategory: 'Converters',
    personas: ['office', 'students'],
    icon: 'FileType',
    status: 'ready'
  },
  {
    id: 'pdf-to-excel',
    folderName: 'PDF Tools/pdf-to-excel',
    name: 'PDF to Excel',
    tagline: 'Extract data tables from PDFs directly into spreadsheets (.xlsx)',
    description: 'Automatic tabular column detection for bank statements, bills, and accounting reports.',
    mainCategory: 'pdf-tools',
    subCategory: 'Converters',
    personas: ['office', 'finance'],
    icon: 'Table',
    status: 'ready'
  },
  {
    id: 'pdf-to-jpg',
    folderName: 'PDF Tools/pdf-to-jpg',
    name: 'PDF to JPG',
    tagline: 'Convert PDF pages into high-resolution JPG or PNG images',
    description: 'Batch export every page or select single pages at 300 DPI.',
    mainCategory: 'pdf-tools',
    subCategory: 'Converters',
    personas: ['creators', 'students'],
    icon: 'Image',
    status: 'ready'
  },
  {
    id: 'jpg-to-pdf',
    folderName: 'PDF Tools/jpg-to-pdf',
    name: 'JPG to PDF',
    tagline: 'Turn photos and scanned receipts into a single PDF file',
    description: 'Adjust page orientation, margins, and paper size (A4, Letter) easily.',
    mainCategory: 'pdf-tools',
    subCategory: 'Converters',
    personas: ['creators', 'office'],
    icon: 'FileSpreadsheet',
    status: 'ready'
  },
  {
    id: 'pdf-unlocker',
    folderName: 'PDF Tools/pdf-unlocker',
    name: 'PDF Unlocker',
    tagline: 'Remove owner passwords and printing restrictions from your PDFs',
    description: 'Unlock password-protected files securely inside your browser.',
    mainCategory: 'pdf-tools',
    subCategory: 'Organization & Security',
    personas: ['office'],
    icon: 'Unlock',
    status: 'ready'
  },
  {
    id: 'pdf-page-organizer',
    folderName: 'PDF Tools/pdf-page-organizer',
    name: 'PDF Page Organizer',
    tagline: 'Rotate, reorder, delete, and duplicate individual PDF pages',
    description: 'Interactive visual grid to drag and drop pages into your desired order.',
    mainCategory: 'pdf-tools',
    subCategory: 'Organization & Security',
    personas: ['students', 'office'],
    icon: 'LayoutGrid',
    status: 'ready'
  },
  {
    id: 'pdf-watermark',
    folderName: 'PDF Tools/pdf-watermark',
    name: 'PDF Watermark',
    tagline: 'Add custom text stamps, Confidential marks, and logo watermarks',
    description: 'Adjust opacity, angle, font, and positioning across all pages.',
    mainCategory: 'pdf-tools',
    subCategory: 'Organization & Security',
    personas: ['office', 'legal'],
    icon: 'Stamp',
    status: 'ready'
  },
  {
    id: 'pdf-editor',
    folderName: 'PDF Tools/pdf-editor',
    name: 'PDF Editor',
    tagline: 'Annotate, draw, highlight text, and add electronic signatures',
    description: 'Full-featured client-side canvas PDF editing with signature draw pad.',
    mainCategory: 'pdf-tools',
    subCategory: 'Document Editing',
    personas: ['office', 'students'],
    icon: 'Edit3',
    badge: 'E-Sign Ready',
    status: 'ready'
  },

  // ==========================================
  // 2. AUDIO TOOLS (4 Core Engines)
  // Folder: F:\toolkit\tools\Audio Tools\
  // ==========================================
  {
    id: 'text-to-speech',
    folderName: 'Audio Tools/text-to-speech',
    name: 'Text to Speech',
    tagline: 'Text ko natural voice mein convert karna',
    description: 'High-fidelity speech synthesis with multiple language voices, speed, pitch, and WAV audio download.',
    mainCategory: 'audio-tools',
    subCategory: 'Speech AI',
    personas: ['students', 'creators', 'office'],
    icon: 'Volume2',
    badge: 'Core Tool',
    status: 'ready'
  },
  {
    id: 'speech-to-text',
    folderName: 'Audio Tools/speech-to-text',
    name: 'Speech to Text',
    tagline: 'Voice aur audio ko text mein convert karna',
    description: 'Real-time microphone speech recognition with live transcription, auto-punctuation, and text export.',
    mainCategory: 'audio-tools',
    subCategory: 'Speech AI',
    personas: ['students', 'office', 'journalists'],
    icon: 'FileAudio',
    badge: 'Core Tool',
    status: 'ready'
  },
  {
    id: 'voice-recorder',
    folderName: 'Audio Tools/voice-recorder',
    name: 'Voice Changer & Recorder',
    tagline: 'Voice ki pitch aur effects change karna & Studio Recording',
    description: 'Studio audio recording with live soundwave, plus real-time pitch shift (Robot, Chipmunk, Deep, Echo).',
    mainCategory: 'audio-tools',
    subCategory: 'Voice Changer',
    personas: ['creators', 'general'],
    icon: 'Mic',
    badge: 'Interactive',
    status: 'ready'
  },
  {
    id: 'ai-voice-generator',
    folderName: 'Audio Tools/ai-voice-generator',
    name: 'AI Voice Generator & Cloning',
    tagline: 'AI se expressive aur customized voice generate karna',
    description: 'Expressive AI voice profiles with emotion presets (Narrator, Podcast Host, Cinematic, Energetic).',
    mainCategory: 'audio-tools',
    subCategory: 'Voice Cloning',
    personas: ['creators', 'office'],
    icon: 'Sparkles',
    badge: 'AI Powered',
    status: 'ready'
  },
  // ==========================================
  // 3. CALCULATORS (14 Tools)
  // Folder: F:\toolkit\tools\Calculators\
  // ==========================================
  {
    id: 'scientific-calculator',
    folderName: 'Calculators/scientific-calculator',
    name: 'Scientific Calculator',
    tagline: 'Trigonometry, logarithms, exponents, powers, and radian calculations',
    description: 'High-precision scientific computation with history memory and brackets support.',
    mainCategory: 'calculators',
    subCategory: 'Academic & Math',
    personas: ['students'],
    icon: 'Calculator',
    status: 'ready'
  },
  {
    id: 'percentage-calculator',
    folderName: 'Calculators/percentage-calculator',
    name: 'Percentage Calculator',
    tagline: 'Calculate percentage increase, decrease, margins, and ratios',
    description: 'Quick everyday percentage problem solver for shopping, marks, and tax.',
    mainCategory: 'calculators',
    subCategory: 'Everyday Life',
    personas: ['students', 'office'],
    icon: 'Percent',
    status: 'ready'
  },
  {
    id: 'age-calculator',
    folderName: 'Calculators/age-calculator',
    name: 'Age Calculator',
    tagline: 'Exact age in years, months, days, hours, and next birthday countdown',
    description: 'Calculates date differences, leap year handling, and upcoming milestone dates.',
    mainCategory: 'calculators',
    subCategory: 'Everyday Life',
    personas: ['general'],
    icon: 'Calendar',
    status: 'ready'
  },
  {
    id: 'bmi-calculator',
    folderName: 'Calculators/bmi-calculator',
    name: 'BMI Calculator',
    tagline: 'Body Mass Index assessment with healthy weight range guide',
    description: 'Metric (cm/kg) and Imperial (ft/lbs) health metrics with category feedback.',
    mainCategory: 'calculators',
    subCategory: 'Everyday Life',
    personas: ['general'],
    icon: 'Activity',
    status: 'ready'
  },
  {
    id: 'loan-calculator',
    folderName: 'Calculators/loan-calculator',
    name: 'Loan Calculator',
    tagline: 'Monthly EMI installment, total interest, and payoff schedule',
    description: 'Detailed amortization table and early payment savings projections.',
    mainCategory: 'calculators',
    subCategory: 'Financial',
    personas: ['finance', 'office'],
    icon: 'CreditCard',
    status: 'ready'
  },
  {
    id: 'mortgage-calculator',
    folderName: 'Calculators/mortgage-calculator',
    name: 'Mortgage Calculator',
    tagline: 'Home loan installments, property taxes, insurance, and down payments',
    description: 'Fixed and adjustable rate estimates for residential and commercial purchases.',
    mainCategory: 'calculators',
    subCategory: 'Financial',
    personas: ['finance'],
    icon: 'Home',
    status: 'ready'
  },
  {
    id: 'currency-calculator',
    folderName: 'Calculators/currency-calculator',
    name: 'Currency Calculator',
    tagline: 'Real-time exchange rate conversions across 150+ world currencies',
    description: 'USD, EUR, GBP, PKR, SAR, AED with historical conversion rates.',
    mainCategory: 'calculators',
    subCategory: 'Financial',
    personas: ['finance', 'general'],
    icon: 'DollarSign',
    status: 'ready'
  },
  {
    id: 'date-calculator',
    folderName: 'Calculators/date-calculator',
    name: 'Date Calculator',
    tagline: 'Add or subtract days, weeks, and months from any specific calendar date',
    description: 'Working days counter (excluding weekends) and project deadline estimator.',
    mainCategory: 'calculators',
    subCategory: 'Everyday Life',
    personas: ['office', 'students'],
    icon: 'Clock',
    status: 'ready'
  },
  {
    id: 'discount-calculator',
    folderName: 'Calculators/discount-calculator',
    name: 'Discount Calculator',
    tagline: 'Calculate sale prices, flat discounts, and additional tax savings',
    description: 'Double discount support (e.g. 20% + extra 10% off) for shopping.',
    mainCategory: 'calculators',
    subCategory: 'Everyday Life',
    personas: ['general'],
    icon: 'Tag',
    status: 'ready'
  },
  {
    id: 'profit-loss-calculator',
    folderName: 'Calculators/profit-loss-calculator',
    name: 'Profit & Loss Calculator',
    tagline: 'Calculate cost price, selling price, gross profit, and margin percentages',
    description: 'Essential for eCommerce sellers, shopkeepers, and business budgeting.',
    mainCategory: 'calculators',
    subCategory: 'Financial',
    personas: ['finance', 'office'],
    icon: 'TrendingUp',
    status: 'ready'
  },
  {
    id: 'gst-calculator',
    folderName: 'Calculators/gst-calculator',
    name: 'GST Calculator',
    tagline: 'Calculate inclusive and exclusive Sales Tax / GST amounts',
    description: 'Pre-set standard rates (18%, 17%, 15%, 5%) with single-click breakdown.',
    mainCategory: 'calculators',
    subCategory: 'Financial',
    personas: ['finance', 'office'],
    icon: 'Receipt',
    status: 'ready'
  },
  {
    id: 'unit-converter',
    folderName: 'Calculators/unit-converter',
    name: 'Unit Converter',
    tagline: 'Length, weight, area, temperature, speed, data storage, and volume',
    description: 'Convert meters to feet, kilograms to pounds, Celsius to Fahrenheit, GB to MB.',
    mainCategory: 'calculators',
    subCategory: 'Academic & Math',
    personas: ['students', 'general'],
    icon: 'Compass',
    status: 'ready'
  },
  {
    id: 'electricity-bill-calculator',
    folderName: 'Calculators/electricity-bill-calculator',
    name: 'Electricity Bill Calculator (Pakistan)',
    tagline: 'Official 2026 NEPRA tariff slabs, protected users, fuel adjustment & taxes',
    description: 'Calculate IESCO, LESCO, FESCO, GEPCO, MEPCO, PESCO, KE bills with exact slab breakdown.',
    mainCategory: 'calculators',
    subCategory: 'Everyday Life',
    personas: ['general', 'office'],
    icon: 'Zap',
    badge: 'Pakistan 2026',
    status: 'ready'
  },
  {
    id: 'gpa-cgpa-calculator',
    folderName: 'Calculators/gpa-cgpa-calculator',
    name: 'GPA / CGPA Calculator',
    tagline: 'Semester GPA, cumulative CGPA on 4.0 scale with credit hour weighting',
    description: 'Custom grading scale support (A, B+, B, C) with honors forecast target.',
    mainCategory: 'calculators',
    subCategory: 'Academic & Math',
    personas: ['students'],
    icon: 'GraduationCap',
    badge: 'Students',
    status: 'ready'
  },

  // ==========================================
  // 4. IMAGE TOOLS (9 Tools)
  // Folder: F:\toolkit\tools\Image Tools\
  // ==========================================
  {
    id: 'image-compressor',
    folderName: 'Image Tools/image-compressor',
    name: 'Image Compressor',
    tagline: 'Compress JPG, PNG, and WebP images by up to 90% without quality loss',
    description: 'Batch image optimization with customizable compression slider and live preview.',
    mainCategory: 'image-tools',
    subCategory: 'Optimization',
    personas: ['creators', 'students'],
    icon: 'Minimize2',
    badge: '-90% Size',
    status: 'ready'
  },
  {
    id: 'image-resizer',
    folderName: 'Image Tools/image-resizer',
    name: 'Image Resizer',
    tagline: 'Change image dimensions in pixels, cm, inches, or percentages',
    description: 'Lock aspect ratios or specify custom sizes for passports, Instagram, and web banners.',
    mainCategory: 'image-tools',
    subCategory: 'Editing',
    personas: ['creators', 'general'],
    icon: 'Maximize2',
    status: 'ready'
  },
  {
    id: 'image-cropper',
    folderName: 'Image Tools/image-cropper',
    name: 'Image Cropper',
    tagline: 'Crop photos with standard ratios: 1:1, 16:9, 4:3, or freehand',
    description: 'Circular crop for profile pictures and rectangular crop for documents.',
    mainCategory: 'image-tools',
    subCategory: 'Editing',
    personas: ['creators'],
    icon: 'Crop',
    status: 'ready'
  },
  {
    id: 'image-format-converter',
    folderName: 'Image Tools/image-format-converter',
    name: 'Image Format Converter',
    tagline: 'Convert images between PNG, JPG, WebP, GIF, BMP, and SVG',
    description: 'Instant multi-file batch conversion with high-resolution export.',
    mainCategory: 'image-tools',
    subCategory: 'Editing',
    personas: ['creators'],
    icon: 'RefreshCw',
    status: 'ready'
  },
  {
    id: 'background-remover',
    folderName: 'Image Tools/background-remover',
    name: 'Background Remover',
    tagline: '1-click automated AI cutout to remove photo backgrounds',
    description: 'Exports transparent PNGs or white background portrait cutouts locally in browser.',
    mainCategory: 'image-tools',
    subCategory: 'Extraction',
    personas: ['creators', 'office'],
    icon: 'Sparkles',
    badge: 'AI Powered',
    status: 'ready'
  },
  {
    id: 'image-to-text-ocr',
    folderName: 'Image Tools/image-to-text-ocr',
    name: 'Image to Text (OCR)',
    tagline: 'Extract printed or handwritten text from photos and screenshots',
    description: 'High-accuracy OCR text recognition with 1-click copy to clipboard.',
    mainCategory: 'image-tools',
    subCategory: 'Extraction',
    personas: ['students', 'office'],
    icon: 'FileSearch',
    badge: 'OCR',
    status: 'ready'
  },
  {
    id: 'image-upscaler',
    folderName: 'Image Tools/image-upscaler',
    name: 'Image Upscaler',
    tagline: 'Enlarge low-resolution photos 2x and 4x with sharp edge enhancement',
    description: 'Bicubic interpolation and neural sharpening for blurry or small pictures.',
    mainCategory: 'image-tools',
    subCategory: 'Optimization',
    personas: ['creators'],
    icon: 'ZoomIn',
    status: 'ready'
  },
  {
    id: 'color-picker',
    folderName: 'Image Tools/color-picker',
    name: 'Color Picker',
    tagline: 'Pick colors from any uploaded image and copy HEX, RGB, and HSL codes',
    description: 'Eyedropper loupe with palette generator and color contrast checker.',
    mainCategory: 'image-tools',
    subCategory: 'Editing',
    personas: ['creators', 'developers'],
    icon: 'Pipette',
    status: 'ready'
  },
  {
    id: 'qr-code-generator',
    folderName: 'Image Tools/qr-code-generator',
    name: 'QR Code Generator',
    tagline: 'Create custom QR codes for URLs, WiFi passwords, WhatsApp, and contact vCards',
    description: 'Customize colors, embed center logos, and download in PNG or SVG vector format.',
    mainCategory: 'image-tools',
    subCategory: 'Extraction',
    personas: ['general', 'office'],
    icon: 'QrCode',
    status: 'ready'
  },

  // ==========================================
  // 5. VIDEO TOOLS (8 Tools)
  // Folder: F:\toolkit\tools\Video Tools\
  // ==========================================
  {
    id: 'video-compressor',
    folderName: 'Video Tools/video-compressor',
    name: 'Video Compressor',
    tagline: 'Compress MP4, MOV, and MKV videos by up to 75% for easy sharing',
    description: 'Preset targets for WhatsApp (16MB), Email (25MB), or custom bitrate quality.',
    mainCategory: 'video-tools',
    subCategory: 'Video Editing',
    personas: ['creators'],
    icon: 'Minimize2',
    badge: '-75% Size',
    status: 'ready'
  },
  {
    id: 'video-trimmer',
    folderName: 'Video Tools/video-trimmer',
    name: 'Video Trimmer',
    tagline: 'Cut and trim video clips with visual timeline and millisecond accuracy',
    description: 'Remove unwanted intros/outros and export high-definition video instantly.',
    mainCategory: 'video-tools',
    subCategory: 'Video Editing',
    personas: ['creators'],
    icon: 'Scissors',
    status: 'ready'
  },
  {
    id: 'video-merger',
    folderName: 'Video Tools/video-merger',
    name: 'Video Merger',
    tagline: 'Combine multiple video clips into one continuous movie file',
    description: 'Join clips of different resolutions with automatic scale matching.',
    mainCategory: 'video-tools',
    subCategory: 'Video Editing',
    personas: ['creators'],
    icon: 'Film',
    status: 'ready'
  },
  {
    id: 'video-to-mp3',
    folderName: 'Video Tools/video-to-mp3',
    name: 'Video to MP3',
    tagline: 'Extract high-quality audio tracks from MP4, MKV, and AVI video files',
    description: 'Fast audio extraction at 320 kbps with metadata tagging.',
    mainCategory: 'video-tools',
    subCategory: 'Conversion',
    personas: ['creators', 'students'],
    icon: 'Music',
    status: 'ready'
  },
  {
    id: 'video-format-converter',
    folderName: 'Video Tools/video-format-converter',
    name: 'Video Format Converter',
    tagline: 'Convert video between MP4, WebM, AVI, MOV, and MKV formats',
    description: 'Hardware-accelerated client-side encoding with resolution presets.',
    mainCategory: 'video-tools',
    subCategory: 'Conversion',
    personas: ['creators'],
    icon: 'RefreshCw',
    status: 'ready'
  },
  {
    id: 'gif-maker',
    folderName: 'Video Tools/gif-maker',
    name: 'GIF Maker',
    tagline: 'Convert video clips or image sequences into animated GIFs',
    description: 'Customize frame rate (FPS), loop count, speed, and add caption text.',
    mainCategory: 'video-tools',
    subCategory: 'Animation',
    personas: ['creators', 'general'],
    icon: 'Sparkles',
    badge: 'Popular',
    status: 'ready'
  },
  {
    id: 'video-resizer',
    folderName: 'Video Tools/video-resizer',
    name: 'Video Resizer',
    tagline: 'Resize video resolution for TikTok (9:16), YouTube (16:9), and Instagram (1:1)',
    description: 'Pad with background blur or crop to exact social media dimensions.',
    mainCategory: 'video-tools',
    subCategory: 'Video Editing',
    personas: ['creators'],
    icon: 'Maximize2',
    status: 'ready'
  },
  {
    id: 'subtitle-generator',
    folderName: 'Video Tools/subtitle-generator',
    name: 'Subtitle Generator',
    tagline: 'Generate SRT and VTT subtitles from video speech automatically',
    description: 'AI-assisted speech transcription with exact timecode synchronization.',
    mainCategory: 'video-tools',
    subCategory: 'Animation',
    personas: ['creators', 'office'],
    icon: 'Subtitles',
    badge: 'AI Powered',
    status: 'ready'
  },

  // ==========================================
  // 6. DEVELOPER TOOLS (10 Tools)
  // Folder: F:\toolkit\tools\Developer Tools\
  // ==========================================
  {
    id: 'json-formatter',
    folderName: 'Developer Tools/json-formatter',
    name: 'JSON Formatter',
    tagline: 'Format, prettify, validate, and minify messy JSON data',
    description: 'Collapsible tree view, syntax error markers, and 1-click clipboard copy.',
    mainCategory: 'developer-tools',
    subCategory: 'Formatters & Minifiers',
    personas: ['developers'],
    icon: 'Braces',
    badge: 'Popular',
    status: 'ready'
  },
  {
    id: 'html-formatter',
    folderName: 'Developer Tools/html-formatter',
    name: 'HTML Formatter',
    tagline: 'Beautify and clean up indented HTML markup and templates',
    description: 'Configurable tab size, tag sorting, and unclosed tag validation.',
    mainCategory: 'developer-tools',
    subCategory: 'Formatters & Minifiers',
    personas: ['developers'],
    icon: 'Code2',
    status: 'ready'
  },
  {
    id: 'css-minifier',
    folderName: 'Developer Tools/css-minifier',
    name: 'CSS Minifier',
    tagline: 'Minify CSS stylesheets to reduce file size and accelerate website loading',
    description: 'Removes whitespace, comments, redundant semicolons, and optimizes hex colors.',
    mainCategory: 'developer-tools',
    subCategory: 'Formatters & Minifiers',
    personas: ['developers'],
    icon: 'Minimize2',
    status: 'ready'
  },
  {
    id: 'javascript-minifier',
    folderName: 'Developer Tools/javascript-minifier',
    name: 'JavaScript Minifier',
    tagline: 'Compress JS code and bundle files for production performance',
    description: 'Dead code removal, whitespace stripping, and variable shortening.',
    mainCategory: 'developer-tools',
    subCategory: 'Formatters & Minifiers',
    personas: ['developers'],
    icon: 'FileCode2',
    status: 'ready'
  },
  {
    id: 'base64-encoder-decoder',
    folderName: 'Developer Tools/base64-encoder-decoder',
    name: 'Base64 Encoder / Decoder',
    tagline: 'Encode text and binary images into Base64 strings or decode back',
    description: 'Data URI generator for embedding images directly in CSS and HTML.',
    mainCategory: 'developer-tools',
    subCategory: 'Encoders & Decoders',
    personas: ['developers'],
    icon: 'Binary',
    status: 'ready'
  },
  {
    id: 'url-encoder-decoder',
    folderName: 'Developer Tools/url-encoder-decoder',
    name: 'URL Encoder / Decoder',
    tagline: 'Escape and unescape URL query parameters and special characters',
    description: 'Converts spaces to %20, symbols to percent encoding, and parses URL components.',
    mainCategory: 'developer-tools',
    subCategory: 'Encoders & Decoders',
    personas: ['developers'],
    icon: 'Link',
    status: 'ready'
  },
  {
    id: 'uuid-generator',
    folderName: 'Developer Tools/uuid-generator',
    name: 'UUID Generator',
    tagline: 'Generate cryptographically random UUID v4 and v1 identifiers in bulk',
    description: 'Hyphenated, uppercase, lowercase, or raw hex output with single-click copy.',
    mainCategory: 'developer-tools',
    subCategory: 'Security & Testing',
    personas: ['developers'],
    icon: 'Key',
    status: 'ready'
  },
  {
    id: 'password-generator',
    folderName: 'Developer Tools/password-generator',
    name: 'Password Generator',
    tagline: 'Generate strong, uncrackable passwords with custom symbols and length',
    description: 'Entropy meter, pronunciation options, and zero cloud storage privacy.',
    mainCategory: 'developer-tools',
    subCategory: 'Security & Testing',
    personas: ['developers', 'general'],
    icon: 'Shield',
    status: 'ready'
  },
  {
    id: 'regex-tester',
    folderName: 'Developer Tools/regex-tester',
    name: 'Regex Tester',
    tagline: 'Test regular expressions in real-time with syntax highlighting and match groups',
    description: 'Supports global, multiline, case-insensitive flags and regex cheat sheet.',
    mainCategory: 'developer-tools',
    subCategory: 'Security & Testing',
    personas: ['developers'],
    icon: 'Terminal',
    status: 'ready'
  },
  {
    id: 'markdown-editor',
    folderName: 'Developer Tools/markdown-editor',
    name: 'Markdown Editor',
    tagline: 'Live split-screen Markdown preview with GitHub Flavored syntax',
    description: 'Instant HTML and PDF export, table generator, and KaTeX math formula rendering.',
    mainCategory: 'developer-tools',
    subCategory: 'Formatters & Minifiers',
    personas: ['developers', 'creators'],
    icon: 'FileText',
    status: 'ready'
  },
  {
    id: 'logo-remover',
    folderName: 'Logo Remover/logo-remover',
    name: 'Logo & Watermark Remover',
    tagline: 'Erase unwanted logos, stamps, and watermarks with intelligent inpainting',
    description: 'Interactive canvas brush and box select with seamless boundary diffusion — 100% private in-browser image cleanup.',
    mainCategory: 'logo-remover',
    subCategory: 'Image Clean',
    personas: ['creators', 'office', 'general'],
    icon: 'Eraser',
    badge: 'Inpainting AI',
    status: 'ready'
  },
  {
    id: 'cv-creator',
    folderName: 'CV Creator/cv-creator',
    name: 'CV Creator & Resume Architect',
    tagline: 'Build ATS-friendly executive resumes with real-time live preview',
    description: 'Designer layouts, customizable palettes, and 1-click crisp A4 PDF export with zero signup required.',
    mainCategory: 'cv-creator',
    subCategory: 'Career & Documents',
    personas: ['students', 'office', 'developers', 'general'],
    icon: 'FileText',
    badge: 'ATS Optimized',
    status: 'ready'
  },
  {
    id: 'image-separator',
    folderName: 'Image Separator/image-separator',
    name: 'Image Layer & Icon Separator',
    tagline: 'Deconstruct graphics into editable Canva layers and extract transparent PNG icons',
    description: 'Automatic computer vision segmentation isolates every icon, shape, badge, and text block into movable layers with 1-click asset extraction.',
    mainCategory: 'image-separator',
    subCategory: 'Graphic Design',
    personas: ['creators', 'developers', 'general'],
    icon: 'Layers',
    badge: 'Canva CV Studio',
    status: 'ready'
  }
];