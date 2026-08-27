import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), ".cache", "thiqti-cars.json");

export async function POST() {
  try {
    // Read existing disk cache
    const raw = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
    const cars = raw.cars || [];

    const sources: Record<string, number> = {};
    for (const c of cars) {
      sources[c.source] = (sources[c.source] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      totalCars: cars.length,
      carsWithImages: cars.filter((c: any) => c.image && c.image.length > 0).length,
      sources,
    });
  } catch {
    return NextResponse.json({
      success: false,
      message: "No disk cache found. Run: npx tsx scripts/test-scraper.ts",
    }, { status: 404 });
  }
}
