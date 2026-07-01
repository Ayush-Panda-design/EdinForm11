"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import {
  Loader2, ArrowLeft, ArrowRight, BookOpen, ListOrdered,
  Lightbulb, HelpCircle, PenLine, Share2, Layers, Sparkles,
  CheckCircle2, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import {
  DashboardPage,
  DashboardBtnLink,
  DashboardAnimatedSection,
} from "~/components/dashboard/primitives";
import { NewFormHeroIllustration } from "~/components/dashboard/new-form-visuals";

const ACCENT = "var(--dt-accent)";

const schema = z.object({
  title: z.string().min(1, "Title required").max(300),
  description: z.string().max(2000).optional(),
  allowMultipleResponses: z.boolean().default(true),
  showProgressBar: z.boolean().default(true),
  submitButtonText: z.string().optional(),
  successMessage: z.string().optional(),
});

const FIELD_GUIDE = [
  {
    term: "Form title",
    definition: "The headline respondents see first. Keep it short and specific — e.g. \"Q2 Team Feedback\" rather than \"Form 1\".",
  },
  {
    term: "Description",
    definition: "Optional context shown below the title. Explain why you're collecting responses and how long it takes (\"2 minutes, 5 questions\").",
  },
  {
    term: "Multiple responses",
    definition: "When enabled, the same person can submit more than once. Turn off for elections, one-time registrations, or unique entries.",
  },
  {
    term: "Progress bar",
    definition: "Shows respondents how far through the form they are. Recommended for forms with more than 3 questions — it reduces abandonment.",
  },
  {
    term: "Submit & success text",
    definition: "Customise the button label (\"Send feedback\") and the thank-you message shown after submission. Defaults work fine if you leave them blank.",
  },
] as const;

const CREATION_STEPS = [
  {
    step: 1,
    title: "Fill in the basics here",
    body: "Give your form a clear title and optional description. These appear on the public form page before anyone answers a question.",
  },
  {
    step: 2,
    title: "Create & open the editor",
    body: "Click \"Create & add fields\" to save a draft and jump straight into the form builder, where you add questions, branching, and layout options.",
  },
  {
    step: 3,
    title: "Add your questions",
    body: "Drag in text, choice, rating, and other field types. Use one-question-at-a-time mode for higher completion rates on longer forms.",
  },
  {
    step: 4,
    title: "Preview & publish",
    body: "Preview how respondents will see the form, then publish as Public or Unlisted. You'll get a shareable link and QR code instantly.",
  },
  {
    step: 5,
    title: "Share & track analytics",
    body: "Distribute the link, then watch views and submissions in Analytics. Open per-form analytics for field-level breakdowns.",
  },
] as const;

const TIPS = [
  {
    title: "Start small",
    body: "Three to five questions on your first draft is enough. You can always add more after testing with colleagues.",
  },
  {
    title: "Write for respondents",
    body: "Use plain language in titles and descriptions. Tell people what happens with their answers and how long it takes.",
  },
  {
    title: "Test before sharing widely",
    body: "Submit a test response yourself after publishing, then check it appears in your responses tab and analytics.",
  },
];

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted-foreground)] font-medium">
        {children}
      </p>
      {hint && (
        <p className="text-[11px] text-[var(--muted-foreground)] mt-1 leading-relaxed opacity-90">{hint}</p>
      )}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 w-[42px] h-6 rounded-full border-none cursor-pointer transition-colors"
      style={{
        background: checked
          ? "linear-gradient(180deg, color-mix(in srgb, var(--dt-accent) 85%, #fff) 0%, var(--dt-accent) 100%)"
          : "var(--input)",
      }}
    >
      <span
        className="absolute top-[3px] block w-[18px] h-[18px] rounded-full transition-[left] duration-200"
        style={{
          left: checked ? 21 : 3,
          background: checked ? "#14110C" : "rgba(255,255,255,0.5)",
        }}
      />
    </button>
  );
}

function FormCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("rounded-2xl border p-6 sm:p-7", className)}
      style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}
    >
      {children}
    </div>
  );
}

