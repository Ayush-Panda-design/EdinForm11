import { eq, and, gte, lte, sql, desc, inArray } from "@repo/database";
import db, {
  formsTable,
  formViewsTable,
  formResponsesTable,
  analyticsTable,
  formFieldsTable,
  responseAnswersTable,
} from "@repo/database";
import type { AnalyticsQueryInput } from "@repo/validators/analytics";
import type { FormAnalyticsSummary, DailyAnalytics, FieldSummaryStatistics } from "@repo/types/analytics";

// Redis cache helper (graceful fallback)
let redisClient: { get: (k: string) => Promise<string | null>; set: (k: string, v: string, opts?: any) => Promise<void>; del: (k: string) => Promise<void> } | null = null;

export function setRedisClient(client: typeof redisClient) {
  redisClient = client;
}

export class AnalyticsService {
  /**
   * Get analytics summary for a form — FIXED: Bypassed Redis cache to ensure absolute real-time live updates
   */
  async getFormAnalytics(
    input: AnalyticsQueryInput,
    creatorId: string
  ): Promise<FormAnalyticsSummary & {
    hourlyVelocity: Array<{ hour: string; count: number }>;
    dropoffFunnel: Array<{ fieldId: string; label: string; answeredCount: number; dropoffRate: number }>;
    fieldSummaries: FieldSummaryStatistics[];
    healthScore: number;
    uniqueResponseRatio: number;
  }> {
    // Verify ownership
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

    const fromDate = input.from ? new Date(input.from) : this.defaultFromDate();
    const toDate = input.to ? new Date(input.to) : new Date();

    // Fetch in real-time directly from Postgres to guarantee instant, real-time live data
    // Total views in range
    const [viewsResult] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(formViewsTable)
      .where(
        and(
          eq(formViewsTable.formId, input.formId),
          gte(formViewsTable.viewedAt, fromDate),
          lte(formViewsTable.viewedAt, toDate)
        )
      );

    // Total submissions in range
    const [subResult] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, input.formId),
          gte(formResponsesTable.submittedAt, fromDate),
          lte(formResponsesTable.submittedAt, toDate),
          eq(formResponsesTable.status, "completed")
        )
      );

    // Unique IP count (for unique ratio)
    const [uniqueResult] = await db
      .select({ total: sql<number>`count(distinct ${formResponsesTable.ipAddress})::int` })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, input.formId),
          gte(formResponsesTable.submittedAt, fromDate),
          lte(formResponsesTable.submittedAt, toDate),
          eq(formResponsesTable.status, "completed")
        )
      );

    // Avg completion time
    const [avgResult] = await db
      .select({
        avg: sql<number>`avg(${formResponsesTable.completionTimeSeconds})::int`,
      })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, input.formId),
          gte(formResponsesTable.submittedAt, fromDate),
          lte(formResponsesTable.submittedAt, toDate)
        )
      );

    const totalViews = viewsResult?.total ?? 0;
    const totalSubmissions = subResult?.total ?? 0;
    const uniqueResponseCount = uniqueResult?.total ?? 0;
    const uniqueResponseRatio = totalSubmissions > 0
      ? Math.round((uniqueResponseCount / totalSubmissions) * 1000) / 10
      : 0;

    const conversionRate =
      totalViews > 0
        ? Math.round((totalSubmissions / totalViews) * 1000) / 10
        : 0;

    // Daily aggregates
    const dailyData = await this.getDailyBreakdown(
      input.formId,
      fromDate,
      toDate,
      input.groupBy
    );

    // Hourly velocity (last 48 hours bucketed by hour)
    const hourlyVelocity = await this.getHourlyVelocity(input.formId, fromDate, toDate);

    // Per-question drop-off funnel
    const dropoffFunnel = await this.getDropoffFunnel(input.formId);

    // Per-field value distributions and summary statistics
    const fieldSummaries = await this.getFieldSummaries(input.formId, fromDate, toDate, totalSubmissions);

    // Health score computation (0-100)
    const healthScore = this.computeHealthScore({
      conversionRate,
      uniqueResponseRatio,
      totalSubmissions,
      hourlyVelocity,
    });

    return {
      formId: input.formId,
      totalViews,
      totalSubmissions,
      conversionRate,
      avgCompletionSeconds: avgResult?.avg ?? null,
      dailyData,
      hourlyVelocity,
      dropoffFunnel,
      fieldSummaries,
      healthScore,
      uniqueResponseRatio,
    };
  }

  /**
   * Per-field summary statistics: option distributions, numeric aggregates, text lengths
   */
  private async getFieldSummaries(
    formId: string,
    from: Date,
    to: Date,
    totalResponses: number
  ): Promise<FieldSummaryStatistics[]> {
    const fields = await db
      .select({
        id: formFieldsTable.id,
        label: formFieldsTable.label,
        type: formFieldsTable.type,
        order: formFieldsTable.order,
        options: formFieldsTable.options,
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.order);

    if (fields.length === 0) return [];

    const fieldIds = fields.map((f) => f.id);

    const answers = await db
      .select({
        fieldId: responseAnswersTable.fieldId,
        value: responseAnswersTable.value,
        valueArray: responseAnswersTable.valueArray,
      })
      .from(responseAnswersTable)
      .innerJoin(
        formResponsesTable,
        eq(responseAnswersTable.responseId, formResponsesTable.id)
      )
      .where(
        and(
          eq(responseAnswersTable.formId, formId),
          inArray(responseAnswersTable.fieldId, fieldIds),
          eq(formResponsesTable.status, "completed"),
          gte(formResponsesTable.submittedAt, from),
          lte(formResponsesTable.submittedAt, to)
        )
      );

    const answersByField = new Map<string, typeof answers>();
    for (const ans of answers) {
      const list = answersByField.get(ans.fieldId) ?? [];
      list.push(ans);
      answersByField.set(ans.fieldId, list);
    }

    const choiceTypes = new Set(["single_select", "multi_select", "checkbox"]);
    const numericTypes = new Set(["number", "rating"]);
    const textTypes = new Set(["short_text", "long_text", "email", "date"]);

    return fields.map((field) => {
      const fieldAnswers = answersByField.get(field.id) ?? [];
      const answeredCount = fieldAnswers.length;
      const skipRate =
        totalResponses > 0
          ? Math.round(((totalResponses - answeredCount) / totalResponses) * 1000) / 10
          : 0;

      const base: FieldSummaryStatistics = {
        fieldId: field.id,
        label: field.label,
        type: field.type,
        totalResponses,
        answeredCount,
        skipRate,
      };

      if (choiceTypes.has(field.type)) {
        const optionLabels = new Map<string, string>();
        const fieldOptions = (field.options as Array<{ value: string; label: string }> | null) ?? [];
        for (const opt of fieldOptions) {
          optionLabels.set(opt.value, opt.label);
        }

        const counts = new Map<string, number>();
        for (const ans of fieldAnswers) {
          if (ans.valueArray && Array.isArray(ans.valueArray)) {
            for (const v of ans.valueArray as string[]) {
              counts.set(v, (counts.get(v) ?? 0) + 1);
            }
          } else if (ans.value) {
            counts.set(ans.value, (counts.get(ans.value) ?? 0) + 1);
          }
        }

        const totalSelections = Array.from(counts.values()).reduce((s, c) => s + c, 0);
        const optionDistribution = Array.from(counts.entries())
          .map(([value, count]) => ({
            value,
            label: optionLabels.get(value) ?? value,
            count,
            percentage:
              totalSelections > 0
                ? Math.round((count / totalSelections) * 1000) / 10
                : 0,
          }))
          .sort((a, b) => b.count - a.count);

        return { ...base, optionDistribution };
      }

      if (numericTypes.has(field.type)) {
        const nums = fieldAnswers
          .map((a) => parseFloat(a.value ?? ""))
          .filter((n) => !Number.isNaN(n));

        if (nums.length === 0) return base;

        const sorted = [...nums].sort((a, b) => a - b);
        const min = sorted[0]!;
        const max = sorted[sorted.length - 1]!;
        const avg = Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10;
        const median =
          sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1]! + sorted[sorted.length / 2]!) / 2
            : sorted[Math.floor(sorted.length / 2)]!;

        const bucketCounts = new Map<string, number>();
        for (const n of nums) {
          const key = String(n);
          bucketCounts.set(key, (bucketCounts.get(key) ?? 0) + 1);
        }

        const distribution = Array.from(bucketCounts.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => parseFloat(a.value) - parseFloat(b.value));

        return {
          ...base,
          numericStats: { min, max, avg, median, distribution },
        };
      }

      if (textTypes.has(field.type)) {
        const lengths = fieldAnswers
          .map((a) => (a.value ?? "").length)
          .filter((l) => l > 0);

        if (lengths.length === 0) return base;

        return {
          ...base,
          textStats: {
            avgLength: Math.round(lengths.reduce((s, l) => s + l, 0) / lengths.length),
            minLength: Math.min(...lengths),
            maxLength: Math.max(...lengths),
          },
        };
      }

      return base;
    });
  }

  /**
   * Hourly bucketed response velocity
   */
  private async getHourlyVelocity(
    formId: string,
    from: Date,
    to: Date
  ): Promise<Array<{ hour: string; count: number }>> {
    const rows = await db
      .select({
        hour: sql<string>`date_trunc('hour', ${formResponsesTable.submittedAt})`,
        count: sql<number>`count(*)::int`,
      })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, formId),
          gte(formResponsesTable.submittedAt, from),
          lte(formResponsesTable.submittedAt, to),
          eq(formResponsesTable.status, "completed")
        )
      )
      .groupBy(sql`date_trunc('hour', ${formResponsesTable.submittedAt})`)
      .orderBy(sql`date_trunc('hour', ${formResponsesTable.submittedAt})`);

    return rows.map((r) => ({ hour: r.hour, count: r.count }));
  }

  /**
   * Per-question drop-off funnel: for each field, how many responses answered it
   */
  private async getDropoffFunnel(
    formId: string
  ): Promise<Array<{ fieldId: string; label: string; answeredCount: number; dropoffRate: number }>> {
    const fields = await db
      .select({ id: formFieldsTable.id, label: formFieldsTable.label, order: formFieldsTable.order })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.order);

    if (fields.length === 0) return [];

    const fieldIds = fields.map((f) => f.id);

    const answerCounts = await db
      .select({
        fieldId: responseAnswersTable.fieldId,
        count: sql<number>`count(distinct ${responseAnswersTable.responseId})::int`,
      })
      .from(responseAnswersTable)
      .where(
        and(
          eq(responseAnswersTable.formId, formId),
          inArray(responseAnswersTable.fieldId, fieldIds)
        )
      )
      .groupBy(responseAnswersTable.fieldId);

    const countMap = new Map(answerCounts.map((r) => [r.fieldId, r.count]));
    const maxCount = Math.max(...Array.from(countMap.values()), 1);

    return fields.map((f) => {
      const answered = countMap.get(f.id) ?? 0;
      const dropoffRate = maxCount > 0 ? Math.round(((maxCount - answered) / maxCount) * 1000) / 10 : 0;
      return { fieldId: f.id, label: f.label, answeredCount: answered, dropoffRate };
    });
  }

  /**
   * Compute health score (0–100) based on completion rate, unique ratio, velocity
   */
  private computeHealthScore(opts: {
    conversionRate: number;
    uniqueResponseRatio: number;
    totalSubmissions: number;
    hourlyVelocity: Array<{ hour: string; count: number }>;
  }): number {
    const completionScore = Math.min(opts.conversionRate / 100, 1) * 40;
    const uniqueScore = Math.min(opts.uniqueResponseRatio / 100, 1) * 30;
    const velocityScore = opts.hourlyVelocity.length > 0 ? 30 : 0;
    return Math.round(completionScore + uniqueScore + velocityScore);
  }

  /**
   * Get daily view/submission breakdown
   */
  private async getDailyBreakdown(
    formId: string,
    from: Date,
    to: Date,
    groupBy: "day" | "week" | "month"
  ): Promise<DailyAnalytics[]> {
    const truncUnit = groupBy === "day" ? "day" : groupBy === "week" ? "week" : "month";

    const truncExprViews = sql`date_trunc(${sql.raw(`'${truncUnit}'`)}, ${formViewsTable.viewedAt})::date`;
    const truncExprSubs = sql`date_trunc(${sql.raw(`'${truncUnit}'`)}, ${formResponsesTable.submittedAt})::date`;

    // Views per period
    const viewRows = await db
      .select({
        period: truncExprViews,
        count: sql<number>`count(*)::int`,
        uniqueIps: sql<number>`count(distinct ${formViewsTable.ipAddress})::int`,
      })
      .from(formViewsTable)
      .where(
        and(
          eq(formViewsTable.formId, formId),
          gte(formViewsTable.viewedAt, from),
          lte(formViewsTable.viewedAt, to)
        )
      )
      .groupBy(truncExprViews)
      .orderBy(truncExprViews);

    // Submissions per period
    const subRows = await db
      .select({
        period: truncExprSubs,
        count: sql<number>`count(*)::int`,
        avgCompletion: sql<number>`avg(${formResponsesTable.completionTimeSeconds})::int`,
      })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, formId),
          gte(formResponsesTable.submittedAt, from),
          lte(formResponsesTable.submittedAt, to)
        )
      )
      .groupBy(truncExprSubs)
      .orderBy(truncExprSubs);

    // Merge by date
    const periodMap = new Map<
      string,
      { views: number; submissions: number; uniqueVisitors: number; avgCompletion: number | null }
    >();

    for (const row of viewRows) {
      periodMap.set(String(row.period), {
        views: row.count,
        submissions: 0,
        uniqueVisitors: row.uniqueIps ?? 0,
        avgCompletion: null,
      });
    }

    for (const row of subRows) {
      const key = String(row.period);
      const existing = periodMap.get(key) ?? {
        views: 0,
        submissions: 0,
        uniqueVisitors: 0,
        avgCompletion: null,
      };
      periodMap.set(key, {
        ...existing,
        submissions: row.count,
        avgCompletion: row.avgCompletion ?? null,
      });
    }

    return Array.from(periodMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        views: data.views,
        submissions: data.submissions,
        uniqueVisitors: data.uniqueVisitors,
        conversionRate:
          data.views > 0
            ? Math.round((data.submissions / data.views) * 1000) / 10
            : 0,
        avgCompletionSeconds: data.avgCompletion,
      }));
  }

  /**
   * Upsert daily analytics aggregate (called after each submission/view)
   */
  async upsertDailyAnalytics(formId: string): Promise<void> {
    const today = new Date().toISOString().split("T")[0]!;

    const [viewCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(formViewsTable)
      .where(
        and(
          eq(formViewsTable.formId, formId),
          sql`${formViewsTable.viewedAt}::date = ${today}`
        )
      );

    const [subCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, formId),
          sql`${formResponsesTable.submittedAt}::date = ${today}`
        )
      );

    const views = viewCount?.count ?? 0;
    const submissions = subCount?.count ?? 0;
    const conversionRate =
      views > 0 ? `${((submissions / views) * 100).toFixed(1)}%` : "0%";

    await db
      .insert(analyticsTable)
      .values({
        formId,
        date: today,
        views,
        submissions,
        conversionRate,
        uniqueVisitors: views,
      })
      .onConflictDoUpdate({
        target: [analyticsTable.formId, analyticsTable.date],
        set: { views, submissions, conversionRate, updatedAt: new Date() },
      });
  }

  /**
   * Dashboard overview for a creator — FIXED: aggregates views, submissions trend, and form breakdown
   */
  async getCreatorDashboard(creatorId: string): Promise<{
    totalForms: number;
    totalResponses: number;
    totalViews: number;
    avgConversionRate: number;
    dailyTrend: Array<{ date: string; views: number; submissions: number }>;
    formBreakdown: Array<{
      id: string;
      title: string;
      slug: string;
      views: number;
      responses: number;
      conversionRate: number;
    }>;
  }> {
    const creatorForms = await db
      .select({ id: formsTable.id, title: formsTable.title, slug: formsTable.slug })
      .from(formsTable)
      .where(
        and(
          eq(formsTable.creatorId, creatorId),
          eq(formsTable.isArchived, false)
        )
      );

    if (creatorForms.length === 0) {
      return {
        totalForms: 0,
        totalResponses: 0,
        totalViews: 0,
        avgConversionRate: 0,
        dailyTrend: [],
        formBreakdown: [],
      };
    }

    const formIds = creatorForms.map((f) => f.id);

    const [respResult] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(formResponsesTable)
      .where(inArray(formResponsesTable.formId, formIds));

    const [viewResult] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(formViewsTable)
      .where(inArray(formViewsTable.formId, formIds));

    const totalViews = viewResult?.total ?? 0;
    const totalResponses = respResult?.total ?? 0;
    const avgConversionRate =
      totalViews > 0
        ? Math.round((totalResponses / totalViews) * 1000) / 10
        : 0;

    // Get views per form
    const formViews = await db
      .select({
        formId: formViewsTable.formId,
        count: sql<number>`count(*)::int`,
      })
      .from(formViewsTable)
      .where(inArray(formViewsTable.formId, formIds))
      .groupBy(formViewsTable.formId);

    // Get responses per form
    const formResponses = await db
      .select({
        formId: formResponsesTable.formId,
        count: sql<number>`count(*)::int`,
      })
      .from(formResponsesTable)
      .where(inArray(formResponsesTable.formId, formIds))
      .groupBy(formResponsesTable.formId);

    const viewsMap = new Map(formViews.map((v) => [v.formId, v.count]));
    const responsesMap = new Map(formResponses.map((r) => [r.formId, r.count]));

    const formBreakdown = creatorForms.map((f) => {
      const views = viewsMap.get(f.id) ?? 0;
      const responses = responsesMap.get(f.id) ?? 0;
      const conversionRate =
        views > 0 ? Math.round((responses / views) * 1000) / 10 : 0;
      return {
        id: f.id,
        title: f.title,
        slug: f.slug,
        views,
        responses,
        conversionRate,
      };
    });

    // Trend for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyViews = await db
      .select({
        date: sql<string>`date_trunc('day', ${formViewsTable.viewedAt})::date`,
        count: sql<number>`count(*)::int`,
      })
      .from(formViewsTable)
      .where(
        and(
          inArray(formViewsTable.formId, formIds),
          gte(formViewsTable.viewedAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql`date_trunc('day', ${formViewsTable.viewedAt})::date`);

    const dailySubmissions = await db
      .select({
        date: sql<string>`date_trunc('day', ${formResponsesTable.submittedAt})::date`,
        count: sql<number>`count(*)::int`,
      })
      .from(formResponsesTable)
      .where(
        and(
          inArray(formResponsesTable.formId, formIds),
          gte(formResponsesTable.submittedAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql`date_trunc('day', ${formResponsesTable.submittedAt})::date`);

    const trendMap = new Map<string, { views: number; submissions: number }>();

    for (const row of dailyViews) {
      const d = String(row.date);
      trendMap.set(d, { views: row.count, submissions: 0 });
    }

    for (const row of dailySubmissions) {
      const d = String(row.date);
      const existing = trendMap.get(d) ?? { views: 0, submissions: 0 };
      trendMap.set(d, {
        views: existing.views,
        submissions: row.count,
      });
    }

    const dailyTrend = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        views: data.views,
        submissions: data.submissions,
      }));

    return {
      totalForms: creatorForms.length,
      totalResponses,
      totalViews,
      avgConversionRate,
      dailyTrend,
      formBreakdown,
    };
  }

  /**
   * Get the most recent submissions across all forms owned by a creator
   * Used for the real-time live feed on the analytics dashboard
   */
  async getRecentSubmissions(
    creatorId: string,
    limit = 20
  ): Promise<
    Array<{
      responseId: string;
      formId: string;
      formTitle: string;
      respondentEmail: string | null;
      respondentName: string | null;
      submittedAt: string;
    }>
  > {
    const creatorForms = await db
      .select({ id: formsTable.id, title: formsTable.title })
      .from(formsTable)
      .where(
        and(
          eq(formsTable.creatorId, creatorId),
          eq(formsTable.isArchived, false)
        )
      );

    if (creatorForms.length === 0) return [];

    const formIds = creatorForms.map((f) => f.id);
    const formMap = new Map(creatorForms.map((f) => [f.id, f.title]));

    const rows = await db
      .select({
        id: formResponsesTable.id,
        formId: formResponsesTable.formId,
        respondentEmail: formResponsesTable.respondentEmail,
        respondentName: formResponsesTable.respondentName,
        submittedAt: formResponsesTable.submittedAt,
      })
      .from(formResponsesTable)
      .where(
        and(
          inArray(formResponsesTable.formId, formIds),
          eq(formResponsesTable.status, "completed")
        )
      )
      .orderBy(desc(formResponsesTable.submittedAt))
      .limit(limit);

    return rows.map((r) => ({
      responseId: r.id,
      formId: r.formId,
      formTitle: formMap.get(r.formId) ?? "Unknown Form",
      respondentEmail: r.respondentEmail ?? null,
      respondentName: r.respondentName ?? null,
      submittedAt: r.submittedAt ? r.submittedAt.toISOString() : new Date().toISOString(),
    }));
  }

  private defaultFromDate(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }
}

export const analyticsService = new AnalyticsService();
