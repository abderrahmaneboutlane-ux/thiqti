"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ChevronDown } from "lucide-react";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Identifiants invalides");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-enter relative flex min-h-screen items-center justify-center bg-zellige bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex justify-center">
              <Logo size="lg" />
            </div>
            <div className="mx-auto mt-3 flex items-center gap-3">
              <span className="h-px w-8 bg-slate-200" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Connexion
              </p>
              <span className="h-px w-8 bg-slate-200" />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Connectez-vous avec votre compte Google pour retrouver vos favoris.
            </p>
          </div>

          <GoogleLoginButton redirectTo="/favorites" />

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Administration
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={() => setShowAdmin((v) => !v)}
            className="mb-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-corporate/40"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ShieldCheck className="h-4 w-4 text-corporate" />
              Connexion admin (email / mot de passe)
            </span>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${showAdmin ? "rotate-180" : ""}`}
            />
          </button>

          {showAdmin && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="admin@thiqti.ma"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Votre mot de passe"
                />
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 transition-colors hover:text-corporate"
            >
              Retour a l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
