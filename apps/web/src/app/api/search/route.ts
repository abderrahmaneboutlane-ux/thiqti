import { NextRequest, NextResponse } from "next/server";
import { searchVehiclesService } from "@/lib/backend-db";

const ALLOWED_SORT = ["pertinence", "price_asc", "price_desc", "year_desc", "km_asc", "score_desc", "newest"] as const;

function safeNumber(val: string | null, fallback: number, min: number, max: number): number {
  if (!val) return fallback;
  const n = Number(val);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function safeString(val: string | null, maxLen = 100): string | undefined {
  if (!val) return undefined;
  const clean = val.trim().slice(0, maxLen);
  return clean || undefined;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = safeString(searchParams.get("q"), 200);
    const make = safeString(searchParams.get("make"));
    const model = safeString(searchParams.get("model"));
    const fuel = safeString(searchParams.get("fuel"), 30);
    const body_type = safeString(searchParams.get("body_type") || searchParams.get("body"), 30);
    const transmission = safeString(searchParams.get("transmission") || searchParams.get("trans"), 30);
    const inventory_type = safeString(searchParams.get("inventory_type") || searchParams.get("inventory"), 20);
    const city = safeString(searchParams.get("city"));

    const min_price = searchParams.has("min_price") ? safeNumber(searchParams.get("min_price"), 0, 0, 10_000_000) : undefined;
    const max_price = searchParams.has("max_price") ? safeNumber(searchParams.get("max_price"), 0, 0, 10_000_000) : undefined;
    const min_year = searchParams.has("min_year") ? safeNumber(searchParams.get("min_year"), 0, 1950, 2030) : undefined;
    const max_km = searchParams.has("max_km") ? safeNumber(searchParams.get("max_km"), 0, 0, 2_000_000) : undefined;
    const places = searchParams.has("places") ? safeNumber(searchParams.get("places"), 0, 1, 12) : undefined;

    const sortRaw = safeString(searchParams.get("sort"), 30) || "pertinence";
    const sort = (ALLOWED_SORT as readonly string[]).includes(sortRaw) ? sortRaw : "pertinence";

    const page = safeNumber(searchParams.get("page"), 1, 1, 1000);
    const limit = safeNumber(searchParams.get("limit"), 20, 1, 100);

    const data = await searchVehiclesService({
      q, make, model, fuel, body_type, transmission, inventory_type, city,
      min_price, max_price, min_year, max_km, places, sort, page, limit,
    });

    return NextResponse.json({
      ...data,
      results: data.vehicles,
    });
  } catch (error) {
    console.error("Erreur GET /api/search:", error);
    return NextResponse.json({ error: "Erreur recherche" }, { status: 500 });
  }
}
