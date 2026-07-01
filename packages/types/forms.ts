export type FormVisibility = "public" | "unlisted" | "unpublished";
export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "single_select"
  | "multi_select"
  | "checkbox"
  | "date"
  | "rating";

export interface FieldOption {
  value: string;
  label: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  maxRating?: number;
}

export interface ConditionalLogic {
  showIf?: {
    fieldId: string;
    operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";
    value?: string;
  };
}

export interface FormField {
  id: string;
  formId: string;
  pageId: string | null;
  type: FieldType;
  label: string;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  order: number;
  options: FieldOption[] | null;
  validationRules: ValidationRules | null;
  conditionalLogic: ConditionalLogic | null;
  isLocked: boolean;
}

export interface Form {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  slug: string;
  visibility: FormVisibility;
  isArchived: boolean;
  themeId: string | null;
  allowMultipleResponses: boolean;
  showProgressBar: boolean;
  submitButtonText: string | null;
  successMessage: string | null;
  maxResponses: number | null;
  closeAfterDate: Date | null;
  isPasswordProtected: boolean;
  publishedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  fields?: FormField[];
}

export interface FormWithStats extends Form {
  responseCount: number;
  viewCount: number;
  conversionRate: number;
}
