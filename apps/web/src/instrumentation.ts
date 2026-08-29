/**
 * Next.js instrumentation — runs once on server start.
 * Checks cache freshness. Actual scraping is done via scrape-cars.js.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { promises: fs } = await import("fs");
    const path = (await import("path")).default;

    const cacheFile = path.join(process.cwd(), ".cache", "thiqti-cars.json");
    const realCarsFile = path.join(process.cwd(), "real-cars.json");

    const hasCache = await fs.access(cacheFile).then(() => true).catch(() => false);
    const hasRealCars = await fs.access(realCarsFile).then(() => true).catch(() => false);

    if (hasCache) {
      try {
        const stat = await fs.stat(cacheFile);
        const age = Date.now() - stat.mtimeMs;
        if (age < 60 * 60 * 1000) {
          console.log("[Thiqti] Cache is fresh (< 1h)");
          return;
        }
      } catch {}
    }

    if (!hasCache && hasRealCars) {
      console.log("[Thiqti] No .cache but real-cars.json exists — frontend will use it directly");
    } else if (!hasCache && !hasRealCars) {
      console.log("[Thiqti] No cache found. Run: node scrape-cars.js");
    } else {
      console.log("[Thiqti] Cache is stale. Run: node scrape-cars.js to refresh");
    }
  }
}
