import { NextRequest, NextResponse } from "next/server";
import { getVehicleDetailService } from "@/lib/backend-db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Slug manquant" }, { status: 400 });
  }

  // 1. Try DB backend service (seed data + disk cache)
  const vehicle = await getVehicleDetailService(slug);
  if (vehicle) {
    return NextResponse.json(vehicle);
  }

  return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
}
