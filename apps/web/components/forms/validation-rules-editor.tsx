"use client";

import type { ValidationRules } from "@repo/types/forms";

type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "single_select"
  | "multi_select"
  | "checkbox"
  | "date"
  | "rating";

interface ValidationRulesEditorProps {
  fieldType: FieldType;
  rules: ValidationRules | null;
  onChange: (rules: ValidationRules | null) => void;
}

function numOrUndef(v: string): number | undefined {
  const n = parseFloat(v);
  return v === "" || Number.isNaN(n) ? undefined : n;
}

export function ValidationRulesEditor({ fieldType, rules, onChange }: ValidationRulesEditorProps) {
  const r = rules ?? {};

  const update = (patch: Partial<ValidationRules>) => {
    const next = { ...r, ...patch };
    const cleaned = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== undefined && v !== ""),
    ) as ValidationRules;
    onChange(Object.keys(cleaned).length > 0 ? cleaned : null);
  };

  const labelClass = "block text-xs font-medium mb-1";
  const inputClass = "ef-input w-full px-3 py-2 rounded-lg text-sm";

  const showTextRules = ["short_text", "long_text", "email"].includes(fieldType);
  const showNumberRules = fieldType === "number";
  const showRatingRules = fieldType === "rating";
  const showMultiSelectRules = fieldType === "multi_select";

  if (!showTextRules && !showNumberRules && !showRatingRules && !showMultiSelectRules) {
    return null;
  }

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ border: "1px solid var(--border)", background: "var(--muted)" }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--muted-foreground)" }}
      >
        Validation rules
      </p>

      {showTextRules && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} style={{ color: "var(--muted-foreground)" }}>
              Min length
            </label>
            <input
              type="number"
              min={0}
              value={r.minLength ?? ""}
              onChange={(e) => update({ minLength: numOrUndef(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--muted-foreground)" }}>
              Max length
            </label>
            <input
              type="number"
              min={0}
              value={r.maxLength ?? ""}
              onChange={(e) => update({ maxLength: numOrUndef(e.target.value) })}
              className={inputClass}
            />
          </div>
          {fieldType !== "email" && (
            <div className="col-span-2">
              <label className={labelClass} style={{ color: "var(--muted-foreground)" }}>
                Pattern (regex)
              </label>
              <input
                value={r.pattern ?? ""}
                onChange={(e) => update({ pattern: e.target.value || undefined })}
                placeholder="e.g. ^[A-Za-z]+$"
                className={inputClass}
              />
            </div>
          )}
        </div>
      )}

      {showNumberRules && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} style={{ color: "var(--muted-foreground)" }}>
              Min value
            </label>
            <input
              type="number"
              value={r.min ?? ""}
              onChange={(e) => update({ min: numOrUndef(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--muted-foreground)" }}>
              Max value
            </label>
            <input
              type="number"
              value={r.max ?? ""}
              onChange={(e) => update({ max: numOrUndef(e.target.value) })}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {showRatingRules && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} style={{ color: "var(--muted-foreground)" }}>
              Min rating
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={r.minRating ?? ""}
              onChange={(e) => update({ minRating: numOrUndef(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--muted-foreground)" }}>
              Max rating
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={r.maxRating ?? ""}
              onChange={(e) => update({ maxRating: numOrUndef(e.target.value) })}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {showMultiSelectRules && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} style={{ color: "var(--muted-foreground)" }}>
              Min selections
            </label>
            <input
              type="number"
              min={0}
              value={r.min ?? ""}
              onChange={(e) => update({ min: numOrUndef(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--muted-foreground)" }}>
              Max selections
            </label>
            <input
              type="number"
              min={0}
              value={r.max ?? ""}
              onChange={(e) => update({ max: numOrUndef(e.target.value) })}
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  );
}
