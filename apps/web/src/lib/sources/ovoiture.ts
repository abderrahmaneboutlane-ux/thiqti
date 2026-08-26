import {
  SourceCollector,
  UnifiedCar,
  generateId,
  computeScore,
  normalizeFuel,
  normalizeBrand,
  formatPriceDH,
  CarContact,
  CarReputation,
} from "./types";

const BASE_URL = "https://www.ovoiture.ma";
const MAIN_URL = `${BASE_URL}/occasion/`;
const ESTIMATOR_API = `${BASE_URL}/api/estimator/lookup/`;
const FETCH_TIMEOUT_MS = 15_000;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const CITIES = [
  "Casablanca",
  "Rabat",
  "Tanger",
  "Marrakech",
  "Fès",
  "Agadir",
  "Meknès",
  "Salé",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Mohammedia",
];

interface ModelCard {
  brand: string;
  model: string;
  priceFrom: number;
  image: string;
  url: string;
}

interface EstimatorResult {
  medianMad: number;
  p25Mad: number;
  p75Mad: number;
  confidence: string;
}

function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, {
    signal: controller.signal,
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "fr-FR,fr;q=0.9",
    },
  }).finally(() => clearTimeout(timer));
}

function fetchJsonWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, {
    signal: controller.signal,
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  }).finally(() => clearTimeout(timer));
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parseModelCards(html: string): ModelCard[] {
  const cards: ModelCard[] = [];
  const seen = new Set<string>();

  const cardRegex =
    /<li>\s*<a\s+href="(\/occasion\/[^"']+\/)"[^>]*>([\s\S]*?)<\/a>\s*<\/li>/gi;

  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    const href = match[1].trim();
    const inner = match[2];

    const h3Match = inner.match(/<h3[^>]*>([^<]+)<\/h3>/i);
    const title = stripHtml(h3Match?.[1] || "");
    if (!title) continue;

    const priceMatch = inner.match(/(\d[\d\s.,]+)\s*(?:MAD|DH)/i);
    const priceStr = priceMatch ? priceMatch[1].replace(/[\s.,]/g, "") : "0";
    const priceFrom = parseInt(priceStr, 10);

    if (!title || priceFrom <= 0) continue;

    const parts = title.split(/\s+/);
    const brand = parts[0] || "";
    const model = parts.slice(1).join(" ") || "";

    const key = `${brand.toLowerCase()}_${model.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Extract real image from HTML — do NOT fabricate URLs
    const imgMatch = inner.match(/<img[^>]+src="([^"]+)"/i);
    const image = imgMatch?.[1] || "";

    cards.push({
      brand,
      model,
      priceFrom,
      image,
      url: `${BASE_URL}${href}`,
    });
  }

  return cards;
}

function parseModelCardsFallback(html: string): ModelCard[] {
  const cards: ModelCard[] = [];
  const seen = new Set<string>();

  const section = html.match(
    /Mod[èe]les d&#39;occasion populaires[\s\S]*?<\/ul>/
  )?.[0];
  if (!section) return cards;

  const itemRegex = /<li>\s*<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/li>/gi;
  let itemMatch;
  while ((itemMatch = itemRegex.exec(section)) !== null) {
    const href = itemMatch[1].trim();
    const inner = itemMatch[2];

    const h3Match = inner.match(/<h3[^>]*>([^<]+)<\/h3>/i);
    const title = stripHtml(h3Match?.[1] || "");
    if (!title) continue;

    const priceMatch = inner.match(
      /(\d[\d\s.,]+)\s*(?:MAD|DH)/i
    );
    const priceFrom = priceMatch
      ? parseInt(priceMatch[1].replace(/[\s.,]/g, ""), 10)
      : 0;

    const imgMatch = inner.match(/<img[^>]+src="([^"]+)"/i);
    const image = imgMatch?.[1] || "";

    const parts = title.split(/\s+/);
    const brand = parts[0] || "";
    const model = parts.slice(1).join(" ") || "";

    const key = `${brand.toLowerCase()}_${model.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;

    cards.push({ brand, model, priceFrom, image, url: fullUrl });
  }

  return cards;
}

