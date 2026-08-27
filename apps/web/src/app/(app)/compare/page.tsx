"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { X, Loader, BadgeCheck, AlertTriangle, ThumbsUp, Wallet, Gauge, Calendar, ChevronLeft, Heart, Fuel, MapPin, CarFront, Sparkles, Share2 } from "lucide-react";
import CarImage from "@/components/CarImage";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerReveal from "@/components/StaggerReveal";
import dynamic from "next/dynamic";
import { type CarListing } from "@/types";

const TopScoreTrophy3D = dynamic(() => import("@/components/three/TopScoreTrophy3D"), { ssr: false });

type DiffColor = "better" | "worse" | "same";

function diffColor(sel: CarListing[], carId: string, specKey: string): DiffColor {
  if (sel.length < 2) return "same";
  switch (specKey) {
    case "Prix":
    case "Kilometrage": {
      const vals = sel.map((c) => (specKey === "Prix" ? c.price : c.km));
      const best = Math.min(...vals);
      const worst = Math.max(...vals);
      const v = specKey === "Prix" ? car("price") : car("km");
      if (v === best && best !== worst) return "better";
      if (v === worst && best !== worst) return "worse";
      return "same";
    }
    case "Score IA":
    case "Annee":
    case "Match %": {
      const vals = sel.map((c) =>
        specKey === "Score IA" ? c.score : specKey === "Annee" ? c.year : (c.matchPercent ?? 0)
      );
      const best = Math.max(...vals);
      const worst = Math.min(...vals);
      const v = specKey === "Score IA" ? car("score") : specKey === "Annee" ? car("year") : (car("matchPercent") ?? 0);
      if (v === best && best !== worst) return "better";
      if (v === worst && best !== worst) return "worse";
      return "same";
    }
    default:
      return "same";
  }
  function car<K extends keyof CarListing>(key: K): any {
    return sel.find((c) => c.id === carId)?.[key];
  }
}

function getDiffClass(d: DiffColor): string {
  if (d === "better") return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (d === "worse") return "text-red-600 bg-red-50 border-red-200";
  return "text-slate-900";
}

function generateAdvice(cars: CarListing[]): string[] {
  if (cars.length < 2) return [];
  const advice: string[] = [];
  const sorted = [...cars].sort((a, b) => b.score - a.score);
  const cheapest = [...cars].sort((a, b) => a.price - b.price)[0];
  const lowestKm = [...cars].sort((a, b) => a.km - b.km)[0];
  const bestScore = sorted[0];

  if (bestScore.score >= 85) advice.push(`${bestScore.make} ${bestScore.model} a le meilleur score (${bestScore.score}/100) — c'est le choix le plus sur.`);
  if (cheapest.id !== bestScore.id) advice.push(`${cheapest.make} ${cheapest.model} est le moins cher (${cheapest.priceFormatted}), soit ${(bestScore.price - cheapest.price).toLocaleString("fr-FR")} DH de moins.`);
  if (lowestKm.km < 20000) advice.push(`${lowestKm.make} ${lowestKm.model} n'a que ${lowestKm.km.toLocaleString("fr-FR")} km — encore tres peu utilise.`);
  const youngest = [...cars].sort((a, b) => b.year - a.year)[0];
  if (2026 - youngest.year <= 1) advice.push(`${youngest.make} ${youngest.model} est le plus recent (${youngest.year}) — garantie constructeur possiblement encore active.`);
  const sameFuel = cars.every((c) => c.fuel === cars[0].fuel);
  if (!sameFuel) advice.push(`Les carburants different (${cars.map((c) => c.fuel).join(" vs ")}) — le diesel consomme moins sur autoroute, l'essence est plus economique en ville.`);
  return advice;
}

const MAX_COMPARE = 3;

