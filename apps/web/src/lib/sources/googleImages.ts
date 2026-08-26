/**
 * Image fallback for cars without photos.
 * Uses loremflickr.com (free, no API key, real photos by keyword).
 */

const SEARCH_TIMEOUT_MS = 8000;
const MAX_CONCURRENT = 5;
const DELAY_BETWEEN_MS = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Get car images from loremflickr.com (free, no API key).
 * Redirects to a real Flickr photo matching the keywords.
 */
async function getLoremFlickrImages(make: string, model: string): Promise<string[]> {
  const urls = [
    `https://loremflickr.com/400/300/${encodeURIComponent(make)},${encodeURIComponent(model)}`,
    `https://loremflickr.com/400/300/${encodeURIComponent(make)},voiture`,
  ];

  const images: string[] = [];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);
      const res = await fetch(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      clearTimeout(timer);

      if (res.status === 302 || res.status === 301) {
        const location = res.headers.get("location");
        if (location) {
          const fullUrl = location.startsWith("http") ? location : `https://loremflickr.com${location}`;
          images.push(fullUrl);
          break; // Got one good image, stop
        }
      }
    } catch {
      // Skip failed requests
    }
  }

  return images;
}

/**
 * Enrich cars without photos using loremflickr.com.
 */
export async function googleImagesFallback(
  cars: { id: string; make: string; model: string; year: number; photos: string[] }[]
): Promise<Map<string, string[]>> {
  const needImages = cars.filter((c) => c.photos.length === 0 && c.make && c.model);
  if (needImages.length === 0) return new Map();

  console.log(`[ImageFallback] Searching images for ${needImages.length} cars...`);
  const results = new Map<string, string[]>();
  let found = 0;

  for (let i = 0; i < needImages.length; i += MAX_CONCURRENT) {
    const batch = needImages.slice(i, i + MAX_CONCURRENT);
    const searches = batch.map(async (car) => {
      const images = await getLoremFlickrImages(car.make, car.model);
      if (images.length > 0) {
        results.set(car.id, images);
        found++;
      }
    });
    await Promise.allSettled(searches);
    if (i + MAX_CONCURRENT < needImages.length) {
      await sleep(DELAY_BETWEEN_MS);
    }
  }

  console.log(`[ImageFallback] Found images for ${found}/${needImages.length} cars`);
  return results;
}
