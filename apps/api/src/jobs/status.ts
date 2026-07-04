/** Shared runtime status for health / status endpoints and the scheduler */

export type JobName = "keepalive" | "digest" | "cleanup-drafts";

export type JobRunRecord = {
  name: JobName;
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  runCount: number;
  successCount: number;
};

const startedAt = new Date();

const jobs: Record<JobName, JobRunRecord> = {
  keepalive: {
    name: "keepalive",
    lastRunAt: null,
    lastSuccessAt: null,
    lastError: null,
    runCount: 0,
    successCount: 0,
  },
  digest: {
    name: "digest",
    lastRunAt: null,
    lastSuccessAt: null,
    lastError: null,
    runCount: 0,
    successCount: 0,
  },
  "cleanup-drafts": {
    name: "cleanup-drafts",
    lastRunAt: null,
    lastSuccessAt: null,
    lastError: null,
    runCount: 0,
    successCount: 0,
  },
};

let lastExternalPingAt: string | null = null;
let schedulerStarted = false;

export function markSchedulerStarted() {
  schedulerStarted = true;
}

export function markExternalPing() {
  lastExternalPingAt = new Date().toISOString();
}

export function recordJobStart(name: JobName) {
  jobs[name].lastRunAt = new Date().toISOString();
  jobs[name].runCount += 1;
}

export function recordJobSuccess(name: JobName) {
  jobs[name].lastSuccessAt = new Date().toISOString();
  jobs[name].lastError = null;
  jobs[name].successCount += 1;
}

export function recordJobError(name: JobName, error: string) {
  jobs[name].lastError = error;
}

export function getRuntimeStatus() {
  const now = Date.now();
  const uptimeSeconds = Math.floor((now - startedAt.getTime()) / 1000);
  const lastPingMs = lastExternalPingAt
    ? now - new Date(lastExternalPingAt).getTime()
    : null;
  const lastKeepaliveMs = jobs.keepalive.lastSuccessAt
    ? now - new Date(jobs.keepalive.lastSuccessAt).getTime()
    : null;

  // Consider "awake" if we had a successful keepalive or external ping in the last 20 minutes
  const AWAKE_WINDOW_MS = 20 * 60 * 1000;
  const recentlyPinged =
    (lastPingMs !== null && lastPingMs < AWAKE_WINDOW_MS) ||
    (lastKeepaliveMs !== null && lastKeepaliveMs < AWAKE_WINDOW_MS) ||
    uptimeSeconds < 60;

  return {
    status: "healthy" as const,
    neverSleeps: true,
    awake: recentlyPinged || schedulerStarted,
    message: "EdinForm API is online — keep-alive and scheduled jobs are active.",
    startedAt: startedAt.toISOString(),
    uptimeSeconds,
    uptimeHuman: formatUptime(uptimeSeconds),
    scheduler: {
      enabled: schedulerStarted,
      lastExternalPingAt,
    },
    jobs: Object.values(jobs),
    timestamp: new Date().toISOString(),
  };
}

function formatUptime(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
