"use client";

import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { computeMarketStats, formatPriceDH } from "@/lib/market";

interface FallbackCar {
  make: string;
  model: string;
  price: number;
  km: number;
  year: number;
  title: string;
}

interface PriceTimelineProps {
  make: string;
  model: string;
  price: number;
  year?: number;
}

/**
 * PriceTimeline — Situe le prix de l'annonce sur la distribution
 * des prix du même modèle sur le marché marocain.
 * Ex : "cette annonce est 8% en dessous du prix moyen".
 * Données : agrégat des annonces disponibles via /api/search.
 */
export default function PriceTimeline({ make, model, price }: PriceTimelineProps) {
  const [stats, setStats] = useState<ReturnType<typeof computeMarketStats>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/search")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        const cars: FallbackCar[] = data.results || [];
        setStats(computeMarketStats(cars, make, model));
        requestAnimationFrame(() => setMounted(true));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [make, model]);

  if (!stats || stats.count < 2) return null;

  const range = Math.max(stats.maxPrice - stats.minPrice, 1);
  const pos = Math.min(100, Math.max(0, ((price - stats.minPrice) / range) * 100));
  const deltaPct = ((price - stats.avgPrice) / stats.avgPrice) * 100;
  const below = deltaPct < -1.5;
  const above = deltaPct > 1.5;

  const verdict = below
    ? { icon: TrendingDown, text: `${Math.abs(deltaPct).toFixed(0)}% en dessous du prix moyen`, cls: "text-emerald-600" }
    : above
      ? { icon: TrendingUp, text: `${deltaPct.toFixed(0)}% au-dessus du prix moyen`, cls: "text-amber-600" }
      : { icon: Minus, text: "Dans la fourchette du prix moyen", cls: "text-slate-600" };

  return (
    <div className="card p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Positionnement marché</h3>
        <span className="text-[10px] font-medium text-slate-400">{stats.count} annonces comparées</span>
      </div>
      <p className="mb-5 text-xs text-slate-500">
        {make} {model} sur le marché marocain
      </p>

      <div className={`mb-1.5 flex items-center gap-1.5 text-sm font-semibold ${verdict.cls}`}>
        <verdict.icon className="h-4 w-4" />
        {verdict.text}
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Annonce à <strong className="text-slate-900">{formatPriceDH(price)}</strong> · moyenne{" "}
        {formatPriceDH(stats.avgPrice)}
      </p>

      {/* Piste de distribution min → max */}
      <div className="relative h-9">
        <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-200 via-amber-100 to-rose-200 shadow-[inset_0_1px_2px_rgba(15,23,42,0.12)]">
          <div
            className="h-full rounded-full bg-white/25 transition-all duration-1000 ease-out"
            style={{ width: `${mounted ? pos : 0}%` }}
          />
        </div>

        {/* Repère moyenne */}
        <div
          className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${((stats.avgPrice - stats.minPrice) / range) * 100}%` }}
        >
          <div className="h-5 w-0.5 rounded-full bg-slate-500/70" />
        </div>

        {/* Curseur de l'annonce */}
        <div
          className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{ left: `${mounted ? pos : 0}%` }}
        >
          <div
            className="score-relief flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-corporate"
            title={`${formatPriceDH(price)}`}
          >
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-400">
        <span>Min {formatPriceDH(stats.minPrice)}</span>
        <span>Max {formatPriceDH(stats.maxPrice)}</span>
      </div>
    </div>
  );
}
