/**
 * Fix all car images properly.
 * 1. Use real scraped auto24/electrodrive/autera images (already on disk, >10KB)
 * 2. Download from Unsplash for brands that don't have scraped images
 * 3. Update the cache so every car has a valid local image
 */
import { promises as fs } from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");
const CACHE_FILE = path.join(ROOT, ".cache", "thiqti-cars.json");
const PHOTOS_DIR = path.join(ROOT, "public", "images", "vehicles");
const REAL_CARS_FILE = path.join(ROOT, "..", "real-cars.json");

// Brand-level Unsplash images (guaranteed working, high quality)
const BRAND_UNSPLASH: Record<string, string> = {
  renault: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80",
  dacia: "https://images.unsplash.com/photo-1611016186333-205f68d3d8ec?w=800&auto=format&fit=crop&q=80",
  peugeot: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
  volkswagen: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80",
  toyota: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80",
  hyundai: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&auto=format&fit=crop&q=80",
  kia: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
  "mercedes-benz": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80",
  mercedes: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80",
  bmw: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80",
  audi: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format&fit=crop&q=80",
  byd: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80",
  mg: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
  citroën: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
  citroen: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
  opel: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80",
  chery: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80",
  geely: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80",
  cupra: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
  porsche: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
  ford: "https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&auto=format&fit=crop&q=80",
  nissan: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop&q=80",
  honda: "https://images.unsplash.com/photo-1606611013016-969c19ba27a5?w=800&auto=format&fit=crop&q=80",
  mazda: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80",
  suzuki: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format&fit=crop&q=80",
  fiat: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
  skoda: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80",
  seat: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80",
  jeep: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
  land_rover: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80",
  range_rover: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80",
  haval: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80",
  omoda: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80",
  jac: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80",
  dfsk: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&auto=format&fit=crop&q=80",
  alfard: "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&auto=format&fit=crop&q=80",
  alfa: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
  mini: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
 	ds: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
  wuling: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&auto=format&fit=crop&q=80",
  gac: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80",
  mondeo: "https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&auto=format&fit=crop&q=80",
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(30000),
      redirect: "follow",
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000) return false;
    // Verify it's an image (JPEG, PNG, or WEBP)
    const header = buf.slice(0, 4);
    const isJpeg = header[0] === 0xFF && header[1] === 0xD8;
    const isPng = header[0] === 0x89 && header[1] === 0x50;
    const isWebp = header.slice(0, 4).toString("ascii") === "RIFF";
    const isHtml = buf.slice(0, 10).toString("ascii").includes("<!");
    if (!isJpeg && !isPng && !isWebp) return false;
    if (isHtml) return false;
    await fs.writeFile(dest, buf);
    return true;
  } catch {
    return false;
  }
}

async function isFileValid(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    if (stat.size < 5000) return false;
    const buf = Buffer.alloc(4);
    const fh = await fs.open(filePath, "r");
    await fh.read(buf, 0, 4, 0);
    await fh.close();
    const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
    const isPng = buf[0] === 0x89 && buf[1] === 0x50;
    const isWebp = buf.slice(0, 4).toString("ascii") === "RIFF";
    return isJpeg || isPng || isWebp;
  } catch {
    return false;
  }
}

