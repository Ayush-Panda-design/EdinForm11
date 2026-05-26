import { z } from "zod";

export const fieldTypeEnum = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "date",
  "rating",
]);

export const fieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const validationRulesSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    minRating: z.number().optional(),
    maxRating: z.number().int().min(1).max(10).optional(),
  })
  .optional()
  // Cross-field validation: min <= max
  .superRefine((val, ctx) => {
    if (!val) return;
    if (val.min !== undefined && val.max !== undefined && val.min > val.max) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "min must be <= max", path: ["min"] });
    }
    if (val.minLength !== undefined && val.maxLength !== undefined && val.minLength > val.maxLength) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "minLength must be <= maxLength", path: ["minLength"] });
    }
    if (val.minRating !== undefined && val.maxRating !== undefined && val.minRating > val.maxRating) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "minRating must be <= maxRating", path: ["minRating"] });
    }
  });

export const conditionalLogicSchema = z
  .object({
    showIf: z
      .object({
        fieldId: z.string().uuid(),
        operator: z.enum(["equals", "not_equals", "contains", "is_empty", "is_not_empty"]),
        value: z.string().optional(),
      })
      // Refinement: value is required for operators that need a comparison value
      .superRefine((val, ctx) => {
        if (["equals", "not_equals", "contains"].includes(val.operator) && !val.value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `value is required for operator "${val.operator}"`,
            path: ["value"],
          });
        }
      })
      .optional(),
  })
  .optional();

export const createFormFieldSchema = z.object({
  type: fieldTypeEnum,
  label: z.string().min(1).max(500),
  placeholder: z.string().max(500).optional(),
  helpText: z.string().max(1000).optional(),
  required: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  options: z.array(fieldOptionSchema).optional(),
  validationRules: validationRulesSchema,
  conditionalLogic: conditionalLogicSchema,
  pageId: z.string().uuid().optional(),
});

export const updateFormFieldSchema = createFormFieldSchema.partial().extend({
  id: z.string().uuid(),
});

export const createFormSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  themeId: z.string().uuid().optional(),
  allowMultipleResponses: z.boolean().default(true),
  showProgressBar: z.boolean().default(true),
  shuffleFields: z.boolean().default(false),
  closeAfterDate: z.string().datetime().optional(),
  // FIX: was .positive() — change to .nonnegative() to be more flexible, keep .positive() for actual limit
  maxResponses: z.number().int().positive().optional(),
  submitButtonText: z.string().max(100).optional(),
  successMessage: z.string().max(1000).optional(),
  redirectUrl: z.string().url().optional(),
  notifyCreatorOnSubmission: z.boolean().default(true),
  sendConfirmationEmail: z.boolean().default(false),
});

export const updateFormSchema = createFormSchema.partial();

export const formVisibilitySchema = z.enum(["public", "unlisted", "unpublished"]);

export const updateFormVisibilitySchema = z.object({
  visibility: formVisibilitySchema,
});

export const reorderFieldsSchema = z.object({
  formId: z.string().uuid(),
  fieldOrders: z.array(
    z.object({ fieldId: z.string().uuid(), order: z.number().int().min(0) })
  ),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type CreateFormFieldInput = z.infer<typeof createFormFieldSchema>;
export type UpdateFormFieldInput = z.infer<typeof updateFormFieldSchema>;
