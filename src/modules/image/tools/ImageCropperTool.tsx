import React, { useState, useRef } from 'react';
import { 
  Crop, 
  Upload, 
  Download, 
  RefreshCw, 
  Square, 
  Tv, 
  Maximize 
} from 'lucide-react';
import { cropImage, downloadFile, loadImageFromFile } from '../engines/imageEngine';

type AspectOption = 'free' | '1:1' | '16:9' | '4:3' | '9:16';

export const ImageCropperTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [aspect, setAspect] = useState<AspectOption>('free');
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 300,
    height: 300,
  });
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    try {
      const img = await loadImageFromFile(selectedFile);
      setImgElement(img);
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      // Default crop: center 80%
      const cropW = Math.round(w * 0.8);
      const cropH = Math.round(h * 0.8);
      const initialBox = {
        x: Math.round((w - cropW) / 2),
        y: Math.round((h - cropH) / 2),
        width: cropW,
        height: cropH,
      };
      setCropBox(initialBox);
      runCrop(selectedFile, initialBox);
    } catch (err) {
      console.error('Image load failed:', err);
    }
  };

  const runCrop = async (
    targetFile: File,
    area: { x: number; y: number; width: number; height: number }
  ) => {
    setIsProcessing(true);
    try {
      const res = await cropImage(targetFile, area);
      setCroppedPreview(res.dataUrl);
      setCroppedBlob(res.blob);
    } catch (err) {
      console.error('Crop failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAspectChange = (newAspect: AspectOption) => {
    setAspect(newAspect);
    if (!imgElement || !file) return;
    const w = imgElement.naturalWidth || imgElement.width;
    const h = imgElement.naturalHeight || imgElement.height;

    let targetW = cropBox.width;
    let targetH = cropBox.height;

    if (newAspect === '1:1') {
      const minDim = Math.min(targetW, targetH);
      targetW = minDim;
      targetH = minDim;
    } else if (newAspect === '16:9') {
      targetH = Math.round(targetW * (9 / 16));
    } else if (newAspect === '4:3') {
      targetH = Math.round(targetW * (3 / 4));
    } else if (newAspect === '9:16') {
      targetW = Math.round(targetH * (9 / 16));
    }

    // Keep within bounds
    targetW = Math.min(targetW, w);
    targetH = Math.min(targetH, h);
    const newBox = {
      ...cropBox,
      width: targetW,
      height: targetH,
    };
    setCropBox(newBox);
    runCrop(file, newBox);
  };

  const handleManualCoordChange = (field: 'x' | 'y' | 'width' | 'height', val: number) => {
    if (!imgElement || !file) return;
    const maxW = imgElement.naturalWidth || imgElement.width;
    const maxH = imgElement.naturalHeight || imgElement.height;

    let safeVal = Math.max(0, val);
    if (field === 'width') safeVal = Math.min(safeVal, maxW - cropBox.x);
    if (field === 'height') safeVal = Math.min(safeVal, maxH - cropBox.y);
    if (field === 'x') safeVal = Math.min(safeVal, maxW - cropBox.width);
    if (field === 'y') safeVal = Math.min(safeVal, maxH - cropBox.height);

    const updated = { ...cropBox, [field]: safeVal };
    setCropBox(updated);
    runCrop(file, updated);
  };

  const handleDownload = () => {
    if (!croppedBlob || !file) return;
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadFile(croppedBlob, `${base}-cropped.png`);
  };

  const handleReset = () => {
    setFile(null);
    setImgElement(null);
    setCroppedPreview(null);
    setCroppedBlob(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200">
              <Crop className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Smart Cropper</h1>
                <span className="text-sm font-urdu font-medium text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  تصویر تراشیں (کروپ)
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Crop precisely with aspect ratio locking (1:1, 16:9, 4:3, 9:16) or custom pixel selection.
              </p>
            </div>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Upload New
            </button>
            <button
              onClick={handleDownload}
              disabled={!croppedBlob || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download Cropped PNG
            </button>
          </div>
        )}
      </div>

      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
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
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 shadow-inner">
            <Crop className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your image here to crop</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Supports exact pixel cropping, social ratios, and instant downloads.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition shadow-sm">
            <Upload className="w-4 h-4" />
            Select Image
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 text-base">Crop Ratios</h3>

            {/* Ratio Presets */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'free', label: 'Freeform', icon: Maximize },
                { id: '1:1', label: '1:1 Square', icon: Square },
                { id: '16:9', label: '16:9 Widescreen', icon: Tv },
                { id: '4:3', label: '4:3 Standard', icon: Tv },
                { id: '9:16', label: '9:16 Story/Reel', icon: Tv },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = aspect === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAspectChange(opt.id as AspectOption)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center gap-2 transition ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Coordinates Inputs */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Exact Pixel Crop</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Width (px)</label>
                  <input
                    type="number"
                    value={cropBox.width}
                    onChange={(e) => handleManualCoordChange('width', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Height (px)</label>
                  <input
                    type="number"
                    value={cropBox.height}
                    onChange={(e) => handleManualCoordChange('height', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">X Offset</label>
                  <input
                    type="number"
                    value={cropBox.x}
                    onChange={(e) => handleManualCoordChange('x', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Y Offset</label>
                  <input
                    type="number"
                    value={cropBox.y}
                    onChange={(e) => handleManualCoordChange('y', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cropped Preview Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col items-center justify-center min-h-[440px]">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                <span className="text-xs text-purple-700 font-medium">Cropping image...</span>
              </div>
            ) : croppedPreview ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <div className="max-h-[380px] w-auto max-w-full overflow-hidden rounded-xl border border-purple-200 bg-stripes p-2 flex items-center justify-center">
                  <img
                    src={croppedPreview}
                    alt="Cropped Preview"
                    className="max-h-[360px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                  <span>Crop Area: {cropBox.width} × {cropBox.height} px</span>
                  <span className="text-gray-300">|</span>
                  <span>Origin: ({cropBox.x}, {cropBox.y})</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
