import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { responsesService } from "@repo/services/responses";
import { analyticsService } from "@repo/services/analytics";
import { emailService } from "@repo/services/email";
import { submitResponseSchema, listResponsesSchema } from "@repo/validators/responses";
import db, { formsTable, usersTable } from "@repo/database";
import { eq, and } from "@repo/database";

const TAGS = ["Responses"];
const getPath = generatePath("/responses");

const answerOutput = z.object({
  id: z.string(),
  responseId: z.string(),
  fieldId: z.string(),
  value: z.string().nullable(),
  valueArray: z.array(z.string()).nullable(),
});

const responseOutput = z.object({
  id: z.string(),
  formId: z.string(),
  status: z.string(),
  respondentEmail: z.string().nullable(),
  respondentName: z.string().nullable(),
  completionTimeSeconds: z.number().nullable(),
  submittedAt: z.date().nullable(),
  answers: z.array(answerOutput),
});

export const responsesRouter = router({
  /** POST /responses/submit — public, no auth needed */
  submit: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/submit"), tags: TAGS } })
    .input(submitResponseSchema)
    .output(z.object({ responseId: z.string(), successMessage: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const ipAddress =
        (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
        ctx.req.socket.remoteAddress;
      const userAgent = ctx.req.headers["user-agent"];
      const referrer = ctx.req.headers.referer;

      try {
        const result = await responsesService.submitResponse(input, {
          ipAddress,
          userAgent,
          referrer,
        });

        Promise.all([
          analyticsService.upsertDailyAnalytics(input.formId),
          notifyCreatorIfEnabled(input.formId, result.responseId, input.respondentEmail),
          sendConfirmationIfEnabled(input.formId, input.respondentEmail, input.respondentName),
        ]).catch(() => {});

        return result;
      } catch (err) {
        const msg = (err as Error).message;
        if (msg === "FORM_NOT_FOUND") throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
        if (msg === "FORM_NOT_ACCEPTING_RESPONSES") throw new TRPCError({ code: "FORBIDDEN", message: "This form is not accepting responses." });
        if (msg === "FORM_RESPONSE_LIMIT_REACHED") throw new TRPCError({ code: "FORBIDDEN", message: "This form has reached its response limit." });
        if (msg === "FORM_CLOSED") throw new TRPCError({ code: "FORBIDDEN", message: "This form is closed." });
        if (msg.startsWith("REQUIRED_FIELD_MISSING:")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Required field missing: ${msg.split(":")[1]}` });
        }
        if (msg.startsWith("INVALID_FIELD:")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Answer references an invalid field: ${msg.split(":")[1]}` });
        }
        if (msg.startsWith("ANSWER_TYPE_MISMATCH:")) {
          const parts = msg.split(":");
          throw new TRPCError({ code: "BAD_REQUEST", message: `Answer type mismatch for field ${parts[1]}: ${parts[2]}` });
        }
        if (msg.startsWith("DUPLICATE_SUBMISSION:")) {
          throw new TRPCError({ code: "CONFLICT", message: "You have already submitted a response to this form." });
        }
        if (msg === "SUBMISSION_IN_PROGRESS") {
          throw new TRPCError({ code: "CONFLICT", message: "A submission is already being processed. Please wait a moment and try again." });
        }
        throw err;
      }
    }),

  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/"), tags: TAGS } })
    .input(listResponsesSchema)
    .output(z.object({
      data: z.array(responseOutput),
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      return responsesService.listResponses(input, ctx.user.id);
    }),

  getById: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{id}"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(responseOutput)
    .query(async ({ input, ctx }) => {
      const response = await responsesService.getResponseById(input.id, ctx.user.id);
      if (!response) throw new TRPCError({ code: "NOT_FOUND", message: "Response not found." });
      return response;
    }),

  markAsSpam: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/mark-spam"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await responsesService.markAsSpam(input.id, ctx.user.id);
      return { success: true };
    }),

  exportCsv: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/export/csv"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.object({ csv: z.string(), filename: z.string() }))
    .query(async ({ input, ctx }) => {
      const csv = await responsesService.exportResponsesCsv(input.formId, ctx.user.id);
      return { csv, filename: `responses-${input.formId}.csv` };
    }),
});

async function notifyCreatorIfEnabled(
  formId: string,
  responseId: string,
  respondentEmail?: string
): Promise<void> {
  const [row] = await db
    .select({
      notifyCreator: formsTable.notifyCreatorOnSubmission,
      title: formsTable.title,
      creatorId: formsTable.creatorId,
    })
    .from(formsTable)
    .where(eq(formsTable.id, formId))
    .limit(1);

  if (!row?.notifyCreator) return;

  const [creator] = await db
    .select({ email: usersTable.email, fullName: usersTable.fullName })
    .from(usersTable)
    .where(eq(usersTable.id, row.creatorId))
    .limit(1);

  if (!creator) return;

  await emailService.sendNewResponseNotification({
    creatorEmail: creator.email,
    creatorName: creator.fullName,
    formTitle: row.title,
    formId,
    responseId,
    respondentEmail,
  });
}

async function sendConfirmationIfEnabled(
  formId: string,
  respondentEmail?: string,
  respondentName?: string
): Promise<void> {
  if (!respondentEmail) return;

  const [form] = await db
    .select({
      sendConfirmation: formsTable.sendConfirmationEmail,
      title: formsTable.title,
      successMessage: formsTable.successMessage,
    })
    .from(formsTable)
    .where(eq(formsTable.id, formId))
    .limit(1);

  if (!form?.sendConfirmation) return;

  await emailService.sendResponseConfirmation({
    to: respondentEmail,
    respondentName,
    formTitle: form.title,
    customMessage: form.successMessage ?? undefined,
  });
}
