import { SourceCollector, UnifiedCar, generateId, normalizeBrand, CarContact, CarReputation } from "./types";

function guessBodyType(brand: string, model: string): string {
  const combined = `${brand} ${model}`.toLowerCase();
  if (/duster|tucson|sportage|kona|qashqai|x-trail|2008|3008|tiguan|t-roc|t-cross|xc40|xc60|cx-30|cx-5|renegade|evoque|outlander|glc|gla|glb|x1|x3|x5|jolion|hs|zs|vitara|s-cross|coolray|cs35|cs55|tiggo|atto|dolphin|corolla cross|yaris cross/i.test(combined)) return "SUV";
  if (/crossover|stepway|captur|bayon|stonic|puma|kardian|c3 aircross|c4|408/i.test(combined)) return "Crossover";
  if (/sandero|clio|208|polo|i10|i20|picanto|500|c3|corsa|swift|micra|fiesta|ibiza|fabia|cooper/i.test(combined)) return "Citadine";
  if (/logan|symbol|clio sedan|tipo|passat|308|508|megane|emgrand|mg5|giulia|serie 3|classe c/i.test(combined)) return "Berline";
  if (/golf|308|astra|civic|mazda3|octavia|serie 1|classe a|a3/i.test(combined)) return "Compacte";
  if (/jogger|rifter|berlingo|partner|mondeo|passat variant|touran/i.test(combined)) return "Monospace";
  if (/ranger|hilux|navara|dmax|triton/i.test(combined)) return "Utilitaire";
  return "";
}

function parsePrice(text: string): number {
  const cleaned = text.replace(/\s/g, "").replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

interface BrandCard {
  brand: string;
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  modelCount: number;
  exampleModel: string;
  href: string;
}

interface TableEntry {
  rank: number;
  brand: string;
  model: string;
  newPrice: number;
  usedPrice: number;
  changePercent: string;
  href: string;
}

function extractBrandCards(html: string): BrandCard[] {
  const cards: BrandCard[] = [];
  const brandCardRegex = /"aria-label":"Prix\s+([^"]+?)\s+au\s+Maroc"[^}]*"children":\[\[[^]]*"children":"([^"]+)"\}[^]]*\]\],[^]]*"children":"([^"]*?(\d[\d\s]*\d)\s*(?:MAD)?[^"]*?)"\}[^]]*\]\],[^]]*"children":\[(\d+),\s*"[^"]*","s?","[^"]*?",\s*"([^"]+)"\}/g;

  let match;
  while ((match = brandCardRegex.exec(html)) !== null) {
    const brand = match[2].trim();
    const priceText = match[3].trim();
    const modelCount = parseInt(match[5], 10);
    const exampleModel = match[6].trim();
    const hrefMatch = html.substring(Math.max(0, match.index - 200), match.index).match(/"href":"([^"]*prix\/[^"]*maroc)"/);
    const href = hrefMatch ? hrefMatch[1] : `/prix/${brand.toLowerCase().replace(/\s+/g, "-")}-maroc`;

    const prices = priceText.match(/(\d[\d\s]*\d)/g) || [];
    const p0 = prices[0];
    const p1 = prices[1];
    const minPrice = p0 != null ? parsePrice(p0) : 0;
    const maxPrice = p1 != null ? parsePrice(p1) : minPrice;

    cards.push({ brand, priceRange: priceText, minPrice, maxPrice, modelCount, exampleModel, href });
  }
  return cards;
}

function extractTableEntries(html: string): TableEntry[] {
  const entries: TableEntry[] = [];
  const rowRegex = /\["\$","tr","([^"]+)",\{[^}]*"children":\[\[[^]]*"children":"(\d+)"\}[^]]*\],\[[^]]*"children":"([^"]+)"\}[^]]*\],\[[^]]*"children":"([^"]+)"\}[^]]*\],\[[^]]*"children":"([^"]*?(\d[\d\s]*\d)[^"]*?)"\}[^]]*\],\[[^]]*"children":"([^"]*?(\d[\d\s]*\d)[^"]*?)"\}[^]]*\],\[[^]]*"children":"([^"]+)"\}[^]]*\],\[[^]]*"children":\[\{"href":"([^"]+)"\}/g;

  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const slug = match[1];
    const rank = parseInt(match[2], 10);
    const brand = match[3].trim();
    const model = match[4].trim();
    const newPrice = parsePrice(match[6]);
    const usedPrice = parsePrice(match[8]);
    const changePercent = match[9];
    const href = match[10];

    entries.push({ rank, brand, model, newPrice, usedPrice, changePercent, href });
  }
  return entries;
}

