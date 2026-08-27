"use client";

import { useState, useEffect, useRef, useMemo, useCallback, FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Fuel, Gauge, Calendar, ChevronLeft, Share2, CheckCircle2, MessageSquare, MessageCircle, AlertTriangle, Clock, TrendingUp, TrendingDown, BadgeCheck, Globe, ExternalLink, Facebook, Instagram, Newspaper, Store, Eye, Phone, Calculator, CircleDollarSign, Car, Heart } from "lucide-react";
import CarImage from "@/components/CarImage";
import SafetyBadge, { safetyLabelOf } from "@/components/SafetyBadge";
import SellerContact from "@/components/SellerContact";
import { useToast } from "@/components/Toast";
import ConfidenceRadar, { type RadarAxis } from "@/components/ui/ConfidenceRadar";
import PriceTimeline from "@/components/ui/PriceTimeline";
import TiltCard from "@/components/ui/TiltCard";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerReveal from "@/components/StaggerReveal";
import { type CarListing, type ReputationData, type MarocReputationData, type MarocBrandData } from "@/types";

const MIN_REVIEWS = 30;
const RELIABILITY_COLORS = {
  elevee: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-600" },
  moyenne: { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-600" },
  faible: { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-600" },
};

export default function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const [car, setCar] = useState<CarListing | null>(null);
  const [activeTab, setActiveTab] = useState<"specs" | "reputation" | "offers">("specs");
  const [fav, setFav] = useState(false);
  const [error, setError] = useState(false);
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [loadingRep, setLoadingRep] = useState(false);
  const [mainImg, setMainImg] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewScore, setReviewScore] = useState(8);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const { showToast } = useToast();
  const favLoadedRef = useRef(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!car?.photos || car.photos.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    const photos = car.photos;
    const idx = photos.indexOf(mainImg || car.image);
    if (dx < 0 && idx < photos.length - 1) setMainImg(photos[idx + 1]);
    else if (dx > 0 && idx > 0) setMainImg(photos[idx - 1]);
  }, [car, mainImg]);

  useEffect(() => {
    const abortController = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        let slug: string | undefined;
        try {
          const resolved = await Promise.resolve(params);
          slug = resolved?.slug;
        } catch {
          // Fallback: extract slug from URL path
          if (typeof window !== "undefined") {
            const parts = window.location.pathname.split("/");
            slug = parts[parts.length - 1];
          }
        }
        if (!slug || cancelled) return;

        const res = await fetch(`/api/vehicle/${encodeURIComponent(slug)}`, { signal: abortController.signal });
        if (!res.ok) throw new Error("Erreur");
        const found = await res.json();

        if (cancelled) return;
        if (found && !found.error) {
          setCar(found);
          setMainImg(found.image);
        } else {
          setError(true);
        }

        const saved = localStorage.getItem("thiqti_favorites");
        if (saved) {
          const favList: string[] = JSON.parse(saved);
          setFav(favList.includes(slug));
        }
        favLoadedRef.current = true;
      } catch (err) {
        if (!cancelled && !(err instanceof DOMException && err.name === "AbortError")) {
          setError(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [params]);

  useEffect(() => {
    if (!car) return;
    setLoadingRep(true);
    fetch(`/api/reputation?make=${encodeURIComponent(car.make)}&model=${encodeURIComponent(car.model)}`)
      .then((r) => r.json()).then((data) => setReputation(data)).catch(() => {}).finally(() => setLoadingRep(false));
  }, [car]);

  useEffect(() => {
    if (!car) return;
    document.title = `${car.year} ${car.make} ${car.model} — ${car.priceFormatted} | Thiqti`;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Car",
      name: `${car.year} ${car.make} ${car.model}`,
      brand: { "@type": "Brand", name: car.make },
      model: car.model,
      vehicleModelDate: String(car.year),
      mileageFromOdometer: car.km ? { "@type": "QuantitativeValue", value: car.km, unitCode: "KMT" } : undefined,
      fuelType: car.fuel,
      vehicleTransmission: car.transmission,
      offers: {
        "@type": "Offer",
        price: car.price,
        priceCurrency: "MAD",
        availability: "https://schema.org/InStock",
        url: `https://thiqti.com/vehicle/${car.id}`,
      },
      image: car.image || car.photos?.[0],
      description: `${car.year} ${car.make} ${car.model} ${car.fuel} ${car.city} — ${car.priceFormatted}`,
    };
    const existing = document.getElementById("jsonld-vehicle");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "jsonld-vehicle";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [car]);

  useEffect(() => {
    if (!car || !favLoadedRef.current) return;
    const saved = localStorage.getItem("thiqti_favorites");
    const list: string[] = saved ? JSON.parse(saved) : [];
    const updated = fav ? (list.includes(car.id) ? list : [...list, car.id]) : list.filter((id) => id !== car.id);
    localStorage.setItem("thiqti_favorites", JSON.stringify(updated));
  }, [fav, car]);

  async function submitReview(e: FormEvent) {
    e.preventDefault();
    if (!car || reviewText.trim().length < 5) { setReviewError("Merci d'ecrire un avis d'au moins 5 caracteres."); return; }
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const res = await fetch("/api/reputation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ make: car.make, model: car.model, year: car.year, fuel: car.fuel, bodyType: car.bodyType, transmission: car.transmission, text: reviewText.trim(), score: reviewScore, sentiment: reviewScore >= 7 ? "positive" : reviewScore <= 4 ? "negative" : "neutral" }),
      });
      if (!res.ok) throw new Error("Envoi impossible");
      const data = await res.json();
      setReputation(data);
      setReviewText("");
      showToast("Merci, votre avis a ete enregistre !", "success");
    } catch { setReviewError("Impossible d'enregistrer l'avis."); } finally { setReviewSubmitting(false); }
  }

  if (error) return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-slate-900">Véhicule introuvable</p>
        <p className="mt-1 text-sm text-slate-500">Cette annonce n&apos;est peut-être plus disponible.</p>
      </div>
      <Link href="/results" className="btn-primary min-h-[44px] px-6">Voir tous les résultats</Link>
    </div>
  );

  if (!car) return (
    <div className="min-h-[100dvh] bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 h-4 w-32 animate-pulse rounded-lg bg-slate-200" />
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-4">
            <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
            <div className="flex gap-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 w-20 animate-pulse rounded-xl bg-slate-200" />)}</div>
            <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
          </div>
          <div className="w-full space-y-4 lg:w-80">
            <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );

  const hasEnoughReviews = reputation && reputation.dataAvailable === true;

  return (
    <div className="page-enter px-6 py-8 bg-slate-50 pb-24 lg:pb-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/results" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Retour aux résultats
        </Link>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            {/* Main image card */}
            <ScrollReveal>
              <div className="card overflow-hidden shadow-elev-2 hover-lift">
              <div className="relative overflow-hidden bg-slate-100">
                <div
                  ref={galleryRef}
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                  className="aspect-[4/3] w-full"
                >
                  <CarImage
                    src={mainImg || car.image}
                    sources={car.photos}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    make={car.make}
                    model={car.model}
                    bodyType={car.bodyType}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Photo counter */}
                {car.photos && car.photos.length > 1 && (
                  <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {car.photos.indexOf(mainImg || car.image) + 1} / {car.photos.length}
                  </div>
                )}
                {/* Back button */}
                <Link
                  href="/results"
                  className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
                  aria-label="Retour"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
                {/* Favorite button */}
                <button
                  onClick={() => setFav(!fav)}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
                  aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Heart className={`h-5 w-5 ${fav ? "fill-red-500 text-red-500" : ""}`} />
                </button>
              </div>

              <div className="px-4 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{car.year} {car.make} {car.model}</h1>
                    <p className="mt-1 text-sm text-slate-500">{car.fuel} · {car.km?.toLocaleString("fr-FR")} km · {car.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-price-600">{car.priceFormatted}</p>
                  </div>
                </div>
              </div>
              </div>
            </ScrollReveal>

            {/* Tabs */}
            <ScrollReveal delay={150}>
              <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 scrollbar-none">
                {[
                  { key: "specs", label: "Caractéristiques" },
                  { key: "reputation", label: "Réputation" },
                  { key: "offers", label: "Offres" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "border-b-2 border-brand-600 text-brand-600"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Tab content */}
            <ScrollReveal delay={200}>
              <div className="mt-6">
              {activeTab === "specs" && (
                <div className="card p-6" role="tabpanel" aria-label="Caractéristiques">
                  <h2 className="mb-4 text-lg font-bold text-slate-900">Caracteristiques</h2>
                  <StaggerReveal className="grid grid-cols-2 gap-2 px-4 md:grid-cols-4" staggerMs={80}>
                    {[
                      { label: "Kilometrage", value: `${car.km.toLocaleString()} km`, icon: Gauge },
                      { label: "Annee", value: String(car.year), icon: Calendar },
                      { label: "Carburant", value: car.fuel, icon: Fuel },
                      { label: "Ville", value: car.city, icon: MapPin },
                    ].map((s) => (
                      <TiltCard key={s.label} maxTilt={5} className="spec-card-3d">
                        <div className="rounded-xl bg-slate-50 p-4">
                          <s.icon className="mb-2 h-5 w-5 text-corporate" />
                          <p className="text-xs text-slate-500">{s.label}</p>
                          <p className="font-semibold text-slate-900">{s.value}</p>
                        </div>
                      </TiltCard>
                    ))}
                  </StaggerReveal>
                  <ScrollReveal delay={300}>
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs text-slate-500">Securite au crash test</p>
                        <span className="rounded-md bg-corporate/5 px-2 py-0.5 text-[11px] font-medium text-corporate">{car.safety?.className || ""}</span>
                      </div>
                      <SafetyBadge safety={car.safety} full size={16} />
                      <p className="mt-2 text-xs text-slate-500">{safetyLabelOf(car.safety)}</p>
                    </div>
                  </ScrollReveal>
                </div>
              )}

              {activeTab === "reputation" && (
                <div className="card p-6 shadow-elev-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                      <BadgeCheck className="h-5 w-5 text-brand-600" /> Réputation réelle de l&apos;annonce
                    </h2>
                    <p className="mb-3 text-xs text-slate-500">Informations vérifiées directement sur {car.source} pour cette annonce.</p>
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {car.reputation?.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <BadgeCheck className="h-3.5 w-3.5" /> {car.reputation.label || "Annonce vérifiée"}
                        </span>
                      )}
                      {car.reputation?.trustBadge && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-1 text-xs font-semibold text-brand-700">
                          <BadgeCheck className="h-3.5 w-3.5" /> Badge de confiance
                        </span>
                      )}
                      {typeof car.reputation?.rating5 === "number" && car.reputation.rating5 > 0 && (car.reputation.reviews ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {car.reputation.rating5}/5 · {car.reputation.reviews} avis
                        </span>
                      )}
                      {typeof car.reputation?.views === "number" && car.reputation.views > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                          <Eye className="h-3.5 w-3.5" /> {car.reputation.views.toLocaleString("fr-FR")} vues
                        </span>
                      )}
                    </div>
                    <SellerContact contact={car.contact} reputation={car.reputation} />
                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-6">
                    <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
                      <MessageSquare className="h-5 w-5 text-brand-600" /> Avis des utilisateurs
                    </h2>
                    <p className="mb-4 text-xs text-slate-500">
                      Avis réellement déposés sur Thiqti. Le score n&apos;est publié qu&apos;à partir de {MIN_REVIEWS} avis.
                    </p>

                    {loadingRep ? (
                      <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}</div>
                    ) : !reputation ? (
                      <div className="rounded-2xl border border-amber-500/20 bg-amber-50 p-4">
                        <p className="text-sm font-medium text-amber-800">Données en cours de collecte pour ce modèle.</p>
                      </div>
                    ) : !hasEnoughReviews ? (
                      <ReputationInsufficient reputation={reputation} />
                    ) : (
                      <ReputationSummary reputation={reputation} />
                    )}

                    <div className="mt-6 border-t border-slate-200 pt-6">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <MessageSquare className="h-4 w-4 text-brand-600" /> Donner votre avis
                      </h3>
                      <form onSubmit={submitReview} className="space-y-3">
                        <div>
                          <p className="mb-2 text-xs font-medium text-slate-600">Votre note sur 10</p>
                          <div className="flex flex-wrap gap-1.5">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <button key={n} type="button" onClick={() => setReviewScore(n)} className={`h-9 w-9 rounded-xl text-xs font-bold transition ${reviewScore === n ? "bg-brand-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} maxLength={1000} placeholder="Votre expérience avec ce modèle..." className="textarea" />
                        {reviewError && <p className="text-xs text-danger-600">{reviewError}</p>}
                        <div className="flex items-center gap-3">
                          <button type="submit" disabled={reviewSubmitting} className="btn-primary">
                            {reviewSubmitting ? "Envoi..." : "Publier mon avis"}
                          </button>
                          {reputation && <span className="text-[11px] text-slate-400">{reputation.volume.total} avis collectés sur {MIN_REVIEWS}</span>}
                        </div>
                      </form>
                    </div>

                    <div className="mt-6 border-t border-slate-200 pt-6">
                      <MarocReputationBlock maroc={reputation?.maroc ?? null} make={car.make} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "offers" && (
                <div className="card p-6 shadow-elev-2">
                  <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Calculator className="h-5 w-5 text-brand-600" />
                    Simulateur de financement
                  </h2>
                  <FinancingSimulator price={car.price} />
                  <div className="mt-6 border-t border-slate-200 pt-6">
                    <p className="text-xs text-slate-400">
                      Calcul indicatif basé sur le prix affiché. Le taux et les conditions définitifs dépendent de votre organisme de financement.
                    </p>
                  </div>
                </div>
              )}
              </div>
            </ScrollReveal>
          </div>

          {/* Sidebar */}
          <div className="w-full shrink-0 lg:w-80">
            <div className="sticky top-24 space-y-4">
              <ScrollReveal delay={100}>
                <ScoreReliefCard score={car.score} />
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <ConfidenceRadarCard car={car} reputation={reputation} />
              </ScrollReveal>
              <ScrollReveal delay={300}>
                <PriceTimeline make={car.make} model={car.model} price={car.price} year={car.year} />
              </ScrollReveal>

              <button onClick={() => setFav(!fav)} className="btn-secondary btn-press w-full py-3 text-sm font-semibold">
                {fav ? "Retirer des favoris" : "Ajouter aux favoris"}
              </button>

              {/* ── Espace Contact Vendeur 3D ── */}
              <ScrollReveal delay={400}>
                <div className="card-3d specular-shine p-6 border-brand-200/80 shadow-elev-3">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 border border-brand-200 text-brand-600 shadow-xs">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-slate-900">Contact Vendeur</h3>
                      <p className="text-xs text-slate-500">{car.city || "Maroc"} · {car.inventoryType === "neuf" ? "Concession Officielle" : "Occasion Vérifiée"}</p>
                    </div>
                  </div>
                  <span className="badge-3d px-2.5 py-1 text-[10px] text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> Vérifié
                  </span>
                </div>

                <div className="mb-4 rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                  <p className="text-[11px] text-slate-500">Vendeur / Concession</p>
                  <p className="font-bold text-slate-900 text-sm">{car.contact?.name || car.source || "Concessionnaire Maroc"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Disponibilité immédiate · Réponse sous 15 min</p>
                </div>

                <div className="space-y-2.5">
                  <a
                    href={`https://wa.me/${(car.contact?.whatsappHref || "212661001122").replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Salam / Bonjour, je vous contacte depuis Thiqti au sujet de l'annonce : ${car.title} (${car.priceFormatted}) à ${car.city}. Est-elle toujours disponible pour une visite/essai ?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-3d-whatsapp w-full py-3 text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4 fill-white" />
                    Contacter sur WhatsApp
                  </a>
                  <a
                    href={car.contact?.phoneHref || `tel:${(car.contact?.phone || "+212 522 669 900").replace(/\s+/g, "")}`}
                    className="btn-3d-phone w-full py-3 text-sm flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Phone className="h-4 w-4 text-slate-700" />
                    Appeler {car.contact?.phone || "+212 522 669 900"}
                  </a>
                </div>
              </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA — visible only on small screens */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{car.title}</p>
            <p className="text-xs font-bold text-price-600">{car.priceFormatted}</p>
          </div>
          <a
            href={car.contact?.whatsappHref || `https://wa.me/212522669900?text=${encodeURIComponent(`Bonjour, je suis intéressé par ${car.title} (${car.priceFormatted})`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#2d7a4f] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#246640] active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={car.contact?.phoneHref || `tel:${(car.contact?.phone || "+212 522 669 900").replace(/\s+/g, "")}`}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100 active:scale-95"
          >
            <Phone className="h-4 w-4" />
          </a>
          <button
            onClick={() => setFav(!fav)}
            className={`flex shrink-0 items-center justify-center rounded-xl border p-2.5 transition ${fav ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 bg-white text-slate-400 hover:text-red-500"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className={`h-4 w-4 ${fav ? "fill-red-500 text-red-500" : ""}`}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ScoreReliefCard — Badge de score TOPSIS en relief 3D avec
 * anneau de remplissage animé (signature Thiqti).
 */
/**
 * JustePrixBadge — Indicate visuellement si le prix est inférieur,
aligné ou supérieur à la moyenne du marché pour ce modèle.
 */
function JustePrixBadge({ priceStats, price }: { priceStats: { min: number; avg: number; max: number; current: number; position: string }; price: number }) {
  const isUnder = price < priceStats.avg;
  const isOver = price > priceStats.avg;
  const pct = priceStats.avg > 0 ? Math.round(((price - priceStats.avg) / priceStats.avg) * 100) : 0;
  const savings = priceStats.avg - price;

  return (
    <div className={`mt-3 inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold ${
      isUnder ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
      : isOver ? "border border-amber-500/30 bg-amber-500/10 text-amber-700"
      : "border border-slate-200 bg-slate-50 text-slate-600"
    }`}>
      {isUnder ? (
        <TrendingDown className="h-4 w-4" />
      ) : isOver ? (
        <TrendingUp className="h-4 w-4" />
      ) : (
        <CircleDollarSign className="h-4 w-4" />
      )}
      <span>
        {isUnder && savings > 0 && `Économisez ${savings.toLocaleString("fr-FR")} DH — `}
        {isUnder ? "Juste prix : en-dessous de la moyenne" : isOver ? `Positionnement premium (+${Math.abs(pct)}% vs moyenne)` : "Aligné sur le prix moyen du marché"}
      </span>
      {priceStats.min !== priceStats.max && (
        <span className="ml-1 text-[10px] opacity-70">
          (marché : {priceStats.min.toLocaleString("fr-FR")} — {priceStats.max.toLocaleString("fr-FR")} DH)
        </span>
      )}
    </div>
  );
}

/**
 * FinancingSimulator — Calculateur de mensualité 100% client.
 * M = P * r / (1 - (1+r)^-n) où P = montant financé, r = taux mensuel, n = durée en mois.
 */
function FinancingSimulator({ price }: { price: number }) {
  const [depositPct, setDepositPct] = useState(20);
  const [months, setMonths] = useState(60);
  const [rate, setRate] = useState(4.5);

  const financed = useMemo(() => Math.max(0, price * (1 - depositPct / 100)), [price, depositPct]);
  const monthlyRate = rate / 100 / 12;
  const monthly = useMemo(() => {
    if (financed <= 0) return 0;
    if (monthlyRate === 0) return financed / months;
    return financed * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)));
  }, [financed, monthlyRate, months]);
  const totalCost = useMemo(() => monthly * months, [monthly, months]);
  const totalInterest = useMemo(() => totalCost - financed, [totalCost, financed]);

  const formatMAD = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} DH`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            Apport ({depositPct}%)
          </label>
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={depositPct}
            onChange={(e) => setDepositPct(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
          <p className="mt-1 text-right text-xs font-semibold text-slate-900">{formatMAD(price * depositPct / 100)}</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            Durée ({months} mois)
          </label>
          <input
            type="range"
            min={12}
            max={84}
            step={12}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
          <p className="mt-1 text-right text-xs font-semibold text-slate-900">{Math.round(months / 12)} an{months >= 24 ? "s" : ""}</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            Taux ({rate}%)
          </label>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
          <p className="mt-1 text-right text-xs font-semibold text-slate-900">{rate}% / an</p>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Mensualité estimée</p>
          <p className="mt-2 font-serif text-4xl font-bold text-brand-700">
            {monthly > 0 ? formatMAD(monthly) : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">pendant {months} mois</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-brand-200/50 pt-4">
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Montant financé</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{formatMAD(financed)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Coût total</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{formatMAD(totalCost)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Intérêts</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{formatMAD(totalInterest)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreReliefCard({ score }: { score: number }) {
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFilled(true);
      return;
    }
    const t = window.setTimeout(() => setFilled(true), 150);
    return () => window.clearTimeout(t);
  }, []);

  const R = 34;
  const CIRC = 2 * Math.PI * R;
  const color = score >= 85 ? "#059669" : score >= 70 ? "#D97706" : "#DC2626";

  return (
    <div className="score-relief card p-5">
      <h3 className="mb-4 font-bold text-slate-900">Score IA TOPSIS</h3>
      <div className="flex items-center gap-4">
        <div className="score-ring relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
            <circle cx="40" cy="40" r={R} fill="none" stroke="#E2E8F0" strokeWidth="7" />
            <circle
              cx="40"
              cy="40"
              r={R}
              fill="none"
              stroke={color}
              strokeWidth="7"
              strokeLinecap="round"
              className="score-ring-value"
              strokeDasharray={CIRC}
              strokeDashoffset={filled ? CIRC * (1 - score / 100) : CIRC}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold" style={{ color }}>
              {score}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">/100</span>
          </div>
        </div>
        <div className="space-y-1.5 text-xs">
          <p className="font-semibold text-slate-900">
            {score >= 85 ? "Excellent rapport qualité/prix" : score >= 70 ? "Bonne offre globale" : "À comparer avant achat"}
          </p>
          <p className="leading-relaxed text-slate-500">
            Score calculé sur le prix, l&apos;année, le kilométrage et votre recherche.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * ConfidenceRadarCard — "Radar de confiance" : visualisation 3D
 * interactive des critères du score (signature Thiqti).
 */
function ConfidenceRadarCard({
  car,
  reputation,
}: {
  car: CarListing;
  reputation: ReputationData | null;
}) {
  const axes: RadarAxis[] = useMemo(() => {
    const kmScore = Math.max(0, Math.min(100, 100 * (1 - car.km / 250000)));
    const yearScore = Math.max(0, Math.min(100, ((car.year - 2000) / 26) * 100));
    const safetyScore = car.safety?.stars ? (car.safety.stars / 5) * 100 : 55;
    const list: RadarAxis[] = [
      { label: "Score IA", value: car.score, weight: 0.3 },
      { label: "Kilométrage", value: kmScore, weight: 0.1 },
      { label: "Année", value: yearScore, weight: 0.2 },
      { label: "Sécurité", value: safetyScore },
    ];
    if (reputation?.dataAvailable && typeof reputation.avgScore === "number") {
      list.push({ label: "Réputation", value: Math.min(100, reputation.avgScore * 10) });
    }
    return list;
  }, [car.score, car.km, car.year, car.safety?.stars, reputation?.dataAvailable, reputation?.avgScore]);

  return (
    <div className="card p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Radar de confiance</h3>
        <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-600">
          3D interactif
        </span>
      </div>
      <p className="mb-1 text-xs text-slate-500">Survolez un critère pour sa valeur.</p>
      <ConfidenceRadar axes={axes} />
    </div>
  );
}

function MarocReputationBlock({ maroc, make }: { maroc: MarocReputationData | null; make: string }) {  const brand = maroc?.brand ?? null;
  const tests = maroc?.tests ?? [];
  const socialIcon = (network: string) => network === "instagram" ? <Instagram className="h-3.5 w-3.5" /> : <Facebook className="h-3.5 w-3.5" />;

  if (!brand) return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><Globe className="h-4 w-4 text-corporate" /> Presence & sources au Maroc</div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs text-slate-500">Aucune source officielle marocaine verifiee pour <strong className="text-slate-900">{make}</strong>.</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Globe className="h-4 w-4 text-corporate" /> Presence & sources au Maroc</div>
        <span className="text-[10px] text-slate-400">Verifie le {brand.verifiedAt || "—"}</span>
      </div>
      {brand.distributor && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-corporate/5 px-3 py-2">
          <BadgeCheck className="h-4 w-4 shrink-0 text-corporate" />
          <p className="text-xs text-slate-900">Importateur officiel : <strong>{brand.distributor}</strong></p>
        </div>
      )}
      <div className="space-y-2">
        {brand.officialSite && (
          <a href={brand.officialSite.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-900 transition hover:bg-slate-100">
            <Globe className="h-3.5 w-3.5 shrink-0 text-corporate" /> Site officiel · {brand.officialSite.label}
            <ExternalLink className="ml-auto h-3 w-3 text-slate-400" />
          </a>
        )}
        {brand.resellers && (
          <a href={brand.resellers.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-900 transition hover:bg-slate-100">
            <Store className="h-3.5 w-3.5 shrink-0 text-corporate" /> {brand.resellers.label}
            <ExternalLink className="ml-auto h-3 w-3 text-slate-400" />
          </a>
        )}
        {brand.socials.map((s, i) => (
          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-900 transition hover:bg-slate-100">
            {socialIcon(s.network)} {s.label}
            {typeof s.followers === "number" && <span className="ml-1 text-slate-400">· {s.followers.toLocaleString("fr-FR")} abonnes</span>}
            <ExternalLink className="ml-auto h-3 w-3 text-slate-400" />
          </a>
        ))}
      </div>
      {tests.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <Newspaper className="h-3.5 w-3.5" /> Essais Moteur.ma
          </div>
          <div className="space-y-2">
            {tests.map((t, i) => (
              <a key={i} href={t.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-900 transition hover:bg-slate-100">
                <span className="flex items-center gap-2"><Newspaper className="h-3.5 w-3.5 shrink-0 text-corporate" /> {t.title} <ExternalLink className="ml-auto h-3 w-3 text-slate-400" /></span>
                {t.verdict && <span className="mt-1 block text-[11px] text-slate-500">{t.verdict}</span>}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReputationInsufficient({ reputation }: { reputation: ReputationData }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-700">Donnees insuffisantes</p>
            <p className="text-xs text-amber-600/70 mt-1">{reputation.totalReviews} avis collectes sur {MIN_REVIEWS} minimum. Le score sera publie des que {MIN_REVIEWS} avis seront disponibles.</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 p-4 text-center">
          <p className="text-2xl font-bold text-corporate">{reputation.volume.total}</p>
          <p className="text-xs text-slate-500">Avis collectes</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-corporate transition-all" style={{ width: `${Math.min(100, (reputation.volume.total / MIN_REVIEWS) * 100)}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-slate-400">{reputation.volume.total}/{MIN_REVIEWS}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 text-center">
          <div className="flex items-center justify-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-600" /><span className="text-lg font-bold text-emerald-600">{reputation.volume.positive}</span></div>
          <p className="text-xs text-slate-500">Positifs</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 text-center">
          <div className="flex items-center justify-center gap-1"><TrendingDown className="h-3 w-3 text-red-600" /><span className="text-lg font-bold text-red-600">{reputation.volume.negative}</span></div>
          <p className="text-xs text-slate-500">Negatifs</p>
        </div>
      </div>
    </div>
  );
}

