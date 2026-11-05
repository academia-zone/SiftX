import React, { useState, useRef } from 'react';
import { 
  Layers, 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  CheckCircle2, 
  FileText, 
  AlertCircle,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { mergePdfs, downloadPdfBytes } from '../../engines/pdfEngine';

export const PdfMergerTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (selectedFiles: FileList | File[]) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const validPdfs = Array.from(selectedFiles).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (validPdfs.length === 0) {
      setErrorMsg('Please select valid PDF files (.pdf).');
      return;
    }
    setFiles((prev) => [...prev, ...validPdfs]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
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
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setErrorMsg('Please upload at least 2 PDF files to merge.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const mergedBytes = await mergePdfs(files);
      downloadPdfBytes(mergedBytes, `merged_document_${Date.now()}.pdf`);
      setSuccessMsg(`Successfully merged ${files.length} PDF files into a single unified document!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to merge PDF files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalSizeMb = files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Tool Header & Description */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-rose-600" />
              <span>Combine Multiple PDF Files</span>
            </h2>
            <p className="text-xs text-slate-500">
              Drag and drop to rearrange order, review file sizes, and merge entirely inside your browser.
            </p>
          </div>

          {files.length > 0 && (
            <button
              onClick={() => {
                setFiles([]);
                setSuccessMsg(null);
                setErrorMsg(null);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Upload Drop Zone */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
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
                  Click to choose PDF files or drop them here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports multiple files • 100% Client-Side Safe
                </p>
              </div>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs group-hover:bg-rose-700 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Select PDF Files
              </button>
            </div>
          </div>
        </div>

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

        {/* File Queue List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>File Order ({files.length} documents • {totalSizeMb.toFixed(2)} MB)</span>
              <span>Reorder priority</span>
            </div>

            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-600 shrink-0">
                      {idx + 1}
                    </span>
                    <FileText className="w-5 h-5 text-rose-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === files.length - 1}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer transition-all ml-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Merge Action Button */}
            <div className="pt-4">
              <button
                onClick={handleMerge}
                disabled={isProcessing || files.length < 2}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Merging Files...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Merge {files.length} Files & Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
