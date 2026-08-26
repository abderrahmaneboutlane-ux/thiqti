import { NextRequest, NextResponse } from "next/server";
import { getCompareService } from "@/lib/backend-db";

const MAX_COMPARE_IDS = 5;
const MAX_ID_LENGTH = 20;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids") || searchParams.get("id") || "";
    const ids = idsParam
      .split(",")
      .map((s) => s.trim().slice(0, MAX_ID_LENGTH))
      .filter(Boolean)
      .slice(0, MAX_COMPARE_IDS);

    if (ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    const result = await getCompareService(ids);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur GET /api/compare:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la comparaison" }, { status: 500 });
  }
}
