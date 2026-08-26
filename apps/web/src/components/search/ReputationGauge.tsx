"use client";

interface ReputationGaugeProps {
  score: number | null;
  totalReviews: number | null;
  window: string | null;
}

export default function ReputationGauge({ score, totalReviews, window: timeWindow }: ReputationGaugeProps) {
  if (score === null || totalReviews === null) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-text-faint">E-reputation</span>
        <span className="text-xs italic text-semantic-warning">
          Donnees insuffisantes — moins de 30 avis exploitables
        </span>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 18;
  const progress = (score / 10) * circumference;
  const offset = circumference - progress;

  let color = "text-semantic-positive";
  if (score < 5) color = "text-semantic-negative";
  else if (score < 7) color = "text-semantic-warning";

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="4"
          />
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={color}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text">
          {score.toFixed(1)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-semibold text-text-muted">
          {totalReviews} avis
        </span>
        {timeWindow && (
          <span className="text-[10px] text-text-faint">{timeWindow}</span>
        )}
      </div>
    </div>
  );
}
