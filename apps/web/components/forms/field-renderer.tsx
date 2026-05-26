"use client";

import { Star } from "lucide-react";

export type FieldOption = { value: string; label: string };
export type FormField = {
  id: string;
  type: string;
  label: string;
  placeholder?: string | null;
  helpText?: string | null;
  required: boolean;
  order: number;
  options?: FieldOption[] | null;
  validationRules?: Record<string, unknown> | null;
  conditionalLogic?: {
    showIf?: {
      fieldId: string;
      operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";
      value?: string;
    };
  } | null;
};

interface FieldRendererProps {
  field: FormField;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  readOnly?: boolean;
}

export function FieldRenderer({ field, value, onChange, readOnly }: FieldRendererProps) {
  const strVal = Array.isArray(value) ? "" : (value ?? "");
  const arrVal = Array.isArray(value) ? value : [];

  const inputClass =
    "w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-stone-500 dark:focus:border-stone-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

  if (field.type === "short_text") {
    return (
      <input
        type="text"
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? "Your answer..."}
        disabled={readOnly}
        className={inputClass}
      />
    );
  }

  if (field.type === "long_text") {
    return (
      <textarea
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? "Your answer..."}
        rows={4}
        disabled={readOnly}
        className={inputClass + " resize-none"}
      />
    );
  }

  if (field.type === "email") {
    return (
      <input
        type="email"
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? "your@email.com"}
        disabled={readOnly}
        className={inputClass}
      />
    );
  }

  if (field.type === "number") {
    return (
      <input
        type="number"
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? "0"}
        disabled={readOnly}
        className={inputClass}
      />
    );
  }

  if (field.type === "date") {
    return (
      <input
        type="date"
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        className={inputClass}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
            strVal === "true"
              ? "bg-stone-900 border-stone-900"
              : "border-gray-300 dark:border-gray-600 group-hover:border-stone-400"
          }`}
          onClick={() => !readOnly && onChange(strVal === "true" ? "false" : "true")}
        >
          {strVal === "true" && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-gray-700 dark:text-gray-300">Yes</span>
      </label>
    );
  }

  if (field.type === "rating") {
    const maxStars = (field.validationRules as any)?.maxRating ?? 5;
    return (
      <div className="flex gap-2">
        {Array.from({ length: maxStars }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => !readOnly && onChange(String(n))}
            className="focus:outline-none transition-all hover:scale-110 active:scale-95"
            disabled={readOnly}
          >
            <Star
              className={`w-9 h-9 transition-colors ${
                Number(strVal) >= n
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300 dark:text-gray-600 hover:text-amber-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  }

  if (field.type === "single_select" && field.options) {
    return (
      <div className="space-y-2">
        {field.options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all ${
              strVal === opt.value
                ? "border-stone-500 bg-stone-50 dark:bg-stone-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-stone-300 dark:hover:border-stone-900"
            } ${readOnly ? "cursor-not-allowed" : ""}`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                strVal === opt.value ? "border-stone-500" : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {strVal === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-stone-500" />}
            </div>
            <input
              type="radio"
              name={"field_" + field.id}
              value={opt.value}
              checked={strVal === opt.value}
              onChange={() => !readOnly && onChange(opt.value)}
              className="sr-only"
            />
            <span className="text-gray-800 dark:text-gray-200">{opt.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "multi_select" && field.options) {
    return (
      <div className="space-y-2">
        {field.options.map((opt) => {
          const selected = arrVal.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all ${
                selected
                  ? "border-stone-500 bg-stone-50 dark:bg-stone-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-stone-300 dark:hover:border-stone-900"
              } ${readOnly ? "cursor-not-allowed" : ""}`}
            >
              <div
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected ? "bg-stone-900 border-stone-900" : "border-gray-300 dark:border-gray-600"
                }`}
                onClick={() => {
                  if (readOnly) return;
                  onChange(selected ? arrVal.filter((v) => v !== opt.value) : [...arrVal, opt.value]);
                }}
              >
                {selected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-gray-800 dark:text-gray-200">{opt.label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  return <p className="text-gray-400 italic text-sm">Unknown field type: {field.type}</p>;
}

/** Evaluate conditional logic for a field */
export function shouldShowField(
  field: FormField,
  answers: Record<string, string | string[]>
): boolean {
  const logic = field.conditionalLogic;
  if (!logic?.showIf) return true;

  const { fieldId, operator, value } = logic.showIf;
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
