import type { AnyRouter } from "@trpc/server";

type RouterDef = {
  procedures?: Record<string, unknown>;
  record?: Record<string, AnyRouter>;
};

export function countRouterProcedures(routerInstance: AnyRouter): number {
  const def = (routerInstance as { _def?: RouterDef })._def;
  if (!def) return 0;
  const own = Object.keys(def.procedures ?? {}).length;
  const nested = Object.values(def.record ?? {}).reduce(
    (sum, child) => sum + countRouterProcedures(child),
    0,
  );
  return own + nested;
}

export function listRouterNames(routerInstance: AnyRouter): string[] {
  const def = (routerInstance as { _def?: RouterDef })._def;
  return Object.keys(def?.record ?? {});
}

export const EXPECTED_ROUTERS = [
  "health",
  "auth",
  "forms",
  "responses",
  "analytics",
  "public",
  "templates",
  "themes",
  "admin",
] as const;

export const EXPECTED_TABLES = [
  "users",
  "sessions",
  "verification_tokens",
  "themes",
  "templates",
  "forms",
  "form_pages",
  "form_fields",
  "form_responses",
  "response_answers",
  "form_views",
  "analytics",
  "audit_logs",
  "email_preferences",
] as const;
