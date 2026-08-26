// ============================================================================
// AGREGATEUR HIGH-PERFORMANCE — <1s RECHARGEMENT
// ============================================================================
// Stratégie :
//   1. Fallback instantané (<50ms) — données pré-calculées en mémoire
//   2. Fast collectors en background — résultats ajoutés au cache
//   3. Slow collectors en background — résultats ajoutés au cache
//   4. Search index pré-construit — O(1) par mot-clé
//   5. Pre-warming au démarrage du serveur
// ============================================================================

import { promises as fs } from "fs";
import path from "path";
import { UnifiedCar, InventoryType, inferBodyType } from "./types";
import { getFallbackCars } from "./fallback";
import { fetchAuteraCars } from "./autera";
import { fetchAutohallCars } from "./autohall";
import { fetchMoteurNeufCars } from "./moteur-neuf";
import { MoteurCollector } from "./moteur";
import { ElectroDriveCollector } from "./electrodrive";
import { Auto24Collector } from "./auto24";
import { SoeezAutoCollector } from "./soeezauto";
import { AvitoCollector } from "./avito";
import { OVoitureCollector } from "./ovoiture";
import { OfficialBrandsCollector } from "./official-brands";
import { WandalooCollector } from "./wandaloo";
import { KifalCollector } from "./kifal";
import { SpoticarCollector } from "./spoticar";
import { AutocazCollector } from "./autocaz";
import { MarocAnnoncesCollector } from "./marocannonces";
import { KijijiCollector } from "./kijiji";
import { VoitureCollector } from "./voiture";
import { SiaraCashCollector } from "./siaracash";
import { fetchDetailPhotos } from "./detailPhotos";
import { cleanPhotos, validateImageUrls } from "./imageValidator";
import { googleImagesFallback } from "./googleImages";
import { cachedImageFor } from "@/lib/images";
import { safetyRatingFor } from "@/lib/safetyRatings";

const CACHE_TTL = 10 * 60 * 1000;
const CACHE_FILE = path.join(process.cwd(), ".cache", "thiqti-cars.json");

// ============================================================================
// CACHE STATE
// ============================================================================

let cache: UnifiedCar[] | null = null;
let cacheTimestamp = 0;
let isWarming = false;
let warmPromise: Promise<void> | null = null;

// ============================================================================
// SEARCH INDEX (pré-construit pour O(1) lookup par mot)
// ============================================================================

let searchIndex: Map<string, Set<number>> | null = null;
let indexedCars: UnifiedCar[] | null = null;

function buildSearchIndex(cars: UnifiedCar[]): Map<string, Set<number>> {
  const index = new Map<string, Set<number>>();
  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    const fields = [
      car.make, car.model, car.title, car.fuel,
      car.bodyType, car.transmission, car.city,
      car.year.toString(), car.source,
    ];
    for (const field of fields) {
      const words = field.toLowerCase().split(/\s+/).filter(Boolean);
      for (const word of words) {
        if (word.length < 2) continue;
        let set = index.get(word);
        if (!set) {
          set = new Set();
          index.set(word, set);
        }
        set.add(i);
      }
    }
  }
  return index;
}

function rebuildSearchIndex(cars: UnifiedCar[]): void {
  searchIndex = buildSearchIndex(cars);
  indexedCars = cars;
}

// ============================================================================
// PRE-PROCESSING — lowercase fields computed once
// ============================================================================

function preProcess(cars: UnifiedCar[]): UnifiedCar[] {
  return cars.map((car) => {
    const bodyType = car.bodyType === "Non précisé"
      ? inferBodyType(car.make, car.model, car.title)
      : car.bodyType;
    return {
      ...car,
      bodyType,
      safety: safetyRatingFor(car.make, car.model),
    };
  });
}

function cleanAndValidatePhotos(cars: UnifiedCar[]): UnifiedCar[] {
  return cars.map((car) => {
    const cleaned = cleanPhotos(car.photos);
    const validated = validateImageUrls(cleaned);
    return {
      ...car,
      photos: validated,
      image: validated[0] || car.image || "",
    };
  });
}

