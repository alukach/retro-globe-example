// components/DitheredCanvas.tsx
"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  size?: number;
  cellSize?: number;
  threshold?: number;
};

// 4x4 Bayer matrix for ordered dithering
const BAYER_MATRIX = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function DitheredCanvas({
  src,
  size = 600,
  cellSize = 6,
  threshold = 0.5,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.src = src;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;

      // Draw image scaled
      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size).data;

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      ctx.fillStyle = "#fff";

      for (let y = 0; y < size; y += cellSize) {
        for (let x = 0; x < size; x += cellSize) {
          const i = (y * size + x) * 4;

          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];

          // Luminance
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          // Apply Bayer matrix threshold
          const cellX = Math.floor(x / cellSize) % 4;
          const cellY = Math.floor(y / cellSize) % 4;
          const bayerThreshold = (BAYER_MATRIX[cellY][cellX] / 16) * threshold;

          // Draw white square if luminance exceeds threshold
          if (lum > bayerThreshold) {
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
      }
    };
  }, [src, size, cellSize, threshold]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={size} height={size} className="block" />

      {/* Scanlines overlay */}
      <div
        className="
          pointer-events-none
          absolute inset-0
          bg-[repeating-linear-gradient(
            to_bottom,
            rgba(255,255,255,0.06)_0px,
            rgba(255,255,255,0.06)_1px,
            transparent_2px,
            transparent_4px
          )]
          animate-scanlines
        "
      />
    </div>
  );
}
