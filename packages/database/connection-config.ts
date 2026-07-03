/** Shared Postgres connection helpers for Render / managed hosts. */

import dns from "node:dns";
import type { PoolConfig } from "pg";

export type PgSslConfig =
  | false
  | true
  | { rejectUnauthorized: boolean; checkServerIdentity?: () => undefined };

export interface PostgresConnectionParams {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const RENDER_DB_REGIONS = [
  "virginia",
  "oregon",
  "ohio",
  "frankfurt",
  "singapore",
] as const;

export const RENDER_EXTERNAL_SSL: PgSslConfig = {
  rejectUnauthorized: false,
  checkServerIdentity: () => undefined,
};

/** Strip sslmode from URL — pg v8 treats require as verify-full when parsed from connection strings. */
export function stripSslModeFromUrl(url: string): string {
  let normalized = url.replace(/([?&])sslmode=[^&]*/gi, "$1");
  normalized = normalized.replace(/([?&])uselibpqcompat=[^&]*/gi, "$1");
  normalized = normalized.replace(/[?&]$/, "");
  normalized = normalized.replace(/\?&/, "?");
  return normalized;
}

export function normalizeDatabaseUrl(url: string): string {
  return stripSslModeFromUrl(url);
}

export function parsePostgresHost(url: string): string {
  try {
    const parsed = new URL(url.replace(/^postgres(ql)?:/, "https:"));
    return parsed.hostname;
  } catch {
    const match = url.match(/@([^/:?]+)/);
    return match?.[1] ?? "unknown";
  }
}

export function parsePostgresUrl(url: string): PostgresConnectionParams {
  const parsed = new URL(url.replace(/^postgres(ql)?:/, "https:"));
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, "") || "postgres");

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
  };
}

export function buildPostgresUrl(params: PostgresConnectionParams): string {
  return `postgresql://${encodeURIComponent(params.user)}:${encodeURIComponent(params.password)}@${params.host}:${params.port}/${encodeURIComponent(params.database)}`;
}

export function buildRenderExternalUrl(internalUrl: string, region: string): string {
  const params = parsePostgresUrl(internalUrl);
  if (!isRenderInternalHost(params.host)) return internalUrl;
  return buildPostgresUrl({
    ...params,
    host: `${params.host}.${region}-postgres.render.com`,
  });
}

export function isLocalDatabase(url: string): boolean {
  return /(?:localhost|127\.0\.0\.1)/i.test(url);
}

/** Render internal URLs use short private-network hostnames (e.g. dpg-abc123-a). */
export function isRenderInternalHost(host: string): boolean {
  return /^dpg-[a-z0-9]+-[a-z0-9]+$/i.test(host);
}

export function isRenderExternalHost(host: string): boolean {
  return host.includes("render.com");
}

export function hostResolves(hostname: string): boolean {
  try {
    (dns as typeof dns & { lookupSync(host: string): void }).lookupSync(hostname);
    return true;
  } catch {
    return false;
  }
}

/** URLs to try in order — internal first, then explicit external, then derived Render external hosts. */
export function getDatabaseUrlCandidates(rawUrl?: string): string[] {
  const primary = normalizeDatabaseUrl(rawUrl ?? process.env.DATABASE_URL ?? "");
  if (!primary) return [];

  const candidates: string[] = [];
  const seen = new Set<string>();

  const add = (url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    candidates.push(url);
  };

  add(primary);

  const external = process.env.DATABASE_URL_EXTERNAL;
  if (external) add(normalizeDatabaseUrl(external));

  const host = parsePostgresHost(primary);
  if (isRenderInternalHost(host)) {
    const regions = process.env.RENDER_DB_REGION
      ? [process.env.RENDER_DB_REGION]
      : RENDER_DB_REGIONS;
    for (const region of regions) {
      add(buildRenderExternalUrl(primary, region));
    }
  }

  // On Render, prefer resolvable external hostnames over internal private-network names.
  if (process.env.RENDER) {
    return candidates.sort((a, b) => {
      const aInternal = isRenderInternalHost(parsePostgresHost(a));
      const bInternal = isRenderInternalHost(parsePostgresHost(b));
      if (aInternal === bInternal) return 0;
      return aInternal ? 1 : -1;
    });
  }

  return candidates;
}

/**
 * Pick the first DATABASE_URL candidate whose hostname resolves.
 * Fixes Render ENOTFOUND when API and Postgres are in different regions
 * (internal hostname only works on the private network in the same region).
 */
