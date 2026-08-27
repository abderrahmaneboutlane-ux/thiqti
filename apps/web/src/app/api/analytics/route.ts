import { NextRequest, NextResponse } from "next/server";

export interface AnalyticsEvent {
  type: string;
  sessionId: string;
  url: string;
  ts: number;
  [key: string]: unknown;
}

const _events: AnalyticsEvent[] = [];
const MAX_EVENTS = 10000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const event: AnalyticsEvent = {
      type: typeof body.type === "string" ? body.type : "unknown",
      sessionId: typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : "",
      url: typeof body.url === "string" ? body.url.slice(0, 500) : "",
      ts: typeof body.ts === "number" ? body.ts : Date.now(),
      ...body,
    };

    _events.push(event);

    // Cap memory usage
    if (_events.length > MAX_EVENTS) {
      _events.splice(0, _events.length - MAX_EVENTS);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  // Return funnel summary + recent events
  const eventsByType: Record<string, number> = {};
  for (const e of _events) {
    eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
  }

  // Unique sessions
  const uniqueSessions = new Set(_events.map((e) => e.sessionId).filter(Boolean)).size;

  // Events in last 24h
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentEvents = _events.filter((e) => e.ts > oneDayAgo);
  const recentByType: Record<string, number> = {};
  for (const e of recentEvents) {
    recentByType[e.type] = (recentByType[e.type] || 0) + 1;
  }

  return NextResponse.json({
    total: _events.length,
    uniqueSessions,
    allTime: eventsByType,
    last24h: recentByType,
    recent: _events.slice(-20).reverse(),
  });
}
