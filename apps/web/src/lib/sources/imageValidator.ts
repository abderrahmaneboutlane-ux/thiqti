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

// Unsplash car photo pool — 100 unique photos for consistent fallback
const CAR_PHOTOS = [
  "photo-1494976388531-d1058494cdd8","photo-1502877338535-766e1452684a",
  "photo-1503376780353-7e6692767b70","photo-1519641471654-76ce0107ad1b",
  "photo-1533473359331-0135ef1b58bf","photo-1541899481282-d53bffe3c35d",
  "photo-1544636331-e26879cd4d9b","photo-1549317661-bd32c8ce0abb",
  "photo-1549399542-7e3f8b79c341","photo-1552519507-da3b142c6e3d",
  "photo-1555215695-3004980ad54e","photo-1559416523-140ddc3d238c",
  "photo-1560958089-b8a1929cea89","photo-1563720223185-11003d516935",
  "photo-1580273916550-e323be2ae537","photo-1581540222194-0def2dda95b7",
  "photo-1583121274602-3e2820c69888","photo-1593941707882-a5bba14938c7",
  "photo-1603584173870-7f23fdae1b7a","photo-1605559424843-9e4c228bf1c2",
  "photo-1606664515524-ed2f786a0bd6","photo-1614200179396-2bdb77ebf81b",
  "photo-1617814076367-b759c7d7e738","photo-1618843479313-40f8afb4b4d8",
  "photo-1504215680853-026ed2a45def","photo-1596472524329-01bfc670f172",
  "photo-1536700503339-1e4b06520771","photo-1517524008697-84bbe3c3fd98",
  "photo-1511919884226-fd3cad34687c","photo-1609521263047-f8f205293f24",
  "photo-1525609004556-c46c6c5104b8","photo-1570356528233-b442cfabc193",
  "photo-1542362567-b07e54358753","photo-1485291571150-772bcfc10da5",
  "photo-1506015391gy-da1a64376ce1","photo-1469854523086-cc02fe5d8800",
  "photo-1502161254067-49be091d7aef","photo-1492144534655-ae79c964c9d7",
  "photo-1486262715619-67b85e0b08d3","photo-1474487548417-781cb71495f3",
  "photo-1471922694854-ff1b63b20054","photo-1489824904134-891ab64532f1",
  "photo-1520340356584-f9917d1eea6f","photo-1476316946762-44b19f481239",
  "photo-1503736334956-4c8f8e92946d","photo-1516738901171-8eb4fc13bd20",
  "photo-1485463611174-f302f6a5c1c9","photo-1514316454349-750a7fd3da3a",
  "photo-1518987049-03ba18c6e820","photo-1526726538690-5cbf956ae2fd",
  "photo-1534438327276-14e5300c3a48","photo-1535448580089-06fd2228d6c9",
  "photo-1540962351504-03099e0a754b","photo-1541899481282-d53bffe3c35e",
  "photo-1542282088-15e1de997037","photo-1543454200-51b6e5e0d4bd",
  "photo-1543454200-51b6e5e0d4be","photo-1543454200-51b6e5e0d4bf",
  "photo-1546614514-876485998954","photo-1547245324-d777c6f05e80",
  "photo-1549399542-7e3f8b79c340","photo-1550355291-bbee04a92027",
  "photo-1551830820-330a71b99659","photo-1553440569-bcc63803a83d",
  "photo-1555396273-367ea4eb4db5","photo-1558618666-fcd25c85f82e",
  "photo-1559416523-140ddc3d238b","photo-1561361513-2d000a50f0dc",
  "photo-1562911791-c7f8543d0a08","photo-1563720223185-11003d516930",
  "photo-1564349683136-77e08dba1ef7","photo-1567818735868-e71b99932e29",
  "photo-1568792923760-d70635a89fdc","photo-1571607388263-1044f9ea01dd",
  "photo-1573551339678-94404db51d00","photo-1574025516030-2b9838f9e891",
  "photo-1576272531-0f8b50b03139","photo-1580273916550-e323be2ae530",
  "photo-1581235707263-dc498f2e4b88","photo-1582654092340-f6a4245ef8e0",
  "photo-1583267746897-2cf415887172","photo-1584345604476-8ec5f524215c",
  "photo-1585016495485-373e9a3cb895","photo-1586023492125-27b2c045efd7",
  "photo-1588421357574-87938a86fa28","photo-1589712992795-5c6d1ea0e3a8",
  "photo-1590362891991-f776e747a588","photo-1591291621164-2c6367723315",
  "photo-1592198084033-aade902d1aae","photo-1593941707882-a5bba14938c0",
  "photo-1596337221252-0c1135abb3c8","photo-1597007066090-46a9dfb4e3cf",
  "photo-1599913471402-a27f8ba3963c","photo-1600712348895-448a10e524fb",
  "photo-1600880292203-757bb62b4baf","photo-1601929865548-4308f86a2f90",
  "photo-1603584173870-7f23fdae1b70","photo-1604514628550-37467e0763af",
  "photo-1605092631428-fc579a18dc66","photo-1606664515524-ed2f786a0bd0",
  "photo-1607267286432-3d77265f6b1b","photo-1608296463480-b0ec2bee865a",
  "photo-1609143739217-01b60dad1c61","photo-1611016186333-205f68d3d8e0",
  "photo-1611362016088-7e1e2e56e8e1","photo-1612825173281-9a193378527e",
  "photo-1614200179396-2bdb77ebf810","photo-1616455579100-27f929bf37bd",
  "photo-1617814076367-b759c7d7e730","photo-1619682817481-e994891cd1f5",
  "photo-1618843479313-40f8afb4b4d0","photo-1621600411688-4be93cd68504",
  "photo-1622185135505-d268991ba728","photo-1623861093513-3c20b1e32e2d",
  "photo-1625047509248-ec889cbff17f","photo-1627454927967-37505a7af4fd",
];

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Get a reliable fallback image for a car based on make/model
export function getReliableFallbackImage(make: string, model: string, year: number): string {
  const key = `${make}_${model}_${year}`;
  const idx = simpleHash(key) % CAR_PHOTOS.length;
  return `https://images.unsplash.com/${CAR_PHOTOS[idx]}?w=600&auto=format&fit=crop&q=80`;
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
