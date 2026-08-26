"use client";

import { SearchX, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  query: string;
  onReset: () => void;
}

export default function EmptyState({ query, onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-8 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
        <SearchX className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-slate-900">
        Aucun resultat pour &laquo;&nbsp;{query}&nbsp;&raquo;
      </h3>
      <p className="mb-6 max-w-sm text-sm text-slate-500">
        Essayez d&apos;elargir votre recherche en modifiant les filtres.
      </p>
      <button onClick={onReset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
        <RotateCcw className="h-4 w-4" />
        Reinitialiser la recherche
      </button>
    </div>
  );
}
