import { NextRequest, NextResponse } from "next/server";
import { getVehicleDetailService } from "@/lib/backend-db";
import { fetchAllSources } from "@/lib/sources/aggregator";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Slug manquant" }, { status: 400 });
  }

  // 1. Try DB backend service
  const vehicle = await getVehicleDetailService(slug);
  if (vehicle) {
    return NextResponse.json(vehicle);
  }

  // 2. Fallback to aggregator
  const cars = await fetchAllSources();
  const car = cars.find((c) => c.id === slug);

  if (!car) {
    return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
  }

  return NextResponse.json(car);
}
