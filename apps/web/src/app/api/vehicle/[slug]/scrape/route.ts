import { NextRequest, NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/sources/aggregator";
import { enrichCarDetails } from "@/lib/sources/enrich";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const allCars = await fetchAllSources();
  const car = allCars.find((c) => c.id === slug);

  if (!car) {
    return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
  }

  const enriched = await enrichCarDetails(car);

  return NextResponse.json({
    id: car.id,
    contact: enriched.contact || car.contact,
    reputation: enriched.reputation || car.reputation,
    specs: enriched.specs || null,
    googleSource: enriched.googleSource || null,
  });
}
