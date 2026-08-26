import { UnifiedCar, CarContact, CarReputation } from "./types";
import { telHref, whatsappHref, displayPhone, normalizeIntlPhone } from "./contact";
import { normalizeBrand } from "./types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const MONTHS_FR: Record<string, string> = {
  jan: "janvier", feb: "février", mar: "mars", apr: "avril",
  may: "mai", jun: "juin", jul: "juillet", aug: "août",
  sep: "septembre", oct: "octobre", nov: "novembre", dec: "décembre",
};

export interface EnrichedSpecs {
  transmission?: string;
  bodyType?: string;
  horsepower?: number;
  engine?: string;
  doors?: number;
  seats?: number;
  trunkVolume?: string;
  dimensions?: string;
  consumption?: string;
  co2?: string;
  acceleration?: string;
  color?: string;
}

export interface EnrichedData {
  contact?: CarContact;
  reputation?: CarReputation;
  specs?: EnrichedSpecs;
  googleSource?: string;
}

interface CacheEntry {
  data: EnrichedData;
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 60 * 1000;

function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, {
    signal: controller.signal,
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "fr-FR,fr;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/json",
    },
  }).finally(() => clearTimeout(timer));
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toNumber(raw: string): number {
  return Number(raw.replace(/[^\d]/g, "")) || 0;
}

// ─── Phase 1 : Scrape la page source pour contact + specs ───

function parseSourcePage(html: string): { contact?: CarContact; reputation?: CarReputation; specs?: EnrichedData["specs"] } {
  const contact: CarContact = {};
  const reputation: CarReputation = {};
  const specs: EnrichedData["specs"] = {};

  // ── Contact ──
  const sellerSection = html.split("Publié par")[1]?.split("Informations Contact")[0] ?? "";
  const sellerName = stripHtml(sellerSection.match(/<h4[^>]*>([^<]+)<\/h4>/)?.[1] || "");
  if (sellerName) contact.name = sellerName;

  const sellerSinceRaw = sellerSection.match(/Vendeur depuis\s*([A-Za-z]{3,9})\s+(\d{4})/i);
  if (sellerSinceRaw) {
    const month = MONTHS_FR[sellerSinceRaw[1].toLowerCase()] || sellerSinceRaw[1];
    reputation.sellerSince = `Vendeur depuis ${month} ${sellerSinceRaw[2]}`;
  }

  const phone = html.match(/tel:(\+?\d+)/)?.[1] || html.match(/\b0[5-7]\d{8}\b/)?.[0];
  if (phone) {
    contact.phone = displayPhone(phone);
    contact.phoneHref = telHref(phone);
  }

  const whatsapp = html.match(/wa\.me\/(\d+)/)?.[1];
  if (whatsapp) {
    contact.whatsappHref = `https://wa.me/${whatsapp}`;
  }

  // ── Reputation ──
  const reviewsMatch = html.match(/Basé\s+sur\s+(\d+)\s+avis/i);
  const reviews = reviewsMatch ? Number(reviewsMatch[1]) : 0;
  const ratingMatch = html.match(/(\d)\s*<small>\/5<\/small>/);
  const rating5 = ratingMatch ? Number(ratingMatch[1]) : undefined;

  if (reviews > 0) {
    reputation.reviews = reviews;
    if (rating5 !== undefined) reputation.rating5 = rating5;
  }

  reputation.verified = Boolean(contact.phoneHref || contact.whatsappHref || contact.name || reputation.sellerSince);
  reputation.label = reputation.verified ? "Annonce vérifiée" : undefined;

  // ── Specs détaillées (si disponibles sur la page source) ──
  const transMatch = html.match(/(?:Bo[iî]te|Transmission)\s*[:»]\s*([^<\n]+)/i);
  if (transMatch) specs.transmission = stripHtml(transMatch[1]);

  const hpMatch = html.match(/(\d{2,3})\s*(?:ch|cv|hp|chevaux)/i);
  if (hpMatch) specs.horsepower = Number(hpMatch[1]);

  const engineMatch = html.match(/(?:Moteur|Cylindrée|Engine)\s*[:»]\s*([^<\n]{3,30})/i);
  if (engineMatch) specs.engine = stripHtml(engineMatch[1]);

  const doorsMatch = html.match(/(\d)\s*portes?/i);
  if (doorsMatch) specs.doors = Number(doorsMatch[1]);

  const seatsMatch = html.match(/(\d)\s*(?:places?|sièges?)/i);
  if (seatsMatch) specs.seats = Number(seatsMatch[1]);

  const trunkMatch = html.match(/(?:Coffre|Volume coffre)\s*[:»]\s*(\d[\d\s]*(?:litres?|l))/i);
  if (trunkMatch) specs.trunkVolume = stripHtml(trunkMatch[1]);

  const consumptionMatch = html.match(/(?:Consommation)\s*[:»]\s*([\d.,]+\s*(?:l|L)\/100)/i);
  if (consumptionMatch) specs.consumption = stripHtml(consumptionMatch[1]);

  const co2Match = html.match(/(?:CO2|Émissions)\s*[:»]\s*(\d+)\s*g/i);
  if (co2Match) specs.co2 = `${co2Match[1]} g/km`;

  const accelMatch = html.match(/(?:0\s*à\s*100|Acceleration)\s*[:»]\s*([\d.,]+)\s*s/i);
  if (accelMatch) specs.acceleration = `${stripHtml(accelMatch[1])}s`;

  const colorMatch = html.match(/(?:Couleur)\s*[:»]\s*([^<\n]{3,20})/i);
  if (colorMatch) specs.color = stripHtml(colorMatch[1]);

  const bodyMatch = html.match(/(?:Carrosserie|Type)\s*[:»]\s*([^<\n]{3,20})/i);
  if (bodyMatch) specs.bodyType = stripHtml(bodyMatch[1]);

  return {
    contact: Object.keys(contact).length > 0 ? contact : undefined,
    reputation: Object.keys(reputation).length > 0 ? reputation : undefined,
    specs: Object.keys(specs).length > 0 ? specs : undefined,
  };
}

