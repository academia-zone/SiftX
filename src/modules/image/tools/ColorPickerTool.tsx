import React, { useState, useRef, useEffect } from 'react';
import { 
  Pipette, 
  Upload, 
  Copy, 
  Check, 
  RefreshCw, 
  Palette, 
  Code
} from 'lucide-react';
import { extractDominantPalette, type ColorInfo, loadImageFromFile } from '../engines/imageEngine';

export const ColorPickerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [palette, setPalette] = useState<ColorInfo[]>([]);
  const [hoverColor, setHoverColor] = useState<ColorInfo>({
    hex: '#7C3AED',
    rgb: 'rgb(124, 58, 237)',
    hsl: 'hsl(262, 83%, 58%)',
    isLight: false,
  });
  const [selectedColor, setSelectedColor] = useState<ColorInfo>({
    hex: '#7C3AED',
    rgb: 'rgb(124, 58, 237)',
    hsl: 'hsl(262, 83%, 58%)',
    isLight: false,
  });
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    try {
      const img = await loadImageFromFile(selectedFile);
      setImgElement(img);

      // Extract dominant palette
      const colors = await extractDominantPalette(selectedFile);
      setPalette(colors);
      if (colors.length > 0) {
        setSelectedColor(colors[0]);
        setHoverColor(colors[0]);
      }
    } catch (err) {
      console.error('Palette error:', err);
    }
  };

  // Draw image on canvas when imgElement changes
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Fit within bounding box while preserving aspect
    const maxW = 500;
    const maxH = 400;
    const ratio = Math.min(maxW / imgElement.width, maxH / imgElement.height, 1);
    canvas.width = imgElement.width * ratio;
    canvas.height = imgElement.height * ratio;

    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
  }, [imgElement]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`.toUpperCase();
      const rgb = `rgb(${r}, ${g}, ${b})`;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      setHoverColor({
        hex,
        rgb,
        hsl: `hsl(${Math.round((r / 255) * 360)}, 60%, 50%)`,
        isLight: lum > 160,
      });
    } catch (err) {
      // ignore out of bounds
    }
  };

  const handleCanvasClick = () => {
    setSelectedColor(hoverColor);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleExportCss = () => {
    const cssVars = `:root {\n` +
      palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n') +
      `\n}`;
    copyToClipboard(cssVars);
  };

  const handleReset = () => {
    setFile(null);
    setImgElement(null);
    setPalette([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200">
              <Pipette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Color Palette & Eyedropper</h1>
                <span className="text-sm font-urdu font-medium text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  رنگ منتخب کریں اور پیلیٹ
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Hover eyedropper loupe for pixel-exact hex/rgb discovery and 6-color dominant palette generator.
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
              onClick={handleExportCss}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
            >
              <Code className="w-4 h-4" />
              Copy CSS Variables
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
            <Palette className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop image to inspect colors & palette</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Extract brand color schemes, sample exact photo tones, and export HEX/RGB codes.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition shadow-sm">
            <Upload className="w-4 h-4" />
            Select Image
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Eyedropper & Palette Details */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Pipette className="w-4 h-4 text-purple-600" />
              Eyedropper Selection
            </h3>

            {/* Current Active Swatch */}
            <div className="space-y-3">
              <div
                className="w-full h-24 rounded-2xl shadow-inner border border-gray-200 flex items-center justify-center transition-colors"
                style={{ backgroundColor: selectedColor.hex }}
              >
                <span
                  className="font-mono font-bold text-sm px-3 py-1 rounded-lg backdrop-blur-md shadow-sm"
                  style={{
                    color: selectedColor.isLight ? '#111827' : '#ffffff',
                    backgroundColor: selectedColor.isLight ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                  }}
                >
                  {selectedColor.hex}
                </span>
              </div>

              {/* Codes */}
              <div className="space-y-2">
                {[
                  { label: 'HEX', val: selectedColor.hex },
                  { label: 'RGB', val: selectedColor.rgb },
                  { label: 'HSL', val: selectedColor.hsl },
                ].map((item) => (
                  <div
                    key={item.label}
                    onClick={() => copyToClipboard(item.val)}
                    className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-purple-50 rounded-xl border border-gray-200 hover:border-purple-300 cursor-pointer transition group"
                  >
                    <span className="text-xs font-bold text-gray-400 group-hover:text-purple-600">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-800">{item.val}</span>
                      {copiedText === item.val ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Palette Swatches */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Dominant Palette (6 Swatches)
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {palette.map((swatch, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedColor(swatch)}
                    className="p-1.5 rounded-xl border border-gray-200 hover:border-purple-500 hover:shadow-md cursor-pointer transition text-center group bg-white"
                  >
                    <div
                      className="w-full h-12 rounded-lg mb-1 border border-black/5"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div className="font-mono text-[10px] font-semibold text-gray-700 group-hover:text-purple-700 truncate">
                      {swatch.hex}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Canvas Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center justify-between w-full text-xs text-gray-500">
              <span>Hover cursor over image to inspect pixel color</span>
              <span className="flex items-center gap-1.5 font-mono font-bold text-purple-700">
                <span
                  className="w-3 h-3 rounded-full inline-block border border-gray-300"
                  style={{ backgroundColor: hoverColor.hex }}
                />
                {hoverColor.hex}
              </span>
            </div>

            <div className="rounded-2xl border-2 border-purple-100 p-2 bg-gray-50 flex items-center justify-center max-w-full overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                onMouseMove={handleCanvasMouseMove}
                onClick={handleCanvasClick}
                className="cursor-crosshair max-w-full max-h-[420px] rounded-lg shadow-sm"
              />
            </div>

            <p className="text-xs text-gray-400 text-center">
              Click anywhere on the image to lock that color into your selection card.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