export function resolveEffectiveDatabaseUrl(rawUrl?: string): string {
  const candidates = getDatabaseUrlCandidates(rawUrl);
  if (candidates.length === 0) {
    throw new Error("DATABASE_URL is not set");
  }

  const primaryHost = parsePostgresHost(candidates[0]!);

  for (const url of candidates) {
    const host = parsePostgresHost(url);
    if (!hostResolves(host)) continue;

    if (url !== candidates[0]) {
      console.warn(
        `[database] "${primaryHost}" did not resolve; using "${host}" instead. ` +
          "For a stable setup on Render, set DATABASE_URL to the External Database URL " +
          "or deploy API and Postgres in the same region."
      );
    }

    return url;
  }

  throw new Error(
    `[database] Could not resolve any database hostname (${candidates.map(parsePostgresHost).join(", ")}). ` +
      "On Render: copy the current External Database URL into DATABASE_URL, " +
      "or ensure the API service and Postgres are in the same region."
  );
}

export function needsTls(url: string): boolean {
  if (isLocalDatabase(url)) return false;
  const host = parsePostgresHost(url);
  if (isRenderInternalHost(host)) return false;
  return true;
}

export function resolvePgSsl(url: string): PgSslConfig {
  return needsTls(url) ? RENDER_EXTERNAL_SSL : false;
}

export function buildLibpqCompatConnectionString(url: string): string {
  const base = stripSslModeFromUrl(url);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}uselibpqcompat=true&sslmode=require`;
}

export interface PgConnectionAttempt {
  label: string;
  config: PoolConfig;
}

export function buildPgConnectionAttempts(url: string): PgConnectionAttempt[] {
  const params = parsePostgresUrl(url);
  const host = params.host;
  const attempts: PgConnectionAttempt[] = [];
  const seen = new Set<string>();

  const addAttempt = (label: string, config: PoolConfig) => {
    const key = JSON.stringify({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      connectionString: config.connectionString ?? null,
      ssl: config.ssl ?? false,
    });
    if (seen.has(key)) return;
    seen.add(key);
    attempts.push({ label, config });
  };

  const base = {
    port: params.port,
    user: params.user,
    password: params.password,
    database: params.database,
    connectionTimeoutMillis: 30_000,
    max: 2,
  };

  if (isRenderInternalHost(host) || !needsTls(url)) {
    addAttempt(`host ${host} (no ssl)`, {
      ...base,
      host,
      ssl: false,
    });
    return attempts;
  }

  addAttempt(`host ${host} (connectionString + libpq compat)`, {
    connectionString: buildLibpqCompatConnectionString(url),
    ssl: RENDER_EXTERNAL_SSL,
    connectionTimeoutMillis: 30_000,
    max: 10,
  });

  addAttempt(`host ${host} (ssl, discrete params)`, {
    ...base,
    host,
    ssl: RENDER_EXTERNAL_SSL,
  });

  addAttempt(`host ${host} (ssl: true)`, {
    ...base,
    host,
    ssl: true,
  });

  return attempts;
}

export function buildPgPoolConfig(url?: string): PoolConfig {
  const databaseUrl = url ?? resolveEffectiveDatabaseUrl();
  const attempts = buildPgConnectionAttempts(databaseUrl);
  return (
    attempts[0]?.config ?? {
      ...parsePostgresUrl(databaseUrl),
      ssl: resolvePgSsl(databaseUrl),
      connectionTimeoutMillis: 30_000,
      max: 2,
    }
  );
}

export function describeSsl(ssl: PgSslConfig | undefined): string {
  if (ssl === false || ssl === undefined) return "disabled";
  if (ssl === true) return "enabled (ssl: true)";
  return "enabled (rejectUnauthorized: false)";
}

export function getRenderDatabaseSetupHint(url: string): string | null {
  const host = parsePostgresHost(url);
  if (!isRenderInternalHost(host) && !isRenderExternalHost(host)) return null;

  return [
    "Render database checklist:",
    "1. Confirm Postgres is running (not suspended/expired) in the Render dashboard.",
    "2. API and Postgres must be in the same region to use the Internal URL.",
    "3. If regions differ, set DATABASE_URL to the External Database URL.",
    "4. Optional: set DATABASE_URL_EXTERNAL as a fallback when using the Internal URL.",
    "5. Run db:migrate in Pre-Deploy, not Build.",
  ].join("\n");
}
