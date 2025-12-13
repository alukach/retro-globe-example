// components/DotMatrixCanvas.tsx
"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  size?: number;
  cellSize?: number;
  maxDotRadius?: number;
};

export function DotMatrixCanvas({
  src,
  size = 600,
  cellSize = 6,
  maxDotRadius = 2.6,
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

          // Invert so bright = big dots
          const radius = lum * maxDotRadius;

          if (radius > 0.2) {
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };
  }, [src, size, cellSize, maxDotRadius]);

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
