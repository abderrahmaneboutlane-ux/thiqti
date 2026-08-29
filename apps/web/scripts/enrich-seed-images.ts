/**
 * Downloads real car model images from imagin.studio for all seed-data vehicles,
 * then merges with scraped live data to produce a complete cache.
 *
 * Usage: npx tsx scripts/enrich-seed-images.ts
 */
import { promises as fs } from "fs";
import path from "path";

const SEED_FILE = path.join(__dirname, "..", "src", "lib", "data", "seed-data.json");
const CACHE_FILE = path.join(__dirname, "..", ".cache", "thiqti-cars.json");
const PHOTOS_DIR = path.join(__dirname, "..", "public", "images", "vehicles");
const CONCURRENCY = 10;

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(12000),
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

function getImaginUrl(make: string, model: string, angle: number): string {
  return `https://cdn.imagin.studio/getimage?customer=hrjavascript-mastery&make=${encodeURIComponent(make)}&modelFamily=${encodeURIComponent(model)}&angle=${angle}&width=800`;
}

async function main() {
  console.log("=== ENRICH SEED DATA WITH REAL CAR IMAGES ===\n");

  // Load seed data
  const seedRaw = JSON.parse(await fs.readFile(SEED_FILE, "utf8"));
  const seedVehicles: any[] = seedRaw.vehicles || [];
  console.log(`Seed vehicles: ${seedVehicles.length}`);

  // Load existing scraped cache if available
  let scrapedCars: any[] = [];
  try {
    const cacheRaw = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
    scrapedCars = cacheRaw.cars || [];
    console.log(`Scraped cache: ${scrapedCars.length} cars`);
  } catch {
    console.log("No existing cache");
  }

  // Build a set of scraped make+model to avoid downloading images for already-scraped cars
  const scrapedKeys = new Set(
    scrapedCars.map((c: any) => `${(c.make || "").toLowerCase()}_${(c.model || "").toLowerCase()}`)
  );

  await fs.mkdir(PHOTOS_DIR, { recursive: true });

  // Group seed vehicles by make+model to avoid redundant downloads
  const modelGroups = new Map<string, any[]>();
  for (const v of seedVehicles) {
    const key = `${(v.make || "").toLowerCase()}_${(v.model || "").toLowerCase()}`;
    if (!modelGroups.has(key)) modelGroups.set(key, []);
    modelGroups.get(key)!.push(v);
  }

  console.log(`Unique make+model groups: ${modelGroups.size}\n`);

  // Download imagin.studio images for each group
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;
  let index = 0;

  const groups = Array.from(modelGroups.entries());
  for (let i = 0; i < groups.length; i += CONCURRENCY) {
    const batch = groups.slice(i, i + CONCURRENCY);
    await Promise.allSettled(
      batch.map(async ([key, vehicles]) => {
        const v = vehicles[0]; // representative vehicle
        const make = v.make || "";
        const model = v.model || "";
        const slug = slugify(`${make}_${model}`);

        // Try angles: 20 (3/4 front), 1 (front), 23 (3/4 rear)
        const angles = [20, 1, 23];
        const localUrls: string[] = [];

        for (let ai = 0; ai < angles.length; ai++) {
          const filename = `${slug}_imagin_${angles[ai]}.jpg`;
          const dest = path.join(PHOTOS_DIR, filename);
          const localPath = `/images/vehicles/${filename}`;

          // Check if already downloaded
          try {
            await fs.access(dest);
            localUrls.push(localPath);
            skipped++;
            continue;
          } catch {}

          const url = getImaginUrl(make, model, angles[ai]);
          const ok = await downloadFile(url, dest);
          if (ok) {
            localUrls.push(localPath);
            downloaded++;
          } else {
            failed++;
          }
        }

        // Update all vehicles in this group with local image paths
        const primaryImage = localUrls.length > 0 ? localUrls[0] : "";
        for (const vehicle of vehicles) {
          // Replace imagin.studio URLs with local paths, keep other real photos
          const newPhotos: string[] = [];
          for (const p of vehicle.photos || []) {
            if (p.includes("cdn.imagin.studio")) {
              // Try to find matching local path
              const matchIdx = angles.findIndex((_, ai) => p.includes(`angle=${angles[ai]}`));
              if (matchIdx >= 0 && localUrls[matchIdx]) {
                newPhotos.push(localUrls[matchIdx]);
              }
              // Skip imagin.studio URLs without local equivalent
            } else {
              newPhotos.push(p);
            }
          }

          // Ensure at least the primary imagin image is in photos
          if (primaryImage && !newPhotos.includes(primaryImage)) {
            newPhotos.unshift(primaryImage);
          }

          vehicle.photos = newPhotos.length > 0 ? newPhotos : vehicle.photos;
          if (primaryImage) {
            vehicle.image_url = primaryImage;
          }
        }
      })
    );

    const done = Math.min(i + CONCURRENCY, groups.length);
    process.stdout.write(`\r  Progress: ${done}/${groups.length} groups (${downloaded} new, ${skipped} cached, ${failed} failed)`);
  }
  console.log("\n");

  // Merge: scraped live data (priority) + enriched seed data
  const allCars: any[] = [];
  const mergedKeys = new Set<string>();

  // First: add scraped live cars (they have real ad photos)
  for (const car of scrapedCars) {
    const key = `${(car.make || "").toLowerCase()}_${(car.model || "").toLowerCase()}_${car.year}_${car.price}`;
    if (!mergedKeys.has(key)) {
      mergedKeys.add(key);
      allCars.push(car);
    }
  }

  // Then: add enriched seed vehicles
  for (const vehicle of seedVehicles) {
    const price = vehicle.priceNum || vehicle.price_mad || 0;
    const key = `${(vehicle.make || "").toLowerCase()}_${(vehicle.model || "").toLowerCase()}_${vehicle.year || 2025}_${price}`;
    if (!mergedKeys.has(key)) {
      mergedKeys.add(key);

      // Convert seed format to UnifiedCar format
      const priceNum = typeof vehicle.priceNum === "number" ? vehicle.priceNum :
        typeof vehicle.price_mad === "number" ? vehicle.price_mad :
        parseInt(String(vehicle.price || "0").replace(/\D/g, "")) || 0;
      const scoreNum = typeof vehicle.score === "number" ? vehicle.score :
        parseInt(String(vehicle.score || "70")) || 70;
      const name = vehicle.name || `${vehicle.make || ""} ${vehicle.model || ""}`;
      const image = vehicle.image_url || vehicle.image || "/images/car-placeholder.svg";
      const photos = vehicle.photos || [];

      allCars.push({
        id: vehicle.id || `seed_${slugify(name)}_${vehicle.year || 2025}`,
        title: name,
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year || 2025,
        price: priceNum,
        priceFormatted: vehicle.price_display || `${priceNum.toLocaleString("fr-FR")} DH`,
        km: vehicle.km || 0,
        fuel: vehicle.fuel || "",
        bodyType: vehicle.body_type || "",
        transmission: vehicle.transmission || "",
        city: vehicle.city || "Maroc",
        image,
        photos,
        score: scoreNum,
        source: vehicle.source || "Seed Data",
        sourceUrl: vehicle.url || "",
        inventoryType: vehicle.inventory_type === "neuf" ? "new" : "used",
        scrapedAt: new Date().toISOString(),
        contact: { name: vehicle.source || "Concessionnaire Maroc" },
        reputation: { reviews: vehicle.nb_reviews || 10 },
      });
    }
  }

  console.log(`Total merged: ${allCars.length} vehicles (${scrapedCars.length} live + ${allCars.length - scrapedCars.length} seed)\n`);

  // Save
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify({ cars: allCars, fetchedAt: Date.now() }), "utf8");
  const stat = await fs.stat(CACHE_FILE);
  console.log(`Saved ${(stat.size / 1024).toFixed(0)} KB to ${CACHE_FILE}`);

  // Stats
  const withLocal = allCars.filter(c => {
    const img = c.image || c.image_url || "";
    return img.startsWith("/images/");
  }).length;
  const withReal = allCars.filter(c => {
    const photos = c.photos || [];
    return photos.some((p: string) => p.startsWith("/images/") && !p.includes("car-placeholder"));
  }).length;

  console.log(`\nWith local images: ${withLocal}/${allCars.length}`);
  console.log(`With any real photo: ${withReal}/${allCars.length}`);
  console.log("\nDone! Restart the Next.js server.");
}

main().catch(console.error);
