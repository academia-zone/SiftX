import React, { useState, useRef } from 'react';
import { 
  Stamp, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  FileText,
  Loader2,
  Palette
} from 'lucide-react';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { addPageNumbers, downloadPdfBytes } from '../../engines/pdfEngine';

type WatermarkPosition = 'diagonal-center' | 'horizontal-center' | 'top-header' | 'bottom-footer';
type WatermarkColor = 'rose' | 'slate' | 'blue' | 'emerald' | 'amber';

export const PdfWatermarkTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState<number>(48);
  const [opacity, setOpacity] = useState<number>(0.25);
  const [position, setPosition] = useState<WatermarkPosition>('diagonal-center');
  const [colorChoice, setColorChoice] = useState<WatermarkColor>('rose');
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selected: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
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

  const getColorRgb = (c: WatermarkColor) => {
    switch (c) {
      case 'rose':
        return rgb(0.88, 0.11, 0.28);
      case 'blue':
        return rgb(0.01, 0.46, 0.99);
      case 'emerald':
        return rgb(0.02, 0.59, 0.41);
      case 'amber':
        return rgb(0.92, 0.45, 0.05);
      case 'slate':
      default:
        return rgb(0.2, 0.25, 0.3);
    }
  };

  const handleApply = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pages = pdf.getPages();
      const rgbColor = getColorRgb(colorChoice);

      if (watermarkText.trim()) {
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        for (const page of pages) {
          const { width, height } = page.getSize();

          let x = (width - textWidth) / 2;
          let y = (height - textHeight) / 2;
          let rotateAngle = 0;

          if (position === 'diagonal-center') {
            rotateAngle = 45;
            // Approximate diagonal offset
            x = width / 2 - (textWidth / 2) * Math.cos(Math.PI / 4);
            y = height / 2 - (textWidth / 2) * Math.sin(Math.PI / 4);
          } else if (position === 'top-header') {
            x = (width - textWidth) / 2;
            y = height - 60;
          } else if (position === 'bottom-footer') {
            x = (width - textWidth) / 2;
            y = 50;
          } else {
            // horizontal center
            x = (width - textWidth) / 2;
            y = (height - textHeight) / 2;
          }

          page.drawText(watermarkText, {
            x: Math.max(20, x),
            y: Math.max(20, y),
            size: fontSize,
            font,
            color: rgbColor,
            opacity,
            rotate: degrees(rotateAngle),
          });
        }
      }

      let resultBytes = await pdf.save();

      // If page numbers checked, apply page numbers
      if (includePageNumbers) {
        const intermediateBlob = new Blob([resultBytes as any], { type: 'application/pdf' });
        const intermediateFile = new File([intermediateBlob], file.name, { type: 'application/pdf' });
        resultBytes = await addPageNumbers(intermediateFile);
      }

      downloadPdfBytes(resultBytes, `stamped_${file.name}`);
      setSuccessMsg('Watermark & Page Numbers successfully applied and downloaded!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to apply watermark to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
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
              <Stamp className="w-5 h-5 text-rose-600" />
              <span>Advanced Watermark & Page Numbering</span>
            </h2>
            <p className="text-xs text-slate-500">
              Customize security text, color schemes, font sizes, angles, and automated page numbers.
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
                    100% Client-Side Private • Instant multi-color watermarking
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
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                Ready to Stamp
              </span>
            </div>

            {/* Watermark Configuration */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-5">
              
              {/* Text & Quick Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Watermark Text:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT SHARE"
                    className="flex-1 p-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                  />
                  {['CONFIDENTIAL', 'SAMPLE', 'DRAFT', 'TOP SECRET'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWatermarkText(preset)}
                      className="hidden sm:inline-block px-3 py-2 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Scheme Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-rose-600" />
                  <span>Stamp Color:</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'rose', label: 'Crimson Red', bg: 'bg-rose-600 text-white' },
                    { id: 'blue', label: 'Sky Blue', bg: 'bg-blue-600 text-white' },
                    { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-600 text-white' },
                    { id: 'amber', label: 'Amber Orange', bg: 'bg-amber-600 text-white' },
                    { id: 'slate', label: 'Charcoal Slate', bg: 'bg-slate-700 text-white' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorChoice(c.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        colorChoice === c.id
                          ? `${c.bg} shadow-xs ring-2 ring-slate-900/10`
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position / Orientation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Stamp Position & Orientation:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'diagonal-center', label: '45° Diagonal' },
                    { id: 'horizontal-center', label: 'Center Horizontal' },
                    { id: 'top-header', label: 'Top Header' },
                    { id: 'bottom-footer', label: 'Bottom Footer' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPosition(p.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        position === p.id
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size & Opacity Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Font Size:</span>
                    <span className="font-mono text-rose-600">{fontSize} pt</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="72"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Transparency / Opacity:</span>
                    <span className="font-mono text-rose-600">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.08"
                    max="0.75"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Page Numbers Checkbox */}
              <div 
                className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer" 
                onClick={() => setIncludePageNumbers(!includePageNumbers)}
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Include Automated Page Numbering</p>
                  <p className="text-[11px] text-slate-500">Stamps clean bottom center page numbering (e.g. Page 1 of 5)</p>
                </div>
                <input
                  type="checkbox"
                  checked={includePageNumbers}
                  onChange={(e) => setIncludePageNumbers(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
              </div>

            </div>

            {/* Apply Action Button */}
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Applying Custom Watermark...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Stamped PDF</span>
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
