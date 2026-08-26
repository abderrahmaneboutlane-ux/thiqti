import { NextRequest, NextResponse } from "next/server";
import { getVehicleDetailService } from "@/lib/backend-db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await getVehicleDetailService(id);
    if (!vehicle) {
      return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
    }
    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Erreur GET /api/vehicles/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
