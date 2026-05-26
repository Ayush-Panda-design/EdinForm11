"use client";

import { use, useState, useEffect, useCallback } from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle, ChevronRight, ChevronLeft, ChevronDown, Lock } from "lucide-react";
import { FieldRenderer, shouldShowField, type FormField } from "~/components/forms/field-renderer";

export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [currentStep, setCurrentStep] = useState(-1); // -1 = cover screen
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  // Password gate state
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  const { data: form, isLoading, error } = trpc.public.getFormBySlug.useQuery({ slug });
  const verifyPasswordMutation = trpc.public.verifyFormPassword.useMutation();
  // For password-protected forms after verification, re-fetch with password
  const { data: unlockedForm, refetch: refetchWithPassword } = trpc.public.getFormBySlug.useQuery(
    { slug, password: passwordInput },
    { enabled: false }
  );

  const submitMutation = trpc.responses.submit.useMutation({
    onSuccess: (data) => {
      setSuccessMsg(data.successMessage);
      setSubmitted(true);
    },
    onError: (e) => toast.error(e.message || "Submission failed"),
  });

  // Keyboard navigation
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const el = document.activeElement as HTMLElement;
        if (el.tagName === "TEXTAREA") return;
        e.preventDefault();
        handleNext();
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  });

  const updateAnswer = (fieldId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setValidationError(null);
  };

  const handleVerifyPassword = async () => {
    if (!form || !passwordInput.trim()) {
      setPasswordError("Please enter a password");
      return;
    }
    setVerifyingPassword(true);
    setPasswordError("");
    try {
      const result = await verifyPasswordMutation.mutateAsync({ formId: form.id, password: passwordInput });
      if (result.success) {
        setPasswordVerified(true);
        await refetchWithPassword();
      } else {
        setPasswordError("Incorrect password. Please try again.");
      }
    } catch {
      setPasswordError("Incorrect password. Please try again.");
    } finally {
      setVerifyingPassword(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-stone-950 to-slate-900">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-3 border-stone-400/30 border-t-stone-400 rounded-full animate-spin mx-auto" />
        <p className="text-stone-300 text-sm">Loading form…</p>
      </div>
    </div>
  );

  if (error || !form) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-stone-950 to-slate-900 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-3">Form Not Available</h1>
        <p className="text-slate-400 leading-relaxed">
          {error?.message || "This form doesn't exist or is no longer accepting responses."}
        </p>
        <a href="/" className="inline-block mt-8 text-xs text-stone-400 hover:text-stone-300 transition-colors">
          Powered by EdinForm
        </a>
      </div>
    </div>
  );

  // ─── Password gate ─────────────────────────────────────────────────────────
  if (form.isPasswordProtected && !passwordVerified) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-stone-950 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-500/10 border border-stone-500/20 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-stone-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{form.title}</h1>
          <p className="text-slate-400 text-sm mt-2">This form is password protected</p>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            value={passwordInput}
            onChange={e => { setPasswordInput(e.target.value); setPasswordError(""); }}
            onKeyDown={e => e.key === "Enter" && handleVerifyPassword()}
            placeholder="Enter password"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-stone-500 text-sm"
            autoFocus
          />
          {passwordError && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {passwordError}
            </p>
          )}
          <button
            onClick={handleVerifyPassword}
            disabled={verifyingPassword}
            className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {verifyingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Unlock Form
          </button>
        </div>
        <a href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Powered by EdinForm</a>
      </div>
    </div>
  );

  // Use unlocked form fields if available (after password verification)
  const activeForm = (passwordVerified && unlockedForm) ? unlockedForm : form;

  const visibleFields = activeForm.fields
    .filter((f) => shouldShowField(f as FormField, answers))
    .sort((a, b) => a.order - b.order);

  const totalSteps = visibleFields.length;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = currentStep < 0 ? 0 : Math.round(((currentStep + 1) / totalSteps) * 100);

  const currentField = currentStep >= 0 ? visibleFields[currentStep] : null;

  const validateCurrentStep = (): boolean => {
    if (!currentField) return true;
    if (currentField.required) {
      const ans = answers[currentField.id];
      const isEmpty = ans === undefined || ans === null || ans === "" || ans === "false" ||
        (Array.isArray(ans) && ans.length === 0);
      if (isEmpty) {
        setValidationError(`Please answer "${currentField.label}" before continuing`);
        return false;
      }
      // Email validation
      if (currentField.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(ans))) {
          setValidationError("Please enter a valid email address");
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setValidationError(null);
    if (currentStep === -1) {
      if (totalSteps === 0) {
        handleSubmit();
        return;
      }
      setDirection("forward");
      setCurrentStep(0);
    } else if (isLastStep) {
      handleSubmit();
    } else {
      setDirection("forward");
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setValidationError(null);
    setDirection("back");
    setCurrentStep((s) => Math.max(-1, s - 1));
  };

 const handleSubmit = () => {
  const missingRequired = visibleFields.filter((f) => {
    if (!f.required) return false;
    const ans = answers[f.id];
    return !ans || (Array.isArray(ans) ? ans.length === 0 : ans === "" || ans === "false");
  });
  if (missingRequired.length > 0) {
    const firstMissing = missingRequired[0];
    if (firstMissing) {
      const idx = visibleFields.findIndex((f) => f.id === firstMissing.id);
      setCurrentStep(idx);
      setValidationError(`Please answer "${firstMissing.label}"`);
    }
    return;
  }

  const completionTimeSeconds = Math.round((Date.now() - startTime) / 1000);
  const formattedAnswers = visibleFields
    .map((f) => {
      const raw = answers[f.id];
      if (Array.isArray(raw) && raw.length > 0) {
        return { fieldId: f.id, valueArray: raw as string[] };
      } else if (!Array.isArray(raw) && raw !== undefined && raw !== "" && raw !== null) {
        return { fieldId: f.id, value: String(raw) };
      }
      return null;
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  submitMutation.mutate({
    formId: form.id,
    answers: formattedAnswers,
    completionTimeSeconds,
  });
};

  // ─── Success screen ────────────────────────────────────────────────────────
  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-stone-950 to-slate-900 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">
          {successMsg || "Thank you!"}
        </h1>
        <p className="text-slate-400">Your response has been recorded.</p>
        <a href="/" className="inline-block mt-12 text-xs text-stone-400 hover:text-stone-300 transition-colors">
          Powered by EdinForm
        </a>
      </div>
    </div>
  );

  // ─── Cover screen (step -1) ────────────────────────────────────────────────
  if (currentStep === -1) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-stone-950 to-slate-900 flex flex-col">
      {form.showProgressBar && (
        <div className="h-1 bg-white/5">
          <div className="h-1 bg-gradient-to-r from-stone-500 to-stone-500 w-0 transition-all duration-700" />
        </div>
      )}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-500/10 border border-stone-500/20 text-stone-300 text-xs font-medium mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse" />
            {totalSteps} question{totalSteps !== 1 ? "s" : ""}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-lg text-slate-400 leading-relaxed max-w-md mx-auto">
              {form.description}
            </p>
          )}
          <div className="pt-4 flex flex-col items-center gap-4">
            <button
              onClick={handleNext}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-semibold text-lg hover:bg-stone-50 transition-all shadow-2xl shadow-stone-900/30 hover:shadow-stone-900/50 hover:scale-105 active:scale-100"
            >
              Start
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <p className="text-slate-500 text-xs">Press Enter ↵</p>
          </div>
        </div>
      </div>
      <footer className="text-center py-4">
        <a href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
          Powered by EdinForm
        </a>
      </footer>
    </div>
  );

  // ─── Question screen ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-stone-950 to-slate-900 flex flex-col">
      {/* Progress bar */}
      {form.showProgressBar && (
        <div className="h-1 bg-white/5 flex-shrink-0">
          <div
            className="h-1 bg-gradient-to-r from-stone-500 to-stone-500 transition-all duration-700 ease-out"
            style={{ width: progress + "%" }}
          />
        </div>
      )}

      {/* Top nav */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-slate-500 text-xs font-medium tabular-nums">
          {currentStep + 1} / {totalSteps}
        </div>
      </div>

      {/* Main question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl space-y-6">
          {/* Question number + label */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-stone-400 text-sm font-semibold">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-stone-500/20 text-stone-300 text-xs font-bold">
                {currentStep + 1}
              </span>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
              {currentField?.label}
              {currentField?.required && <span className="text-stone-400 ml-1.5 text-2xl">*</span>}
            </h2>
            {currentField?.helpText && (
              <p className="text-slate-400 text-sm leading-relaxed">{currentField.helpText}</p>
            )}
          </div>

          {/* Field input */}
          <div className="pt-2">
            {currentField && (
              <FieldRenderer
                field={currentField as FormField}
                value={answers[currentField.id] ?? ""}
                onChange={(v) => updateAnswer(currentField.id, v)}
              />
            )}
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {validationError}
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleNext}
              disabled={submitMutation.isPending}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-stone-900 hover:bg-stone-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-stone-900/40 hover:shadow-stone-900/60 hover:scale-105 active:scale-100"
            >
              {submitMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : null}
              {isLastStep
                ? (form.submitButtonText || "Submit")
                : "OK"}
              {!isLastStep && !submitMutation.isPending && (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            <span className="text-slate-500 text-xs">
              press <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-xs font-mono">Enter ↵</kbd>
            </span>
          </div>
        </div>
      </div>

      {/* Scroll hint on mobile for long selects */}
      <footer className="text-center py-4 text-slate-600 text-xs">
        <a href="/" className="hover:text-slate-400 transition-colors">Powered by EdinForm</a>
      </footer>
    </div>
  );
}
