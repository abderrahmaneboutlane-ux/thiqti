"use client";

interface GaugeProps {
  value: number | null;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}

function getColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio >= 0.8) return "text-green-400";
  if (ratio >= 0.6) return "text-yellow-400";
  if (ratio >= 0.4) return "text-orange-400";
  return "text-red-400";
}

function getStrokeColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio >= 0.8) return "#4ade80";
  if (ratio >= 0.6) return "#facc15";
  if (ratio >= 0.4) return "#fb923c";
  return "#f87171";
}

const sizes = {
  sm: { width: 64, strokeWidth: 6, fontSize: "text-sm", labelSize: "text-[9px]" },
  md: { width: 96, strokeWidth: 8, fontSize: "text-xl", labelSize: "text-[10px]" },
  lg: { width: 128, strokeWidth: 10, fontSize: "text-3xl", labelSize: "text-xs" },
};

export default function Gauge({
  value,
  max = 10,
  label,
  showValue = true,
  size = "md",
}: GaugeProps) {
  const { width, strokeWidth, fontSize, labelSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = value !== null ? (value / max) * circumference : 0;
  const color =
    value !== null ? getStrokeColor(value, max) : "#6b7280";
  const textColor =
    value !== null ? getColor(value, max) : "text-gray-500";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width, height: width }}>
        <svg
          width={width}
          height={width}
          className="-rotate-90"
        >
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-white/5"
          />
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {value !== null ? (
              <>
                <span className={`font-bold ${fontSize} ${textColor}`}>
                  {value.toFixed(1)}
                </span>
                <span className={`${labelSize} text-gray-500`}>/ {max}</span>
              </>
            ) : (
              <span className={`font-medium ${fontSize} text-gray-500`}>N/A</span>
            )}
          </div>
        )}
      </div>
      {label && (
        <span className={`${labelSize} font-medium text-gray-400`}>{label}</span>
      )}
    </div>
  );
}
