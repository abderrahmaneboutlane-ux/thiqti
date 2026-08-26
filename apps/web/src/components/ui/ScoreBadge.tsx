"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { BadgeCheck, CheckCircle2, AlertTriangle } from "lucide-react";

export interface ScoreExplanation {
  label: string;
  value: string;
  impact: "positive" | "negative" | "neutral";
  reason: string;
}

interface ScoreBadgeProps {
  percent: number;
  explanations?: ScoreExplanation[];
  className?: string;
}

function getScoreColor(percent: number): string {
  if (percent >= 80) return "bg-emerald-600";
  if (percent >= 60) return "bg-brand-600";
  if (percent >= 40) return "bg-amber-500";
  return "bg-slate-400";
}

function getScoreLabel(percent: number): string {
  if (percent >= 80) return "Très compatible";
  if (percent >= 60) return "Compatible";
  if (percent >= 40) return "Partiellement compatible";
  return "Peu compatible";
}

export default function ScoreBadge({ percent, explanations, className = "" }: ScoreBadgeProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const show = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), 120);
  }, []);
  const hide = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setOpen(false);
  }, []);

  const positives = explanations?.filter((e) => e.impact === "positive") || [];
  const negatives = explanations?.filter((e) => e.impact === "negative") || [];

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        type="button"
        aria-label={`${percent}% compatible. Afficher les critères`}
        aria-expanded={open}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className={`inline-flex cursor-help items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${getScoreColor(percent)}`}
      >
        <BadgeCheck className="h-3 w-3" />
        {percent}% compatible
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full right-0 z-40 mb-2 w-72 rounded-xl border border-slate-100 bg-white p-3 text-left shadow-elev-3 animate-scale-in"
        >
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {getScoreLabel(percent)}
          </span>
          {(positives.length > 0 || negatives.length > 0) && (
            <ul className="space-y-1">
              {positives.map((e, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>{e.reason}</span>
                </li>
              ))}
              {negatives.map((e, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-amber-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span>{e.reason}</span>
                </li>
              ))}
            </ul>
          )}
          {positives.length === 0 && negatives.length === 0 && (
            <p className="text-xs text-slate-500">
              {percent}% de compatibilité calculé par l&apos;algorithme TOPSIS multi-critères.
            </p>
          )}
          <span className="pointer-events-none absolute top-full right-4 -mt-1.5 h-3 w-3 rotate-45 border-b border-r border-slate-100 bg-white" />
        </span>
      )}
    </span>
  );
}
