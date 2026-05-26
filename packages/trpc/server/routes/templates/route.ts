import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { templatesService } from "@repo/services/templates";

const TAGS = ["Templates"];
const getPath = generatePath("/templates");

const templateOutput = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  previewImageUrl: z.string().nullable(),
  isPublic: z.boolean(),
  usageCount: z.string().nullable(),
  createdAt: z.date().nullable(),
});

export const templatesRouter = router({
  /** GET /templates */
  list: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/"), tags: TAGS } })
    .input(z.object({
      category: z.string().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(12),
    }))
    .output(z.object({ data: z.array(templateOutput), total: z.number() }))
    .query(async ({ input }) => {
      return templatesService.listPublicTemplates(input);
    }),

  /** GET /templates/:id */
  getById: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{id}"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(templateOutput.extend({ formSnapshot: z.any() }))
    .query(async ({ input }) => {
      const t = await templatesService.getTemplateById(input.id);
      if (!t) throw new TRPCError({ code: "NOT_FOUND", message: "Template not found." });
      return t;
    }),

  /** POST /templates/:id/use — create a form from a template */
  useTemplate: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/use"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ formId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const formId = await templatesService.createFormFromTemplate(input.id, ctx.user.id);
        return { formId };
      } catch (err) {
        if ((err as Error).message === "TEMPLATE_NOT_FOUND") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found." });
        }
        throw err;
      }
    }),
});
