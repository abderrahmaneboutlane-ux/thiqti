// Multi-photo extraction from detail pages
// Used by scrapers to enrich listings with additional photos

const DETAIL_TIMEOUT_MS = 5000;
const DETAIL_CONCURRENCY = 8;

export async function fetchDetailPhotos(
  urls: string[],
  maxPhotos = 8
): Promise<Map<string, string[]>> {
  const results = new Map<string, string[]>();
  let index = 0;

  const workers = Array.from({ length: Math.min(DETAIL_CONCURRENCY, urls.length) }, async () => {
    while (index < urls.length) {
      const url = urls[index++];
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), DETAIL_TIMEOUT_MS);
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "text/html",
            "Accept-Language": "fr-FR,fr;q=0.9",
          },
        });
        clearTimeout(timer);
        if (!res.ok) continue;

        const html = await res.text();
        const photos = extractPhotosFromHtml(html, maxPhotos);
        if (photos.length > 0) {
          results.set(url, photos);
        }
      } catch {
        // Skip failed detail pages
      }
    }
  });

  await Promise.all(workers);
  return results;
}

function extractPhotosFromHtml(html: string, max: number): string[] {
  const photos: string[] = [];
  const seen = new Set<string>();

  // Pattern 1: Gallery images (img tags in gallery/carousel/detail sections)
  const galleryPatterns = [
    /class="[^"]*(?:gallery|carousel|slider|detail|annonce-image|car-image|photo)[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/gi,
    /<img[^>]*class="[^"]*(?:gallery|carousel|detail|annonce)[^"]*"[^>]*src="([^"]+)"/gi,
    /data-src="([^"]*(?:jpg|jpeg|png|webp)[^"]*)"/gi,
  ];

  for (const pattern of galleryPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && photos.length < max) {
      const url = match[1];
      if (isValidPhotoUrl(url) && !seen.has(url)) {
        seen.add(url);
        photos.push(normalizeUrl(url));
      }
    }
  }

  // Pattern 2: All image tags in the page (fallback)
  if (photos.length < 3) {
    const imgRegex = /<img[^>]*src="([^"]+)"/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null && photos.length < max) {
      const url = match[1];
      if (isValidPhotoUrl(url) && !seen.has(url)) {
        seen.add(url);
        photos.push(normalizeUrl(url));
      }
    }
  }

  // Pattern 3: JSON-LD structured data
  const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatch) {
    for (const block of jsonLdMatch) {
      try {
        const json = JSON.parse(block.replace(/<\/?script[^>]*>/gi, ""));
        const images = json.image || json.photos || [];
        const imageArr = Array.isArray(images) ? images : [images];
        for (const img of imageArr) {
          if (typeof img === "string" && isValidPhotoUrl(img) && !seen.has(img) && photos.length < max) {
            seen.add(img);
            photos.push(normalizeUrl(img));
          }
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }

  return photos;
}

function isValidPhotoUrl(url: string): boolean {
  if (!url || url.length < 10) return false;
  const lower = url.toLowerCase();
  // Must be an image
  if (!/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(lower)) return false;
  // Exclude icons, logos, sprites, SVGs
  if (/logo|icon|sprite|svg|avatar|badge|thumb_small|placeholder/i.test(lower)) return false;
  // Must be reasonable length
  if (url.length > 500) return false;
  return true;
}

function normalizeUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) {
    // Try to determine base URL from context - use generic fallback
    return url;
  }
  return url;
}
