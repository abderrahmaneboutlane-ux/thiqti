import { NextRequest, NextResponse } from "next/server";
import { syncFavoritesService } from "@/lib/backend-db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId") || "default_session";
    const data = await syncFavoritesService(sessionId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur GET /api/favorites:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = body.sessionId || "default_session";
    const vehicleIds = body.vehicleIds || (body.vehicleId ? [body.vehicleId] : []);

    const data = await syncFavoritesService(sessionId, vehicleIds);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur POST /api/favorites:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