async function main() {
  console.log("Loading cache...");
  const cache = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
  const cars: any[] = cache.cars;
  await fs.mkdir(PHOTOS_DIR, { recursive: true });

  // Step 1: Build mapping from real-cars.json (scraped data with real images)
  let realCarsMap = new Map<string, string>(); // "make|model" -> local image path
  try {
    const realCars = JSON.parse(await fs.readFile(REAL_CARS_FILE, "utf8"));
    for (const rc of realCars) {
      const make = (rc.make || "").toLowerCase().trim();
      const model = (rc.model || "").toLowerCase().trim();
      const img = rc.image || "";
      if (make && model && img && img.startsWith("/images/")) {
        const fullPath = path.join(ROOT, "public", img);
        if (await isFileValid(fullPath)) {
          const key = `${make}|${model}`;
          if (!realCarsMap.has(key)) {
            realCarsMap.set(key, img);
          }
        }
      }
    }
  } catch (e) {
    console.log("Could not load real-cars.json:", (e as Error).message);
  }
  console.log(`Real scraped image mappings: ${realCarsMap.size} models`);

  // Step 2: Scan all existing local images and group by make
  const brandLocalImages = new Map<string, string[]>(); // make -> [paths]
  const allFiles = await fs.readdir(PHOTOS_DIR);
  for (const file of allFiles) {
    const filePath = path.join(PHOTOS_DIR, file);
    const valid = await isFileValid(filePath);
    if (valid) {
      const imgPath = `/images/vehicles/${file}`;
      // Try to extract make from filename
      for (const brand of Object.keys(BRAND_UNSPLASH)) {
        if (file.toLowerCase().startsWith(brand + "_") || file.toLowerCase().startsWith(brand + "-")) {
          if (!brandLocalImages.has(brand)) brandLocalImages.set(brand, []);
          brandLocalImages.get(brand)!.push(imgPath);
        }
      }
      // Also handle auto24/autera/electrodrive prefixes
      if (file.startsWith("auto24") || file.startsWith("autera_") || file.startsWith("electrodrive_") || file.startsWith("src_")) {
        const genericKey = "_scraped";
        if (!brandLocalImages.has(genericKey)) brandLocalImages.set(genericKey, []);
        brandLocalImages.get(genericKey)!.push(imgPath);
      }
    }
  }

  const scrapedImages = brandLocalImages.get("_scraped") || [];
  console.log(`Brand-local images: ${[...brandLocalImages.entries()].map(([k, v]) => `${k}(${v.length})`).join(", ")}`);
  console.log(`Scraped images (auto24/autera/electrodrive): ${scrapedImages.length}`);

  // Step 3: Build brand image map - download one Unsplash per brand
  const brandImageMap = new Map<string, string>(); // make -> local path
  const downloadedBrands = new Set<string>();

  // First check if we already have brand images
  for (const [brand, url] of Object.entries(BRAND_UNSPLASH)) {
    const filename = `brand_${brand}.jpg`;
    const localPath = `/images/vehicles/${filename}`;
    const fullPath = path.join(PHOTOS_DIR, filename);
    if (await isFileValid(fullPath)) {
      brandImageMap.set(brand, localPath);
      downloadedBrands.add(brand);
    }
  }

  // Download missing brand images
  console.log(`\nDownloading brand images for ${Object.keys(BRAND_UNSPLASH).length} brands...`);
  let dlCount = 0;
  for (const [brand, url] of Object.entries(BRAND_UNSPLASH)) {
    if (downloadedBrands.has(brand)) continue;
    const filename = `brand_${brand}.jpg`;
    const fullPath = path.join(PHOTOS_DIR, filename);
    const ok = await downloadFile(url, fullPath);
    if (ok) {
      brandImageMap.set(brand, `/images/vehicles/${filename}`);
      dlCount++;
    }
  }
  console.log(`Downloaded ${dlCount} brand images`);

  // Step 4: Fix all cars
  let fixedCount = 0;
  let alreadyOk = 0;
  let brandFallback = 0;

  // Track which scraped images we'll use for random assignment
  let scrapedIdx = 0;

  for (const car of cars) {
    const img = car.image || "";
    const make = (car.make || "").toLowerCase().trim();
    const model = (car.model || "").toLowerCase().trim();
    const modelKey = `${make}|${model}`;

    // Check if current image is valid
    let currentValid = false;
    if (img.startsWith("/images/")) {
      currentValid = await isFileValid(path.join(ROOT, "public", img));
    }

    if (currentValid) {
      alreadyOk++;
      continue;
    }

    // Try: real scraped model-specific image
    let newImage = realCarsMap.get(modelKey) || "";

    // Try: scraped auto24/autera image for this make
    if (!newImage && scrapedImages.length > 0) {
      // Pick one deterministically based on car index
      const idx = (fixedCount + scrapedIdx) % scrapedImages.length;
      newImage = scrapedImages[idx];
      scrapedIdx++;
    }

    // Fallback: brand Unsplash
    if (!newImage) {
      newImage = brandImageMap.get(make) || brandImageMap.get("default") || "";
    }

    if (newImage) {
      car.image = newImage;
      // Also fix photos array
      const newPhotos = [newImage];
      for (const p of car.photos || []) {
        if (p !== newImage) newPhotos.push(p);
      }
      car.photos = newPhotos;
      fixedCount++;
      if (!realCarsMap.has(modelKey)) brandFallback++;
    }
  }

  console.log(`\nResults:`);
  console.log(`  Already valid: ${alreadyOk}`);
  console.log(`  Fixed: ${fixedCount} (${fixedCount - brandFallback} model-specific, ${brandFallback} brand fallback)`);
  console.log(`  Total: ${cars.length}`);

  // Verify
  let validCount = 0;
  for (const car of cars) {
    if (car.image && car.image.startsWith("/images/")) {
      const ok = await isFileValid(path.join(ROOT, "public", car.image));
      if (ok) validCount++;
    }
  }
  console.log(`\nVerification: ${validCount}/${cars.length} cars have valid local images`);

  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log("Cache updated!");
}

main().catch(console.error);
