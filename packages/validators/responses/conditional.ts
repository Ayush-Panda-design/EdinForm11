/** Shared conditional-logic evaluation for builder, public form, and server validation. */

export type AnswerMap = Record<string, string | string[] | undefined>;

export type ConditionalLogic = {
  showIf?: {
    fieldId: string;
    operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";
    value?: string;
  };
};

export function shouldShowField(
  conditionalLogic: ConditionalLogic | null | undefined,
  answers: AnswerMap
): boolean {
  if (!conditionalLogic?.showIf) return true;

  const { fieldId, operator, value } = conditionalLogic.showIf;
  const answer = answers[fieldId];
  const answerStr = Array.isArray(answer) ? answer.join(",") : (answer ?? "");

  switch (operator) {
    case "equals":
      return answerStr === (value ?? "");
    case "not_equals":
      return answerStr !== (value ?? "");
    case "contains":
      return answerStr.includes(value ?? "");
    case "is_empty":
      return !answerStr || answerStr.length === 0;
    case "is_not_empty":
      return !!(answerStr && answerStr.length > 0);
    default:
      return true;
  }
}
