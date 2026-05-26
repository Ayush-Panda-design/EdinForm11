import type { Request, Response, NextFunction } from "express";
import { logger } from "@repo/logger";

/**
 * HTTP request logging middleware.
 * Logs method, path, status code, and latency for every request.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startMs = Date.now();
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    "unknown";

  res.on("finish", () => {
    const durationMs = Date.now() - startMs;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    logger[level](`${req.method} ${req.path} ${res.statusCode} ${durationMs}ms`, {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs,
      ip,
      userAgent: req.headers["user-agent"],
    });
  });

  next();
}
