"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search, SlidersHorizontal, MapPin, Fuel, Heart, Grid3X3, List,
  ChevronDown, GitCompareArrows, X, Sparkles, BadgeCheck,
  ChevronLeft, ChevronRight, Phone, MessageCircle, ShieldCheck
} from "lucide-react";
import CarImage from "@/components/CarImage";
import SearchChat from "@/components/SearchChat";
import TiltCard from "@/components/ui/TiltCard";
import CardZoomLink from "@/components/ui/CardZoomLink";
import ScoreBadge, { type ScoreExplanation } from "@/components/ui/ScoreBadge";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerReveal from "@/components/StaggerReveal";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

import { type CarListing, type SearchCriteria } from "@/types";

const CarPreview3DModal = dynamic(() => import("@/components/three/CarPreview3DModal"), { ssr: false });

function buildSmartHeader(totalCount: number, criteria: SearchCriteria | null, query: string): { title: string; subtitle: string } {
  if (!criteria || totalCount === 0) {
    return {
      title: `${totalCount.toLocaleString("fr-FR")} véhicule${totalCount > 1 ? "s" : ""} disponible${totalCount > 1 ? "s" : ""}`,
      subtitle: `${totalCount.toLocaleString("fr-FR")} offres vérifiées sur le marché marocain (Neuf & Occasion)`
    };
  }
  const parts: string[] = [];
  if (criteria.marque) parts.push(criteria.marque);
  if (criteria.carrosserie) parts.push(criteria.carrosserie);
  if (criteria.motorisation) parts.push(criteria.motorisation);
  if (criteria.ville) parts.push(`à ${criteria.ville}`);

  let title = parts.length > 0 ? parts.join(" ") : "Véhicules trouvés";
  if (criteria.budgetMax) title += ` à moins de ${criteria.budgetMax.toLocaleString("fr-FR")} DH`;

  const countStr = totalCount === 1 ? "1 résultat trouvé" : `${totalCount.toLocaleString("fr-FR")} résultats trouvés`;
  const intentDesc = criteria.intent && criteria.intent.length > 0 ? ` · ${criteria.intent.join(", ")}` : "";

  return { title, subtitle: `${countStr}${intentDesc}` };
}

function extractDisplayCriteria(criteria: SearchCriteria): { key: string; label: string; value: string; confidence: "high" | "low" }[] {
  const LABELS: Record<string, string> = {
    carrosserie: "Type",
    motorisation: "Carburant",
    transmission: "Transmission",
    marque: "Marque",
    budgetMax: "Budget max",
    budgetMin: "Budget min",
    ville: "Ville",
    anneeMin: "Année min",
    kmMax: "Kilométrage max",
  };
  const HIGH_CONF = new Set(["carrosserie", "motorisation", "marque", "ville"]);
  return Object.entries(criteria)
    .filter(([key, val]) => key !== "intent" && val !== null && val !== undefined && val !== "")
    .map(([key, val]) => ({
      key,
      label: LABELS[key] || key,
      value: String(val),
      confidence: HIGH_CONF.has(key) ? "high" : "low",
    }));
}