function deduplicate(cars: UnifiedCar[]): UnifiedCar[] {
  const seen = new Map<string, UnifiedCar>();
  for (const car of cars) {
    const key = `${car.make.toLowerCase()}_${car.model.toLowerCase()}_${car.year}_${car.price}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, car);
    } else if (car.photos.length > existing.photos.length) {
      const better = { ...car, photos: [...new Set([...existing.photos, ...car.photos])] };
      if (!better.image && existing.image) better.image = existing.image;
      seen.set(key, better);
    } else if (!existing.image && car.image) {
      seen.set(key, { ...existing, image: car.image, photos: [...new Set([...existing.photos, ...car.photos])] });
    }
  }
  return Array.from(seen.values());
}

// ============================================================================
// DISK CACHE
// ============================================================================

async function readDiskCache(): Promise<UnifiedCar[] | null> {
  try {
    const parsed = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
    if (!Array.isArray(parsed.cars)) return null;
    return parsed.cars as UnifiedCar[];
  } catch {
    return null;
  }
}

async function writeDiskCache(cars: UnifiedCar[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify({ cars, fetchedAt: Date.now() }), "utf8");
  } catch {}
}

// ============================================================================
// FAST LOAD — fallback + fast collectors only (<5s)
// ============================================================================

async function loadFast(): Promise<UnifiedCar[]> {
  const fallback = getFallbackCars().map((car) => ({
    ...car,
    safety: safetyRatingFor(car.make, car.model),
    isDemoData: true,
  }));

  const fastCollectors = [
    new OfficialBrandsCollector(),
    new ElectroDriveCollector(),
    new KifalCollector(),
    new SpoticarCollector(),
    new MarocAnnoncesCollector(),
    new KijijiCollector(),
    new VoitureCollector(),
    new SiaraCashCollector(),
  ];

  // Timeout 8s pour chaque fast collector
  const results = await Promise.allSettled(
    fastCollectors.map((c) =>
      Promise.race([
        c.fetch(),
        new Promise<UnifiedCar[]>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
      ])
    )
  );

  let allCars: UnifiedCar[] = [...fallback];
  for (const r of results) {
    if (r.status === "fulfilled") allCars.push(...r.value);
  }

  return preProcess(deduplicate(allCars));
}

// ============================================================================
// FULL LOAD — all sources (background, non-blocking)
// ============================================================================

async function loadFull(): Promise<UnifiedCar[]> {
  // Phase 1: Fast collectors (8s timeout each)
  const fastCollectors = [
    new OfficialBrandsCollector(),
    new Auto24Collector(),
    new ElectroDriveCollector(),
    new KifalCollector(),
    new SpoticarCollector(),
    new MarocAnnoncesCollector(),
    new KijijiCollector(),
    new VoitureCollector(),
    new SiaraCashCollector(),
  ];

  const fastResults = await Promise.allSettled(
    fastCollectors.map((c) =>
      Promise.race([
        c.fetch(),
        new Promise<UnifiedCar[]>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
      ])
    )
  );

  let fastCars: UnifiedCar[] = [];
  for (const r of fastResults) {
    if (r.status === "fulfilled") fastCars.push(...r.value);
  }

  // Phase 2: Binôme sources (10s timeout)
  const binomeResults = await Promise.allSettled([
    Promise.race([fetchAuteraCars(), timeout<UnifiedCar[]>(10000)]),
    Promise.race([fetchAutohallCars(), timeout<UnifiedCar[]>(10000)]),
    Promise.race([fetchMoteurNeufCars(), timeout<UnifiedCar[]>(10000)]),
    Promise.race([new MoteurCollector().fetch(), timeout<UnifiedCar[]>(10000)]),
  ]);

  let binomeCars: UnifiedCar[] = [];
  for (const r of binomeResults) {
    if (r.status === "fulfilled") binomeCars.push(...r.value);
  }

  const allLive = [...fastCars, ...binomeCars];
  return preProcess(cleanAndValidatePhotos(deduplicate(allLive)));
}

function timeout<T>(ms: number): Promise<T> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

// ============================================================================
// SLOW ENRICHMENT — background only (detail photos, Google Images)
// ============================================================================

async function enrichInBackground(cars: UnifiedCar[]): Promise<void> {
  try {
    // Detail photos for cars with <2 photos
    const needPhotos = cars
      .filter((c) => c.photos.length < 2 && c.sourceUrl && c.sourceUrl !== "#")
      .slice(0, 50);

    if (needPhotos.length > 0) {
      const urls = needPhotos.map((c) => c.sourceUrl);
      const detailMap = await fetchDetailPhotos(urls);
      for (const car of needPhotos) {
        const extra = detailMap.get(car.sourceUrl);
        if (extra && extra.length > 0) {
          car.photos = [...new Set([...car.photos, ...extra])];
          if (!car.image && extra[0]) car.image = extra[0];
        }
      }
    }

    // Google Images fallback for cars without photos
    const noPhotos = cars.filter((c) => c.photos.length === 0 && c.make && c.model);
    if (noPhotos.length > 0) {
      const googleMap = await googleImagesFallback(noPhotos);
      for (const car of noPhotos) {
        const gp = googleMap.get(car.id);
        if (gp && gp.length > 0) {
          car.photos = gp;
          if (!car.image) car.image = gp[0];
        }
      }
    }

    // Rebuild search index with enriched data
    rebuildSearchIndex(cars);
  } catch (err) {
    console.error("[Sources] Enrichment error:", err);
  }
}

// ============================================================================
// WARMING — background, non-blocking
// ============================================================================

async function warmCache(): Promise<void> {
  if (isWarming) return;
  isWarming = true;

  try {
    // Step 1: Fast cache (<5s)
    console.log("[Sources] Warming fast cache...");
    const fastCars = await loadFast();
    cache = fastCars;
    cacheTimestamp = Date.now();
    rebuildSearchIndex(fastCars);
    void writeDiskCache(fastCars);
    console.log(`[Sources] Fast cache: ${fastCars.length} cars`);

    // Step 2: Full cache (background, 10-15s)
    console.log("[Sources] Warming full cache...");
    const fullCars = await loadFull();
    cache = fullCars;
    cacheTimestamp = Date.now();
    rebuildSearchIndex(fullCars);
    void writeDiskCache(fullCars);
    console.log(`[Sources] Full cache: ${fullCars.length} cars`);

    // Step 3: Enrichment (background, non-blocking)
    void enrichInBackground(fullCars);
  } catch (err) {
    console.error("[Sources] Warm error:", err);
  } finally {
    isWarming = false;
    warmPromise = null;
  }
}

function startWarm(): void {
  if (warmPromise || cache) return;
  warmPromise = warmCache();
}

// ============================================================================
// STARTUP — load disk cache instantly, warm in background
// ============================================================================

async function initCache(): Promise<UnifiedCar[]> {
  // 1. Try disk cache first (<50ms)
  const disk = await readDiskCache();
  if (disk && disk.length > 0) {
    cache = disk;
    cacheTimestamp = Date.now();
    rebuildSearchIndex(disk);
    // Refresh in background
    startWarm();
    return disk;
  }

  // 2. No disk cache — use fallback instantly
  const fallback = getFallbackCars().map((car) => ({
    ...car,
    safety: safetyRatingFor(car.make, car.model),
    isDemoData: true,
  }));
  cache = fallback;
  cacheTimestamp = Date.now();
  rebuildSearchIndex(fallback);

  // Warm full cache in background
  startWarm();

  return fallback;
}

// ============================================================================
// PUBLIC API
// ============================================================================

export async function fetchAllSources(): Promise<UnifiedCar[]> {
  const now = Date.now();

  // Cache valid
  if (cache && now - cacheTimestamp < CACHE_TTL) {
    return cache;
  }

  // Init if first call
  if (!cache) {
    return initCache();
  }

  // Cache expired — serve stale, refresh background
  startWarm();
  return cache;
}

export async function fetchNewCars(): Promise<UnifiedCar[]> {
  const cars = await fetchAllSources();
  return cars.filter((c) => c.inventoryType === "new");
}

export async function fetchUsedCars(): Promise<UnifiedCar[]> {
  const cars = await fetchAllSources();
  return cars.filter((c) => c.inventoryType === "used");
}

// ============================================================================
// SEARCH — O(1) per word via pre-built index
// ============================================================================

const STOP_WORDS = new Set([
  "je", "cherche", "chercher", "trouver", "veux", "vouloir", "souhaite",
  "aimerais", "un", "une", "des", "du", "de", "la", "le", "les", "au", "aux",
  "pour", "avec", "sans", "et", "ou", "dans", "sur", "en", "que", "qui",
  "quoi", "dont", "est", "suis", "sont", "il", "elle", "on", "mon", "ma",
  "mes", "ton", "ta", "tes", "son", "sa", "ses", "ne", "pas", "plus",
  "moins", "autour", "environ", "type", "genre", "voiture", "auto", "marque",
  "modele", "modèle", "budget", "prix", "dirhams", "dirham", "dh", "mad",
  "confortable", "confort", "famille", "familial", "familiale", "boite",
  "boîte", "neuf", "neuve", "occasion", "cher", "chere",
  "the", "a", "an", "of", "to", "for", "and", "or", "i", "we", "you",
]);

export async function searchAllSources(query: string, type?: InventoryType): Promise<UnifiedCar[]> {
  const allCars = await fetchAllSources();

  if (!query) {
    if (type === "new" || type === "used") {
      return allCars.filter((c) => c.inventoryType === type);
    }
    return allCars;
  }

  let pool = allCars;
  if (type === "new" || type === "used") {
    pool = allCars.filter((c) => c.inventoryType === type);
  }

  const words = query
    .toLowerCase()
    .replace(/['\u2019]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}]+/u, "").replace(/[^\p{L}\p{N}]+$/u, ""))
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  if (words.length === 0) return pool;

  // Use search index if available
  if (searchIndex && indexedCars === pool) {
    let candidateIds: Set<number> | null = null;
    for (const word of words) {
      const wordIds = searchIndex.get(word);
      if (!wordIds) {
        // Try substring match
        let found = false;
        for (const [key, ids] of searchIndex) {
          if (key.includes(word) || word.includes(key)) {
            if (!candidateIds) {
              candidateIds = new Set(ids);
            } else {
              for (const id of candidateIds) {
                if (!ids.has(id)) candidateIds.delete(id);
              }
            }
            found = true;
            break;
          }
        }
        if (!found) return [];
      } else {
        if (!candidateIds) {
          candidateIds = new Set(wordIds);
        } else {
          for (const id of candidateIds) {
            if (!wordIds.has(id)) candidateIds.delete(id);
          }
        }
      }
    }
    if (candidateIds && candidateIds.size > 0) {
      return [...candidateIds].map((i) => pool[i]).filter(Boolean);
    }
  }

  // Fallback: linear scan
  function carMatches(car: UnifiedCar, word: string): boolean {
    return (
      car.make.toLowerCase().includes(word) ||
      car.model.toLowerCase().includes(word) ||
      car.title.toLowerCase().includes(word) ||
      car.fuel.toLowerCase().includes(word) ||
      car.bodyType.toLowerCase().includes(word) ||
      car.transmission.toLowerCase().includes(word) ||
      car.city.toLowerCase().includes(word) ||
      car.year.toString().includes(word)
    );
  }

  let matched = pool.filter((car) => words.every((w) => carMatches(car, w)));
  while (matched.length === 0 && words.length > 1) {
    words.pop();
    matched = pool.filter((car) => words.every((w) => carMatches(car, w)));
  }

  return matched.length > 0 ? matched : pool.slice(0, 20);
}

export async function getSourceStats(): Promise<Record<string, number>> {
  const cars = await fetchAllSources();
  const stats: Record<string, number> = {};
  for (const car of cars) {
    stats[car.source] = (stats[car.source] || 0) + 1;
  }
  return stats;
}

// ============================================================================
// PRE-WARM on module load (Next.js server start)
// ============================================================================

void initCache();
