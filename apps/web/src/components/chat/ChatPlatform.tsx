"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Fuel, Gauge, Send, Sparkles, ArrowRight, ShieldCheck,
  RefreshCw, Menu, X, Search, GitCompareArrows, User,
  Trash2, MessageCircle, Plus, Pause, Phone, MessageSquare,
} from "lucide-react";
import CarImage from "@/components/CarImage";
import Logo from "@/components/Logo";
import VoiceInput from "@/components/VoiceInput";
import { addHistory, getHistory, clearHistory } from "@/lib/history";
import { intentToSearchParams } from "@/lib/nlp";
import VehicleDrawer from "./VehicleDrawer";
import ComparisonPanel from "./ComparisonPanel";
import MarkdownMessage from "./MarkdownMessage";
import SkeletonCard from "./SkeletonCard";
import EmptyState from "./EmptyState";
import ThinkingWaves from "./ThinkingWaves";
import { type ChatMessage, type ChatCar } from "@/types";

function InventoryBadge({ type }: { type?: string }) {
  if (!type) return null;
  return (
    <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${type === "new" ? "bg-sky-100 text-sky-700" : "bg-corporate/5 text-corporate"}`}>
      {type === "new" ? "Neuf" : "Occasion"}
    </span>
  );
}

function MessageTimestamp() {
  const now = new Date();
  return (
    <span className="mt-1 block text-[10px] text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
      {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

interface ChatPlatformProps {
  showSidebar?: boolean;
  fullscreen?: boolean;
}

export default function ChatPlatform({ showSidebar = false, fullscreen = true }: ChatPlatformProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState<ChatCar[] | null>(null);
  const [resultLimit, setResultLimit] = useState(4);
  const [searching, setSearching] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [thinkingPhase, setThinkingPhase] = useState<"analyse" | "recherche" | "classement">("analyse");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Conversation history for the API
  const [apiHistory, setApiHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  // Advisor state persistence for the API
  const [advisorState, setAdvisorState] = useState<{ collected: Record<string, any>; progress: number }>({ collected: {}, progress: 0 });

  // Active criteria chips (derived from advisorState)
  const activeCriteria: string[] = Object.entries(advisorState.collected)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => {
      const labels: Record<string, string> = {
        body: "Type", fuel: "Carburant", brand: "Marque", model: "Modèle",
        transmission: "Boîte", city: "Ville", budget_max: "Budget max",
        budget_min: "Budget min", inventory: "Statut", min_year: "Année min", max_km: "Km max",
      };
      return `${labels[k] || k}: ${String(v)}`;
    });

  // Drawer state
  const [drawerVehicle, setDrawerVehicle] = useState<ChatCar | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Comparison state
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setMessages([{
      id: idRef.current++,
      role: "bot",
      text: "Bonjour ! 👋 Je suis **Thiqti**, votre assistant automobile intelligent.\n\nComment puis-je vous aider ? Dites-moi simplement ce que vous cherchez :\n\n- 🔍 **Une voiture** — decrivez votre ideal\n- 💡 **Un conseil** — fiabilite, comparatifs, prix\n- 📊 **Comparer** — \"Toyota vs Hyundai\"\n\nJe parle **francais et darija** 🇲🇦 — \"bghit SUV mazot b 300 000 DH\" par exemple.",
    }]);
  }, []);

  useEffect(() => {
    setHistory(getHistory());
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, results, searching]);

  const fetchResults = useCallback(async (query: string, intentParams?: Record<string, string | number | undefined>) => {
    setSearching(true);
    setThinkingPhase("analyse");
    // Animate through phases
    const phaseTimer1 = setTimeout(() => setThinkingPhase("recherche"), 600);
    const phaseTimer2 = setTimeout(() => setThinkingPhase("classement"), 1200);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      // Apply structured intent params when available
      if (intentParams) {
        for (const [k, v] of Object.entries(intentParams)) {
          if (v !== undefined && v !== null) params.set(k, String(v));
        }
      }
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur reseau");
      const data = await res.json();
      setResults((data.results || []) as ChatCar[]);
      setResultLimit(4);
    } catch {
      setResults([]);
    } finally {
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
      setThinkingPhase("analyse");
      setSearching(false);
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([{
      id: idRef.current++,
      role: "bot",
      text: "Nouvelle conversation ! 🔄\n\nDecrivez-moi la voiture de vos reves ou posez-moi une question.",
    }]);
    setApiHistory([]);
    setAdvisorState({ collected: {}, progress: 0 });
    setQuickReplies([]);
    setResults(null);
    setStreaming(false);

    setInput("");
    setCompareIds([]);
    setDrawerOpen(false);
    setDrawerVehicle(null);
  }, []);

  const handleSend = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || streaming) return;

    // Abort any previous request
    abortRef.current?.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    // Add user message
    const userMsg: ChatMessage = { id: idRef.current++, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setResults(null);
    setQuickReplies([]);
    setStreaming(true);


    addHistory(text);
    setHistory(getHistory());

    const newHistory = [...apiHistory, { role: "user" as const, content: text }];
    setApiHistory(newHistory);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: newHistory.slice(0, -1), advisorState }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || "Erreur serveur");
      }

      let data: {
        reply?: string;
        criteria?: Record<string, unknown> | null;
        search?: boolean;
        quickReplies?: string[];
        advisorState?: { collected?: Record<string, any>; progress?: number };
      } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Reponse invalide");
      }

      const replyText = data.reply ?? "";
      const shouldSearch = Boolean(data.search || (data.criteria && Object.values(data.criteria).some((v) => v !== null && v !== undefined)));

      // Save advisor state from server
      if (data.advisorState) {
        setAdvisorState({
          collected: data.advisorState.collected || {},
          progress: data.advisorState.progress || 0,
        });
      }

      // Create bot message
      const botMsgId = idRef.current++;
      setMessages((prev) => [...prev, { id: botMsgId, role: "bot", text: replyText }]);

      // Update API history
      setApiHistory((prev) => [...prev, { role: "assistant", content: replyText }]);

      // Show quick replies
      if (data.quickReplies?.length) setQuickReplies(data.quickReplies);

      // If a search was requested, fetch results using intent params
      if (shouldSearch && data.criteria) {
        const c = data.criteria;
        const queryParts: string[] = [];
        if (c.marque || c.brand) queryParts.push(String(c.marque || c.brand));
        if (c.modele || c.model) queryParts.push(String(c.modele || c.model));
        if (c.carrosserie || c.body) queryParts.push(String(c.carrosserie || c.body));
        if (c.motorisation || c.fuel) queryParts.push(String(c.motorisation || c.fuel));
        if (c.ville || c.city) queryParts.push(String(c.ville || c.city));
        const query = queryParts.join(" ").trim();
        // Use structured intent params for API search when available
        const intentParams = Object.keys(c).length > 0
          ? intentToSearchParams({
              fuel: (c.motorisation || c.fuel) as any || undefined,
              bodyType: (c.carrosserie || c.body) as any || undefined,
              brand: (c.marque || c.brand) as string || undefined,
              model: (c.modele || c.model) as string || undefined,
              city: (c.ville || c.city) as string || undefined,
              maxPrice: (c.budgetMax || c.budget_max) as number || undefined,
              maxMileage: (c.kmMax || c.max_km) as number || undefined,
              confidence: {},
            })
          : undefined;
        if (query) await fetchResults(query, intentParams);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => [...prev, {
          id: idRef.current++,
          role: "bot",
          text: "Oups, une erreur est survenue. 🔄 Reessayez ou decrivez-moi directement votre voiture ideale.",
        }]);
      }
    } finally {
      setStreaming(false);
    }
  }, [streaming, apiHistory, fetchResults]);

  const handleSelectVehicle = useCallback((car: ChatCar) => {
    setDrawerVehicle(car);
    setDrawerOpen(true);
  }, []);

  const handleToggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  const handleRemoveCompare = useCallback((id: string) => {
    setCompareIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const compareVehicles = results?.filter((c) => compareIds.includes(c.id)) || [];
  const visibleResults = results ? results.slice(0, resultLimit) : null;
  const showWelcome = messages.length <= 1 && !results;

  const chatBody = (
    <div className={`flex flex-col ${fullscreen ? "h-[100dvh]" : "h-[700px]"}`} style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} role="region" aria-label="Assistant auto IA Thiqti">
      {/* Top bar */}
      <header className="flex shrink min-w-0 items-center gap-2 border-b border-slate-200 bg-white/90 backdrop-blur-xl px-3 py-3.5 shadow-sm sm:gap-3 sm:px-5">
        {showSidebar && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition lg:hidden" aria-label="Ouvrir l'historique">
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Logo size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-bold text-slate-900">Thiqti Assistant IA</h1>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              En ligne
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500">Votre conseiller automobile intelligent pour le Maroc</p>
        </div>
        <div className="flex items-center gap-1.5">
          {compareIds.length > 0 && (
            <button onClick={() => setCompareOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-brand-50 border border-brand-200 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100">
              <GitCompareArrows className="h-3.5 w-3.5" />
              Comparer ({compareIds.length})
            </button>
          )}
          <Link href="/results" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 shadow-sm">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Recherche</span>
          </Link>
          <button onClick={reset} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Recommencer">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/50" role="log" aria-label="Conversation" aria-live="polite">
        {showWelcome ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/20">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Bonjour 👋</h2>
            <p className="mt-2 max-w-xs text-sm text-slate-500 leading-relaxed">
              Je peux t'aider à trouver ta voiture idéale.
              Décris-moi ce que tu cherches.
            </p>
            <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
              {[
                { label: "🚗 Familiale", value: "Je cherche une familiale" },
                { label: "💰 Budget", value: "Moins de 200 000 DH" },
                { label: "⛽ Diesel", value: "Diesel occasion" },
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => { setInput(s.value); handleSend(s.value); }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-[0.98]"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation */
          <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
            {messages.map((m) =>
              m.role === "bot" ? (
                <div key={m.id} className="group flex gap-3 animate-fade-in">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-2.5 text-sm text-slate-800">
                    {m.text ? (
                      <MarkdownMessage content={m.text} />
                    ) : (
                      <ThinkingWaves />
                    )}
                    <MessageTimestamp />
                  </div>
                </div>
              ) : (
                <div key={m.id} className="group flex justify-end animate-fade-in">
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-sm text-white">
                    {m.text}
                    <MessageTimestamp />
                  </div>
                </div>
              )
            )}

            {quickReplies.length > 0 && !searching && (
              <div className="flex flex-wrap gap-2 pt-2">
                {quickReplies.map((q) => (
                  <button key={q} onClick={() => handleSend(q)}
                    className="rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-600 hover:text-white shadow-sm"
                    disabled={streaming}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {activeCriteria.length > 0 && !searching && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {activeCriteria.map((chip) => (
                  <span key={chip} className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    {chip}
                    <button onClick={() => {
                      const [key] = chip.split(":");
                      const fieldMap: Record<string, string> = {
                        "Type": "body", "Carburant": "fuel", "Marque": "brand", "Modèle": "model",
                        "Boîte": "transmission", "Ville": "city", "Budget max": "budget_max",
                        "Budget min": "budget_min", "Statut": "inventory", "Année min": "min_year", "Km max": "max_km",
                      };
                      const field = fieldMap[key] || key;
                      const newCollected = { ...advisorState.collected };
                      delete newCollected[field];
                      setAdvisorState({ collected: newCollected, progress: advisorState.progress });
                    }} className="ml-0.5 rounded-full p-0.5 hover:bg-slate-200 transition" aria-label={`Retirer ${chip}`}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {searching && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <ThinkingWaves phase={thinkingPhase} progress={thinkingPhase === "analyse" ? 33 : thinkingPhase === "recherche" ? 66 : 95} />
                    <span className="text-xs font-medium text-slate-500">
                      {thinkingPhase === "analyse" ? "Analyse de votre demande..." : thinkingPhase === "recherche" ? "Recherche en cours..." : "Classement des résultats..."}
                    </span>
                  </div>
                  <SkeletonCard variant="inline" />
                  <SkeletonCard variant="inline" />
                </div>
              </div>
            )}

            {results && !searching && (
              <div className="pt-2">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <MessageCircle className="h-3.5 w-3.5 text-brand-600" />
                  {results.length > 0 ? `${visibleResults?.length} véhicules trouvés` : "Aucun résultat exact"}
                </div>
                {results.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {visibleResults?.map((car) => (
                        <div key={car.id}
                          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer transition hover:border-brand-200"
                          onClick={() => handleSelectVehicle(car)}>
                          <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
                            <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-32 sm:aspect-auto">
                              <CarImage src={car.image} sources={car.photos} alt={car.title} make={car.make} model={car.model} bodyType={car.bodyType} className="h-full w-full object-cover transition group-hover:scale-105 duration-500" />
                              <div className="absolute left-1.5 top-1.5"><InventoryBadge type={car.inventoryType} /></div>
                              <div className="absolute right-1.5 top-1.5">
                                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${car.score >= 85 ? "bg-emerald-100 text-emerald-700" : car.score >= 70 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                                  {car.score}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-1 flex-col min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="truncate text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{car.title}</h4>
                                {car.reputation?.verified && <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />}
                              </div>
                              <p className="mt-0.5 text-xs text-slate-500">{car.year} · {car.km.toLocaleString("fr-FR")} km · {car.fuel}</p>
                              <div className="mt-auto flex items-center justify-between pt-1">
                                <span className="text-base font-bold text-price-600">{car.priceFormatted}</span>
                                <span className="text-[11px] text-slate-400">{car.city}</span>
                              </div>
                              <span className="mt-1 inline-block w-fit rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{car.source}</span>
                            </div>
                          </div>
                          {/* Mobile CTAs — visible on small screens, hidden on desktop */}
                          <div className="flex sm:hidden items-center gap-2 border-t border-slate-100 pt-2 -mx-1 px-1">
                            {car.contact?.whatsappHref && (
                              <a href={car.contact.whatsappHref} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2d7a4f] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#246640]">
                                <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                              </a>
                            )}
                            {car.contact?.phoneHref && (
                              <a href={car.contact.phoneHref}
                                onClick={(e) => e.stopPropagation()}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700 transition hover:bg-brand-100">
                                <Phone className="h-3.5 w-3.5" /> Appeler
                              </a>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); handleToggleCompare(car.id); }}
                              className={`rounded-xl border p-2 text-xs font-bold transition ${compareIds.includes(car.id) ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 text-slate-500 hover:border-brand-600 hover:text-brand-600 bg-white"}`}>
                              <GitCompareArrows className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {/* Desktop compare button — hidden on mobile */}
                          <button onClick={(e) => { e.stopPropagation(); handleToggleCompare(car.id); }}
                            className={`hidden sm:flex self-start rounded-xl border p-2 text-xs font-bold transition ${compareIds.includes(car.id) ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 text-slate-500 hover:border-brand-600 hover:text-brand-600 bg-white"}`}>
                            <GitCompareArrows className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {visibleResults && visibleResults.length < results.length && (
                      <button onClick={() => setResultLimit((n) => Math.max(n + 4, 10))}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100">
                        Voir plus d&apos;options <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <EmptyState type="no-results" title="Aucune correspondance" description="Essayez d'élargir votre budget ou de modifier vos critères." />
                )}
                {results.length > 0 && (
                  <Link href={`/results?q=${encodeURIComponent(results.map((r) => r.make).join(" "))}`}
                    className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm">
                    Voir tous les résultats dans le catalogue <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {results.length >= 2 && (
                  <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50/50 p-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-600">
                      Comparer ces véhicules
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {results.slice(0, 3).map((c) => (
                        <button key={c.id} onClick={() => handleToggleCompare(c.id)}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${compareIds.includes(c.id) ? "border-brand-600 bg-brand-600 text-white" : "border-brand-200 bg-white text-brand-700 hover:bg-brand-100"}`}>
                          {c.make} {c.model}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vehicle Drawer */}
      <VehicleDrawer vehicle={drawerVehicle as any} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onCompare={handleToggleCompare} />

      {/* Comparison Panel */}
      <ComparisonPanel vehicles={compareVehicles as any} isOpen={compareOpen} onClose={() => setCompareOpen(false)} onRemove={handleRemoveCompare} />
    </div>
  );

  // ---- Sidebar layout ----
  if (showSidebar) {
    return (
      <div className="flex h-[100dvh] overflow-hidden bg-slate-50" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-slate-200 bg-white lg:flex" role="complementary" aria-label="Historique">
          <div className="border-b border-slate-200 px-5 py-5">
            <Link href="/" className="group flex items-center gap-3">
              <Logo size="sm" />
              <div>
                <span className="font-serif text-2xl font-bold leading-none text-slate-900">Thiqti<span className="text-brand-600">.</span></span>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400">Assistant IA</span>
              </div>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <button onClick={reset} className="btn-primary btn-sm flex w-full items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> Nouvelle conversation
            </button>
            <p className="px-4 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Historique</p>
            {history.length === 0 ? (
              <p className="px-4 py-1 text-xs text-slate-400">Aucune conversation récente.</p>
            ) : (
              <div className="space-y-1">
                {history.slice(0, 20).map((q, i) => (
                  <button key={`${q}-${i}`} onClick={() => handleSend(q)}
                    className="flex w-full items-baseline gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 text-left truncate" title={q}>
                    <span className="text-[10px] text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                    <span className="truncate">{q}</span>
                  </button>
                ))}
                <button onClick={() => { clearHistory(); setHistory([]); }}
                  className="mt-3 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-3 w-3" /> Effacer
                </button>
              </div>
            )}
          </nav>
          <div className="border-t border-slate-200 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Invité</p>
                <p className="text-[10px] text-slate-400">Session locale</p>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-[280px] flex-col overflow-y-auto bg-white shadow-elev-4">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
                <Logo size="sm" />
                <button onClick={() => setSidebarOpen(false)} className="rounded-xl border border-slate-200 p-2 text-slate-400"><X className="h-5 w-5" /></button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <button onClick={() => { reset(); setSidebarOpen(false); }}
                  className="btn-primary btn-sm flex w-full items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Nouvelle conversation
                </button>
                <div className="mt-4 space-y-1">
                  {history.slice(0, 20).map((q, i) => (
                    <button key={`${q}-${i}`} onClick={() => { handleSend(q); setSidebarOpen(false); }}
                      className="flex w-full items-baseline gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-left">
                      <span className="text-[10px] text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                      <span className="truncate">{q}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        )}

        <div className="flex-1 lg:pl-[264px]">{chatBody}</div>
      </div>
    );
  }

  return <div className="h-[100dvh] bg-slate-50">{chatBody}</div>;
}
