"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, GitCompareArrows, Heart, Sparkles } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/results", label: "Rechercher", icon: Search },
  { href: "/chat", label: "Assistant", icon: Sparkles },
  { href: "/compare", label: "Comparer", icon: GitCompareArrows },
  { href: "/favorites", label: "Favoris", icon: Heart },
];

/**
 * FloatingBottomNav — Barre de navigation fixe en bas de l'écran.
 * Touch targets 44×44px minimum (WCAG 2.5.8).
 * Respecte safe-area-inset-bottom sur iOS.
 */
export default function FloatingBottomNav() {
  const pathname = usePathname();

  // La page d'accueil (single.html) a sa propre nav — on masque ici.
  if (pathname === "/") return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-nav-bottom lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch justify-around border-t border-slate-200 bg-white/95 backdrop-blur-md px-1 pt-1">
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={`touch-target relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-bold tracking-wide transition-colors duration-150 ${
                active
                  ? "text-brand-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-brand-600" : ""}`} strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
              {active && (
                <span className="absolute -top-0.5 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-brand-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
