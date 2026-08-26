"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, GitCompareArrows, Heart, Sparkles } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/results", label: "Explorer", icon: Search },
  { href: "/compare", label: "Comparer", icon: GitCompareArrows, center: true },
  { href: "/favorites", label: "Favoris", icon: Heart },
  { href: "/chat", label: "Assistant", icon: Sparkles },
];

/**
 * FloatingBottomNav — Barre de navigation flottante glassmorphique,
 * signature du design Thiqti (inspirée de single.html, adaptée à la
 * charte principale). Bouton central "Comparer" surélevé avec anneau.
 */
export default function FloatingBottomNav() {
  const pathname = usePathname();

  // Sur la page d'accueil (single.html), la nav flottante native du design
  // original est déjà présente — on masque celle-ci pour éviter le doublon.
  if (pathname === "/") return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-5 left-1/2 z-[600] -translate-x-1/2"
      style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom, 1.25rem))" }}
    >
      <div className="flex items-end gap-0.5 rounded-2xl liquid-glass px-3 py-2 sm:px-4">
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="group relative mx-1 flex flex-col items-center gap-0.5 px-2"
              >
                <span
                  className={`absolute -top-1 left-1/2 h-11 w-11 -translate-x-1/2 rounded-full bg-gradient-to-br from-corporate to-corporate-800 transition-all duration-300 ${
                    active ? "scale-100 opacity-100 shadow-brand-glow" : "scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-90"
                  }`}
                />
                <span
                  className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 bg-corporate-50 transition-all duration-300 ${
                    active
                      ? "-translate-y-0.5 border-transparent bg-transparent text-white"
                      : "border-slate-200 text-slate-500 group-hover:border-corporate/40 group-hover:text-corporate"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className={`text-[9px] font-extrabold tracking-wide ${active ? "text-corporate-800" : "text-slate-500"}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-w-[52px] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 pb-2.5 transition-all duration-300 ${
                active ? "text-corporate" : "text-slate-400 hover:bg-corporate-50 hover:text-slate-600"
              }`}
            >
              <span
                className={`flex items-center justify-center transition-transform duration-300 ${
                  active ? "-translate-y-0.5 drop-shadow-[0_4px_8px_rgba(2,132,199,0.3)]" : ""
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
              <span
                className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-corporate transition-transform duration-300 ${
                  active ? "scale-100" : "scale-0"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
