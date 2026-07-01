import type { Request, Response, NextFunction } from "express";
import { checkRateLimit } from "../lib/redis";

interface RateLimitOptions {
  /** Max requests per window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Custom key extractor. Defaults to IP address */
  keyFn?: (req: Request) => string;
  /** Custom error message */
  message?: string;
}

/**
 * Express rate-limiting middleware backed by Upstash Redis (or in-memory fallback).
 *
 * Usage:
 *   app.use('/api/responses/submit', rateLimitMiddleware({ limit: 10, windowMs: 60_000 }))
 */
export function rateLimitMiddleware(opts: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.socket.remoteAddress ??
      "unknown";

    const key = opts.keyFn ? opts.keyFn(req) : `rl:${req.path}:${ip}`;
    const result = await checkRateLimit(key, opts.limit, opts.windowMs);

    res.setHeader("X-RateLimit-Limit", opts.limit);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", result.resetAt);

    if (!result.allowed) {
      res.status(429).json({
        error: "TOO_MANY_REQUESTS",
        message: opts.message ?? "Too many requests. Please try again later.",
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      });
      return;
    }

    next();
  };
}

// Pre-configured limiters for common routes
export const submitRateLimit = rateLimitMiddleware({
  limit: 20,
  windowMs: 60 * 1000, // 20 submissions per minute per IP
  message: "Too many form submissions. Please slow down.",
});

export const authRateLimit = rateLimitMiddleware({
  limit: 10,
  windowMs: 15 * 60 * 1000, // 10 auth attempts per 15 minutes per IP
  message: "Too many authentication attempts. Please try again later.",
});

export const publicApiRateLimit = rateLimitMiddleware({
  limit: 120,
  windowMs: 60 * 1000, // 120 req/min for public API
});
