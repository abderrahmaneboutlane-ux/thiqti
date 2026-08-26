"use client";

import { useState } from "react";

interface ReputationGaugeInlineProps {
  score: number | null;
  totalReviews: number;
  reliability: "elevee" | "moyenne" | "faible" | null;
  windowMonths: number;
}

export default function ReputationGaugeInline({
  score,
  totalReviews,
  reliability,
  windowMonths,
}: ReputationGaugeInlineProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const circumference = 2 * Math.PI * 16;
  const progress = score !== null ? (score / 10) * circumference : 0;
  const offset = circumference - progress;

  let strokeColor = "#cbd5e1";
  let textColor = "text-slate-400";
  if (score !== null) {
    if (score >= 7) { strokeColor = "#22c55e"; textColor = "text-emerald-600"; }
    else if (score >= 5) { strokeColor = "#10b981"; textColor = "text-corporate"; }
    else { strokeColor = "#ef4444"; textColor = "text-red-500"; }
  }

  const reliabilityLabel =
    reliability === "elevee" ? "Elevee" :
    reliability === "moyenne" ? "Moyenne" :
    reliability === "faible" ? "Faible" : null;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative h-10 w-10 shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3" />
          {score !== null && (
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          )}
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${textColor}`}>
          {score !== null ? score.toFixed(1) : "-"}
        </span>
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
          {score !== null ? (
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Score</span>
                <span className={`font-bold ${textColor}`}>{score.toFixed(1)}/10</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Avis</span>
                <span className="font-semibold text-slate-900">{totalReviews}</span>
              </div>
              {reliabilityLabel && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Fiabilite</span>
                  <span className="font-semibold text-slate-900">{reliabilityLabel}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Fenetre</span>
                <span className="font-semibold text-slate-900">{windowMonths} mois</span>
              </div>
            </div>
          ) : (
            <p className="text-xs italic text-slate-500">
              Donnees insuffisantes
            </p>
          )}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white" />
        </div>
      )}
    </div>
  );
}
