import React, { useState, useRef } from 'react';
import { 
  Minimize2, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  FileText,
  Loader2,
  Sliders,
  ShieldCheck,
  Info,
  Check
} from 'lucide-react';
import { 
  compressPdfDocument, 
  downloadPdfBytes, 
  type CompressionProfile, 
  type CompressPdfResult 
} from '../../engines/pdfEngine';

interface ProfileOption {
  id: CompressionProfile;
  title: string;
  badge: string;
  description: string;
  recommendation: string;
}

const COMPRESSION_PROFILES: ProfileOption[] = [
  {
    id: 'lossless',
    title: 'Lossless Structural',
    badge: '100% Bit-Exact',
    description: 'Compacts object streams, removes orphaned metadata, and optimizes cross-reference tables without altering any image or vector data.',
    recommendation: 'Best for text-heavy documents, office reports, and contracts.'
  },
  {
    id: 'balanced',
    title: 'Balanced Document',
    badge: 'Recommended',
    description: 'Structural stream compression plus in-place high-quality JPEG recompression (75% quality). Zero page flattening; text remains crisp vector.',
    recommendation: 'Best for presentations, brochures, and documents with embedded photos.'
  },
  {
    id: 'strong',
    title: 'Maximum Reduction',
    badge: 'Smallest File',
    description: 'Higher embedded image compression (58% quality) and downscales oversized embedded images (>1600px). Preserves all text, vector paths, and layout.',
    recommendation: 'Best for scanned files, large portfolios, and strict upload portals.'
  }
];

export const PdfCompressorTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<CompressionProfile>('balanced');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [result, setResult] = useState<CompressPdfResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAll = () => {
    setFile(null);
    setResult(null);
    setErrorMsg(null);
    setIsProcessing(false);
    setProgressStage('');
    setProgressPercent(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = (selected: File) => {
    setErrorMsg(null);
    setResult(null);
    setProgressStage('');
    setProgressPercent(0);

    if (selected.size === 0) {
      setErrorMsg('The selected PDF file is empty (0 bytes).');
      return;
    }

    if (!selected.name.toLowerCase().endsWith('.pdf') && selected.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file (.pdf).');
      return;
    }

    setFile(selected);
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

  const handleCompress = async () => {
    if (!file || isProcessing) return;

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setResult(null);
      setProgressStage('Initializing document processor...');
      setProgressPercent(5);

      const compResult = await compressPdfDocument(file, {
        profile,
        onProgress: (stage, pct) => {
          setProgressStage(stage);
          setProgressPercent(pct);
        }
      });

      setResult(compResult);
    } catch (err: any) {
      console.error('PDF compression error:', err);
      setErrorMsg(err.message || 'Failed to compress PDF.');
    } finally {
      setIsProcessing(false);
      setProgressStage('');
      setProgressPercent(0);
    }
  };

  const handleDownloadResult = () => {
    if (!result || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    const outName = `${baseName}_optimized_${profile}.pdf`;
    downloadPdfBytes(result.outputBytes, outName);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Minimize2 className="w-5 h-5 text-rose-600" />
              <span>Smart PDF Compressor</span>
            </h2>
            <p className="text-xs text-slate-500">
              Genuine in-browser document optimization. Preserves selectable text, vectors, and document layout without converting pages to images.
            </p>
          </div>

          {file && (
            <button
              onClick={resetAll}
              disabled={isProcessing}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
              aria-label="Reset compressor"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Upload State */}
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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
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
                    Click to choose PDF or drag & drop here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    100% Client-Side Private • Selectable text & vector layout preserved • No server uploads
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
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 truncate max-w-xs sm:max-w-md">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    Original Size: <span className="font-semibold text-slate-700">{formatSize(file.size)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                  Ready to optimize
                </span>
              </div>
            </div>

            {/* Profile Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-rose-600" />
                  <span>Choose Compression Profile:</span>
                </label>
                <span className="text-[11px] text-slate-400">Zero page rasterization in all modes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {COMPRESSION_PROFILES.map((opt) => {
                  const isSelected = profile === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setProfile(opt.id)}
                      className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-3 disabled:opacity-50 ${
                        isSelected 
                          ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/20 shadow-xs' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-xs ${isSelected ? 'text-rose-900' : 'text-slate-900'}`}>
                            {opt.title}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-rose-200 text-rose-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>

                      <p className="text-[10px] font-medium text-slate-400 border-t border-slate-100 pt-2">
                        {opt.recommendation}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In-Browser Integrity Guarantee */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Document Integrity Guarantee:</strong> SiftX never flattens entire pages into JPEG images. Existing searchable text, fonts, vector paths, links, and form fields remain 100% vector and interactive.
              </span>
            </div>

            {/* Action Trigger Button */}
            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progressStage || 'Optimizing Document...'} ({progressPercent}%)</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Compress Document ({COMPRESSION_PROFILES.find(p => p.id === profile)?.title})</span>
                </>
              )}
            </button>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>{progressStage}</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>
            )}

            {/* Results Section */}
            {result && (
              <div className="space-y-4 pt-2">
                {result.isReduced ? (
                  /* Successful Genuine Reduction */
                  <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-emerald-950">
                          Compression Successful: Reduced by {result.savedPercent}%
                        </h3>
                        <p className="text-xs text-emerald-700">
                          Saved {formatSize(result.savedBytes)} with all document structures intact.
                        </p>
                      </div>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-emerald-100 text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Original</span>
                        <span className="text-sm font-black text-slate-800">{formatSize(result.originalSize)}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-emerald-100 text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Optimized</span>
                        <span className="text-sm font-black text-emerald-700">{formatSize(result.compressedSize)}</span>
                      </div>
                      <div className="p-3 bg-emerald-600 text-white rounded-xl text-center shadow-xs">
                        <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">Savings</span>
                        <span className="text-sm font-black">-{result.savedPercent}%</span>
                      </div>
                    </div>

                    {/* Preservation Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Selectable & searchable text preserved</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>All {result.pageCount} pages, dimensions & rotation intact</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Vector lines, forms, and links preserved</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{result.imagesOptimized > 0 ? `${result.imagesOptimized} embedded images optimized` : 'Structural object streams packed'}</span>
                      </div>
                    </div>

                    {/* Download CTA */}
                    <button
                      onClick={handleDownloadResult}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Compressed PDF ({formatSize(result.compressedSize)})</span>
                    </button>
                  </div>
                ) : (
                  /* Already Optimally Packed Notice */
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-sm text-slate-900">
                          Notice: Document is already optimally packed
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          In-browser structural optimization resulted in an equal or slightly larger file ({formatSize(result.compressedSize)} vs {formatSize(result.originalSize)}).
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed pt-1">
                          To protect your document quality and avoid inflating its file size, no file was downloaded. Text-based vector documents and already compressed PDFs cannot be reduced further without destructive rasterization.
                        </p>
                        {profile === 'lossless' && (
                          <p className="text-xs text-rose-700 font-semibold pt-1">
                            Tip: If your document contains photos or scans, try selecting the "Balanced" or "Maximum" profile.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Optimization Halted</span>
              <p className="text-rose-700">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Screen Reader Live Region */}
        <div role="status" aria-live="polite" className="sr-only">
          {isProcessing && `Compressing PDF: ${progressStage} (${progressPercent}%)`}
          {result && result.message}
          {errorMsg && `Error: ${errorMsg}`}
        </div>

      </div>

    </div>
  );
};

export default PdfCompressorTool;
