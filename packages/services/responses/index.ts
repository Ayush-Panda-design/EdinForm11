import { eq, and, desc, sql, gte, lte, inArray } from "@repo/database";
import { computeFingerprint, checkFingerprintDuplicate, checkDuplicateSubmission } from "./duplicate-check";
import db, {
  formsTable,
  formFieldsTable,
  formResponsesTable,
  responseAnswersTable,
} from "@repo/database";
import type { SubmitResponseInput, ListResponsesInput } from "@repo/validators/responses";
import type { FormResponse, PaginatedResponses } from "@repo/types/responses";

// Injected Redis client (optional)
let redisClient: {
  setnx: (key: string, value: string) => Promise<number>;
  expire: (key: string, sec: number) => Promise<void>;
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, opts?: any) => Promise<void>;
  del: (key: string) => Promise<void>;
} | null = null;

export function setRedisClient(client: typeof redisClient) {
  redisClient = client;
}

// ---------------------------------------------------------------------------
// Redis distributed lock helper to prevent race conditions
// ---------------------------------------------------------------------------
async function acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
  if (!redisClient) return true; // No Redis: allow through (rely on DB unique constraint)
  try {
    const result = await redisClient.setnx(`lock:${key}`, "1");
    if (result === 1) {
      await redisClient.expire(`lock:${key}`, ttlSeconds);
      return true;
    }
    return false;
  } catch {
    return true; // Redis error: fall through to DB-level protection
  }
}

