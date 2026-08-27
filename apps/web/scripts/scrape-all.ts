/**
 * Full scraping pipeline — runs ALL collectors, saves to disk cache,
 * then downloads all photos locally.
 *
 * Usage: npx tsx scripts/scrape-all.ts
 *
 * This runs the same collectors as the aggregator but with longer timeouts
 * and saves everything to .cache/thiqti-cars.json + public/images/vehicles/
 */
import { promises as fs } from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), ".cache", "thiqti-cars.json");
const PHOTOS_DIR = path.join(process.cwd(), "public", "images", "vehicles");
const CONCURRENCY = 5;

// ============================================================================
// SCRAPER IMPORTS
// ============================================================================

// We import the collector classes directly to avoid Next.js/server dependencies
// Each collector returns UnifiedCar[]

async function importCollectors() {
  const mods: any[] = [];

  // Phase 1: Fast collectors (HTML fetch + regex)
  try { const m = await import("../src/lib/sources/kifal"); mods.push({ name: "Kifal", fetch: m.KifalCollector }); } catch {}
  try { const m = await import("../src/lib/sources/spoticar"); mods.push({ name: "Spoticar", fetch: m.SpoticarCollector }); } catch {}
  try { const m = await import("../src/lib/sources/marocannonces"); mods.push({ name: "MarocAnnonces", fetch: m.MarocAnnoncesCollector }); } catch {}
  try { const m = await import("../src/lib/sources/kijiji"); mods.push({ name: "Kijiji", fetch: m.KijijiCollector }); } catch {}
  try { const m = await import("../src/lib/sources/voiture"); mods.push({ name: "Voiture", fetch: m.VoitureCollector }); } catch {}
  try { const m = await import("../src/lib/sources/siaracash"); mods.push({ name: "SiaraCash", fetch: m.SiaraCashCollector }); } catch {}
  try { const m = await import("../src/lib/sources/autocaz"); mods.push({ name: "Autocaz", fetch: m.AutocazCollector }); } catch {}
  try { const m = await import("../src/lib/sources/wandaloo"); mods.push({ name: "Wandaloo", fetch: m.WandalooCollector }); } catch {}

  // Phase 2: JSON API + detail page collectors
  try { const m = await import("../src/lib/sources/auto24"); mods.push({ name: "Auto24", fetch: m.Auto24Collector }); } catch {}
  try { const m = await import("../src/lib/sources/electrodrive"); mods.push({ name: "ElectroDrive", fetch: m.ElectroDriveCollector }); } catch {}

  // Phase 3: Binome sources (new cars + used with detail enrichment)
  try { const m = await import("../src/lib/sources/autera"); mods.push({ name: "Autera", fetchFn: m.fetchAuteraCars }); } catch {}
  try { const m = await import("../src/lib/sources/autohall"); mods.push({ name: "AutoHall", fetchFn: m.fetchAutohallCars }); } catch {}
  try { const m = await import("../src/lib/sources/moteur-neuf"); mods.push({ name: "MoteurNeuf", fetchFn: m.fetchMoteurNeufCars }); } catch {}
  try { const m = await import("../src/lib/sources/moteur"); mods.push({ name: "Moteur", fetch: m.MoteurCollector }); } catch {}

  return mods;
}

// ============================================================================
// PHOTO DOWNLOADER
// ============================================================================

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://google.com/" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) return false;
    await fs.writeFile(dest, buf);
    return true;
  } catch {
    return false;
  }
}

