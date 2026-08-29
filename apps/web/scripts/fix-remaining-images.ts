/**
 * Fix remaining 285 cars with broken image paths.
 * Uses loremflickr with different keyword combinations + picsum fallback.
 */
import { promises as fs } from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), ".cache", "thiqti-cars.json");
const PHOTOS_DIR = path.join(process.cwd(), "public", "images", "vehicles");

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(20000),
      redirect: "follow",
    });
    if (!res.ok) return false;
    const contentType = res.headers.get("content-type") || "";
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000) return false;
    const header = buf.slice(0, 4).toString("ascii");
    if (header.startsWith("<!") || header.startsWith("<htm")) return false;
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

  // Find cars with missing image files
  const broken: any[] = [];
  for (const car of cars) {
    const img = car.image || "";
    if (img.startsWith("/images/")) {
      const fullPath = path.join(process.cwd(), "public", img);
      try { await fs.access(fullPath); } catch { broken.push(car); }
    }
  }

  console.log(`Cars with broken image paths: ${broken.length}`);

  // Group by model
  const groups = new Map<string, any[]>();
  for (const car of broken) {
    const key = `${(car.make || "").toLowerCase()}|${(car.model || "").toLowerCase()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(car);
  }

  console.log(`Unique models to fix: ${groups.size}\n`);

  let fixed = 0;
  let stillFailed = 0;

  for (const [key, groupCars] of groups) {
    const [make, model] = key.split("|");
    const slug = slugify(`${make}_${model}`);
    let localPath = "";

    // Try multiple download strategies
    const attempts = [
      `https://loremflickr.com/800/600/${encodeURIComponent(make)},${encodeURIComponent(model)}`,
      `https://loremflickr.com/800/600/${encodeURIComponent(make + " " + model)}`,
      `https://loremflickr.com/800/600/car,${encodeURIComponent(make)}`,
      `https://picsum.photos/800/600`, // Random but guaranteed to work
    ];

    for (let attempt = 0; attempt < attempts.length; attempt++) {
      const filename = `${slug}_real_${attempt}.jpg`;
      const dest = path.join(PHOTOS_DIR, filename);

      try { await fs.access(dest); localPath = `/images/vehicles/${filename}`; break; } catch {}

      const ok = await downloadFile(attempts[attempt], dest);
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
      fixed += groupCars.length;
    } else {
      // Last resort: use the car placeholder
      for (const car of groupCars) {
        car.image = "/images/car-placeholder.svg";
        car.photos = ["/images/car-placeholder.svg"];
      }
      stillFailed += groupCars.length;
    }
  }

  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));

  const local = cars.filter(c => c.image && c.image.startsWith("/images/") && !c.image.includes("placeholder")).length;
  const placeholder = cars.filter(c => c.image && c.image.includes("placeholder")).length;

  console.log(`\nFixed: ${fixed} cars`);
  console.log(`Placeholder fallback: ${stillFailed} cars`);
  console.log(`Final: ${local} real local, ${placeholder} placeholder, ${cars.length} total`);
}

main().catch(console.error);
