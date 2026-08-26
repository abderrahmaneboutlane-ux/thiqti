// ============================================================================
// MOTEUR.MA — ANNONCES OCCASION REELLES AU MAROC (SCRAPING LEGER)
// ============================================================================

import { UnifiedCar, SourceCollector, BRAND_ALIASES, normalizeFuel, formatPriceDH, computeScore } from "./types";
import { telHref, displayPhone } from "./contact";

const SEARCH_BASE =
  "https://www.moteur.ma/fr/voiture/achat-voiture-occasion/recherche/?per_page=30&page=";
const SEARCH_PAGES = 50;
const REQUEST_TIMEOUT_MS = 5000;
const OVERALL_BUDGET_MS = 120000;
const DETAIL_CONCURRENCY = 15;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const MONTHS_FR: Record<string, string> = {
  jan: "janvier",
  feb: "février",
  mar: "mars",
  apr: "avril",
  may: "mai",
  jun: "juin",
  jul: "juillet",
  aug: "août",
  sep: "septembre",
  oct: "octobre",
  nov: "novembre",
  dec: "décembre",
};

interface MoteurCard {
  id: string;
  url: string;
  title: string;
  image: string;
  price: number;
  km: number;
  year: number;
  fuel: string;
  transmission: string;
  city: string;
}

interface MoteurDetail {
  sellerName?: string;
  sellerSince?: string;
  rating5?: number;
  reviews?: number;
  phone?: string;
  whatsappHref?: string;
}

function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, {
    signal: controller.signal,
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "fr-FR,fr;q=0.9",
      Accept: "text/html,application/xhtml+xml",
    },
  }).finally(() => clearTimeout(timer));
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toNumber(raw: string): number {
  return Number(raw.replace(/[^\d]/g, "")) || 0;
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f\u0653\u0654]+/g, "");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const CITY_STOPWORDS = new Set([
  "casablanca", "rabat", "marrakech", "tanger", "fes", "agadir", "kenitra",
  "oujda", "meknes", "el jadida", "mohammedia", "temara", "sale", "tetouan",
  "berrechid", "settat", "khouribga", "beni mellal", "nador", "laayoune",
  "essaouira", "taza", "safi", "khenifra", "taroudant", "al hoceima",
  "ouarzazate", "khemisset", "errachidia", "guelmim", "tiznit", "dakhla",
]);

