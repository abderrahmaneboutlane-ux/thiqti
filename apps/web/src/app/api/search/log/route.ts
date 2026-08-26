import { NextRequest, NextResponse } from "next/server";
import { logSearchService } from "@/lib/backend-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await logSearchService(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erreur enregistrement log" }, { status: 500 });
  }
}
