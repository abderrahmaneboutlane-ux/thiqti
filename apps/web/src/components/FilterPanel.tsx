"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal, RotateCcw, ShieldCheck, Calendar, Gauge, Tag, Fuel } from "lucide-react";
import { SearchFilters, SearchFacets, countActiveFilters } from "@/lib/searchTypes";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";

const PRICE_PRESETS = [
  { label: "≤ 100k", value: 100000 },
  { label: "≤ 150k", value: 150000 },
  { label: "≤ 250k", value: 250000 },
  { label: "≤ 400k", value: 400000 },
  { label: "≤ 600k", value: 600000 },
];

const SAFETY_OPTIONS = [
  { label: "3★ minimum", value: 3 },
  { label: "4★ minimum", value: 4 },
  { label: "5★", value: 5 },
];

interface FilterPanelProps {
  facets: SearchFacets;
  filters: SearchFilters;
  total: number;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
}

function Slider({ label, icon: Icon, min, max, step, value, display, onChange }: {
  label: string; icon: typeof Calendar; min: number; max: number; step: number; value: number; display: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-muted">
          <Icon className="h-3.5 w-3.5 text-brand" />
          {label}
        </span>
        <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-brand" />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-slate-200/60 pt-4">
      <p className="mb-2 text-caption">{title}</p>
      {children}
    </div>
  );
}

export default function FilterPanel({ facets, filters, total, onChange, onReset }: FilterPanelProps) {
  const [brandSearch, setBrandSearch] = useState("");
  const activeCount = countActiveFilters(filters);
  const maxYear = facets.yearMax || 2026;
  const minYear = facets.yearMin || 2018;
  const year = filters.minYear ?? minYear;
  const km = filters.maxKm ?? 250000;

  const set = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch });
  const toggle = (key: keyof SearchFilters, value: string | number) => {
    const next: SearchFilters = { ...filters };
    if (next[key] === (value as never)) delete next[key]; else (next[key] as unknown) = value;
    onChange(next);
  };

  const pricePresetActive = PRICE_PRESETS.some((p) => p.value === filters.maxPrice && !filters.minPrice);
  const filteredBrands = facets.brands.filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()));

  return (
    <div className="liquid-glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <SlidersHorizontal className="h-4 w-4 text-brand" />
          Filtres
          {activeCount > 0 && <span className="badge badge-brand">{activeCount}</span>}
        </div>
        <button onClick={onReset} className="btn btn-ghost btn-sm">
          <RotateCcw className="h-3 w-3" /> Reinitialiser
        </button>
      </div>

      <div className="mb-4 rounded-lg bg-brand-50 px-3 py-2">
        <p className="text-xs text-muted">Resultats</p>
        <p className="text-sm font-bold text-brand">{total} vehicules</p>
      </div>

      <div className="space-y-4">
        <Section title="Budget">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {PRICE_PRESETS.map((p) => (
              <Chip key={p.value} label={p.label} variant="price" selected={pricePresetActive && filters.maxPrice === p.value} onClick={() => set({ maxPrice: p.value, minPrice: undefined })} />
            ))}
            <Chip variant="default" label="Tous" selected={!filters.maxPrice && !filters.minPrice} onClick={() => set({ maxPrice: undefined, minPrice: undefined })} />
          </div>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min (DH)" value={filters.minPrice ?? ""} onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : undefined })} className="input input-sm" />
            <span className="text-slate-300">—</span>
            <input type="number" placeholder="Max (DH)" value={filters.maxPrice ?? ""} onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : undefined })} className="input input-sm" />
          </div>
        </Section>

        <Section title="Annee minimum">
          <Slider label="" icon={Calendar} min={minYear} max={maxYear} step={1} value={year} display={String(year)} onChange={(v) => set({ minYear: v })} />
        </Section>

        <Section title="Kilometrage max">
          <Slider label="" icon={Gauge} min={0} max={250000} step={5000} value={km} display={km >= 250000 ? "Indifferent" : `${km.toLocaleString("fr-FR")} km`} onChange={(v) => set({ maxKm: v === 250000 ? undefined : v })} />
        </Section>

        <Section title="Securite (crash test)">
          <div className="flex flex-wrap gap-1.5">
            <Chip variant="default" label="Toutes" selected={!filters.minSafety} onClick={() => set({ minSafety: undefined })} />
            {SAFETY_OPTIONS.map((o) => (
              <Chip key={o.value} variant="default" label={o.label} selected={filters.minSafety === o.value} onClick={() => toggle("minSafety", o.value)} />
            ))}
          </div>
        </Section>

        <Section title="Carrosserie">
          <div className="flex flex-wrap gap-1.5">
            <Chip variant="default" label="Toutes" selected={!filters.bodyType} onClick={() => set({ bodyType: undefined })} />
            {facets.bodyTypes.map((b) => (<Chip key={b} variant="default" label={b} selected={filters.bodyType === b} onClick={() => toggle("bodyType", b)} />))}
          </div>
        </Section>

        <Section title="Motorisation">
          <div className="flex flex-wrap gap-1.5">
            <Chip variant="default" label="Toutes" selected={!filters.fuel} onClick={() => set({ fuel: undefined })} />
            {facets.fuels.map((f) => (
              <Chip key={f} variant="default" label={f} selected={filters.fuel === f} onClick={() => toggle("fuel", f)} />
            ))}
          </div>
        </Section>

        <Section title="Marque">
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input type="text" value={brandSearch} onChange={(e) => setBrandSearch(e.target.value)} placeholder="Rechercher une marque..." className="input pl-9" />
          </div>
          <select value={filters.brand ?? ""} onChange={(e) => set({ brand: e.target.value || undefined })} className="mt-2 w-full input">
            <option value="">Toutes les marques</option>
            {filteredBrands.map((b) => (<option key={b} value={b}>{b}</option>))}
          </select>
        </Section>

        <Section title="Ville">
          <select value={filters.city ?? ""} onChange={(e) => set({ city: e.target.value || undefined })} className="w-full input">
            <option value="">Toutes les villes</option>
            {facets.cities.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </Section>
      </div>

      {activeCount > 0 && (
        <Button variant="outline" fullWidth onClick={onReset} className="mt-5">
          <RotateCcw className="h-4 w-4" /> Effacer {activeCount} filtre{activeCount > 1 ? "s" : ""}
        </Button>
      )}
    </div>
  );
}