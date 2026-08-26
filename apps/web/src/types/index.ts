export interface ScoreExplanation {
  label: string;
  value: string;
  impact: "positive" | "negative" | "neutral";
  reason: string;
}

export interface CarListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  priceFormatted: string;
  km: number;
  fuel: string;
  city: string;
  image: string;
  photos?: string[];
  score: number;
  source: string;
  url: string;
  transmission?: string;
  bodyType?: string;
  inventoryType?: "new" | "used" | "neuf" | "occasion" | string;
  matchPercent?: number;
  meetsBudget?: boolean;
  explanations?: ScoreExplanation[];
  sellerName?: string;
  sellerPhone?: string;
  whatsappNumber?: string;
  safety?: { stars: number; ratingYear?: number; source?: string; className?: string } | null;
  contact?: { name?: string; phone?: string; phoneHref?: string; whatsappHref?: string; url?: string };
  reputation?: { verified?: boolean; trustBadge?: boolean; views?: number; reviews?: number; rating5?: number; sellerSince?: string; label?: string };
  priceStats?: { min: number; avg: number; max: number; current: number; position: string };
  consumption_l100km?: number;
  co2_gkm?: number;
  trunk_liters?: number;
  engine_power_ch?: number;
  places?: number;
  similar?: CarListing[];
}

export interface ChatMessage {
  id?: number;
  role: "user" | "assistant" | "bot";
  text?: string;
  content?: string;
}

export interface ChatCar {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  priceFormatted: string;
  km: number;
  fuel: string;
  city: string;
  image: string;
  photos?: string[];
  source: string;
  url?: string;
  score: number;
  inventoryType?: "new" | "used" | string;
  bodyType?: string;
  contact?: { name?: string; phone?: string; phoneHref?: string; whatsappHref?: string; url?: string };
  reputation?: { verified?: boolean; trustBadge?: boolean; views?: number; label?: string };
}

export interface SearchCriteria {
  carrosserie: string | null;
  motorisation: string | null;
  transmission: string | null;
  marque: string | null;
  modele?: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetTolerance?: number;
  ville: string | null;
  anneeMin: number | null;
  anneeMax?: number | null;
  kmMax: number | null;
  intent: string[];
}

export interface MarocSourceData { label: string; url: string; note?: string; verifiedAt?: string }
export interface MarocSocialData { network: string; label: string; url: string; followers?: number; verifiedAt?: string }
export interface MarocTestData { model: string; title: string; url: string; verdict?: string; verifiedAt?: string }
export interface MarocBrandData { make: string; distributor?: string; officialSite?: MarocSourceData | null; resellers?: MarocSourceData | null; socials: MarocSocialData[]; tests: MarocTestData[]; verifiedAt: string }
export interface MarocReputationData { brand: MarocBrandData | null; tests: MarocTestData[] }

export interface ReputationData {
  modelKey: string;
  dataAvailable?: boolean;
  totalReviews: number;
  avgScore: number | null;
  windowMonths: number;
  lastUpdated: string;
  positiveTags?: string[];
  negativeTags?: string[];
  categories: { name: string; score: number | null }[];
  excerpts: { text: string; sentiment: "positive" | "negative" | "neutral"; score: number }[];
  volume: { total: number; positive: number; negative: number; neutral: number };
  reliability?: "elevee" | "moyenne" | "faible";
  reliabilityLabel?: string;
  maroc?: MarocReputationData | null;
}
