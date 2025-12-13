// components/DitheredCanvas.tsx
"use client";

import { useCanvasRenderer } from "./useCanvasRenderer";

type Props = {
  src: string;
  size?: number;
  cellSize?: number;
  threshold?: number;
  contrast?: number;
  brightness?: number;
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
  contrast = 1.0,
  brightness = 0,
}: Props) {
  const canvasRef = useCanvasRenderer({
    src,
    size,
    cellSize,
    contrast,
    brightness,
    processPixel: (x, y, lum, ctx, scaledCellSize) => {
      const cellX = Math.floor(x / scaledCellSize) % 4;
      const cellY = Math.floor(y / scaledCellSize) % 4;
      const bayerThreshold = (BAYER_MATRIX[cellY][cellX] / 16) * threshold;

      if (lum > bayerThreshold) {
        ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
      }
    },
    dependencies: [threshold],
  });

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
