import React, { useState, useRef } from 'react';
import { 
  FileType, 
  Upload, 
  Download, 
  RefreshCw, 
  Archive
} from 'lucide-react';
import JSZip from 'jszip';
import { loadImageFromFile, downloadFile } from '../engines/imageEngine';

interface ConvertedItem {
  name: string;
  blob: Blob;
  dataUrl: string;
  size: number;
}

export const ImageConverterTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(90);
  const [convertedItems, setConvertedItems] = useState<ConvertedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFilesSelect = (fileList: FileList | File[]) => {
    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].type.startsWith('image/')) {
        validFiles.push(fileList[i]);
      }
    }
    if (validFiles.length === 0) return;
    setFiles(validFiles);
    runBatchConvert(validFiles, targetFormat, quality);
  };

  const runBatchConvert = async (
    targetFiles: File[],
    fmt: 'png' | 'jpeg' | 'webp',
    q: number
  ) => {
    setIsProcessing(true);
    const mimeType = fmt === 'png' ? 'image/png' : fmt === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const qualityDecimal = q / 100;
    const items: ConvertedItem[] = [];

    try {
      for (const f of targetFiles) {
        const img = await loadImageFromFile(f);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d')!;

        if (fmt === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        await new Promise<void>((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const baseName = f.name.substring(0, f.name.lastIndexOf('.')) || f.name;
                const newName = `${baseName}.${fmt === 'jpeg' ? 'jpg' : fmt}`;
                items.push({
                  name: newName,
                  blob,
                  dataUrl: canvas.toDataURL(mimeType, qualityDecimal),
                  size: blob.size,
                });
              }
              resolve();
            },
            mimeType,
            qualityDecimal
          );
        });
      }
      setConvertedItems(items);
    } catch (err) {
      console.error('Batch convert error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormatChange = (newFmt: 'png' | 'jpeg' | 'webp') => {
    setTargetFormat(newFmt);
    if (files.length > 0) {
      runBatchConvert(files, newFmt, quality);
    }
  };

  const handleDownloadSingle = (item: ConvertedItem) => {
    downloadFile(item.blob, item.name);
  };

  const handleDownloadAllZip = async () => {
    if (convertedItems.length === 0) return;
    if (convertedItems.length === 1) {
      handleDownloadSingle(convertedItems[0]);
      return;
    }

    const zip = new JSZip();
    convertedItems.forEach((item) => {
      zip.file(item.name, item.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile(content, `converted-images-${targetFormat}.zip`);
  };

  const handleReset = () => {
    setFiles([]);
    setConvertedItems([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200">
              <FileType className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Format Converter</h1>
                <span className="text-sm font-urdu font-medium text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  فارمیٹ کنورٹر
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Batch convert images between PNG, JPG, and WebP format. Fast, private, and client-side.
              </p>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Upload New
            </button>
            <button
              onClick={handleDownloadAllZip}
              disabled={convertedItems.length === 0 || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
            >
              {convertedItems.length > 1 ? (
                <>
                  <Archive className="w-4 h-4" />
                  Download All ({convertedItems.length}) ZIP
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Converted
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {files.length === 0 ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) {
              handleFilesSelect(e.dataTransfer.files);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-white border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
            isDragging ? 'border-purple-500 bg-purple-50/50 scale-[0.99]' : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFilesSelect(e.target.files);
              }
            }}
          />
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 shadow-inner">
            <FileType className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop images to convert formats</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Select one or multiple photos to convert instantly to PNG, JPG, or high-compression WebP.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition shadow-sm">
            <Upload className="w-4 h-4" />
            Select Files
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 text-base">Target Format</h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'png', label: 'PNG', sub: 'Lossless' },
                { id: 'jpeg', label: 'JPG', sub: 'Standard' },
                { id: 'webp', label: 'WebP', sub: 'Modern Web' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => handleFormatChange(fmt.id as any)}
                  className={`p-3 text-center rounded-xl border transition ${
                    targetFormat === fmt.id
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-bold text-sm">{fmt.label}</div>
                  <div className={`text-[10px] ${targetFormat === fmt.id ? 'text-purple-200' : 'text-gray-400'}`}>
                    {fmt.sub}
                  </div>
                </button>
              ))}
            </div>

            {targetFormat !== 'png' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                  <span>Compression Quality:</span>
                  <span className="text-purple-600 font-bold">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={quality}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setQuality(val);
                    if (files.length > 0) runBatchConvert(files, targetFormat, val);
                  }}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            )}

            <div className="text-xs text-gray-500 bg-purple-50 p-3 rounded-xl border border-purple-100">
              Total files selected: <strong>{files.length}</strong>
            </div>
          </div>

          {/* List of converted files */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-900 text-base flex items-center justify-between">
              <span>Converted Files</span>
              {isProcessing && (
                <span className="text-xs text-purple-600 flex items-center gap-1.5 font-normal">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...
                </span>
              )}
            </h3>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {convertedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-purple-200 bg-gray-50/50 hover:bg-white transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.dataUrl}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200 bg-white"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-400">{formatFileSize(item.size)}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadSingle(item)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg border border-purple-200 transition"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
