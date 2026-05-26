import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, adminProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formsService } from "@repo/services/forms";

const TAGS = ["Admin"];
const getPath = generatePath("/admin");

const formOutputSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  visibility: z.string(),
  isArchived: z.boolean(),
  maxResponses: z.number().nullable(),
  closeAfterDate: z.date().nullable(),
  publishedAt: z.date().nullable(),
  createdAt: z.date().nullable(),
});

const userOutputSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  role: z.string(),
  isActive: z.boolean(),
  createdAt: z.date().nullable(),
  formCount: z.number(),
});

export const adminRouter = router({
  /** GET /admin/stats */
  getStats: adminProcedure
    .meta({ openapi: { method: "GET", path: getPath("/stats"), tags: TAGS } })
    .input(z.void())
    .output(z.object({
      totalUsers: z.number(),
      totalForms: z.number(),
      totalResponses: z.number(),
      publishedForms: z.number(),
    }))
    .query(async () => {
      return formsService.adminGetStats();
    }),

  /** GET /admin/forms */
  listForms: adminProcedure
    .meta({ openapi: { method: "GET", path: getPath("/forms"), tags: TAGS } })
    .input(z.object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
      search: z.string().optional(),
    }))
    .output(z.object({
      data: z.array(formOutputSchema),
      total: z.number(),
      page: z.number(),
      totalPages: z.number(),
    }))
    .query(async ({ input }) => {
      const result = await formsService.adminListAllForms(input);
      return {
        ...result,
        page: input.page,
        totalPages: Math.ceil(result.total / input.limit),
      };
    }),

  /** GET /admin/users */
  listUsers: adminProcedure
    .meta({ openapi: { method: "GET", path: getPath("/users"), tags: TAGS } })
    .input(z.object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
      search: z.string().optional(),
    }))
    .output(z.object({
      data: z.array(userOutputSchema),
      total: z.number(),
      page: z.number(),
      totalPages: z.number(),
    }))
    .query(async ({ input }) => {
      const result = await formsService.adminListAllUsers(input);
      return {
        ...result,
        page: input.page,
        totalPages: Math.ceil(result.total / input.limit),
      };
    }),

  /** POST /admin/users/:id/set-role */
  setUserRole: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/users/{id}/set-role"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid(), role: z.enum(["admin", "creator"]) }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      await formsService.adminSetUserRole(input.id, input.role);
      return { success: true };
    }),

  /** DELETE /admin/forms/:id */
  deleteForm: adminProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/forms/{id}"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      // Admin can delete any form — use a system-level delete
      await formsService.adminDeleteForm(input.id);
      return { success: true };
    }),
});
