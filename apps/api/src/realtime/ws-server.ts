import type { Server } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { logger } from "@repo/logger";
import { authService } from "@repo/services/auth";
import { setRealtimeEmitter } from "@repo/services/realtime";
import type { RealtimeAnalyticsPayload, RealtimeEvent } from "@repo/types/realtime";

const clientsByCreator = new Map<string, Set<WebSocket>>();

function addClient(creatorId: string, ws: WebSocket) {
  let set = clientsByCreator.get(creatorId);
  if (!set) {
    set = new Set();
    clientsByCreator.set(creatorId, set);
  }
  set.add(ws);
}

function removeClient(creatorId: string, ws: WebSocket) {
  const set = clientsByCreator.get(creatorId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) clientsByCreator.delete(creatorId);
}

function broadcastToCreator(creatorId: string, event: RealtimeEvent) {
  const set = clientsByCreator.get(creatorId);
  if (!set?.size) return;
  const payload = JSON.stringify(event);
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) {
      ws.send(payload);
    }
  }
}

export function attachWebSocketServer(server: Server): void {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (ws, req) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(4401, "Unauthorized");
      return;
    }

    let creatorId: string;
    try {
      const user = await authService.validateToken(token);
      creatorId = user.id;
    } catch {
      ws.close(4401, "Unauthorized");
      return;
    }

    addClient(creatorId, ws);
    ws.send(JSON.stringify({ type: "connected", at: new Date().toISOString() }));

    ws.on("close", () => removeClient(creatorId, ws));
    ws.on("error", () => removeClient(creatorId, ws));
  });

  setRealtimeEmitter({
    notifyAnalyticsUpdate(payload: RealtimeAnalyticsPayload) {
      broadcastToCreator(payload.creatorId, {
        type: "analytics.updated",
        formId: payload.formId,
        reason: payload.reason,
        responseId: payload.responseId,
        at: new Date().toISOString(),
      });
    },
  });

  logger.info("WebSocket server attached at /ws");
}
