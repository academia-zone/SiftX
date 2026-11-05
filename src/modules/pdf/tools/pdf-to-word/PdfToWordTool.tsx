import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ArrowLeftRight,
  AlignRight,
  Languages
} from 'lucide-react';
import { pdfjsLib } from '../../engines/pdfjsHelper';

// Helper: Check if string has Urdu / Arabic / Persian characters
const containsUrdu = (text: string): boolean => {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFC]/.test(text);
};

// Helper: Un-shape and canonicalize Arabic/Urdu presentation forms to standard Unicode
const canonicalizeUrduText = (str: string): string => {
  return str.normalize('NFKC');
};

// Helper: Fix intra-word spacing between Urdu connecting characters
const fixUrduBrokenLetters = (text: string): string => {
  let cleaned = canonicalizeUrduText(text);

  // Urdu connecting characters (letters that connect to following letters)
  // When PDFs insert a space between connecting letters, remove that space
  // Examples: ب، پ، ت، ٹ، ث، ج، چ، ح، خ، س، ش، ص، ض، ط، ظ، ع، غ، ف، ق، ک، گ، ل، م، ن، ہ، ی، ے
  const connectingBefore = /[بپتٹثجچحخسشصضطظعغفقکگلمنہہیئے]\s+(?=[اآبپتٹثجچحخسشصضطظعغفقکگلمنہہیئےدڈذرڑزژوو])/g;
  cleaned = cleaned.replace(connectingBefore, (match) => match.trim());

  return cleaned;
};

// Helper: Reverse word order on lines that were printed in visual LTR order
const flipUrduWordOrder = (text: string): string => {
  const lines = text.split('\n');
  const flippedLines = lines.map((line) => {
    if (!containsUrdu(line) || line.startsWith('=== PAGE')) {
      return line;
    }
    // Reverse words in this line while preserving spaces
    const words = line.trim().split(/\s+/);
    if (words.length <= 1) return line;
    return words.reverse().join(' ');
  });
  return flippedLines.join('\n');
};

