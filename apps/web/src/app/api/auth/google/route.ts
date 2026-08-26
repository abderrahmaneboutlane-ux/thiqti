import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { verifyGoogleIdToken } from "@/lib/googleAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential } = body;
    if (!credential || typeof credential !== "string") {
      return NextResponse.json({ error: "Jeton Google manquant" }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "Google login non configure (GOOGLE_CLIENT_ID manquant)" },
        { status: 500 }
      );
    }

    const user = await verifyGoogleIdToken(credential, clientId);
    if (!user) {
      return NextResponse.json({ error: "Jeton Google invalide" }, { status: 401 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const role =
      adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase()
        ? "admin"
        : "user";

    const token = await createSession({
      email: user.email,
      role,
      name: user.name,
      picture: user.picture,
    });

    const response = NextResponse.json({
      success: true,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role,
    });
    response.cookies.set("thiqti_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err) {
    console.error("Google login error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
