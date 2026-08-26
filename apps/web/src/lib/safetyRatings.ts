import { readFileSync } from "fs";
import { join } from "path";
import { SafetyEntry, findMatch } from "./safetyAliases";

interface SafetyCache {
  generatedAt: string;
  source: string;
  entries: SafetyEntry[];
}

let cache: SafetyEntry[] | null = null;

function loadEntries(): SafetyEntry[] {
  if (cache) return cache;
  try {
    const raw = JSON.parse(readFileSync(join(process.cwd(), "scripts", "euroncap-cache.json"), "utf-8")) as SafetyCache;
    cache = Array.isArray(raw.entries) ? raw.entries : [];
  } catch {
    cache = [];
  }
  return cache;
}

export function safetyRatingFor(make: string, model: string): SafetyEntry | null {
  return findMatch(loadEntries(), make, model);
}

export function safetyLabel(safety: SafetyEntry | null): string {
  if (!safety) return "Non évalué";
  const program = safety.source === "nhtsa" ? "NHTSA" : "Euro NCAP";
  return `${safety.stars} étoile${safety.stars > 1 ? "s" : ""} — ${program} ${safety.ratingYear}`;
}
