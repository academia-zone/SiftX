import React, { useState, useRef, useEffect } from 'react';
import { 
  Stamp, 
  Upload, 
  Download, 
  RefreshCw, 
  Type, 
  Image as ImageIcon
} from 'lucide-react';
import { loadImageFromFile, downloadFile } from '../engines/imageEngine';

type WatermarkType = 'text' | 'image';
type Position = 'center' | 'bottom-right' | 'top-right' | 'tile';

export const ImageWatermarkTool: React.FC = () => {
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');

  // Text watermark options
  const [text, setText] = useState<string>('© SiftX Studio');
  const [fontSize, setFontSize] = useState<number>(36);
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [opacity, setOpacity] = useState<number>(70);
  const [angle, setAngle] = useState<number>(-20);
  const [position, setPosition] = useState<Position>('tile');

  // Image watermark options
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [logoScale, setLogoScale] = useState<number>(30); // percentage of base width

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleBaseSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setBaseFile(selectedFile);
    try {
      const img = await loadImageFromFile(selectedFile);
      setBaseImg(img);
    } catch (err) {
      console.error('Base image failed:', err);
    }
  };

  const handleLogoSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setLogoFile(selectedFile);
    try {
      const img = await loadImageFromFile(selectedFile);
      setLogoImg(img);
    } catch (err) {
      console.error('Logo image failed:', err);
    }
  };

  const renderWatermark = async () => {
    if (!baseImg) return;
    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = baseImg.naturalWidth || baseImg.width;
      canvas.height = baseImg.naturalHeight || baseImg.height;
      const ctx = canvas.getContext('2d')!;

      // Draw original image
      ctx.drawImage(baseImg, 0, 0);

      ctx.save();
      ctx.globalAlpha = opacity / 100;

      if (watermarkType === 'text') {
        ctx.fillStyle = textColor;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (position === 'tile') {
          // Diagonal tile
          const stepX = fontSize * 7;
          const stepY = fontSize * 4;
          for (let y = 0; y < canvas.height + stepY; y += stepY) {
            for (let x = 0; x < canvas.width + stepX; x += stepX) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate((angle * Math.PI) / 180);
              ctx.fillText(text, 0, 0);
              ctx.restore();
            }
          }
        } else if (position === 'center') {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((angle * Math.PI) / 180);
          ctx.fillText(text, 0, 0);
        } else if (position === 'bottom-right') {
          ctx.textAlign = 'right';
          ctx.fillText(text, canvas.width - 40, canvas.height - 40);
        } else if (position === 'top-right') {
          ctx.textAlign = 'right';
          ctx.fillText(text, canvas.width - 40, 60);
        }
      } else if (watermarkType === 'image' && logoImg) {
        const targetW = (canvas.width * logoScale) / 100;
        const targetH = (logoImg.height / logoImg.width) * targetW;

        if (position === 'center') {
          ctx.drawImage(
            logoImg,
            (canvas.width - targetW) / 2,
            (canvas.height - targetH) / 2,
            targetW,
            targetH
          );
        } else if (position === 'bottom-right') {
          ctx.drawImage(
            logoImg,
            canvas.width - targetW - 30,
            canvas.height - targetH - 30,
            targetW,
            targetH
          );
        } else if (position === 'top-right') {
          ctx.drawImage(logoImg, canvas.width - targetW - 30, 30, targetW, targetH);
        } else if (position === 'tile') {
          const stepX = targetW * 1.5;
          const stepY = targetH * 1.5;
          for (let y = 0; y < canvas.height + stepY; y += stepY) {
            for (let x = 0; x < canvas.width + stepX; x += stepX) {
              ctx.drawImage(logoImg, x, y, targetW, targetH);
            }
          }
        }
      }

      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          setProcessedBlob(blob);
          setPreviewUrl(canvas.toDataURL('image/png'));
        }
        setIsProcessing(false);
      }, 'image/png');
    } catch (err) {
      console.error('Watermark render failed:', err);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (baseImg) {
      renderWatermark();
    }
  }, [baseImg, watermarkType, text, fontSize, textColor, opacity, angle, position, logoImg, logoScale]);

  const handleDownload = () => {
    if (!processedBlob || !baseFile) return;
    const base = baseFile.name.substring(0, baseFile.name.lastIndexOf('.')) || baseFile.name;
    downloadFile(processedBlob, `${base}-watermarked.png`);
  };

  const handleReset = () => {
    setBaseFile(null);
    setBaseImg(null);
    setLogoFile(null);
    setLogoImg(null);
    setPreviewUrl(null);
    setProcessedBlob(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200">
              <Stamp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Watermark & Stamp</h1>
                <span className="text-sm font-urdu font-medium text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  واٹر مارک اور اسٹیمپ
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Protect photos and copyright with diagonal repeating text tiles, brand logos, or transparent signatures.
              </p>
            </div>
          </div>
        </div>

        {baseFile && (
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
              disabled={!processedBlob || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download Watermarked PNG
            </button>
          </div>
        )}
      </div>

      {!baseFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleBaseSelect(e.dataTransfer.files[0]);
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
                handleBaseSelect(e.target.files[0]);
              }
            }}
          />
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 shadow-inner">
            <Stamp className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop base image here to watermark</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Supports text stamps, copyright notices, and custom transparent PNG logos.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition shadow-sm">
            <Upload className="w-4 h-4" />
            Select Image
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-5">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setWatermarkType('text')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition ${
                  watermarkType === 'text'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                Text Stamp
              </button>
              <button
                onClick={() => setWatermarkType('image')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition ${
                  watermarkType === 'image'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Logo / Image
              </button>
            </div>

            {watermarkType === 'text' ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Watermark Text</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600">Font Size ({fontSize}px)</label>
                    <input
                      type="range"
                      min="16"
                      max="120"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600">Color</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-8 rounded-lg cursor-pointer border border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Rotation Angle</span>
                    <span>{angle}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleLogoSelect(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full py-3 px-4 border-2 border-dashed border-purple-200 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50/50 hover:bg-purple-50 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {logoFile ? `Loaded: ${logoFile.name}` : 'Upload Logo / Signature (PNG)'}
                </button>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Logo Scale</span>
                    <span>{logoScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={logoScale}
                    onChange={(e) => setLogoScale(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
            )}

            {/* Opacity */}
            <div className="space-y-1 pt-2 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Opacity</span>
                <span>{opacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Position */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Placement</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'tile', label: 'Diagonal Tile' },
                  { id: 'center', label: 'Center' },
                  { id: 'bottom-right', label: 'Bottom Right' },
                  { id: 'top-right', label: 'Top Right' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setPosition(pos.id as Position)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition ${
                      position === pos.id
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col items-center justify-center min-h-[440px]">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                <span className="text-xs text-purple-700 font-medium">Rendering watermark...</span>
              </div>
            ) : previewUrl ? (
              <div className="max-h-[380px] w-auto max-w-full overflow-hidden rounded-xl border border-purple-200 p-2 bg-gray-50 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Watermarked"
                  className="max-h-[360px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
