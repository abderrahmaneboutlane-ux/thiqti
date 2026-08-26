import { queueScrapeJob, setProcessor, startScheduler, stopScheduler, clearCompletedJobs } from "./queue";
import { validatePrice } from "./priceValidator";
import { normalizeModel, getDefaultFuel, getDefaultTransmission } from "./models";
import { sleep } from "./retry";
import type { UnifiedCar } from "@/lib/sources/types";

export interface ScrapeResult {
  totalSources: number;
  successfulSources: number;
  failedSources: number;
  totalVehicles: number;
  newVehicles: number;
  duplicatesRemoved: number;
  priceErrors: number;
  duration: number;
  errors: { source: string; error: string }[];
  timestamp: string;
}

const APPROVED_SOURCES = [
  "auto24",
  "moteur",
  "soeezauto",
  "avito",
  "ovoiture",
  "wandaloo",
  "kifal",
  "spoticar",
  "autocaz",
  "electrodrive",
];

const SOURCE_DELAY_MS = 2000;

function deduplicate(cars: UnifiedCar[]): { deduplicated: UnifiedCar[]; removed: number } {
  const seen = new Map<string, UnifiedCar>();

  for (const car of cars) {
    const normalized = normalizeModel(car.make, car.model);
    const key = normalized
      ? `${normalized.brand.toLowerCase()}_${normalized.model.toLowerCase()}_${car.year}_${car.km}`
      : `${car.make.toLowerCase()}_${car.model.toLowerCase()}_${car.year}_${car.km}`;

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, car);
    } else {
      if (car.photos.length > existing.photos.length) {
        const merged = {
          ...car,
          photos: [...new Set([...existing.photos, ...car.photos])],
        };
        if (!merged.image && existing.image) merged.image = existing.image;
        seen.set(key, merged);
      } else if (!existing.image && car.image) {
        seen.set(key, {
          ...existing,
          image: car.image,
          photos: [...new Set([...existing.photos, ...car.photos])],
        });
      }
    }
  }

  return {
    deduplicated: Array.from(seen.values()),
    removed: cars.length - seen.size,
  };
}

function validatePrices(cars: UnifiedCar[]): { valid: UnifiedCar[]; errors: number } {
  let errors = 0;
  const valid: UnifiedCar[] = [];

  for (const car of cars) {
    const result = validatePrice(car.price, car.make, car.model, car.year);
    if (result.valid) {
      valid.push(car);
    } else {
      errors++;
      console.warn(
        `[Scheduler] Price rejected for ${car.make} ${car.model} ${car.year}: ${car.price} DH — ${result.reason}`,
      );
    }
  }

  return { valid, errors };
}

function enrichMissingData(cars: UnifiedCar[]): UnifiedCar[] {
  return cars.map((car) => {
    const enriched = { ...car };

    const modelInfo = normalizeModel(car.make, car.model);
    if (modelInfo) {
      enriched.make = modelInfo.brand;
      enriched.model = modelInfo.model;
      enriched.bodyType = modelInfo.bodyType;
    }

    if (!enriched.fuel || enriched.fuel === "unknown") {
      const bf = modelInfo?.brand ?? enriched.make;
      const mf = modelInfo?.model ?? enriched.model;
      const defaultFuel = getDefaultFuel(bf, mf);
      if (defaultFuel) enriched.fuel = defaultFuel;
    }

    if (!enriched.transmission || enriched.transmission === "unknown") {
      const bt = modelInfo?.brand ?? enriched.make;
      const mt = modelInfo?.model ?? enriched.model;
      const defaultTrans = getDefaultTransmission(bt, mt);
      if (defaultTrans) enriched.transmission = defaultTrans;
    }

    if (!enriched.image && enriched.photos.length > 0) {
      enriched.image = enriched.photos[0]!;
    }

    return enriched;
  });
}

export async function runFullScrape(): Promise<ScrapeResult> {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();
  const errors: { source: string; error: string }[] = [];

  console.log(`[Scheduler] Starting full scrape at ${timestamp}`);

  setProcessor(async (job) => {
    console.log(`[Scheduler] Processing job ${job.id}: ${job.sourceName}/${job.type}`);
  });

  for (const source of APPROVED_SOURCES) {
    await queueScrapeJob(source, "listings");
  }

  startScheduler(1000);

  let allCars: UnifiedCar[] = [];

  for (const source of APPROVED_SOURCES) {
    try {
      const { fetchAllSources } = await import("@/lib/sources/aggregator");
      const cars = await fetchAllSources();
      const sourceCars = cars.filter(
        (c) => c.source.toLowerCase().includes(source.toLowerCase()),
      );
      allCars.push(...sourceCars);
      console.log(`[Scheduler] ${source}: ${sourceCars.length} vehicles collected`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ source, error: msg });
      console.error(`[Scheduler] ${source} failed: ${msg}`);
    }

    await sleep(SOURCE_DELAY_MS);
  }

  stopScheduler();

  const totalSources = APPROVED_SOURCES.length;
  const failedSources = errors.length;
  const successfulSources = totalSources - failedSources;

  console.log(`[Scheduler] Collected ${allCars.length} vehicles from ${totalSources} sources`);

  const { deduplicated, removed: duplicatesRemoved } = deduplicate(allCars);
  console.log(`[Scheduler] After dedup: ${deduplicated.length} (${duplicatesRemoved} removed)`);

  const { valid: priceValid, errors: priceErrors } = validatePrices(deduplicated);
  console.log(`[Scheduler] After price validation: ${priceValid.length} (${priceErrors} rejected)`);

  const enriched = enrichMissingData(priceValid);

  const newVehicles = enriched.filter(
    (c) => c.year >= 2024 && c.km < 1000,
  ).length;

  const duration = Math.round(performance.now() - startTime);

  const result: ScrapeResult = {
    totalSources,
    successfulSources,
    failedSources,
    totalVehicles: enriched.length,
    newVehicles,
    duplicatesRemoved,
    priceErrors,
    duration,
    errors,
    timestamp,
  };

  console.log(`[Scheduler] Scrape complete in ${duration}ms`);
  console.log(`[Scheduler] Result:`, JSON.stringify(result, null, 2));

  clearCompletedJobs();

  return result;
}
