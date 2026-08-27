"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles, CarFront, ShieldCheck, ArrowRight, MapPin,
  ExternalLink, Search, Star, TrendingUp,
  Heart, GitCompareArrows,   Brain, Database, SlidersHorizontal, Gauge,
  MessageCircle,
} from "lucide-react";
import { usePageView } from "@/lib/useAnalytics";
import CarImage from "@/components/CarImage";
import Logo from "@/components/Logo";
import Hero3D from "@/components/three/Hero3D";
import TiltCard from "@/components/ui/TiltCard";
import CardZoomLink from "@/components/ui/CardZoomLink";
import ScoreBadge from "@/components/ui/ScoreBadge";
import VoiceInput from "@/components/VoiceInput";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";

interface HomeCar {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  priceFormatted: string;
  km: number;
  city: string;
  image: string;
  photos?: string[];
  score: number;
  fuel?: string;
  source?: string;
  url?: string;
  bodyType?: string;
  contact?: { name?: string; phone?: string; phoneHref?: string; whatsappHref?: string; url?: string };
  reputation?: { verified?: boolean; trustBadge?: boolean; views?: number; label?: string };
}

const HERO_CARS = [
  { brand: "Dacia", model: "Sandero", tagline: "La best-seller au Maroc", price: "139 900 DH", color: "#1e3a5f" },
  { brand: "Renault", model: "Clio", tagline: "Citadine premium", price: "179 900 DH", color: "#334155" },
  { brand: "Peugeot", model: "2008", tagline: "SUV compact électrique", price: "265 000 DH", color: "#1e293b" },
  { brand: "Toyota", model: "Yaris Cross", tagline: "Hybride intelligente", price: "285 000 DH", color: "#475569" },
];

const CATEGORIES = [
  { label: "Citadine", icon: "🚗", count: "120+", color: "from-brand-600 to-brand-700" },
  { label: "SUV", icon: "🚙", count: "200+", color: "from-slate-700 to-slate-800" },
  { label: "Berline", icon: "🏎️", count: "80+", color: "from-slate-500 to-slate-600" },
  { label: "Electrique", icon: "⚡", count: "30+", color: "from-sky-500 to-sky-600" },
  { label: "Pick-up", icon: "🛻", count: "40+", color: "from-amber-500 to-amber-600" },
  { label: "Utilitaire", icon: "🚐", count: "25+", color: "from-blue-500 to-blue-600" },
];

const STATS = [
  { value: 1750, suffix: "+", label: "Véhicules indexés", icon: CarFront },
  { value: 3, suffix: "", label: "Langues supportées", icon: Sparkles },
  { value: 8, suffix: "", label: "Critères de scoring", icon: Star },
];

