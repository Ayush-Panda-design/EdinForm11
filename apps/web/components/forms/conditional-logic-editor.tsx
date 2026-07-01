"use client";

import { useState } from "react";
import { GitBranch, Zap } from "lucide-react";

export type ConditionalLogic = {
  showIf?: {
    fieldId: string;
    operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";
    value?: string;
  };
};

type SimpleField = {
  id: string;
  label: string;
  type: string;
  order: number;
  options?: { value: string; label: string }[] | null;
};

interface ConditionalLogicEditorProps {
  fieldId: string;
  currentLogic: ConditionalLogic | null | undefined;
  availableFields: SimpleField[];
  onChange: (logic: ConditionalLogic | null) => void;
}

const OPERATORS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "contains", label: "contains" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];

const VALUE_OPERATORS = ["equals", "not_equals", "contains"];

export function ConditionalLogicEditor({
  fieldId,
  currentLogic,
  availableFields,
  onChange,
}: ConditionalLogicEditorProps) {
  const [enabled, setEnabled] = useState(!!currentLogic?.showIf);
  const [sourceFieldId, setSourceFieldId] = useState(currentLogic?.showIf?.fieldId ?? "");
  const [operator, setOperator] = useState<string>(currentLogic?.showIf?.operator ?? "equals");
  const [value, setValue] = useState(currentLogic?.showIf?.value ?? "");

  const eligibleFields = availableFields.filter((f) => f.id !== fieldId);

  const handleToggle = (on: boolean) => {
    setEnabled(on);
    if (!on) {
      onChange(null);
    } else if (eligibleFields.length > 0) {
      const first = eligibleFields[0];
      if (first) {
        setSourceFieldId(first.id);
        onChange({ showIf: { fieldId: first.id, operator: "equals", value: "" } });
      }
    }
  };

  const handleUpdate = (
    newSourceFieldId = sourceFieldId,
    newOperator = operator,
    newValue = value
  ) => {
    if (!newSourceFieldId) return;
    const needsValue = VALUE_OPERATORS.includes(newOperator);
    onChange({
      showIf: {
        fieldId: newSourceFieldId,
        operator: newOperator as NonNullable<ConditionalLogic["showIf"]>["operator"],
        value: needsValue ? newValue : undefined,
      },
    });
  };

  const sourceField = eligibleFields.find((f) => f.id === sourceFieldId);

  if (eligibleFields.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700">
        <GitBranch className="w-4 h-4 text-gray-400" />
        <p className="text-xs text-gray-400">Add more fields above this one to use conditional logic</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <GitBranch className="w-4 h-4 text-stone-500" />
          Conditional Logic
        </div>
        <button
          type="button"
          onClick={() => handleToggle(!enabled)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
            enabled ? "bg-stone-900" : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-4.5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="pl-4 border-l-2 border-stone-200 dark:border-stone-900 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Show this field only if:</p>

          <select
            value={sourceFieldId}
            onChange={(e) => {
              setSourceFieldId(e.target.value);
              handleUpdate(e.target.value, operator, value);
            }}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500"
          >
            <option value="">Select a field...</option>
            {eligibleFields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.order + 1}. {f.label}
              </option>
            ))}
          </select>

          {sourceFieldId && (
            <select
              value={operator}
              onChange={(e) => {
                setOperator(e.target.value);
                handleUpdate(sourceFieldId, e.target.value, value);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500"
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          )}

          {sourceFieldId && VALUE_OPERATORS.includes(operator) && (
            <>
              {sourceField?.options && sourceField.options.length > 0 ? (
                <select
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    handleUpdate(sourceFieldId, operator, e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500"
                >
                  <option value="">Any value</option>
                  {sourceField.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    handleUpdate(sourceFieldId, operator, e.target.value);
                  }}
                  placeholder="Value to compare..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-500"
                />
              )}
            </>
          )}

          {sourceFieldId && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900/20 border border-stone-100 dark:border-stone-900/50">
              <Zap className="w-3.5 h-3.5 text-stone-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-stone-900 dark:text-stone-300">
                Show if <strong>{eligibleFields.find((f) => f.id === sourceFieldId)?.label}</strong>{" "}
                <em>{OPERATORS.find((o) => o.value === operator)?.label}</em>
                {VALUE_OPERATORS.includes(operator) && value ? (
                  <> <strong>&ldquo;{value}&rdquo;</strong></>
                ) : ""}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
