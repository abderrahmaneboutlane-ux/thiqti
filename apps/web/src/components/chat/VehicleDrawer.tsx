"use client";

import { useState, useEffect, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, GitCompare, Phone, MessageCircle, ExternalLink, Sparkles } from "lucide-react";
import CarImage from "@/components/CarImage";
import ConfidenceRadar, { type RadarAxis } from "@/components/ui/ConfidenceRadar";
import PriceTimeline from "@/components/ui/PriceTimeline";

interface VehicleDrawerProps {
  vehicle: any;
  isOpen: boolean;
  onClose: () => void;
  onCompare?: (id: string) => void;
}

type Tab = "specs" | "radar" | "contact";

export default function VehicleDrawer({ vehicle, isOpen, onClose, onCompare }: VehicleDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("specs");
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setActiveTab("specs");
      setPhotoIndex(0);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !vehicle) return null;

  const photos = vehicle.photos?.length ? vehicle.photos : vehicle.image ? [vehicle.image] : [];
  const prevPhoto = () => setPhotoIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  const nextPhoto = () => setPhotoIndex((i) => (i < photos.length - 1 ? i + 1 : 0));

  const tabs: { key: Tab; label: string }[] = [
    { key: "specs", label: "Caractéristiques" },
    { key: "radar", label: "Radar & Marché" },
    { key: "contact", label: "Contact" },
  ];

  const radarAxes: RadarAxis[] = useMemo(() => [
    { label: "Score TOPSIS", value: vehicle.score || 80, weight: 0.3 },
    { label: "Kilométrage", value: Math.max(0, Math.min(100, 100 * (1 - (vehicle.km || 80000) / 250000))), weight: 0.1 },
    { label: "Année", value: Math.max(0, Math.min(100, (((vehicle.year || 2020) - 2000) / 26) * 100)), weight: 0.2 },
    { label: "E-Réputation", value: vehicle.reputation?.rating5 ? (vehicle.reputation.rating5 / 5) * 100 : 75, weight: 0.2 },
    { label: "Budget", value: 85, weight: 0.1 },
    { label: "Requête IA", value: 90, weight: 0.1 },
  ], [vehicle.score, vehicle.km, vehicle.year, vehicle.reputation?.rating5]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div
        className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-elev-4 animate-slide-in-right"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {vehicle.make} {vehicle.model}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{vehicle.year} · {vehicle.priceFormatted}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {photos.length > 0 && (
          <div className="relative h-56 shrink-0 bg-slate-100">
            <CarImage
              src={photos[photoIndex]}
              alt={`${vehicle.make} ${vehicle.model}`}
              make={vehicle.make}
              model={vehicle.model}
              bodyType={vehicle.bodyType}
              className="h-full w-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-elev-1 backdrop-blur hover:bg-white transition"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-900" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-elev-1 backdrop-blur hover:bg-white transition"
                >
                  <ChevronRight className="h-4 w-4 text-slate-900" />
                </button>
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                  {photos.map((_: string, i: number) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === photoIndex ? "w-4 bg-brand-600" : "w-1.5 bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex border-b border-slate-200 bg-slate-50/50">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-brand-600 text-brand-600 bg-white"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "specs" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {[
                  { label: "Année", value: String(vehicle.year) },
                  { label: "Kilométrage", value: (vehicle.km ? vehicle.km.toLocaleString("fr-FR") + " km" : "—") },
                  { label: "Carburant", value: vehicle.fuel || "—" },
                  { label: "Prix", value: vehicle.priceFormatted },
                  { label: "Ville", value: vehicle.city || "Maroc" },
                  { label: "Score TOPSIS", value: (vehicle.score || 85) + "/100" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "radar" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-accent-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Radar de confiance 3D</h4>
                </div>
                <ConfidenceRadar axes={radarAxes} className="w-full" />
              </div>
              <PriceTimeline make={vehicle.make} model={vehicle.model} price={vehicle.price} year={vehicle.year} />
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-3">
              {vehicle.contact?.name && (
                <p className="text-sm font-semibold text-slate-900">{vehicle.contact.name}</p>
              )}
              {vehicle.contact?.phoneHref && (
                <a
                  href={vehicle.contact.phoneHref}
                  className="btn-primary flex w-full items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Appeler
                </a>
              )}
              {vehicle.contact?.whatsappHref && (
                <a
                  href={vehicle.contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d7a4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#246640] transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              {vehicle.url && (
                <a
                  href={vehicle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex w-full items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Voir l&apos;annonce
                </a>
              )}
            </div>
          )}
        </div>

        {onCompare && (
          <div className="border-t border-slate-200 px-5 py-4">
            <button
              onClick={() => onCompare(vehicle.id)}
              className="btn-secondary flex w-full items-center justify-center gap-2"
            >
              <GitCompare className="h-4 w-4" />
              Comparer ce vehicule
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