export default function ComparePage() {
  const [all, setAll] = useState<CarListing[]>([]);
  const [favoritesCars, setFavoritesCars] = useState<CarListing[]>([]);
  const [selected, setSelected] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"search" | "favorites">("search");
  const [flipIds, setFlipIds] = useState<string[]>([]);
  const [diffPulseIds, setDiffPulseIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/search").then((r) => r.json()).then((d) => d.results as CarListing[]).catch(() => [] as CarListing[]),
      Promise.resolve().then(() => {
        try { const s = localStorage.getItem("thiqti_favorites"); return s ? JSON.parse(s) : []; } catch { return []; }
      }),
    ]).then(([searchResults, favIds]) => {
      setAll(searchResults);
      setFavoritesCars(searchResults.filter((c) => favIds.includes(c.id)));
      if (searchResults.length > 0) setSelected(searchResults.slice(0, MAX_COMPARE));
      setLoading(false);
    });
  }, []);

  const addCar = (id: string) => {
    const pool = source === "favorites" ? favoritesCars : all;
    const car = pool.find((c) => c.id === id);
    if (car && selected.length < MAX_COMPARE && !selected.find((s) => s.id === id)) {
      setSelected([...selected, car]);
      triggerFlip(id);
    }
  };

  const removeCar = (id: string) => setSelected(selected.filter((v) => v.id !== id));

  /* Bascule 3D : anime la colonne du véhicule qui vient d'être
     ajouté/remplacé au lieu d'un saut brutal. */
  const triggerFlip = (id: string) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setFlipIds((prev) => [...prev, id]);
    setDiffPulseIds((prev) => [...prev, id]);
    window.setTimeout(() => {
      setFlipIds((prev) => prev.filter((x) => x !== id));
      setDiffPulseIds((prev) => prev.filter((x) => x !== id));
    }, 600);
  };

  const shareComparison = useCallback(() => {
    if (selected.length < 2) return;
    const lines = selected.map((v) => `• ${v.title} — ${v.priceFormatted} — ${v.km.toLocaleString("fr-FR")} km — Score: ${v.score}/100`);
    const text = `Comparaison Thiqti\n\n${lines.join("\n")}\n\nConsultez sur thiqti.ma`;
    navigator.clipboard.writeText(text);
  }, [selected]);

  const pool = source === "favorites" ? favoritesCars : all;
  const available = pool.filter((v) => !selected.find((s) => s.id === v.id));
  const advice = useMemo(() => generateAdvice(selected), [selected]);
  const bestCar = useMemo(() => selected.length > 0 ? [...selected].sort((a, b) => b.score - a.score)[0] : null, [selected]);

  const specs: { label: string; format: (v: CarListing) => string; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: "Prix", format: (v) => v.priceFormatted, icon: Wallet },
    { label: "Annee", format: (v) => String(v.year), icon: Calendar },
    { label: "Kilometrage", format: (v) => `${v.km.toLocaleString("fr-FR")} km`, icon: Gauge },
    { label: "Carburant", format: (v) => v.fuel, icon: Fuel },
    { label: "Transmission", format: (v) => v.transmission || "—", icon: Gauge },
    { label: "Carrosserie", format: (v) => v.bodyType || "—", icon: CarFront },
    { label: "Ville", format: (v) => v.city, icon: MapPin },
    { label: "Score IA", format: (v) => `${v.score}/100`, icon: Gauge },
  ];

  function getBestRow(sel: CarListing[], specKey: string): string | null {
    if (sel.length < 2) return null;
    if (specKey === "Prix") return sel.reduce((a, b) => (a.price < b.price ? a : b)).id;
    if (specKey === "Kilometrage") return sel.reduce((a, b) => (a.km < b.km ? a : b)).id;
    if (specKey === "Score IA") return sel.reduce((a, b) => (a.score > b.score ? a : b)).id;
    if (specKey === "Annee") return sel.reduce((a, b) => (a.year > b.year ? a : b)).id;
    return null;
  }

  if (loading) {
    return (
    <div className="page-enter min-h-screen overflow-hidden px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-slate-900">Comparaison</h1>
            <p className="mt-2 text-sm text-slate-500">Comparez jusqu'a 3 vehicules cote a cote</p>
          </div>
          <div className="card p-12 text-center">
            <Loader className="mx-auto mb-4 h-8 w-8 animate-spin text-corporate" />
            <p className="text-sm text-slate-500">Chargement des vehicules...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/results" className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="font-serif text-3xl text-slate-900">Comparaison</h1>
            </div>
            <p className="mt-2 text-sm text-slate-500">Comparez jusqu&apos;a 3 vehicules cote a cote</p>
          </div>
          {selected.length >= 2 && (
            <button onClick={shareComparison} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-elev-1 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all">
              <Share2 className="h-4 w-4" />
              Partager
            </button>
          )}
        </div>

        <div className="mb-6 inline-block rounded-2xl liquid-glass p-2">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-slate-500 px-3">Source :</span>
            <div className="relative flex items-center p-1 bg-slate-900/5 rounded-xl">
              <button
                onClick={() => setSource("search")}
                className={`relative z-10 w-28 rounded-lg py-1.5 text-sm font-semibold transition-colors duration-200 ${
                  source === "search" ? "text-brand-700" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {source === "search" && (
                  <motion.div layoutId="tab-indicator" className="absolute inset-0 z-[-1] rounded-lg bg-white shadow-sm border border-slate-200" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                Recherche
              </button>
              <button
                onClick={() => setSource("favorites")}
                className={`relative z-10 w-28 flex justify-center items-center gap-1.5 rounded-lg py-1.5 text-sm font-semibold transition-colors duration-200 ${
                  source === "favorites" ? "text-red-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {source === "favorites" && (
                  <motion.div layoutId="tab-indicator" className="absolute inset-0 z-[-1] rounded-lg bg-white shadow-sm border border-slate-200" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <Heart className={`h-3.5 w-3.5 ${source === "favorites" ? "fill-red-500 text-red-500" : ""}`} />
                Favoris ({favoritesCars.length})
              </button>
            </div>
          </div>
        </div>

        <ScrollReveal>
          <div className="card overflow-hidden shadow-elev-2">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="w-40 p-4 text-left text-sm font-semibold text-slate-500">Caractéristique</th>
                {selected.map((v) => (
                  <th key={v.id} className={`relative min-w-[220px] p-4 text-center ${flipIds.includes(v.id) ? "flip-in" : ""}`}>
                    {bestCar?.id === v.id && (
                      <div className="absolute -top-4 -right-4 h-16 w-16 z-20 pointer-events-none">
                        <TopScoreTrophy3D />
                      </div>
                    )}
                    <button onClick={() => removeCar(v.id)} aria-label="Retirer" className="absolute right-2 top-2 rounded-xl p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors z-10">
                      <X className="h-4 w-4" />
                    </button>
                    <CarImage src={v.image} sources={v.photos} alt={v.title} make={v.make} model={v.model} bodyType={v.bodyType} className="mx-auto h-28 w-44 rounded-xl object-cover shadow-elev-2" />
                    <p className="mt-2 text-sm font-bold text-slate-900">{v.title}</p>
                    <Link href={`/vehicle/${v.id}`} className="mt-1 inline-block text-xs font-semibold text-brand-600 hover:underline">Voir fiche détail</Link>
                  </th>
                ))}
                {selected.length < MAX_COMPARE && (
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CarFront className="h-8 w-8 text-slate-300" />
                      <select key={`${source}-${selected.length}`} onChange={(e) => { if (e.target.value) addCar(e.target.value); }} value="" className="select w-56 text-xs">
                        <option value="" disabled>+ Ajouter un véhicule</option>
                        {available.map((v) => (<option key={v.id} value={v.id}>{v.title}</option>))}
                      </select>
                      {available.length === 0 && <p className="text-xs text-slate-400">{source === "favorites" ? "Aucun favori" : "Aucun véhicule"}</p>}
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {specs.map((spec) => {
                const bestId = getBestRow(selected, spec.label);
                const differ = selected.length > 1 && new Set(selected.map((v) => spec.format(v))).size > 1;
                const Icon = spec.icon;
                return (
                  <tr key={spec.label} className={`border-b border-slate-100 last:border-0 transition-colors ${differ ? "bg-brand-50/40 hover:bg-brand-50/70" : "hover:bg-slate-50/50"}`}>
                    <td className="p-4 text-sm font-medium text-slate-700">
                      <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-slate-400" />{spec.label}</span>
                    </td>
                    {selected.map((v) => {
                      const d = diffColor(selected, v.id, spec.label);
                      const isBest = bestId === v.id;
                      return (
                        <td key={v.id} className={`rounded-xl p-4 text-center text-sm border border-transparent ${getDiffClass(d)} ${isBest ? "font-bold" : ""} ${diffPulseIds.includes(v.id) ? "diff-pulse" : ""}`}>
                          <span className="flex items-center justify-center gap-1.5">
                            {isBest && <BadgeCheck className="h-4 w-4 text-emerald-600" />}
                            {spec.format(v)}
                          </span>
                        </td>
                      );
                    })}
                    {selected.length < MAX_COMPARE && <td />}
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
        </ScrollReveal>

        {selected.length >= 2 && advice.length > 0 && (
          <ScrollReveal delay={150}>
            <div className="mt-6 card p-6 shadow-elev-2">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold text-slate-900">Conseils IA Thiqti</h2>
            </div>
            <div className="space-y-3">
              {advice.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  {tip.includes("sur") || tip.includes("meilleur") || tip.includes("recent") || tip.includes("peu utilise") ? (
                    <ThumbsUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : tip.includes("moins cher") || tip.includes("rapport") ? (
                    <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  ) : tip.includes("ecart") || tip.includes("important") ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  ) : (
                    <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  )}
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
            {bestCar && (
              <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-brand-600" />
                  <p className="font-bold text-brand-900">Recommandation globale : {bestCar.make} {bestCar.model}</p>
                </div>
                <p className="mt-1 text-sm text-brand-700">
                  Avec un score TOPSIS de {bestCar.score}/100 et un prix de {bestCar.priceFormatted}, c&apos;est l&apos;offre la plus équilibrée de votre sélection.
                </p>
              </div>
            )}
          </div>
          </ScrollReveal>
        )}

        {selected.length === 0 && (
          <div className="mt-6 card p-12 text-center shadow-elev-2">
            <CarFront className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="font-bold text-slate-700">Aucun véhicule sélectionné</p>
            <p className="mt-1 text-sm text-slate-500">Sélectionnez des véhicules pour les comparer côte à côte</p>
            <Link href="/results" className="btn-primary btn-press mt-6 inline-flex items-center gap-2">Explorer les annonces</Link>
          </div>
        )}
      </div>
    </div>
  );
}
