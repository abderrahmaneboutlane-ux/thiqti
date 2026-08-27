/**
 * Standalone scraper test — runs Auto24 collector directly and saves to disk cache.
 * This proves the scraping pipeline works end-to-end without the aggregator.
 * 
 * Usage: node -r ts-node/register scripts/test-scraper.ts
 * Or: npx tsx scripts/test-scraper.ts
 */

const AUTO24_API = "https://api.auto24.ma/api/cars";

function extractImages(imagesField: string): string[] {
  try {
    const images = typeof imagesField === "string" ? JSON.parse(imagesField) : imagesField;
    if (Array.isArray(images)) return images.map((img: string) => `https://api.auto24.ma/${img}`);
  } catch {}
  return [];
}

function normalizeBrand(raw: string): string {
  const map: Record<string, string> = {
    volkswagen: "Volkswagen", vw: "Volkswagen", mercedes: "Mercedes",
    bmw: "BMW", renault: "Renault", peugeot: "Peugeot", citroen: "Citroën",
    dacia: "Dacia", toyota: "Toyota", hyundai: "Hyundai", kia: "Kia",
    ford: "Ford", fiat: "Fiat", nissan: "Nissan", opel: "Opel",
    seat: "Seat", skoda: "Škoda", mazda: "Mazda", suzuki: "Suzuki",
    honda: "Honda", mitsubishi: "Mitsubishi", volvo: "Volvo", jeep: "Jeep",
    chevrolet: "Chevrolet", audi: "Audi", byd: "BYD",
  };
  return map[raw.toLowerCase().trim()] || raw;
}

function extract(car: any, field: string): string {
  const val = car[field];
  if (typeof val === "string") return val;
  if (val?.brand) return String(val.brand);
  if (val?.model) return String(val.model);
  if (val?.fuelType) return String(val.fuelType);
  if (val?.bodyType) return String(val.bodyType);
  if (val?.details?.[0]) return String(Object.values(val.details[0])[0] || "");
  return "";
}

async function main() {
  console.log("=== SCRAPING PIPELINE TEST ===\n");

  // STEP 1: FETCH
  console.log("[1/5] FETCH — Calling Auto24 REST API...");
  const res = await fetch(AUTO24_API, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
      Origin: "https://auto24.ma",
      Referer: "https://auto24.ma/",
    },
  });
  if (!res.ok) { console.error(`  FAIL: HTTP ${res.status}`); return; }
  const data = await res.json();
  const cars: any[] = data.cars || [];
  console.log(`  OK — ${cars.length} raw cars from API\n`);

  // STEP 2: PARSE IMAGES
  console.log("[2/5] IMAGE EXTRACTION — Parsing image URLs from JSON...");
  let totalImages = 0;
  let imagesOk = 0;
  for (const car of cars) {
    const imgs = extractImages(car.images);
    totalImages += imgs.length;
    if (imgs.length > 0) imagesOk++;
  }
  console.log(`  OK — ${imagesOk}/${cars.length} cars have images, ${totalImages} total image URLs\n`);

  // STEP 3: NORMALIZE
  console.log("[3/5] NORMALIZATION — Mapping to UnifiedCar schema...");
  const unified = cars
    .filter((c: any) => c.status === "online" && c.price > 0)
    .map((car: any) => {
      const make = normalizeBrand(extract(car, "brand"));
      const model = extract(car, "model");
      const year = parseInt(car.modelYear || "2022");
      const images = extractImages(car.images);
      const price = car.price;
      const slug = `https://auto24.ma/cars/${car.slug}`;

      return {
        id: `auto24_${make}_${model}_${year}_${car.mileage}_${price}`.toLowerCase().replace(/[^a-z0-9]/g, ""),
        title: car.name || `${make} ${model}`,
        make, model, year, price,
        priceFormatted: price.toLocaleString("fr-FR") + " DH",
        km: car.mileage || 0,
        fuel: extract(car, "fuelType") || "Non précisé",
        transmission: extract(car, "transmission") || "Manuelle",
        bodyType: "",
        city: "Casablanca",
        image: images[0] || "",
        source: "Auto24",
        sourceUrl: slug,
        url: slug,
        scrapedAt: new Date().toISOString(),
        photos: images,
        inventoryType: "used" as const,
      };
    });
  console.log(`  OK — ${unified.length} normalized vehicles\n`);

  // STEP 4: VALIDATE IMAGES
  console.log("[4/5] IMAGE VALIDATION — Testing image URLs are accessible...");
  let validImages = 0;
  let invalidImages = 0;
  const sampleImages = unified.slice(0, 5);
  for (const car of sampleImages) {
    if (!car.image) { invalidImages++; continue; }
    try {
      const imgRes = await fetch(car.image, { method: "HEAD" });
      if (imgRes.ok) {
        validImages++;
        console.log(`  ✓ ${car.title}: HTTP ${imgRes.status} (${imgRes.headers.get("content-type")})`);
      } else {
        invalidImages++;
        console.log(`  ✗ ${car.title}: HTTP ${imgRes.status}`);
      }
    } catch {
      invalidImages++;
      console.log(`  ✗ ${car.title}: FETCH ERROR`);
    }
  }
  console.log(`  Sample: ${validImages}/${sampleImages.length} images valid\n`);

  // STEP 5: SAVE TO DISK CACHE
  console.log("[5/5] CACHE — Saving to .cache/thiqti-cars.json...");
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const cacheFile = path.join(process.cwd(), ".cache", "thiqti-cars.json");
  await fs.mkdir(path.dirname(cacheFile), { recursive: true });
  await fs.writeFile(cacheFile, JSON.stringify({ cars: unified, fetchedAt: Date.now() }), "utf8");
  const stat = await fs.stat(cacheFile);
  console.log(`  OK — Saved ${stat.size} bytes (${unified.length} cars)\n`);

  // SUMMARY
  console.log("=== PIPELINE SUMMARY ===");
  console.log(`Source:       Auto24.ma REST API`);
  console.log(`Raw cars:     ${cars.length}`);
  console.log(`Normalized:   ${unified.length}`);
  console.log(`With images:  ${unified.filter(c => c.image).length}`);
  console.log(`Image URLs:   ${totalImages}`);
  console.log(`Sample image: ${unified[0]?.image}`);
  console.log(`\nDone! The disk cache is now populated.`);
  console.log(`Next: Start the Next.js server and search — scraped data will merge with seed data.`);
}

main().catch(console.error);
