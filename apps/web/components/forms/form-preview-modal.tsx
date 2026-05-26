"use client";

import { useState, useEffect } from "react";
import { X, Eye, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { FieldRenderer, shouldShowField, FormField } from "./field-renderer";

type PreviewForm = {
  title: string;
  description?: string | null;
  fields: FormField[];
  showProgressBar?: boolean;
  submitButtonText?: string | null;
  successMessage?: string | null;
};

interface FormPreviewModalProps {
  form: PreviewForm;
  open: boolean;
  onClose: () => void;
  multiStep?: boolean;
}

export function FormPreviewModal({ form, open, onClose, multiStep = true }: FormPreviewModalProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setAnswers({});
      setCurrentStep(0);
      setSubmitted(false);
    }
  }, [open]);

  if (!open) return null;

  const visibleFields = form.fields
    .filter((f) => shouldShowField(f, answers))
    .sort((a, b) => a.order - b.order);

  const currentField = multiStep ? visibleFields[currentStep] : null;
  const totalSteps = visibleFields.length;
  const progress = totalSteps > 0 ? ((currentStep) / totalSteps) * 100 : 0;

  const updateAnswer = (fieldId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleNext = () => {
    if (currentField?.required) {
      const ans = answers[currentField.id];
      const isEmpty = !ans || (Array.isArray(ans) ? ans.length === 0 : ans === "" || ans === "false");
      if (isEmpty) return;
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg p-10 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X className="w-5 h-5" />
          </button>
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {form.successMessage || "Thank you!"}
          </h2>
          <p className="text-gray-500 mb-8">This is a preview — no data was saved.</p>
          <button onClick={() => { setSubmitted(false); setCurrentStep(0); setAnswers({}); }}
            className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-900 mr-3">
            Restart preview
          </button>
          <button onClick={onClose} className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-900 px-8 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
            <Eye className="w-4 h-4" />
            Preview Mode
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        {form.showProgressBar !== false && multiStep && (
          <div className="h-1 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
            <div
              className="h-1 bg-gradient-to-r from-stone-500 to-stone-500 transition-all duration-500"
              style={{ width: progress + "%" }}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {multiStep ? (
            /* --- Multi-step Typeform style --- */
            <div className="px-10 py-10 min-h-[360px] flex flex-col justify-center">
              {currentStep === 0 && (
                <div className="mb-10">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{form.title}</h1>
                  {form.description && (
                    <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg leading-relaxed">{form.description}</p>
                  )}
                  {totalSteps === 0 && (
                    <p className="text-gray-400 mt-4 italic">No fields added yet.</p>
                  )}
                </div>
              )}

              {currentField && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-semibold uppercase tracking-widest">
                    <span className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-900/30 flex items-center justify-center text-stone-900">
                      {currentStep + 1}
                    </span>
                    <span>of {totalSteps}</span>
                  </div>
                  <label className="block text-xl font-semibold text-gray-900 dark:text-white leading-snug">
                    {currentField.label}
                    {currentField.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {currentField.helpText && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentField.helpText}</p>
                  )}
                  <FieldRenderer
                    field={currentField}
                    value={answers[currentField.id] ?? ""}
                    onChange={(v) => updateAnswer(currentField.id, v)}
                  />
                </div>
              )}
            </div>
          ) : (
            /* --- All fields mode --- */
            <div className="px-8 py-8 space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{form.title}</h1>
                {form.description && <p className="text-gray-500 mt-2">{form.description}</p>}
              </div>
              {visibleFields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.helpText && <p className="text-xs text-gray-500 mb-2">{field.helpText}</p>}
                  <FieldRenderer
                    field={field}
                    value={answers[field.id] ?? ""}
                    onChange={(v) => updateAnswer(field.id, v)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-8 py-4 flex items-center justify-between flex-shrink-0 bg-white dark:bg-gray-900">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={!multiStep || currentStep === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            {!multiStep && (
              <button onClick={() => setCurrentStep(0)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                Reset
              </button>
            )}
            <button
              onClick={multiStep ? handleNext : () => setSubmitted(true)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-stone-900 to-stone-900 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md shadow-stone-200 dark:shadow-stone-900/20"
            >
              {multiStep
                ? currentStep < totalSteps - 1
                  ? (<>Next <ChevronRight className="w-4 h-4" /></>)
                  : (form.submitButtonText || "Submit")
                : (form.submitButtonText || "Submit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
