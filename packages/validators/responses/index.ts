import { z } from "zod";
import { paginationSchema } from "../shared";

export const answerSchema = z.object({
  fieldId: z.string().uuid(),
  value: z.string().max(10000).optional(),
  valueArray: z.array(z.string().max(500)).max(50).optional(),
});

export const submitResponseSchema = z.object({
  formId: z.string().uuid(),
  answers: z.array(answerSchema).min(0).max(200),
  respondentEmail: z.string().email().optional(),
  respondentName: z.string().max(200).optional(),
  // FIX: was .positive() which excludes 0; use .nonnegative() to allow 0
  completionTimeSeconds: z.number().int().nonnegative().max(86400).optional(),
});

export const listResponsesSchema = paginationSchema.extend({
  formId: z.string().uuid(),
  status: z.enum(["in_progress", "completed", "spam"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  search: z.string().max(200).optional(),
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
export type ListResponsesInput = z.infer<typeof listResponsesSchema>;
