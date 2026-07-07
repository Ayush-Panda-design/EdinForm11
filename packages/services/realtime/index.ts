import type { RealtimeAnalyticsPayload } from "@repo/types/realtime";

export type RealtimeEmitter = {
  notifyAnalyticsUpdate: (payload: RealtimeAnalyticsPayload) => void;
};

let emitter: RealtimeEmitter | null = null;

export function setRealtimeEmitter(next: RealtimeEmitter | null): void {
  emitter = next;
}

export function emitAnalyticsUpdate(payload: RealtimeAnalyticsPayload): void {
  emitter?.notifyAnalyticsUpdate(payload);
}
