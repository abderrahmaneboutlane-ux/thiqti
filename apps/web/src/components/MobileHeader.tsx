"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, MoreHorizontal, Heart, Share2 } from "lucide-react";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onShare?: () => void;
}

/**
 * MobileHeader — Compact sticky header for mobile.
 * Respects safe-area-inset-top on iOS.
 * Used for: results, vehicle detail, favorites, compare.
 */
export default function MobileHeader({
  title,
  showBack = false,
  showFavorite = false,
  isFavorite = false,
  onFavoriteToggle,
  onShare,
}: MobileHeaderProps) {
  const router = useRouter();

  return (
    <header className="mobile-header flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="touch-target flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Retour"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {title && (
          <h1 className="truncate text-base font-semibold text-slate-900">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-1">
        {showFavorite && (
          <button
            onClick={onFavoriteToggle}
            className="touch-target flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="touch-target flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            aria-label="Partager"
          >
            <Share2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}
