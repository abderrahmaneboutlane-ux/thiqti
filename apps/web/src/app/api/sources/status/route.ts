import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const cacheFile = path.join(process.cwd(), ".cache", "thiqti-cars.json");
  try {
    const stat = await fs.stat(cacheFile);
    const raw = JSON.parse(await fs.readFile(cacheFile, "utf8"));
    const cars = raw.cars || [];
    const sources: Record<string, number> = {};
    const withImages = cars.filter((c: any) => c.image && c.image.length > 0);
    for (const c of withImages) {
      sources[c.source] = (sources[c.source] || 0) + 1;
    }
    return NextResponse.json({
      cacheAge: Math.round((Date.now() - raw.fetchedAt) / 1000) + "s",
      totalCars: cars.length,
      carsWithImages: withImages.length,
      carsWithoutImages: cars.length - withImages.length,
      sources,
      sampleCars: cars.slice(0, 3).map((c: any) => ({
        title: c.title,
        source: c.source,
        image: c.image,
        photosCount: c.photos?.length || 0,
        url: c.url,
      })),
    });
  } catch {
    return NextResponse.json({
      cacheExists: false,
      message: "No disk cache found. Aggregator needs to be warmed first.",
    });
  }
}