// ─── Phase 2 : Google Custom Search pour fiche technique ───

interface GoogleResult {
  title: string;
  link: string;
  snippet: string;
}

async function googleSearch(query: string): Promise<GoogleResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;
  if (!apiKey || !cx) return [];

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=5&lr=lang_fr`;
  try {
    const res = await fetchWithTimeout(url, 8000);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((item: GoogleResult) => ({
      title: item.title || "",
      link: item.link || "",
      snippet: item.snippet || "",
    }));
  } catch {
    return [];
  }
}

function parseGoogleSnippet(snippet: string): EnrichedSpecs {
  const specs: EnrichedSpecs = {};

  const hpMatch = snippet.match(/(\d{2,3})\s*(?:ch|cv|hp|chevaux)/i);
  if (hpMatch) specs.horsepower = Number(hpMatch[1]);

  const engineMatch = snippet.match(/([\d.,]+)\s*(?:litres?|L)\s*(?:essence|diesel|hybride)?/i);
  if (engineMatch) specs.engine = `${engineMatch[1]}L`;

  const transMatch = snippet.match(/(automatique|manuelle|automatique|bo[iî]te\s*(?:auto|manuelle))/i);
  if (transMatch) specs.transmission = transMatch[1].charAt(0).toUpperCase() + transMatch[1].slice(1);

  const consumptionMatch = snippet.match(/([\d.,]+)\s*(?:l|L)\/100\s*km/i);
  if (consumptionMatch) specs.consumption = `${consumptionMatch[1]} L/100km`;

  const co2Match = snippet.match(/(\d+)\s*g\s*(?:de\s*)?CO2/i);
  if (co2Match) specs.co2 = `${co2Match[1]} g/km`;

  const accelMatch = snippet.match(/(\d[.,]?\d?)\s*s\s*(?:pour|à)\s*100/i);
  if (accelMatch) specs.acceleration = `${accelMatch[1]}s`;

  const seatsMatch = snippet.match(/(\d)\s*places?/i);
  if (seatsMatch) specs.seats = Number(seatsMatch[1]);

  const trunkMatch = snippet.match(/(\d+)\s*(?:litres?|l)\s*(?:de\s*)?coffre/i);
  if (trunkMatch) specs.trunkVolume = `${trunkMatch[1]}L`;

  return Object.keys(specs).length > 0 ? specs : {};
}

function parseGoogleForContact(snippet: string, link: string): CarContact | undefined {
  const contact: CarContact = {};

  const phone = snippet.match(/\b0[5-7]\d{8}\b/)?.[0];
  if (phone) {
    contact.phone = displayPhone(phone);
    contact.phoneHref = telHref(phone);
  }

  const waMatch = snippet.match(/wa\.me\/(\d+)/);
  if (waMatch) {
    contact.whatsappHref = `https://wa.me/${waMatch[1]}`;
  }

  if (link && !link.includes("google.") && !link.includes("wikipedia")) {
    contact.url = link;
  }

  return Object.keys(contact).length > 0 ? contact : undefined;
}

