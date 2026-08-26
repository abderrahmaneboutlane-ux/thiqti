/**
 * Shared image extraction from HTML sections.
 * Used by all HTML-based scrapers (Wandaloo, Kifal, Autocaz, MarocAnnonces, Kijiji, Voiture.ma, SiaraCash).
 */

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i;
const BAD_PATTERNS = /logo|icon|sprite|svg|avatar|badge|thumb_small|placeholder|favicon/i;

/**
 * Extract all image URLs from an HTML section.
 * Captures: src, data-src, data-lazy-src, data-original, srcset (last URL).
 * Also checks for LD+JSON image arrays.
 */
export function extractImagesFromSection(section: string, baseUrl: string): string[] {
  const allImages: string[] = [];
  const seen = new Set<string>();

  // Capture all image source attributes
  const imgRegex = /(?:src|data-src|data-lazy-src|data-original)="([^"]*(?:jpg|jpeg|png|webp|gif)[^"]*)"/gi;
  let imgIter;
  while ((imgIter = imgRegex.exec(section)) !== null) {
    const src = imgIter[1];
    if (src && !BAD_PATTERNS.test(src)) {
      const full = src.startsWith("http") ? src : `${getOrigin(baseUrl)}${src}`;
      if (!seen.has(full)) {
        seen.add(full);
        allImages.push(full);
      }
    }
  }

  // Capture srcset — take the last (largest) URL
  const srcsetRegex = /srcset="([^"]+)"/gi;
  let srcsetIter;
  while ((srcsetIter = srcsetRegex.exec(section)) !== null) {
    const srcsetVal = srcsetIter[1];
    const urls = srcsetVal.split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean);
    const lastUrl = urls[urls.length - 1];
    if (lastUrl && IMAGE_EXTENSIONS.test(lastUrl) && !BAD_PATTERNS.test(lastUrl)) {
      const full = lastUrl.startsWith("http") ? lastUrl : `${getOrigin(baseUrl)}${lastUrl}`;
      if (!seen.has(full)) {
        seen.add(full);
        allImages.push(full);
      }
    }
  }

  // Check LD+JSON in this section
  const ldJsonMatch = section.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (ldJsonMatch) {
    for (const block of ldJsonMatch) {
      try {
        const json = JSON.parse(block.replace(/<\/?script[^>]*>/gi, ""));
        const images = json.image || json.photos || [];
        const imageArr = Array.isArray(images) ? images : [images];
        for (const img of imageArr) {
          if (typeof img === "string" && IMAGE_EXTENSIONS.test(img) && !seen.has(img)) {
            seen.add(img);
            allImages.push(img);
          }
        }
      } catch { /* skip */ }
    }
  }

  return allImages;
}

function getOrigin(url: string): string {
  try {
    const u = new URL(url);
    return u.origin;
  } catch {
    return "";
  }
}
