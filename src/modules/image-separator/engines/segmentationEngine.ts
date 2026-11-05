import type { DetectedElement } from '../types/imageSeparatorTypes';

/**
 * Robust Asset Extractor & Auto-Transparency Cutter.
 * Cuts an element from coordinates, applies edge-aware flood-fill transparency
 * so the icon becomes an isolated transparent PNG without damaging the source image.
 */
export function extractElementFromCanvas(
  sourceCanvas: HTMLCanvasElement,
  box: { x: number; y: number; width: number; height: number },
  options: { makeTransparent?: boolean; tolerance?: number; label?: string } = {}
): DetectedElement {
  const { x, y, width, height } = box;
  const makeTransparent = options.makeTransparent ?? true;
  const tolerance = options.tolerance ?? 25;

  const cutCanvas = document.createElement('canvas');
  cutCanvas.width = width;
  cutCanvas.height = height;
  const cutCtx = cutCanvas.getContext('2d');
  if (!cutCtx) {
    throw new Error('Canvas 2D context not available');
  }

  // Draw exact region from source
  cutCtx.drawImage(sourceCanvas, x, y, width, height, 0, 0, width, height);

  if (makeTransparent) {
    const imgData = cutCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Sample boundary color from the 4 corners of the cut box
    const cornerIndices = [
      0,
      (width - 1) * 4,
      ((height - 1) * width) * 4,
      ((height - 1) * width + width - 1) * 4
    ];

    let bgR = 0, bgG = 0, bgB = 0;
    for (const c of cornerIndices) {
      bgR += data[c];
      bgG += data[c + 1];
      bgB += data[c + 2];
    }
    bgR = Math.round(bgR / 4);
    bgG = Math.round(bgG / 4);
    bgB = Math.round(bgB / 4);

    // Flood-fill transparency from borders to preserve inner icon colors
    const visited = new Uint8Array(width * height);
    const queue: number[] = [];

    // Push border pixels that match background color
    for (let bx = 0; bx < width; bx++) {
      queue.push(bx); // top row
      queue.push((height - 1) * width + bx); // bottom row
    }
    for (let by = 0; by < height; by++) {
      queue.push(by * width); // left col
      queue.push(by * width + (width - 1)); // right col
    }

    while (queue.length > 0) {
      const idx = queue.pop()!;
      if (visited[idx] === 1) continue;
      visited[idx] = 1;

      const p = idx * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];

      const diff = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
      if (diff <= tolerance) {
        data[p + 3] = 0; // Transparent

        const cx = idx % width;
        const cy = Math.floor(idx / width);

        // Add 4-way neighbors
        if (cx + 1 < width && visited[idx + 1] === 0) queue.push(idx + 1);
        if (cx - 1 >= 0 && visited[idx - 1] === 0) queue.push(idx - 1);
        if (cy + 1 < height && visited[idx + width] === 0) queue.push(idx + width);
        if (cy - 1 >= 0 && visited[idx - width] === 0) queue.push(idx - width);
      }
    }

    cutCtx.putImageData(imgData, 0, 0);
  }

  // Determine element category
  const aspect = width / height;
  let category: DetectedElement['category'] = 'icon';
  if (aspect > 2.2) category = 'text';
  else if (width < 200 && height < 200) category = 'icon';
  else category = 'object';

  const defaultName = options.label || (category === 'text' ? 'Text Layer' : 'Icon Layer');

  return {
    id: `elem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: defaultName,
    x,
    y,
    width,
    height,
    dataUrl: cutCanvas.toDataURL('image/png'),
    visible: true,
    opacity: 1,
    category,
  };
}

/**
 * Erase / inpaint a rectangular region on a canvas by blending border pixels
 */
export function inpaintRegionOnCanvas(
  canvas: HTMLCanvasElement,
  box: { x: number; y: number; width: number; height: number }
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { x, y, width, height } = box;
  const pad = 6;
  const sampleX = Math.max(0, x - pad);
  const sampleY = Math.max(0, y - pad);
  const sampleW = Math.min(canvas.width - sampleX, width + pad * 2);
  const sampleH = Math.min(canvas.height - sampleY, height + pad * 2);

  // Simple gradient blend from surrounding borders
  const sampleData = ctx.getImageData(sampleX, sampleY, sampleW, sampleH);
  const d = sampleData.data;

  // Average border colors
  let topR = 0, topG = 0, topB = 0, count = 0;
  for (let sx = 0; sx < sampleW; sx++) {
    const idx = sx * 4;
    topR += d[idx]; topG += d[idx + 1]; topB += d[idx + 2];
    count++;
  }
  const avgR = Math.round(topR / count);
  const avgG = Math.round(topG / count);
  const avgB = Math.round(topB / count);

  ctx.fillStyle = `rgb(${avgR}, ${avgG}, ${avgB})`;
  ctx.fillRect(x, y, width, height);
}
