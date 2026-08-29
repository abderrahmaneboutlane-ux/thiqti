/**
 * Downloads all remaining remote photos to local /images/vehicles/
 * and updates the cache.
 */
import { promises as fs } from "fs";
import path from "path";

const PHOTOS_DIR = path.join(process.cwd(), "public", "images", "vehicles");
const CACHE_FILE = path.join(process.cwd(), ".cache", "thiqti-cars.json");
const CONCURRENCY = 8;

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

async function main() {
  await fs.mkdir(PHOTOS_DIR, { recursive: true });
  const cache = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
  const cars: any[] = cache.cars;

  // Build download tasks
  const tasks: { carId: string; url: string; filename: string }[] = [];
  const seen = new Set<string>();

  for (const car of cars) {
    const safeId = (car.id || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");

    if (car.image && car.image.startsWith("http")) {
      const ext = car.image.includes(".webp") ? ".webp" : car.image.includes(".png") ? ".png" : ".jpg";
      const fn = safeId + "_img" + ext;
      if (!seen.has(car.image)) {
        tasks.push({ carId: car.id, url: car.image, filename: fn });
        seen.add(car.image);
      }
    }

    for (let i = 0; i < (car.photos || []).length; i++) {
      const p = car.photos[i];
      if (p && p.startsWith("http") && !seen.has(p)) {
        const ext = p.includes(".webp") ? ".webp" : p.includes(".png") ? ".png" : ".jpg";
        tasks.push({ carId: car.id, url: p, filename: safeId + "_" + i + ext });
        seen.add(p);
      }
    }
  }

  console.log(`Remote URLs to download: ${tasks.length}`);

  const urlToLocal: Record<string, string> = {};
  let downloaded = 0;
  let cached = 0;
  let failed = 0;

  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (t) => {
        const dest = path.join(PHOTOS_DIR, t.filename);
        const localPath = "/images/vehicles/" + t.filename;

        try {
          await fs.access(dest);
          urlToLocal[t.url] = localPath;
          cached++;
          return;
        } catch {}

        const ok = await downloadFile(t.url, dest);
        if (ok) {
          urlToLocal[t.url] = localPath;
          downloaded++;
        } else {
          failed++;
        }
      })
    );

    const done = Math.min(i + CONCURRENCY, tasks.length);
    process.stdout.write(`\r  Progress: ${done}/${tasks.length} (new:${downloaded} cached:${cached} fail:${failed})`);
  }
  console.log("\n");

  // Update cache
  let updated = 0;
  for (const car of cars) {
    let changed = false;
    if (car.image && car.image.startsWith("http") && urlToLocal[car.image]) {
      car.image = urlToLocal[car.image];
      changed = true;
    }
    for (let i = 0; i < (car.photos || []).length; i++) {
      if (car.photos[i] && car.photos[i].startsWith("http") && urlToLocal[car.photos[i]]) {
        car.photos[i] = urlToLocal[car.photos[i]];
        changed = true;
      }
    }
    if (changed) updated++;
  }

  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));

  const withLocal = cars.filter((c) => c.image && c.image.startsWith("/images/")).length;
  const withRemote = cars.filter((c) => c.image && c.image.startsWith("http")).length;
  console.log(`Updated: ${updated} cars`);
  console.log(`Final: local=${withLocal} remote=${withRemote} total=${cars.length}`);
  console.log("Done!");
}

main().catch(console.error);
