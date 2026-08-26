import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_RAW = process.env.JWT_SECRET;
if (!JWT_SECRET_RAW) {
  console.error("[SECURITY] JWT_SECRET is not set — auth will fail");
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW || "MISSING-SET-JWT_SECRET");

const SESSION_COOKIE = "thiqti_session";

const PROTECTED_ROUTES = ["/admin"];
const PROTECTED_API = ["/api/auth/me", "/api/auth/logout"];

function isProtectedPath(pathname: string): boolean {
  if (PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return true;
  }
  if (PROTECTED_API.some((r) => pathname.startsWith(r))) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Session expirée" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/me", "/api/auth/logout"],
};
