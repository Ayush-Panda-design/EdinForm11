import { ZodError, type ZodIssue } from "zod";

const OPERATOR_LABELS: Record<string, string> = {
  equals: "equals",
  not_equals: "does not equal",
  contains: "contains",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

function friendlyIssue(issue: ZodIssue): string {
  const path = issue.path.map(String).join(".");
  const msg = issue.message;

  if (path.includes("conditionalLogic")) {
    if (path.includes("value") || msg.includes("value is required for operator")) {
      const op = msg.match(/"([^"]+)"/)?.[1];
      const label = op ? OPERATOR_LABELS[op] ?? op : "this rule";
      return `Conditional logic needs a comparison value. Enter what the previous answer should ${label}.`;
    }
    if (path.includes("fieldId")) {
      return "Choose which earlier question the conditional logic should watch.";
    }
    return "Please complete the conditional logic settings for this question.";
  }

  if (path.includes("validationRules")) {
    if (msg.includes("min must be")) return "Minimum value must be less than or equal to the maximum.";
    if (msg.includes("minLength")) return "Minimum length must be less than or equal to the maximum length.";
    if (msg.includes("minRating")) return "Minimum rating must be less than or equal to the maximum rating.";
    return "Please check the validation rules for this field.";
  }

  if (path.includes("label") && msg.includes("Required")) {
    return "Question label is required.";
  }

  if (path.includes("options")) {
    return "Please add at least one option for this choice question.";
  }

  if (msg.includes("Invalid input")) {
    return "Some field settings are invalid. Please review and try again.";
  }

  return msg.replace(/^value is required for operator "([^"]+)"$/, (_, op) => {
    const label = OPERATOR_LABELS[op] ?? op;
    return `Enter a comparison value for the "${label}" condition.`;
  });
}

export function formatZodError(error: ZodError): string {
  const first = error.issues[0];
  return first ? friendlyIssue(first) : "Please check your input and try again.";
}

/** Turn raw API / tRPC error text into a user-friendly sentence. */
export function formatClientErrorMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return "Something went wrong. Please try again.";

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
        const issue = parsed[0] as ZodIssue;
        if ("message" in issue && "path" in issue) {
          return friendlyIssue(issue);
        }
      }
    } catch {
      // not JSON — fall through
    }
  }

  if (trimmed === "Input validation failed") {
    return "Some settings are invalid. Please review the form and try again.";
  }

  if (trimmed === "FIELD_LOCKED" || trimmed.includes("locked because responses exist")) {
    return "This question is locked because people have already responded. Unlock it first, then save your changes.";
  }

  if (trimmed.includes("value is required for operator")) {
    const op = trimmed.match(/"([^"]+)"/)?.[1];
    const label = op ? OPERATOR_LABELS[op] ?? op : "this rule";
    return `Enter a comparison value for conditional logic (when the answer ${label}).`;
  }

  return trimmed;
}
