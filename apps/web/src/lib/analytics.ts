/**
 * Analytics — Event tracking for conversion funnel.
 * All events are stored in-memory (no external analytics service).
 * For production, swap the dispatch to Google Analytics / Mixpanel.
 */

export type FunnelEvent =
  | { type: "search_started"; query: string; criteriaCount: number; ts: number }
  | { type: "vehicle_viewed"; vehicleId: string; source: "search" | "chat" | "home" | "compare"; ts: number }
  | { type: "vehicle_compared"; vehicleIds: string[]; ts: number }
  | { type: "favorite_toggled"; vehicleId: string; action: "add" | "remove"; ts: number }
  | { type: "lead_submitted"; vehicleId: string; channel: "vehicle_detail" | "chat"; ts: number }
  | { type: "chat_started"; ts: number }
  | { type: "chat_criteria_collected"; criteriaCount: number; ts: number }
  | { type: "chat_auto_search_triggered"; criteriaCount: number; ts: number };

const _events: FunnelEvent[] = [];

export function trackEvent(event: FunnelEvent): void {
  _events.push(event);
  // In production, dispatch to analytics provider:
  // gtag?.("event", event.type, { ...event });
}

export function getEvents(): FunnelEvent[] {
  return [..._events];
}

export function getFunnelSummary(): {
  searches: number;
  vehicleViews: number;
  comparisons: number;
  favorites: number;
  leads: number;
  chatStarts: number;
} {
  return {
    searches: _events.filter((e) => e.type === "search_started").length,
    vehicleViews: _events.filter((e) => e.type === "vehicle_viewed").length,
    comparisons: _events.filter((e) => e.type === "vehicle_compared").length,
    favorites: _events.filter((e) => e.type === "favorite_toggled" && e.action === "add").length,
    leads: _events.filter((e) => e.type === "lead_submitted").length,
    chatStarts: _events.filter((e) => e.type === "chat_started").length,
  };
}

export function clearEvents(): void {
  _events.length = 0;
}
