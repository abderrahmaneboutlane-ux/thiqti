"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Fuel, Gauge, MapPin, MessageCircle, RefreshCw, Send, Sparkles, ArrowRight, ShieldCheck, X, ExternalLink } from "lucide-react";
import CarImage from "@/components/CarImage";
import Logo from "@/components/Logo";
import SellerContact from "@/components/SellerContact";
import VoiceInput from "@/components/VoiceInput";
import { addHistory } from "@/lib/history";
import { type ChatMessage, type ChatCar } from "@/types";
import {
  ChatState, BotReply, createInitialState, initialMessage, answer,
  buildSearchRequest, recommendationText, criteriaSummary, criteriaLine,
} from "@/lib/chatbot";

function InventoryBadge({ type }: { type?: string }) {
  if (!type) return null;
  return (
    <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${type === "new" ? "bg-sky-100 text-sky-700" : "bg-corporate/5 text-corporate"}`}>
      {type === "new" ? "Neuf" : "Occasion"}
    </span>
  );
}

interface ChatAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  inline?: boolean;
  heightClassName?: string;
}

export default function ChatAssistant({ isOpen, onClose, inline = false, heightClassName = "h-[620px]" }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [botState, setBotState] = useState<ChatState>(() => createInitialState());
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [results, setResults] = useState<ChatCar[] | null>(null);
  const [resultLimit, setResultLimit] = useState(4);
  const [searching, setSearching] = useState(false);
  const [input, setInput] = useState("");
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = initialMessage();
    setMessages([{ id: idRef.current++, role: "bot", text: init.text }]);
    setQuickReplies(init.quickReplies);
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, results, searching]);

  const reqParams = useCallback((state: ChatState) => {
    const req = buildSearchRequest(state);
    const params = new URLSearchParams();
    if (req.q) params.set("q", req.q);
    if (req.type) params.set("type", req.type);
    const f = req.filters;
    if (f.minPrice != null) params.set("minPrice", String(f.minPrice));
    if (f.maxPrice != null) params.set("maxPrice", String(f.maxPrice));
    if (f.minYear != null) params.set("minYear", String(f.minYear));
    if (f.maxKm != null) params.set("maxKm", String(f.maxKm));
    return params;
  }, []);

  const fetchResultsFor = useCallback(async (state: ChatState, more = false) => {
    setSearching(true);
    try {
      const params = reqParams(state);
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur reseau");
      const data = await res.json();
      const list = (data.results || []) as ChatCar[];
      setResults(list);
      setResultLimit((n) => (more ? Math.max(n + 4, 10) : 4));
      if (list.length === 0) {
        setMessages((prev) => [...prev, { id: idRef.current++, role: "bot", text: recommendationText([], state) }]);
      }
    } catch {
      setResults([]);
      setMessages((prev) => [...prev, { id: idRef.current++, role: "bot", text: recommendationText([], state) }]);
    }
    setSearching(false);
  }, [reqParams]);

  const reset = useCallback(() => {
    const init = initialMessage();
    setBotState(init.state);
    setQuickReplies(init.quickReplies);
    setResults(null);
    setResultLimit(4);
    setSearching(false);
    setMessages([{ id: idRef.current++, role: "bot", text: init.text }]);
  }, []);

  const handleSend = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text || searching) return;
    if (text.toLowerCase() === "recommencer") { reset(); return; }
    if (text.toLowerCase() === "voir les resultats") { fetchResultsFor(botState, true); return; }

    if (text.toLowerCase() !== "voir plus" && text.toLowerCase() !== "voir tous" && text.toLowerCase() !== "afficher plus") {
      addHistory(text);
    }

    const reply: BotReply = answer(botState, text);
    setBotState(reply.state);
    setQuickReplies(reply.quickReplies);
    setResults(null);
    setMessages((prev) => [...prev, { id: idRef.current++, role: "user", text }, { id: idRef.current++, role: "bot", text: reply.text }]);
    if (reply.search) {
      fetchResultsFor(reply.state, /voir (?:plus|tous)|afficher plus|plus de r.sultats|d'autres options/i.test(text));
    }
  }, [botState, searching, reset, fetchResultsFor]);

  const resultsUrl = (() => {
    const qs = reqParams(botState).toString();
    return `/results${qs ? `?${qs}` : ""}`;
  })();

  const chips = criteriaSummary(botState);
  const visibleResults = results ? results.slice(0, resultLimit) : null;

  const chatBody = (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <Logo size="sm" />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            Assistant Thiqti
            <span className="h-2 w-2 rounded-full bg-sky-500" />
          </div>
          <p className="text-xs text-slate-500">Votre conseiller auto — decrivez votre envie</p>
        </div>
        <button onClick={reset} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors" title="Recommencer">
          <RefreshCw className="h-4 w-4" />
        </button>
        {!inline && (
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Recommandations */}
      <div className="border-b border-slate-200 px-5 py-3">
        {chips.length > 0 ? (
          <>
            <p className="text-xs text-slate-500">
              D&apos;apres vos criteres : <span className="text-corporate font-medium">{criteriaLine(botState)}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <span key={chip} className="chip text-[11px]">{chip}</span>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-500">Aucun critere — decrivez votre envie.</p>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((m) => m.role === "bot" ? (
          <div key={m.id} className="flex gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-corporate/5">
              <Sparkles className="h-4 w-4 text-corporate" />
            </div>
            <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-slate-700">
              {m.text}
            </div>
          </div>
        ) : (
          <div key={m.id} className="flex justify-end">
            <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-corporate px-4 py-3 text-sm leading-relaxed text-white">
              {m.text}
            </div>
          </div>
        ))}

        {searching && (
          <div className="flex gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-corporate/5"><Sparkles className="h-4 w-4 text-corporate" /></div>
            <div className="flex items-center gap-2 rounded-xl rounded-tl-sm border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-corporate" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-corporate [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-corporate [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {results && !searching && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <MessageCircle className="h-3.5 w-3.5 text-corporate" />
              {results.length > 0 ? `${visibleResults?.length} suggestions pour vous` : "Aucun resultat exact"}
            </div>
            {results.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {visibleResults?.map((car) => (
                    <div key={car.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-corporate/30 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                      <Link href={`/vehicle/${car.id}`} className="flex-1">
                        <div className="relative h-32 overflow-hidden bg-slate-50">
                          <CarImage src={car.image} sources={car.photos} alt={car.title} make={car.make} model={car.model} bodyType={car.bodyType} className="h-full w-full object-cover transition group-hover:scale-105 duration-500" />
                          <div className="absolute left-2 top-2"><InventoryBadge type={car.inventoryType} /></div>
                          {car.reputation?.verified && (
                            <div className="absolute bottom-2 left-2">
                              <span className="inline-flex items-center gap-1 rounded-lg border border-corporate/30 bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold text-corporate">
                                <ShieldCheck className="h-2.5 w-2.5" /> Verifiee
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="truncate text-sm font-semibold text-slate-900">{car.title}</h4>
                          <p className="mt-0.5 text-xs text-slate-500">{car.year} · {car.km.toLocaleString("fr-FR")} km</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-base font-bold text-slate-900">{car.priceFormatted}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${car.score >= 85 ? "text-emerald-600" : car.score >= 70 ? "text-amber-600" : "text-red-500"}`}>{car.score}</span>
                              <span className="flex items-center gap-1 text-[11px] text-slate-400"><MapPin className="h-3 w-3" />{car.city}</span>
                            </div>
                          </div>
                          <div className="mt-2"><SellerContact contact={car.contact} reputation={car.reputation} compact showButtons={false} /></div>
                        </div>
                      </Link>
                      {car.url && (
                        <div className="border-t border-slate-200 px-3 py-2.5">
                          <a href={car.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-semibold text-corporate transition hover:text-corporate-700">
                            <ExternalLink className="h-3 w-3" /> Voir sur {car.source || "la source"}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {visibleResults && visibleResults.length < results.length && (
                  <button onClick={() => handleSend("Voir plus")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-corporate/20 bg-corporate/5 px-4 py-2.5 text-sm font-semibold text-corporate transition hover:bg-corporate/10">
                    Voir plus d&apos;options <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Aucune correspondance exacte. Essayez d&apos;elargir le budget ou la carrosserie.
              </p>
            )}
            {results.length > 0 && (
              <Link href={resultsUrl} className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-corporate/20 bg-corporate/5 px-4 py-2.5 text-sm font-semibold text-corporate transition hover:bg-corporate/10">
                Voir tous les resultats <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Quick replies */}
      {quickReplies.length > 0 && !searching && (
        <div className="flex flex-wrap gap-2 border-t border-slate-200 px-5 py-3">
          {quickReplies.map((label) => (
            <button key={label} onClick={() => handleSend(label)} className="chip">{label}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-200 px-5 py-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Send className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { handleSend(input); setInput(""); } }}
              placeholder="Ecrivez votre reponse ici..." className="input-field pl-10" />
          </div>
          <VoiceInput onTranscript={(t) => { setInput(t); handleSend(t); }} />
          <button onClick={() => { handleSend(input); setInput(""); }} className="btn-primary flex items-center gap-2" disabled={searching}>
            <Send className="h-4 w-4" /> Envoyer
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
          <Gauge className="h-3 w-3" /><Fuel className="h-3 w-3" />
          Dialogue en francais et darija · Neuf et occasion · Prix en DH
        </p>
      </div>
    </>
  );

  if (inline) {
    return (
      <div className="w-full">
        <div className={`flex ${heightClassName} flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]`}>
          {chatBody}
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex w-full max-w-lg flex-col rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:h-[620px]">
        {chatBody}
      </div>
    </div>
  );
}
