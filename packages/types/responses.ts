export type ResponseStatus = "in_progress" | "completed" | "spam";

export interface ResponseAnswer {
  id: string;
  responseId: string;
  fieldId: string;
  value: string | null;
  valueArray: string[] | null;
}

export interface FormResponse {
  id: string;
  formId: string;
  status: ResponseStatus;
  respondentEmail: string | null;
  respondentName: string | null;
  completionTimeSeconds: number | null;
  submittedAt: Date | null;
  answers: ResponseAnswer[];
}

export interface PaginatedResponses {
  data: FormResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
