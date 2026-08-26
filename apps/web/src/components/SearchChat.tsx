"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Fuel, MapPin, Heart, ArrowRight, Bot, User, ChevronRight } from "lucide-react";
import CarImage from "@/components/CarImage";
import Logo from "@/components/Logo";
import { type ChatMessage, type ChatCar } from "@/types";

interface SearchChatProps {
  initialQuery: string;
  onResults?: (cars: ChatCar[]) => void;
}

const QUICK_SUGGESTIONS = [
  { label: "SUV diesel pas cher", icon: "🚗" },
  { label: "Toyota hybride", icon: "🌿" },
  { label: "Citadine essence", icon: "🏙️" },
  { label: "Berline automatique", icon: "⚙️" },
];

export default function SearchChat({ initialQuery, onResults }: SearchChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState<ChatCar[] | null>(null);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [apiHistory, setApiHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("thiqti_favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("thiqti_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, results, streamedText]);

  const fetchResults = useCallback(async (query: string) => {
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      const cars = (data.results || []) as ChatCar[];
      setResults(cars);
      onResults?.(cars);
    } catch {
      setResults([]);
    }
  }, [onResults]);

  const handleSend = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || streaming) return;

    abortRef.current?.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    const userMsg: ChatMessage = { id: idRef.current++, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setResults(null);
    setStreaming(true);
    setStreamedText("");
    setInput("");
    setShowWelcome(false);

    const newHistory = [...apiHistory, { role: "user" as const, content: text }];
    setApiHistory(newHistory);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: apiHistory.slice(-10).map(m => ({ role: m.role === "assistant" ? "bot" : "user", text: m.content })) }),
        signal: abortController.signal,
      });

      if (!res.ok) throw new Error("Erreur serveur");

      const data = await res.json();
      const reply = data.reply || "Je n'ai pas bien compris. Pouvez-vous reformuler ?";
      const search = data.search === true;

      const botMsg: ChatMessage = { id: idRef.current++, role: "bot", text: reply };
      setMessages((prev) => [...prev, botMsg]);
      setApiHistory((prev) => [...prev, { role: "assistant", content: reply }]);

      if (search && data.criteria) {
        const parts: string[] = [];
        if (data.criteria.marque) parts.push(data.criteria.marque);
        if (data.criteria.carrosserie) parts.push(data.criteria.carrosserie);
        if (data.criteria.motorisation) parts.push(data.criteria.motorisation);
        if (data.criteria.ville) parts.push(data.criteria.ville);
        if (data.criteria.budgetMax) parts.push(`moins de ${data.criteria.budgetMax} dh`);
        const q = parts.join(" ");
        if (q) await fetchResults(q);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => [...prev, {
          id: idRef.current++,
          role: "bot",
          text: "Oups, une erreur est survenue. Réessayez ou décrivez-moi votre voiture idéale.",
        }]);
      }
    } finally {
      setStreaming(false);
      setStreamedText("");
    }
  }, [streaming, apiHistory, fetchResults]);

  useEffect(() => {
    if (!initializedRef.current && initialQuery) {
      initializedRef.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery, handleSend]);

  const toggleFav = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <Logo size="sm" />
        <div>
          <h3 className="font-semibold text-slate-900">Thiqti Assistant</h3>
          <p className="text-xs text-slate-500">Je vous aide à trouver la voiture idéale</p>
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: "500px" }}>

        {/* Welcome state — only shown before first message */}
        {showWelcome && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-corporate/10">
              <Bot className="h-8 w-8 text-corporate" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Bonjour ! Je suis votre assistant.</h3>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Décrivez votre voiture idéale en darija ou en français, je vous trouve les meilleures offres au Maroc.
            </p>
          </div>
        )}

        {/* Messages — asymmetric: bot gets avatar + larger bubble, user gets compact right-aligned */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "bot" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-corporate/10 text-corporate">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-corporate text-white rounded-br-md"
                  : "bg-slate-100 text-slate-800 rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-corporate text-white">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {/* Streaming text — with avatar */}
        {streaming && streamedText && (
          <div className="flex justify-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-corporate/10 text-corporate">
              <Bot className="h-4 w-4" />
            </div>
            <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-800">
              <p className="whitespace-pre-wrap">{streamedText}</p>
            </div>
          </div>
        )}

        {/* Typing indicator — custom animated dots with label */}
        {streaming && !streamedText && (
          <div className="flex justify-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-corporate/10 text-corporate">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3">
              <div className="flex gap-1">
                <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" style={{ animationDelay: "200ms" }} />
                <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" style={{ animationDelay: "400ms" }} />
              </div>
              <span className="text-xs text-slate-400">recherche...</span>
            </div>
          </div>
        )}

        {/* ── Results cards ────────────────────────────────── */}
        {results && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500 text-center">
              {results.length} voiture{results.length > 1 ? "s" : ""} trouvée{results.length > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {results.slice(0, 6).map((car) => (
                <Link
                  key={car.id}
                  href={`/vehicle/${car.id}`}
                  className="group block overflow-hidden rounded-xl border border-slate-100 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="relative h-32 overflow-hidden bg-slate-100">
                    <CarImage
                      src={car.image}
                      alt={car.title}
                      make={car.make}
                      model={car.model}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      sources={car.photos || []}
                    />
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(car.id); }}
                      className="absolute right-2 top-2 rounded-lg bg-white/90 p-1 text-slate-400 hover:text-corporate"
                    >
                      <Heart className={`h-3.5 w-3.5 ${favorites.includes(car.id) ? "fill-corporate text-corporate" : ""}`} />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-base font-bold text-price">{car.priceFormatted}</p>
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-corporate transition-colors">{car.title}</h4>
                    <p className="text-xs text-slate-500">{car.year} · {car.km.toLocaleString()} km</p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />{car.fuel}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{car.city}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {results.length > 6 && (
              <Link
                href={`/results?q=${encodeURIComponent(results.map(r => r.make).join(" "))}`}
                className="flex items-center justify-center gap-1 text-sm text-corporate hover:underline"
              >
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}

        {results && results.length === 0 && messages.length > 1 && (
          <div className="text-center py-4">
            <p className="text-sm text-slate-400">Aucune voiture trouvée pour cette recherche.</p>
            <p className="text-xs text-slate-400 mt-1">Essayez avec d&apos;autres critères.</p>
          </div>
        )}
      </div>

      {/* ── Quick Suggestions — inline interactive chips ────── */}
      {showWelcome && messages.length <= 1 && !streaming && (
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="mb-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Essayez</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((qr) => (
              <button
                key={qr.label}
                onClick={() => handleSend(qr.label)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:border-corporate hover:bg-corporate/5 hover:text-corporate transition-all"
              >
                <span>{qr.icon}</span>
                {qr.label}
                <ChevronRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ──────────────────────────────────────────── */}
      <div className="border-t border-slate-100 px-5 py-3">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Décrivez votre voiture idéale..."
            disabled={streaming}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-corporate focus:outline-none focus:ring-1 focus:ring-corporate disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-corporate text-white hover:bg-corporate/90 disabled:opacity-40 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
