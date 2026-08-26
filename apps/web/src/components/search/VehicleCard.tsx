"use client";

import ReputationGauge from "./ReputationGauge";
import type { MockVehicle } from "@/lib/mock-data";
import { Car, MapPin, Calendar, Fuel, SlidersHorizontal } from "lucide-react";

interface VehicleCardProps {
  vehicle: MockVehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <article className="vehicle-card group">
      <div className="vehicle-image">
        <div className="w-full h-full flex items-center justify-center bg-slate-100">
          <div className="flex flex-col items-center gap-2 text-slate-400 p-4">
            <Car className="h-10 w-10 opacity-40" />
            <span className="text-xs">Pas de photo</span>
          </div>
        </div>
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="badge-verified">{vehicle.matchPercent}% match</span>
        </div>
        <button className="vehicle-favorite btn-icon-sm" aria-label="Ajouter aux favoris">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      <div className="vehicle-info">
        <div className="mb-3">
          <h3 className="vehicle-make-model">{vehicle.make} {vehicle.model}</h3>
          <p className="vehicle-year">{vehicle.year} · {vehicle.fuel} · {vehicle.transmission}</p>
        </div>

        <p className="mb-3 px-3 py-2 text-xs leading-relaxed text-slate-500 italic bg-slate-50 rounded-lg border-l-2 border-brand-300">
          {vehicle.explanation}
        </p>

        <div className="vehicle-specs">
          <span className="spec-chip"><Calendar className="h-3 w-3" /> {vehicle.year}</span>
          <span className="spec-chip"><Fuel className="h-3 w-3" /> {vehicle.fuel}</span>
          <span className="spec-chip"><SlidersHorizontal className="h-3 w-3" /> {vehicle.transmission}</span>
          <span className="spec-chip"><MapPin className="h-3 w-3" /> {vehicle.city}</span>
        </div>

        <div className="vehicle-footer flex items-center justify-between pt-3 mt-auto">
          <ReputationGauge
            score={vehicle.reviews?.score ?? null}
            totalReviews={vehicle.reviews?.total ?? null}
            window={vehicle.reviews?.window ?? null}
          />
          <span className="vehicle-price">{vehicle.priceFormatted}</span>
        </div>
      </div>
    </article>
  );
}