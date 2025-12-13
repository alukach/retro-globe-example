import { useEffect, useRef } from "react";

type ProcessPixelFn = (
  x: number,
  y: number,
  lum: number,
  ctx: CanvasRenderingContext2D,
  cellSize: number
) => void;

interface UseCanvasRendererProps {
  src: string;
  size: number;
  cellSize: number;
  processPixel: ProcessPixelFn;
  dependencies: React.DependencyList;
  contrast?: number; // 1.0 = normal, <1 = less contrast, >1 = more contrast
  brightness?: number; // 0 = normal, negative = darker, positive = brighter
}

export function useCanvasRenderer({
  src,
  size,
  cellSize,
  processPixel,
  dependencies,
  contrast = 1.0,
  brightness = 0,
}: UseCanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // Use device pixel ratio for high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const displaySize = size;
    const renderSize = size * dpr;

    canvas.width = renderSize;
    canvas.height = renderSize;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;

    const isVideo = src.match(/\.(mp4|webm|ogg)$/i);

    const processFrame = (sourceElement: HTMLImageElement | HTMLVideoElement) => {
      if (!sourceCanvasRef.current) {
        sourceCanvasRef.current = document.createElement("canvas");
      }
      const sourceCanvas = sourceCanvasRef.current;
      const sourceCtx = sourceCanvas.getContext("2d")!;

      sourceCanvas.width = renderSize;
      sourceCanvas.height = renderSize;

      // Calculate dimensions for center-crop (cover mode)
      const sourceWidth =
        sourceElement instanceof HTMLVideoElement
          ? sourceElement.videoWidth
          : sourceElement.naturalWidth;
      const sourceHeight =
        sourceElement instanceof HTMLVideoElement
          ? sourceElement.videoHeight
          : sourceElement.naturalHeight;

      const sourceAspect = sourceWidth / sourceHeight;
      const canvasAspect = 1; // Square canvas

      let drawWidth, drawHeight, offsetX, offsetY;

      if (sourceAspect > canvasAspect) {
        drawHeight = renderSize;
        drawWidth = renderSize * sourceAspect;
        offsetX = -(drawWidth - renderSize) / 2;
        offsetY = 0;
      } else {
        drawWidth = renderSize;
        drawHeight = renderSize / sourceAspect;
        offsetX = 0;
        offsetY = -(drawHeight - renderSize) / 2;
      }

      sourceCtx.drawImage(sourceElement, offsetX, offsetY, drawWidth, drawHeight);
      const imageData = sourceCtx.getImageData(0, 0, renderSize, renderSize).data;

      ctx.clearRect(0, 0, renderSize, renderSize);
      ctx.fillStyle = "#fff";

      // Scale cellSize for high-DPI rendering
      const scaledCellSize = cellSize * dpr;

      for (let y = 0; y < renderSize; y += scaledCellSize) {
        for (let x = 0; x < renderSize; x += scaledCellSize) {
          const i = (y * renderSize + x) * 4;
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];

          // Calculate luminance
          let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          // Apply contrast and brightness adjustments
          // Contrast: pivot around 0.5
          lum = (lum - 0.5) * contrast + 0.5;
          // Brightness: shift the entire range
          lum = lum + brightness;
          // Clamp to valid range
          lum = Math.max(0, Math.min(1, lum));

          processPixel(x, y, lum, ctx, scaledCellSize);
        }
      }
    };

    if (isVideo) {
      const video = document.createElement("video");
      video.src = src;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;

      const renderLoop = () => {
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          processFrame(video);
        }
        animationFrameRef.current = requestAnimationFrame(renderLoop);
      };

      video.addEventListener("loadeddata", () => {
        video.play();
        renderLoop();
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        video.pause();
        video.src = "";
      };
    } else {
      const img = document.createElement("img");
      img.src = src;
      img.crossOrigin = "anonymous";
      img.style.display = "none";
      document.body.appendChild(img);

      const renderLoop = () => {
        if (img.complete && img.naturalWidth > 0) {
          processFrame(img);
        }
        animationFrameRef.current = requestAnimationFrame(renderLoop);
      };

      img.onload = () => {
        renderLoop();
      };

      if (img.complete) {
        renderLoop();
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        document.body.removeChild(img);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, size, cellSize, contrast, brightness, ...dependencies]);

  return canvasRef;
}