function extractTableEntriesFallback(html: string): TableEntry[] {
  const entries: TableEntry[] = [];
  const trBlocks = html.split('"tr",');
  for (const block of trBlocks) {
    const slugMatch = block.match(/^"([^"]+)"/);
    if (!slugMatch) continue;
    const slug = slugMatch[1];
    const brandMatch = block.match(/"font-display[^"]*","children":"([^"]+)"/);
    const modelMatch = block.match(/"font-mono","children":"([^"]+)"/);
    const newPriceMatch = block.match(/"text-right","children":"(\d[\d\s]*\d)"/);
    const usedPriceMatch = block.match(/"text-right text-ink-3","children":"(\d[\d\s]*\d)"/);
    const changeMatch = block.match(/"text-right text-atlas","children":"([^"]+)"/);
    const hrefMatch = block.match(/"href":"([^"]*prix\/[^"]*)"/);

    if (brandMatch && modelMatch && newPriceMatch) {
      entries.push({
        rank: entries.length + 1,
        brand: brandMatch[1].trim(),
        model: modelMatch[1].trim(),
        newPrice: parsePrice(newPriceMatch[1]),
        usedPrice: usedPriceMatch ? parsePrice(usedPriceMatch[1]) : 0,
        changePercent: changeMatch ? changeMatch[1] : "",
        href: hrefMatch ? hrefMatch[1] : `/prix/${slug}`,
      });
    }
  }
  return entries;
}

function buildCarsFromBrands(cards: BrandCard[]): UnifiedCar[] {
  const cars: UnifiedCar[] = [];
  const now = new Date().toISOString();

  for (const card of cards) {
    const make = normalizeBrand(card.brand);
    const model = card.exampleModel;
    const year = 2026;
    const bodyType = guessBodyType(card.brand, model);
    const avgPrice = Math.round((card.minPrice + card.maxPrice) / 2);
    const price = avgPrice > 0 ? avgPrice : card.minPrice;

    if (price <= 0 || !model) continue;

    const sourceUrl = `https://www.soeezauto.ma${card.href}`;

    const contact: CarContact = { url: sourceUrl, name: "SoeezAuto.ma" };
    const reputation: CarReputation = { verified: true, label: "Prix catalogue officiel" };

    cars.push({
      id: generateId("soeezauto", make, model, year, 0, price),
      title: `${card.brand} ${model} Neuf`,
      make,
      model,
      year,
      price,
      priceFormatted: price.toLocaleString("fr-FR") + " DH",
      km: 0,
      fuel: "",
      transmission: "",
      bodyType,
      city: "Maroc",
      image: "",
      source: "SoeezAuto",
      sourceUrl,
      url: sourceUrl,
      score: 95,
      scrapedAt: now,
      photos: [],
      inventoryType: "new" as const,
      safety: null,
      contact,
      reputation,
    });
  }

  return cars;
}

function buildCarsFromTable(entries: TableEntry[]): UnifiedCar[] {
  const cars: UnifiedCar[] = [];
  const now = new Date().toISOString();
  const seen = new Set<string>();

  for (const entry of entries) {
    if (entry.newPrice <= 0) continue;

    const make = normalizeBrand(entry.brand);
    const model = entry.model;
    const year = 2026;
    const bodyType = guessBodyType(entry.brand, model);
    const urlPath = entry.href.startsWith("/") ? entry.href : `/prix/${entry.href}`;

    const dedupKey = `${make}_${model}_${entry.newPrice}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    const sourceUrl = `https://www.soeezauto.ma${urlPath}`;

    const contact: CarContact = { url: sourceUrl, name: "SoeezAuto.ma" };
    const reputation: CarReputation = { verified: true, label: "Prix catalogue officiel" };

    cars.push({
      id: generateId("soeezauto", make, model, year, 0, entry.newPrice),
      title: `${entry.brand} ${model} Neuf`,
      make,
      model,
      year,
      price: entry.newPrice,
      priceFormatted: entry.newPrice.toLocaleString("fr-FR") + " DH",
      km: 0,
      fuel: "",
      transmission: "",
      bodyType,
      city: "Maroc",
      image: "",
      source: "SoeezAuto",
      sourceUrl,
      url: sourceUrl,
      score: 95,
      scrapedAt: now,
      photos: [],
      inventoryType: "new" as const,
      safety: null,
      contact,
      reputation,
    });
  }

  return cars;
}

export class SoeezAutoCollector implements SourceCollector {
  name = "SoeezAuto";

  async fetch(): Promise<UnifiedCar[]> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);

      const res = await fetch("https://www.soeezauto.ma/prix", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html",
          "Cache-Control": "max-age=3600",
        },
        signal: controller.signal,
      } as any);

      clearTimeout(timeout);

      if (!res.ok) {
        console.error(`SoeezAuto HTTP ${res.status}`);
        return [];
      }

      const html = await res.text();
      return this.parseHTML(html);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        console.error("SoeezAuto fetch timed out after 15s");
      } else {
        console.error("SoeezAuto fetch failed:", err);
      }
      return [];
    }
  }

  private parseHTML(html: string): UnifiedCar[] {
    const tableEntries = extractTableEntries(html);
    const fallbackEntries = tableEntries.length === 0 ? extractTableEntriesFallback(html) : [];
    const entries = tableEntries.length > 0 ? tableEntries : fallbackEntries;

    const brandCards = extractBrandCards(html);

    const tableCars = buildCarsFromTable(entries);
    const brandCars = buildCarsFromBrands(brandCards);

    const seen = new Set<string>();
    const merged: UnifiedCar[] = [];

    for (const car of tableCars) {
      const key = `${car.make}_${car.model}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(car);
      }
    }

    for (const car of brandCars) {
      const key = `${car.make}_${car.model}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(car);
      }
    }

    console.log(`[SoeezAuto] ${merged.length} vehicules (${entries.length} table, ${brandCards.length} brand cards)`);
    return merged;
  }
}
