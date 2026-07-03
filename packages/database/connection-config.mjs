/** Shared Postgres connection helpers for Render / managed hosts. */

/** Strip sslmode from URL — pg v8 treats require as verify-full and drops some connections. */
export function normalizeDatabaseUrl(url) {
  let normalized = url.replace(/([?&])sslmode=[^&]*/gi, "$1");
  normalized = normalized.replace(/[?&]$/, "");
  normalized = normalized.replace(/\?&/, "?");
  return normalized;
}

export function parsePostgresHost(url) {
  try {
    const parsed = new URL(url.replace(/^postgres(ql)?:/, "https:"));
    return parsed.hostname;
  } catch {
    const match = url.match(/@([^/:?]+)/);
    return match?.[1] ?? "unknown";
  }
}

export function isLocalDatabase(url) {
  return /(?:localhost|127\.0\.0\.1)/i.test(url);
}

/** Render internal URLs use short private-network hostnames (e.g. dpg-abc123-a). */
export function isRenderInternalHost(host) {
  return /^dpg-[a-z0-9]+-[a-z0-9]+$/i.test(host);
}

export function resolvePgSsl(url, rawUrl = url) {
  if (isLocalDatabase(url)) return false;

  const host = parsePostgresHost(url);

  // Render private network — TLS is not used and client-side SSL breaks the handshake.
  if (isRenderInternalHost(host)) return false;

  if (
    rawUrl.includes("sslmode=") ||
    host.includes("render.com") ||
    host.includes("neon.tech") ||
    host.includes("supabase.co")
  ) {
    return { rejectUnauthorized: false };
  }

  // Hostnames without a domain are typically private-network DB endpoints.
  if (!host.includes(".")) return false;

  return { rejectUnauthorized: false };
}

export function getSslCandidates(url, rawUrl = url) {
  const primary = resolvePgSsl(url, rawUrl);
  const candidates = [primary, primary === false ? { rejectUnauthorized: false } : false];
  const seen = new Set();

  return candidates.filter((ssl) => {
    const key = JSON.stringify(ssl);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function describeSsl(ssl) {
  return ssl === false ? "disabled" : "enabled (rejectUnauthorized: false)";
}