export default function ResultsPage() {
  const [query, setQuery] = useState("");
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [heartAnimating, setHeartAnimating] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);
  const [sortBy, setSortBy] = useState<string>("score_desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewCar, setPreviewCar] = useState<CarListing | null>(null);
  const [refineOpen, setRefineOpen] = useState(false);

  const [refine, setRefine] = useState({
    carrosserie: "",
    motorisation: "",
    budgetMax: "",
    anneeMin: "",
    kmMax: "",
    marque: "",
    ville: "",
  });

  const loadedRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("thiqti_favorites");
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}
    loadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    localStorage.setItem("thiqti_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const doSearch = useCallback(async (q: string, targetPage = 1, targetLimit = limit, append = false, structuredParams?: Record<string, string>) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setAnalyzing(true);
    }
    
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", String(targetPage));
      params.set("limit", String(targetLimit));
      params.set("sort", sortBy);
      if (structuredParams) {
        for (const [k, v] of Object.entries(structuredParams)) {
          if (v) params.set(k, v);
        }
      }
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur réseau");
      const data = await res.json();
      
      const newCars = (data.results || data.vehicles || []).map((v: any) => ({
        id: v.id,
        title: v.name || v.title,
        make: v.make,
        model: v.model,
        year: v.year,
        price: v.price_mad || v.price,
        priceFormatted: v.price_display || (typeof v.price === 'number' ? `${v.price.toLocaleString('fr-FR')} DH` : (typeof v.price_mad === 'number' ? `${v.price_mad.toLocaleString('fr-FR')} DH` : v.price)),
        km: v.km || 0,
        fuel: v.fuel,
        city: v.city,
        image: v.image_url || v.image,
        photos: v.photos || [],
        score: Math.round((v.score || 85) * (v.score > 10 ? 1 : 10)),
        source: v.source,
        url: v.source_url || v.url,
        matchPercent: v.score_normalized ? Math.round(v.score_normalized * 10) : undefined,
        meetsBudget: true,
        sellerName: v.seller_name || v.sellerName || v.source || 'Vendeur Certifié',
        sellerPhone: v.seller_phone || v.phone || '+212 522 669 900',
        whatsappNumber: v.whatsapp_number || v.whatsapp || '212661001122',
        inventoryType: v.inventory_type || v.inventoryType || (v.km === 0 ? 'neuf' : 'occasion')
      }));

      if (append) {
        setCars((prev) => [...prev, ...newCars]);
      } else {
        setCars(newCars);
      }

      setTotal(data.total || newCars.length);
      setPage(data.page || targetPage);
      setTotalPages(data.totalPages || Math.ceil((data.total || newCars.length) / targetLimit) || 1);
      setCriteria(data.criteria || null);

      if (data.criteria) {
        setRefine({
          carrosserie: data.criteria.carrosserie || "",
          motorisation: data.criteria.motorisation || "",
          budgetMax: data.criteria.budgetMax ? String(data.criteria.budgetMax) : "",
          anneeMin: data.criteria.anneeMin ? String(data.criteria.anneeMin) : "",
          kmMax: data.criteria.kmMax ? String(data.criteria.kmMax) : "",
          marque: data.criteria.marque || "",
          ville: data.criteria.ville || "",
        });
      }
    } catch {
      if (!append) {
        setCars([]);
        setTotal(0);
        setCriteria(null);
      }
    }
    setLoading(false);
    setLoadingMore(false);
    setTimeout(() => setAnalyzing(false), 400);
  }, [limit, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || params.get("brand") || params.get("category") || "";
    const p = parseInt(params.get("page") || "1") || 1;
    setQuery(q);
    setPage(p);
    doSearch(q, p, limit, false);
  }, [doSearch, limit]);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
    doSearch(query, newPage, limit, false);
  };

  const loadMoreCars = () => {
    if (page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    doSearch(query, nextPage, limit, true);
  };

  const changeLimit = (newLim: number) => {
    setLimit(newLim);
    setPage(1);
    doSearch(query, 1, newLim, false);
  };

  const toggleFav = useCallback((id: string) => {
    setHeartAnimating(id);
    setTimeout(() => setHeartAnimating(null), 350);
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }, []);

  const removeCriterion = useCallback((key: string) => {
    const next = { ...refine, [key]: "" };
    setRefine(next);
    const parts: string[] = [];
    if (next.carrosserie) parts.push(next.carrosserie);
    if (next.motorisation) parts.push(next.motorisation);
    if (next.marque) parts.push(next.marque);
    if (next.ville) parts.push(next.ville);
    if (next.budgetMax) parts.push(`sous ${next.budgetMax} dh`);
    if (next.anneeMin) parts.push(`depuis ${next.anneeMin}`);
    if (next.kmMax) parts.push(`moins de ${next.kmMax} km`);
    const q = parts.join(" ");
    setQuery(q);
    setPage(1);
    const sp: Record<string, string> = {};
    if (next.motorisation) sp.fuel = next.motorisation;
    if (next.carrosserie) sp.body_type = next.carrosserie;
    if (next.marque) sp.make = next.marque;
    if (next.ville) sp.city = next.ville;
    if (next.budgetMax) sp.max_price = next.budgetMax;
    if (next.anneeMin) sp.min_year = next.anneeMin;
    if (next.kmMax) sp.max_km = next.kmMax;
    doSearch(q, 1, limit, false, sp);
  }, [refine, doSearch, limit]);

  const buildRefineQuery = useCallback(() => {
    const parts: string[] = [];
    if (refine.carrosserie) parts.push(refine.carrosserie);
    if (refine.motorisation) parts.push(refine.motorisation);
    if (refine.marque) parts.push(refine.marque);
    if (refine.ville) parts.push(refine.ville);
    if (refine.budgetMax) parts.push(`sous ${refine.budgetMax} dh`);
    if (refine.anneeMin) parts.push(`depuis ${refine.anneeMin}`);
    if (refine.kmMax) parts.push(`moins de ${refine.kmMax} km`);
    return parts.join(" ");
  }, [refine]);

  const applyRefine = useCallback(() => {
    const q = buildRefineQuery();
    setQuery(q);
    setPage(1);
    const sp: Record<string, string> = {};
    if (refine.motorisation) sp.fuel = refine.motorisation;
    if (refine.carrosserie) sp.body_type = refine.carrosserie;
    if (refine.marque) sp.make = refine.marque;
    if (refine.ville) sp.city = refine.ville;
    if (refine.budgetMax) sp.max_price = refine.budgetMax;
    if (refine.anneeMin) sp.min_year = refine.anneeMin;
    if (refine.kmMax) sp.max_km = refine.kmMax;
    doSearch(q, 1, limit, false, sp);
  }, [buildRefineQuery, doSearch, limit, refine]);

  const displayCriteria = criteria ? extractDisplayCriteria(criteria) : [];
  const smartHeader = buildSmartHeader(total, criteria, query);

  return (
    <div className="page-enter overflow-hidden px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="mb-8">
          {analyzing ? (
            <div className="flex items-center gap-3">
              <div className="nlp-pulse flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-slate-600">Analyse NLP et classement TOPSIS sur {total || 1750} véhicules...</span>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-3xl text-slate-900 md:text-4xl">
                <span className="text-brand-600 font-bold">{total ? total.toLocaleString("fr-FR") : cars.length}</span>{" "}
                {smartHeader.title.replace(`${total ? total.toLocaleString("fr-FR") : cars.length} `, "")}
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                {smartHeader.subtitle} {totalPages > 1 && `• Page ${page} sur ${totalPages} (${cars.length} affichés)`}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ── Sidebar ───────────────────────────────────────── */}
          <aside className="w-full shrink-0 space-y-4 lg:w-72">
            {/* Search input */}
            <ScrollReveal delay={0}>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-elev-1">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
                    placeholder='Ex: "SUV hybride 350 000 DH"'
                    className="input pl-10"
                  />
                </div>
              </div>
            </ScrollReveal>

            {/* Detected criteria */}
            {displayCriteria.length > 0 && (
              <ScrollReveal delay={80}>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-elev-1">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
                  <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                  Critères détectés par l&apos;IA
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayCriteria.map((c, i) => (
                    <span
                      key={c.key}
                      className={`stagger-child inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                        c.confidence === "high"
                          ? "border border-brand-200 bg-brand-50 text-brand-700"
                          : "border border-dashed border-slate-300 bg-slate-50 text-slate-600"
                      }`}
                      style={{ animationDelay: `${i * 80}ms` }}
                      title={c.confidence === "low" ? "Critère inféré — cliquez ✕ pour supprimer" : ""}
                    >
                      <span className="font-semibold">{c.label}:</span> {c.value}
                      <button
                        onClick={() => removeCriterion(c.key)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-brand-100 transition-colors"
                        aria-label={`Supprimer ${c.label}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              </ScrollReveal>
            )}

            {/* Refine panel */}
            <ScrollReveal delay={160}>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-elev-1">
              <button
                onClick={() => setRefineOpen(!refineOpen)}
                className="flex w-full items-center justify-between p-4 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                  Affiner les critères
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                    refineOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {refineOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-slate-100 px-4 pb-4 pt-4 space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Carrosserie</label>
                        <select value={refine.carrosserie} onChange={(e) => setRefine({ ...refine, carrosserie: e.target.value })} className="select">
                          <option value="">Toutes</option>
                        {["SUV", "Berline", "Citadine", "Compacte", "Crossover", "Break"].map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Motorisation</label>
                      <select value={refine.motorisation} onChange={(e) => setRefine({ ...refine, motorisation: e.target.value })} className="select">
                        <option value="">Toutes</option>
                        {["Essence", "Diesel", "Hybride", "Electrique"].map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Budget max (DH)</label>
                      <input type="number" value={refine.budgetMax} onChange={(e) => setRefine({ ...refine, budgetMax: e.target.value })} placeholder="Ex: 350000" className="input input-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Année min</label>
                      <input type="number" value={refine.anneeMin} onChange={(e) => setRefine({ ...refine, anneeMin: e.target.value })} placeholder="Ex: 2020" className="input input-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Kilométrage max</label>
                      <input type="number" value={refine.kmMax} onChange={(e) => setRefine({ ...refine, kmMax: e.target.value })} placeholder="Ex: 50000" className="input input-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Marque</label>
                      <select value={refine.marque} onChange={(e) => setRefine({ ...refine, marque: e.target.value })} className="select">
                        <option value="">Toutes</option>
                        {["Dacia", "Renault", "Peugeot", "Toyota", "Hyundai", "Kia", "Volkswagen", "BMW", "Mercedes"].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Ville</label>
                      <select value={refine.ville} onChange={(e) => setRefine({ ...refine, ville: e.target.value })} className="select">
                        <option value="">Toutes</option>
                        {["Casablanca", "Rabat", "Marrakech", "Fes", "Tanger", "Agadir"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={applyRefine} className="btn-primary flex-1">Appliquer</button>
                      <button onClick={() => { setRefine({ carrosserie: "", motorisation: "", budgetMax: "", anneeMin: "", kmMax: "", marque: "", ville: "" }); doSearch(""); }} className="btn-secondary flex-1">Réinitialiser</button>
                    </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </ScrollReveal>

            {/* Quick filters */}
            <ScrollReveal delay={240}>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-elev-1 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Filtres rapides
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-medium text-slate-500 uppercase tracking-wider">Carburant</label>
                <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.04 } } }} className="flex flex-wrap gap-1.5">
                  {["Essence", "Diesel", "Hybride", "Electrique"].map((f) => (
                    <motion.button key={f} variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }} onClick={() => { setQuery(f); doSearch(f, 1, limit, false, { fuel: f }); }} className="chip">{f}</motion.button>
                  ))}
                </motion.div>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-medium text-slate-500 uppercase tracking-wider">Ville</label>
                <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.04 } } }} className="flex flex-wrap gap-1.5">
                  {["Casablanca", "Rabat", "Marrakech", "Fes", "Tanger"].map((c) => (
                    <motion.button key={c} variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }} onClick={() => { setQuery(c); doSearch(c, 1, limit, false, { city: c }); }} className="chip">{c}</motion.button>
                  ))}
                </motion.div>
              </div>
              <button onClick={() => { setQuery(""); doSearch(""); }} className="btn-ghost btn-sm w-full">Réinitialiser les filtres</button>
              </div>
            </ScrollReveal>
          </aside>

          {/* ── Results ────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                  <BadgeCheck className="h-3 w-3" />
                </div>
                <span className="text-xs font-semibold text-brand-800">Agrégé depuis 12 sites marocains</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/compare" className="btn-secondary btn-sm">
                  <GitCompareArrows className="h-3.5 w-3.5" />Comparer
                </Link>
                <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); }} className="min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-elev-1 cursor-pointer outline-none focus:border-brand-500">
                  <option value="score_desc">Pertinence</option>
                  <option value="best_deal">Meilleure offre</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="year_desc">Plus récent</option>
                </select>
                {/* View toggle */}
                <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-elev-1">
                  <button
                    onClick={() => setView("grid")}
                    aria-label="Affichage en grille"
                    className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      view === "grid"
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    aria-label="Affichage en liste"
                    className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      view === "list"
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content states */}
            {loading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.35 }}
                    className="liquid-glass relative overflow-hidden rounded-2xl shadow-elev-1"
                  >
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="relative h-44 overflow-hidden rounded-t-2xl bg-slate-200/60">
                      <div className="absolute left-2.5 top-2.5 h-5 w-16 rounded-md bg-slate-300/50" />
                      <div className="absolute right-2.5 top-2.5 h-6 w-10 rounded-lg bg-brand-200/50" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-1/3 rounded-lg bg-brand-200/50" />
                        <div className="h-5 w-12 rounded-full bg-slate-200/50" />
                      </div>
                      <div className="mt-3 h-5 w-3/4 rounded-lg bg-slate-200/50" />
                      <div className="mt-2 h-3.5 w-1/2 rounded-lg bg-slate-200/40" />
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-3.5 w-20 rounded bg-slate-200/40" />
                        <div className="h-3.5 w-16 rounded bg-slate-200/40" />
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="h-4 w-24 rounded bg-slate-200/40" />
                        <div className="flex gap-2">
                          <div className="h-8 w-8 rounded-lg bg-slate-200/40" />
                          <div className="h-8 w-8 rounded-lg bg-slate-200/40" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div className="py-4">
                <SearchChat initialQuery={query} />
              </div>
            ) : view === "grid" ? (
              /* ── Grid view ──────────────────────────────────── */
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {cars.map((v) => {
                  const rawPhone = (v.sellerPhone || "+212522669900").replace(/\s+/g, "");
                  const rawWhatsapp = (v.whatsappNumber || "212661001122").replace(/\D/g, "");
                  const whatsappMsg = encodeURIComponent(
                    `Salam / Bonjour, je vous contacte depuis Thiqti au sujet de l'annonce : ${v.title} (${v.priceFormatted}) à ${v.city}. Est-elle toujours disponible ?`
                  );
                  const whatsappUrl = `https://wa.me/${rawWhatsapp}?text=${whatsappMsg}`;

                  return (
                    <TiltCard key={v.id} className="h-full rounded-2xl">
                      <div className="card-3d group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl specular-shine">
                        <CardZoomLink href={`/vehicle/${v.id}`} className="block">
                          <div className="relative h-48 overflow-hidden bg-slate-100">
                            <CarImage src={v.image} alt={v.title} make={v.make} model={v.model} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" sources={v.photos || []} />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                            <div className="absolute left-2 top-2">
                              <span className="badge-3d px-2.5 py-1 text-[10px] text-slate-700">
                                <ShieldCheck className="h-3 w-3 text-brand-600" />
                                {v.source}
                              </span>
                            </div>
                            {v.meetsBudget === false && (
                              <div className="absolute right-10 top-2">
                                <span className="rounded-lg bg-amber-500/90 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm shadow-sm">Hors budget</span>
                              </div>
                            )}
                          </div>
                          <div className="p-4 pb-2">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xl font-extrabold text-price-600 drop-shadow-xs">{v.priceFormatted}</span>
                              {v.score !== undefined && (
                                <ScoreBadge percent={v.score} explanations={v.explanations} />
                              )}
                            </div>
                            <h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">{v.title}</h3>
                            <p className="mt-0.5 text-xs font-medium text-slate-500">{v.year} · {v.km.toLocaleString("fr-FR")} km</p>
                            <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-600">
                              <span className="flex items-center gap-1 font-semibold"><Fuel className="h-3.5 w-3.5 text-slate-400" />{v.fuel}</span>
                              <span className="flex items-center gap-1 font-semibold"><MapPin className="h-3.5 w-3.5 text-slate-400" />{v.city}</span>
                            </div>
                          </div>
                        </CardZoomLink>

                        {/* ── Espace Contact Vendeur (WhatsApp & Appel Direct) ── */}
                        <div className="mt-2 border-t border-slate-100/80 bg-slate-50/60 p-3 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-bold text-slate-700">{v.sellerName || "Vendeur Partenaire"}</p>
                            <p className="text-[10px] text-slate-500">{v.inventoryType === "neuf" ? "Véhicule Neuf Garanti" : "Occasion Vérifiée"}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={`tel:${rawPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="btn-3d-phone px-2.5 py-1.5 text-xs shadow-xs"
                              title={`Appeler le vendeur : ${rawPhone}`}
                            >
                              <Phone className="h-3.5 w-3.5 text-slate-600" />
                              <span className="hidden sm:inline">Appel</span>
                            </a>
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="btn-3d-whatsapp px-3 py-1.5 text-xs shadow-xs"
                              title="Contacter directement sur WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5 fill-white text-white" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>

                        {/* Bouton Favoris en overlay */}
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(v.id); }}
                          aria-label={favorites.includes(v.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                          className="absolute right-2 top-2 z-10 rounded-xl bg-white/90 backdrop-blur-sm p-2 text-slate-400 hover:text-brand-600 transition-colors shadow-sm"
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors ${
                              favorites.includes(v.id) ? "fill-red-500 text-red-500" : ""
                            } ${heartAnimating === v.id ? "heart-pop" : ""}`}
                          />
                        </button>
                        
                        {/* Bouton Aperçu 3D */}
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPreviewCar(v); }}
                          className="absolute left-2 top-2 z-10 rounded-xl bg-white/90 backdrop-blur-sm p-1.5 text-slate-700 hover:text-brand-600 transition-colors shadow-sm font-bold flex items-center gap-1 text-[10px] uppercase"
                        >
                          <Sparkles className="h-3 w-3 text-amber-500" /> 3D
                        </button>
                      </div>
                    </TiltCard>
                  );
                })}
              </div>
            ) : (
              /* ── List view ──────────────────────────────────── */
              <div className="space-y-4">
                {cars.map((v) => {
                  const rawPhone = (v.sellerPhone || "+212522669900").replace(/\s+/g, "");
                  const rawWhatsapp = (v.whatsappNumber || "212661001122").replace(/\D/g, "");
                  const whatsappMsg = encodeURIComponent(
                    `Salam / Bonjour, je vous contacte depuis Thiqti au sujet de l'annonce : ${v.title} (${v.priceFormatted}) à ${v.city}. Est-elle toujours disponible ?`
                  );
                  const whatsappUrl = `https://wa.me/${rawWhatsapp}?text=${whatsappMsg}`;

                  return (
                    <TiltCard key={v.id} maxTilt={3} className="rounded-2xl">
                      <div className="card-3d group relative flex flex-col md:flex-row overflow-hidden rounded-2xl specular-shine">
                        <CardZoomLink href={`/vehicle/${v.id}`} className="flex flex-1 overflow-hidden p-0">
                          <div className="relative h-44 w-full md:w-56 shrink-0 overflow-hidden bg-slate-100">
                            <CarImage src={v.image} alt={v.title} make={v.make} model={v.model} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" sources={v.photos || []} />
                            {v.meetsBudget === false && (
                              <span className="absolute left-2 top-2 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white">Hors budget</span>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col justify-between p-4 min-w-0">
                            <div>
                              <div className="flex items-center justify-between">
                                <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{v.title}</h3>
                                <span className="text-xl font-extrabold text-price-600 ml-3">{v.priceFormatted}</span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500">{v.year} · {v.km.toLocaleString("fr-FR")} km · <span className="font-semibold text-slate-700">{v.source}</span></p>
                              <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-600">
                                <span className="flex items-center gap-1 font-medium"><Fuel className="h-3.5 w-3.5 text-slate-400" />{v.fuel}</span>
                                <span className="flex items-center gap-1 font-medium"><MapPin className="h-3.5 w-3.5 text-slate-400" />{v.city}</span>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{v.sellerName || "Vendeur Partenaire"}</span>
                              </div>
                            </div>
                          </div>
                        </CardZoomLink>

                        {/* Contact & Overlay Actions */}
                        <div className="border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/70 p-4 flex md:flex-col items-center justify-between md:justify-center gap-3 shrink-0">
                          {v.score !== undefined && (
                            <ScoreBadge percent={v.score} explanations={v.explanations} />
                          )}
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${rawPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="btn-3d-phone px-3 py-2 text-xs"
                              title="Appeler le vendeur"
                            >
                              <Phone className="h-3.5 w-3.5 text-slate-600" />
                              <span>Appel</span>
                            </a>
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="btn-3d-whatsapp px-3.5 py-2 text-xs"
                              title="Contacter sur WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5 fill-white text-white" />
                              <span>WhatsApp</span>
                            </a>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(v.id); }}
                              aria-label={favorites.includes(v.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:text-brand-600 transition-colors shadow-xs"
                            >
                              <Heart className={`h-4 w-4 ${favorites.includes(v.id) ? "fill-red-500 text-red-500" : ""} ${heartAnimating === v.id ? "heart-pop" : ""}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  );
                })}
              </div>
            )}

            {/* ── Pagination Controls ───────────────────────────── */}
            {!loading && cars.length > 0 && totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md p-6 shadow-elev-1">
                {/* Stats & Items per page */}
                <div className="flex flex-wrap items-center justify-between w-full gap-4 text-xs text-slate-500 border-b border-slate-100 pb-4">
                  <div>
                    Affichage de <span className="font-bold text-slate-800">{(page - 1) * limit + 1}</span> à{" "}
                    <span className="font-bold text-slate-800">{Math.min(page * limit, total)}</span> sur{" "}
                    <span className="font-bold text-brand-600">{total.toLocaleString("fr-FR")}</span> véhicules disponibles
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Par page :</span>
                    {[24, 48, 96].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => changeLimit(sz)}
                        className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                          limit === sz
                            ? "bg-brand-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                    <button
                      onClick={() => changeLimit(2000)}
                      className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                        limit >= 1000
                          ? "bg-brand-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Tous ({total})
                    </button>
                  </div>
                </div>

                {/* Numbered pagination */}
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={page <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-brand-300 hover:text-brand-600 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
                    title="Première page"
                  >
                    «
                  </button>
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-600 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </button>

                  {/* Page number buttons */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2))
                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                        acc.push("...");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      typeof item === "string" ? (
                        <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
                          •••
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => goToPage(item)}
                          className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-bold transition-all ${
                            page === item
                              ? "bg-brand-600 text-white shadow-sm ring-2 ring-brand-600/30"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-600 shadow-xs"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-600 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={page >= totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-brand-300 hover:text-brand-600 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
                    title="Dernière page"
                  >
                    »
                  </button>
                </div>

                {/* Load More Button for Infinite Expansion */}
                {page < totalPages && (
                  <button
                    onClick={loadMoreCars}
                    disabled={loadingMore}
                    className="btn-secondary w-full max-w-sm flex items-center justify-center gap-2 py-3 font-semibold text-brand-700 border-brand-200 bg-brand-50/50 hover:bg-brand-50 shadow-xs"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                        Chargement de la page {page + 1}...
                      </span>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Charger {Math.min(limit, total - cars.length)} véhicules de plus (Page {page + 1}/{totalPages})
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {previewCar && (
        <CarPreview3DModal
          isOpen={!!previewCar}
          onClose={() => setPreviewCar(null)}
          carTitle={`${previewCar.make} ${previewCar.model}`}
        />
      )}
    </div>
  );
}
