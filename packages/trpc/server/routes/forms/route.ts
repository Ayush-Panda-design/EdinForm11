import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formsService } from "@repo/services/forms";
import {
  createFormSchema,
  updateFormSchema,
  createFormFieldSchema,
  updateFormFieldSchema,
  updateFormVisibilitySchema,
  reorderFieldsSchema,
} from "@repo/validators/forms";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

const formFieldOutput = z.object({
  id: z.string(),
  formId: z.string(),
  pageId: z.string().nullable(),
  type: z.string(),
  label: z.string(),
  placeholder: z.string().nullable(),
  helpText: z.string().nullable(),
  required: z.boolean(),
  order: z.number(),
  options: z.any().nullable(),
  validationRules: z.any().nullable(),
  conditionalLogic: z.any().nullable(),
  isLocked: z.boolean(),
});

const formOutput = z.object({
  id: z.string(),
  creatorId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  visibility: z.string(),
  isArchived: z.boolean(),
  themeId: z.string().nullable(),
  allowMultipleResponses: z.boolean(),
  showProgressBar: z.boolean(),
  submitButtonText: z.string().nullable(),
  successMessage: z.string().nullable(),
  maxResponses: z.number().nullable(),
  closeAfterDate: z.date().nullable(),
  isPasswordProtected: z.boolean().optional(),
  publishedAt: z.date().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

const formWithStatsOutput = formOutput.extend({
  responseCount: z.number(),
  viewCount: z.number(),
  conversionRate: z.number(),
});

export const formsRouter = router({
  /** POST /forms */
  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/"), tags: TAGS } })
    .input(createFormSchema)
    .output(formOutput)
    .mutation(async ({ input, ctx }) => {
      return formsService.createForm(ctx.user.id, input);
    }),

  /** GET /forms */
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/"), tags: TAGS } })
    .input(z.object({ includeArchived: z.boolean().default(false) }))
    .output(z.array(formWithStatsOutput))
    .query(async ({ input, ctx }) => {
      return formsService.listForms(ctx.user.id, input);
    }),

  /** GET /forms/:id */
  getById: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{id}"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(formOutput.extend({ fields: z.array(formFieldOutput) }))
    .query(async ({ input, ctx }) => {
      const form = await formsService.getFormWithFields(input.id, ctx.user.id);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
      return form;
    }),

  /** PATCH /forms/:id */
  update: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("/{id}"), tags: TAGS } })
    .input(updateFormSchema.extend({ id: z.string().uuid() }))
    .output(formOutput)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      try {
        return await formsService.updateForm(id, ctx.user.id, data);
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
      }
    }),

  /** POST /forms/:id/publish */
  publish: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/publish"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid(), visibility: z.enum(["public", "unlisted"]).default("public") }))
    .output(formOutput)
    .mutation(async ({ input, ctx }) => {
      try {
        return await formsService.publishForm(input.id, ctx.user.id, input.visibility);
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
      }
    }),

  /** POST /forms/:id/unpublish */
  unpublish: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/unpublish"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(formOutput)
    .mutation(async ({ input, ctx }) => {
      return formsService.unpublishForm(input.id, ctx.user.id);
    }),

  /** POST /forms/:id/archive */
  archive: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/archive"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(formOutput)
    .mutation(async ({ input, ctx }) => {
      return formsService.archiveForm(input.id, ctx.user.id);
    }),

  /** POST /forms/:id/duplicate */
  duplicate: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/duplicate"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(formOutput)
    .mutation(async ({ input, ctx }) => {
      return formsService.duplicateForm(input.id, ctx.user.id);
    }),

  /** DELETE /forms/:id */
  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/{id}"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await formsService.deleteForm(input.id, ctx.user.id);
      return { success: true };
    }),

  // ---------------------------------------------------------------------------
  // Fields
  // ---------------------------------------------------------------------------

  /** POST /forms/:formId/fields */
  addField: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{formId}/fields"), tags: TAGS } })
    .input(createFormFieldSchema.extend({ formId: z.string().uuid() }))
    .output(formFieldOutput)
    .mutation(async ({ input, ctx }) => {
      const { formId, ...fieldData } = input;
      return formsService.addField(formId, ctx.user.id, fieldData);
    }),

  /** PATCH /forms/:formId/fields/:fieldId */
  updateField: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("/{formId}/fields/{fieldId}"), tags: TAGS } })
    .input(createFormFieldSchema.partial().extend({ formId: z.string().uuid(), fieldId: z.string().uuid() }))
    .output(formFieldOutput)
    .mutation(async ({ input, ctx }) => {
      const { formId, fieldId, ...data } = input;
      try {
        return await formsService.updateField(fieldId, formId, ctx.user.id, data);
      } catch (err) {
        if ((err as Error).message === "FIELD_LOCKED") {
          throw new TRPCError({ code: "FORBIDDEN", message: "This field is locked because responses exist. Unlock it first to edit." });
        }
        throw err;
      }
    }),

  /** DELETE /forms/:formId/fields/:fieldId */
  deleteField: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/{formId}/fields/{fieldId}"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid(), fieldId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await formsService.deleteField(input.fieldId, input.formId, ctx.user.id);
      return { success: true };
    }),

  /** POST /forms/:formId/fields/reorder */
  reorderFields: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{formId}/fields/reorder"), tags: TAGS } })
    .input(reorderFieldsSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await formsService.reorderFields(input.formId, ctx.user.id, input.fieldOrders);
      return { success: true };
    }),

  /** POST /forms/:formId/fields/:fieldId/lock — lock field */
  lockField: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{formId}/fields/{fieldId}/lock"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid(), fieldId: z.string().uuid() }))
    .output(z.object({ id: z.string(), isLocked: z.boolean(), label: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const field = await formsService.lockField(input.fieldId, input.formId, ctx.user.id);
      return { id: field.id, isLocked: field.isLocked ?? true, label: field.label };
    }),

  /** POST /forms/:formId/fields/:fieldId/unlock — unlock field */
  unlockField: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{formId}/fields/{fieldId}/unlock"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid(), fieldId: z.string().uuid() }))
    .output(z.object({ id: z.string(), isLocked: z.boolean(), label: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const field = await formsService.unlockField(input.fieldId, input.formId, ctx.user.id);
      return { id: field.id, isLocked: field.isLocked ?? false, label: field.label };
    }),

  // ---------------------------------------------------------------------------
  // Pages
  // ---------------------------------------------------------------------------

  /** GET /forms/:id/pages */
  listPages: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{id}/pages"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.array(z.object({ id: z.string(), formId: z.string(), title: z.string().nullable(), description: z.string().nullable(), order: z.number(), createdAt: z.date().nullable() })))
    .query(async ({ input, ctx }) => {
      return formsService.listPages(input.id, ctx.user.id);
    }),

  /** POST /forms/:id/pages */
  addPage: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/pages"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid(), title: z.string().max(200).optional(), description: z.string().max(1000).optional(), order: z.number().int().optional() }))
    .output(z.object({ id: z.string(), formId: z.string(), title: z.string().nullable(), description: z.string().nullable(), order: z.number(), createdAt: z.date().nullable() }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      return formsService.addPage(id, ctx.user.id, data);
    }),

  /** PATCH /forms/:id/pages/:pageId */
  updatePage: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("/{id}/pages/{pageId}"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid(), pageId: z.string().uuid(), title: z.string().max(200).optional(), description: z.string().max(1000).optional() }))
    .output(z.object({ id: z.string(), formId: z.string(), title: z.string().nullable(), description: z.string().nullable(), order: z.number(), createdAt: z.date().nullable() }))
    .mutation(async ({ input, ctx }) => {
      const { id, pageId, ...data } = input;
      return formsService.updatePage(pageId, id, ctx.user.id, data);
    }),

  /** DELETE /forms/:id/pages/:pageId */
  deletePage: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/{id}/pages/{pageId}"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid(), pageId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await formsService.deletePage(input.pageId, input.id, ctx.user.id);
      return { success: true };
    }),

  /** POST /forms/:formId/fields/:fieldId/assign-page */
  assignFieldToPage: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{formId}/fields/{fieldId}/assign-page"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid(), fieldId: z.string().uuid(), pageId: z.string().uuid().nullable() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await formsService.assignFieldToPage(input.fieldId, input.formId, ctx.user.id, input.pageId);
      return { success: true };
    }),

  // ---------------------------------------------------------------------------
  // Password Protection
  // ---------------------------------------------------------------------------

  /** POST /forms/:id/set-password */
  setPassword: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/set-password"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid(), password: z.string().max(200).nullable() }))
    .output(z.object({ success: z.boolean(), isPasswordProtected: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const form = await formsService.setFormPassword(input.id, ctx.user.id, input.password);
      return { success: true, isPasswordProtected: form.isPasswordProtected ?? false };
    }),
});
