"use client";

import { useEffect } from "react";
import { trpc } from "~/trpc/client";
import { getToken, isAuthenticated } from "~/lib/auth";
import { env } from "~/env.js";
import type { RealtimeEvent } from "@repo/types";

function wsUrl(token: string): string {
  const api =
    env.NEXT_PUBLIC_API_BASE_URL ??
    (env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/trpc").replace(/\/trpc\/?$/, "");
  const base = api.replace(/^http/, "ws");
  return `${base}/ws?token=${encodeURIComponent(token)}`;
}

/** Subscribe to live analytics updates over WebSocket and refresh tRPC caches. */
export function useRealtimeAnalytics(enabled = true): void {
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!enabled || !isAuthenticated()) return;

    const token = getToken();
    if (!token) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let socket: WebSocket | null = null;

    const invalidateForEvent = (event: RealtimeEvent) => {
      void utils.analytics.dashboard.invalidate();
      void utils.analytics.recentSubmissions.invalidate();
      void utils.forms.list.invalidate();

      if (event.formId) {
        void utils.responses.list.invalidate({ formId: event.formId });
        void utils.analytics.getFormAnalytics.invalidate({ formId: event.formId });
        void utils.analytics.getFieldAnalytics.invalidate({ formId: event.formId });
        void utils.forms.getById.invalidate({ id: event.formId });
      }
    };

    const connect = () => {
      if (cancelled) return;

      socket = new WebSocket(wsUrl(token));

      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(String(message.data)) as RealtimeEvent | { type: "connected" };
          if (event.type === "analytics.updated") {
            invalidateForEvent(event);
          }
        } catch {
          // ignore malformed frames
        }
      };

      socket.onclose = () => {
        socket = null;
        if (!cancelled) {
          retryTimer = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      socket?.close();
    };
  }, [enabled, utils]);
}
