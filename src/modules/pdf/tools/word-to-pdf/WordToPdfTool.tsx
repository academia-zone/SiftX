import React, { useState, useRef } from 'react';
import { 
  FileType, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  FileText,
  Loader2,
  Printer,
  AlignRight,
  AlignLeft
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import { downloadPdfBytes } from '../../engines/pdfEngine';

const containsUrdu = (text: string): boolean => {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFC]/.test(text);
};

export const WordToPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState<string>('Document');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isUrdu, setIsUrdu] = useState<boolean>(false);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentPreviewRef = useRef<HTMLDivElement>(null);

  const processFile = async (selected: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setFile(selected);
    const cleanTitle = selected.name.replace(/\.[^/.]+$/, '');
    setDocTitle(cleanTitle);

    try {
      setIsReading(true);
      const ab = await selected.arrayBuffer();

      let extractedHtml = '';
      let rawText = '';

      if (selected.name.toLowerCase().endsWith('.docx')) {
        // Real .docx conversion using mammoth
        const result = await mammoth.convertToHtml({ arrayBuffer: ab });
        extractedHtml = result.value;
        const textResult = await mammoth.extractRawText({ arrayBuffer: ab });
        rawText = textResult.value;
      } else if (selected.name.toLowerCase().endsWith('.txt') || selected.name.toLowerCase().endsWith('.md')) {
        rawText = await selected.text();
        extractedHtml = rawText
          .split('\n\n')
          .map((p) => `<p style="margin-bottom: 12px; line-height: 1.8;">${p.replace(/\n/g, '<br/>')}</p>`)
          .join('');
      } else {
        // Fallback for .doc or binary files
        try {
          const result = await mammoth.convertToHtml({ arrayBuffer: ab });
          if (result.value.trim()) {
            extractedHtml = result.value;
          } else {
            rawText = await selected.text();
            extractedHtml = `<p style="white-space: pre-wrap; line-height: 1.8;">${rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')}</p>`;
          }
        } catch {
          rawText = await selected.text();
          extractedHtml = `<p style="white-space: pre-wrap; line-height: 1.8;">${rawText}</p>`;
        }
      }

      if (!extractedHtml.trim() && !rawText.trim()) {
        setErrorMsg('Could not extract readable content from this file.');
        return;
      }

      const hasUrdu = containsUrdu(extractedHtml) || containsUrdu(rawText);
      setIsUrdu(hasUrdu);
      setDirection(hasUrdu ? 'rtl' : 'ltr');
      setHtmlContent(extractedHtml || `<p>${rawText}</p>`);
      setSuccessMsg(`Document "${selected.name}" parsed successfully! Ready to convert into PDF.`);
    } catch (err: any) {
      console.error('Word parsing error:', err);
      setErrorMsg(err.message || 'Could not parse Word document.');
    } finally {
      setIsReading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Convert rendered document DOM to A4 PDF using html2canvas & pdf-lib
  const handleConvertToPdf = async () => {
    if (!documentPreviewRef.current || !htmlContent.trim()) {
      setErrorMsg('No document content to convert.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      setProgressText('Rendering document layout with high-definition font engine...');

      const targetElement = documentPreviewRef.current;

      // Render the styled HTML container onto high-resolution canvas (scale 2.0 for retina sharpness)
      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      setProgressText('Paginating into standard A4 sheets...');

      // Standard A4 dimensions in PDF points (72 DPI)
      const pdfPageWidth = 595.28;
      const pdfPageHeight = 841.89;

      // Calculate how many canvas vertical pixels correspond to 1 A4 page
      const a4AspectRatio = pdfPageHeight / pdfPageWidth; // 1.414
      const pageCanvasHeight = canvas.width * a4AspectRatio;
      const totalPages = Math.ceil(canvas.height / pageCanvasHeight);

      const pdfDoc = await PDFDocument.create();

      for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        setProgressText(`Exporting A4 Page ${pageIdx + 1} of ${totalPages}...`);

        const sourceY = pageIdx * pageCanvasHeight;
        const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);

        // Create individual page canvas
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageCanvasHeight;
        const pageCtx = pageCanvas.getContext('2d');

        if (!pageCtx) continue;

        // Fill crisp white background
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // Draw this page's slice from main canvas
        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        // Export page slice as high-quality JPEG
        const jpegBlob: Blob = await new Promise((resolve) => {
          pageCanvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.94);
        });

        const jpegBuffer = await jpegBlob.arrayBuffer();
        const embeddedImage = await pdfDoc.embedJpg(jpegBuffer);

        const newPage = pdfDoc.addPage([pdfPageWidth, pdfPageHeight]);
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: pdfPageWidth,
          height: pdfPageHeight,
        });
      }

      setProgressText('Finalizing PDF document...');
      const pdfBytes = await pdfDoc.save();
      const outputName = `${docTitle.replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_')}.pdf`;
      downloadPdfBytes(pdfBytes, outputName);

      setSuccessMsg(`Successfully generated and downloaded "${outputName}" (${totalPages} pages) with full fonts & layout!`);
    } catch (err: any) {
      console.error('Word to PDF generation error:', err);
      setErrorMsg(err.message || 'Failed to convert document to PDF.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  // Browser Print Dialog (Native Vector Output)
  const handlePrintPdf = () => {
    if (!documentPreviewRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setErrorMsg('Please allow pop-ups to use native browser print.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${direction}">
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
          @page { size: A4; margin: 20mm; }
          body {
            font-family: ${direction === 'rtl' ? "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Urdu Typesetting', 'Segoe UI', Arial, sans-serif" : "'Segoe UI', Calibri, Arial, sans-serif"};
            line-height: ${direction === 'rtl' ? '2.4' : '1.7'};
            font-size: ${direction === 'rtl' ? '14pt' : '11pt'};
            color: #0f172a;
            direction: ${direction};
            text-align: ${direction === 'rtl' ? 'right' : 'left'};
          }
          h1, h2, h3 { color: #020f22; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          td, th { border: 1px solid #cbd5e1; padding: 8px; }
        </style>
      </head>
      <body>
        <h1 style="border-bottom: 2px solid #e11d48; padding-bottom: 10px; margin-bottom: 25px;">${docTitle}</h1>
        ${htmlContent}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleReset = () => {
    setFile(null);
    setHtmlContent('');
    setDocTitle('Document');
    setIsUrdu(false);
    setDirection('ltr');
    setSuccessMsg(null);
    setErrorMsg(null);
    setProgressText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileType className="w-5 h-5 text-rose-600" />
              <span>Word to PDF Converter (English & Urdu Nastaliq)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Convert real Microsoft Word documents (.docx, .doc, .txt) into pristine A4 PDF documents without losing any text or formatting.
            </p>
          </div>

          {(file || htmlContent) && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Upload New</span>
            </button>
          )}
        </div>

        {/* Upload Drop Zone */}
        {!file && !htmlContent ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc,.txt,.rtf,.md"
              onChange={handleFileChange}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer relative group ${
                isDragging 
                  ? 'border-rose-500 bg-rose-100/50 scale-[1.01]' 
                  : 'border-rose-200 hover:border-rose-400 bg-rose-50/30'
              }`}
            >
              <div className="space-y-3 pointer-events-none select-none">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  {isReading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-base text-slate-900">
                    {isReading ? 'Parsing Word Document...' : 'Click to select Word file (.docx) or drag & drop here'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports tables, headings, Urdu Nastaliq, and English • 100% Client-Side Private
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs group-hover:bg-rose-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Browse Word File (.docx)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info Card */}
            {file && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900">{file.name}</p>
                      {isUrdu && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          اردو دستاویز
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • Ready for high-resolution A4 PDF conversion
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDirection(direction === 'ltr' ? 'rtl' : 'ltr')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {direction === 'rtl' ? <AlignRight className="w-3.5 h-3.5 text-rose-600" /> : <AlignLeft className="w-3.5 h-3.5 text-slate-600" />}
                    <span>{direction === 'rtl' ? 'RTL (دائیں سے بائیں)' : 'LTR (بائیں سے دائیں)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Document Title Header */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                PDF Document Header Title:
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
              />
            </div>

            {/* Styled Document Live Preview (WYSIWYG layout container) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Document Live Preview (Matches Output PDF Exactly):</span>
                <span className="text-slate-400 font-normal">A4 Paper View</span>
              </div>

              <div className="border border-slate-300 rounded-3xl bg-slate-100/70 p-4 sm:p-8 max-h-[500px] overflow-y-auto shadow-inner flex justify-center">
                {/* Visual A4 Sheet Container */}
                <div
                  ref={documentPreviewRef}
                  dir={direction}
                  style={{
                    fontFamily: direction === 'rtl'
                      ? "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Urdu Typesetting', 'Segoe UI', Tahoma, sans-serif"
                      : "'Segoe UI', Calibri, Arial, sans-serif",
                    lineHeight: direction === 'rtl' ? '2.4' : '1.7',
                    fontSize: direction === 'rtl' ? '15px' : '13px',
                  }}
                  className={`w-full max-w-[700px] min-h-[900px] bg-white rounded-2xl shadow-md p-8 sm:p-12 text-slate-900 border border-slate-200 ${
                    direction === 'rtl' ? 'text-right' : 'text-left'
                  }`}
                >
                  <h1 className="text-2xl font-black text-slate-900 pb-3 mb-6 border-b-2 border-rose-500 tracking-tight">
                    {docTitle}
                  </h1>

                  <div 
                    dangerouslySetInnerHTML={{ __html: htmlContent }} 
                    className="prose prose-slate max-w-none space-y-4"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleConvertToPdf}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{progressText || 'Generating A4 PDF...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Convert to A4 PDF & Download</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrintPdf}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                <Printer className="w-4 h-4" />
                <span>Direct Print / Native Vector PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

      </div>

    </div>
  );
};
