"use client";

interface ReputationGaugeProps {
  score: number | null;
  totalReviews: number | null;
  window: string | null;
}

export default function ReputationGauge({ score, totalReviews, window: timeWindow }: ReputationGaugeProps) {
  if (score === null || totalReviews === null) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-semibold text-slate-500">E-reputation</span>
        <span className="text-[10px] italic text-amber-600">
          Données insuffisantes
        </span>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 18;
  const progress = (score / 10) * circumference;
  const offset = circumference - progress;

  let strokeColor = "#059669"; // success-600
  if (score < 5) strokeColor = "#DC2626"; // danger-600
  else if (score < 7) strokeColor = "#D97706"; // warning-600

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-9 w-9 shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" stroke="#E2E8F0" strokeWidth="4" />
          <circle
            cx="22" cy="22" r="18" fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800">
          {score.toFixed(1)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-semibold text-slate-600">
          {totalReviews} avis
        </span>
        {timeWindow && (
          <span className="text-[10px] text-slate-400">{timeWindow}</span>
        )}
      </div>
    </div>
  );
}
