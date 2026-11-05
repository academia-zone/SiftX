import React, { useEffect, useRef, useState } from 'react';

interface FramesPlayerProps {
  totalFrames?: number;
  framePrefix?: string;
  frameExtension?: string;
  fps?: number;
  className?: string;
}

export const FramesBackground: React.FC<FramesPlayerProps> = ({
  totalFrames = 80,
  framePrefix = 'frame_',
  frameExtension = 'png',
  fps = 7,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);

  useEffect(() => {
    let isCancelled = false;
    const loadedImages: HTMLImageElement[] = [];
    let count = 0;

    const formatIndex = (index: number) => {
      return String(index).padStart(3, '0');
    };

    // Preload all 80 PNG frames: /frames/frame_001.png to /frames/frame_080.png
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const path = `/frames/${framePrefix}${formatIndex(i)}.${frameExtension}`;
      img.src = path;
      img.onload = () => {
        count++;
        if (!isCancelled) {
          setLoadedCount(count);
        }
      };
      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;

    return () => {
      isCancelled = true;
    };
  }, [totalFrames, framePrefix, frameExtension]);

  // Animation Loop (Plays seamlessly like video at 25 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    const interval = 1000 / fps;

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);

      const delta = time - lastTime;
      if (delta >= interval) {
        lastTime = time - (delta % interval);

        const images = imagesRef.current;
        if (images.length === 0) return;

        const img = images[currentFrameRef.current];
        if (img && img.complete && img.naturalWidth > 0) {
          // Adjust canvas internal dimensions to display size
          if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Object-fit: cover drawing
          const cWidth = canvas.width;
          const cHeight = canvas.height;
          const iWidth = img.naturalWidth;
          const iHeight = img.naturalHeight;

          const ratio = Math.max(cWidth / iWidth, cHeight / iHeight);
          const drawWidth = iWidth * ratio;
          const drawHeight = iHeight * ratio;
          const drawX = (cWidth - drawWidth) / 2;
          const drawY = (cHeight - drawHeight) / 2;

          ctx.clearRect(0, 0, cWidth, cHeight);
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        }

        // Advance to next frame (loop 0 -> 79 -> 0)
        currentFrameRef.current = (currentFrameRef.current + 1) % images.length;
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [fps]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover block"
      />
      {loadedCount < 5 && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 text-xs font-mono text-[#01bbfd]">
          Loading frames ({loadedCount}/{totalFrames})...
        </div>
      )}
    </div>
  );
};
