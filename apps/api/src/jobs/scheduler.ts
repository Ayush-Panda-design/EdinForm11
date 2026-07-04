import { logger } from "@repo/logger";
import { markSchedulerStarted } from "./status";
import { runKeepAlive, runDailyDigests, runCleanupDrafts } from "./tasks";

const KEEP_ALIVE_MS = 10 * 60 * 1000; // every 10 minutes (Render free sleeps ~15m)
const CLEANUP_MS = 6 * 60 * 60 * 1000; // every 6 hours
const DIGEST_CHECK_MS = 30 * 60 * 1000; // check every 30 minutes

let lastDigestDay: string | null = null;
const timers: NodeJS.Timeout[] = [];

/**
 * In-process scheduler.
 * Keeps the API warm on free-tier hosts and runs maintenance jobs.
 * External GitHub Actions / Render Cron also hit /internal/cron/* as a backup.
 */
export function startScheduler(baseUrl: string) {
  markSchedulerStarted();
  logger.info("Background job scheduler started", {
    keepAliveEveryMinutes: KEEP_ALIVE_MS / 60_000,
    baseUrl,
  });

  // Initial keep-alive after boot (don't block startup)
  setTimeout(() => {
    void runKeepAlive(baseUrl).catch(() => {});
  }, 5_000);

  timers.push(
    setInterval(() => {
      void runKeepAlive(baseUrl).catch(() => {});
    }, KEEP_ALIVE_MS),
  );

  timers.push(
    setInterval(() => {
      void runCleanupDrafts().catch(() => {});
    }, CLEANUP_MS),
  );

  // Daily digest around 09:00 UTC (once per calendar day)
  timers.push(
    setInterval(() => {
      const now = new Date();
      const dayKey = now.toISOString().slice(0, 10);
      if (now.getUTCHours() === 9 && lastDigestDay !== dayKey) {
        lastDigestDay = dayKey;
        void runDailyDigests().catch(() => {});
      }
    }, DIGEST_CHECK_MS),
  );

  // Run cleanup once shortly after boot
  setTimeout(() => {
    void runCleanupDrafts().catch(() => {});
  }, 30_000);
}

export function stopScheduler() {
  for (const t of timers) clearInterval(t);
  timers.length = 0;
}
