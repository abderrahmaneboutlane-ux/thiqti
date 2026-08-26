import { UnifiedCar, SourceCollector, generateId, computeScore, normalizeBrand, normalizeFuel, CarContact, CarReputation } from "./types";
import { normalizeIntlPhone, displayPhone, telHref, whatsappHref } from "./contact";

const AVITO_URLS = [
  "https://www.avito.ma/fr/maroc/voitures-%C3%A0_vendre",
  "https://www.avito.ma/fr/casablanca/voitures-%C3%A0_vendre",
  "https://www.avito.ma/fr/rabat/voitures-%C3%A0_vendre",
  "https://www.avito.ma/fr/marrakech/voitures-%C3%A0_vendre",
];

interface AvitoListing {
  title: string;
  year: number;
  km: number;
  transmission: string;
  fuel: string;
  price: number;
  city: string;
  url: string;
  image: string;
  images: string[];
}

function cleanText(t: string): string {
  return t
    .replace(/ChevronLeft Icon|ChevronRight Icon|CrownFill Icon|Save ad|UpwardArrow Icon|Phone Icon|Heart Icon/g, "")
    .replace(/\d+DH\/mois/g, "")
    .replace(/il y a .+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseListing(rawText: string, href: string): AvitoListing | null {
  const text = cleanText(rawText);
  if (text.length < 15) return null;

  const priceMatch = text.match(/([\d\s]+)\s*DH(?!\s*\/)/);
  let price = 0;
  if (priceMatch) {
    price = parseInt(priceMatch[1].replace(/\s/g, ""));
  }
  if (price <= 0 || price > 5000000) return null;

  const kmMatch = text.match(/([\d,.\s]+)\s*km/i);
  let km = 0;
  if (kmMatch) {
    km = parseInt(kmMatch[1].replace(/[,.\s]/g, ""));
  }

  const yearMatch = text.match(/\b(20[0-2]\d|199\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[0]) : 0;
  if (year < 2005) return null;

  const lower = text.toLowerCase();
  let fuel = "";
  if (lower.includes("diesel")) fuel = "Diesel";
  else if (lower.includes("essence")) fuel = "Essence";
  else if (lower.includes("hybride") || lower.includes("hybrid")) fuel = "Hybride";
  else if (lower.includes("electrique") || lower.includes("electrique")) fuel = "Électrique";

  let transmission = "";
  if (lower.includes("automatique")) transmission = "Automatique";
  else if (lower.includes("manuelle")) transmission = "Manuelle";

  let title = "";
  const yearStr = String(year);
  const yearIdx = text.indexOf(yearStr);
  if (yearIdx > 5) {
    title = text.substring(0, yearIdx).trim();
  } else {
    title = text.substring(0, Math.min(60, text.length)).trim();
  }
  title = title.replace(/^Save ad\s*/i, "").replace(/^StarFill Icon\s*/i, "").trim();
  if (title.length < 5) return null;

  const cityMap: Record<string, string> = {
    casablanca: "Casablanca", rabat: "Rabat", marrakech: "Marrakech", fes: "Fès",
    tanger: "Tanger", agadir: "Agadir", meknes: "Meknès", oujda: "Oujda",
    kenitra: "Kénitra", tetouan: "Tétouan", nador: "Nador", el_jadida: "El Jadida",
    beni_mellal: "Béni Mellal", safi: "Safi", mohammedia: "Mohammedia",
    khouribga: "Khouribga", temara: "Témara", salé: "Salé", dakhla: "Dakhla",
    laayoune: "Laâyoune", boujdour: "Boujdour", kénitra: "Kénitra",
  };
  let city = "Casablanca";
  const urlLower = href.toLowerCase();
  for (const [key, val] of Object.entries(cityMap)) {
    if (urlLower.includes(key)) { city = val; break; }
  }
  const cityInText = text.match(/(?:DH|Prix)[^.]*?(\p{Lu}[\p{L}\s]{2,20})/u);
  if (cityInText) {
    const detected = cityInText[1].trim().replace(/il y a.*/, "").trim();
    if (detected.length > 2 && detected.length < 25) city = detected;
  }

  const fullUrl = href.startsWith("http") ? href : `https://www.avito.ma${href}`;

  return { title, year, km, transmission, fuel, price, city, url: fullUrl, image: "", images: [] };
}

async function scrapePage(url: string): Promise<AvitoListing[]> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "fr-FR",
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(5000);

    const items = await page.evaluate(() => {
      // Try to extract image arrays from embedded JSON (best effort)
      const imageMap: Record<string, string[]> = {};

      function collectImageUrls(obj: unknown, depth: number): string[] {
        if (depth > 6 || obj == null) return [];
        if (typeof obj === "string") {
          return obj.startsWith("http") && /\.(jpg|jpeg|png|webp)/i.test(obj) ? [obj] : [];
        }
        if (Array.isArray(obj)) {
          const urls: string[] = [];
          for (const item of obj) {
            urls.push(...collectImageUrls(item, depth + 1));
          }
          return urls;
        }
        if (typeof obj === "object") {
          const urls: string[] = [];
          for (const val of Object.values(obj)) {
            urls.push(...collectImageUrls(val, depth + 1));
          }
          return urls;
        }
        return [];
      }

      function extractImagesFromJson(root: unknown): Record<string, string[]> {
        const map: Record<string, string[]> = {};
        if (root == null || typeof root !== "object") return map;

        function search(obj: unknown, depth: number): void {
          if (depth > 8 || obj == null || typeof obj !== "object") return;
          if (Array.isArray(obj)) {
            for (const item of obj) search(item, depth + 1);
            return;
          }
          const record = obj as Record<string, unknown>;
          const lowerKeys = Object.keys(record).map((k) => k.toLowerCase());
          const isImageContext = lowerKeys.some((k) =>
            ["images", "photos", "gallery", "media"].includes(k)
          );
          if (isImageContext) {
            const urls = collectImageUrls(obj, 0);
            if (urls.length > 0) {
              // Try to find a related URL key to use as the map key
              for (const k of Object.keys(record)) {
                const val = record[k];
                if (typeof val === "string" && val.includes("/voiture")) {
                  map[val] = urls;
                  break;
                }
              }
              // If no URL key found, store by index-like key
              if (Object.keys(map).length === 0 || !urls.every((u) =>
                Object.values(map).some((arr) => arr === urls)
              )) {
                const key = `__img_${Object.keys(map).length}`;
                map[key] = urls;
              }
            }
          }
          // Recurse into child properties
          for (const val of Object.values(record)) {
            search(val, depth + 1);
          }
        }

        search(root, 0);
        return map;
      }

      try {
        // Try __NEXT_DATA__
        const nextDataEl = document.querySelector('#__NEXT_DATA__');
        if (nextDataEl?.textContent) {
          const parsed = JSON.parse(nextDataEl.textContent);
          Object.assign(imageMap, extractImagesFromJson(parsed));
        }
      } catch { /* best effort */ }

      try {
        // Try __INITIAL_STATE__
        const win = window as unknown as Record<string, unknown>;
        let initialState = win.__INITIAL_STATE__;
        if (typeof initialState === "string") {
          initialState = JSON.parse(initialState);
        }
        if (initialState && typeof initialState === "object") {
          Object.assign(imageMap, extractImagesFromJson(initialState));
        }
      } catch { /* best effort */ }

      // Collect DOM items
      const results: { text: string; href: string; img: string }[] = [];
      const links = document.querySelectorAll('a[href*="/voitures_d_occasion/"]');
      links.forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (!href.includes(".htm")) return;
        const text = link.textContent || "";
        const imgEl = link.querySelector("img");
        const img = imgEl?.getAttribute("src") || "";
        results.push({ text, href, img });
      });
      return { items: results, imageMap };
    });

    const listings: AvitoListing[] = [];
    for (const item of items.items) {
      const listing = parseListing(item.text, item.href);
      if (listing) {
        listing.image = item.img;

        // Try to match JSON-extracted images by URL substring
        const fullUrl = listing.url;
        let jsonImages: string[] = [];
        for (const [key, imgs] of Object.entries(items.imageMap)) {
          if (key === fullUrl || (key.startsWith("http") && fullUrl.includes(key.substring(key.indexOf("/", 8))))) {
            jsonImages = imgs;
            break;
          }
        }

        // Fallback: if no URL match, try to match by listing index order
        if (jsonImages.length === 0) {
          const idx = items.items.indexOf(item);
          const indexKey = `__img_${idx}`;
          if (items.imageMap[indexKey]) {
            jsonImages = items.imageMap[indexKey];
          }
        }

        listing.images = jsonImages.length > 0 ? jsonImages : (item.img ? [item.img] : []);
        listings.push(listing);
      }
    }

    return listings;
  } catch (err) {
    console.error(`[Avito] Scraping failed for ${url}:`, err);
    return [];
  } finally {
    await browser.close();
  }
}

