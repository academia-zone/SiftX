import { 
  PDFDocument, 
  rgb, 
  degrees, 
  StandardFonts, 
  PDFName, 
  PDFRawStream, 
  PDFNumber, 
  PDFDict 
} from 'pdf-lib';
import { isEncrypted } from '@pdfsmaller/pdf-decrypt';

/**
 * Merge multiple PDF files into a single unified PDF document.
 */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  if (files.length === 0) {
    throw new Error('Please select at least one PDF file to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Split a PDF document by extracting specific page ranges (e.g. "1-3, 5, 7-10").
 */
export async function splitPdfByRange(file: File, rangeString: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const targetPageIndices: number[] = [];
  const parts = rangeString.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (!targetPageIndices.includes(i - 1)) {
            targetPageIndices.push(i - 1);
          }
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        if (!targetPageIndices.includes(pageNum - 1)) {
          targetPageIndices.push(pageNum - 1);
        }
      }
    }
  }

  if (targetPageIndices.length === 0) {
    throw new Error(`Invalid page range. The document has ${totalPages} pages.`);
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(sourcePdf, targetPageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

/**
 * Rotate all pages of a PDF by 90, 180, or 270 degrees clockwise.
 */
export async function rotatePdf(file: File, angleDegrees: 90 | 180 | 270): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdf.getPages();

  for (const page of pages) {
    const currentAngle = page.getRotation().angle;
    page.setRotation(degrees((currentAngle + angleDegrees) % 360));
  }

  return await pdf.save();
}

/**
 * Add a diagonal semi-transparent watermark text to every page of a PDF.
 */
export async function addWatermark(
  file: File,
  watermarkText: string,
  opacity: number = 0.25
): Promise<Uint8Array> {
  if (!watermarkText.trim()) {
    throw new Error('Watermark text cannot be empty.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) / 8;
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(watermarkText, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 4,
      size: fontSize,
      font,
      color: rgb(0.85, 0.15, 0.25),
      opacity: Math.max(0.05, Math.min(0.9, opacity)),
      rotate: degrees(45),
    });
  }

  return await pdf.save();
}

/**
 * Add clean sequential page numbers (Page X of Y) at the bottom center of each page.
 */
export async function addPageNumbers(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const { width } = page.getSize();
    const text = `Page ${i + 1} of ${total}`;
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: 20,
      size: fontSize,
      font,
      color: rgb(0.3, 0.35, 0.4),
    });
  }

  return await pdf.save();
}

/**
 * Convert multiple JPG / PNG image files into a single unified A4 PDF document.
 */
export async function imagesToPdf(imageFiles: File[]): Promise<Uint8Array> {
  if (imageFiles.length === 0) {
    throw new Error('Please select at least one image file.');
  }

  const pdf = await PDFDocument.create();

  // Standard A4 dimensions in points: 595.28 x 841.89
  const a4Width = 595.28;
  const a4Height = 841.89;
  const margin = 36; // 0.5 inch margin

  for (const file of imageFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const isPng = file.type.includes('png') || file.name.toLowerCase().endsWith('.png');
    
    let embeddedImage;
    if (isPng) {
      embeddedImage = await pdf.embedPng(arrayBuffer);
    } else {
      embeddedImage = await pdf.embedJpg(arrayBuffer);
    }

    const imgDims = embeddedImage.scaleToFit(a4Width - margin * 2, a4Height - margin * 2);

    const page = pdf.addPage([a4Width, a4Height]);
    page.drawImage(embeddedImage, {
      x: (a4Width - imgDims.width) / 2,
      y: (a4Height - imgDims.height) / 2,
      width: imgDims.width,
      height: imgDims.height,
    });
  }

  return await pdf.save();
}

/**
 * Embed an electronic digital signature onto a specific page of a PDF document.
 */
export async function embedSignatureOnPdf(
  file: File,
  signaturePngDataUrl: string,
  pageIndex: number = 0,
  x: number = 100,
  y: number = 100,
  width: number = 180,
  height: number = 70
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdf.getPages();

  const targetPage = pages[Math.max(0, Math.min(pages.length - 1, pageIndex))];
  const pngImage = await pdf.embedPng(signaturePngDataUrl);

  targetPage.drawImage(pngImage, {
    x,
    y,
    width,
    height,
  });

  return await pdf.save();
}

/**
 * Helper to download a Uint8Array as a PDF file in the browser.
 */
export function downloadPdfBytes(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as any], { type: 'application/pdf' });
  const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // Auto-register to Workspace Tray for cross-tool pipelines
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('siftx:file-exported', {
        detail: { blob, name: finalFilename, sourceTool: 'PDF Studio' },
      })
    );
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type CompressionProfile = 'lossless' | 'balanced' | 'strong';

