"use client";

export function SliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  color,
  unit = "",
  decimals = 0,
}: SliderControlProps) {
  const colorClasses = {
    blue: {
      text: "text-blue-400",
      bg: "bg-blue-500/10",
      accent: "accent-blue-500",
    },
    green: {
      text: "text-green-400",
      bg: "bg-green-500/10",
      accent: "accent-green-500",
    },
    purple: {
      text: "text-purple-400",
      bg: "bg-purple-500/10",
      accent: "accent-purple-500",
    },
  };

  const { text, bg, accent } = colorClasses[color];
  const displayValue = decimals > 0 ? value.toFixed(decimals) : value;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>
        <code className={`text-sm ${text} ${bg} px-2 py-1 rounded`}>
          {displayValue}
          {unit}
        </code>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) =>
          onChange(
            decimals > 0 ? parseFloat(e.target.value) : parseInt(e.target.value)
          )
        }
        className={`w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer ${accent}`}
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  color: "blue" | "green" | "purple";
  unit?: string;
  decimals?: number;
}
