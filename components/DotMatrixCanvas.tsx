// components/DotMatrixCanvas.tsx
"use client";

import { useCanvasRenderer } from "./useCanvasRenderer";

type Props = {
  src: string;
  size?: number;
  cellSize?: number;
  maxDotRadius?: number;
  contrast?: number;
  brightness?: number;
};

export function DotMatrixCanvas({
  src,
  size = 600,
  cellSize = 6,
  maxDotRadius = 2.6,
  contrast = 1.0,
  brightness = 0,
}: Props) {
  const canvasRef = useCanvasRenderer({
    src,
    size,
    cellSize,
    contrast,
    brightness,
    processPixel: (x, y, lum, ctx, cellSize) => {
      const radius = lum * maxDotRadius;
      if (radius > 0.2) {
        ctx.beginPath();
        ctx.arc(x + cellSize / 2, y + cellSize / 2, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    dependencies: [maxDotRadius],
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
