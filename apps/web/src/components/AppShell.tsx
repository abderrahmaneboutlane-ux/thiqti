"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, GitCompareArrows, Heart, Trash2, User, ShieldCheck, Home, LogOut, Sparkles } from "lucide-react";
import { clearHistory, getHistory } from "@/lib/history";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/results", label: "Rechercher", icon: Search },
  { href: "/chat", label: "Assistant", icon: Sparkles },
  { href: "/compare", label: "Comparer", icon: GitCompareArrows },
  { href: "/favorites", label: "Favoris", icon: Heart },
];

interface SessionUser {
  email: string;
  role: string;
  name?: string | null;
  picture?: string | null;
}

function Brand() {
  return (
    <Link href="/" className="group flex items-center">
      <Logo variant="dark" size="md" />
    </Link>
  );
}

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [history, setHistory] = useState<string[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, [pathname]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
              >
                <item.icon className={`h-4 w-4 ${active ? "text-brand" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <p className="px-4 pb-2 pt-6 text-caption">Historique</p>
        {history.length === 0 ? (
          <p className="px-4 py-1 text-xs text-muted">Aucune recherche recente.</p>
        ) : (
          <div>
            {history.map((q, i) => (
              <Link
                key={q}
                href={`/results?q=${encodeURIComponent(q)}`}
                onClick={onNavigate}
                className="flex items-baseline gap-2 rounded-lg px-4 py-2 text-xs text-muted transition hover:bg-brand-50 hover:text-brand"
                title={q}
              >
                <span className="text-[10px] text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                <span className="truncate">{q}</span>
              </Link>
            ))}
            <button
              onClick={() => { clearHistory(); setHistory([]); }}
              className="mt-2 flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-caption text-muted transition hover:bg-danger-50 hover:text-danger-600"
            >
              <Trash2 className="h-3 w-3" />
              Effacer
            </button>
          </div>
        )}
      </nav>

      <div className="border-t border-slate-200 px-4 py-4">
        {user ? (
          <>
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name ?? user.email}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand">
                  <User className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user.name ?? user.email}
                </p>
                <p className="truncate text-caption">
                  {user.role === "admin" ? "Administrateur" : user.email}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="/favorites"
                onClick={onNavigate}
                className="btn btn-secondary btn-sm justify-center"
              >
                <Heart className="h-3.5 w-3.5" />
                Favoris
              </Link>
              <Button variant="secondary" size="sm" fullWidth onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5" />
                Deconnexion
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-muted">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Invite</p>
                <p className="text-caption">Lecture seule</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={onNavigate}
                className="btn btn-secondary btn-sm justify-center"
              >
                <User className="h-3.5 w-3.5" />
                Connexion
              </Link>
              <Link
                href="/admin"
                onClick={onNavigate}
                className="btn btn-secondary btn-sm justify-center"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface AppShellProps {
  sidebar?: boolean;
  children: React.ReactNode;
}

export default function AppShell({ sidebar = true, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {sidebar && (
        <>
          <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-slate-200 bg-white lg:flex">
            <div className="border-b border-slate-200 px-5 py-5">
              <Brand />
            </div>
            <SidebarInner />
          </aside>

          <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
            <Brand />
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
              <Menu className="h-5 w-5" />
            </Button>
          </header>

          {open && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
              <div className="absolute inset-y-0 left-0 flex w-[280px] flex-col overflow-y-auto bg-white shadow-elev-4">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
                  <Brand />
                  <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Fermer le menu">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <SidebarInner onNavigate={() => setOpen(false)} />
              </div>
            </div>
          )}
        </>
      )}
      <div className={`flex-1 ${sidebar ? "pt-14 lg:pt-0 lg:pl-[264px]" : ""}`}>
        {children}
      </div>
    </div>
  );
}