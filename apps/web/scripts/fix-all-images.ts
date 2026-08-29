/**
 * Replace ALL broken imagin.studio images with real photos from loremflickr.com
 * and real scraped photos from the existing cache.
 */
import { promises as fs } from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), ".cache", "thiqti-cars.json");
const PHOTOS_DIR = path.join(process.cwd(), "public", "images", "vehicles");
const CONCURRENCY = 10;

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(20000),
      redirect: "follow",
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000) return false; // Minimum 5KB for a real image
    // Check it's actually an image (not an HTML error page)
    const header = Buffer.from(buf.buffer, buf.byteOffset, Math.min(4, buf.length)).toString("ascii");
    if (header.includes("<!") || header.includes("<html")) return false;
    await fs.writeFile(dest, buf);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const cache = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
  const cars: any[] = cache.cars;
  await fs.mkdir(PHOTOS_DIR, { recursive: true });

  // Build map of available real images from scraped data (not imagin.studio)
  const scrapedImages = new Map<string, string>();
  for (const car of cars) {
    const img = car.image || "";
    if (img.startsWith("/images/") && !img.includes("_imagin_")) {
      const make = (car.make || "").toLowerCase();
      const model = (car.model || "").toLowerCase();
      scrapedImages.set(`${make} ${model}`, img);
      // Also store partial matches
      for (const word of model.split(/\s+/)) {
        if (word.length > 2) {
          const key = `${make} ${word}`;
          if (!scrapedImages.has(key)) scrapedImages.set(key, img);
        }
      }
    }
  }

  console.log(`Scraped images available: ${scrapedImages.size}`);

  // Group cars that need fixing (imagin.studio images)
  const needFix = cars.filter(c => c.image && c.image.includes("_imagin_"));
  const modelGroups = new Map<string, any[]>();
  for (const car of needFix) {
    const key = `${(car.make || "").toLowerCase()}|${(car.model || "").toLowerCase()}`;
    if (!modelGroups.has(key)) modelGroups.set(key, []);
    modelGroups.get(key)!.push(car);
  }

  console.log(`Cars needing fix: ${needFix.length}`);
  console.log(`Unique models: ${modelGroups.size}\n`);

  let fixedFromScraped = 0;
  let fixedFromLoremflickr = 0;
  let failed = 0;

  const groups = Array.from(modelGroups.entries());
  for (let i = 0; i < groups.length; i += CONCURRENCY) {
    const batch = groups.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async ([key, groupCars]) => {
        const [make, model] = key.split("|");
        const slug = slugify(`${make}_${model}`);

        // Try scraped images first
        let realImage = "";
        const searchTerms = [`${make} ${model}`, `${make} ${model.split(/\s+/)[0]}`];
        for (const term of searchTerms) {
          if (scrapedImages.has(term)) {
            realImage = scrapedImages.get(term)!;
            break;
          }
        }

        if (realImage) {
          for (const car of groupCars) {
            car.image = realImage;
            const newPhotos = [realImage];
            for (const p of car.photos || []) {
              if (!p.includes("_imagin_") && p !== realImage) newPhotos.push(p);
            }
            car.photos = newPhotos;
          }
          fixedFromScraped += groupCars.length;
          return;
        }

        // Download from loremflickr (3 attempts for different images)
        let localPath = "";
        for (let attempt = 0; attempt < 3; attempt++) {
          const filename = `${slug}_real_${attempt}.jpg`;
          const dest = path.join(PHOTOS_DIR, filename);
          const lfUrl = `https://loremflickr.com/800/600/${encodeURIComponent(make + "," + model)},car`;

          try { await fs.access(dest); localPath = `/images/vehicles/${filename}`; break; } catch {}
          const ok = await downloadFile(lfUrl, dest);
          if (ok) {
            localPath = `/images/vehicles/${filename}`;
            break;
          }
        }

        if (localPath) {
          for (const car of groupCars) {
            car.image = localPath;
            const newPhotos = [localPath];
            for (const p of car.photos || []) {
              if (!p.includes("_imagin_") && p !== localPath) newPhotos.push(p);
            }
            car.photos = newPhotos;
          }
          fixedFromLoremflickr += groupCars.length;
        } else {
          failed += groupCars.length;
        }
      })
    );

    const done = Math.min(i + CONCURRENCY, groups.length);
    process.stdout.write(`\r  Progress: ${done}/${groups.length} models (scraped:${fixedFromScraped} loremflickr:${fixedFromLoremflickr} failed:${failed})`);
  }
  console.log("\n");

  // Save
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));

  // Delete leftover imagin.studio files
  const files = await fs.readdir(PHOTOS_DIR);
  let deleted = 0;
  for (const f of files) {
    if (f.includes("_imagin_")) {
      await fs.unlink(path.join(PHOTOS_DIR, f));
      deleted++;
    }
  }

  // Final stats
  const local = cars.filter(c => c.image && c.image.startsWith("/images/")).length;
  const remote = cars.filter(c => c.image && c.image.startsWith("http")).length;

  console.log(`=== RESULTS ===`);
  console.log(`From scraped cache: ${fixedFromScraped} cars`);
  console.log(`From loremflickr: ${fixedFromLoremflickr} cars`);
  console.log(`Failed: ${failed} cars`);
  console.log(`Deleted ${deleted} imagin.studio files`);
  console.log(`Final: ${local} local, ${remote} remote, ${cars.length} total`);
}

main().catch(console.error);
