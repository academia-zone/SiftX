import React, { useRef, useState } from 'react';
import { UploadCloud, FileAudio, X, AlertCircle } from 'lucide-react';
import { useAudioTheme } from './AudioThemeContext';

interface AudioUploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  maxSizeBytes?: number;
  acceptFormats?: string[];
  className?: string;
}

export const AudioUploadZone: React.FC<AudioUploadZoneProps> = ({
  onFileSelect,
  selectedFile,
  onClear,
  maxSizeBytes = 40 * 1024 * 1024, // 40MB
  acceptFormats = ['.mp3', '.wav', '.ogg', '.m4a'],
  className = '',
}) => {
  const { theme } = useAudioTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndPass = (file: File) => {
    setError(null);
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds limit (${Math.round(maxSizeBytes / (1024 * 1024))}MB).`);
      return;
    }
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptFormats.includes(ext) && !file.type.startsWith('audio/')) {
      setError(`Unsupported format. Please upload ${acceptFormats.join(', ')}.`);
      return;
    }
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptFormats.join(',')}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            validateAndPass(e.target.files[0]);
          }
        }}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
            isDragging
              ? 'border-[#01bbfd] bg-[#01bbfd]/10 ring-4 ring-[#01bbfd]/20 scale-101'
              : theme === 'dark'
              ? 'border-slate-700 bg-slate-900/60 hover:border-[#0176fd] hover:bg-slate-900'
              : 'border-slate-300 bg-slate-50 hover:border-[#0176fd] hover:bg-sky-50/50'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#01bbfd]/20 to-[#0176fd]/20 text-[#0176fd] flex items-center justify-center shadow-inner">
            <UploadCloud className="w-6 h-6 text-[#0176fd]" />
          </div>

          <div>
            <h4 className="text-sm font-bold tracking-tight">
              Drag & Drop your audio file here, or <span className="text-[#0176fd] underline">Browse</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Supports: {acceptFormats.join(', ')} (Max {Math.round(maxSizeBytes / (1024 * 1024))}MB)
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-700 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-3 truncate">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-[#0176fd] flex items-center justify-center shrink-0">
              <FileAudio className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h5 className="text-xs sm:text-sm font-bold truncate">{selectedFile.name}</h5>
              <p className="text-[11px] text-slate-400 font-mono">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onClear}
              aria-label="Remove uploaded file"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-rose-500 text-xs font-medium px-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
