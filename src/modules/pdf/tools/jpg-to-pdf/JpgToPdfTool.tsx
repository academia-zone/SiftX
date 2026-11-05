import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Loader2
} from 'lucide-react';
import { imagesToPdf, downloadPdfBytes } from '../../engines/pdfEngine';

export const JpgToPdfTool: React.FC = () => {
  const [images, setImages] = useState<{ file: File; previewUrl: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = (files: FileList | File[]) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const selected = Array.from(files).filter(
      (f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(f.name)
    );

    if (selected.length === 0) {
      setErrorMsg('Please select valid JPG or PNG images.');
      return;
    }

    const newItems = selected.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newItems]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addImages(e.target.files);
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
      addImages(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const filesToConvert = images.map((img) => img.file);
      const pdfBytes = await imagesToPdf(filesToConvert);
      downloadPdfBytes(pdfBytes, `converted_images_${Date.now()}.pdf`);
      setSuccessMsg(`Successfully created A4 PDF from ${images.length} images!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to convert images to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
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
              <FileSpreadsheet className="w-5 h-5 text-rose-600" />
              <span>Convert Images to PDF (JPG / PNG to PDF)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Combine photos, document scans, and receipts into a clean, unified A4 PDF document.
            </p>
          </div>

          {images.length > 0 && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Upload Zone */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            onChange={handleImageChange}
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
                  Click to choose images or drop photos here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports JPG, PNG, and camera receipts • Auto-fits into standard A4 sheets
                </p>
              </div>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs group-hover:bg-rose-700 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Select Image Files
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

        {/* Image Grid Preview */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Selected Images ({images.length} pages)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((item, idx) => (
                <div
                  key={`${item.file.name}-${idx}`}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-3/4 flex flex-col justify-between p-2 shadow-2xs"
                >
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <span className="relative z-10 w-6 h-6 rounded-lg bg-black/70 text-white text-[10px] font-black flex items-center justify-center backdrop-blur-xs">
                    {idx + 1}
                  </span>
                  <div className="relative z-10 flex items-center justify-between bg-black/60 backdrop-blur-xs p-1.5 rounded-xl">
                    <span className="text-[10px] font-medium text-white truncate max-w-[80px]">
                      {item.file.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      className="p-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Convert Action */}
            <div className="pt-3">
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating A4 PDF Document...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Convert {images.length} Images to Single PDF</span>
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