async function releaseLock(key: string): Promise<void> {
  if (!redisClient) return;
  try {
    await redisClient.del(`lock:${key}`);
  } catch {}
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapResponse(
  row: typeof formResponsesTable.$inferSelect,
  answers: typeof responseAnswersTable.$inferSelect[]
): FormResponse {
  return {
    id: row.id,
    formId: row.formId,
    status: row.status as FormResponse["status"],
    respondentEmail: row.respondentEmail ?? null,
    respondentName: row.respondentName ?? null,
    completionTimeSeconds: row.completionTimeSeconds ?? null,
    submittedAt: row.submittedAt ?? null,
    answers: answers.map((a) => ({
      id: a.id,
      responseId: a.responseId,
      fieldId: a.fieldId,
      value: a.value ?? null,
      valueArray: (a.valueArray as string[] | null) ?? null,
    })),
  };
}

// ---------------------------------------------------------------------------
// Retry helper for transient failures
// ---------------------------------------------------------------------------
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 200
): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (i < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class ResponsesService {
  /**
   * Submit a response to a form (public - no auth required)
   * Validates field requirements AND field existence server-side
   */
  async submitResponse(
    input: SubmitResponseInput,
    meta?: { ipAddress?: string; userAgent?: string; referrer?: string }
  ): Promise<{ responseId: string; successMessage: string }> {
    // Compute browser fingerprint
    const fingerprint = computeFingerprint({
      formId: input.formId,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    // Acquire distributed lock on fingerprint to prevent race conditions
    const lockKey = `submit:${fingerprint}`;
    const lockAcquired = await acquireLock(lockKey, 10);
    if (!lockAcquired) {
      throw new Error("SUBMISSION_IN_PROGRESS");
    }

    try {
      return await withRetry(async () => {
        // Fetch form to check visibility and settings
        const [form] = await db
          .select()
          .from(formsTable)
          .where(eq(formsTable.id, input.formId))
          .limit(1);

        if (!form) throw new Error("FORM_NOT_FOUND");
        if (form.visibility === "unpublished") throw new Error("FORM_NOT_ACCEPTING_RESPONSES");
        if (form.isArchived) throw new Error("FORM_NOT_ACCEPTING_RESPONSES");

        // Browser fingerprint deduplication (always applied)
        const fpCheck = await checkFingerprintDuplicate({
          formId: input.formId,
          fingerprint,
          redis: redisClient,
          ttlSeconds: 86400,
        });
        if (fpCheck.isDuplicate) {
          throw new Error(`DUPLICATE_SUBMISSION:${fpCheck.reason}`);
        }

        // Legacy duplicate check (when allowMultipleResponses = false)
        if (!form.allowMultipleResponses) {
          const dupCheck = await checkDuplicateSubmission({
            formId: input.formId,
            ipAddress: meta?.ipAddress,
            respondentEmail: input.respondentEmail,
            windowMinutes: 60 * 24,
          });
          if (dupCheck.isDuplicate) {
            throw new Error(`DUPLICATE_SUBMISSION:${dupCheck.reason}`);
          }
        }

        // Check max responses limit
        if (form.maxResponses) {
          const [countResult] = await db
            .select({ total: sql<number>`count(*)::int` })
            .from(formResponsesTable)
            .where(eq(formResponsesTable.formId, input.formId));

          if ((countResult?.total ?? 0) >= form.maxResponses) {
            throw new Error("FORM_RESPONSE_LIMIT_REACHED");
          }
        }

        // Check close date
        if (form.closeAfterDate && new Date() > form.closeAfterDate) {
          throw new Error("FORM_CLOSED");
        }

        // Fetch ALL fields for this form
        const fields = await db
          .select()
          .from(formFieldsTable)
          .where(eq(formFieldsTable.formId, input.formId));

        // FIELD EXISTENCE VALIDATION
        const validFieldIds = new Set(fields.map((f) => f.id));
        for (const answer of input.answers) {
          if (!validFieldIds.has(answer.fieldId)) {
            throw new Error(`INVALID_FIELD:${answer.fieldId}`);
          }
        }

        // FIELD TYPE VALIDATION
        const fieldMap = new Map(fields.map((f) => [f.id, f]));
        for (const answer of input.answers) {
          const field = fieldMap.get(answer.fieldId);
          if (!field) continue;

          if (field.type === "multi_select") {
            if (answer.value !== undefined && answer.valueArray === undefined) {
              throw new Error(`ANSWER_TYPE_MISMATCH:${answer.fieldId}:expected_array`);
            }
          }
          if (["short_text", "long_text", "email", "number", "date", "rating", "single_select", "checkbox"].includes(field.type)) {
            if (answer.valueArray !== undefined && answer.value === undefined) {
              throw new Error(`ANSWER_TYPE_MISMATCH:${answer.fieldId}:expected_value`);
            }
          }
        }

        // REQUIRED FIELD VALIDATION
        const requiredFields = fields.filter((f) => f.required);
        const answerMap = new Map(input.answers.map((a) => [a.fieldId, a]));

        for (const field of requiredFields) {
          const answer = answerMap.get(field.id);
          const hasValue =
            answer &&
            (
              (answer.value !== undefined && answer.value !== "") ||
              (answer.valueArray && answer.valueArray.length > 0)
            );
          if (!hasValue) {
            throw new Error(`REQUIRED_FIELD_MISSING:${field.id}`);
          }
        }

        // Insert response record
        const [response] = await db
          .insert(formResponsesTable)
          .values({
            formId: input.formId,
            respondentEmail: input.respondentEmail,
            respondentName: input.respondentName,
            completionTimeSeconds: input.completionTimeSeconds,
            ipAddress: meta?.ipAddress,
            userAgent: meta?.userAgent,
            referrer: meta?.referrer,
            browserFingerprint: fingerprint,
            status: "completed",
          })
          .returning();

        if (!response) throw new Error("FAILED_TO_CREATE_RESPONSE");

        // Insert answers
        const validAnswers = input.answers.filter((a) => validFieldIds.has(a.fieldId));
        if (validAnswers.length > 0) {
          await db.insert(responseAnswersTable).values(
            validAnswers.map((a) => ({
              responseId: response.id,
              fieldId: a.fieldId,
              formId: input.formId,
              value: a.value,
              valueArray: a.valueArray ?? undefined,
            }))
          );
        }

        return {
          responseId: response.id,
          successMessage: form.successMessage ?? "Thank you for your response!",
        };
      });
    } finally {
      await releaseLock(lockKey);
    }
  }

  /** List responses for a form (creator only) */
  async listResponses(
    input: ListResponsesInput,
    creatorId: string
  ): Promise<PaginatedResponses> {
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, input.formId),
          eq(formsTable.creatorId, creatorId)
        )
      )
      .limit(1);

    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    const conditions = [eq(formResponsesTable.formId, input.formId)];

    if (input.status) conditions.push(eq(formResponsesTable.status, input.status));
    if (input.from) conditions.push(gte(formResponsesTable.submittedAt, new Date(input.from)));
    if (input.to) conditions.push(lte(formResponsesTable.submittedAt, new Date(input.to)));
    if (input.search) {
      conditions.push(
        sql`(${formResponsesTable.respondentEmail} ILIKE ${`%${input.search}%`} OR ${formResponsesTable.respondentName} ILIKE ${`%${input.search}%`})`
      );
    }

    const offset = (input.page - 1) * input.limit;

    const [countResult] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(formResponsesTable)
      .where(and(...conditions));

    const responses = await db
      .select()
      .from(formResponsesTable)
      .where(and(...conditions))
      .orderBy(desc(formResponsesTable.submittedAt))
      .limit(input.limit)
      .offset(offset);

    const responseIds = responses.map((r) => r.id);
    let answers: typeof responseAnswersTable.$inferSelect[] = [];

    if (responseIds.length > 0) {
      answers = await db
        .select()
        .from(responseAnswersTable)
        .where(inArray(responseAnswersTable.responseId, responseIds));
    }

    const answersMap = new Map<string, typeof responseAnswersTable.$inferSelect[]>();
    for (const answer of answers) {
      const arr = answersMap.get(answer.responseId) ?? [];
      arr.push(answer);
      answersMap.set(answer.responseId, arr);
    }

    const total = countResult?.total ?? 0;
    return {
      data: responses.map((r) => mapResponse(r, answersMap.get(r.id) ?? [])),
      total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(total / input.limit),
    };
  }

  /** Get a single response by id (creator only) */
  async getResponseById(responseId: string, creatorId: string): Promise<FormResponse | null> {
    const [response] = await db
      .select({
        response: formResponsesTable,
        formCreatorId: formsTable.creatorId,
      })
      .from(formResponsesTable)
      .innerJoin(formsTable, eq(formResponsesTable.formId, formsTable.id))
      .where(eq(formResponsesTable.id, responseId))
      .limit(1);

    if (!response) return null;
    if (response.formCreatorId !== creatorId) throw new Error("UNAUTHORIZED");

    const answers = await db
      .select()
      .from(responseAnswersTable)
      .where(eq(responseAnswersTable.responseId, responseId));

    return mapResponse(response.response, answers);
  }

  /** Export responses as CSV string */
  async exportResponsesCsv(formId: string, creatorId: string): Promise<string> {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(sql`${formFieldsTable.order} asc`);

    const responses = await db
      .select()
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId))
      .orderBy(desc(formResponsesTable.submittedAt));

    const answers = await db
      .select()
      .from(responseAnswersTable)
      .where(eq(responseAnswersTable.formId, formId));

    const headers = [
      "Response ID", "Submitted At", "Respondent Name", "Respondent Email",
      "Completion Time (s)", "IP Address",
      ...fields.map((f) => f.label),
    ];

    const answersByResponse = new Map<string, Map<string, string>>();
    for (const ans of answers) {
      if (!answersByResponse.has(ans.responseId)) {
        answersByResponse.set(ans.responseId, new Map());
      }
      const value = ans.valueArray
        ? (ans.valueArray as string[]).join("; ")
        : (ans.value ?? "");
      answersByResponse.get(ans.responseId)!.set(ans.fieldId, value);
    }

    const rows = responses.map((r) => {
      const fieldAnswers = answersByResponse.get(r.id) ?? new Map();
      return [
        r.id,
        r.submittedAt?.toISOString() ?? "",
        r.respondentName ?? "",
        r.respondentEmail ?? "",
        r.completionTimeSeconds?.toString() ?? "",
        r.ipAddress ?? "",
        ...fields.map((f) => {
          const val = fieldAnswers.get(f.id) ?? "";
          return `"${val.replace(/"/g, '""')}"`;
        }),
      ].join(",");
    });

    return [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
  }

  /** Mark a response as spam */
  async markAsSpam(responseId: string, creatorId: string): Promise<void> {
    const [response] = await db
      .select({ formId: formResponsesTable.formId })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.id, responseId))
      .limit(1);

    if (!response) throw new Error("RESPONSE_NOT_FOUND");

    const [form] = await db
      .select({ creatorId: formsTable.creatorId })
      .from(formsTable)
      .where(eq(formsTable.id, response.formId))
      .limit(1);

    if (!form || form.creatorId !== creatorId) throw new Error("UNAUTHORIZED");

    await db
      .update(formResponsesTable)
      .set({ status: "spam" })
      .where(eq(formResponsesTable.id, responseId));
  }
}

export const responsesService = new ResponsesService();
