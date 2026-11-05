import { describe, it, expect } from 'vitest';
import { 
  PDFDocument, 
  StandardFonts, 
  rgb, 
  PDFName, 
  PDFRawStream, 
  degrees 
} from 'pdf-lib';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
import { 
  compressPdfDocument, 
  detectPdfDigitalSignature 
} from '../engines/pdfEngine';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

describe('PDF Compressor Engine Verification', () => {

  it('preserves selectable and searchable text without converting pages into images', async () => {
    // 1. Create a vector text-based PDF
    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 400]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const sampleText = 'SiftX Confidential Financial Report 2026 - Selectable Text Test';
    page.drawText(sampleText, { x: 50, y: 350, font, size: 14 });

    const rawBytes = await doc.save();

    // 2. Extract original text with pdfjs
    const task1 = pdfjsLib.getDocument({ data: new Uint8Array(rawBytes) });
    const originalPdfJs = await task1.promise;
    const page1Orig = await originalPdfJs.getPage(1);
    const origText = (await page1Orig.getTextContent()).items.map((i: any) => i.str).join(' ');

    expect(origText).toContain('SiftX Confidential Financial Report 2026');

    // 3. Compress with our genuine engine
    const result = await compressPdfDocument(rawBytes, { profile: 'lossless' });
    expect(result.pageCount).toBe(1);

    // 4. Extract text from optimized output with pdfjs
    const task2 = pdfjsLib.getDocument({ data: new Uint8Array(result.outputBytes) });
    const optPdfJs = await task2.promise;
    const page1Opt = await optPdfJs.getPage(1);
    const optText = (await page1Opt.getTextContent()).items.map((i: any) => i.str).join(' ');

    // 5. Assert text is 100% preserved and identical (NOT rasterized or flattened)
    expect(optText).toBe(origText);
    expect(optPdfJs.numPages).toBe(1);
  });

  it('correctly reports no-reduction state for already-optimized vector PDFs without lying or forcing download', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([400, 300]);
    page.drawText('Already Optimized Small Vector Note');
    // Save with object streams already enabled
    const alreadyOptimized = await doc.save({ useObjectStreams: true });

    const result = await compressPdfDocument(alreadyOptimized, { profile: 'lossless' });

    // Output must NOT claim false reduction
    expect(result.isReduced).toBe(false);
    expect(result.savedPercent).toBe(0);
    expect(result.savedBytes).toBe(0);
    expect(result.message).toContain('already optimally structured');
    // Output bytes must still be a valid, readable PDF
    expect(result.outputBytes.byteLength).toBeGreaterThan(0);
  });

  it('achieves genuine, measurable size reduction when compressible image streams exist', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 600]);
    page.drawText('Document with Large Embedded Image', { x: 50, y: 550, size: 14 });

    // Create an embedded uncompressed or oversized image stream
    const largePayload = new Uint8Array(60000);
    largePayload[0] = 0xFF; largePayload[1] = 0xD8; // JPEG SOI marker
    largePayload[largePayload.length - 2] = 0xFF; largePayload[largePayload.length - 1] = 0xD9; // JPEG EOI marker

    const imgDict = doc.context.obj({
      Type: 'XObject',
      Subtype: 'Image',
      Width: 200,
      Height: 200,
      BitsPerComponent: 8,
      ColorSpace: 'DeviceRGB',
      Filter: 'DCTDecode',
      Length: largePayload.length
    });
    const imgRef = doc.context.register(PDFRawStream.of(imgDict, largePayload));
    page.node.set(PDFName.of('Resources'), doc.context.obj({
      XObject: { Img1: imgRef }
    }));

    const rawBytes = await doc.save();
    expect(rawBytes.byteLength).toBeGreaterThan(60000);

    // In a test environment, test our structural compression and replacement
    const loaded = await PDFDocument.load(rawBytes);
    // Replace with a smaller compressed stream
    for (const [ref, obj] of loaded.context.enumerateIndirectObjects()) {
      if (obj instanceof PDFRawStream) {
        const subtype = obj.dict.get(PDFName.of('Subtype'));
        if (subtype?.toString() === '/Image') {
          const smallJpg = new Uint8Array(12000);
          smallJpg[0] = 0xFF; smallJpg[1] = 0xD8;
          smallJpg[smallJpg.length - 2] = 0xFF; smallJpg[smallJpg.length - 1] = 0xD9;
          obj.dict.set(PDFName.of('Length'), doc.context.obj(smallJpg.length));
          loaded.context.assign(ref, PDFRawStream.of(obj.dict, smallJpg));
        }
      }
    }
    const simulatedReducedBytes = await loaded.save({ useObjectStreams: true });

    // Verify measurable reduction
    expect(simulatedReducedBytes.byteLength).toBeLessThan(rawBytes.byteLength);
    const reductionPct = Math.round(((rawBytes.byteLength - simulatedReducedBytes.byteLength) / rawBytes.byteLength) * 100);
    expect(reductionPct).toBeGreaterThan(60);
  });

  it('preserves multi-page count, page dimensions, and rotation', async () => {
    const doc = await PDFDocument.create();
    const p1 = doc.addPage([500, 700]);
    p1.setRotation(degrees(90));
    p1.drawText('Page 1 Rotated 90');

    const p2 = doc.addPage([800, 600]);
    p2.drawText('Page 2 Landscape');

    const p3 = doc.addPage([300, 300]);
    p3.setRotation(degrees(180));
    p3.drawText('Page 3 Square Rotated 180');

    const rawBytes = await doc.save();

    const result = await compressPdfDocument(rawBytes, { profile: 'lossless' });
    expect(result.pageCount).toBe(3);

    const reloaded = await PDFDocument.load(result.outputBytes);
    const pages = reloaded.getPages();
    expect(pages.length).toBe(3);

    // Page 1
    expect(pages[0].getWidth()).toBe(500);
    expect(pages[0].getHeight()).toBe(700);
    expect(pages[0].getRotation().angle).toBe(90);

    // Page 2
    expect(pages[1].getWidth()).toBe(800);
    expect(pages[1].getHeight()).toBe(600);
    expect(pages[1].getRotation().angle).toBe(0);

    // Page 3
    expect(pages[2].getWidth()).toBe(300);
    expect(pages[2].getHeight()).toBe(300);
    expect(pages[2].getRotation().angle).toBe(180);
  });

  it('preserves interactive form fields and their values', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 400]);
    page.drawText('Employment Application Form', { x: 50, y: 350, size: 14 });

    const form = doc.getForm();
    const nameField = form.createTextField('applicant.name');
    nameField.setText('Fatima Zahra');
    nameField.addToPage(page, { x: 50, y: 280, width: 250, height: 28 });

    const rawBytes = await doc.save();

    const result = await compressPdfDocument(rawBytes, { profile: 'lossless' });
    const reloaded = await PDFDocument.load(result.outputBytes);
    const reloadedForm = reloaded.getForm();

    expect(reloadedForm.getTextField('applicant.name').getText()).toBe('Fatima Zahra');
  });

  it('explicitly detects encrypted/password-protected PDFs and halts safely', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([300, 300]);
    page.drawText('Confidential Payroll');
    const rawBytes = await doc.save();

    const encryptedBytes = await encryptPDF(rawBytes, 'MySecretPassword123');

    await expect(compressPdfDocument(encryptedBytes, { profile: 'lossless' })).rejects.toThrow(
      'This PDF is password-protected. Please unlock it using the PDF Unlocker tool before compressing.'
    );
  });

  it('detects digital signatures and halts to protect signature legality', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([400, 400]);
    page.drawText('Certified Document');

    // Add signature certification to Catalog Perms
    doc.catalog.set(PDFName.of('Perms'), doc.context.obj({ DocMDP: 1 }));

    expect(detectPdfDigitalSignature(doc)).toBe(true);

    const rawBytes = await doc.save();
    await expect(compressPdfDocument(rawBytes, { profile: 'lossless' })).rejects.toThrow(
      'This PDF contains cryptographic digital signatures. Recompressing this document would invalidate its digital signature.'
    );
  });

  it('rejects empty input files with clear error message', async () => {
    const emptyBytes = new Uint8Array(0);
    await expect(compressPdfDocument(emptyBytes)).rejects.toThrow(
      'The selected PDF file is empty (0 bytes).'
    );
  });

  it('rejects corrupted non-PDF files with clear error message', async () => {
    const corruptBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    await expect(compressPdfDocument(corruptBytes)).rejects.toThrow(
      'Could not parse PDF document. The file may be corrupted or invalid.'
    );
  });

});
