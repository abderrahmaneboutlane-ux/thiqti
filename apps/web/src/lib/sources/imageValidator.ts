// Image validation and fallback system for car photos

// Validate if an image URL returns HTTP 200
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

// Batch validate multiple image URLs (with concurrency limit)
export async function validateImages(urls: string[], maxConcurrent = 5): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const validations = await Promise.allSettled(
      batch.map(async (url) => ({ url, valid: await validateImageUrl(url) }))
    );
    for (const v of validations) {
      if (v.status === "fulfilled") {
        results.set(v.value.url, v.value.valid);
      } else {
        const idx = validations.indexOf(v);
        if (idx >= 0 && idx < batch.length) {
          results.set(batch[idx], false);
        }
      }
    }
  }
  return results;
}

// Get a reliable fallback image for a car based on make/model
export function getReliableFallbackImage(_make: string, _model: string, _year: number): null {
  return null;
}

// Patterns that indicate an invalid/car image URL
const BAD_URL_PATTERNS = [
  /logo/i,
  /icon/i,
  /sprite/i,
  /\.svg$/i,
  /placeholder/i,
  /noimage/i,
  /no-image/i,
  /no_image/i,
  /data:image/i,
  /blank\./i,
  /spacer\./i,
  /pixel\./i,
  /tracking\./i,
  /avatar/i,
  /badge/i,
  /spinner/i,
  /loading/i,
  /default\./i,
  /dummy/i,
  /sample/i,
  /example/i,
];

const VALID_EXTENSIONS = /\.(jpe?g|png|webp|gif|bmp|tiff?)$/i;

// Min length for a URL path to be considered a real image (filters short hashes/placeholders)
const MIN_URL_PATH_LENGTH = 20;

/**
 * Clean photos array: remove empty strings, duplicates, non-HTTP URLs,
 * and patterns that indicate non-car images (logos, icons, placeholders, etc.)
 */
export function cleanPhotos(photos: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const p of photos) {
    if (!p || typeof p !== "string") continue;
    if (!p.startsWith("http")) continue;

    // Deduplicate by normalized URL
    const normalized = p.trim().toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    // Check URL path length (filter short placeholder URLs)
    try {
      const url = new URL(p);
      if (url.pathname.length < MIN_URL_PATH_LENGTH) continue;
    } catch {
      continue; // malformed URL
    }

    // Filter bad patterns
    if (BAD_URL_PATTERNS.some((re) => re.test(p))) continue;

    // Filter URLs without valid image extension (allow CDN URLs that may not have extension)
    const hasExtension = VALID_EXTENSIONS.test(p);
    const isCdnUrl = /cdn|img|image|media|static/i.test(p);
    if (!hasExtension && !isCdnUrl) continue;

    result.push(p);
  }

  return result;
}

/**
 * Pattern-matching-only validation (no network requests).
 * Rejects URLs that are manifestly invalid for car images.
 * Returns only the valid subset.
 */
export function validateImageUrls(photos: string[]): string[] {
  return photos.filter((url) => {
    if (!url || typeof url !== "string") return false;
    if (!url.startsWith("http")) return false;

    // Must have a valid image extension or be from a known CDN
    const hasExtension = VALID_EXTENSIONS.test(url);
    const isCdnUrl = /cdn|img|image|media|static/i.test(url);
    if (!hasExtension && !isCdnUrl) return false;

    // Reject data URIs (base64 inline)
    if (url.startsWith("data:")) return false;

    // Reject obviously broken URLs
    try {
      const parsed = new URL(url);
      if (!parsed.hostname) return false;
      // Reject URLs with port that look like local dev
      if (parsed.port && parsed.port !== "443" && parsed.port !== "80") return false;
    } catch {
      return false;
    }

    return true;
  });
}
