"use client";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total} aria-label={`Etape ${current} sur ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
            i < current
              ? "bg-corporate"
              : i === current
                ? "bg-corporate/40"
                : "bg-surface-overlay"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-text-faint">
        {current}/{total}
      </span>
    </div>
  );
}
