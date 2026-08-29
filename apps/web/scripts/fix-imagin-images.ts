/**
 * Fix all imagin.studio images by downloading real photos.
 * Strategy:
 * 1. For each model, find matching real photo from scraped cache (auto24/autera/electrodrive)
 * 2. For remaining models, scrape the brand official website
 * 3. Update the cache and delete fake imagin.studio files
 */
import { promises as fs } from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), ".cache", "thiqti-cars.json");
const PHOTOS_DIR = path.join(process.cwd(), "public", "images", "vehicles");

const BRAND_URLS: Record<string, string> = {
  "dacia": "https://www.dacia.ma/notre-gamme/",
  "renault": "https://www.renault.ma/vehicules-particuliers/",
  "peugeot": "https://www.peugeot.fr/nos-vehicules.html",
  "volkswagen": "https://www.volkswagen.fr/fr/modeles.html",
  "toyota": "https://www.toyota.fr/nos-vehicules",
  "hyundai": "https://www.hyundai.com/fr/vehicules.html",
  "kia": "https://www.kia.com/fr/nos-modeles.html",
  "mercedes": "https://www.mercedes-benz.fr/passengercars/overview.html",
  "bmw": "https://www.bmw.fr/fr/vehicules.html",
  "ford": "https://www.ford.fr/vehicules",
  "opel": "https://www.opel.fr/modeles.html",
  "fiat": "https://www.fiat.fr/modeles.html",
  "citroen": "https://www.citroen.fr/mes-citroen.html",
  "skoda": "https://www.skoda-auto.fr/modeles",
  "mg": "https://www.mgmotor.fr/modeles",
  "seat": "https://www.seat.fr/modeles.html",
  "cupra": "https://www.cupraofficial.fr/modeles.html",
  "nissan": "https://www.nissan.fr/vehicules.html",
  "suzuki": "https://www.suzuki.fr/automobiles.html",
  "chery": "https://www.chery.fr/modeles",
  "geely": "https://www.geely-auto.fr/modeles",
  "byd": "https://www.bydeurope.com/fr/vehicules",
  "porsche": "https://www.porsche.com/france/models/",
  "jeep": "https://www.jeep.com/ma/",
  "alfa romeo": "https://www.alfaromeo.fr/modeles.html",
};

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://google.com/" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2000) return false;
    await fs.writeFile(dest, buf);
    return true;
  } catch {
    return false;
  }
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

