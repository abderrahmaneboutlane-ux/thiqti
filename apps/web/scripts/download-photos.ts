/**
 * Download scraped car photos to local public/images/vehicles/
 * so we don't depend on external CDN availability.
 *
 * Usage: npx tsx scripts/download-photos.ts
 */
import { promises as fs } from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), ".cache", "thiqti-cars.json");
const OUT_DIR = path.join(process.cwd(), "public", "images", "vehicles");
const CONCURRENCY = 5;

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://auto24.ma/" },
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

async function main() {
  console.log("=== DOWNLOAD SCRAPED PHOTOS ===\n");

  const raw = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
  const cars: any[] = raw.cars || [];
  console.log("Cache: " + cars.length + " cars\n");

  await fs.mkdir(OUT_DIR, { recursive: true });

  let totalDownloaded = 0;
  let totalFailed = 0;
  const urlToLocal: Record<string, string> = {};

  const allPhotos: { carId: string; url: string; index: number }[] = [];
  for (const car of cars) {
    (car.photos || []).forEach((url: string, i: number) => {
      if (url && url.startsWith("http")) {
        allPhotos.push({ carId: car.id, url, index: i });
      }
    });
  }
  console.log("Total photo URLs to download: " + allPhotos.length + "\n");

  for (let i = 0; i < allPhotos.length; i += CONCURRENCY) {
    const batch = allPhotos.slice(i, i + CONCURRENCY);
    await Promise.allSettled(
      batch.map(async ({ carId, url, index }) => {
        const ext = url.includes(".webp") ? ".webp" : url.includes(".png") ? ".png" : ".jpg";
        const filename = carId + "_" + index + ext;
        const dest = path.join(OUT_DIR, filename);

        try {
          await fs.access(dest);
          urlToLocal[url] = "/images/vehicles/" + filename;
          return;
        } catch {}

        const ok = await downloadFile(url, dest);
        if (ok) {
          urlToLocal[url] = "/images/vehicles/" + filename;
          totalDownloaded++;
        } else {
          totalFailed++;
        }
      })
    );

    const done = Math.min(i + CONCURRENCY, allPhotos.length);
    process.stdout.write("\r  Progress: " + done + "/" + allPhotos.length + " (" + totalDownloaded + " ok, " + totalFailed + " failed)");
  }

  console.log("\n\n=== RESULTS ===");
  console.log("Downloaded: " + totalDownloaded);
  console.log("Failed: " + totalFailed);
  console.log("URL mappings: " + Object.keys(urlToLocal).length + "\n");

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

  await fs.writeFile(CACHE_FILE, JSON.stringify({ cars: cars, fetchedAt: Date.now() }), "utf8");
  console.log("Updated " + updated + " cars in cache with local photo paths");
  console.log("Done! Photos saved to public/images/vehicles/");
}

main().catch(console.error);
