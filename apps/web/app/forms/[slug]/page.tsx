"use client";

import { use, useState, useEffect } from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  FieldRenderer,
  shouldShowField,
  type FormField,
} from "~/components/forms/field-renderer";

export default function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [answers, setAnswers] = useState<
    Record<string, string | string[]>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [currentStep, setCurrentStep] = useState(-1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  // Password gate
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  const { data: form, isLoading, error } =
    trpc.public.getFormBySlug.useQuery({ slug });

  const verifyPasswordMutation =
    trpc.public.verifyFormPassword.useMutation();

  const {
    data: unlockedForm,
    refetch: refetchWithPassword,
  } = trpc.public.getFormBySlug.useQuery(
    {
      slug,
      password: passwordInput,
    },
    {
      enabled: false,
    }
  );

  const submitMutation = trpc.responses.submit.useMutation({
    onSuccess: (data) => {
      setSuccessMsg(data.successMessage);
      setSubmitted(true);
    },
    onError: (e) =>
      toast.error(e.message || "Submission failed"),
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

  const updateAnswer = (
    fieldId: string,
    value: string | string[]
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

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
      const result =
        await verifyPasswordMutation.mutateAsync({
          formId: form.id,
          password: passwordInput,
        });

      if (result.success) {
        setPasswordVerified(true);
        await refetchWithPassword();
      } else {
        setPasswordError(
          "Incorrect password. Please try again."
        );
      }
    } catch {
      setPasswordError(
        "Incorrect password. Please try again."
      );
    } finally {
      setVerifyingPassword(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,140,255,0.14),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.16),transparent_40%)]" />

        <div className="relative z-10 text-center">
          <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>

          <p className="text-sm text-slate-400 tracking-wide">
            Loading form...
          </p>
        </div>
      </div>
    );

  if (error || !form)
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_40%)]" />

        <div className="relative z-10 max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl border border-red-500/20 bg-red-500/10 flex items-center justify-center mx-auto mb-7">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            Form not available
          </h1>

          <p className="text-slate-400 leading-relaxed">
            {error?.message ||
              "This form doesn't exist or is no longer accepting responses."}
          </p>

          <a
            href="/"
            className="inline-flex items-center gap-2 mt-10 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Powered by EdinForm
          </a>
        </div>
      </div>
    );

  // Password Gate
  if (form.isPasswordProtected && !passwordVerified)
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,140,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_40%)]" />

        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.45)]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center mb-6">
              <Lock className="w-7 h-7 text-blue-300" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              {form.title}
            </h1>

            <p className="text-slate-400 text-sm mb-7 leading-relaxed">
              This form is protected with a password.
            </p>

            <div className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError("");
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleVerifyPassword()
                }
                placeholder="Enter password"
                autoFocus
                className="w-full h-14 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl px-5 text-white placeholder:text-slate-500 outline-none focus:border-blue-400/40 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />

              {passwordError && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </div>
              )}

              <button
                onClick={handleVerifyPassword}
                disabled={verifyingPassword}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold hover:opacity-95 transition-all shadow-[0_10px_30px_rgba(59,130,246,0.35)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifyingPassword ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}

                Unlock Form
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  const activeForm =
    passwordVerified && unlockedForm
      ? unlockedForm
      : form;

  const visibleFields = activeForm.fields
    .filter((f) =>
      shouldShowField(f as FormField, answers)
    )
    .sort((a, b) => a.order - b.order);

  const totalSteps = visibleFields.length;

  const isLastStep =
    currentStep === totalSteps - 1;

  const progress =
    currentStep < 0
      ? 0
      : Math.round(
          ((currentStep + 1) / totalSteps) * 100
        );

  const currentField =
    currentStep >= 0
      ? visibleFields[currentStep]
      : null;

  const validateCurrentStep = (): boolean => {
    if (!currentField) return true;

    if (currentField.required) {
      const ans = answers[currentField.id];

      const isEmpty =
        ans === undefined ||
        ans === null ||
        ans === "" ||
        ans === "false" ||
        (Array.isArray(ans) && ans.length === 0);

      if (isEmpty) {
        setValidationError(
          `Please answer "${currentField.label}" before continuing`
        );

        return false;
      }

      if (currentField.type === "email") {
        const emailRegex =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(String(ans))) {
          setValidationError(
            "Please enter a valid email address"
          );

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

      setCurrentStep(0);
    } else if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setValidationError(null);

    setCurrentStep((s) =>
      Math.max(-1, s - 1)
    );
  };

  const handleSubmit = () => {
    const missingRequired = visibleFields.filter(
      (f) => {
        if (!f.required) return false;

        const ans = answers[f.id];

        return (
          !ans ||
          (Array.isArray(ans)
            ? ans.length === 0
            : ans === "" || ans === "false")
        );
      }
    );

    if (missingRequired.length > 0) {
      const firstMissing = missingRequired[0];

      if (firstMissing) {
        const idx = visibleFields.findIndex(
          (f) => f.id === firstMissing.id
        );

        setCurrentStep(idx);

        setValidationError(
          `Please answer "${firstMissing.label}"`
        );
      }

      return;
    }

    const completionTimeSeconds = Math.round(
      (Date.now() - startTime) / 1000
    );

    const formattedAnswers = visibleFields
      .map((f) => {
        const raw = answers[f.id];

        if (Array.isArray(raw) && raw.length > 0) {
          return {
            fieldId: f.id,
            valueArray: raw as string[],
          };
        } else if (
          !Array.isArray(raw) &&
          raw !== undefined &&
          raw !== "" &&
          raw !== null
        ) {
          return {
            fieldId: f.id,
            value: String(raw),
          };
        }

        return null;
      })
      .filter(
        (a): a is NonNullable<typeof a> =>
          a !== null
      );

    submitMutation.mutate({
      formId: form.id,
      answers: formattedAnswers,
      completionTimeSeconds,
    });
  };

  // Success Screen
  if (submitted)
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_40%)]" />

        <div className="relative z-10 max-w-md text-center">
          <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            {successMsg || "Thank you!"}
          </h1>

          <p className="text-slate-400 text-lg">
            Your response has been recorded.
          </p>

          <a
            href="/"
            className="inline-flex items-center gap-2 mt-12 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Powered by EdinForm
          </a>
        </div>
      </div>
    );

  // Cover Screen
  if (currentStep === -1)
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,140,255,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_40%)]" />

        {form.showProgressBar && (
          <div className="relative z-10 h-1 bg-white/5">
            <div className="h-1 w-0 bg-gradient-to-r from-blue-500 to-violet-500" />
          </div>
        )}

        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.05] text-blue-200 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              {totalSteps} question
              {totalSteps !== 1 ? "s" : ""}
            </div>

            <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
              {form.title}
            </h1>

            {form.description && (
              <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
                {form.description}
              </p>
            )}

            <button
              onClick={handleNext}
              className="group inline-flex items-center gap-3 h-16 px-8 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold text-lg shadow-[0_12px_40px_rgba(59,130,246,0.35)] hover:scale-[1.03] transition-all"
            >
              Start form

              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="mt-5 text-sm text-slate-500">
              Press Enter ↵
            </p>
          </div>
        </div>

        <footer className="relative z-10 text-center py-6">
          <a
            href="/"
            className="text-sm text-slate-600 hover:text-slate-400 transition-colors"
          >
            Powered by EdinForm
          </a>
        </footer>
      </div>
    );

  // Question Screen
  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,140,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_40%)]" />

      {/* Progress */}
      {form.showProgressBar && (
        <div className="relative z-10 h-1 bg-white/5">
          <div
            className="h-1 bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      )}

      {/* Nav */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-sm text-slate-500 font-medium">
          {currentStep + 1} / {totalSteps}
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-8 sm:p-10 shadow-[0_0_60px_rgba(0,0,0,0.45)]">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 text-blue-200 font-bold mb-5">
                {currentStep + 1}
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                {currentField?.label}

                {currentField?.required && (
                  <span className="text-blue-400 ml-2">
                    *
                  </span>
                )}
              </h2>

              {currentField?.helpText && (
                <p className="mt-4 text-slate-400 leading-relaxed">
                  {currentField.helpText}
                </p>
              )}
            </div>

            <div className="mb-7">
              {currentField && (
                <FieldRenderer
                  field={currentField as FormField}
                  value={
                    answers[currentField.id] ?? ""
                  }
                  onChange={(v) =>
                    updateAnswer(
                      currentField.id,
                      v
                    )
                  }
                />
              )}
            </div>

            {validationError && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
                <AlertCircle className="w-4 h-4" />
                {validationError}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleNext}
                disabled={submitMutation.isPending}
                className="group inline-flex items-center gap-2 h-14 px-7 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow-[0_10px_35px_rgba(59,130,246,0.35)] hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLastStep
                      ? form.submitButtonText ||
                        "Submit"
                      : "Continue"}

                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-sm text-slate-500">
                Press Enter ↵
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 text-center py-6">
        <a
          href="/"
          className="text-sm text-slate-600 hover:text-slate-400 transition-colors"
        >
          Powered by EdinForm
        </a>
      </footer>
    </div>
  );
}
