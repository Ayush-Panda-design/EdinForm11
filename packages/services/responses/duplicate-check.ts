import { createHash } from "crypto";
import { eq, and, gte } from "@repo/database";
import db, { formResponsesTable } from "@repo/database";

/**
 * Compute browser fingerprint as SHA-256 of "formId:ip:userAgent"
 */
export function computeFingerprint(opts: {
  formId: string;
  ipAddress?: string;
  userAgent?: string;
}): string {
  return createHash("sha256")
    .update(`${opts.formId}:${opts.ipAddress ?? ""}:${opts.userAgent ?? ""}`)
    .digest("hex");
}

/**
 * Redis-based fingerprint deduplication: SET NX with TTL.
 * Falls back to DB-based check if Redis is unavailable.
 */
export async function checkFingerprintDuplicate(opts: {
  formId: string;
  fingerprint: string;
  redis?: { setnx: (key: string, value: string) => Promise<number>; expire: (key: string, sec: number) => Promise<void> } | null;
  ttlSeconds?: number;
}): Promise<{ isDuplicate: boolean; reason?: string }> {
  const ttl = opts.ttlSeconds ?? 86400; // 24h default

  if (opts.redis) {
    try {
      const key = `fp:${opts.formId}:${opts.fingerprint}`;
      const set = await opts.redis.setnx(key, "1");
      if (set === 0) {
        return { isDuplicate: true, reason: "FINGERPRINT_ALREADY_SUBMITTED" };
      }
      await opts.redis.expire(key, ttl);
      return { isDuplicate: false };
    } catch {
      // Fall through to DB check
    }
  }

  // DB-based check (partial unique index will also catch this at INSERT level)
  const since = new Date(Date.now() - ttl * 1000);
  const [row] = await db
    .select({ id: formResponsesTable.id })
    .from(formResponsesTable)
    .where(
      and(
        eq(formResponsesTable.formId, opts.formId),
        eq(formResponsesTable.browserFingerprint, opts.fingerprint),
        gte(formResponsesTable.submittedAt, since),
        eq(formResponsesTable.status, "completed")
      )
    )
    .limit(1);

  if (row) {
    return { isDuplicate: true, reason: "FINGERPRINT_ALREADY_SUBMITTED" };
  }

  return { isDuplicate: false };
}

/**
 * Legacy IP/email based duplicate check (kept for non-fingerprint cases)
 */
export async function checkDuplicateSubmission(opts: {
  formId: string;
  ipAddress?: string;
  respondentEmail?: string;
  windowMinutes?: number;
}): Promise<{ isDuplicate: boolean; reason?: string }> {
  const windowMs = (opts.windowMinutes ?? 60) * 60 * 1000;
  const since = new Date(Date.now() - windowMs);

  if (opts.ipAddress) {
    const [ipRow] = await db
      .select({ id: formResponsesTable.id })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, opts.formId),
          eq(formResponsesTable.ipAddress, opts.ipAddress),
          gte(formResponsesTable.submittedAt, since),
          eq(formResponsesTable.status, "completed")
        )
      )
      .limit(1);

    if (ipRow) return { isDuplicate: true, reason: "IP_ALREADY_SUBMITTED" };
  }

  if (opts.respondentEmail) {
    const [emailRow] = await db
      .select({ id: formResponsesTable.id })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, opts.formId),
          eq(formResponsesTable.respondentEmail, opts.respondentEmail),
          gte(formResponsesTable.submittedAt, since),
          eq(formResponsesTable.status, "completed")
        )
      )
      .limit(1);

    if (emailRow) return { isDuplicate: true, reason: "EMAIL_ALREADY_SUBMITTED" };
  }

  return { isDuplicate: false };
}
