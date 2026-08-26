import { ZelligeStar, ThiqtiShield } from "@/components/icons";

export interface SafetyInfo {
  stars: number;
  ratingYear?: number;
  source?: "euroncap" | "nhtsa" | string;
  className?: string;
}

export function safetyLabelOf(safety: SafetyInfo | null | undefined): string {
  if (!safety) return "Non évalué";
  const program = safety.source === "nhtsa" ? "NHTSA" : "Euro NCAP";
  const year = safety.ratingYear ? ` ${safety.ratingYear}` : "";
  return `${safety.stars} étoile${safety.stars > 1 ? "s" : ""} — ${program}${year}`;
}

function starColor(stars: number): string {
  if (stars >= 4) return "text-green-600";
  if (stars === 3) return "text-amber-500";
  if (stars === 2) return "text-orange-500";
  return "text-red-500";
}

interface SafetyBadgeProps {
  safety?: SafetyInfo | null;
  size?: number;
  full?: boolean;
}

export default function SafetyBadge({ safety, size = 13, full = false }: SafetyBadgeProps) {
  if (!safety) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
        <ThiqtiShield style={{ width: size, height: size }} />
        {full ? "Non évalué" : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-0.5 ${starColor(safety.stars)}`}>
        <ThiqtiShield style={{ width: size, height: size }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <ZelligeStar key={i} style={{ width: size, height: size }} className={i < safety.stars ? "fill-current" : "opacity-25"} />
        ))}
      </span>
      {full && <span className="text-xs text-slate-500">{safetyLabelOf(safety)}</span>}
    </span>
  );
}
