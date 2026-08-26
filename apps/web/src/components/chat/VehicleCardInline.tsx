"use client";

import { ShieldCheck, MapPin, GitCompare } from "lucide-react";
import CarImage from "@/components/CarImage";

interface VehicleCardInlineProps {
  vehicle: {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    price: number;
    priceFormatted: string;
    km: number;
    fuel: string;
    city: string;
    image: string;
    score: number;
    source: string;
    url?: string;
    photos?: string[];
    bodyType?: string;
    contact?: { name?: string; phone?: string; phoneHref?: string; whatsappHref?: string };
    reputation?: { verified?: boolean; trustBadge?: boolean; views?: number };
  };
  onSelect?: (id: string) => void;
  onCompare?: (id: string) => void;
  isCompareSelected?: boolean;
}

export default function VehicleCardInline({
  vehicle,
  onSelect,
  onCompare,
  isCompareSelected = false,
}: VehicleCardInlineProps) {
  const scoreColor =
    vehicle.score >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : vehicle.score >= 60 ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-700 border-red-200";

  return (
    <article
      className="group flex overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 hover:shadow-lg cursor-pointer"
      onClick={() => onSelect?.(vehicle.id)}
    >
      <div className="relative h-32 w-36 shrink-0 overflow-hidden bg-slate-50">
        <CarImage
          src={vehicle.image}
          sources={vehicle.photos}
          alt={`${vehicle.make} ${vehicle.model}`}
          make={vehicle.make}
          model={vehicle.model}
          bodyType={vehicle.bodyType}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className={`absolute right-2 top-2 rounded-lg border px-2 py-0.5 text-[11px] font-bold ${scoreColor}`}>
          {vehicle.score}%
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">
            {vehicle.title}
          </h4>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
            <span>{vehicle.year}</span>
            <span className="text-slate-300">&middot;</span>
            <span>{vehicle.km.toLocaleString("fr-FR")} km</span>
            <span className="text-slate-300">&middot;</span>
            <span>{vehicle.fuel}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-price">
              {vehicle.priceFormatted}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <MapPin className="h-3 w-3" />
              {vehicle.city}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {vehicle.source}
          </span>
          {vehicle.reputation?.verified && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
              <ShieldCheck className="h-3 w-3" />
              Verifie
            </span>
          )}
          {onCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCompare(vehicle.id);
              }}
              className={`ml-auto inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium transition-all ${
                isCompareSelected
                  ? "border-corporate bg-slate-50 text-corporate"
                  : "border-slate-200 bg-white text-slate-500 hover:border-corporate hover:text-corporate"
              }`}
            >
              <GitCompare className="h-3 w-3" />
              Comparer
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
