"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: { credential?: string }) => void;
  ux_mode: "popup" | "redirect";
  auto_select: boolean;
}

interface GoogleButtonOptions {
  theme: "outline" | "filled_blue" | "filled_black";
  size: "large" | "medium" | "small";
  shape: "rectangular" | "pill" | "circle" | "square";
  text: "continue_with" | "signin_with" | "signup_with" | "signin";
  width: number;
  logo_alignment: "left" | "center";
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

interface GoogleLoginButtonProps {
  /** Chemin de redirection apres connexion reussie. */
  redirectTo?: string;
}

export default function GoogleLoginButton({ redirectTo = "/" }: GoogleLoginButtonProps) {
  const router = useRouter();
  const btnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !btnRef.current) return;
    let cancelled = false;

    async function handleCredentialResponse(response: { credential?: string }) {
      if (!response.credential) {
        setError("Jeton Google manquant");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Erreur de connexion Google");
          return;
        }
        router.push(redirectTo);
        router.refresh();
      } catch {
        setError("Erreur de connexion Google.");
      } finally {
        setLoading(false);
      }
    }

    function init() {
      if (cancelled || !window.google?.accounts?.id || !btnRef.current || !clientId) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        ux_mode: "popup",
        auto_select: false,
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 320,
        logo_alignment: "center",
      });
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.remove();
    };
  }, [clientId, redirectTo, router]);

  if (!clientId) {
    return (
      <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
        Le bouton &quot;Continuer avec Google&quot; s&apos;affichera ici une fois que tu auras
        renseigne <code className="font-bold">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> dans{" "}
        <code className="font-bold">apps/web/.env.local</code>.
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {error && (
        <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}
      {loading && (
        <p className="text-xs font-medium text-slate-500">Connexion avec Google...</p>
      )}
      <div ref={btnRef} className={loading ? "pointer-events-none opacity-60" : ""} />
    </div>
  );
}
