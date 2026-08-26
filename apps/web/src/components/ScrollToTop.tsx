"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollToTop — Bouton flottant "haut de page", inspiré de single.html.
 * Apparaît après 420px de scroll, disparait en haut, respecte
 * prefers-reduced-motion (scroll instantané).
 * Masqué sur la page d'accueil (single.html a son propre bouton).
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setVisible(window.scrollY > 420);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  if (pathname === "/") return null;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Haut de page"
      title="Haut de page"
      className={`fixed bottom-24 right-5 z-[590] flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/70 bg-white/85 text-slate-500 shadow-elev-2 backdrop-blur-md transition-all duration-300 hover:border-corporate/40 hover:text-corporate sm:bottom-6 sm:right-6 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 19V5m-6 6 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
