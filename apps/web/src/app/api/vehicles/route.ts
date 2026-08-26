import { NextRequest, NextResponse } from "next/server";
import { searchVehiclesService } from "@/lib/backend-db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;
    const make = searchParams.get("make") || undefined;
    const model = searchParams.get("model") || undefined;
    const fuel = searchParams.get("fuel") || undefined;
    const body_type = searchParams.get("body_type") || searchParams.get("body") || undefined;
    const transmission = searchParams.get("transmission") || searchParams.get("trans") || undefined;
    const inventory_type = searchParams.get("inventory_type") || searchParams.get("inventory") || undefined;
    const city = searchParams.get("city") || undefined;
    const min_price = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined;
    const max_price = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined;
    const min_year = searchParams.get("min_year") ? Number(searchParams.get("min_year")) : undefined;
    const max_km = searchParams.get("max_km") ? Number(searchParams.get("max_km")) : undefined;
    const places = searchParams.get("places") ? Number(searchParams.get("places")) : undefined;
    const sort = searchParams.get("sort") || "pertinence";
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;

    const data = await searchVehiclesService({
      q,
      make,
      model,
      fuel,
      body_type,
      transmission,
      inventory_type,
      city,
      min_price,
      max_price,
      min_year,
      max_km,
      places,
      sort,
      page,
      limit
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur GET /api/vehicles:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la recherche" }, { status: 500 });
  }
}
