import { logger } from "@repo/logger";
import db, {
  formsTable,
  formResponsesTable,
  usersTable,
  eq,
  and,
  gte,
  lt,
  sql,
  inArray,
} from "@repo/database";
import { emailService } from "@repo/services/email";
import {
  recordJobStart,
  recordJobSuccess,
  recordJobError,
  type JobName,
} from "./status";

async function runTracked(name: JobName, fn: () => Promise<unknown>) {
  recordJobStart(name);
  try {
    const result = await fn();
    recordJobSuccess(name);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    recordJobError(name, message);
    logger.error(`Job ${name} failed`, { error: message });
    throw err;
  }
}

/** Ping our own health endpoint so free-tier hosts (Render) stay warm */
export async function runKeepAlive(baseUrl: string) {
  return runTracked("keepalive", async () => {
    const url = `${baseUrl.replace(/\/$/, "")}/health`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "EdinForm-KeepAlive/1.0" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      throw new Error(`Keep-alive ping returned ${res.status}`);
    }
    logger.info("Keep-alive ping ok", { url, status: res.status });
    return { ok: true, status: res.status };
  });
}

/** Email daily digests to creators with digest-enabled forms */
export async function runDailyDigests() {
  return runTracked("digest", async () => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const digestForms = await db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        creatorId: formsTable.creatorId,
      })
      .from(formsTable)
      .where(eq(formsTable.digestEnabled, true));

    if (digestForms.length === 0) {
      logger.info("Digest job: no forms with digest enabled");
      return { sent: 0, totalResponses: 0 };
    }

    const byCreator = new Map<string, typeof digestForms>();
    for (const form of digestForms) {
      const list = byCreator.get(form.creatorId) ?? [];
      list.push(form);
      byCreator.set(form.creatorId, list);
    }

    let sent = 0;
    let totalResponses = 0;

    for (const [creatorId, forms] of byCreator) {
      const formIds = forms.map((f) => f.id);
      const counts = await db
        .select({
          formId: formResponsesTable.formId,
          count: sql<number>`count(*)::int`,
        })
        .from(formResponsesTable)
        .where(
          and(
            inArray(formResponsesTable.formId, formIds),
            eq(formResponsesTable.status, "completed"),
            gte(formResponsesTable.submittedAt, since),
          ),
        )
        .groupBy(formResponsesTable.formId);

      const countMap = new Map(counts.map((c) => [c.formId, c.count]));
      const breakdown = forms
        .map((f) => ({
          title: f.title,
          formId: f.id,
          count: countMap.get(f.id) ?? 0,
        }))
        .filter((f) => f.count > 0);

      const creatorTotal = breakdown.reduce((sum, f) => sum + f.count, 0);
      if (creatorTotal === 0) continue;

      const [creator] = await db
        .select({ email: usersTable.email, fullName: usersTable.fullName })
        .from(usersTable)
        .where(eq(usersTable.id, creatorId))
        .limit(1);

      if (!creator) continue;

      await emailService.sendDailyDigest({
        creatorEmail: creator.email,
        creatorName: creator.fullName,
        totalResponses: creatorTotal,
        forms: breakdown,
      });

      sent += 1;
      totalResponses += creatorTotal;
    }

    logger.info("Digest job complete", { sent, totalResponses });
    return { sent, totalResponses };
  });
}

/** Remove abandoned in-progress drafts older than 30 days */
export async function runCleanupDrafts() {
  return runTracked("cleanup-drafts", async () => {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deleted = await db
      .delete(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.status, "in_progress"),
          lt(formResponsesTable.submittedAt, cutoff),
        ),
      )
      .returning({ id: formResponsesTable.id });

    logger.info("Cleanup drafts complete", { removed: deleted.length });
    return { removed: deleted.length };
  });
}
