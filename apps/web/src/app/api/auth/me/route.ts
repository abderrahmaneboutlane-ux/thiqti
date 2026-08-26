import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }
  return NextResponse.json({
    email: session.email,
    role: session.role,
    name: session.name ?? null,
    picture: session.picture ?? null,
  });
}