export default function NewFormPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { allowMultipleResponses: true, showProgressBar: true },
  });

  const allowMultiple = watch("allowMultipleResponses") ?? true;
  const showProgress = watch("showProgressBar") ?? true;
  const titleValue = watch("title") ?? "";

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const inputClass = (name: string) =>
    cn(
      "w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm text-[var(--foreground)] outline-none transition-all dt-input",
      "bg-[var(--input)] border",
      focusedField === name
        ? "border-[var(--dt-accent-border)] shadow-[0_0_0_3px_var(--dt-accent-soft)] bg-[var(--surface-1)]"
        : "border-[var(--border)]"
    );

  const createForm = trpc.forms.create.useMutation({
    onSuccess: (data) => {
      toast.success("Form created!");
      router.push("/dashboard/forms/" + data.id + "/edit");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <DashboardPage wide className="space-y-8">
      {/* ── Hero ── */}
      <DashboardAnimatedSection animation="fade-up">
      <section
        className="relative overflow-hidden rounded-3xl border dt-anim-shimmer"
        style={{
          borderColor: "var(--dt-card-border)",
          background: "linear-gradient(135deg, var(--dt-card-bg) 0%, color-mix(in srgb, var(--dt-accent) 8%, var(--dt-main-bg)) 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: "var(--dt-main-gradient)" }} />
        <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 p-6 sm:p-8 lg:p-10">
          <div className="min-w-0 z-[1]">
            <div className="flex items-start gap-3 mb-4">
              <Link
                href="/dashboard"
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-1 transition-colors"
                style={{
                  background: "var(--dt-accent-soft)",
                  border: "1px solid var(--dt-accent-border)",
                  color: "var(--muted-foreground)",
                }}
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted-foreground)] mb-1">New Form</p>
                <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-tight text-[var(--foreground)]">
                  Draft a new <em className="not-italic" style={{ color: ACCENT }}>form</em>
                </h1>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed mb-2">
              Set up the basics below — title, description, and behaviour settings. When you&apos;re ready, we&apos;ll open the editor so you can add questions, branching, and share settings.
            </p>
            <p className="text-xs text-[var(--muted-foreground)] max-w-lg leading-relaxed opacity-90">
              This step takes about a minute. Your form is saved as a <strong className="text-[var(--foreground)] font-medium">draft</strong> until you publish it, so you can iterate safely before going live.
            </p>
          </div>
          <div className="hidden lg:flex items-center justify-center w-[min(100%,320px)] dt-anim-float">
            <NewFormHeroIllustration className="w-full max-w-[300px] h-auto opacity-90" />
          </div>
        </div>
      </section>
      </DashboardAnimatedSection>

      {/* ── Guide + glossary (above form on mobile) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section
          className="rounded-3xl border p-6 sm:p-7 dt-hover-lift dt-anim-slide-in"
          style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}
        >
          <div className="flex items-start gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-accent-border)" }}
            >
              <ListOrdered className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h2 className="font-display text-lg text-[var(--foreground)]">What happens next</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                The full journey from blank draft to collecting responses — five steps.
              </p>
            </div>
          </div>
          <ol className="space-y-4">
            {CREATION_STEPS.map(({ step, title, body }) => (
              <li key={step} className="flex gap-4">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "var(--dt-accent-soft)", color: ACCENT, border: "1px solid var(--dt-accent-border)" }}
                >
                  {step}
                </span>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)] mb-1">{title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="rounded-3xl border p-6 sm:p-7 dt-hover-lift dt-anim-slide-in"
          style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}
        >
          <div className="flex items-start gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-accent-border)" }}
            >
              <BookOpen className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h2 className="font-display text-lg text-[var(--foreground)]">Field guide</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                What each setting on this page does and when to use it.
              </p>
            </div>
          </div>
          <dl className="space-y-4">
            {FIELD_GUIDE.map(({ term, definition }) => (
              <div key={term}>
                <dt className="text-sm font-medium text-[var(--foreground)] mb-1">{term}</dt>
                <dd className="text-xs text-[var(--muted-foreground)] leading-relaxed">{definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* ── Tips ── */}
      <section
        className="rounded-3xl border p-6 sm:p-7"
        style={{
          background: "linear-gradient(135deg, var(--dt-accent-soft) 0%, var(--dt-card-bg) 50%)",
          borderColor: "var(--dt-accent-border)",
        }}
      >
        <div className="flex items-start gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--dt-card-bg)", border: "1px solid var(--dt-accent-border)" }}
          >
            <Lightbulb className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <div>
            <h2 className="font-display text-lg text-[var(--foreground)]">Tips for a great first form</h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
              Practical advice before you hit create — saves time in the editor later.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIPS.map((tip) => (
            <div
              key={tip.title}
              className="rounded-2xl p-5"
              style={{ background: "var(--dt-card-bg)", border: "1px solid var(--dt-card-border)" }}
            >
              <p className="text-sm font-medium text-[var(--foreground)] mb-2">{tip.title}</p>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{tip.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form + live preview sidebar ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
        <form onSubmit={handleSubmit((d) => createForm.mutate(d))} className="space-y-5">
          <FormCard>
            <div className="flex items-center gap-2 mb-5">
              <PenLine className="w-4 h-4" style={{ color: ACCENT }} />
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Step 1 of 2</p>
                <h2 className="font-display text-lg text-[var(--foreground)]">Basic info</h2>
              </div>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-6">
              This is what respondents see at the top of your form. A strong title improves open rates when you share the link.
            </p>

            <div className="space-y-5">
              <div>
                <Label hint="Required — appears as the main heading on your public form.">
                  Form title *
                </Label>
                <input
                  {...register("title")}
                  placeholder="e.g. Morning survey, Team feedback…"
                  className={inputClass("title")}
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.title && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label hint="Optional — helps respondents understand purpose before they start.">
                  Description
                </Label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Tell respondents what this form is about…"
                  className={cn(inputClass("description"), "resize-none leading-relaxed")}
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </FormCard>

          <FormCard>
            <div className="flex items-center gap-2 mb-5">
              <Layers className="w-4 h-4" style={{ color: ACCENT }} />
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Step 2 of 2</p>
                <h2 className="font-display text-lg text-[var(--foreground)]">Behaviour & messaging</h2>
              </div>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-6">
              Control how respondents interact with the form. You can change all of these later in the editor.
            </p>

            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {[
                {
                  key: "allowMultipleResponses" as const,
                  checked: allowMultiple,
                  title: "Allow multiple responses",
                  sub: "Same person can submit more than once — useful for recurring feedback or open surveys.",
                },
                {
                  key: "showProgressBar" as const,
                  checked: showProgress,
                  title: "Show progress bar",
                  sub: "Displays completion progress to respondents — recommended for forms with 4+ questions.",
                },
              ].map(({ key, checked, title, sub }) => (
                <div key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm text-[var(--foreground)] mb-0.5">{title}</p>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{sub}</p>
                  </div>
                  <Toggle checked={checked} onChange={(v) => setValue(key, v)} />
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
              <div>
                <Label hint='Leave blank to use "Submit".'>Submit button text</Label>
                <input
                  {...register("submitButtonText")}
                  placeholder="Submit"
                  className={inputClass("submitButtonText")}
                  onFocus={() => setFocusedField("submitButtonText")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              <div>
                <Label hint="Shown after a successful submission.">Success message</Label>
                <input
                  {...register("successMessage")}
                  placeholder="Thank you for your time."
                  className={inputClass("successMessage")}
                  onFocus={() => setFocusedField("successMessage")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </FormCard>

          <div className="flex flex-col sm:flex-row gap-3">
            <DashboardBtnLink href="/dashboard" variant="ghost" className="flex-1 justify-center py-3">
              Cancel
            </DashboardBtnLink>
            <button
              type="submit"
              disabled={createForm.isPending}
              className="dt-btn-primary flex-[2] justify-center py-3 gap-2 rounded-full text-sm font-medium disabled:opacity-60"
              style={{
                background: "var(--dt-accent)",
                color: "var(--dt-btn-primary-fg, #14110C)",
                border: "1px solid var(--dt-accent-border)",
              }}
            >
              {createForm.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
              ) : (
                <>Create &amp; add fields <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed flex items-start gap-2">
            <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: ACCENT }} />
            <span>
              After creating, you&apos;ll land in the <strong className="text-[var(--foreground)] font-medium">form editor</strong> to add questions.
              Nothing is public until you explicitly publish.
            </span>
          </p>
        </form>

        {/* Live preview sidebar */}
        <aside className="xl:sticky xl:top-6 space-y-5">
          <div
            className="rounded-3xl border p-6 overflow-hidden"
            style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" style={{ color: ACCENT }} />
              <p className="text-sm font-medium text-[var(--foreground)]">Live preview</p>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)] mb-4 leading-relaxed">
              A rough idea of how your form header will look to respondents.
            </p>
            <div
              className="rounded-2xl p-5 border"
              style={{ background: "var(--dt-main-bg)", borderColor: "var(--border)" }}
            >
              <p className="font-display text-xl text-[var(--foreground)] mb-2 leading-snug">
                {titleValue.trim() || "Your form title"}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-4">
                {watch("description")?.trim() || "Description will appear here if you add one."}
              </p>
              <div
                className="h-8 rounded-lg flex items-center justify-center text-xs font-medium"
                style={{ background: "var(--dt-accent)", color: "var(--dt-btn-primary-fg, #14110C)" }}
              >
                {watch("submitButtonText")?.trim() || "Submit"}
              </div>
              {showProgress && (
                <div className="mt-4">
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--dt-accent-soft)" }}>
                    <div className="h-full w-1/3 rounded-full" style={{ background: ACCENT }} />
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Progress bar enabled</p>
                </div>
              )}
            </div>
          </div>

          <div
            className="rounded-3xl border p-5"
            style={{ background: "var(--dt-accent-soft)", borderColor: "var(--dt-accent-border)" }}
          >
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-3">After publish</p>
            <ul className="space-y-2.5 text-xs text-[var(--muted-foreground)]">
              <li className="flex items-start gap-2">
                <Share2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: ACCENT }} />
                Share link or QR code from the editor
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: ACCENT }} />
                Responses appear in your dashboard instantly
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: ACCENT }} />
                <Link href="/dashboard/analytics" className="hover:underline" style={{ color: ACCENT }}>
                  Track trends in Analytics
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </DashboardPage>
  );
}