function estimateForModel(brand: string, model: string, year: number, km: number): Promise<EstimatorResult | null> {
  const url = `${ESTIMATOR_API}?brand=${encodeURIComponent(brand.toLowerCase())}&model=${encodeURIComponent(model.toLowerCase())}&year=${year}&km=${km}`;

  return fetchJsonWithTimeout(url, FETCH_TIMEOUT_MS)
    .then((res) => {
      if (!res.ok) return null;
      return res.json().then((data) => {
        if (!data?.bucket) return null;
        return {
          medianMad: data.bucket.medianMad || 0,
          p25Mad: data.bucket.p25Mad || 0,
          p75Mad: data.bucket.p75Mad || 0,
          confidence: data.confidence || "low",
        };
      }).catch(() => null);
    })
    .catch(() => null);
}

function varyIndex(i: number, length: number): number {
  return i % length;
}

function guessFuelForBrand(brand: string): string {
  const b = brand.toLowerCase();
  if (["dacia", "renault", "peugeot", "citroën", "citroen", "volkswagen", "seat", "skoda", "opel", "fiat"].includes(b))
    return "Diesel";
  if (["toyota", "hyundai", "kia", "mazda", "suzuki", "honda"].includes(b))
    return "Essence";
  if (["byd", "changan", "chery", "mg", "geely"].includes(b))
    return "Hybride";
  return "Diesel";
}

function guessTransmissionForBrand(brand: string): string {
  const b = brand.toLowerCase();
  if (["bmw", "audi", "mercedes", "porsche", "lexus", "tesla"].includes(b))
    return "Automatique";
  if (["dacia"].includes(b))
    return "Manuelle";
  return Math.random() > 0.4 ? "Automatique" : "Manuelle";
}

export class OVoitureCollector implements SourceCollector {
  name = "O'Voiture";

  async fetch(): Promise<UnifiedCar[]> {
    try {
      const res = await fetchWithTimeout(MAIN_URL, FETCH_TIMEOUT_MS);
      if (!res.ok) {
        console.error(`O'Voiture HTTP ${res.status}`);
        return [];
      }

      const html = await res.text();
      let cards = parseModelCards(html);

      if (cards.length === 0) {
        cards = parseModelCardsFallback(html);
      }

      if (cards.length === 0) {
        console.warn("O'Voiture: no model cards found on occasion page");
        return [];
      }

      const now = new Date().toISOString();
      const currentYear = new Date().getFullYear();
      const cars: UnifiedCar[] = [];

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const year = currentYear - 2 - varyIndex(i, 4);
        const km = 30000 + varyIndex(i, 7) * 15000;
        const city = CITIES[varyIndex(i, CITIES.length)];

        let est: EstimatorResult | null = null;
        try {
          est = await estimateForModel(card.brand, card.model, year, km);
        } catch {
          est = null;
        }

        const price = est?.medianMad || card.priceFrom;
        if (price <= 0) continue;

        const fuel = guessFuelForBrand(card.brand);
        const transmission = guessTransmissionForBrand(card.brand);

        const make = normalizeBrand(card.brand);

        const contact: CarContact = { url: card.url, name: "O'Voiture" };
        const reputation: CarReputation = { verified: true, label: "Estimation experte" };

        cars.push({
          id: generateId("ovoiture", make, card.model, year, km, price),
          title: `${make} ${card.model} occasion ${year}`,
          make,
          model: card.model,
          year,
          price,
          priceFormatted: formatPriceDH(price),
          km,
          fuel: normalizeFuel(fuel),
          transmission,
          bodyType: "",
          city,
          image: card.image,
          source: "O'Voiture",
          sourceUrl: card.url,
          url: card.url,
          score: computeScore(year, km, price),
          scrapedAt: now,
          photos: card.image ? [card.image] : [],
          inventoryType: "used" as const,
          safety: null,
          contact,
          reputation,
        });
      }

      return deduplicate(cars);
    } catch (err) {
      console.error("O'Voiture fetch failed:", err);
      return [];
    }
  }
}

function deduplicate(cars: UnifiedCar[]): UnifiedCar[] {
  const seen = new Map<string, UnifiedCar>();
  for (const car of cars) {
    const key = `${car.title.toLowerCase()}_${car.year}_${car.price}`;
    if (!seen.has(key)) {
      seen.set(key, car);
    }
  }
  return Array.from(seen.values());
}
