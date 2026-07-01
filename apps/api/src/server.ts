import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";
import { serverRouter, createContext } from "@repo/trpc/server";
import { env } from "./env";
import {
  submitRateLimit,
  authRateLimit,
  publicApiRateLimit,
} from "./middlewares/rate-limit.middleware";

import { registerGoogleAuthRoutes } from "./routes/google-auth";
import { csrfMiddleware } from "./middlewares/csrf.middleware";
import { setRedisClient as setResponsesRedis } from "@repo/services/responses";
import { setRedisClient as setAnalyticsRedis } from "@repo/services/analytics";

export const app = express();

// ---------------------------------------------------------------------------
// Security headers — Helmet
// ---------------------------------------------------------------------------
app.use(
  helmet({
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],

    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://cdn.jsdelivr.net",
    ],

    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://cdn.jsdelivr.net",
    ],

    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'", "https:", "data:"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
},
    crossOriginEmbedderPolicy: false, // needed for Scalar API docs
  })
);

// CSRF protection (double-submit pattern)
app.use(csrfMiddleware);
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Wire Redis client to services (for fingerprint dedup + analytics cache)
// ---------------------------------------------------------------------------
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (REDIS_URL && REDIS_TOKEN) {
  // Create a minimal REST-based Redis adapter compatible with our service interfaces
  const redisAdapter = {
    async setnx(key: string, value: string): Promise<number> {
      const res = await fetch(`${REDIS_URL}/setnx/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      });
      const data = await res.json() as { result: number };
      return data.result ?? 0;
    },
    async expire(key: string, sec: number): Promise<void> {
      await fetch(`${REDIS_URL}/expire/${encodeURIComponent(key)}/${sec}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      });
    },
    async get(key: string): Promise<string | null> {
      const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      });
      const data = await res.json() as { result: string | null };
      return data.result ?? null;
    },
    async set(key: string, value: string, opts?: { ex?: number }): Promise<void> {
      const url = opts?.ex
        ? `${REDIS_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}/ex/${opts.ex}`
        : `${REDIS_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`;
      await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      });
    },
    async del(key: string): Promise<void> {
      await fetch(`${REDIS_URL}/del/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      });
    },
  };
  setResponsesRedis(redisAdapter);
  setAnalyticsRedis(redisAdapter);
  logger.info("Redis client wired to responses + analytics services");
} else {
  logger.info("Redis not configured — using in-memory fallbacks");
}

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
app.use(
  cors({
    origin:
      env.NODE_ENV === "prod"
        ? [env.APP_URL]
        : "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
app.get("/", (_req, res) => res.json({ message: "FormCraft API is running 🚀" }));

// ── Google OAuth (redirect-based, not tRPC) ──────────────────────────────
registerGoogleAuthRoutes(app);
app.get("/health", (_req, res) => res.json({ healthy: true, timestamp: new Date().toISOString() }));

// ---------------------------------------------------------------------------
// OpenAPI / Scalar docs
// ---------------------------------------------------------------------------
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "FormCraft API",
  version: "1.0.0",
  description: "Production-grade Form Builder SaaS API",
  baseUrl: env.BASE_URL.concat("/api"),
  tags: ["Auth", "Forms", "Responses", "Analytics", "Public", "Templates", "Themes"],
});

app.get("/openapi.json", (_req, res) => res.json(openApiDocument));

app.use(
  "/docs",
  apiReference({
    url: "/openapi.json",
    theme: "purple",
  })
);

logger.info(`Scalar docs: ${env.BASE_URL}/docs`);

// ---------------------------------------------------------------------------
// Rate limiting — applied before tRPC handlers
// ---------------------------------------------------------------------------
app.use("/api/responses.submit", submitRateLimit);
app.use("/trpc/responses.submit", submitRateLimit);

app.use("/api/auth.signIn", authRateLimit);
app.use("/api/auth.signUp", authRateLimit);
app.use("/trpc/auth.signIn", authRateLimit);
app.use("/trpc/auth.signUp", authRateLimit);

app.use("/api/public", publicApiRateLimit);

// ---------------------------------------------------------------------------
// tRPC — OpenAPI REST adapter
// ---------------------------------------------------------------------------
app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
    onError({ error, path }) {
      logger.error(`[tRPC-OpenAPI] ${path}`, { error: error.message });
    },
  })
);

// ---------------------------------------------------------------------------
// tRPC — native RPC adapter (for tRPC clients)
// ---------------------------------------------------------------------------
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
    onError({ error, path }) {
      logger.error(`[tRPC] ${path}`, { error: error.message });
    },
  })
);

export default app;
