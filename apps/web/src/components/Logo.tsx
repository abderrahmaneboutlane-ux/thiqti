"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showText?: boolean;
}

const SIZES = {
  sm: { icon: 28, text: "text-lg", sub: "text-[8px]", gap: "gap-1.5" },
  md: { icon: 34, text: "text-xl", sub: "text-[9px]", gap: "gap-2" },
  lg: { icon: 42, text: "text-2xl", sub: "text-[10px]", gap: "gap-2.5" },
};

function ChevronIcon({ size, variant }: { size: number; variant: "light" | "dark" }) {
  const isLight = variant === "light";
  const bg = isLight ? "rgba(255,255,255,0.15)" : "#0284C7";
  const chevron = isLight ? "#ffffff" : "#ffffff";

  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="8" fill={bg} />
      <path d="M7 14L14 7l7 7-7 7z" fill={chevron} opacity="0.95" />
    </svg>
  );
}

export default function Logo({ size = "md", variant = "dark", showText = true }: LogoProps) {
  const s = SIZES[size];
  const isLight = variant === "light";

  return (
    <div className={`flex items-center ${s.gap}`}>
      <ChevronIcon size={s.icon} variant={variant} />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif font-bold leading-none tracking-tight ${s.text} ${
            isLight ? "text-white" : "text-slate-900"
          }`}>
            THIQTI
          </span>
          <span className={`${s.sub} mt-0.5 font-bold uppercase tracking-[0.2em] ${
            isLight ? "text-white/50" : "text-slate-400"
          }`}>
            Guide auto Maroc
          </span>
        </div>
      )}
    </div>
  );
}
