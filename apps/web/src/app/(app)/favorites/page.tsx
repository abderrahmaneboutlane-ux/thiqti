"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, MapPin, Fuel, Trash2, ArrowRight, Sparkles } from "lucide-react";
import CarImage from "@/components/CarImage";
import TiltCard from "@/components/ui/TiltCard";
import CardZoomLink from "@/components/ui/CardZoomLink";
import ScoreBadge from "@/components/ui/ScoreBadge";
import ScrollReveal from "@/components/ScrollReveal";
import { AnimatePresence } from "framer-motion";
// @ts-ignore
import { Reorder } from "framer-motion";
import { type CarListing } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

export default function FavoritesPage() {
  const { favorites, loaded, removeFavorite, count } = useFavorites();
  const [cars, setCars] = useState<CarListing[]>([]);

  useEffect(() => {
    if (favorites.length === 0) { setCars([]); return; }
    fetch("/api/search")
      .then((r) => r.json())
      .then((data) => {
        setCars(data.results.filter((c: CarListing) => favorites.includes(c.id)));
      })
      .catch(() => {});
  }, [favorites]);

  const removeFav = (id: string) => {
    removeFavorite(id);
    setCars((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="page-enter min-h-screen px-4 sm:px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 font-serif text-3xl font-bold text-slate-900 md:text-4xl">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            Mes favoris
          </h1>
          <p className="mt-2 text-sm text-slate-500">{loaded ? `${count} véhicule(s) sauvegardé(s)` : "Chargement..."}</p>
        </div>

        {!loaded ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : count === 0 ? (
          <ScrollReveal>
            <div className="card p-12 text-center shadow-elev-2">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                <Heart className="h-10 w-10 text-red-400" />
              </div>
              <p className="text-lg font-bold text-slate-800">Aucun favori pour le moment</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 leading-relaxed">
                Parcourez les annonces et cliquez sur le coeur pour sauvegarder vos coups de coeur. Vos favoris restent stockés localement.
              </p>
              <Link href="/results" className="btn-primary btn-press mt-8 inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Explorer les annonces
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <Reorder.Group 
            axis="y" 
            values={cars} 
            onReorder={(newCars: CarListing[]) => { setCars(newCars); localStorage.setItem("thiqti_favorites", JSON.stringify(newCars.map((c: CarListing) => c.id))); }} 
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
            as="div"
          >
            <AnimatePresence>
              {cars.map((v) => (
                <Reorder.Item 
                  value={v} 
                  key={v.id} 
                  as="div"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.3, duration: 0.5 } }}
                  exit={{ opacity: 0, scale: 0.85, y: -10, transition: { type: "spring", bounce: 0, duration: 0.25 } }}
                  whileDrag={{ scale: 1.05, zIndex: 50, cursor: "grabbing", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
                  className="cursor-grab"
                >
                  <TiltCard className="h-full rounded-2xl">
                    <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elev-1 transition-all duration-200 hover:border-brand-200 hover:shadow-elev-3">
                      <CardZoomLink href={`/vehicle/${v.id}`} className="block">
                        <div className="relative h-48 overflow-hidden bg-slate-100">
                          <CarImage
                            src={v.image}
                            sources={v.photos}
                            alt={v.title}
                            make={v.make}
                            model={v.model}
                            bodyType={v.bodyType}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                          <div className="absolute left-2 top-2">
                            <span className="rounded-lg bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm">{v.source}</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xl font-bold text-price-600">{v.priceFormatted}</span>
                          </div>
                          <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">{v.title}</h3>
                          <p className="mt-0.5 text-xs text-slate-500">{v.year} · {v.km.toLocaleString("fr-FR")} km</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-medium"><Fuel className="h-3 w-3 text-slate-400" />{v.fuel}</span>
                            <span className="flex items-center gap-1 font-medium"><MapPin className="h-3 w-3 text-slate-400" />{v.city}</span>
                          </div>
                        </div>
                      </CardZoomLink>

                      {/* Boutons interactifs en overlay (hors du <a>) */}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFav(v.id); }}
                        aria-label="Supprimer des favoris"
                        className="absolute right-2 top-2 z-10 rounded-xl bg-white/90 backdrop-blur-sm p-2 text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {v.score !== undefined && (
                        <div className="absolute right-4 bottom-[4.5rem] z-10">
                          <ScoreBadge percent={v.score} />
                        </div>
                      )}
                    </div>
                  </TiltCard>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
