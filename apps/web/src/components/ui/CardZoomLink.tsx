"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";

interface CardZoomLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/**
 * CardZoomLink — Transition de profondeur FLIP au clic :
 * la carte "s'ouvre" (zoom léger + élévation) pendant que le reste
 * de la grille se floute, puis navigation vers la fiche détail.
 *
 * Dégradations propres :
 *  - prefers-reduced-motion → navigation directe sans effet
 *  - écrans < 768px → navigation directe (performance)
 */
export default function CardZoomLink({ href, children, className = "" }: CardZoomLinkProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.innerWidth < 768
    ) {
      return; // navigation normale
    }
    e.preventDefault();
    const el = ref.current;
    if (!el) return;

    // Overlay floutant le reste de la grille
    const overlay = document.createElement("div");
    overlay.setAttribute("data-card-zoom-overlay", "");
    overlay.className =
      "fixed inset-0 z-[650] pointer-events-none opacity-0 transition-opacity duration-300";
    overlay.style.background = "rgba(248, 250, 252, 0.55)";
    overlay.style.backdropFilter = "blur(10px)";
    (overlay.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = "blur(10px)";
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      el.classList.add("card-flip-source");
    });

    // Navigation dure : le nouveau document remplace naturellement l'overlay
    window.setTimeout(() => {
      window.location.href = href;
    }, 320);

    // Filet de sécurité : si la navigation est annulée, on restaure tout
    const cleanup = () => {
      overlay.remove();
      el.classList.remove("card-flip-source");
      window.removeEventListener("popstate", cleanup);
    };
    window.addEventListener("popstate", cleanup);
    window.setTimeout(cleanup, 2500);
  };

  return (
    <Link ref={ref} href={href} onClick={handleClick} className={className} data-cursor="view">
      {children}
    </Link>
  );
}