export class AvitoCollector implements SourceCollector {
  name = "Avito";

  async fetch(): Promise<UnifiedCar[]> {
    const allListings: AvitoListing[] = [];

    for (const url of AVITO_URLS) {
      try {
        const listings = await scrapePage(url);
        allListings.push(...listings);
        console.log(`[Avito] ${url}: ${listings.length} listings`);
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.error(`[Avito] Failed: ${url}`, err);
      }
    }

    const seen = new Set<string>();
    const unique: AvitoListing[] = [];
    for (const l of allListings) {
      const key = `${l.title.toLowerCase()}_${l.year}_${l.price}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(l);
      }
    }

    return unique.map((l) => {
      const titleParts = l.title.split(/\s+/);
      const makeGuess = titleParts[0];
      const make = normalizeBrand(makeGuess);
      const model = titleParts.slice(1).join(" ").replace(/\d{4}/, "").trim() || l.title;
      const fuel = l.fuel || normalizeFuel("essence");

      const contact: CarContact = { url: l.url, name: "Vendeur Avito" };
      const reputation: CarReputation = { verified: false, label: "Annonce Avito.ma" };

      return {
        id: generateId("avito", make, model, l.year, l.km, l.price),
        title: l.title,
        make,
        model,
        year: l.year,
        price: l.price,
        priceFormatted: l.price.toLocaleString("fr-FR") + " DH",
        km: l.km,
        fuel,
        transmission: l.transmission || "Manuelle",
        bodyType: "",
        city: l.city,
        image: l.image,
        source: "Avito",
        sourceUrl: l.url,
        url: l.url,
        score: computeScore(l.year, l.km, l.price),
        scrapedAt: new Date().toISOString(),
        photos: l.images.length > 0 ? l.images : (l.image ? [l.image] : []),
        inventoryType: "used" as const,
        safety: null,
        contact,
        reputation,
      };
    });
  }
}
