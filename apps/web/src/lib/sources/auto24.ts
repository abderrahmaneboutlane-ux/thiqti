import { UnifiedCar, SourceCollector, generateId, computeScore, normalizeFuel, normalizeBrand, CarContact, CarReputation } from "./types";
import { normalizeIntlPhone, displayPhone, telHref, whatsappHref } from "./contact";

const AUTO24_API = "https://api.auto24.ma/api/cars";
const AUTO24_DETAIL = "https://auto24.ma/cars";

interface Auto24Car {
  _id: string;
  name: string;
  modelYear: string;
  price: number;
  mileage: number;
  transmission: string;
  fuelType: string | { fuelType?: string; details?: { lang: string; fuelType: string }[] };
  bodyType: string | { details?: { lang: string; bodyType: string }[]; slug?: string };
  brand: { brand: string; slug?: string } | string;
  model: { model: string } | string;
  exteriorColor: string | { details?: { lang: string; color: string }[] };
  images: string;
  slug: string;
  status: string;
}

function extract(car: Auto24Car, field: string): string {
  const val = (car as any)[field];
  if (typeof val === "string") return val;
  if (val?.brand) return String(val.brand);
  if (val?.model) return String(val.model);
  if (val?.fuelType) return String(val.fuelType);
  if (val?.bodyType) return String(val.bodyType);
  if (val?.details?.[0]) return String(Object.values(val.details[0])[0] || "");
  return "";
}

function extractImages(car: Auto24Car): string[] {
  try {
    const images = typeof car.images === "string" ? JSON.parse(car.images) : car.images;
    if (Array.isArray(images)) return images.map((img: string) => `https://api.auto24.ma/${img}`);
  } catch {}
  return [];
}

async function fetchAuto24Detail(url: string): Promise<{ contact?: CarContact; reputation?: CarReputation }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" },
      next: { revalidate: 600 },
    });
    if (!res.ok) return {};
    const html = await res.text();

    const phoneRaw = html.match(/\b0[5-7]\d{8}\b/)?.[0] || html.match(/tel:(\+?\d+)/)?.[1];
    const whatsappRaw = html.match(/wa\.me\/(\d+)/)?.[1];
    const sellerName = html.match(/<h4[^>]*class="[^"]*seller[^"]*"[^>]*>([^<]+)<\/h4>/)?.[1]?.trim()
      || html.match(/class="[^"]*vendeur[^"]*"[^>]*>([^<]+)/i)?.[1]?.trim();
    const verified = /v[ée]rifi[ée]|badge.*verif/i.test(html);
    const reviewsMatch = html.match(/(\d+)\s*avis/i);
    const ratingMatch = html.match(/(\d(?:\.\d)?)\s*\/\s*5/);

    const contact: CarContact = {};
    if (phoneRaw) { contact.phone = displayPhone(phoneRaw); contact.phoneHref = telHref(phoneRaw); }
    if (whatsappRaw) contact.whatsappHref = `https://wa.me/212${whatsappRaw}`;
    if (sellerName) contact.name = sellerName;
    contact.url = url;

    const reputation: CarReputation = {};
    if (verified) reputation.verified = true;
    if (reviewsMatch) reputation.reviews = parseInt(reviewsMatch[1]);
    if (ratingMatch) reputation.rating5 = parseFloat(ratingMatch[1]);
    reputation.label = verified ? "Vendeur vérifié" : "Annonce Auto24.ma";

    return { contact, reputation };
  } catch { return {}; }
}

export class Auto24Collector implements SourceCollector {
  name = "Auto24";

  async fetch(): Promise<UnifiedCar[]> {
    try {
      const res = await fetch(AUTO24_API, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json",
          Origin: "https://auto24.ma",
          Referer: "https://auto24.ma/",
        },
        next: { revalidate: 300 },
      });
      if (!res.ok) throw new Error(`Auto24 API: ${res.status}`);
      const data = await res.json();
      const cars: Auto24Car[] = data.cars || [];

      const unified: UnifiedCar[] = cars
        .filter((c) => c.status === "online" && c.price > 0)
        .map((car) => {
          const make = normalizeBrand(extract(car, "brand"));
          const model = extract(car, "model");
          const year = parseInt(car.modelYear || "2022");
          const images = extractImages(car);
          const price = car.price;
          const slug = `https://auto24.ma/cars/${car.slug}`;

          return {
            id: generateId("auto24", make, model, year, car.mileage || 0, price),
            title: car.name || `${make} ${model}`,
            make,
            model,
            year,
            price,
            priceFormatted: price.toLocaleString("fr-FR") + " DH",
            km: car.mileage || 0,
            fuel: normalizeFuel(extract(car, "fuelType")),
            transmission: extract(car, "transmission") || "Manuelle",
            bodyType: "",
            city: "Casablanca",
            image: images[0] || "",
            source: "Auto24",
            sourceUrl: slug,
            url: slug,
            score: computeScore(year, car.mileage || 0, price),
            scrapedAt: new Date().toISOString(),
            photos: images,
            inventoryType: "used" as const,
            safety: null,
            contact: { url: slug, name: "Vendeur Auto24" },
            reputation: { verified: true, label: "Annonce Auto24.ma" },
          };
        });

      // Enrich top 30 with detail page contact/reputation
      const top30 = unified.slice(0, 30);
      const details = await Promise.allSettled(top30.map((c) => fetchAuto24Detail(c.url)));
      details.forEach((d, i) => {
        if (d.status === "fulfilled" && d.value.contact) {
          unified[i].contact = { ...unified[i].contact, ...d.value.contact };
        }
        if (d.status === "fulfilled" && d.value.reputation) {
          unified[i].reputation = { ...unified[i].reputation, ...d.value.reputation };
        }
      });

      return unified;
    } catch (err) {
      console.error("Auto24 fetch failed:", err);
      return [];
    }
  }
}
