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
  dependencies: any[];
}

export function useCanvasRenderer({
  src,
  size,
  cellSize,
  processPixel,
  dependencies,
}: UseCanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.width = size;
    canvas.height = size;

    const isVideo = src.match(/\.(mp4|webm|ogg)$/i);

    const processFrame = (sourceElement: HTMLImageElement | HTMLVideoElement) => {
      if (!sourceCanvasRef.current) {
        sourceCanvasRef.current = document.createElement("canvas");
      }
      const sourceCanvas = sourceCanvasRef.current;
      const sourceCtx = sourceCanvas.getContext("2d")!;

      sourceCanvas.width = size;
      sourceCanvas.height = size;

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
        drawHeight = size;
        drawWidth = size * sourceAspect;
        offsetX = -(drawWidth - size) / 2;
        offsetY = 0;
      } else {
        drawWidth = size;
        drawHeight = size / sourceAspect;
        offsetX = 0;
        offsetY = -(drawHeight - size) / 2;
      }

      sourceCtx.drawImage(sourceElement, offsetX, offsetY, drawWidth, drawHeight);
      const imageData = sourceCtx.getImageData(0, 0, size, size).data;

      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "#fff";

      for (let y = 0; y < size; y += cellSize) {
        for (let x = 0; x < size; x += cellSize) {
          const i = (y * size + x) * 4;
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];

          // Calculate luminance
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          processPixel(x, y, lum, ctx, cellSize);
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
  }, [src, size, cellSize, ...dependencies]);

  return canvasRef;
}