export interface CompressPdfOptions {
  profile?: CompressionProfile;
  onProgress?: (stage: string, percent: number) => void;
}

export interface CompressPdfResult {
  outputBytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercent: number;
  isReduced: boolean;
  pageCount: number;
  imagesFound: number;
  imagesOptimized: number;
  profile: CompressionProfile;
  message: string;
}

/**
 * Check if a PDF document contains cryptographic digital signatures or permissions.
 */
export function detectPdfDigitalSignature(doc: PDFDocument): boolean {
  try {
    // 1. Check Document Permissions / Certifications in Catalog
    if (doc.catalog.get(PDFName.of('Perms'))) {
      return true;
    }

    // 2. Check AcroForm SigFlags (bit 1 = signature exists, bit 2 = append-only)
    const acroForm = doc.catalog.get(PDFName.of('AcroForm'));
    if (acroForm instanceof PDFDict) {
      const sigFlags = acroForm.get(PDFName.of('SigFlags'));
      if (sigFlags) {
        return true;
      }
    }

    // 3. Check for Signature Field Objects or ByteRange in indirect objects
    for (const [, obj] of doc.context.enumerateIndirectObjects()) {
      if (obj instanceof PDFDict) {
        const type = obj.get(PDFName.of('Type'));
        const ft = obj.get(PDFName.of('FT'));
        if (type?.toString() === '/Sig' || ft?.toString() === '/Sig') {
          return true;
        }
        if (obj.get(PDFName.of('ByteRange'))) {
          return true;
        }
      }
    }
  } catch {
    // Fail-safe
  }
  return false;
}

/**
 * Optimize an individual embedded JPEG image stream without modifying page layout or vector text.
 */
async function optimizeJpegStream(
  rawBytes: Uint8Array,
  profile: 'balanced' | 'strong'
): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
  if (typeof window === 'undefined' || typeof createImageBitmap !== 'function') {
    return null;
  }

  try {
    const blob = new Blob([rawBytes as any], { type: 'image/jpeg' });
    const bitmap = await createImageBitmap(blob);
    let w = bitmap.width;
    let h = bitmap.height;

    // In 'strong' mode, downscale oversized embedded images to maximum 1600px
    const maxDim = profile === 'strong' ? 1600 : null;
    if (maxDim && (w > maxDim || h > maxDim)) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return null;
    }

    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const quality = profile === 'strong' ? 0.58 : 0.75;
    const recompressedBlob: Blob | null = await new Promise((res) => {
      canvas.toBlob((b) => res(b), 'image/jpeg', quality);
    });

    if (!recompressedBlob) return null;

    const newBytes = new Uint8Array(await recompressedBlob.arrayBuffer());
    return { bytes: newBytes, width: w, height: h };
  } catch {
    return null;
  }
}

/**
 * Perform genuine, non-destructive PDF compression in-browser.
 * Preserves 100% of selectable text, vectors, page layout, form fields, and bookmarks.
 */
