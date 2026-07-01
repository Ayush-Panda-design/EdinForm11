import type { Request, Response, NextFunction } from "express";

/**
 * CSRF Protection — double-submit token pattern.
 *
 * For state-changing requests (POST/PATCH/PUT/DELETE) on browser-based
 * routes, we require the client to send a custom header (X-CSRF-Token: 1)
 * or Origin matching our allowed APP_URL.
 *
 * This works because:
 *  - Simple browser form posts cannot set custom headers
 *  - Cross-origin XHR/fetch is blocked by CORS before reaching this
 *  - We skip this for GET/HEAD/OPTIONS (safe methods)
 *  - We skip for explicitly public endpoints (form submission by anonymous users)
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Paths that are intentionally public (no CSRF check needed)
const PUBLIC_PATHS = [
  "/api/auth.signUp",
  "/api/auth.signIn",
  "/trpc/auth.signUp",
  "/trpc/auth.signIn",
  "/api/responses.submit",
  "/trpc/responses.submit",
  "/api/public",
];

export function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip safe methods
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  // Skip public paths
  const path = req.path;
  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    next();
    return;
  }

  // Check for custom header (set by our tRPC client)
  const csrfHeader = req.headers["x-csrf-token"] ?? req.headers["x-trpc-source"];
  if (csrfHeader) {
    next();
    return;
  }

  // Check Origin header matches
  const origin = req.headers.origin;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (origin && origin === appUrl) {
    next();
    return;
  }

  // Check Referer as fallback
  const referer = req.headers.referer;
  if (referer && referer.startsWith(appUrl)) {
    next();
    return;
  }

  res.status(403).json({
    error: "CSRF_VALIDATION_FAILED",
    message: "CSRF validation failed. Ensure requests include the X-CSRF-Token header.",
  });
}
