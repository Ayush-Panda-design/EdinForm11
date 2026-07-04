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
  completionTimeSeconds: z.number().int().nonnegative().max(86400).optional(),
  /** Hidden honeypot — bots fill this; humans leave it empty */
  honeypot: z.string().max(500).optional(),
  /** Resume a previously saved draft */
  draftResponseId: z.string().uuid().optional(),
});

export const saveDraftSchema = z.object({
  formId: z.string().uuid(),
  answers: z.array(answerSchema).min(0).max(200),
  currentStep: z.number().int().min(-1).max(500).optional(),
  draftResponseId: z.string().uuid().optional(),
});

export const getDraftSchema = z.object({
  formId: z.string().uuid(),
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
export type SaveDraftInput = z.infer<typeof saveDraftSchema>;

export * from "./conditional";
export * from "./dynamic-schema";
