import React, { useState, useRef } from 'react';
import { 
  LayoutGrid, 
  Upload, 
  RotateCw, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  FileText,
  Loader2,
  ArrowUp,
  ArrowDown,
  Trash2,
  Shuffle
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import { downloadPdfBytes } from '../../engines/pdfEngine';

interface PageItem {
  originalIndex: number; // 0-based
  displayNumber: number; // 1-based
  rotation: number;
}

export const PdfPageOrganizerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selected: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!selected.name.toLowerCase().endsWith('.pdf') && selected.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file (.pdf).');
      return;
    }
    setFile(selected);

    try {
      const ab = await selected.arrayBuffer();
      const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
      const count = doc.getPageCount();

      const items: PageItem[] = [];
      for (let i = 0; i < count; i++) {
        items.push({
          originalIndex: i,
          displayNumber: i + 1,
          rotation: 0,
        });
      }
      setPages(items);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not read PDF pages.');
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

  const movePage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pages.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newPages = [...pages];
    const temp = newPages[index];
    newPages[index] = newPages[targetIndex];
    newPages[targetIndex] = temp;
    setPages(newPages);
  };

  const rotateSinglePage = (index: number) => {
    const newPages = [...pages];
    newPages[index].rotation = (newPages[index].rotation + 90) % 360;
    setPages(newPages);
  };

  const removePage = (index: number) => {
    if (pages.length <= 1) {
      setErrorMsg('A PDF must contain at least 1 page.');
      return;
    }
    setPages(pages.filter((_, idx) => idx !== index));
  };

  const reverseAllPages = () => {
    setPages([...pages].reverse());
  };

  const handleSaveOrganized = async () => {
    if (!file || pages.length === 0) return;

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const ab = await file.arrayBuffer();
      const sourceDoc = await PDFDocument.load(ab, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      for (const pageItem of pages) {
        const [copiedPage] = await newDoc.copyPages(sourceDoc, [pageItem.originalIndex]);
        if (pageItem.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees((currentRotation + pageItem.rotation) % 360));
        }
        newDoc.addPage(copiedPage);
      }

      const outputBytes = await newDoc.save();
      downloadPdfBytes(outputBytes, `reorganized_${file.name}`);
      setSuccessMsg(`Document successfully reorganized (${pages.length} pages) and downloaded!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save reorganized PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPages([]);
    setSuccessMsg(null);
    setErrorMsg(null);
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
              <LayoutGrid className="w-5 h-5 text-rose-600" />
              <span>Interactive PDF Page Organizer & Reorder</span>
            </h2>
            <p className="text-xs text-slate-500">
              Move page 1 to 2, swap orders, delete unwanted pages, rotate orientations, and build custom layouts.
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
                    100% Client-Side Private • Instant page sequencing & rotation
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
                    {pages.length} pages in current output sequence
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={reverseAllPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Reverse entire document order"
              >
                <Shuffle className="w-3.5 h-3.5 text-rose-600" />
                <span>Reverse All</span>
              </button>
            </div>

            {/* Interactive Page Cards Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Arrange Page Order (Use arrows to swap positions):
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pages.map((p, idx) => (
                  <div
                    key={`${p.originalIndex}-${idx}`}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-3 hover:border-rose-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Orig: #{p.displayNumber}
                      </span>
                    </div>

                    <div className="h-20 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400">
                      <FileText className="w-5 h-5 text-rose-400" />
                      <span className="text-[10px] font-bold text-slate-600">
                        Page {p.displayNumber}
                      </span>
                      {p.rotation !== 0 && (
                        <span className="text-[9px] font-black text-rose-600">
                          ↻ {p.rotation}°
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => movePage(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                          title="Move Left / Earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePage(idx, 'down')}
                          disabled={idx === pages.length - 1}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                          title="Move Right / Later"
                        >
                          <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                        </button>
                        <button
                          type="button"
                          onClick={() => rotateSinglePage(idx)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Rotate +90°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removePage(idx)}
                        className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        title="Delete Page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleSaveOrganized}
              disabled={isProcessing || pages.length === 0}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reorganizing Document...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Save Reordered PDF ({pages.length} Pages)</span>
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