export function extractBrandFromTitle(title: string): string | null {
  const search = stripAccents(title.toLowerCase().replace(/[-–—]/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ")).trim();
  if (search.length === 0) return null;
  const padded = ` ${search} `;

  let best: { canonical: string; pos: number } | null = null;
  for (const [alias, canonical] of Object.entries(BRAND_ALIASES)) {
    const key = stripAccents(alias.replace(/[-–—]/g, " ")).trim();
    if (key.length < 2) continue;
    const re = new RegExp(`(^|[^a-z])${escapeRegExp(key)}([^a-z]|$)`, "i");
    const m = padded.match(re);
    if (!m) continue;
    const pos = (m.index || 0) + m[1].length;
    if (!best || pos < best.pos) best = { canonical, pos };
  }
  return best ? best.canonical : null;
}

export function extractModelFromTitle(title: string, make: string): string {
  const words = title.replace(/[-–—]+/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").split(/\s+/).filter(Boolean);
  const norm = (w: string) => stripAccents(w.toLowerCase());

  if (words.length > 1 && /^\d{3,4}$/.test(words[0]) && extractBrandFromTitle(words.slice(1).join(" "))) {
    words.shift();
  }

  const makeWords = new Set(norm(make).split(/\s+/).filter(Boolean));
  const makeAliasWords = new Set<string>();
  for (const [alias, canonical] of Object.entries(BRAND_ALIASES)) {
    if (canonical !== make) continue;
    for (const w of norm(alias).split(/\s+/).filter(Boolean)) makeAliasWords.add(w);
  }
  const rest = words.filter((w) => !makeWords.has(norm(w)) && !makeAliasWords.has(norm(w)));

  while (rest.length > 0 && CITY_STOPWORDS.has(norm(rest[0]))) rest.shift();

  return rest.join(" ") || title;
}

function parseCard(block: string): MoteurCard | null {
  const linkMatch = block.match(/detail-annonce\/(\d+)\/([^"']+)\.html/);
  if (!linkMatch) return null;
  const id = linkMatch[1];
  const url = `https://www.moteur.ma/fr/voiture/achat-voiture-occasion/detail-annonce/${linkMatch[1]}/${linkMatch[2]}.html`;

  const title = stripHtml(block.match(/ads-index-title">([^<]*)<\/h5>/)?.[1] || "");
  const image = block.match(/<img[^>]*src="([^"]+)"/)?.[1] || "";
  const price = toNumber(block.match(/ad-price-grid"[^>]*>\s*([\d\s.,]+)\s*MAD/i)?.[1] || "");
  const year = toNumber(block.match(/fa-calendar me-1"><\/i>\s*([\d]{4})/)?.[1] || "");
  const km = toNumber(block.match(/fa-road me-1"><\/i>\s*([\d\s.,]+)\s*km/i)?.[1] || "");
  const fuelRaw = block.match(/fa-tachometer me-1"><\/i>\s*([^<]+)/)?.[1] || "";
  const transmission = stripHtml(block.match(/fa-cog me-1"><\/i>\s*([^<]+)/)?.[1] || "");
  const city = stripHtml(block.match(/fa-map-marker[^>]*><\/i>\s*([^<]+)/)?.[1] || "");

  if (!title || price <= 0) return null;
  return {
    id,
    url,
    title,
    image,
    price,
    km,
    year,
    fuel: normalizeFuel(fuelRaw),
    transmission: transmission || "Non précisé",
    city: city || "Maroc",
  };
}

function parseSearchPage(html: string): MoteurCard[] {
  const cards: MoteurCard[] = [];
  const parts = html.split('<div class="ad-col col-12">');
  for (let i = 1; i < parts.length; i++) {
    const card = parseCard(parts[i]);
    if (card && !cards.some((c) => c.id === card.id)) cards.push(card);
  }
  return cards;
}

async function fetchDetail(url: string): Promise<MoteurDetail | null> {
  try {
    const res = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
    if (!res.ok) return null;
    const html = await res.text();

    const sellerSection = html.split("Publié par")[1]?.split("Informations Contact")[0] ?? "";
    const sellerName = stripHtml(sellerSection.match(/<h4[^>]*>([^<]+)<\/h4>/)?.[1] || "");
    const sellerSinceRaw = sellerSection.match(/Vendeur depuis\s*([A-Za-z]{3,9})\s+(\d{4})/i);
    const sellerSince = sellerSinceRaw
      ? `Vendeur depuis ${MONTHS_FR[sellerSinceRaw[1].toLowerCase()] || sellerSinceRaw[1]} ${sellerSinceRaw[2]}`
      : undefined;

    const reviewsMatch = html.match(/Basé\s+sur\s+(\d+)\s+avis/i);
    const reviews = reviewsMatch ? Number(reviewsMatch[1]) : 0;
    const ratingMatch = html.match(/(\d)\s*<small>\/5<\/small>/);
    const rating5 = ratingMatch ? Number(ratingMatch[1]) : undefined;

    const phone = html.match(/tel:(\+?\d+)/)?.[1] || html.match(/\b0[5-7]\d{8}\b/)?.[0] || undefined;
    const whatsapp = html.match(/wa\.me\/(\d+)/)?.[1] || undefined;

    if (!phone && !whatsapp && !sellerName && !sellerSince && rating5 === undefined) return null;

    return {
      sellerName: sellerName || undefined,
      sellerSince,
      rating5: reviews > 0 ? rating5 : undefined,
      reviews: reviews > 0 ? reviews : undefined,
      phone,
      whatsappHref: whatsapp ? `https://wa.me/${whatsapp}` : undefined,
    };
  } catch {
    return null;
  }
}

async function attachDetails(cards: MoteurCard[], deadline: number): Promise<Map<string, MoteurDetail>> {
  const map = new Map<string, MoteurDetail>();
  let index = 0;
  const workers = Array.from({ length: DETAIL_CONCURRENCY }, async () => {
    while (index < cards.length && Date.now() < deadline) {
      const card = cards[index++];
      const detail = await fetchDetail(card.url);
      if (detail) map.set(card.id, detail);
    }
  });
  await Promise.all(workers);
  return map;
}

export async function fetchMoteurCars(): Promise<UnifiedCar[]> {
  const startedAt = Date.now();
  const deadline = startedAt + OVERALL_BUDGET_MS;

  const cards: MoteurCard[] = [];
  for (let page = 1; page <= SEARCH_PAGES && Date.now() < deadline; page++) {
    try {
      const res = await fetchWithTimeout(`${SEARCH_BASE}${page}`, REQUEST_TIMEOUT_MS);
      if (!res.ok) break;
      const html = await res.text();
      cards.push(...parseSearchPage(html));
    } catch {
      break;
    }
  }

  if (cards.length === 0) return [];

  const details = await attachDetails(cards, deadline);

  return cards.map((card) => {
    const detail = details.get(card.id);
    const make = extractBrandFromTitle(card.title) ?? "Autre";
    const model = extractModelFromTitle(card.title, make);

    return {
      id: `moteur_${card.id}`,
      title: card.title,
      make,
      model,
      year: card.year || 0,
      price: card.price,
      priceFormatted: formatPriceDH(card.price),
      km: card.km,
      fuel: card.fuel,
      transmission: card.transmission,
      bodyType: "Non précisé",
      city: card.city,
      image: card.image,
      source: "Moteur.ma (annonces)",
      sourceUrl: card.url,
      url: card.url,
      score: computeScore(card.year || 2020, card.km, card.price),
      scrapedAt: new Date().toISOString(),
      photos: card.image ? [card.image] : [],
      inventoryType: "used",
      safety: null,
      contact: {
        name: detail?.sellerName || "Vendeur Moteur.ma",
        phone: displayPhone(detail?.phone),
        phoneHref: telHref(detail?.phone),
        whatsappHref: detail?.whatsappHref,
        url: card.url,
      },
      reputation: {
        verified: Boolean(
          detail && (detail.phone || detail.whatsappHref || detail.sellerName || detail.sellerSince)
        ),
        rating5: detail?.rating5,
        reviews: detail?.reviews,
        sellerSince: detail?.sellerSince,
        label: detail ? "Annonce vérifiée" : "Annonce réelle Moteur.ma",
      },
    };
  });
}

export class MoteurCollector implements SourceCollector {
  name = "Moteur.ma";
  async fetch(): Promise<UnifiedCar[]> { return fetchMoteurCars(); }
}
