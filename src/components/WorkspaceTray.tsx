import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderArchive, 
  X, 
  Download, 
  Share2, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  FileText, 
  Music, 
  Video, 
  Image as ImageIcon, 
  FileCode, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useWorkspaceTray, type WorkspaceFile } from '../context/WorkspaceTrayContext';

interface WorkspaceTrayProps {
  onNavigateToTool?: (toolId: string) => void;
}

const TYPE_ICONS: Record<WorkspaceFile['type'], React.FC<{ className?: string }>> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  pdf: FileText,
  text: FileCode,
  archive: FolderArchive,
  other: FileText,
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const WorkspaceTray: React.FC<WorkspaceTrayProps> = ({ onNavigateToTool }) => {
  const { files, removeFile, clearFiles, downloadAllAsZip, isTrayOpen, setIsTrayOpen, toggleTray } = useWorkspaceTray();
  const [downloadingZip, setDownloadingZip] = useState(false);

  if (files.length === 0) return null;

  const handleDownload = (file: WorkspaceFile) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async (file: WorkspaceFile) => {
    if (navigator.share) {
      try {
        const fileObj = new File([file.blob], file.name, { type: file.blob.type });
        await navigator.share({
          files: [fileObj],
          title: file.name,
          text: `Processed with SiftX Workplace`,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      handleDownload(file);
    }
  };

  const handleZipDownload = async () => {
    setDownloadingZip(true);
    try {
      await downloadAllAsZip();
    } finally {
      setDownloadingZip(false);
    }
  };

  const getSuggestedPipeline = (file: WorkspaceFile) => {
    switch (file.type) {
      case 'audio':
        return [
          { label: 'Speech to Text', toolId: 'speech-to-text', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
          { label: 'Voice Changer', toolId: 'voice-changer', color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100' }
        ];
      case 'video':
        return [
          { label: 'Subtitles Generator', toolId: 'subtitle-generator', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
          { label: 'Extract MP3', toolId: 'video-to-mp3', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
          { label: 'Compress Video', toolId: 'video-compressor', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' }
        ];
      case 'image':
        return [
          { label: 'AI BG Remover', toolId: 'background-remover', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
          { label: 'Compress Image', toolId: 'image-compressor', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
          { label: 'Image to PDF', toolId: 'jpg-to-pdf', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' }
        ];
      case 'pdf':
        return [
          { label: 'Compress PDF', toolId: 'pdf-compressor', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
          { label: 'PDF to Word', toolId: 'pdf-to-word', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
          { label: 'Merge with Other PDFs', toolId: 'pdf-merger', color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-none">
      
      {/* EXPANDABLE RECENT FILES DRAWER */}
      <AnimatePresence>
        {isTrayOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[92vw] sm:w-[440px] max-h-[75vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto mb-3"
          >
            {/* Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#01bbfd] to-[#0176fd] text-white flex items-center justify-center shadow-sm">
                  <FolderArchive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Recent Files & Pipeline</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#01bbfd]/20 text-[#0176fd] dark:text-[#01bbfd] text-[10px] font-mono font-bold">
                      {files.length}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Cross-tool workspace • 100% Client-side
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearFiles}
                  title="Clear all"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsTrayOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Files List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/50">
              {files.map((file) => {
                const IconComponent = TYPE_ICONS[file.type] || FileText;
                const pipelines = getSuggestedPipeline(file);

                return (
                  <div key={file.id} className="pt-2.5 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[#0176fd] dark:text-[#01bbfd]">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {formatBytes(file.size)} • {file.sourceTool}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleShare(file)}
                          title="Share"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0176fd] hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          title="Download"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0176fd] hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeFile(file.id)}
                          title="Remove"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 1-Click Pipeline Suggestions */}
                    {pipelines.length > 0 && onNavigateToTool && (
                      <div className="flex flex-wrap items-center gap-1.5 pl-11">
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-[#01bbfd]" /> Pass to:
                        </span>
                        {pipelines.map((pipe) => (
                          <button
                            key={pipe.toolId}
                            onClick={() => {
                              onNavigateToTool(pipe.toolId);
                              setIsTrayOpen(false);
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${pipe.color}`}
                          >
                            <span>{pipe.label}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Bulk Action Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {files.length} {files.length === 1 ? 'file' : 'files'} ready
              </span>
              <button
                onClick={handleZipDownload}
                disabled={downloadingZip}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#01bbfd] to-[#0176fd] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>{downloadingZip ? 'Packaging ZIP...' : 'Download All as ZIP'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING QUICK DOCK PILL BUTTON */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTray}
        className="pointer-events-auto px-4 py-3 rounded-full bg-[#020f22] text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-white/20 dark:border-slate-700 flex items-center gap-3 transition-all cursor-pointer group"
      >
        <div className="relative">
          <FolderArchive className="w-5 h-5 text-[#01bbfd]" />
          <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-[#01bbfd] text-slate-950 font-mono font-black text-[10px] flex items-center justify-center animate-pulse">
            {files.length}
          </span>
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-extrabold leading-none">Workspace Tray</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono leading-none mt-1">
            1-Click Cross Pipeline
          </p>
        </div>
        {isTrayOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white" />
        )}
      </motion.button>

    </div>
  );
};