export const PdfToWordTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<string>('');
  const [isUrduDetected, setIsUrduDetected] = useState<boolean>(false);
  const [isRtlMode, setIsRtlMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selected: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setExtractedText('');
    setIsUrduDetected(false);

    if (!selected.name.toLowerCase().endsWith('.pdf') && selected.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file (.pdf).');
      return;
    }
    setFile(selected);

    try {
      setIsProcessing(true);
      setProcessProgress('Loading PDF document structure...');

      const arrayBuffer = await selected.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      setPageCount(numPages);

      let fullExtractedContent = '';
      let urduFoundAcrossDoc = false;

      for (let i = 1; i <= numPages; i++) {
        setProcessProgress(`Extracting Text from Page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const items = textContent.items as Array<{
          str: string;
          transform: number[];
          width: number;
          hasEOL?: boolean;
        }>;

        // Group text items by line (clustering by Y coordinate within ~8 points)
        const lineBuckets = new Map<number, Array<{ str: string; x: number; width: number }>>();

        for (const item of items) {
          if (!item.str) continue;
          const currentY = Math.round((item.transform ? item.transform[5] : 0) / 7) * 7;
          const currentX = item.transform ? item.transform[4] : 0;
          const normStr = canonicalizeUrduText(item.str);

          if (containsUrdu(normStr)) {
            urduFoundAcrossDoc = true;
          }

          if (!lineBuckets.has(currentY)) {
            lineBuckets.set(currentY, []);
          }
          lineBuckets.get(currentY)!.push({ str: normStr, x: currentX, width: item.width || 0 });
        }

        // Sort lines descending by Y (top of page to bottom)
        const sortedY = Array.from(lineBuckets.keys()).sort((a, b) => b - a);

        let pageStr = `\n=== PAGE ${i} OF ${numPages} ===\n\n`;

        for (const y of sortedY) {
          const rawItems = lineBuckets.get(y)!;

          // Check if this line is Urdu / Arabic
          const lineSample = rawItems.map(it => it.str).join('');
          const lineIsUrdu = containsUrdu(lineSample);

          // Sort items on this line by X position
          const lineItems = rawItems.sort((a, b) => a.x - b.x);

          let lineStr = '';
          for (let k = 0; k < lineItems.length; k++) {
            const currentItem = lineItems[k];
            const nextItem = lineItems[k + 1];

            lineStr += currentItem.str;

            if (nextItem) {
              const gap = nextItem.x - (currentItem.x + currentItem.width);
              // Only insert space if there is an actual physical word gap (> 2.5 points)
              // or if the string already has whitespace
              if (gap > 2.5 || currentItem.str.endsWith(' ') || nextItem.str.startsWith(' ')) {
                if (!lineStr.endsWith(' ') && !nextItem.str.startsWith(' ')) {
                  lineStr += ' ';
                }
              }
            }
          }

          if (lineStr.trim()) {
            // Apply Urdu connecting letter spacing fix
            if (lineIsUrdu) {
              lineStr = fixUrduBrokenLetters(lineStr);
            }
            pageStr += lineStr.trim() + '\n';
          }
        }

        fullExtractedContent += pageStr + '\n';
      }

      const cleanText = fullExtractedContent.trim();
      if (!cleanText || cleanText.replace(/=== PAGE \d+ OF \d+ ===/g, '').trim().length === 0) {
        setErrorMsg('No selectable text found in this PDF. It may be a scanned image-only document.');
        setExtractedText('');
        return;
      }

      setIsUrduDetected(urduFoundAcrossDoc);
      setIsRtlMode(urduFoundAcrossDoc);
      setExtractedText(cleanText);
      setSuccessMsg(
        urduFoundAcrossDoc
          ? `Urdu text detected & optimized! Extracted ${numPages} pages with Nastaliq formatting ready.`
          : `Successfully extracted all text from ${numPages} pages! Ready to download as Word document.`
      );
    } catch (err: any) {
      console.error('PDF to Word extraction error:', err);
      setErrorMsg(err.message || 'Could not parse text from this PDF file.');
    } finally {
      setIsProcessing(false);
      setProcessProgress('');
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

  // One-click Fix for Broken Urdu Letters
  const handleFixUrduLigatures = () => {
    if (!extractedText) return;
    const fixed = fixUrduBrokenLetters(extractedText);
    setExtractedText(fixed);
    setSuccessMsg('Urdu broken letters rejoined and normalized successfully!');
  };

  // One-click Word Order Flip for Visual LTR PDFs
  const handleFlipWords = () => {
    if (!extractedText) return;
    const flipped = flipUrduWordOrder(extractedText);
    setExtractedText(flipped);
    setSuccessMsg('Word reading order reversed across all Urdu lines!');
  };

  const handleDownloadWord = () => {
    if (!extractedText) return;

    // Build Microsoft Word (.doc) formatted HTML document with full RTL & Urdu font support
    const paragraphs = extractedText.split('\n\n').map((p) => {
      if (p.startsWith('=== PAGE')) {
        return `<div style="border-bottom: 2px solid #e11d48; padding: 10px 0; margin: 25px 0 15px 0; font-weight: bold; font-size: 13pt; color: #be123c;">${p}</div>`;
      }

      const hasUrdu = containsUrdu(p);
      const dirAttr = hasUrdu ? 'dir="rtl"' : 'dir="ltr"';
      const alignStyle = hasUrdu ? 'text-align: right;' : 'text-align: left;';
      const fontStyle = hasUrdu 
        ? "font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Urdu Typesetting', 'Segoe UI', Arial, sans-serif; font-size: 14pt; line-height: 2.2;" 
        : "font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.6;";

      return `<p ${dirAttr} style="margin-bottom: 12px; ${alignStyle} ${fontStyle} color: #0f172a;">${p.replace(/\n/g, '<br/>')}</p>`;
    }).join('');

    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${file?.name || 'Document'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
          body { 
            margin: 40px; 
            font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Urdu Typesetting', Calibri, Arial, sans-serif; 
          }
          h1 { 
            color: #0f172a; 
            font-size: 18pt; 
            margin-bottom: 20px; 
            ${isUrduDetected ? 'text-align: right; direction: rtl;' : ''}
          }
        </style>
      </head>
      <body>
        <h1>${file?.name.replace(/\.pdf$/i, '') || 'Extracted Document'}</h1>
        ${paragraphs}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file?.name.replace(/\.pdf$/i, '') || 'document'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFile(null);
    setExtractedText('');
    setPageCount(0);
    setIsUrduDetected(false);
    setIsRtlMode(false);
    setSuccessMsg(null);
    setErrorMsg(null);
    setProcessProgress('');
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
              <FileText className="w-5 h-5 text-rose-600" />
              <span>PDF to Word Converter (English & Urdu Nastaliq)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Extract every real word, sentence, and paragraph with specialized Urdu ligatures, RTL flow, and Word (.doc) styling.
            </p>
          </div>

          {(file || extractedText) && (
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
        {!file && !extractedText ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
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
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-extrabold text-base text-slate-900">
                    Click to select PDF or drag & drop here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports Urdu, English, and bilingual documents • 100% Client-Side Private
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs group-hover:bg-rose-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Select PDF File
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
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
                      {isUrduDetected && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          اردو متن شامل ہے
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {pageCount} total pages • {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                {extractedText && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyText}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy All Text'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Urdu Optimization Quick Toolbar */}
            {extractedText && (
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Urdu Script & Layout Tools:
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFixUrduLigatures}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    title="Remove unnatural spaces inside words"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    <span>الفاظ جوڑیں (Rejoin Letters)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFlipWords}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    title="If PDF was saved with inverted words, flip them to correct sentence order"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-rose-600" />
                    <span>الفاظ کا رخ سیدھا کریں (Flip Words)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRtlMode(!isRtlMode)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs ${
                      isRtlMode 
                        ? 'bg-rose-600 text-white border-rose-600' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                    <span>{isRtlMode ? 'RTL (دائیں سے بائیں)' : 'LTR (بائیں سے دائیں)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Extracted Preview Area */}
            {isProcessing ? (
              <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto" />
                <p className="text-sm font-bold text-slate-800">{processProgress}</p>
                <p className="text-xs text-slate-400">Extracting and sorting bilingual text streams...</p>
              </div>
            ) : extractedText ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Document Live Preview:</span>
                  <span className="text-slate-400 font-normal">{extractedText.length} characters</span>
                </div>
                <textarea
                  readOnly
                  dir={isRtlMode ? 'rtl' : 'ltr'}
                  value={extractedText}
                  rows={14}
                  style={{
                    fontFamily: isRtlMode 
                      ? "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Urdu Typesetting', 'Segoe UI', Tahoma, sans-serif" 
                      : "'Segoe UI', Arial, sans-serif",
                    lineHeight: isRtlMode ? '2.4' : '1.7',
                    fontSize: isRtlMode ? '16px' : '13px',
                  }}
                  className={`w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 outline-none select-all transition-all ${
                    isRtlMode ? 'text-right' : 'text-left'
                  }`}
                />
              </div>
            ) : null}

            {/* Word Download Button */}
            {extractedText && (
              <button
                onClick={handleDownloadWord}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                <span>Download as Word (.doc) Document with Nastaliq Styles</span>
              </button>
            )}
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
