/**
 * Next.js instrumentation — runs once on server start.
 * Automatically scrapes all Moroccan car sources + downloads photos
 * if cache is missing or older than 1 hour.
 */
import { promises as fs } from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), ".cache", "thiqti-cars.json");
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

async function isCacheFresh(): Promise<boolean> {
  try {
    const stat = await fs.stat(CACHE_FILE);
    const age = Date.now() - stat.mtimeMs;
    return age < CACHE_MAX_AGE_MS;
  } catch {
    return false;
  }
}

export async function register() {
  // Only run on Node.js server, not edge
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Non-blocking: start scraping in background, don't delay server
    runScrapeIfNeeded().catch(() => {});
  }
}

async function runScrapeIfNeeded() {
  if (await isCacheFresh()) {
    console.log("[Thiqti] Cache is fresh, skipping scrape");
    return;
  }

  console.log("[Thiqti] Cache missing or stale — running full scrape pipeline...");

  try {
    // Import and run the scrape-all logic inline (avoids tsx dependency)
    await runScraper();
    console.log("[Thiqti] Scrape complete!");
  } catch (err) {
    console.error("[Thiqti] Scrape failed:", (err as Error).message);
    // Server continues normally — will use whatever cache exists (even stale)
  }
}

async function runScraper() {
  const PHOTOS_DIR = path.join(process.cwd(), "public", "images", "vehicles");
  const CONCURRENCY = 5;

  // Dynamic import collectors
  const collectors: { name: string; fetchFn: () => Promise<any[]> }[] = [];

  const imports = [
    ["kifal", "KifalCollector"],
    ["spoticar", "SpoticarCollector"],
    ["marocannonces", "MarocAnnoncesCollector"],
    ["auto24", "Auto24Collector"],
    ["electrodrive", "ElectroDriveCollector"],
    ["autera", "fetchAuteraCars"],
    ["autohall", "fetchAutohallCars"],
    ["moteur-neuf", "fetchMoteurNeufCars"],
    ["moteur", "MoteurCollector"],
  ] as const;

  for (const [file, cls] of imports) {
    try {
      const mod = await import("./lib/sources/" + file);
      const ClsOrFn = mod[cls];
      if (typeof ClsOrFn === "function") {
        const isClass = ClsOrFn.toString().startsWith("class");
        collectors.push({
          name: file,
          fetchFn: isClass ? () => new ClsOrFn().fetch() : ClsOrFn,
        });
      }
    } catch {}
  }

  // Run all collectors
  const allCars: any[] = [];
  const results = await Promise.allSettled(
    collectors.map(async (c) => {
      try {
        const cars = await Promise.race([
          c.fetchFn(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 25000)),
        ]);
        return { name: c.name, cars };
      } catch {
        return { name: c.name, cars: [] };
      }
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled" && r.value.cars.length > 0) {
      allCars.push(...r.value.cars);
      console.log("[Thiqti] " + r.value.name + ": " + r.value.cars.length + " vehicles");
    }
  }

  if (allCars.length === 0) {
    console.log("[Thiqti] No vehicles scraped — keeping existing cache");
    return;
  }

  // Deduplicate
  const seen = new Map<string, any>();
  for (const car of allCars) {
    const key = ((car.make || "") + "_" + (car.model || "") + "_" + car.year + "_" + car.price).toLowerCase().replace(/[^a-z0-9_]/g, "");
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, car);
    } else if ((car.photos || []).length > (existing.photos || []).length) {
      seen.set(key, { ...car, photos: [...new Set([...(existing.photos || []), ...(car.photos || [])])] });
    }
  }
  const unique = Array.from(seen.values());

  // Save cache
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify({ cars: unique, fetchedAt: Date.now() }), "utf8");

  // Download photos
  await fs.mkdir(PHOTOS_DIR, { recursive: true });

  const allPhotos: { carId: string; url: string; index: number }[] = [];
  for (const car of unique) {
    (car.photos || []).forEach((url: string, i: number) => {
      if (url && url.startsWith("http")) allPhotos.push({ carId: car.id, url, index: i });
    });
  }

  const urlToLocal: Record<string, string> = {};
  for (let i = 0; i < allPhotos.length; i += CONCURRENCY) {
    const batch = allPhotos.slice(i, i + CONCURRENCY);
    await Promise.allSettled(
      batch.map(async ({ carId, url, index }) => {
        const ext = url.includes(".webp") ? ".webp" : url.includes(".png") ? ".png" : ".jpg";
        const filename = carId + "_" + index + ext;
        const dest = path.join(PHOTOS_DIR, filename);
        try { await fs.access(dest); urlToLocal[url] = "/images/vehicles/" + filename; return; } catch {}
        try {
          const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(10000),
          });
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.length > 1000) {
              await fs.writeFile(dest, buf);
              urlToLocal[url] = "/images/vehicles/" + filename;
            }
          }
        } catch {}
      })
    );
  }

  // Update cache with local paths
  for (const car of unique) {
    const localPhotos: string[] = [];
    let localImage = "";
    for (const url of car.photos || []) {
      const local = urlToLocal[url];
      if (local) { localPhotos.push(local); if (!localImage) localImage = local; }
      else localPhotos.push(url);
    }
    if (localImage) { car.image = localImage; car.photos = localPhotos; }
  }

  await fs.writeFile(CACHE_FILE, JSON.stringify({ cars: unique, fetchedAt: Date.now() }), "utf8");
  console.log("[Thiqti] Saved " + unique.length + " vehicles + " + Object.keys(urlToLocal).length + " photos");
}
