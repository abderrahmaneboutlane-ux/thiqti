export interface SearchCriteria {
  carrosserie: string | null;
  motorisation: string | null;
  transmission: string | null;
  marque: string | null;
  modele: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetTolerance: number;
  ville: string | null;
  anneeMin: number | null;
  anneeMax: number | null;
  kmMax: number | null;
  intent: string[];
}

const CURRENT_YEAR = new Date().getFullYear();

const CARROSSERIES: Record<string, string> = {
  suv: "SUV",
  "4x4": "SUV",
  berline: "Berline",
  citadine: "Citadine",
  compacte: "Compacte",
  utilitaire: "Utilitaire",
  crossover: "Crossover",
  break: "Break",
  coupe: "Coupe",
  cabriolet: "Cabriolet",
  monospace: "Monospace",
  pickup: "Utilitaire",
  van: "Utilitaire",
  familiale: "Monospace",
  "famille": "Monospace",
  "ربع": "SUV",
  "كاروسة": "Berline",
  "مدينة": "Citadine",
  "سغرية": "Citadine",
  "سخة": "Citadine",
  "صغيرة": "Citadine",
};

const FUELS: Record<string, string> = {
  diesel: "Diesel",
  essence: "Essence",
  hybride: "Hybride",
  electrique: "Electrique",
  "électrique": "Electrique",
  gnv: "GNV",
  gpl: "GPL",
  "مازوت": "Diesel",
  "مازوط": "Diesel",
  "كازوال": "Diesel",
  "ديزل": "Diesel",
  "ديزيل": "Diesel",
  "كاز": "Essence",
  "هجين": "Hybride",
  "بطارية": "Electrique",
  "كهرباء": "Electrique",
  gasoil: "Diesel",
  gazoil: "Diesel",
  mazout: "Diesel",
};

const TRANSMISSIONS: Record<string, string> = {
  manuelle: "Manuelle",
  automatique: "Automatique",
  auto: "Automatique",
  "boite auto": "Automatique",
  "boîte auto": "Automatique",
  "اوتوماتيك": "Automatique",
  "اوماتيك": "Automatique",
  "ماتيك": "Automatique",
  "اليدوي": "Manuelle",
  "يدوي": "Manuelle",
  bva: "Automatique",
  bvm: "Manuelle",
};

const BRANDS = [
  "Dacia", "Renault", "Peugeot", "Toyota", "Hyundai", "Kia",
  "Volkswagen", "BMW", "Mercedes", "Audi", "Ford", "Fiat",
  "Nissan", "Opel", "Citroën", "Citroen", "Skoda", "Seat",
  "Mazda", "Suzuki", "Honda", "Mitsubishi", "Volvo", "Jeep",
  "Chevrolet", "Lexus", "Infiniti", "Alfa Romeo",
  "MG", "BYD", "Chery", "Geely", "Cupra", "Porsche",
  "DS", "Mini", "Land Rover", "Tesla",
  "تويوتا", "هيونداي", "كيا", "رونو", "رينو", "بيجو",
  "مرسيدس", "بي ام", "بي إم", "فولكس", "داسيا",
  "ميتسوبيشي", "honda", "نيسان",
];

const CANONICAL_BRANDS: Record<string, string> = {
  "تويوتا": "Toyota",
  "هيونداي": "Hyundai",
  "كيا": "Kia",
  "رونو": "Renault",
  "رينو": "Renault",
  "بيجو": "Peugeot",
  "مرسيدس": "Mercedes",
  "بي ام": "BMW",
  "بي إم": "BMW",
  "فولكس": "Volkswagen",
  "داسيا": "Dacia",
  "دacia": "Dacia",
  "ميتسوبيشي": "Mitsubishi",
  "نيسان": "Nissan",
};

const CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger",
  "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan",
  "Tetouan", "Nador", "El Jadida", "Béni Mellal", "Beni Mellal",
  "Casa", "Kenitra",
  "الدار البيضاء", "كازا", "الرباط", "مراكش", "فاس",
  "طنجة", "أكادير", "مكناس", "وجدة", "تطوان",
];

