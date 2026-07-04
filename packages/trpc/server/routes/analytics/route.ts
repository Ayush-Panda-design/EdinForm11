import { z } from "zod";
import { router, protectedProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { analyticsService } from "@repo/services/analytics";
import { analyticsQuerySchema } from "@repo/validators/analytics";
import { emailService } from "@repo/services/email";
import db, { formsTable, formResponsesTable, usersTable, eq, and, gte, sql } from "@repo/database";

const TAGS = ["Analytics"];
const getPath = generatePath("/analytics");

const dailyDataOutput = z.object({
  date: z.string(),
  views: z.number(),
  submissions: z.number(),
  uniqueVisitors: z.number(),
  conversionRate: z.number(),
  avgCompletionSeconds: z.number().nullable(),
});

const hourlyVelocityOutput = z.object({
  hour: z.string(),
  count: z.number(),
});

const dropoffFunnelOutput = z.object({
  fieldId: z.string(),
  label: z.string(),
  answeredCount: z.number(),
  dropoffRate: z.number(),
});

export const analyticsRouter = router({
  /** GET /analytics/form — get analytics for a specific form */
  getFormAnalytics: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/form"), tags: TAGS } })
    .input(analyticsQuerySchema)
    .output(z.object({
      formId: z.string(),
      totalViews: z.number(),
      totalSubmissions: z.number(),
      conversionRate: z.number(),
      avgCompletionSeconds: z.number().nullable(),
      dailyData: z.array(dailyDataOutput),
      hourlyVelocity: z.array(hourlyVelocityOutput),
      dropoffFunnel: z.array(dropoffFunnelOutput),
      healthScore: z.number().min(0).max(100),
      uniqueResponseRatio: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      return analyticsService.getFormAnalytics(input, ctx.user!.id);
    }),

  /** GET /analytics/dashboard — creator-wide overview */
  dashboard: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/dashboard"), tags: TAGS } })
    .input(z.undefined())
    .output(z.object({
      totalForms: z.number(),
      totalResponses: z.number(),
      totalViews: z.number(),
      avgConversionRate: z.number(),
      dailyTrend: z.array(z.object({
        date: z.string(),
        views: z.number(),
        submissions: z.number(),
      })),
      formBreakdown: z.array(z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
        views: z.number(),
        responses: z.number(),
        conversionRate: z.number(),
      })),
    }))
    .query(async ({ ctx }) => {
      return analyticsService.getCreatorDashboard(ctx.user!.id);
    }),

  /** GET /analytics/recent-submissions — live feed of latest submissions across all forms */
  recentSubmissions: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/recent-submissions"), tags: TAGS } })
    .input(z.object({ limit: z.number().int().min(1).max(50).optional() }))
    .output(z.array(z.object({
      responseId: z.string(),
      formId: z.string(),
      formTitle: z.string(),
      respondentEmail: z.string().nullable(),
      respondentName: z.string().nullable(),
      submittedAt: z.string(),
    })))
    .query(async ({ input, ctx }) => {
      return analyticsService.getRecentSubmissions(ctx.user!.id, input.limit ?? 20);
    }),

  /** GET /analytics/field-summary — per-field answer distributions */
  getFieldAnalytics: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/field-summary"), tags: TAGS } })
    .input(analyticsQuerySchema)
    .output(
      z.array(
        z.object({
          fieldId: z.string(),
          label: z.string(),
          type: z.string(),
          totalAnswers: z.number(),
          skipRate: z.number(),
          optionCounts: z
            .array(
              z.object({
                value: z.string(),
                label: z.string(),
                count: z.number(),
                percentage: z.number(),
              })
            )
            .optional(),
          numericStats: z
            .object({ avg: z.number(), min: z.number(), max: z.number() })
            .optional(),
          ratingDistribution: z
            .array(z.object({ rating: z.number(), count: z.number() }))
            .optional(),
          avgRating: z.number().optional(),
        })
      )
    )
    .query(async ({ input, ctx }) => {
      return analyticsService.getFieldAnalytics(
        input.formId,
        ctx.user!.id,
        input.from ? new Date(input.from) : undefined,
        input.to ? new Date(input.to) : undefined
      );
    }),

  /** POST /analytics/send-digest — email today's response summary */
  sendDailyDigest: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/send-digest"), tags: TAGS } })
    .input(z.object({}).optional())
    .output(z.object({ sent: z.boolean(), totalResponses: z.number() }))
    .mutation(async ({ ctx }) => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const forms = await db
        .select({
          id: formsTable.id,
          title: formsTable.title,
          digestEnabled: formsTable.digestEnabled,
        })
        .from(formsTable)
        .where(
          and(eq(formsTable.creatorId, ctx.user.id), eq(formsTable.digestEnabled, true)),
        );

      const breakdown: Array<{ title: string; count: number; formId: string }> = [];
      let totalResponses = 0;

      for (const form of forms) {
        const [row] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(formResponsesTable)
          .where(
            and(
              eq(formResponsesTable.formId, form.id),
              eq(formResponsesTable.status, "completed"),
              gte(formResponsesTable.submittedAt, since),
            ),
          );
        const count = row?.count ?? 0;
        if (count > 0) {
          breakdown.push({ title: form.title, count, formId: form.id });
          totalResponses += count;
        }
      }

      if (totalResponses === 0) {
        return { sent: false, totalResponses: 0 };
      }

      const [creator] = await db
        .select({ email: usersTable.email, fullName: usersTable.fullName })
        .from(usersTable)
        .where(eq(usersTable.id, ctx.user.id))
        .limit(1);

      if (!creator) return { sent: false, totalResponses };

      await emailService.sendDailyDigest({
        creatorEmail: creator.email,
        creatorName: creator.fullName,
        totalResponses,
        forms: breakdown,
      });

      return { sent: true, totalResponses };
    }),
});
