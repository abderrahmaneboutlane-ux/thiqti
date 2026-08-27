"use client";

import { useState, useEffect, useCallback } from "react";
import { X, RotateCcw } from "lucide-react";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, string>) => void;
  initialFilters?: Record<string, string>;
}

const FUEL_OPTIONS = ["Diesel", "Essence", "Hybride", "Électrique"];
const BODY_OPTIONS = ["SUV", "Citadine", "Berline", "Compacte", "Utilitaire"];
const SORT_OPTIONS = [
  { value: "score_desc", label: "Meilleur score" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "year_desc", label: "Année décroissante" },
  { value: "best_deal", label: "Meilleur rapport qualité/prix" },
];

export default function FilterSheet({ open, onClose, onApply, initialFilters = {} }: FilterSheetProps) {
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    if (open) setFilters(initialFilters);
  }, [open, initialFilters]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleOption = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? "" : value }));
  }, []);

  const reset = useCallback(() => {
    setFilters({});
  }, []);

  const apply = useCallback(() => {
    onApply(filters);
    onClose();
  }, [filters, onApply, onClose]);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <>
      {/* Overlay */}
      <div
        className={`bottom-sheet-overlay ${open ? "data-[open=true]" : ""}`}
        data-open={open}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={`bottom-sheet ${open ? "data-[open=true]" : ""}`}
        data-open={open}
        role="dialog"
        aria-label="Filtres"
        aria-modal="true"
      >
        {/* Handle */}
        <div className="bottom-sheet-handle" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">Filtres</h2>
            {activeCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="touch-target flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-5">
          {/* Price Range */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Budget maximum</label>
            <input
              type="number"
              placeholder="Ex: 200000"
              value={filters.max_price || ""}
              onChange={(e) => updateFilter("max_price", e.target.value)}
              className="input text-sm"
              inputMode="numeric"
            />
          </div>

          {/* Fuel */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Carburant</label>
            <div className="flex flex-wrap gap-2">
              {FUEL_OPTIONS.map((fuel) => (
                <button
                  key={fuel}
                  onClick={() => toggleOption("fuel", fuel)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filters.fuel === fuel
                      ? "bg-brand-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {fuel}
                </button>
              ))}
            </div>
          </div>

          {/* Body Type */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Type de carrosserie</label>
            <div className="flex flex-wrap gap-2">
              {BODY_OPTIONS.map((body) => (
                <button
                  key={body}
                  onClick={() => toggleOption("body_type", body)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filters.body_type === body
                      ? "bg-brand-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {body}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Trier par</label>
            <div className="space-y-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter("sort", opt.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    filters.sort === opt.value
                      ? "bg-brand-50 text-brand-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center gap-3 border-t border-slate-100 bg-white px-4 py-3" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <button
            onClick={reset}
            className="touch-target flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </button>
          <button
            onClick={apply}
            className="btn-primary flex-1 min-h-[44px] rounded-xl text-sm font-semibold"
          >
            Appliquer{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
        </div>
      </div>
    </>
  );
}
