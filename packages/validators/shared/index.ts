import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20), // enforces max 100 per page
});

export const uuidSchema = z.string().uuid();
export const idParamSchema = z.object({ id: uuidSchema });

export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