async function downloadAllPhotos(cars: any[]): Promise<{ downloaded: number; failed: number; updated: number }> {
  await fs.mkdir(PHOTOS_DIR, { recursive: true });

  // Flatten all unique photo URLs
  const allPhotos: { carId: string; url: string; index: number }[] = [];
  for (const car of cars) {
    (car.photos || []).forEach((url: string, i: number) => {
      if (url && url.startsWith("http")) {
        allPhotos.push({ carId: car.id, url, index: i });
      }
    });
  }

  console.log("  Total photo URLs: " + allPhotos.length);

  const urlToLocal: Record<string, string> = {};
  let downloaded = 0;
  let failed = 0;

  for (let i = 0; i < allPhotos.length; i += CONCURRENCY) {
    const batch = allPhotos.slice(i, i + CONCURRENCY);
    await Promise.allSettled(
      batch.map(async ({ carId, url, index }) => {
        const ext = url.includes(".webp") ? ".webp" : url.includes(".png") ? ".png" : ".jpg";
        const filename = carId + "_" + index + ext;
        const dest = path.join(PHOTOS_DIR, filename);

        // Skip if already downloaded
        try { await fs.access(dest); urlToLocal[url] = "/images/vehicles/" + filename; return; } catch {}

        const ok = await downloadFile(url, dest);
        if (ok) { urlToLocal[url] = "/images/vehicles/" + filename; downloaded++; }
        else { failed++; }
      })
    );

    const done = Math.min(i + CONCURRENCY, allPhotos.length);
    process.stdout.write("\r  Photos: " + done + "/" + allPhotos.length + " (" + downloaded + " ok, " + failed + " failed)");
  }
  console.log("");

  // Update cache with local paths
  let updated = 0;
  for (const car of cars) {
    const localPhotos: string[] = [];
    let localImage = "";
    for (const url of car.photos || []) {
      const local = urlToLocal[url];
      if (local) {
        localPhotos.push(local);
        if (!localImage) localImage = local;
      } else {
        localPhotos.push(url);
      }
    }
    if (localImage) {
      car.image = localImage;
      car.photos = localPhotos;
      updated++;
    }
  }

  return { downloaded, failed, updated };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("========================================");
  console.log("  THIQTI — FULL SCRAPING PIPELINE");
  console.log("========================================\n");

  const collectors = await importCollectors();
  console.log("Loaded " + collectors.length + " collectors\n");

  // Run all collectors in parallel with timeouts
  console.log("=== PHASE 1: Scraping all sources ===");
  const startTime = Date.now();
  const allCars: any[] = [];

  const results = await Promise.allSettled(
    collectors.map(async (c) => {
      const timeoutMs = c.name === "Moteur" ? 60000 : 20000;
      try {
        const fetchFn = c.fetchFn || (() => new c.fetch().fetch());
        const cars = await Promise.race([
          fetchFn(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
        ]);
        return { name: c.name, cars };
      } catch (err) {
        return { name: c.name, cars: [], error: (err as Error).message };
      }
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled") {
      const { name, cars, error } = r.value;
      if (error) {
        console.log("  " + name + ": FAILED (" + error + ")");
      } else {
        console.log("  " + name + ": " + cars.length + " vehicles");
        allCars.push(...cars);
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n  TOTAL: " + allCars.length + " vehicles scraped in " + elapsed + "s\n");

  // Deduplicate
  console.log("=== PHASE 2: Deduplication ===");
  const seen = new Map<string, any>();
  for (const car of allCars) {
    const key = (car.make + "_" + car.model + "_" + car.year + "_" + car.price).toLowerCase().replace(/[^a-z0-9_]/g, "");
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, car);
    } else if ((car.photos || []).length > (existing.photos || []).length) {
      const merged = { ...car, photos: [...new Set([...(existing.photos || []), ...(car.photos || [])])] };
      if (!merged.image && existing.image) merged.image = existing.image;
      seen.set(key, merged);
    } else if (!existing.image && car.image) {
      existing.image = car.image;
      existing.photos = [...new Set([...(existing.photos || []), ...(car.photos || [])])];
    }
  }
  const unique = Array.from(seen.values());
  console.log("  " + allCars.length + " -> " + unique.length + " unique vehicles\n");

  // Save to disk cache
  console.log("=== PHASE 3: Saving cache ===");
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify({ cars: unique, fetchedAt: Date.now() }), "utf8");
  const cacheStat = await fs.stat(CACHE_FILE);
  console.log("  Saved " + (cacheStat.size / 1024).toFixed(0) + " KB to " + CACHE_FILE + "\n");

  // Download photos
  console.log("=== PHASE 4: Downloading photos ===");
  const photoResult = await downloadAllPhotos(unique);
  console.log("  Downloaded: " + photoResult.downloaded + " new photos");
  console.log("  Failed: " + photoResult.failed);
  console.log("  Cars with local photos: " + photoResult.updated + "\n");

  // Final stats
  const withPhotos = unique.filter((c) => c.photos && c.photos.length > 0).length;
  const withLocalPhotos = unique.filter((c) => c.image && c.image.startsWith("/images/")).length;
  const withContact = unique.filter((c) => c.contact && (c.contact.phone || c.contact.whatsappHref)).length;

  console.log("========================================");
  console.log("  SUMMARY");
  console.log("========================================");
  console.log("  Total vehicles:     " + unique.length);
  console.log("  With photos:        " + withPhotos);
  console.log("  With local photos:  " + withLocalPhotos);
  console.log("  With contact info:  " + withContact);
  console.log("  Total time:         " + ((Date.now() - startTime) / 1000).toFixed(1) + "s");
  console.log("\nDone! Restart the Next.js server to see fresh data.");
}

main().catch(console.error);
