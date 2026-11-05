import React, { useState, useRef, useEffect } from 'react';
import { 
  Edit3, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  FileText,
  Eraser,
  PenTool,
  Loader2,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { downloadPdfBytes } from '../../engines/pdfEngine';

type SignatureMode = 'draw' | 'upload';
type SignaturePosition = 'bottom-right' | 'bottom-left' | 'center' | 'top-right';

export const PdfEditorTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [targetPage, setTargetPage] = useState<number>(1);
  const [sigMode, setSigMode] = useState<SignatureMode>('draw');
  const [sigPosition, setSigPosition] = useState<SignaturePosition>('bottom-right');
  const [sigScale, setSigScale] = useState<number>(160); // width in points
  const [autoRemoveBg, setAutoRemoveBg] = useState<boolean>(true);
  const [uploadedSigUrl, setUploadedSigUrl] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigImageInputRef = useRef<HTMLInputElement>(null);

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
      setTotalPages(count);
      setTargetPage(1);
    } catch {
      setTotalPages(1);
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

  // Canvas Drawing Handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [file, sigMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Upload Signature Image with optional White Background Removal
  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imgFile = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = img.width;
          offscreenCanvas.height = img.height;
          const ctx = offscreenCanvas.getContext('2d');

          if (!ctx) {
            setUploadedSigUrl(rawUrl);
            return;
          }

          ctx.drawImage(img, 0, 0);

          if (autoRemoveBg) {
            // Remove white paper background by turning near-white pixels transparent
            const imgData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            const data = imgData.data;

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              // If pixel is light/white (luminance > 210)
              if (r > 205 && g > 205 && b > 205) {
                data[i + 3] = 0; // set alpha transparent
              }
            }
            ctx.putImageData(imgData, 0, 0);
          }

          setUploadedSigUrl(offscreenCanvas.toDataURL('image/png'));
        };
        img.src = rawUrl;
      };

      reader.readAsDataURL(imgFile);
    }
  };

  const handleSignAndDownload = async () => {
    if (!file) return;

    let finalSigDataUrl: string | null = null;

    if (sigMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        setErrorMsg('Please draw your signature on the pad above first.');
        return;
      }
      finalSigDataUrl = canvas.toDataURL('image/png');
    } else {
      if (!uploadedSigUrl) {
        setErrorMsg('Please upload a signature image file (.png/.jpg) first.');
        return;
      }
      finalSigDataUrl = uploadedSigUrl;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      // Page index (0-based)
      const pageIdx = Math.max(0, Math.min(pages.length - 1, targetPage - 1));
      const page = pages[pageIdx];
      const { width: pageWidth, height: pageHeight } = page.getSize();

      const pngImage = await pdfDoc.embedPng(finalSigDataUrl);
      const aspect = pngImage.height / pngImage.width;
      const sigWidth = sigScale;
      const sigHeight = sigScale * aspect;

      // Coordinate placement in standard PDF points
      let x = pageWidth - sigWidth - 40;
      let y = 50;

      if (sigPosition === 'bottom-left') {
        x = 40;
        y = 50;
      } else if (sigPosition === 'top-right') {
        x = pageWidth - sigWidth - 40;
        y = pageHeight - sigHeight - 50;
      } else if (sigPosition === 'center') {
        x = (pageWidth - sigWidth) / 2;
        y = (pageHeight - sigHeight) / 2;
      }

      page.drawImage(pngImage, {
        x,
        y,
        width: sigWidth,
        height: sigHeight,
      });

      const signedBytes = await pdfDoc.save();
      downloadPdfBytes(signedBytes, `signed_page_${targetPage}_${file.name}`);
      setSuccessMsg(`Transparent signature embedded on Page ${targetPage} and downloaded!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to embed signature into PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    clearCanvas();
    setUploadedSigUrl(null);
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
              <Edit3 className="w-5 h-5 text-rose-600" />
              <span>PDF Editor & Electronic Signature (E-Sign)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Draw signatures or upload scanned signature images with automatic white background removal.
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
                    100% Client-Side Private • Draw or upload signature files
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
                    {totalPages} total pages • {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                {totalPages} Pages
              </span>
            </div>

            {/* Signature Source Mode Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Choose Signature Method:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSigMode('draw')}
                  className={`p-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    sigMode === 'draw'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <PenTool className="w-4 h-4" />
                  <span>Draw Signature on Pad</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSigMode('upload')}
                  className={`p-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    sigMode === 'upload'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Upload Signature Image (PNG / JPG)</span>
                </button>
              </div>
            </div>

            {/* Mode A: Canvas Drawing Pad */}
            {sigMode === 'draw' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Draw your signature below:
                  </label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Clear Pad</span>
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50 overflow-hidden flex items-center justify-center p-2 relative">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="bg-white rounded-2xl cursor-crosshair touch-none shadow-xs max-w-full"
                  />
                  {!hasDrawn && (
                    <div className="absolute pointer-events-none text-slate-300 text-sm font-semibold italic">
                      Draw your signature here with mouse or finger...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode B: Upload Image with Transparent White Removal */}
            {sigMode === 'upload' && (
              <div className="space-y-4 p-5 rounded-3xl bg-slate-50 border border-slate-200/80">
                <input
                  ref={sigImageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg"
                  onChange={handleSignatureImageUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Upload your signature photo or scanned document
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Supports JPG, PNG, and camera photos of paper signatures
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => sigImageInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse Signature Image</span>
                  </button>
                </div>

                {/* Auto Background Removal Toggle */}
                <div 
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer"
                  onClick={() => setAutoRemoveBg(!autoRemoveBg)}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Auto-Remove White Paper Background (Transparency)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Removes white paper color so only dark pen ink appears transparently on your PDF
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${autoRemoveBg ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300'}`}>
                    {autoRemoveBg && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {/* Image Preview Box */}
                {uploadedSigUrl && (
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-14 border border-dashed border-slate-300 rounded-xl bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[size:16px_16px] flex items-center justify-center p-1">
                        <img
                          src={uploadedSigUrl}
                          alt="Signature Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Signature Loaded</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">Transparent Ink Mask Ready</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUploadedSigUrl(null)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Target Page & Position & Size Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              
              {/* Target Page */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Target Page to Sign:
                </label>
                <select
                  value={targetPage}
                  onChange={(e) => setTargetPage(parseInt(e.target.value, 10))}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-rose-500 bg-white cursor-pointer"
                >
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      Page {idx + 1} of {totalPages}
                    </option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Stamp Position:
                </label>
                <select
                  value={sigPosition}
                  onChange={(e) => setSigPosition(e.target.value as any)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-rose-500 bg-white cursor-pointer"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="center">Center of Page</option>
                  <option value="top-right">Top Right</option>
                </select>
              </div>

              {/* Signature Size Scale */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Signature Size:</span>
                  <span className="font-mono text-rose-600">{sigScale} pt</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="260"
                  step="10"
                  value={sigScale}
                  onChange={(e) => setSigScale(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-600 cursor-pointer pt-2"
                />
              </div>

            </div>

            {/* Sign and Download Action */}
            <button
              onClick={handleSignAndDownload}
              disabled={isProcessing || (sigMode === 'draw' ? !hasDrawn : !uploadedSigUrl)}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Stamping Signature into PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Embed Signature & Download Signed PDF</span>
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