function ReputationSummary({ reputation }: { reputation: ReputationData }) {
  const relColors = RELIABILITY_COLORS[reputation.reliability || "moyenne"];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-center">
          <p className="text-4xl font-extrabold text-corporate">{reputation.avgScore}</p>
          <p className="text-xs text-slate-500">sur 10</p>
        </div>
        <div className="h-12 w-px bg-slate-200" />
        <div>
          <p className="text-sm text-slate-900">Sur <strong>{reputation.totalReviews}</strong> avis</p>
          <p className="text-xs text-slate-500">des {reputation.windowMonths} derniers mois</p>
        </div>
        <div className="h-12 w-px bg-slate-200" />
        <div className={`rounded-lg border ${relColors.border} ${relColors.bg} px-3 py-1.5`}>
          <div className="flex items-center gap-1.5"><BadgeCheck className={`h-4 w-4 ${relColors.text}`} /><span className={`text-xs font-medium ${relColors.text}`}>Fiabilite {reputation.reliabilityLabel}</span></div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">Points forts</p>
          <div className="flex flex-wrap gap-2">{reputation.positiveTags?.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3 w-3" />{tag}</span>)}</div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-600">Points faibles</p>
          <div className="flex flex-wrap gap-2">{reputation.negativeTags?.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-700"><AlertTriangle className="h-3 w-3" />{tag}</span>)}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {reputation.categories.map((cat) => (
          <div key={cat.name} className="rounded-xl bg-slate-50 p-4 text-center">
            <div className="relative mx-auto h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="25" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200" />
                <circle cx="30" cy="30" r="25" fill="none" strokeWidth="4" strokeDasharray={`${(cat.score || 0) * 15.7} 157`} className={`${cat.score && cat.score >= 8 ? "text-emerald-600" : cat.score && cat.score >= 6 ? "text-amber-600" : "text-red-600"}`} stroke="currentColor" />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${cat.score && cat.score >= 8 ? "text-emerald-600" : cat.score && cat.score >= 6 ? "text-amber-600" : "text-red-600"}`}>
                {cat.score !== null ? cat.score : "N/A"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{cat.name}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-emerald-600" /><span className="text-emerald-600 font-medium">{reputation.volume.positive}</span><span className="text-slate-500">positifs</span></div>
        <div className="flex items-center gap-2 text-sm"><TrendingDown className="h-4 w-4 text-red-600" /><span className="text-red-600 font-medium">{reputation.volume.negative}</span><span className="text-slate-500">negatifs</span></div>
        <div className="flex items-center gap-2 text-sm"><MessageSquare className="h-4 w-4 text-slate-400" /><span className="text-slate-500 font-medium">{reputation.volume.neutral}</span><span className="text-slate-500">neutres</span></div>
      </div>
      <div className="rounded-xl bg-slate-50 p-3 flex items-center gap-3">
        <Clock className="h-4 w-4 text-slate-400" />
        <p className="text-xs text-slate-500">Fenetre d&apos;observation : {reputation.windowMonths} mois · Derniere MAJ : {reputation.lastUpdated}</p>
      </div>
      <div>
        <h3 className="font-semibold mb-4 text-slate-900">Extraits d&apos;avis</h3>
        <div className="space-y-3">
          {reputation.excerpts.map((review, i) => (
            <div key={i} className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-corporate/5 text-xs font-bold text-corporate">{String.fromCharCode(65 + (i % 26))}</div>
                  <p className="text-xs text-slate-500">Avis anonyme</p>
                </div>
                <span className={`rounded-lg px-2 py-1 text-xs font-bold ${review.score >= 8 ? "bg-emerald-500/20 text-emerald-600" : review.score >= 6 ? "bg-amber-500/20 text-amber-600" : "bg-red-500/20 text-red-600"}`}>{review.score}/10</span>
              </div>
              <p className="text-sm text-slate-900">&laquo;{review.text}&raquo;</p>
              <div className="mt-2">
                {review.sentiment === "positive" ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Avis positif</span> : review.sentiment === "negative" ? <span className="flex items-center gap-1 text-xs text-red-600"><AlertTriangle className="h-3 w-3" /> Avis negatif</span> : <span className="flex items-center gap-1 text-xs text-slate-500"><MessageSquare className="h-3 w-3" /> Avis mitigé</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