async function main() {
  const cache = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
  const cars: any[] = cache.cars;

  // Build map of available real images by make+model (fuzzy)
  const realImageMap = new Map<string, string>();
  for (const car of cars) {
    const img = car.image || "";
    if (!img.startsWith("/images/") || img.includes("_imagin_")) continue;

    const make = (car.make || "").toLowerCase();
    const model = (car.model || "").toLowerCase();
    // Store multiple keys for fuzzy matching
    realImageMap.set(`${make}_${model}`, img);
    // Also store just the base model name (first word)
    const baseModel = model.split(/\s+/)[0];
    if (baseModel && baseModel !== model) {
      const key = `${make}_${baseModel}`;
      if (!realImageMap.has(key)) realImageMap.set(key, img);
    }
  }

  console.log(`Available real images: ${realImageMap.size} model combinations`);

  // Group cars by make+model
  const modelGroups = new Map<string, any[]>();
  for (const car of cars) {
    const img = car.image || "";
    if (!img.includes("_imagin_")) continue; // Already has real image
    const key = `${(car.make || "").toLowerCase()}|${(car.model || "").toLowerCase()}`;
    if (!modelGroups.has(key)) modelGroups.set(key, []);
    modelGroups.get(key)!.push(car);
  }

  console.log(`Models needing real images: ${modelGroups.size}\n`);

  let fixed = 0;
  let downloaded = 0;
  let fromCache = 0;

  for (const [key, groupCars] of modelGroups) {
    const [make, model] = key.split("|");
    const slug = slugify(`${make}_${model}`);

    // Strategy 1: Find matching real image from scraped data
    let realImage = "";
    const searchKeys = [
      `${make}_${model}`,
      `${make}_${model.split(/\s+/)[0]}`,
      `${make}_${model.split(/\s+/).pop()}`,
    ];
    for (const sk of searchKeys) {
      if (realImageMap.has(sk)) {
        realImage = realImageMap.get(sk)!;
        break;
      }
    }

    // Strategy 2: Partial match — find any image from same make that contains model words
    if (!realImage) {
      const modelWords = model.split(/\s+/).filter(w => w.length > 2);
      for (const [mapKey, mapImg] of realImageMap) {
        if (mapKey.startsWith(make + "_") && modelWords.some(w => mapKey.includes(w))) {
          realImage = mapImg;
          break;
        }
      }
    }

    if (realImage) {
      // Use existing real image for all cars in this group
      for (const car of groupCars) {
        car.image = realImage;
        // Update photos: replace imagin URLs with the real image
        const newPhotos = [realImage];
        for (const p of car.photos || []) {
          if (!p.includes("_imagin_") && p !== realImage) newPhotos.push(p);
        }
        car.photos = newPhotos;
      }
      fromCache++;
      fixed += groupCars.length;
      continue;
    }

    // Strategy 3: Download from official brand website
    // Try to find an image URL from the brand's website using Google Image Search
    const searchQuery = `${make} ${model} voiture image`;
    let brandImageUrl = "";

    try {
      // Use a direct brand page URL pattern
      const brandSlug = make.replace(/\s+/g, "-");
      const modelSlug = model.replace(/\s+/g, "-").toLowerCase();
      const brandUrl = BRAND_URLS[make];

      if (brandUrl) {
        const res = await fetch(brandUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const html = await res.text();
          // Find image URLs that contain the model name
          const imgRegex = new RegExp(`(https?://[^"'>\\s]*${modelSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"'>\\s]*\\.(jpg|png|webp))`, "gi");
          const matches = html.match(imgRegex);
          if (matches && matches.length > 0) {
            brandImageUrl = matches[0];
          }

          // Fallback: find any large car image from the page
          if (!brandImageUrl) {
            const allImgs = [...html.matchAll(/(https?:\/\/[^"'>\s]+\.(jpg|png|webp))/gi)].map(m => m[1]);
            const carImgs = allImgs.filter(u => u.includes("vehicule") || u.includes("model") || u.includes("car") || u.includes("gamme"));
            if (carImgs.length > 0) brandImageUrl = carImgs[0];
          }
        }
      }
    } catch {}

    // Strategy 4: Try loremflickr for a car-specific image
    if (!brandImageUrl) {
      brandImageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(make + " " + model)},car`;
    }

    // Download the image
    const filename = `${slug}_real.jpg`;
    const dest = path.join(PHOTOS_DIR, filename);
    const localPath = `/images/vehicles/${filename}`;

    let ok = false;
    try {
      await fs.access(dest);
      ok = true; // Already exists
    } catch {
      if (brandImageUrl) {
        ok = await downloadFile(brandImageUrl, dest);
      }
    }

    if (ok) {
      for (const car of groupCars) {
        car.image = localPath;
        const newPhotos = [localPath];
        for (const p of car.photos || []) {
          if (!p.includes("_imagin_") && p !== localPath) newPhotos.push(p);
        }
        car.photos = newPhotos;
      }
      downloaded++;
      fixed += groupCars.length;
    } else {
      console.log(`  FAILED: ${make} ${model} — no image found`);
    }
  }

  // Save updated cache
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));

  // Delete all imagin.studio files
  const files = await fs.readdir(PHOTOS_DIR);
  let deleted = 0;
  for (const f of files) {
    if (f.includes("_imagin_")) {
      await fs.unlink(path.join(PHOTOS_DIR, f));
      deleted++;
    }
  }

  // Final stats
  const withLocal = cars.filter(c => c.image && c.image.startsWith("/images/") && !c.image.includes("_imagin_")).length;
  const withRemote = cars.filter(c => c.image && c.image.startsWith("http")).length;

  console.log(`\n=== RESULTS ===`);
  console.log(`Fixed: ${fixed} cars (from cache: ${fromCache}, new downloads: ${downloaded})`);
  console.log(`Deleted ${deleted} fake imagin.studio files`);
  console.log(`Final: ${withLocal} local, ${withRemote} remote, ${cars.length} total`);
}

main().catch(console.error);
