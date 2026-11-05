import React, { useState, useRef } from 'react';
import { 
  Scissors, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  FileText,
  Loader2,
  Archive
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { splitPdfByRange, downloadPdfBytes } from '../../engines/pdfEngine';

export const PdfSplitterTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rangeMode, setRangeMode] = useState<'custom' | 'zip-all'>('custom');
  const [pageRange, setPageRange] = useState<string>('1-2');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [splitProgress, setSplitProgress] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selected: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const isPdfExt = selected.name.toLowerCase().endsWith('.pdf');
    const isPdfMime = selected.type === 'application/pdf';

    if (!isPdfExt && !isPdfMime) {
      setErrorMsg('Please select a valid PDF file (.pdf).');
      return;
    }

    try {
      setIsReading(true);
      const ab = await selected.arrayBuffer();
      const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
      const count = doc.getPageCount();

      if (count === 0) {
        setErrorMsg('The selected PDF file contains 0 pages.');
        return;
      }

      setFile(selected);
      setTotalPages(count);
      setPageRange(count > 1 ? `1-${Math.min(count, 2)}` : '1');
    } catch (err: any) {
      console.error('PDF Read Error:', err);
      setErrorMsg(
        err?.message?.includes('encrypted')
          ? 'This PDF is encrypted with a password. Please unlock it before splitting.'
          : (err?.message || 'Could not read PDF metadata. The file may be corrupted or format is unsupported.')
      );
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

  const handleSplit = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      if (rangeMode === 'zip-all') {
        // Extract every single page into individual standalone PDF files and bundle into ZIP
        const zip = new JSZip();
        const baseName = file.name.replace(/\.pdf$/i, '');
        const ab = await file.arrayBuffer();
        const sourceDoc = await PDFDocument.load(ab, { ignoreEncryption: true });

        for (let i = 0; i < totalPages; i++) {
          setSplitProgress(`Creating Page ${i + 1} of ${totalPages}...`);
          const singlePageDoc = await PDFDocument.create();
          const [copiedPage] = await singlePageDoc.copyPages(sourceDoc, [i]);
          singlePageDoc.addPage(copiedPage);
          const singlePdfBytes = await singlePageDoc.save();
          const pageNumPadded = String(i + 1).padStart(2, '0');
          zip.file(`${baseName}_Page_${pageNumPadded}.pdf`, singlePdfBytes);
        }

        setSplitProgress('Compressing ZIP archive...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}_All_Pages_ZIP.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSuccessMsg(`All ${totalPages} pages split one-by-one and downloaded as ZIP archive!`);
      } else {
        // Custom range extraction
        const splitBytes = await splitPdfByRange(file, pageRange);
        downloadPdfBytes(splitBytes, `extracted_${file.name.replace(/\.pdf$/i, '')}_pages_${pageRange.replace(/[\s,]+/g, '_')}.pdf`);
        setSuccessMsg(`Extracted pages (${pageRange}) successfully downloaded!`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to split PDF document.');
    } finally {
      setIsProcessing(false);
      setSplitProgress('');
    }
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setSuccessMsg(null);
    setErrorMsg(null);
    setSplitProgress('');
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
              <Scissors className="w-5 h-5 text-rose-600" />
              <span>Split & Extract PDF Pages</span>
            </h2>
            <p className="text-xs text-slate-500">
              Extract custom page ranges or split all pages one-by-one into a bundled ZIP archive.
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

        {/* Upload Drop Zone */}
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
                  {isReading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-base text-slate-900">
                    {isReading ? 'Reading PDF Structure...' : 'Click to select or Drop PDF here'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports any standard PDF document • 100% Client-Side Private
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs group-hover:bg-rose-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Browse PDF File
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Selected File Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {totalPages} total pages • {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                {totalPages} Pages
              </span>
            </div>

            {/* Split Mode Selector */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRangeMode('custom')}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    rangeMode === 'custom'
                      ? 'border-rose-500 bg-rose-50/50 shadow-xs ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-rose-600" />
                    <p className={`text-xs font-bold ${rangeMode === 'custom' ? 'text-rose-700' : 'text-slate-800'}`}>
                      Custom Page Ranges
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Extract specific pages (e.g. 1-3, 5) into a single PDF
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRangeMode('zip-all')}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    rangeMode === 'zip-all'
                      ? 'border-rose-500 bg-rose-50/50 shadow-xs ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-rose-600" />
                    <p className={`text-xs font-bold ${rangeMode === 'zip-all' ? 'text-rose-700' : 'text-slate-800'}`}>
                      Split All Pages to ZIP Archive
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Extract every page (1 to {totalPages}) as individual PDFs in one ZIP file
                  </p>
                </button>
              </div>

              {rangeMode === 'custom' && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-700 flex justify-between">
                    <span>Specify Page Ranges:</span>
                    <span className="text-slate-400 font-normal">Example: 1-3, 5, 8-10</span>
                  </label>
                  <input
                    type="text"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder={`e.g. 1-${totalPages}`}
                    className="w-full p-3 rounded-2xl border border-slate-200 font-mono text-sm font-bold text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                  />
                  <p className="text-[11px] text-slate-400">
                    Use commas to separate distinct page numbers and hyphens for continuous page ranges.
                  </p>
                </div>
              )}
            </div>

            {/* Split Action Button */}
            <button
              onClick={handleSplit}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{splitProgress || 'Processing Split...'}</span>
                </>
              ) : rangeMode === 'zip-all' ? (
                <>
                  <Archive className="w-4 h-4" />
                  <span>Split All {totalPages} Pages & Download ZIP</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Extract Pages ({pageRange}) & Download PDF</span>
                </>
              )}
            </button>
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
