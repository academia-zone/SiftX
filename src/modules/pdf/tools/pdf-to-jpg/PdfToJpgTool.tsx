import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  FileText,
  Loader2,
  Archive,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import JSZip from 'jszip';
import { pdfjsLib } from '../../engines/pdfjsHelper';

export const PdfToJpgTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [imageFormat, setImageFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [processProgress, setProcessProgress] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfDocRef = useRef<any>(null);

  const renderPagePreview = async (pageNum: number) => {
    if (!pdfDocRef.current) return;
    try {
      setIsRendering(true);
      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.85));
      }
    } catch (err: any) {
      console.error('Page render error:', err);
    } finally {
      setIsRendering(false);
    }
  };

  const processFile = async (selected: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPreviewDataUrl(null);

    if (!selected.name.toLowerCase().endsWith('.pdf') && selected.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file (.pdf).');
      return;
    }
    setFile(selected);

    try {
      setIsRendering(true);
      const ab = await selected.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(ab) });
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setPageCount(pdf.numPages);
      setCurrentPage(1);

      // Render first page preview
      await renderPagePreview(1);
      setSuccessMsg(`PDF loaded (${pdf.numPages} pages)! Ready to convert into high-res images.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Could not render PDF pages.');
    } finally {
      setIsRendering(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > pageCount) return;
    setCurrentPage(newPage);
    await renderPagePreview(newPage);
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

  const handleDownloadSinglePage = async () => {
    if (!pdfDocRef.current || !file) return;

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const page = await pdfDocRef.current.getPage(currentPage);
      // Crisp 2x retina scale
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;
      await page.render({ canvasContext: ctx, viewport }).promise;

      const ext = imageFormat === 'png' ? 'png' : 'jpg';
      const mime = imageFormat === 'png' ? 'image/png' : 'image/jpeg';
      const quality = imageFormat === 'png' ? undefined : 0.92;

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.name.replace(/\.pdf$/i, '')}_page_${currentPage}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSuccessMsg(`Page ${currentPage} successfully exported as high-res ${ext.toUpperCase()}!`);
      }, mime, quality);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to download image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAllPagesZip = async () => {
    if (!pdfDocRef.current || !file) return;

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const zip = new JSZip();
      const baseName = file.name.replace(/\.pdf$/i, '');
      const ext = imageFormat === 'png' ? 'png' : 'jpg';
      const mime = imageFormat === 'png' ? 'image/png' : 'image/jpeg';
      const quality = imageFormat === 'png' ? undefined : 0.90;

      for (let i = 1; i <= pageCount; i++) {
        setProcessProgress(`Rendering Page ${i} of ${pageCount}...`);
        const page = await pdfDocRef.current.getPage(i);
        const viewport = page.getViewport({ scale: 1.8 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const blob: Blob = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b!), mime, quality);
        });

        const arrayBuffer = await blob.arrayBuffer();
        const paddedNum = String(i).padStart(2, '0');
        zip.file(`${baseName}_Page_${paddedNum}.${ext}`, arrayBuffer);
      }

      setProcessProgress('Compressing Images ZIP...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_All_Pages_${ext.toUpperCase()}_ZIP.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMsg(`All ${pageCount} pages rendered and downloaded as high-res image ZIP archive!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to export all pages to ZIP.');
    } finally {
      setIsProcessing(false);
      setProcessProgress('');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setCurrentPage(1);
    setPreviewDataUrl(null);
    pdfDocRef.current = null;
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
              <ImageIcon className="w-5 h-5 text-rose-600" />
              <span>PDF to High-Resolution JPG / PNG</span>
            </h2>
            <p className="text-xs text-slate-500">
              Render actual PDF document pages into crisp 300 DPI image files (single page or all pages in a ZIP).
            </p>
          </div>

          {file && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Upload New</span>
            </button>
          )}
        </div>

        {/* Upload Zone */}
        {!file ? (
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
                    100% Client-Side Private • Sharp vector rendering to JPG / PNG
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
          <div className="space-y-6">
            {/* Selected File Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {pageCount} total pages • {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                {pageCount} Pages
              </span>
            </div>

            {/* Live Page Preview Box */}
            <div className="p-4 rounded-3xl bg-slate-100/70 border border-slate-200/80 flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full max-w-md px-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isRendering}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-black text-slate-700">
                  Page {currentPage} of {pageCount}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pageCount || isRendering}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 cursor-pointer shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full max-w-sm aspect-3/4 rounded-2xl border border-slate-300 bg-white shadow-md overflow-hidden flex items-center justify-center p-2 relative">
                {isRendering ? (
                  <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
                ) : previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt={`Page ${currentPage}`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Loading Preview...</span>
                )}
              </div>
            </div>

            {/* Target Image Format */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Target Image Format:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'jpeg', label: 'JPEG Image (.jpg)', desc: 'Smaller file size, fast sharing' },
                  { id: 'png', label: 'PNG Image (.png)', desc: 'Lossless quality, sharp text edges' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setImageFormat(item.id as any)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      imageFormat === item.id
                        ? 'border-rose-500 bg-rose-50/50 shadow-xs ring-2 ring-rose-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <p className={`text-xs font-bold ${imageFormat === item.id ? 'text-rose-700' : 'text-slate-800'}`}>
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Render Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDownloadSinglePage}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download Page {currentPage} ({imageFormat.toUpperCase()})</span>
              </button>

              <button
                onClick={handleDownloadAllPagesZip}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{processProgress || 'Exporting ZIP...'}</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    <span>Export All {pageCount} Pages as ZIP</span>
                  </>
                )}
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
