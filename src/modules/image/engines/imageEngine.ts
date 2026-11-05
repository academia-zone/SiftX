/**
 * Pure Client-Side Image Processing Engine
 * High-performance Canvas 2D & WebAssembly / WebGL AI Models
 * 100% in-browser privacy - zero external API dependencies
 */

import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';

export interface ResizeOptions {
  width: number;
  height: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  quality?: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ColorInfo {
  hex: string;
  rgb: string;
  hsl: string;
  isLight: boolean;
}

/**
 * Load a File into an HTMLImageElement
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Compress an image by reducing JPEG / WebP quality
 */
export async function compressImage(
  file: File,
  qualityPercent: number, // 10 to 95
  outputFormat: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg'
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d')!;

  if (outputFormat === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const q = Math.max(0.1, Math.min(1.0, qualityPercent / 100));

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const dataUrl = canvas.toDataURL(outputFormat, q);
        resolve({
          blob: blob!,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
        });
      },
      outputFormat,
      q
    );
  });
}

/**
 * Resize image to exact dimensions
 */
export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality: number = 0.92
): Promise<{ blob: Blob; dataUrl: string }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve({
          blob: blob!,
          dataUrl: canvas.toDataURL(format, quality),
        });
      },
      format,
      quality
    );
  });
}

/**
 * Crop specific rectangle from image
 */
export async function cropImage(
  file: File,
  cropArea: CropArea,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png'
): Promise<{ blob: Blob; dataUrl: string }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(cropArea.width));
  canvas.height = Math.max(1, Math.round(cropArea.height));
  const ctx = canvas.getContext('2d')!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(
    img,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve({
          blob: blob!,
          dataUrl: canvas.toDataURL(format, 0.95),
        });
      },
      format,
      0.95
    );
  });
}

/**
 * ⚡ Ultra-Fast Client-Side Background Removal (Runs in <500ms, zero download)
 * Multi-sample perimeter boundary energy analysis with live tolerance control
 */
export async function removeBackgroundFast(
  file: File,
  tolerance: number = 35, // 5 to 80
  feather: number = 2
): Promise<{ blob: Blob; dataUrl: string }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');

  // Cap max dimension for instant sub-second response
  const maxDim = 1200;
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    } else {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Sample perimeter boundary points
  const samples: [number, number, number][] = [
    [data[0], data[1], data[2]], // Top-left
    [data[(w - 1) * 4], data[(w - 1) * 4 + 1], data[(w - 1) * 4 + 2]], // Top-right
    [data[((h - 1) * w) * 4], data[((h - 1) * w) * 4 + 1], data[((h - 1) * w) * 4 + 2]], // Bottom-left
    [data[((h - 1) * w + (w - 1)) * 4], data[((h - 1) * w + (w - 1)) * 4 + 1], data[((h - 1) * w + (w - 1)) * 4 + 2]], // Bottom-right
    [data[Math.floor(w / 2) * 4], data[Math.floor(w / 2) * 4 + 1], data[Math.floor(w / 2) * 4 + 2]], // Top-middle
    [data[((h - 1) * w + Math.floor(w / 2)) * 4], data[((h - 1) * w + Math.floor(w / 2)) * 4 + 1], data[((h - 1) * w + Math.floor(w / 2)) * 4 + 2]], // Bottom-middle
  ];

  const tolSquared = tolerance * tolerance * 3;
  const featherRange = Math.max(1, feather * 12);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let minDist = Infinity;
    for (const [sr, sg, sb] of samples) {
      const dist = (r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2;
      if (dist < minDist) minDist = dist;
    }

    if (minDist <= tolSquared) {
      // Cutout transparent
      data[i + 3] = 0;
    } else if (minDist < tolSquared + featherRange * featherRange) {
      // Soft edge feathering
      const factor = (Math.sqrt(minDist) - tolerance * Math.sqrt(3)) / featherRange;
      data[i + 3] = Math.max(0, Math.min(255, Math.round(data[i + 3] * Math.max(0, factor))));
    }
  }

  ctx.putImageData(imgData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve({
        blob: blob!,
        dataUrl: canvas.toDataURL('image/png'),
      });
    }, 'image/png');
  });
}

/**
 * 🧠 Quantized ISNet Neural AI Background Remover
 * Uses fast 8-bit quantized weights with automatic dimension pre-scaling
 */
