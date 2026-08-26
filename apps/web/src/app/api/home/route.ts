import { NextRequest, NextResponse } from "next/server";
import { getHomeDataService } from "@/lib/backend-db";

export async function GET(req: NextRequest) {
  try {
    const data = await getHomeDataService();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur GET /api/home:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
