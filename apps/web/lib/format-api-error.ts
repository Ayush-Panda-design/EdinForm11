/** Client-side helper — mirrors server-friendly validation messages for toasts. */
export function formatApiError(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return "Something went wrong. Please try again.";

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Array<{ message?: string; path?: (string | number)[] }>;
      const first = parsed[0];
      if (first?.message) {
        return mapKnownMessage(first.message, first.path);
      }
    } catch {
      // fall through
    }
  }

  return mapKnownMessage(trimmed);
}

function mapKnownMessage(message: string, path?: (string | number)[]): string {
  const pathStr = path?.join(".") ?? "";

  if (pathStr.includes("conditionalLogic") || message.includes("value is required for operator")) {
    if (message.includes("equals")) {
      return "Enter what the previous answer should equal for conditional logic.";
    }
    if (message.includes("not_equals")) {
      return "Enter what the previous answer should not equal for conditional logic.";
    }
    if (message.includes("contains")) {
      return "Enter text the previous answer should contain for conditional logic.";
    }
    return "Complete the conditional logic rule — pick a question, condition, and comparison value.";
  }

  if (message.includes("locked because responses") || message === "FIELD_LOCKED") {
    return "This question is locked. Click the lock icon on the question to unlock it, then try saving again.";
  }

  if (message === "Input validation failed") {
    return "Some settings are invalid. Please review and try again.";
  }

  return message;
}

export function toastApiError(
  toast: { error: (msg: string, opts?: { description?: string }) => void },
  message: string,
  description?: string,
) {
  toast.error(formatApiError(message), description ? { description } : undefined);
}
