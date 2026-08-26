import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = [
  "images.unsplash.com",
  "images.pexels.com",
  "cdn.pixabay.com",
  "s1.cdn.autoevolution.com",
  "api.auto24.ma",
  "auto24.ma",
  "www.avito.ma",
  "img.avito.ma",
  "www.moteur.ma",
  "www.wandaloo.com",
  "www.kifal.ma",
  "www.spoticar.ma",
  "www.autocaz.ma",
  "www.soeezauto.ma",
  "ovoiture.ma",
  "www.marocannonces.com",
  "www.kijiji.ma",
  "voiture.ma",
  "www.siaracash.com",
  "loremflickr.com",
  "live.staticflickr.com",
];

const BLOCKED_NETWORKS = [
  "127.",
  "10.",
  "172.16.",
  "172.17.",
  "172.18.",
  "172.19.",
  "172.20.",
  "172.21.",
  "172.22.",
  "172.23.",
  "172.24.",
  "172.25.",
  "172.26.",
  "172.27.",
  "172.28.",
  "172.29.",
  "172.30.",
  "172.31.",
  "192.168.",
  "0.",
  "169.254.",
];

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function isAllowedUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") return false;
    if (ALLOWED_HOSTS.includes(parsed.hostname)) return true;
    return false;
  } catch {
    return false;
  }
}

function isBlockedNetwork(hostname: string): boolean {
  return BLOCKED_NETWORKS.some((prefix) => hostname.startsWith(prefix));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    if (!isAllowedUrl(url)) {
      return NextResponse.json({ error: "URL not in allowlist" }, { status: 403 });
    }

    const hostname = new URL(url).hostname;
    if (isBlockedNetwork(hostname)) {
      return NextResponse.json({ error: "Blocked network" }, { status: 403 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Thiqti/1.0 (image-proxy)",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image" }, { status: 400 });
    }

    const contentLength = Number(res.headers.get("content-length") || "0");
    if (contentLength > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}
