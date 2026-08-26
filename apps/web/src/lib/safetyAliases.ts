export interface SafetyEntry {
  make: string;
  model: string;
  stars: number;
  ratingYear: number;
  className: string;
  source: "euroncap" | "nhtsa";
  id: string;
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function modelKey(model: string): string {
  return stripAccents(model).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function makeKey(make: string): string {
  return stripAccents(make).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export const MODEL_VARIANTS: Record<string, string[]> = {
  "sandero": ["sandero", "sanderostepway"],
  "duster": ["duster"],
  "clio": ["clio"],
  "captur": ["captur"],
  "tucson": ["tucson"],
  "sportage": ["sportage"],
  "picanto": ["picanto"],
  "yaris": ["yaris"],
  "corolla": ["corolla"],
  "rav4": ["rav4"],
  "golf": ["golf"],
  "polo": ["polo"],
  "octavia": ["octavia"],
  "leon": ["leon"],
  "ibiza": ["ibiza"],
  "vitara": ["vitara"],
  "swift": ["swift"],
  "c3": ["c3"],
  "c4": ["c4"],
  "2008": ["2008"],
  "3008": ["3008"],
  "5008": ["5008"],
  "x1": ["x1"],
  "x3": ["x3"],
  "a3": ["a3"],
  "q5": ["q5"],
};

export function modelVariants(model: string): string[] {
  const key = modelKey(model);
  const explicit = MODEL_VARIANTS[key];
  const all = explicit ? [...explicit] : [];
  if (!all.includes(key)) all.push(key);
  return all;
}

export function findMatch(candidates: SafetyEntry[], make: string, model: string): SafetyEntry | null {
  const mk = makeKey(make);
  const variants = modelVariants(model);
  let best: SafetyEntry | null = null;
  let bestScore = 0;
  for (const c of candidates) {
    if (makeKey(c.make) !== mk) continue;
    const cm = modelKey(c.model);
    let score = 0;
    if (variants.includes(cm)) score = 100;
    else if (cm.length >= 2 && variants.some((v) => v.includes(cm) || cm.includes(v))) score = 80;
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return best;
}
