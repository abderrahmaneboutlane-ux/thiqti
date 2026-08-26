"use client";

import { Phone, MessageCircle, ExternalLink, ShieldCheck, BadgeCheck, Eye, Star, Clock } from "lucide-react";

export interface SellerContactInfo {
  name?: string;
  phone?: string;
  phoneHref?: string;
  whatsappHref?: string;
  url?: string;
}

export interface CarReputationInfo {
  verified?: boolean;
  trustBadge?: boolean;
  views?: number;
  reviews?: number;
  rating5?: number;
  sellerSince?: string;
  label?: string;
}

interface SellerContactProps {
  contact?: SellerContactInfo;
  reputation?: CarReputationInfo;
  compact?: boolean;
  showButtons?: boolean;
  className?: string;
}

function ReputationBadge({ reputation, compact }: { reputation?: CarReputationInfo; compact?: boolean }) {
  if (!reputation) return null;
  const { verified, trustBadge, views, reviews, rating5, sellerSince, label } = reputation;
  if (!verified && !trustBadge && !views && !label && !(typeof rating5 === "number") && !sellerSince) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {verified && (
        <span className={`inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`}>
          <ShieldCheck className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          {label || "Annonce verifiee"}
        </span>
      )}
      {!verified && trustBadge && (
        <span className={`inline-flex items-center gap-1 rounded-full bg-slate-50 text-corporate ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`}>
          <BadgeCheck className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          Badge de confiance
        </span>
      )}
      {typeof rating5 === "number" && rating5 > 0 && (reviews ?? 0) > 0 && (
        <span className={`inline-flex items-center gap-1 rounded-full bg-slate-50 text-corporate ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`}>
          <Star className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          {rating5}/5 · {reviews} avis
        </span>
      )}
      {sellerSince && (
        <span className={`inline-flex items-center gap-1 text-slate-400 ${compact ? "text-[10px]" : "text-xs"}`}>
          <Clock className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          {sellerSince}
        </span>
      )}
      {typeof views === "number" && views > 0 && (
        <span className={`inline-flex items-center gap-1 text-slate-400 ${compact ? "text-[10px]" : "text-xs"}`}>
          <Eye className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          {views.toLocaleString("fr-FR")} vues
        </span>
      )}
    </div>
  );
}

export default function SellerContact({ contact, reputation, compact, showButtons = true, className }: SellerContactProps) {
  if (!contact && !reputation) return null;
  const hasContact = Boolean(contact && (contact.phoneHref || contact.whatsappHref || contact.url));
  if (!hasContact && !reputation) return null;

  const btn = (url: string, icon: React.ReactNode, label: string, variant: "primary" | "ghost" | "whatsapp") => {
    const base = compact
      ? "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition"
      : "inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition";
    const styles = variant === "primary"
      ? "bg-corporate text-white hover:bg-corporate-700"
      : variant === "whatsapp"
        ? "bg-[#2d7a4f] text-white hover:bg-[#246640]"
        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50";
    return (
      <a key={label} href={url} target={url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={`${base} ${styles}`}>
        {icon}
        {label}
      </a>
    );
  };

  return (
    <div className={className}>
      <ReputationBadge reputation={reputation} compact={compact} />
      {showButtons && (
        <div className={`flex flex-wrap items-center gap-2 ${compact ? "mt-1.5" : "mt-3"}`}>
          {contact?.phoneHref && btn(contact.phoneHref, <Phone className={compact ? "h-3 w-3" : "h-4 w-4"} />, "Appeler", "primary")}
          {contact?.whatsappHref && btn(contact.whatsappHref, <MessageCircle className={compact ? "h-3 w-3" : "h-4 w-4"} />, "WhatsApp", "whatsapp")}
          {contact?.url && btn(contact.url, <ExternalLink className={compact ? "h-3 w-3" : "h-4 w-4"} />, compact ? "Annonce" : "Voir l'annonce", "ghost")}
        </div>
      )}
    </div>
  );
}
