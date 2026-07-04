import { z } from "zod";
import { shouldShowField, type AnswerMap } from "./conditional";

/** Minimal field shape for runtime schema generation (mirrors FormField). */
export type DynamicField = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  order?: number;
  options?: { value: string; label: string }[] | null;
  validationRules?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minRating?: number;
    maxRating?: number;
  } | null;
  conditionalLogic?: {
    showIf?: {
      fieldId: string;
      operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";
      value?: string;
    };
  } | null;
};

export type SubmitAnswer = {
  fieldId: string;
  value?: string;
  valueArray?: string[];
};

export type ValidationError = {
  fieldId: string;
  message: string;
};

function answerMapFromSubmit(answers: SubmitAnswer[]): AnswerMap {
  const map: AnswerMap = {};
  for (const a of answers) {
    if (a.valueArray !== undefined) {
      map[a.fieldId] = a.valueArray;
    } else if (a.value !== undefined) {
      map[a.fieldId] = a.value;
    }
  }
  return map;
}

function hasAnswerValue(answer: SubmitAnswer | undefined): boolean {
  if (!answer) return false;
  if (answer.valueArray !== undefined) return answer.valueArray.length > 0;
  if (answer.value !== undefined) return answer.value !== "" && answer.value !== "false";
  return false;
}

/** Build a Zod schema for a single field's answer value. */
export function buildFieldAnswerSchema(field: DynamicField): z.ZodTypeAny {
  const rules = field.validationRules ?? {};

  switch (field.type) {
    case "short_text":
    case "long_text": {
      let schema = z.string();
      if (rules.minLength !== undefined) schema = schema.min(rules.minLength);
      if (rules.maxLength !== undefined) schema = schema.max(rules.maxLength);
      if (rules.pattern) {
        try {
          schema = schema.regex(new RegExp(rules.pattern), "Invalid format");
        } catch {
          schema = schema.regex(/^.*$/, "Invalid pattern configuration");
        }
      }
      return field.required ? schema.min(1, "This field is required") : schema.optional();
    }

    case "email": {
      let schema = z.string().email("Please enter a valid email address");
      if (rules.maxLength !== undefined) schema = schema.max(rules.maxLength);
      return field.required ? schema.min(1, "This field is required") : schema.optional();
    }

    case "number": {
      return z.string().superRefine((v, ctx) => {
        if (!v) {
          if (field.required) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "This field is required" });
          }
          return;
        }
        const n = Number(v);
        if (Number.isNaN(n)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be a valid number" });
          return;
        }
        if (rules.min !== undefined && n < rules.min) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Minimum value is ${rules.min}`,
          });
        }
        if (rules.max !== undefined && n > rules.max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Maximum value is ${rules.max}`,
          });
        }
      });
    }

    case "date": {
      const schema = z.string().refine(
        (v) => v === "" || !Number.isNaN(Date.parse(v)),
        "Please enter a valid date"
      );
      return field.required ? schema.min(1, "This field is required") : schema.optional();
    }

    case "rating": {
      const maxRating = rules.maxRating ?? 5;
      const minRating = rules.minRating ?? 1;
      const schema = z
        .string()
        .refine((v) => v === "" || !Number.isNaN(Number(v)), "Invalid rating")
        .refine(
          (v) => {
            if (v === "") return !field.required;
            const n = Number(v);
            return n >= minRating && n <= maxRating;
          },
          `Rating must be between ${minRating} and ${maxRating}`
        );
      return field.required ? schema.min(1, "This field is required") : schema.optional();
    }

    case "single_select": {
      const values = field.options?.map((o) => o.value) ?? [];
      if (values.length === 0) {
        return field.required ? z.string().min(1) : z.string().optional();
      }
      const schema = z.enum(values as [string, ...string[]], {
        message: "Please select a valid option",
      });
      return field.required ? schema : schema.optional();
    }

    case "multi_select": {
      const values = new Set(field.options?.map((o) => o.value) ?? []);
      let schema = z.array(z.string());
      if (values.size > 0) {
        schema = schema.refine(
          (arr) => arr.every((v) => values.has(v)),
          "Contains invalid option(s)"
        );
      }
      if (rules.min !== undefined) {
        schema = schema.refine(
          (arr) => arr.length >= rules.min!,
          `Select at least ${rules.min} option(s)`
        );
      }
      if (rules.max !== undefined) {
        schema = schema.refine(
          (arr) => arr.length <= rules.max!,
          `Select at most ${rules.max} option(s)`
        );
      }
      return field.required
        ? schema.min(1, "Select at least one option")
        : schema.optional();
    }

    case "checkbox": {
      const schema = z.enum(["true", "false"], { message: "Invalid checkbox value" });
      return field.required
        ? schema.refine((v) => v === "true", "This field is required")
        : schema.optional();
    }

    default:
      return field.required ? z.string().min(1) : z.string().optional();
  }
}

/**
 * Converts FieldConfig[] to a runtime Zod object schema keyed by field id.
 * Only visible fields (per conditional logic) are included.
 */
export function buildDynamicResponseSchema(
  fields: DynamicField[],
  answers: AnswerMap
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (!shouldShowField(field.conditionalLogic, answers)) continue;
    shape[field.id] = buildFieldAnswerSchema(field);
  }

  return z.object(shape);
}

/** Validate a single field (for blur / inline UX). */
export function validateSingleField(
  field: DynamicField,
  answer: SubmitAnswer | undefined,
): string | null {
  if (field.required && !hasAnswerValue(answer)) {
    return `"${field.label}" is required`;
  }
  if (!hasAnswerValue(answer)) return null;

  const rawValue =
    field.type === "multi_select" ? (answer!.valueArray ?? []) : (answer!.value ?? "");

  const schema = buildFieldAnswerSchema({ ...field, required: true });
  const result = schema.safeParse(rawValue);
  if (!result.success) {
    return result.error.issues[0]?.message ?? `Invalid value for "${field.label}"`;
  }
  return null;
}

/** Validate submission answers against dynamic per-field Zod schemas. */
export function validateSubmissionAnswers(
  fields: DynamicField[],
  answers: SubmitAnswer[]
): { success: true } | { success: false; errors: ValidationError[] } {
  const answerMap = answerMapFromSubmit(answers);
  const submitMap = new Map(answers.map((a) => [a.fieldId, a]));
  const errors: ValidationError[] = [];

  const visibleFields = fields.filter((f) =>
    shouldShowField(f.conditionalLogic, answerMap)
  );

  for (const field of visibleFields) {
    const answer = submitMap.get(field.id);

    if (field.required && !hasAnswerValue(answer)) {
      errors.push({ fieldId: field.id, message: `"${field.label}" is required` });
      continue;
    }

    if (!hasAnswerValue(answer)) continue;

    const rawValue =
      field.type === "multi_select"
        ? (answer!.valueArray ?? [])
        : (answer!.value ?? "");

    const schema = buildFieldAnswerSchema({ ...field, required: true });
    const result = schema.safeParse(rawValue);

    if (!result.success) {
      const message =
        result.error.issues[0]?.message ?? `Invalid value for "${field.label}"`;
      errors.push({ fieldId: field.id, message });
    }
  }

  // Reject answers for hidden fields
  const visibleIds = new Set(visibleFields.map((f) => f.id));
  for (const answer of answers) {
    if (!visibleIds.has(answer.fieldId)) {
      errors.push({
        fieldId: answer.fieldId,
        message: "Answer provided for a hidden field",
      });
    }
  }

  if (errors.length > 0) return { success: false, errors };
  return { success: true };
}
