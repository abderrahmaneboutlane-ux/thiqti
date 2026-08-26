import { NextRequest, NextResponse } from "next/server";
import { getVehicleReputationService } from "@/lib/backend-db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reputation = await getVehicleReputationService(id);
    if (!reputation) {
      return NextResponse.json({ error: "Réputation introuvable pour ce véhicule" }, { status: 404 });
    }
    return NextResponse.json(reputation);
  } catch (error) {
    console.error("Erreur GET /api/vehicles/[id]/reputation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
