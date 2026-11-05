export type PdfToolId =
  | 'pdf-merger'
  | 'pdf-splitter'
  | 'pdf-compressor'
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'pdf-to-excel'
  | 'pdf-to-jpg'
  | 'jpg-to-pdf'
  | 'pdf-unlocker'
  | 'pdf-page-organizer'
  | 'pdf-watermark'
  | 'pdf-editor';

export interface PdfToolMeta {
  id: PdfToolId;
  name: string;
  nameUrdu: string;
  category: 'Organization & Security' | 'Converters' | 'Document Editing';
  tagline: string;
  description: string;
  iconName: string;
  badge?: string;
  highlights: string[];
}

export const PDF_TOOLS: PdfToolMeta[] = [
  {
    id: 'pdf-merger',
    name: 'PDF Merger',
    nameUrdu: 'پی ڈی ایف جوڑیں',
    category: 'Organization & Security',
    tagline: 'Combine multiple PDF files into one clean document',
    description: 'Merge and combine multiple PDF files into a single unified document with custom drag-and-drop page ordering and 100% local privacy.',
    iconName: 'Layers',
    badge: 'Most Popular',
    highlights: ['Multi-file upload', 'Drag to reorder', 'Instant client merge', 'Zero server upload'],
  },
  {
    id: 'pdf-splitter',
    name: 'PDF Splitter',
    nameUrdu: 'پی ڈی ایف الگ کریں',
    category: 'Organization & Security',
    tagline: 'Extract specific pages or split large PDFs into separate files',
    description: 'Split PDFs by custom page ranges (e.g. 1-5, 8, 11-14) or extract every individual page into its own standalone PDF file.',
    iconName: 'Scissors',
    badge: 'Precise Ranges',
    highlights: ['Custom page ranges', 'Extract all pages', 'Preview page count', 'Instant ZIP/PDF export'],
  },
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    nameUrdu: 'سائز چھوٹا کریں',
    category: 'Organization & Security',
    tagline: 'Optimize PDF file size while keeping text and vector layout crisp',
    description: 'Optimize PDF object streams and embedded images in-browser without converting pages to images or stripping searchable text.',
    iconName: 'Minimize2',
    badge: 'Smart Optimize',
    highlights: ['Zero page flattening', 'Retains selectable text', 'Streamline PDF streams', 'True size validation'],
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    nameUrdu: 'پی ڈی ایف سے ورڈ',
    category: 'Converters',
    tagline: 'Convert PDF documents into editable Word (.docx / .doc) text',
    description: 'Extract structured text, paragraphs, and tables from PDF documents into cleanly formatted Word document files.',
    iconName: 'FileText',
    badge: 'DOCX Export',
    highlights: ['Structured text extract', 'DOCX download', 'Paragraph formatting', 'Zero OCR watermark'],
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    nameUrdu: 'ورڈ سے پی ڈی ایف',
    category: 'Converters',
    tagline: 'Convert Word and text documents into clean, shareable PDFs',
    description: 'Convert DOCX, DOC, and rich formatted text into standard, locked, professional PDF documents ready for printing.',
    iconName: 'FileType',
    badge: 'Print Ready',
    highlights: ['Universal formatting', 'Embed clean fonts', 'A4 / Letter sizing', 'Instant PDF download'],
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    nameUrdu: 'پی ڈی ایف سے ایکسل',
    category: 'Converters',
    tagline: 'Extract tabular data and financial statements into spreadsheets (.csv/.xlsx)',
    description: 'Convert bank statements, invoices, and accounting tables embedded inside PDFs into clean tabular spreadsheets.',
    iconName: 'Table',
    badge: 'Data Tables',
    highlights: ['Auto column detect', 'CSV / XLSX export', 'Clean data separation', 'Banking & finance ready'],
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG / PNG',
    nameUrdu: 'پی ڈی ایف سے تصویر',
    category: 'Converters',
    tagline: 'Render and convert PDF pages into high-resolution images',
    description: 'Convert each page of your PDF into high-definition 300 DPI PNG or JPG images with 1-click batch download.',
    iconName: 'Image',
    badge: 'HD 300 DPI',
    highlights: ['All pages or selective', 'PNG / JPG format', 'Crystal clear render', 'ZIP batch download'],
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    nameUrdu: 'تصاویر سے پی ڈی ایف',
    category: 'Converters',
    tagline: 'Turn photos, scans, and receipts into a unified PDF file',
    description: 'Convert multiple photos, phone scans, and receipts into a single clean PDF with custom page sizes (A4, Letter) and margins.',
    iconName: 'FileSpreadsheet',
    badge: 'Multi-Photo',
    highlights: ['Batch photo upload', 'A4 / Letter fitting', 'Fit to page orientation', 'Lossless image embed'],
  },
  {
    id: 'pdf-unlocker',
    name: 'PDF Unlocker & Security',
    nameUrdu: 'پاسورڈ ان لاک / سیٹ کریں',
    category: 'Organization & Security',
    tagline: 'Remove or set passwords and permissions on your PDFs',
    description: 'Unlock restricted PDFs or add military-grade 128/256-bit password protection to confidential contracts and personal records.',
    iconName: 'Lock',
    badge: 'Security',
    highlights: ['Add custom password', 'Unlock permissions', 'AES 128/256 bit', '100% private in-browser'],
  },
  {
    id: 'pdf-page-organizer',
    name: 'PDF Page Organizer',
    nameUrdu: 'صفحات ترتیب دیں',
    category: 'Organization & Security',
    tagline: 'Rotate, reorder, delete, and duplicate individual PDF pages',
    description: 'Visual page grid where you can rotate upside-down pages 90°/180°, delete unnecessary pages, and rearrange order with ease.',
    iconName: 'LayoutGrid',
    badge: 'Visual Grid',
    highlights: ['90° / 180° rotation', '1-click page delete', 'Duplicate key pages', 'Reorder visually'],
  },
  {
    id: 'pdf-watermark',
    name: 'PDF Watermark & Page Numbers',
    nameUrdu: 'واٹر مارک اور پیج نمبرز',
    category: 'Document Editing',
    tagline: 'Add custom text watermarks, Confidential stamps, and page numbers',
    description: 'Apply subtle diagonal watermarks (e.g., CONFIDENTIAL, DRAFT, COPY) and sequential page numbers (Page X of Y) across all pages.',
    iconName: 'Stamp',
    badge: 'Official Stamps',
    highlights: ['Confidential / Draft stamps', 'Sequential Page numbers', 'Custom opacity & color', 'All or selected pages'],
  },
  {
    id: 'pdf-editor',
    name: 'PDF Editor & E-Sign Pad',
    nameUrdu: 'ایڈیٹر اور دستخط',
    category: 'Document Editing',
    tagline: 'Draw electronic signatures, add text notes, and annotate documents',
    description: 'Sign contracts, application forms, and agreements with your fingertip or mouse on an interactive E-Sign pad and embed directly into PDF.',
    iconName: 'Edit3',
    badge: 'E-Sign Ready',
    highlights: ['Draw digital signature', 'Type signature font', 'Add date & text stamps', 'Zero upload privacy'],
  },
];