// ─── Orchestrateur ───

export async function enrichCarDetails(car: UnifiedCar): Promise<EnrichedData> {
  const cacheKey = `${car.make}_${car.model}_${car.year}_${car.sourceUrl}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const result: EnrichedData = {};

  // Phase 1 : Scrape la page source
  if (car.sourceUrl) {
    try {
      const res = await fetchWithTimeout(car.sourceUrl, 8000);
      if (res.ok) {
        const html = await res.text();
        const parsed = parseSourcePage(html);
        if (parsed.contact) result.contact = parsed.contact;
        if (parsed.reputation) result.reputation = parsed.reputation;
        if (parsed.specs) result.specs = parsed.specs;
      }
    } catch {}
  }

  // Phase 2 : Google si pas de phone/WhatsApp
  const hasContact = result.contact && (result.contact.phoneHref || result.contact.whatsappHref);
  if (!hasContact) {
    const queries = [
      `${car.make} ${car.model} ${car.year} téléphone vendeur Maroc`,
      `${car.make} ${car.model} ${car.year} fiche technique`,
    ];

    for (const q of queries) {
      const results = await googleSearch(q);
      if (results.length === 0) continue;

      // Chercher contact dans les snippets
      for (const r of results) {
        const googleContact = parseGoogleForContact(r.snippet, r.link);
        if (googleContact) {
          if (!result.contact) result.contact = {};
          if (googleContact.phone && !result.contact.phone) {
            result.contact.phone = googleContact.phone;
            result.contact.phoneHref = googleContact.phoneHref;
          }
          if (googleContact.whatsappHref && !result.contact.whatsappHref) {
            result.contact.whatsappHref = googleContact.whatsappHref;
          }
          if (googleContact.url && !result.contact.url) {
            result.contact.url = googleContact.url;
          }
          result.googleSource = r.link;
          break;
        }
      }

      // Chercher specs dans les snippets
      const currentSpecCount = result.specs ? Object.keys(result.specs).length : 0;
      if (currentSpecCount < 3) {
        for (const r of results) {
          const googleSpecs = parseGoogleSnippet(r.snippet);
          if (Object.keys(googleSpecs).length > currentSpecCount) {
            result.specs = { ...result.specs, ...googleSpecs };
            result.googleSource = result.googleSource || r.link;
          }
        }
      }

      if (result.contact && result.specs) break;
    }
  }

  // Phase 2b : Google pour specs même si contact existe déjà
  const finalSpecCount = result.specs ? Object.keys(result.specs).length : 0;
  if (finalSpecCount < 3) {
    const specQuery = `${car.make} ${car.model} ${car.year} fiche technique moteur puissance`;
    const specResults = await googleSearch(specQuery);
    for (const r of specResults) {
      const googleSpecs = parseGoogleSnippet(r.snippet);
      if (Object.keys(googleSpecs).length > finalSpecCount) {
        result.specs = { ...result.specs, ...googleSpecs };
        result.googleSource = result.googleSource || r.link;
      }
    }
  }

  cache.set(cacheKey, { data: result, ts: Date.now() });
  return result;
}
