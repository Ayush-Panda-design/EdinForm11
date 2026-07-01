import { z } from "zod";

export const analyticsQuerySchema = z.object({
  formId: z.string().uuid(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