const INTENT_KEYWORDS: Record<string, string[]> = {
  familial: ["famille", "familial", "familiale", "enfant", "enfants", "bebe", "pratique", "familiale", "عائلة", "اولاد", "دراري", "famiya"],
  sportif: ["sport", "sportif", "sportive", "puissant", "vitesse", "performance", "سريع", "قوي"],
  economique: ["economique", "petit budget", "abordable", "pas cher", "moins cher", "rkhis", "رخيص", "رخص", "اقتصادي"],
  confort: ["confort", "confortable", "luxueux", "luxe", "premium", "مرتاح", "فخم", "راحة"],
  ville: ["ville", "urbain", "urbaine", "parking", "stationnement", "مدينة"],
  route: ["autoroute", "route", "longue distance", "voyage", "سفر", "طريق"],
  tout_terrain: ["tout-terrain", "tout terrain", "piste", "chemin", "offroad", "وعر"],
};

const NEGATION_PATTERNS: Array<{ pattern: RegExp; field: keyof SearchCriteria; value: null }> = [
  { pattern: /(?:pas|non|sans|no|without|لا|ما)\s*(?:de\s+|d\s+|du\s+)?diesel|(?:pas|non)\s*(?:de\s+|d\s+)?d[ée]zel|ما\s*بغيتش\s*ديزل|ما\s*بغيت\s*ديزيل|بلا\s*ديزل|sans\s*diesel/i, field: "motorisation", value: null },
  { pattern: /(?:pas|non|sans|no|without|لا|ما)\s*(?:de\s+|d\s+|du\s+)?essence|(?:pas|non)\s*(?:de\s+|d\s+)?essanse|ما\s*بغيتش\s*كاز|ما\s*بغيت\s*كاز|بلا\s*كاز|sans\s*essence/i, field: "motorisation", value: null },
  { pattern: /(?:pas|non|sans|no|without|لا|ما)\s*(?:de\s+|d\s+|du\s+)?suv|ما\s*بغيتش\s*ربع|بلا\s*suv|sans\s*suv/i, field: "carrosserie", value: null },
  { pattern: /(?:pas|non|sans|no|without|لا|ما)\s*(?:de\s+|d\s+)?automatique|ما\s*بغيتش\s*اوتوماتيك|بلا\s*auto|sans\s*auto/i, field: "transmission", value: null },
];

function normalizeText(text: string): string {
  const arabicDigits: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  };
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) => arabicDigits[d])
    .replace(/[^\w\s\d\u0600-\u06FF\u0400-\u04FF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasKeyword(text: string, key: string): boolean {
  if (key.includes(" ")) return text.includes(key);
  return new RegExp(`(^|[^a-z0-9])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`).test(text);
}

// --- Moroccan price normalization ---
// "20 million" / "20 mlyon" / "20M" / "20 m" / "20 مليون" → 200000
// "5 milion" → 50000
// "200k" → 200000
function normalizeMoroccanPrice(raw: string): number | null {
  const text = raw.toLowerCase().trim();

  // Pattern: X million / X millions / X mlyon / X M / X m / X مليون / X مليونة
  const millionMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:million|millions|mlyon|mlyons|milio?ns?|m\b|M\b| مليون| مليونة| مليون سنتيم)/i);
  if (millionMatch) {
    const val = parseFloat(millionMatch[1].replace(",", "."));
    if (val >= 0.5 && val <= 1000) {
      // In Moroccan auto context: 20 million = 20 * 10000 = 200000 DH
      // (1 million = 10000 DH in everyday Moroccan pricing)
      return Math.round(val * 10000);
    }
  }

  // Pattern: Xk / X k DH
  const kMatch = text.match(/(\d+(?:[.,]\d+)?)\s*k(?:\s*(?:dh|mad|dirhams?))?/i);
  if (kMatch) {
    const val = parseFloat(kMatch[1].replace(",", "."));
    if (val >= 5 && val <= 2000) {
      return Math.round(val * 1000);
    }
  }

  return null;
}

