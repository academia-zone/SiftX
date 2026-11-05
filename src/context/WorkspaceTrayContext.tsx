import React, { createContext, useContext, useState, useEffect } from 'react';
import JSZip from 'jszip';

export interface WorkspaceFile {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'archive' | 'other';
  size: number;
  createdAt: number;
  sourceTool: string;
}

interface WorkspaceTrayContextType {
  files: WorkspaceFile[];
  addFile: (params: { name: string; blob: Blob; type?: WorkspaceFile['type']; sourceTool?: string }) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  downloadAllAsZip: () => Promise<void>;
  isTrayOpen: boolean;
  setIsTrayOpen: (open: boolean) => void;
  toggleTray: () => void;
}

const WorkspaceTrayContext = createContext<WorkspaceTrayContextType | undefined>(undefined);

function detectType(mimeOrExt: string): WorkspaceFile['type'] {
  const lower = mimeOrExt.toLowerCase();
  if (lower.includes('image') || /\.(png|jpe?g|webp|gif|svg)$/i.test(lower)) return 'image';
  if (lower.includes('video') || /\.(mp4|webm|mov|mkv)$/i.test(lower)) return 'video';
  if (lower.includes('audio') || /\.(mp3|wav|ogg|m4a)$/i.test(lower)) return 'audio';
  if (lower.includes('pdf') || /\.pdf$/i.test(lower)) return 'pdf';
  if (lower.includes('text') || lower.includes('json') || /\.(txt|json|md|csv)$/i.test(lower)) return 'text';
  if (lower.includes('zip') || lower.includes('archive') || /\.zip$/i.test(lower)) return 'archive';
  return 'other';
}

export function exportFileToWorkspace(blob: Blob, name: string, sourceTool = 'Studio Engine') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('siftx:file-exported', {
        detail: { blob, name, sourceTool },
      })
    );
  }
}

export const WorkspaceTrayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [isTrayOpen, setIsTrayOpen] = useState(false);

  // Auto-register files from global event
  useEffect(() => {
    const handleFileExported = (e: Event) => {
      const customEvent = e as CustomEvent<{ blob: Blob; name: string; sourceTool?: string }>;
      if (customEvent.detail?.blob && customEvent.detail?.name) {
        addFile({
          name: customEvent.detail.name,
          blob: customEvent.detail.blob,
          sourceTool: customEvent.detail.sourceTool || 'Studio Engine',
        });
      }
    };

    window.addEventListener('siftx:file-exported', handleFileExported);
    return () => window.removeEventListener('siftx:file-exported', handleFileExported);
  }, []);

  // Clean up Object URLs when unmounting or clearing
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        try {
          URL.revokeObjectURL(f.url);
        } catch {
          // Ignore
        }
      });
    };
  }, [files]);

  const addFile = ({
    name,
    blob,
    type,
    sourceTool = 'Tool Studio',
  }: {
    name: string;
    blob: Blob;
    type?: WorkspaceFile['type'];
    sourceTool?: string;
  }) => {
    const url = URL.createObjectURL(blob);
    const resolvedType = type || detectType(blob.type || name);
    const newFile: WorkspaceFile = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      blob,
      url,
      type: resolvedType,
      size: blob.size,
      createdAt: Date.now(),
      sourceTool,
    };

    setFiles((prev) => [newFile, ...prev.slice(0, 19)]); // keep up to 20 recent files
    setIsTrayOpen(true);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) {
        try {
          URL.revokeObjectURL(target.url);
        } catch {
          // Ignore
        }
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearFiles = () => {
    files.forEach((f) => {
      try {
        URL.revokeObjectURL(f.url);
      } catch {
        // Ignore
      }
    });
    setFiles([]);
  };

  const downloadAllAsZip = async () => {
    if (files.length === 0) return;
    const zip = new JSZip();
    const folder = zip.folder('siftx-workspace-exports');

    files.forEach((f) => {
      folder?.file(f.name, f.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = `siftx-exports-${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(zipUrl), 2000);
  };

  const toggleTray = () => setIsTrayOpen((prev) => !prev);

  return (
    <WorkspaceTrayContext.Provider
      value={{
        files,
        addFile,
        removeFile,
        clearFiles,
        downloadAllAsZip,
        isTrayOpen,
        setIsTrayOpen,
        toggleTray,
      }}
    >
      {children}
    </WorkspaceTrayContext.Provider>
  );
};

export const useWorkspaceTray = (): WorkspaceTrayContextType => {
  const context = useContext(WorkspaceTrayContext);
  if (!context) {
    throw new Error('useWorkspaceTray must be used within a WorkspaceTrayProvider');
  }
  return context;
};
