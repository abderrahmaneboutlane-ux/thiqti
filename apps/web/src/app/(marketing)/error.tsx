"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Thiqti Marketing Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
      <Logo size="md" />
      <AlertTriangle className="h-12 w-12 text-amber-500" />
      <h2 className="text-lg font-bold text-slate-900">Une erreur est survenue</h2>
      <p className="max-w-md text-center text-sm text-slate-500">
        {error.message || "Quelque chose s'est mal passe. Veuillez reessayer."}
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary">
          Reessayer
        </button>
        <Link href="/" className="btn-secondary">
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
