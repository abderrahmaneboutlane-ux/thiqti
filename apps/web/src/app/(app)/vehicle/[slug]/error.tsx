"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function VehicleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">
        Impossible de charger ce véhicule
      </h2>
      <p className="max-w-md text-center text-sm text-slate-500">
        {error.message || "Une erreur est survenue lors du chargement de la fiche véhicule."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700"
        >
          <RefreshCw className="h-4 w-4" /> Réessayer
        </button>
        <Link
          href="/results"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Retour aux résultats
        </Link>
      </div>
    </div>
  );
}