function extractBudget(text: string): { min: number | null; max: number | null; tolerance: number } {
  let min: number | null = null;
  let max: number | null = null;
  let tolerance = 0.15;

  // 1. "autour de X"
  const aroundMatch = text.match(/autour\s+d[e']\s*(\d[\d\s]*\d)\s*(dh)?/i);
  if (aroundMatch) {
    const val = parseInt(aroundMatch[1].replace(/\s/g, ""));
    if (val >= 10000 && val <= 5000000) { max = Math.round(val * 1.2); min = Math.round(val * 0.8); tolerance = 0.2; }
  }

  // 2. "entre X et Y"
  if (min === null) {
    const rangeMatch = text.match(/entre\s+(\d[\d\s]*\d)\s*(?:et|a|à)\s+(\d[\d\s]*\d)\s*(dh)?/i);
    if (rangeMatch) {
      const v1 = parseInt(rangeMatch[1].replace(/\s/g, ""));
      const v2 = parseInt(rangeMatch[2].replace(/\s/g, ""));
      if (v1 >= 10000 && v2 >= 10000) { min = Math.min(v1, v2); max = Math.max(v1, v2); }
    }
  }

  // 3. "sous/moins de/max X"
  if (min === null) {
    const underMatch = text.match(/(?:sous|moins de|max|maximum)\s+(\d[\d\s]*\d)\s*(dh)?/i);
    if (underMatch) { const val = parseInt(underMatch[1].replace(/\s/g, "")); if (val >= 10000 && val <= 5000000) max = val; }
  }

  // 4. "plus de/min X"
  if (min === null) {
    const aboveMatch = text.match(/(?:plus de|au-dessus de|min|minimum|a partir de)\s+(\d[\d\s]*\d)\s*(dh)?/i);
    if (aboveMatch) { const val = parseInt(aboveMatch[1].replace(/\s/g, "")); if (val >= 10000 && val <= 5000000) min = val; }
  }

  // 5. Moroccan normalization: 20 million, 200k, 5 mlyon
  if (min === null && max === null) {
    const moroccanPrice = normalizeMoroccanPrice(text);
    if (moroccanPrice !== null) {
      max = moroccanPrice;
      min = Math.round(moroccanPrice * 0.7);
      tolerance = 0.2;
    }
  }

  // 6. "X DH/MAD/درهم"
  if (min === null && max === null) {
    const budgetMatch = text.match(/(\d[\d\s]*\d)\s*(dh|mad|درهم|دهم)/i);
    if (budgetMatch) {
      const val = parseInt(budgetMatch[1].replace(/\s/g, ""));
      if (val >= 10000 && val <= 5000000) { max = Math.round(val * 1.15); min = Math.round(val * 0.85); }
    }
  }

  // 7. "ف X درهم" (Arabic)
  if (min === null && max === null) {
    const darMatch = text.match(/(?:ف|على)\s*(\d[\d\s]*\d)\s*(?:درهم|دهم|dh)?/i);
    if (darMatch) {
      const val = parseInt(darMatch[1].replace(/\s/g, ""));
      if (val >= 10000 && val <= 5000000) { max = Math.round(val * 1.15); min = Math.round(val * 0.85); }
    }
  }

  // 8. Bare number fallback (only if not a year and not already found)
  if (min === null && max === null) {
    const bareMatch = text.match(/(\d[\d\s]*\d)/);
    if (bareMatch) {
      const val = parseInt(bareMatch[1].replace(/\s/g, ""));
      if (val >= 10000 && val <= 9000000 && !(val >= 2000 && val <= CURRENT_YEAR)) {
        max = Math.round(val * 1.15);
        min = Math.round(val * 0.85);
      }
    }
  }

  return { min, max, tolerance };
}

function extractYear(text: string): { min: number | null; max: number | null } {
  let min: number | null = null;
  let max: number | null = null;

  const sinceMatch = text.match(/(?:depuis|a partir de|apres)\s*(\d{4})/i);
  if (sinceMatch) { const year = parseInt(sinceMatch[1]); if (year >= 2000 && year <= CURRENT_YEAR + 1) min = year; }

  const beforeMatch = text.match(/(?:avant|jusqua)\s*(\d{4})/i);
  if (beforeMatch) { const year = parseInt(beforeMatch[1]); if (year >= 2000 && year <= CURRENT_YEAR + 1) max = year; }

  if (min === null && max === null) {
    const yearMatch = text.match(/(?<!\d)(20[0-2]\d)(?!\d)/g);
    if (yearMatch) {
      const years = yearMatch.map(Number).filter((y) => y >= 2000 && y <= CURRENT_YEAR + 1);
      if (years.length === 1) { min = years[0]; max = years[0] + 1; }
      else if (years.length >= 2) { min = Math.min(...years); max = Math.max(...years); }
    }
  }

  return { min, max };
}

function extractKmMax(text: string): number | null {
  const kmMatch = text.match(/(?:moins de|sous|max|maximum)\s*(\d[\d\s]*)\s*(?:km|كيلومتر)/i);
  if (kmMatch) { const val = parseInt(kmMatch[1].replace(/\s/g, "")); if (val > 0 && val <= 500000) return val; }
  const kmExact = text.match(/(\d[\d\s]*)\s*(?:km|كيلومتر)/i);
  if (kmExact) { const val = parseInt(kmExact[1].replace(/\s/g, "")); if (val > 0 && val <= 500000) return val; }
  return null;
}

// --- Model extraction ---
// After brand is found, look for known model names after the brand
const KNOWN_MODELS: Record<string, string[]> = {
  "Dacia": ["Duster", "Sandero", "Logan", "Spring", "Jogger"],
  "Renault": ["Clio", "Captur", "Kadjar", "Koleos", "Megane", "Symbol", "Duster"],
  "Peugeot": ["208", "2008", "308", "3008", "5008", "206", "301", "408"],
  "Toyota": ["Yaris", "Corolla", "RAV4", "Hilux", "Land Cruiser", "C-HR", "Aygo", "Camry"],
  "Hyundai": ["i10", "i20", "i30", "Tucson", "Kona", "Santa Fe", "Accent", "Bayon"],
  "Kia": ["Picanto", "Rio", "Ceed", "Sportage", "Sorento", "Stonic", "Niro"],
  "Volkswagen": ["Golf", "Polo", "T-Roc", "Tiguan", "Touareg", "Passat", "Caddy"],
  "BMW": ["Serie 1", "Serie 2", "Serie 3", "Serie 5", "X1", "X3", "X5"],
  "Mercedes": ["Classe A", "Classe B", "Classe C", "Classe E", "GLA", "GLC", "GLE"],
  "Audi": ["A1", "A3", "A4", "Q2", "Q3", "Q5"],
  "Ford": ["Fiesta", "Focus", "Puma", "Kuga", "Ranger"],
  "Fiat": ["500", "Panda", "Tipo"],
  "Nissan": ["Juke", "Qashqai", "X-Trail", "Micra", "Pick-up"],
  "Opel": ["Corsa", "Astra", "Mokka"],
  "Citroën": ["C1", "C3", "C4", "C5 Aircross", "Berlingo"],
  "Skoda": ["Fabia", "Octavia", "Karoq", "Kodiaq"],
  "Seat": ["Ibiza", "Leon", "Arona", "Tarraco"],
  "Mazda": ["Mazda2", "Mazda3", "CX-3", "CX-5"],
  "Suzuki": ["Swift", "Vitara", "Jimny", "S-Cross"],
  "Honda": ["Civic", "HR-V", "CR-V"],
  "Mitsubishi": ["ASX", "Outlander", "L200"],
  "Jeep": ["Renegade", "Compass", "Grand Cherokee"],
  "MG": ["ZS", "HS", "3", "5", "Marvel R"],
  "BYD": ["Atto 3", "Dolphin", "Seal", "Tang", "Song Plus"],
  "Volvo": ["XC40", "XC60", "XC90"],
  "Porsche": ["Cayenne", "Macan", "Taycan"],
};

function extractModel(text: string, brandCanonical: string | null): string | null {
  if (!brandCanonical) return null;

  const models = KNOWN_MODELS[brandCanonical];
  if (!models) return null;

  const normalized = text.toLowerCase();
  for (const model of models) {
    const modelLower = model.toLowerCase();
    if (normalized.includes(modelLower)) {
      return model;
    }
  }

  return null;
}

// --- Negation handling ---
function applyNegations(text: string, criteria: SearchCriteria): SearchCriteria {
  const result = { ...criteria };
  for (const negation of NEGATION_PATTERNS) {
    if (negation.pattern.test(text)) {
      (result as any)[negation.field] = negation.value;
    }
  }
  return result;
}

// --- Correction detection ---
// "non pas diesel, essence" → replaces fuel
// "finalement 250k" → replaces budget
// "pas Casa, Rabat" → replaces city
function detectCorrection(text: string): { field: string; value: string | null } | null {
  const lower = text.toLowerCase().trim();

  // "pas [X], [Y]" / "non [X], [Y]" / "ma [X], [Y]"
  const correctionPatterns = [
    /(?:pas|non|ma|لا)\s+(?:de\s+|d\s+)?(\w+)\s*[,.]?\s*(\w+)/i,
    /(?:finalement|finalement|au final)\s+(.+)/i,
  ];

  for (const pattern of correctionPatterns) {
    const match = lower.match(pattern);
    if (match) {
      return { field: "raw_correction", value: match[0] };
    }
  }

  return null;
}

// --- Main parser ---
export function parseQuery(query: string): SearchCriteria {
  const normalized = normalizeText(query);
  const originalLower = query.toLowerCase().trim();

  let carrosserie: string | null = null;
  for (const [key, value] of Object.entries(CARROSSERIES)) {
    if (normalized.includes(key)) { carrosserie = value; break; }
  }

  let motorisation: string | null = null;
  for (const [key, value] of Object.entries(FUELS)) {
    if (normalized.includes(key)) { motorisation = value; break; }
  }

  let transmission: string | null = null;
  for (const [key, value] of Object.entries(TRANSMISSIONS)) {
    if (hasKeyword(normalized, key)) { transmission = value; break; }
  }

  let marque: string | null = null;
  for (const brand of BRANDS) {
    const b = brand.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized.includes(b)) { marque = CANONICAL_BRANDS[brand] ?? brand; break; }
  }

  const modele = extractModel(originalLower, marque);

  let ville: string | null = null;
  for (const city of CITIES) {
    const c = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized.includes(c)) { ville = city; break; }
  }

  const { min: budgetMin, max: budgetMax, tolerance: budgetTolerance } = extractBudget(normalized);
  const { min: anneeMin, max: anneeMax } = extractYear(normalized);
  const kmMax = extractKmMax(normalized);

  const intent: string[] = [];
  for (const [key, keywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const kw of keywords) {
      if (normalized.includes(kw.toLowerCase())) { intent.push(key); break; }
    }
  }

  let criteria: SearchCriteria = {
    carrosserie, motorisation, transmission, marque, modele,
    budgetMin, budgetMax, budgetTolerance,
    ville, anneeMin, anneeMax, kmMax, intent,
  };

  // Apply negations AFTER extraction (overrides)
  criteria = applyNegations(originalLower, criteria);

  return criteria;
}

// --- Criteria diff for corrections ---
// Returns only the fields that changed compared to previous criteria
export function diffCriteria(prev: SearchCriteria, next: SearchCriteria): Partial<SearchCriteria> {
  const changes: Partial<SearchCriteria> = {};
  const fields: (keyof SearchCriteria)[] = [
    "carrosserie", "motorisation", "transmission", "marque", "modele",
    "ville", "anneeMin", "anneeMax", "kmMax",
  ];

  for (const field of fields) {
    if (next[field] !== null && next[field] !== prev[field]) {
      (changes as any)[field] = next[field];
    }
  }

  // Budget is special: compare min/max separately
  if (next.budgetMax !== null && next.budgetMax !== prev.budgetMax) {
    changes.budgetMax = next.budgetMax;
  }
  if (next.budgetMin !== null && next.budgetMin !== prev.budgetMin) {
    changes.budgetMin = next.budgetMin;
  }

  // Intent: only report new intents
  const newIntents = next.intent.filter((i) => !prev.intent.includes(i));
  if (newIntents.length > 0) {
    changes.intent = newIntents;
  }

  return changes;
}
