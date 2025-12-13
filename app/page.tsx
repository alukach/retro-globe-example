"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DotMatrixCanvas } from "@/components/DotMatrixCanvas";
import { DitheredCanvas } from "@/components/DitheredCanvas";
import { SliderControl } from "@/components/SliderControl";

type RenderMode = "dots" | "dithered";

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState(
    searchParams.get("src") || "/earth.png"
  );
  const [size, setSize] = useState(
    parseInt(searchParams.get("size") || "300")
  );
  const [cellSize, setCellSize] = useState(
    parseInt(searchParams.get("cellSize") || "4")
  );
  const [maxDotRadius, setMaxDotRadius] = useState(
    parseFloat(searchParams.get("maxDotRadius") || "2.8")
  );
  const [threshold, setThreshold] = useState(
    parseFloat(searchParams.get("threshold") || "0.5")
  );
  const [contrast, setContrast] = useState(
    parseFloat(searchParams.get("contrast") || "1.0")
  );
  const [brightness, setBrightness] = useState(
    parseFloat(searchParams.get("brightness") || "0")
  );
  const [renderMode, setRenderMode] = useState<RenderMode>(
    (searchParams.get("mode") as RenderMode) || "dots"
  );

  // Update URL when params change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("src", imageSrc);
    params.set("size", size.toString());
    params.set("cellSize", cellSize.toString());
    params.set("maxDotRadius", maxDotRadius.toString());
    params.set("threshold", threshold.toString());
    params.set("contrast", contrast.toString());
    params.set("brightness", brightness.toString());
    params.set("mode", renderMode);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [imageSrc, size, cellSize, maxDotRadius, threshold, contrast, brightness, renderMode, router]);

  const copyCurrentLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const loadPreset = (preset: {
    src: string;
    size: number;
    cellSize: number;
    maxDotRadius: number;
    threshold: number;
    contrast: number;
    brightness: number;
    mode: RenderMode;
  }) => {
    setImageSrc(preset.src);
    setSize(preset.size);
    setCellSize(preset.cellSize);
    setMaxDotRadius(preset.maxDotRadius);
    setThreshold(preset.threshold);
    setContrast(preset.contrast);
    setBrightness(preset.brightness);
    setRenderMode(preset.mode);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="tracking-widest text-4xl font-bold text-white">
            DOT MATRIX CANVAS
          </h1>
          <p className="text-sm text-slate-400">
            Real halftone · Canvas · Next.js
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          {renderMode === "dots" ? (
            <DotMatrixCanvas
              src={imageSrc}
              size={size}
              cellSize={cellSize}
              maxDotRadius={maxDotRadius}
              contrast={contrast}
              brightness={brightness}
            />
          ) : (
            <DitheredCanvas
              src={imageSrc}
              size={size}
              cellSize={cellSize}
              threshold={threshold}
              contrast={contrast}
              brightness={brightness}
            />
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">Controls</h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Render Mode
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setRenderMode("dots")}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    renderMode === "dots"
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  Variable Dots
                </button>
                <button
                  onClick={() => setRenderMode("dithered")}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    renderMode === "dithered"
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  Dithered Pixels
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="imageSrc"
                className="block text-sm font-medium text-slate-300"
              >
                Image Source
              </label>
              <input
                type="text"
                id="imageSrc"
                name="imageSrc"
                value={imageSrc}
                onChange={(e) => setImageSrc(e.target.value)}
                placeholder="/earth.png or https://..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400">
                Enter a local path (e.g., /earth.png) or external URL
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SliderControl
                  label="Canvas Size"
                  value={size}
                  onChange={setSize}
                  min={100}
                  max={800}
                  step={10}
                  color="blue"
                  unit="px"
                />

                <SliderControl
                  label="Cell Size"
                  value={cellSize}
                  onChange={setCellSize}
                  min={1}
                  max={20}
                  step={1}
                  color="green"
                />

                {renderMode === "dots" ? (
                  <SliderControl
                    label="Max Dot Radius"
                    value={maxDotRadius}
                    onChange={setMaxDotRadius}
                    min={0.5}
                    max={10}
                    step={0.1}
                    color="purple"
                    decimals={1}
                  />
                ) : (
                  <SliderControl
                    label="Dither Threshold"
                    value={threshold}
                    onChange={setThreshold}
                    min={0.1}
                    max={1.5}
                    step={0.05}
                    color="purple"
                    decimals={2}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SliderControl
                  label="Contrast"
                  value={contrast}
                  onChange={setContrast}
                  min={0.1}
                  max={3}
                  step={0.1}
                  color="blue"
                  decimals={1}
                />

                <SliderControl
                  label="Brightness"
                  value={brightness}
                  onChange={setBrightness}
                  min={-0.5}
                  max={0.5}
                  step={0.05}
                  color="green"
                  decimals={2}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setImageSrc("/earth.png");
                    setSize(300);
                    setCellSize(4);
                    setMaxDotRadius(2.8);
                    setThreshold(0.5);
                    setContrast(1.0);
                    setBrightness(0);
                    setRenderMode("dots");
                  }}
                  className="flex-1 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={copyCurrentLink}
                  className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-300 text-sm font-medium transition-colors"
                >
                  Copy Link
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      loadPreset({
                        src: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Rotating_earth_animated_transparent.gif",
                        size: 400,
                        cellSize: 6,
                        maxDotRadius: 3,
                        threshold: 0.5,
                        contrast: 1.0,
                        brightness: 0,
                        mode: "dots",
                      })
                    }
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 text-xs font-medium transition-colors text-left"
                  >
                    Rotating Earth (Dots)
                  </button>
                  <button
                    onClick={() =>
                      loadPreset({
                        src: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Rotating_earth_animated_transparent.gif",
                        size: 400,
                        cellSize: 4,
                        maxDotRadius: 2.8,
                        threshold: 0.7,
                        contrast: 0.6,
                        brightness: -0.1,
                        mode: "dithered",
                      })
                    }
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 text-xs font-medium transition-colors text-left"
                  >
                    Rotating Earth (Low Contrast)
                  </button>
                  <button
                    onClick={() =>
                      loadPreset({
                        src: "/earth.png",
                        size: 300,
                        cellSize: 2,
                        maxDotRadius: 1.5,
                        threshold: 0.5,
                        contrast: 1.0,
                        brightness: 0,
                        mode: "dots",
                      })
                    }
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 text-xs font-medium transition-colors text-left"
                  >
                    Fine Detail
                  </button>
                  <button
                    onClick={() =>
                      loadPreset({
                        src: "/earth.png",
                        size: 500,
                        cellSize: 12,
                        maxDotRadius: 6,
                        threshold: 0.4,
                        contrast: 1.8,
                        brightness: 0.1,
                        mode: "dithered",
                      })
                    }
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 text-xs font-medium transition-colors text-left"
                  >
                    High Contrast
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
