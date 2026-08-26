import { UnifiedCar, SourceCollector, generateId, computeScore, normalizeBrand, normalizeFuel, CarContact, CarReputation } from "./types";
import { normalizeIntlPhone, displayPhone, telHref, whatsappHref } from "./contact";
import { extractImagesFromSection } from "./extractImages";

const AUTOCAZ_URLS = [
  "https://www.autocaz.ma/voitures-occasion",
  "https://www.autocaz.ma/voitures-neuves",
];

function parsePrice(text: string): number {
  const cleaned = text.replace(/[^\d]/g, "");
  const num = parseInt(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseKm(text: string): number {
  const cleaned = text.replace(/[^\d]/g, "");
  const num = parseInt(cleaned);
  return isNaN(num) ? 0 : num;
}

function extractBrandModel(title: string): { make: string; model: string } {
  const brands = [
    "Renault", "Peugeot", "Citroën", "Citroen", "Dacia", "Toyota", "Hyundai",
    "Kia", "Volkswagen", "BMW", "Mercedes", "Mercedes-Benz", "Audi", "Ford",
    "Fiat", "Nissan", "Opel", "Seat", "Škoda", "Skoda", "Mazda", "Suzuki",
    "Honda", "Mitsubishi", "Volvo", "Jeep", "Chevrolet", "Lexus", "Mini",
    "Alfa Romeo", "Cupra", "DS", "Land Rover", "Porsche", "MG", "BYD",
    "Changan", "Chery", "DFSK", "JAC", "Geely", "GAC", "BAIC", "Haval",
    "Omoda", "Jaecoo", "EXEED", "XPENG", "Dongfeng", "GWM", "Jetour",
    "KGM", "Leapmotor", "Deepal", "Smart", "Rox",
  ];

  for (const brand of brands) {
    if (title.toLowerCase().startsWith(brand.toLowerCase())) {
      const model = title.slice(brand.length).trim();
      return { make: brand, model: model || title };
    }
  }

  const parts = title.split(/\s+/);
  if (parts.length >= 2) {
    return { make: parts[0], model: parts.slice(1).join(" ") };
  }
  return { make: title, model: "" };
}

export class AutocazCollector implements SourceCollector {
  name = "Autocaz";

  async fetch(): Promise<UnifiedCar[]> {
    const allCars: UnifiedCar[] = [];

    for (const url of AUTOCAZ_URLS) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml",
            "Accept-Language": "fr-FR,fr;q=0.9",
          },
          next: { revalidate: 600 },
        });
        if (!res.ok) continue;

        const html = await res.text();
        const listings = this.parseHTML(html, url);
        allCars.push(...listings);
        console.log(`[Autocaz] ${url}: ${listings.length} listings`);
      } catch (err) {
        console.error(`[Autocaz] Failed: ${url}`, err);
      }
    }

    return allCars;
  }

  private parseHTML(html: string, baseUrl: string): UnifiedCar[] {
    const cars: UnifiedCar[] = [];

    const sections = html.split(/(?=<div[^>]*class="[^"]*(?:annonce|listing|card|vehicle|car-card|product-card|item)[^"]*")/i);

    for (const section of sections) {
      try {
        const linkMatch = section.match(/href="([^"]*(?:autocaz\.ma)?[^"]*(?:\.htm|\.html)[^"]*)"/i);
        const titleMatch = section.match(/<h[23][^>]*>([^<]+)<\/h[23]>/i) ||
                          section.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/i);
        const priceMatch = section.match(/(\d[\d\s,.]*)\s*(?:DH|MAD|Dhs)/i);
        const yearMatch = section.match(/\b(20[0-2]\d|199\d)\b/);
        const kmMatch = section.match(/(\d[\d\s]*)\s*km/i);

        const allImages = extractImagesFromSection(section, baseUrl);

        if (!titleMatch) continue;

        const rawTitle = titleMatch[1].trim();
        const { make, model } = extractBrandModel(rawTitle);
        const year = yearMatch ? parseInt(yearMatch[1]) : 2020;
        const price = priceMatch ? parsePrice(priceMatch[1]) : 0;
        const km = kmMatch ? parseKm(kmMatch[1]) : 0;

        if (price <= 0 || make.length < 2) continue;

        const cityMatch = section.match(/(?:Casablanca|Rabat|Marrakech|Fès|Fes|Tanger|Agadir|Meknès|Oujda|Kénitra|Tétouan|Nador|El Jadida)/i);

        const fullUrl = linkMatch
          ? (linkMatch[1].startsWith("http") ? linkMatch[1] : `https://www.autocaz.ma${linkMatch[1]}`)
          : baseUrl;

        let fuel = "";
        const lower = section.toLowerCase();
        if (lower.includes("diesel")) fuel = "Diesel";
        else if (lower.includes("essence")) fuel = "Essence";
        else if (lower.includes("hybride") || lower.includes("hybrid")) fuel = "Hybride";
        else if (lower.includes("electrique") || lower.includes("électrique")) fuel = "Électrique";

        let transmission = "";
        if (lower.includes("automatique")) transmission = "Automatique";
        else if (lower.includes("manuelle")) transmission = "Manuelle";

        const phoneRaw = section.match(/\b0[5-7]\d{8}\b/)?.[0] || section.match(/tel:(\+?\d+)/)?.[1];
        const whatsappRaw = section.match(/wa\.me\/(\d+)/)?.[1];
        const sellerName = section.match(/class="[^"]*seller[^"]*"[^>]*>([^<]+)/i)?.[1]?.trim();
        const verified = /v[ée]rifi[ée]|badge/i.test(section);
        const reviewsMatch = section.match(/(\d+)\s*avis/i);
        const ratingMatch = section.match(/(\d(?:\.\d)?)\s*\/\s*5/);

        const contact: CarContact = { url: fullUrl };
        if (phoneRaw) { contact.phone = displayPhone(phoneRaw); contact.phoneHref = telHref(phoneRaw); }
        if (whatsappRaw) contact.whatsappHref = `https://wa.me/212${whatsappRaw}`;
        if (sellerName) contact.name = sellerName;

        const reputation: CarReputation = {};
        if (verified) reputation.verified = true;
        if (reviewsMatch) reputation.reviews = parseInt(reviewsMatch[1]);
        if (ratingMatch) reputation.rating5 = parseFloat(ratingMatch[1]);
        reputation.label = verified ? "Annonce vérifiée" : "Annonce Autocaz.ma";

        cars.push({
          id: generateId("autocaz", make, model, year, km, price),
          title: rawTitle,
          make: normalizeBrand(make),
          model,
          year,
          price,
          priceFormatted: price.toLocaleString("fr-FR") + " DH",
          km,
          fuel: normalizeFuel(fuel),
          transmission: transmission || "Manuelle",
          bodyType: "",
          city: cityMatch ? cityMatch[0] : "Casablanca",
          image: allImages[0] || "",
          source: "Autocaz",
          sourceUrl: fullUrl,
          url: fullUrl,
          score: computeScore(year, km, price),
          scrapedAt: new Date().toISOString(),
          photos: allImages,
          inventoryType: baseUrl.includes("neuves") ? "new" as const : "used" as const,
          safety: null,
          contact,
          reputation,
        });
      } catch {
        continue;
      }
    }

    return cars;
  }
}
