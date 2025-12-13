"use client";
import { useState } from "react";
import { DotMatrixCanvas } from "@/components/DotMatrixCanvas";
import { DitheredCanvas } from "@/components/DitheredCanvas";
import { SliderControl } from "@/components/SliderControl";

type RenderMode = "dots" | "dithered";

export default function Page() {
  const [imageSrc, setImageSrc] = useState("/earth.png");
  const [size, setSize] = useState(300);
  const [cellSize, setCellSize] = useState(4);
  const [maxDotRadius, setMaxDotRadius] = useState(2.8);
  const [threshold, setThreshold] = useState(0.5);
  const [renderMode, setRenderMode] = useState<RenderMode>("dots");

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
            />
          ) : (
            <DitheredCanvas
              src={imageSrc}
              size={size}
              cellSize={cellSize}
              threshold={threshold}
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

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setImageSrc("/earth.png");
                  setSize(300);
                  setCellSize(4);
                  setMaxDotRadius(2.8);
                  setThreshold(0.5);
                }}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
