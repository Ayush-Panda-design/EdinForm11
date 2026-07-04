import type { Express, Request, Response, NextFunction } from "express";
import { logger } from "@repo/logger";
import { env } from "../env";
import { markExternalPing, getRuntimeStatus } from "../jobs/status";
import { runKeepAlive, runDailyDigests, runCleanupDrafts } from "../jobs/tasks";

function requireCronSecret(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.CRON_SECRET;
  // In development, allow without secret for local testing
  if (!secret && env.NODE_ENV !== "production") {
    return next();
  }
  const header = req.headers["authorization"];
  const token =
    (typeof header === "string" && header.startsWith("Bearer ")
      ? header.slice(7)
      : null) ?? (req.headers["x-cron-secret"] as string | undefined);

  if (!secret || token !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}

export function registerInternalCronRoutes(app: Express) {
  app.post("/internal/cron/:job", requireCronSecret, async (req, res) => {
    markExternalPing();
    const job = req.params.job;

    try {
      if (job === "keepalive" || job === "ping") {
        const result = await runKeepAlive(env.BASE_URL);
        return res.json({ ok: true, job: "keepalive", result });
      }
      if (job === "digest") {
        const result = await runDailyDigests();
        return res.json({ ok: true, job: "digest", result });
      }
      if (job === "cleanup-drafts" || job === "cleanup") {
        const result = await runCleanupDrafts();
        return res.json({ ok: true, job: "cleanup-drafts", result });
      }
      return res.status(404).json({ error: `Unknown job: ${job}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Internal cron job failed", { job, error: message });
      return res.status(500).json({ ok: false, job, error: message });
    }
  });

  // Lightweight wake endpoint used by external monitors
  app.get("/internal/wake", (req, res) => {
    markExternalPing();
    res.json({
      ok: true,
      awake: true,
      neverSleeps: true,
      message: "Backend is awake",
      timestamp: new Date().toISOString(),
      status: getRuntimeStatus(),
    });
  });
}
