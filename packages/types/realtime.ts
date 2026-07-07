/** Server → client push events for live dashboard updates */
export type RealtimeEvent = {
  type: "analytics.updated";
  formId?: string;
  reason: "response.submitted" | "form.viewed";
  responseId?: string;
  at: string;
};

export type RealtimeAnalyticsPayload = {
  creatorId: string;
  formId?: string;
  reason: RealtimeEvent["reason"];
  responseId?: string;
};
