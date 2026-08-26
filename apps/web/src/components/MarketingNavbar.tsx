"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, X, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/results", label: "Rechercher" },
  { href: "/compare", label: "Comparer" },
  { href: "/chat", label: "Assistant" },
  { href: "/favorites", label: "Favoris" },
];

export default function MarketingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="sticky top-0 z-50 w-full liquid-glass border-b border-slate-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center">
          <Logo size="sm" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-slate-100 hover:text-slate-700 ${
                isActive(link.href) ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-500"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="hidden items-center gap-2 rounded-lg bg-corporate px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-corporate-600 hover:shadow-md active:scale-[0.98] sm:flex"
          >
            <Sparkles className="h-4 w-4" />
            Assistant IA
          </Link>
          <Link href="/login" className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:flex">
            <User className="h-3.5 w-3.5" />
            Connexion
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition hover:bg-slate-100 ${
                  isActive(link.href) ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-500"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link
                href="/chat"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-corporate px-4 py-2.5 text-sm font-bold text-white"
              >
                <Sparkles className="h-4 w-4" />
                Assistant IA
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600"
              >
                <User className="h-4 w-4" />
                Connexion
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
