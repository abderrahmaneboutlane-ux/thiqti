"use client";

import { useCallback, useEffect, useRef } from "react";

type TrackPayload = {
  type: string;
  [key: string]: unknown;
};

/**
 * Lightweight client-side analytics hook.
 * Sends events to /api/analytics which stores them server-side.
 * In production, swap the fetch for your analytics provider (gtag, PostHog, etc.)
 */
export function useAnalytics() {
  const sessionIdRef = useRef<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("thiqti_session_id") || (() => {
          const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          localStorage.setItem("thiqti_session_id", id);
          return id;
        })()
      : ""
  );

  const track = useCallback((payload: TrackPayload) => {
    try {
      const body = {
        ...payload,
        sessionId: sessionIdRef.current,
        ts: Date.now(),
        url: typeof window !== "undefined" ? window.location.pathname : "",
      };

      // Fire-and-forget POST — don't block navigation
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
        navigator.sendBeacon("/api/analytics", blob);
      } else {
        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Silently fail — analytics should never break UX
    }
  }, []);

  return { track, sessionId: sessionIdRef.current };
}

/**
 * Page view tracker — call on mount with the page name.
 */
export function usePageView(page: string) {
  const { track } = useAnalytics();
  useEffect(() => {
    track({ type: "page_view", page });
  }, [page, track]);
}
