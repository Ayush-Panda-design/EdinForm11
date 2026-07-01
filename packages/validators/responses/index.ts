import { z } from "zod";
import { paginationSchema } from "../shared";

/** Hidden field name bots fill in; must stay empty for legitimate submissions */
export const HONEYPOT_FIELD_NAME = "_hp_website";

export const answerSchema = z.object({
  fieldId: z.string().uuid(),
  value: z.string().max(10000).optional(),
  valueArray: z.array(z.string().max(500)).max(50).optional(),
});

/** Returns true when a bot filled the honeypot trap field */
export function isHoneypotTriggered(honeypot?: string): boolean {
  return typeof honeypot === "string" && honeypot.trim().length > 0;
}

export const submitResponseSchema = z.object({
  formId: z.string().uuid(),
  answers: z.array(answerSchema).min(0).max(200),
  respondentEmail: z.string().email().optional(),
  respondentName: z.string().max(200).optional(),
  // FIX: was .positive() which excludes 0; use .nonnegative() to allow 0
  completionTimeSeconds: z.number().int().nonnegative().max(86400).optional(),
  /** Anti-spam honeypot — must be empty; bots that fill it are silently rejected */
  honeypot: z.string().max(500).optional(),
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
