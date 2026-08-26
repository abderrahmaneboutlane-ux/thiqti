import { NextRequest, NextResponse } from "next/server";
import { getStatsService } from "@/lib/backend-db";

export async function GET(req: NextRequest) {
  try {
    const stats = await getStatsService();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erreur GET /api/stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
