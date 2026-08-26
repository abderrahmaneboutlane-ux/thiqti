"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles } from "lucide-react";

const PREDEFINED_SUGGESTIONS = [
  "SUV hybride autour de 350 000 DH, confortable pour la famille",
  "SUV هجين ف 350 000 درهم, راحة للعائلة",
  "Citadine economique essence",
  "Berline familiale automatique",
  "SUV 7 places diesel",
  "Voiture electrique moins de 300 000 DH",
  "Crossover automatique essence",
  "Toyota RAV4 hybride",
  "Dacia Sandero pas cher",
  "Renault Clio citadine",
  "SUV 4x4 tout-terrain",
  "Petite voiture ville parking",
];

interface SearchSuggestionsProps {
  query: string;
  onSelect: (value: string) => void;
}

export default function SearchSuggestions({ query, onSelect }: SearchSuggestionsProps) {
  const [filtered, setFiltered] = useState<string[]>([]);

  const filterSuggestions = useCallback(() => {
    if (!query.trim()) { setFiltered(PREDEFINED_SUGGESTIONS); return; }
    const lower = query.toLowerCase();
    setFiltered(PREDEFINED_SUGGESTIONS.filter((s) => s.toLowerCase().includes(lower)));
  }, [query]);

  useEffect(() => { filterSuggestions(); }, [filterSuggestions]);

  if (filtered.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Sparkles className="h-4 w-4 shrink-0 text-corporate" />
      {filtered.slice(0, 5).map((suggestion) => (
        <button key={suggestion} onClick={() => onSelect(suggestion)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-corporate hover:bg-slate-50 hover:text-corporate">
          {suggestion}
        </button>
      ))}
    </div>
  );
}