function AnimatedCounter({ value, suffix }: { value: number, suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const duration = 2000;
        const step = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          setCount(Math.floor(progress * value));
          if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function HomePage() {
  usePageView("home");
  const [cars, setCars] = useState<HomeCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    
    async function loadCars() {
      try {
        const homeRes = await fetch("/api/home");
        if (!homeRes.ok) throw new Error("home failed");
        const homeData = await homeRes.json();
        if (mounted) {
          setCars((homeData.results || []) as HomeCar[]);
          setLoading(false);
        }
      } catch {
        try {
          const searchRes = await fetch("/api/search");
          const searchData = await searchRes.json();
          if (mounted) setCars((searchData.results || []) as HomeCar[]);
        } catch {
          if (mounted) setCars([]);
        }
        if (mounted) setLoading(false);
      }
    }

    loadCars();

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_CARS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const featured = cars.slice(0, 6);
  const premium = cars.filter((c) => c.score >= 85).slice(0, 4);
  const recent = cars.slice(6, 12);

  return (
    <div className="page-enter min-h-screen">
      {/* ---- NAVIGATION ---- */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex shrink-0 items-center">
            <Logo size="sm" />
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {[
              { href: "/", label: "Accueil" },
              { href: "/results", label: "Rechercher" },
              { href: "/compare", label: "Comparer" },
              { href: "/favorites", label: "Favoris" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("thiqti:open-command-palette"))}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-elev-1 transition hover:border-brand-300 hover:text-brand-600 md:flex"
              title="Recherche rapide (Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Recherche rapide</span>
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                Ctrl K
              </kbd>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Assistant IA</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ---- HERO SECTION ---- */}
      <section className="relative overflow-hidden pt-16 pb-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-700 to-slate-950 animate-mesh-breathing" style={{ backgroundSize: '200% 200%' }} />
          <Hero3D className="hidden lg:block absolute inset-0 h-full w-full opacity-80" />
          <div data-scroll-depth="0.09" className="absolute left-[15%] top-[20%] h-80 w-80 rounded-full bg-sky-400/10 blur-[120px]" />
          <div data-scroll-depth="0.05" className="absolute bottom-[30%] right-[10%] h-64 w-64 rounded-full bg-sky-300/5 blur-[100px]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/40 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="lg:pl-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Moteur de recherche intelligent
                </span>
              </div>

              <h1 className="mt-6 text-display text-center text-3xl font-bold leading-[1.05] text-white md:text-left md:text-5xl lg:text-6xl">
                Trouvez{" "}
                <span className="gradient-text">votre</span>
                <br className="hidden md:block" />
                voiture.
              </h1>

              <p className="mt-6 max-w-lg text-center text-lg text-sky-100/75 md:text-left">
                Décrivez simplement ce que vous cherchez. Thiqti analyse les annonces,
                compare les critères et vous recommande les meilleures correspondances.
              </p>

              <div className="w-full max-w-lg mx-auto mt-8">
                <div className="focus-depth flex max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-1.5 backdrop-blur-xl shadow-2xl transition-shadow duration-300">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-200/60" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery.trim()) {
                          window.location.href = `/results?q=${encodeURIComponent(searchQuery)}`;
                        }
                      }}
                      placeholder='Ex: "Dacia Sandero moins de 150k"...'
                      className="w-full bg-transparent py-3.5 pl-12 pr-11 text-sm text-white placeholder-sky-200/50 outline-none"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <VoiceInput onTranscript={(text) => setSearchQuery(text)} className="[&_button]:text-sky-200/80 [&_button]:hover:text-white" />
                    </div>
                  </div>
                  <Link
                    href={searchQuery.trim() ? `/results?q=${encodeURIComponent(searchQuery)}` : "/results"}
                    className="btn-press flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-md transition hover:bg-sky-50 active:scale-[0.98]"
                  >
                    <Search className="h-4 w-4" />
                    Rechercher
                  </Link>
                </div>

                <Link
                  href="/chat"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-100"
                >
                  <MessageCircle className="h-4 w-4" />
                  Parler avec Thiqti
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "SUV diesel automatique Casa",
                  "BMW moins de 250k",
                  "Familiale diesel 180k DH",
                  "bghit Toyota Corolla",
                  "Voiture électrique",
                  "Pick-up occasion",
                ].map((chip) => (
                  <Link
                    key={chip}
                    href={`/results?q=${encodeURIComponent(chip)}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-sky-200/70 backdrop-blur-sm transition hover:border-sky-400/30 hover:bg-sky-400/10 hover:text-white"
                  >
                    {chip}
                  </Link>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                {STATS.map((stat, i) => (
                  <motion.div 
                    key={stat.label} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="text-2xl font-bold text-white leading-tight">
                      <AnimatedCounter value={stat.value as number} suffix={stat.suffix || ""} />
                    </div>
                    <p className="mt-1 text-xs text-sky-200/60 leading-tight">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative h-[480px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={HERO_CARS[heroIndex].brand + HERO_CARS[heroIndex].model}
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -12 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-8 backdrop-blur-xl shadow-2xl">
                      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-sky-400/20 to-transparent blur-[80px]" />
                      <div className="relative">
                        <span className="inline-block rounded-lg bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-300">
                          {HERO_CARS[heroIndex].brand}
                        </span>
                        <h3 className="mt-4 font-serif text-4xl font-bold text-white">{HERO_CARS[heroIndex].model}</h3>
                        <p className="mt-2 text-sky-100/70">{HERO_CARS[heroIndex].tagline}</p>
                        <p className="mt-4 text-2xl font-bold text-sky-200">{HERO_CARS[heroIndex].price}</p>
                        <div className="mt-6 flex gap-3">
                          <Link
                            href={`/results?q=${encodeURIComponent(HERO_CARS[heroIndex].brand + " " + HERO_CARS[heroIndex].model)}`}
                            className="btn-press flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
                          >
                            Voir les offres
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                  {HERO_CARS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === heroIndex ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                {/* Badges flottants */}
                <div className="pointer-events-none absolute -left-10 -top-5 hidden xl:block">
                  <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/15 px-4 py-3 shadow-elev-3 backdrop-blur-xl">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/20 text-sky-300">
                      <TrendingUp className="h-4.5 w-4.5" />
                    </span>
                    <span>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-sky-200/70">Prix moyen</span>
                      <span className="block text-sm font-bold text-white">245 000 DH</span>
                    </span>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-6 bottom-16 hidden animate-pulse-soft xl:block" style={{ animationDelay: "1.2s" }}>
                  <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/15 px-4 py-3 shadow-elev-3 backdrop-blur-xl">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/20 text-violet-300">
                      <Sparkles className="h-4.5 w-4.5" />
                    </span>
                    <span>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-sky-200/70">Algorithme TOPSIS</span>
                      <span className="block text-sm font-bold text-white">8 critères pondérés</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- MOBILE HERO CARD (hidden on desktop) ---- */}
      <section className="lg:hidden bg-gradient-to-br from-sky-900 via-slate-900 to-slate-950 px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-sky-400/20 to-transparent blur-[60px]" />
          <div className="relative">
            <span className="inline-block rounded-lg bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-300">
              {HERO_CARS[heroIndex].brand}
            </span>
            <h3 className="mt-3 font-serif text-2xl font-bold text-white">{HERO_CARS[heroIndex].model}</h3>
            <p className="mt-1 text-sm text-sky-100/70">{HERO_CARS[heroIndex].tagline}</p>
            <p className="mt-3 text-lg font-bold text-sky-200">{HERO_CARS[heroIndex].price}</p>
            <Link
              href={`/results?q=${encodeURIComponent(HERO_CARS[heroIndex].brand + " " + HERO_CARS[heroIndex].model)}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-95"
            >
              Voir les offres
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {HERO_CARS.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === heroIndex ? "w-5 bg-sky-400" : "w-1.5 bg-white/30"}`}
                aria-label={`Voir ${HERO_CARS[i].brand} ${HERO_CARS[i].model}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---- DISCLAIMER ---- */}
      <div className="bg-amber-50 border-y border-amber-200/60">
        <div className="mx-auto max-w-7xl px-6 py-3 text-center">
          <p className="text-xs text-amber-700">
            <strong>Prototype de démonstration.</strong> Les données affichées (1 750 véhicules) sont un jeu de données seed représentatif du pipeline d&apos;agrégation. L&apos;architecture est conçue pour ingérer des données en temps réel depuis des sources tierces.
          </p>
        </div>
      </div>

      {/* ---- PIPELINE NLP → TOPSIS ---- */}
      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">Architecture technique</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-slate-900 md:text-4xl">
            Comment Thiqti <span className="text-brand-600">trouve</span> votre voiture
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-slate-500">
            Le LLM comprend votre demande. Le moteur TOPSIS classe objectivement. Les données déterminent les résultats.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {[
            {
              step: "1",
              icon: Search,
              title: "Requête naturelle",
              desc: "FR, Arabe, Darija ou Arabizi",
              example: '"bghit SUV diesel max 180k f Casa"',
              color: "text-sky-600 bg-sky-50 border-sky-200",
            },
            {
              step: "2",
              icon: Brain,
              title: "Extraction NLP",
              desc: "Critères structurés automatiquement",
              example: "{ carrosserie: SUV, carburant: diesel, ville: Casablanca, budget: 180000 }",
              color: "text-accent-600 bg-accent-50 border-accent-200",
            },
            {
              step: "3",
              icon: SlidersHorizontal,
              title: "Scoring TOPSIS",
              desc: "8 critères pondérés selon l'intention",
              example: "Prix (28%), Année (17%), Km (10%), Carburant (14%), Marque (8%)...",
              color: "text-brand-600 bg-brand-50 border-brand-200",
            },
            {
              step: "4",
              icon: Gauge,
              title: "Recommandation",
              desc: "Classement + explications par critère",
              example: "1. Peugeot 3008 — 94% : ✓ Diesel ✓ Prix compétitif △ Km élevé",
              color: "text-emerald-600 bg-emerald-50 border-emerald-200",
            },
          ].map((item) => (
            <div key={item.step} className={`relative rounded-2xl border p-5 ${item.color}`}>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold shadow-sm">{item.step}</span>
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
              <div className="mt-3 rounded-lg bg-white/60 p-2.5 font-mono text-[10px] leading-relaxed text-slate-700 border border-white">
                {item.example}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          L&apos;IA générative n&apos;est pas responsable seule de la recommandation. Le LLM interprète l&apos;intention, tandis que le moteur déterministe effectue le ranking.
        </p>
      </section>

      {/* ---- CATEGORIES ---- */}
      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl">
            Explorer par <span className="text-brand-600">catégorie</span>
          </h2>
          <p className="mt-3 text-slate-500">Trouvez le type de voiture qui vous correspond</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={`/results?q=${encodeURIComponent(cat.label)}`}
              className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:border-brand-300 hover:shadow-md md:flex-col md:text-center"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{cat.label}</p>
                <p className="text-xs text-slate-500">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- MARQUES POPULAIRES ---- */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">Marques populaires</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-slate-900 md:text-3xl">Explorez par constructeur</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {["Dacia", "Renault", "Peugeot", "Volkswagen", "Toyota", "Hyundai", "Kia", "MG", "BYD", "Mercedes"].map((brand) => (
            <Link
              key={brand}
              href={`/results?q=${encodeURIComponent(brand)}`}
              className="min-h-[44px] rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-elev-1 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 hover:shadow-elev-2"
              aria-label={`Rechercher ${brand}`}
            >
              {brand}
            </Link>
          ))}
        </div>
      </section>

      {/* ---- FEATURED CARS ---- */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-brand-50 border border-brand-100 px-3 py-1 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Sélection IA TOPSIS</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl">
              Les meilleures <span className="text-brand-600">offres</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500">Sélectionnées par notre moteur de classement multi-critères</p>
          </div>
          <Link href="/results" className="flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-800 transition">
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((car, index) => (
              <TiltCard key={car.id} className="h-full rounded-2xl" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elev-1 transition-all duration-200 hover:border-brand-200 hover:shadow-elev-3">
                  <CardZoomLink href={`/vehicle/${car.id}`} className="block">
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      <CarImage
                        src={car.image}
                        sources={car.photos}
                        alt={car.title}
                        make={car.make}
                        model={car.model}
                        bodyType={car.bodyType}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                      {car.reputation?.verified && (
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/90 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                            <ShieldCheck className="h-3 w-3" />
                            Vérifiée
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-3 right-3">
                        <span className="rounded-md bg-black/40 px-2 py-1 text-[10px] font-bold text-white/90 backdrop-blur-sm">
                          {car.source}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {car.title}
                        </h3>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <CarFront className="h-3 w-3 text-slate-400" />
                          {car.year}
                        </span>
                        <span>·</span>
                        <span className="font-medium">{car.km.toLocaleString("fr-FR")} km</span>
                        <span>·</span>
                        <span className="font-medium">{car.fuel}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {car.city}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xl font-bold text-price-600">{car.priceFormatted}</span>
                      </div>
                    </div>
                  </CardZoomLink>

                  {/* Boutons interactifs positionnés en overlay (hors du <a>) */}
                  <div className="absolute right-3 top-3 z-10">
                    <ScoreBadge percent={car.score} />
                  </div>

                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(car.id); }}
                    aria-label={favorites.includes(car.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                    className={`absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-sm transition ${
                      favorites.includes(car.id)
                        ? "bg-red-500 text-white shadow-sm"
                        : "bg-black/30 text-white/90 hover:bg-black/50"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(car.id) ? "fill-current" : ""}`} />
                  </button>

                  <div className="absolute bottom-5 right-5 z-10 flex gap-1.5">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(car.id); }}
                      className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                        compareList.includes(car.id)
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-brand-300 hover:text-brand-600"
                      }`}
                      title="Comparer"
                    >
                      <GitCompareArrows className="h-3.5 w-3.5" />
                    </button>
                    {car.url && car.url !== "#" && (
                      <a
                        href={car.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-brand-300 hover:text-brand-600"
                        title="Voir l&#39;annonce originale"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </section>

      {/* ---- PROMO BANNER ---- */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-800 to-slate-950 p-10 md:p-14 shadow-elev-4">
          <div data-scroll-depth="0.07" className="absolute right-0 top-0 h-80 w-80 rounded-full bg-sky-400/10 blur-[100px]" />
          <div data-scroll-depth="0.04" className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-sky-300/5 blur-[80px]" />
          <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <div className="flex-1">
              <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
                Parlez, l&apos;IA <span className="text-sky-300">trouve</span>.
              </h2>
              <p className="mt-3 max-w-lg text-sky-100/75">
                Notre assistant intelligent comprend le français et le darija.
                Décrivez simplement votre voiture idéale et obtenez les meilleures offres instantanément.
              </p>
            </div>
            <Link
              href="/chat"
              className="btn-press flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-700 shadow-lg transition hover:shadow-xl hover:bg-sky-50 active:scale-[0.98]"
            >
              <Sparkles className="h-5 w-5" />
              Essayer l&apos;assistant
            </Link>
          </div>
        </div>
      </section>

      {/* ---- RECENT LISTINGS ---- */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl">
              Dernières <span className="text-brand-600">annonces</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500">Les ajouts les plus récents du marché</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((car) => (
              <CardZoomLink
                key={car.id}
                href={`/vehicle/${car.id}`}
                className="group flex gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-elev-1 transition hover:border-brand-200 hover:shadow-elev-2"
              >
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <CarImage
                    src={car.image}
                    sources={car.photos}
                    alt={car.title}
                    make={car.make}
                    model={car.model}
                    bodyType={car.bodyType}
                    className="h-full w-full object-cover transition group-hover:scale-105 duration-300"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <h4 className="truncate text-sm font-bold text-slate-900 group-hover:text-brand-600 transition">{car.title}</h4>
                    <p className="text-xs text-slate-500">{car.year} · {car.km.toLocaleString("fr-FR")} km</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-price-600">{car.priceFormatted}</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <MapPin className="h-3 w-3" />{car.city}
                    </span>
                  </div>
                </div>
              </CardZoomLink>
            ))}
          </div>
        </section>
      )}

      {/* ---- FOOTER ---- */}
      <footer className="border-t border-slate-200 bg-white" role="contentinfo">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Logo size="md" />
              <p className="mt-3 text-sm text-slate-500">
                La référence de l&apos;achat auto intelligent au Maroc.
              </p>
            </div>
            <nav aria-label="Navigation principale">
              <h4 className="mb-3 text-sm font-bold text-slate-900">Navigation</h4>
              <div className="flex flex-col gap-2">
                {[
                  { href: "/", label: "Accueil" },
                  { href: "/results", label: "Rechercher" },
                  { href: "/compare", label: "Comparer" },
                  { href: "/favorites", label: "Favoris" },
                  { href: "/chat", label: "Assistant IA" },
                ].map((item) => (
                  <Link key={item.label} href={item.href} className="text-sm text-slate-500 hover:text-brand-600 transition">{item.label}</Link>
                ))}
              </div>
            </nav>
            <div>
              <h4 className="mb-3 text-sm font-bold text-slate-900">Catégories</h4>
              <div className="flex flex-col gap-2">
                {["Citadines", "SUV", "Berlines", "Electriques", "Hybrides"].map((cat) => (
                  <Link key={cat} href={`/results?q=${encodeURIComponent(cat)}`} className="text-sm text-slate-500 hover:text-brand-600 transition">{cat}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-slate-900">À propos</h4>
              <p className="text-sm text-slate-500">
                Thiqti utilise le NLP multilingue et l&apos;algorithme TOPSIS pour analyser les critères et vous recommander les meilleures offres automobiles au Maroc.
              </p>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            &copy; 2026 Thiqti. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
