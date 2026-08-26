"use client";

import { useState } from "react";
import { Send, Phone, User, Mail, MessageSquare } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface LeadFormProps {
  vehicleId: string;
  vehicleName: string;
  channel?: "vehicle_detail" | "chat";
  onSuccess?: () => void;
}

export default function LeadForm({ vehicleId, vehicleName, channel = "vehicle_detail", onSuccess }: LeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError("Veuillez entrer votre nom (min. 2 caractères)");
      return;
    }
    if (!phone.trim() || phone.trim().length < 6) {
      setError("Veuillez entrer un numéro de téléphone valide");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          message: message.trim() || undefined,
          channel,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      trackEvent({
        type: "lead_submitted",
        vehicleId,
        channel,
        ts: Date.now(),
      });

      setSent(true);
      onSuccess?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <Send className="h-5 w-5 text-emerald-600" />
        </div>
        <p className="text-sm font-bold text-emerald-800">Demande envoyée !</p>
        <p className="mt-1 text-xs text-emerald-600">
          Nous vous contacterons concernant la <strong>{vehicleName}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <Phone className="h-4 w-4 text-brand-600" />
        Je suis intéressé
      </div>
      <p className="text-xs text-slate-500">
        Recevez une offre pour la <strong>{vehicleName}</strong> — nous vous rappelons sous 24h.
      </p>

      <div className="relative">
        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Votre nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-500/10"
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className="relative">
        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="tel"
          placeholder="Téléphone (ex: 06 12 34 56 78)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-500/10"
          required
          minLength={6}
          maxLength={20}
          inputMode="tel"
        />
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="email"
          placeholder="Email (optionnel)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-500/10"
          maxLength={200}
        />
      </div>

      <div className="relative">
        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <textarea
          placeholder="Message (optionnel)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-500/10"
          maxLength={2000}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
      >
        {sending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {sending ? "Envoi en cours..." : "Recevoir une offre"}
      </button>
    </form>
  );
}
