"use client";

import ReputationGauge from "./ReputationGauge";
import type { MockVehicle } from "@/lib/mock-data";
import CarImage from "@/components/CarImage";
import { Car, MapPin, Fuel, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

interface VehicleCardProps {
  vehicle: MockVehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const rawWhatsapp = "212661001122";
  const whatsappMsg = encodeURIComponent(
    `Salam, je vous contacte depuis Thiqti pour : ${vehicle.make} ${vehicle.model} ${vehicle.year} — ${vehicle.priceFormatted}`
  );
  const whatsappUrl = `https://wa.me/${rawWhatsapp}?text=${whatsappMsg}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:border-brand-200 hover:shadow-elev-3">
      {/* Image */}
      <Link href={`/results?q=${encodeURIComponent(vehicle.make)}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-100">
        {vehicle.image ? (
          <CarImage
            src={vehicle.image}
            alt={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
            make={vehicle.make}
            model={vehicle.model}
            bodyType={vehicle.bodyType}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <div className="flex flex-col items-center gap-2 text-slate-400 p-4">
              <Car className="h-8 w-8 opacity-30" />
              <span className="text-[11px]">Pas de photo</span>
            </div>
          </div>
        )}
        {/* Favorite overlay */}
        <button
          className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-sm backdrop-blur-sm transition-colors hover:text-red-500"
          aria-label="Ajouter aux favoris"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        {/* Match badge */}
        {vehicle.matchPercent && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-lg bg-brand-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
            {vehicle.matchPercent}% match
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="p-3.5 sm:p-4">
        {/* Price — most important on mobile */}
        <p className="text-xl font-extrabold text-brand-700 leading-tight">
          {vehicle.priceFormatted}
        </p>

        {/* Title */}
        <h3 className="mt-1 text-sm font-bold text-slate-900 leading-snug group-hover:text-brand-600 transition-colors line-clamp-1">
          {vehicle.make} {vehicle.model}
        </h3>

        {/* Subtitle: year · fuel · city */}
        <p className="mt-0.5 text-xs font-medium text-slate-500">
          {vehicle.year} · {vehicle.fuel} · {vehicle.city}
        </p>

        {/* Score + compact info row */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <ReputationGauge
            score={vehicle.reviews?.score ?? null}
            totalReviews={vehicle.reviews?.total ?? null}
            window={vehicle.reviews?.window ?? null}
          />
          {/* Desktop-only WhatsApp CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        </div>
      </div>

      {/* Mobile-only sticky contact bar */}
      <div className="flex border-t border-slate-100 sm:hidden">
        <a
          href={`tel:+212522669900`}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Phone className="h-3.5 w-3.5" />
          Appeler
        </a>
        <div className="w-px bg-slate-100" />
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>
      </div>
    </article>
  );
}
