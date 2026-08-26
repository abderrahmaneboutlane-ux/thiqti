import { UnifiedCar, SourceCollector, generateId, computeScore, normalizeBrand, normalizeFuel, CarContact, CarReputation } from "./types";

const SPOTICAR_BASE = "https://www.spoticar.ma";

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

export class SpoticarCollector implements SourceCollector {
  name = "Spoticar";

  async fetch(): Promise<UnifiedCar[]> {
    const allCars: UnifiedCar[] = [];
    const pagesToFetch = [1, 2, 3, 4, 5];

    for (const page of pagesToFetch) {
      try {
        const url = `${SPOTICAR_BASE}/fr/vehicules-occasion?page=${page}`;
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
        const listings = this.parseHTML(html);
        allCars.push(...listings);
        console.log(`[Spoticar] page ${page}: ${listings.length} listings`);
      } catch (err) {
        console.error(`[Spoticar] page ${page} failed:`, err);
      }
    }

    return allCars;
  }

  private parseHTML(html: string): UnifiedCar[] {
    const cars: UnifiedCar[] = [];

    const sections = html.split(/(?=<div[^>]*class="[^"]*(?:vehicle-card|listing-card|annonce|card-product)[^"]*")/i);

    for (const section of sections) {
      try {
        const linkMatch = section.match(/href="([^"]*(?:spoticar\.ma)?[^"]*(?:vehicle|voiture|voiture-occasion)[^"]*)"/i);
        const titleMatch = section.match(/<h[23][^>]*>([^<]+)<\/h[23]>/i) ||
                          section.match(/<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/i);
        const priceMatch = section.match(/(\d[\d\s,.]*)\s*(?:DH|MAD|Dhs)/i);
        const yearMatch = section.match(/\b(20[0-2]\d|199\d)\b/);
        const kmMatch = section.match(/(\d[\d\s]*)\s*km/i);

        const allImages: string[] = [];
        const imgRegex = /src="([^"]*(?:jpg|jpeg|png|webp)[^"]*)"/gi;
        let imgIter;
        while ((imgIter = imgRegex.exec(section)) !== null) {
          const src = imgIter[1];
          if (src && !src.includes("logo") && !src.includes("icon") && !src.includes("sprite") && !src.includes("svg")) {
            allImages.push(src.startsWith("http") ? src : `${SPOTICAR_BASE}${src}`);
          }
        }

        if (!titleMatch) continue;

        const rawTitle = titleMatch[1].trim();
        const { make, model } = extractBrandModel(rawTitle);
        const year = yearMatch ? parseInt(yearMatch[1]) : 2020;
        const price = priceMatch ? parseInt(priceMatch[1].replace(/[^\d]/g, "")) : 0;
        const km = kmMatch ? parseInt(kmMatch[1].replace(/[^\d]/g, "")) : 0;

        if (price <= 0 || make.length < 2) continue;

        const cityMatch = section.match(/(?:Casablanca|Rabat|Marrakech|Fès|Fes|Tanger|Agadir|Meknès|Oujda|Kénitra|Tétouan|Nador)/i);

        const fullUrl = linkMatch
          ? (linkMatch[1].startsWith("http") ? linkMatch[1] : `${SPOTICAR_BASE}${linkMatch[1]}`)
          : `${SPOTICAR_BASE}/fr/vehicules-occasion`;

        let fuel = "";
        const lower = section.toLowerCase();
        if (lower.includes("diesel")) fuel = "Diesel";
        else if (lower.includes("essence")) fuel = "Essence";
        else if (lower.includes("hybride") || lower.includes("hybrid")) fuel = "Hybride";
        else if (lower.includes("electrique") || lower.includes("électrique")) fuel = "Électrique";

        let transmission = "";
        if (lower.includes("automatique")) transmission = "Automatique";
        else if (lower.includes("manuelle")) transmission = "Manuelle";

        const contact: CarContact = { url: fullUrl, name: "Spoticar.ma" };
        const reputation: CarReputation = { verified: true, label: "Occasion certifiée Stellantis" };

        cars.push({
          id: generateId("spoticar", make, model, year, km, price),
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
          source: "Spoticar",
          sourceUrl: fullUrl,
          url: fullUrl,
          score: computeScore(year, km, price),
          scrapedAt: new Date().toISOString(),
          photos: allImages,
          inventoryType: "used" as const,
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
