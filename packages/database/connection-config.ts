/** Shared Postgres connection helpers for Render / managed hosts. */

import type { PoolConfig } from "pg";

export type PgSslConfig = false | true | { rejectUnauthorized: boolean };

export interface PostgresConnectionParams {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

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

export function isLocalDatabase(url: string): boolean {
  return /(?:localhost|127\.0\.0\.1)/i.test(url);
}

/** Render internal URLs use short private-network hostnames (e.g. dpg-abc123-a). */
export function isRenderInternalHost(host: string): boolean {
  return /^dpg-[a-z0-9]+-[a-z0-9]+$/i.test(host);
}

/** External Render URL hostnames embed the internal hostname as a prefix. */
export function getRenderInternalHostCandidate(host: string): string | null {
  const match = host.match(/^(dpg-[a-z0-9]+-[a-z0-9]+)\./i);
  if (!match?.[1] || isRenderInternalHost(host)) return null;
  return match[1];
}

export function needsTls(url: string): boolean {
  if (isLocalDatabase(url)) return false;
  const host = parsePostgresHost(url);
  if (isRenderInternalHost(host)) return false;
  return true;
}

export function resolvePgSsl(url: string): PgSslConfig {
  return needsTls(url) ? { rejectUnauthorized: false } : false;
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

  const internalHost = getRenderInternalHostCandidate(host);
  if (internalHost) {
    addAttempt(`internal host ${internalHost} (no ssl)`, {
      ...base,
      host: internalHost,
      ssl: false,
    });
  }

  if (isRenderInternalHost(host) || internalHost) {
    addAttempt(`host ${internalHost ?? host} (no ssl)`, {
      ...base,
      host: internalHost ?? host,
      ssl: false,
    });
  }

  if (needsTls(url)) {
    addAttempt(`host ${host} (ssl, discrete params)`, {
      ...base,
      host,
      ssl: { rejectUnauthorized: false },
    });
    addAttempt(`host ${host} (ssl: true)`, {
      ...base,
      host,
      ssl: true,
    });
  }

  if (attempts.length === 0) {
    addAttempt(`host ${host}`, {
      ...base,
      host,
      ssl: false,
    });
  }

  return attempts;
}

export function buildPgPoolConfig(url: string): PoolConfig {
  const attempts = buildPgConnectionAttempts(url);
  return attempts[0]?.config ?? {
    ...parsePostgresUrl(url),
    ssl: resolvePgSsl(url),
    connectionTimeoutMillis: 30_000,
    max: 2,
  };
}

export function describeSsl(ssl: PgSslConfig | undefined): string {
  if (ssl === false || ssl === undefined) return "disabled";
  if (ssl === true) return "enabled (ssl: true)";
  return "enabled (rejectUnauthorized: false)";
}