export async function compressPdfDocument(
  input: File | Uint8Array | ArrayBuffer,
  options: CompressPdfOptions = {}
): Promise<CompressPdfResult> {
  const profile = options.profile || 'lossless';
  const onProgress = options.onProgress || (() => {});

  onProgress('Reading PDF document structure...', 10);

  let arrayBuffer: ArrayBuffer;
  if (input instanceof File) {
    arrayBuffer = await input.arrayBuffer();
  } else if (input instanceof Uint8Array) {
    const copy = new Uint8Array(input.byteLength);
    copy.set(input);
    arrayBuffer = copy.buffer;
  } else {
    arrayBuffer = input;
  }

  const originalSize = arrayBuffer.byteLength;
  if (originalSize === 0) {
    throw new Error('The selected PDF file is empty (0 bytes).');
  }

  // 1. Check for password encryption
  try {
    const encCheck = await isEncrypted(new Uint8Array(arrayBuffer));
    if (encCheck.encrypted) {
      throw new Error('This PDF is password-protected. Please unlock it using the PDF Unlocker tool before compressing.');
    }
  } catch (encErr: any) {
    if (encErr?.message?.includes('password-protected')) {
      throw encErr;
    }
    // Proceed to pdf-lib check if isEncrypted threw on parsing
  }

  // 2. Load PDF with pdf-lib without ignoring encryption
  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
  } catch (err: any) {
    const msg = err?.message?.toLowerCase() || '';
    if (err?.name === 'EncryptedPDFError' || msg.includes('encrypted') || msg.includes('password')) {
      throw new Error('This PDF is password-protected. Please unlock it using the PDF Unlocker tool before compressing.');
    }
    throw new Error('Could not parse PDF document. The file may be corrupted or invalid.');
  }

  const pageCount = pdfDoc.getPageCount();
  if (pageCount === 0) {
    throw new Error('This PDF contains no pages to compress.');
  }

  // 3. Check for cryptographic digital signatures
  if (detectPdfDigitalSignature(pdfDoc)) {
    throw new Error('This PDF contains cryptographic digital signatures. Recompressing this document would invalidate its digital signature. Optimization has been halted to preserve document legality.');
  }

  onProgress('Inspecting embedded resources...', 25);

  let imagesFound = 0;
  let imagesOptimized = 0;

  // 4. Safe In-Place Image Stream Optimization (only when profile is balanced or strong)
  if (profile !== 'lossless') {
    const indirectObjects = pdfDoc.context.enumerateIndirectObjects();
    const candidateObjects: Array<{ ref: any; obj: PDFRawStream }> = [];

    for (const [ref, obj] of indirectObjects) {
      if (obj instanceof PDFRawStream) {
        const subtype = obj.dict.get(PDFName.of('Subtype'));
        if (subtype?.toString() === '/Image') {
          imagesFound++;
          const filter = obj.dict.get(PDFName.of('Filter'));
          const isDct = filter?.toString() === '/DCTDecode';
          const colorSpace = obj.dict.get(PDFName.of('ColorSpace'))?.toString();
          const isCmyk = colorSpace?.includes('CMYK') || colorSpace?.includes('Separation');

          // Only optimize RGB/Grayscale JPEGs with substantial size (> 8KB)
          if (isDct && !isCmyk && obj.getContentsSize() > 8192) {
            candidateObjects.push({ ref, obj });
          }
        }
      }
    }

    const totalCandidates = candidateObjects.length;
    for (let i = 0; i < totalCandidates; i++) {
      const { ref, obj } = candidateObjects[i];
      const stepPct = Math.round(25 + ((i + 1) / Math.max(1, totalCandidates)) * 55);
      onProgress(`Optimizing embedded image (${i + 1} of ${totalCandidates})...`, stepPct);

      const rawBytes = obj.asUint8Array();
      const hasSMask = Boolean(obj.dict.get(PDFName.of('SMask')));
      // If SMask is present, maintain exact dimensions to avoid mask mismatch
      const effectiveProfile = hasSMask ? 'balanced' : profile;

      const opt = await optimizeJpegStream(rawBytes, effectiveProfile);
      // Only commit replacement if new image is at least 5% smaller
      if (opt && opt.bytes.length < rawBytes.length * 0.95) {
        obj.dict.set(PDFName.of('Length'), PDFNumber.of(opt.bytes.length));
        obj.dict.set(PDFName.of('Width'), PDFNumber.of(opt.width));
        obj.dict.set(PDFName.of('Height'), PDFNumber.of(opt.height));
        pdfDoc.context.assign(ref, PDFRawStream.of(obj.dict, opt.bytes));
        imagesOptimized++;
      }
    }
  }

  // 5. Structural Object Stream Compression
  onProgress('Packing structural object streams...', 85);
  const outputBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  // 6. Verification & Output Integrity
  onProgress('Verifying document integrity...', 95);
  let verifyDoc: PDFDocument;
  try {
    verifyDoc = await PDFDocument.load(outputBytes);
  } catch {
    throw new Error('Integrity verification failed: Generated PDF could not be re-parsed.');
  }

  if (verifyDoc.getPageCount() !== pageCount) {
    throw new Error(`Integrity verification failed: Page count changed from ${pageCount} to ${verifyDoc.getPageCount()}.`);
  }

  const compressedSize = outputBytes.byteLength;
  const savedBytes = originalSize - compressedSize;
  const savedPercent = Math.round((savedBytes / originalSize) * 100);
  const isReduced = savedBytes > 32 && savedPercent > 0;

  onProgress('Complete!', 100);

  return {
    outputBytes,
    originalSize,
    compressedSize,
    savedBytes: isReduced ? savedBytes : 0,
    savedPercent: isReduced ? savedPercent : 0,
    isReduced,
    pageCount,
    imagesFound,
    imagesOptimized,
    profile,
    message: isReduced
      ? `Document compressed by ${savedPercent}% (${(savedBytes / 1024).toFixed(1)} KB saved). All text, fonts, and vector paths preserved.`
      : 'This document is already optimally structured. In-browser stream compression could not reduce its size further without lossy rasterization.',
  };
}
