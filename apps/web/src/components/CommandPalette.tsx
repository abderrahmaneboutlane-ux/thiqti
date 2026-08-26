"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  Heart,
  GitCompareArrows,
  Home,
  CarFront,
  CornerDownLeft,
} from "lucide-react";

interface PaletteAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  href: string;
}

const ACTIONS: PaletteAction[] = [
  { id: "home", icon: Home, label: "Accueil", hint: "Retour à la page principale", href: "/" },
  { id: "search", icon: Search, label: "Rechercher une voiture", hint: "Explorateur intelligent", href: "/results" },
  { id: "compare", icon: GitCompareArrows, label: "Comparer", hint: "Vos véhicules sélectionnés", href: "/compare" },
  { id: "favorites", icon: Heart, label: "Favoris", hint: "Vos coups de cœur", href: "/favorites" },
  { id: "chat", icon: Sparkles, label: "Assistant IA", hint: "Chat intelligent FR / Darija", href: "/chat" },
];

export const OPEN_COMMAND_PALETTE_EVENT = "thiqti:open-command-palette";

/**
 * CommandPalette — Recherche rapide globale (Ctrl+K / Cmd+K).
 * Navigation clavier complète : ↑↓ pour naviguer, Entrée pour ouvrir, Échap pour fermer.
 */
export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const openRef = useRef(open);
  const itemsRef = useRef<PaletteAction[]>([]);
  const selectedRef = useRef(selected);

  openRef.current = open;
  selectedRef.current = selected;

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (!openRef.current) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const len = Math.max(itemsRef.current.length, 1);
        setSelected((prev) => (prev + 1) % len);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const len = Math.max(itemsRef.current.length, 1);
        setSelected((prev) => (prev - 1 + len) % len);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = itemsRef.current[selectedRef.current];
        if (item) {
          close();
          router.push(item.href);
        }
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenEvent);
    };
  }, [close, router]);

  useEffect(() => {
    if (!open) return;
    const focusInput = () => inputRef.current?.focus({ preventScroll: true });
    requestAnimationFrame(focusInput);
    const t = setTimeout(focusInput, 60);
    return () => clearTimeout(t);
  }, [open]);

  const items = useMemo<PaletteAction[]>(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? ACTIONS.filter(
          (a) => a.label.toLowerCase().includes(q) || a.hint.toLowerCase().includes(q)
        )
      : ACTIONS;
    if (q) {
      return [
        {
          id: "quick-search",
          icon: CarFront,
          label: `Rechercher « ${query.trim()} »`,
          hint: "Lancer une recherche IA",
          href: `/results?q=${encodeURIComponent(query.trim())}`,
        },
        ...filtered,
      ];
    }
    return filtered;
  }, [query]);

  itemsRef.current = items;

  const runAction = useCallback(
    (item: PaletteAction | undefined) => {
      if (!item) return;
      close();
      router.push(item.href);
    },
    [close, router]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[800] flex items-start justify-center px-4 pt-[16vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche rapide"
    >
      <button
        aria-label="Fermer"
        onClick={close}
        className="absolute inset-0 cursor-default bg-slate-950/40 backdrop-blur-sm animate-fade-in"
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl liquid-glass animate-scale-in">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4">
          <Search className="h-4.5 w-4.5 shrink-0 text-corporate" />
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            placeholder="Rechercher une action ou une voiture…"
            className="w-full bg-transparent py-4 text-sm text-slate-800 placeholder-slate-400 outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400 sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[46vh] overflow-y-auto p-2">
          {items.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-slate-400">
              Aucun résultat pour « {query} »
            </p>
          )}
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => runAction(item)}
              onMouseEnter={() => setSelected(i)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                i === selected ? "bg-corporate/5 text-corporate" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
                  i === selected
                    ? "border-corporate/20 bg-white text-corporate shadow-sm"
                    : "border-slate-100 bg-slate-50 text-slate-400"
                }`}
              >
                <item.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{item.label}</span>
                <span className="block truncate text-xs text-slate-400">{item.hint}</span>
              </span>
              {i === selected && (
                <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-corporate/50" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <p className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5">↑↓</kbd>
              naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5">↵</kbd>
              ouvrir
            </span>
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Thiqti Command
          </p>
        </div>
      </div>
    </div>
  );
}