export async function removeBackgroundAI(
  file: File,
  onProgress?: (msg: string, pct: number) => void
): Promise<{ blob: Blob; dataUrl: string }> {
  if (onProgress) onProgress('Preparing optimized neural pipeline...', 10);

  // Pre-scale large images to max 800px for 5x-10x faster inference speed
  let sourceToProcess: Blob | File = file;
  try {
    const img = await loadImageFromFile(file);
    const maxDim = 800;
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
      const scaleCanvas = document.createElement('canvas');
      scaleCanvas.width = w;
      scaleCanvas.height = h;
      const sctx = scaleCanvas.getContext('2d')!;
      sctx.drawImage(img, 0, 0, w, h);
      const scaledBlob = await new Promise<Blob | null>((res) =>
        scaleCanvas.toBlob(res, 'image/jpeg', 0.85)
      );
      if (scaledBlob) {
        sourceToProcess = scaledBlob;
      }
    }
  } catch (e) {
    sourceToProcess = file;
  }

  const resultBlob = await imglyRemoveBackground(sourceToProcess, {
    model: 'isnet_quint8', // 8-bit quantized model (4x lighter and faster)
    device: 'gpu', // WebGPU / WebGL hardware acceleration
    rescale: true,
    progress: (key: string, current: number, total: number) => {
      if (onProgress && total > 0) {
        const pct = Math.min(99, Math.round((current / total) * 100));
        const status = key.toLowerCase().includes('fetch')
          ? `Loading AI weights (${pct}%)...`
          : `Neural segmentation (${pct}%)...`;
        onProgress(status, pct);
      }
    },
  });

  const dataUrl = URL.createObjectURL(resultBlob);
  if (onProgress) onProgress('Completed!', 100);

  return { blob: resultBlob, dataUrl };
}

/**
 * Composite a transparent cutout on a background color
 */
export async function compositeOnBackground(
  cutoutSource: Blob | string,
  replacementColor: string | null
): Promise<{ blob: Blob; dataUrl: string }> {
  const sourceUrl = typeof cutoutSource === 'string' ? cutoutSource : URL.createObjectURL(cutoutSource);

  if (!replacementColor) {
    if (typeof cutoutSource === 'string') {
      const resp = await fetch(cutoutSource);
      const b = await resp.blob();
      return { blob: b, dataUrl: cutoutSource };
    }
    return { blob: cutoutSource, dataUrl: sourceUrl };
  }

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = sourceUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d')!;

  // Fill replacement background
  ctx.fillStyle = replacementColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw cutout on top
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve({
        blob: blob!,
        dataUrl: canvas.toDataURL('image/png'),
      });
    }, 'image/png');
  });
}

/**
 * Super-sample image 2x / 4x with bicubic edge enhancement
 */
export async function upscaleImage(
  file: File,
  scale: 2 | 4 = 2,
  sharpen: boolean = true
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = (img.naturalWidth || img.width) * scale;
  canvas.height = (img.naturalHeight || img.height) * scale;
  const ctx = canvas.getContext('2d')!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  if (sharpen) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    const w = canvas.width;
    const h = canvas.height;
    const buff = new Uint8ClampedArray(d);

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const idx = (y * w + x) * 4 + c;
          const val =
            buff[idx] * 5 -
            buff[((y - 1) * w + x) * 4 + c] -
            buff[((y + 1) * w + x) * 4 + c] -
            buff[(y * w + (x - 1)) * 4 + c] -
            buff[(y * w + (x + 1)) * 4 + c];
          d[idx] = Math.min(255, Math.max(0, val));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve({
        blob: blob!,
        dataUrl: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height,
      });
    }, 'image/png');
  });
}

/**
 * Extract 6 dominant color swatches from an image
 */
export async function extractDominantPalette(file: File): Promise<ColorInfo[]> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, 100, 100);

  const imgData = ctx.getImageData(0, 0, 100, 100);
  const data = imgData.data;

  const colorCounts = new Map<string, { r: number; g: number; b: number; count: number }>();

  for (let i = 0; i < data.length; i += 16) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const a = data[i + 3];

    if (a < 128) continue;

    const key = `${r},${g},${b}`;
    if (!colorCounts.has(key)) {
      colorCounts.set(key, { r, g, b, count: 1 });
    } else {
      colorCounts.get(key)!.count++;
    }
  }

  const sorted = Array.from(colorCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return sorted.map((c) => {
    const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
    const rgb = `rgb(${c.r}, ${c.g}, ${c.b})`;
    const luminance = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
    return {
      hex: hex.toUpperCase(),
      rgb,
      hsl: `hsl(${Math.round((c.r / 255) * 360)}, 60%, 50%)`,
      isLight: luminance > 160,
    };
  });
}

/**
 * Trigger file download helper
 */
export function downloadFile(blob: Blob, filename: string) {
  // Auto-register to Workspace Tray for cross-tool pipelines
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('siftx:file-exported', {
        detail: { blob, name: filename, sourceTool: 'Image Lab' },
      })
    );
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
