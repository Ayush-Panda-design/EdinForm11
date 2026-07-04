"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight, LayoutTemplate, Sparkles } from "lucide-react";
import Link from "next/link";
import { HelpTip } from "~/components/help/help-tip";

const schema = z.object({
  title: z.string().min(1, "Title required").max(300),
  description: z.string().max(2000).optional(),
  allowMultipleResponses: z.boolean(),
  showProgressBar: z.boolean(),
  submitButtonText: z.string().optional(),
  successMessage: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-10 h-6 rounded-full border-0 cursor-pointer shrink-0 transition-colors"
      style={{ background: checked ? "var(--dash-accent)" : "var(--dash-border)" }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
        style={{ left: checked ? "18px" : "2px" }}
      />
    </button>
  );
}

export default function NewFormPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      allowMultipleResponses: true,
      showProgressBar: true,
      submitButtonText: "Submit",
      successMessage: "Thank you for your time.",
    },
  });

  const allowMultiple = watch("allowMultipleResponses") ?? true;
  const showProgress = watch("showProgressBar") ?? true;

  const createForm = trpc.forms.create.useMutation({
    onSuccess: (data) => {
      toast.success("Form created!");
      router.push("/dashboard/forms/" + data.id + "/edit");
    },
    onError: (e) => toast.error(e.message),
  });

  const { data: templates } = trpc.templates.list.useQuery({ page: 1, limit: 4 });

  const useTemplate = trpc.templates.useTemplate.useMutation({
    onSuccess: (res) => {
      toast.success("Form created from template");
      router.push(`/dashboard/forms/${res.formId}/edit`);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="max-w-xl mx-auto pt-4 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm"
        style={{ color: "var(--dash-muted)" }}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-normal tracking-tight dash-text">Create a form</h1>
          <HelpTip section="create" size="md" />
        </div>
        <p className="text-sm dash-muted">Start blank or pick a template.</p>
      </div>

      <Link
        href="/dashboard/templates"
        className="form-card flex items-center gap-4 p-4 no-underline"
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--dash-accent-soft)", color: "var(--dash-accent)" }}
        >
          <LayoutTemplate className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold dash-text">Browse template gallery</p>
          <p className="text-xs dash-muted mt-0.5">
            NPS, RSVP, job application, bug report, and more
          </p>
        </div>
        <ArrowRight className="w-4 h-4 dash-faint" />
      </Link>

      {templates && templates.data.length > 0 && (
        <div>
          <p className="text-xs font-medium dash-faint mb-2 inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Popular templates
          </p>
          <div className="grid grid-cols-2 gap-2">
            {templates.data.slice(0, 4).map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={useTemplate.isPending}
                onClick={() => useTemplate.mutate({ id: t.id })}
                className="ef-bento !p-3 text-left"
              >
                <p className="text-sm font-medium dash-text truncate">{t.name}</p>
                <p className="text-[11px] dash-faint mt-0.5">{t.fieldCount} fields</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit((d) => createForm.mutate(d))} className="space-y-4">
        <div className="ef-bento space-y-5">
          <p className="text-xs font-medium dash-faint">Or start blank</p>
          <label className="block">
            <span className="text-sm font-medium dash-text block mb-2">Form title</span>
            <input
              {...register("title")}
              autoFocus
              placeholder="Form title"
              className="ef-input w-full rounded-lg px-3 py-2.5 text-base"
            />
            {errors.title && <p className="text-xs text-red-600 mt-1.5">{errors.title.message}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium dash-text block mb-2">Description (optional)</span>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Form description"
              className="ef-input w-full rounded-lg px-3 py-2.5 text-sm resize-none"
            />
          </label>
        </div>

        <div className="ef-bento space-y-0">
          {[
            {
              key: "allowMultipleResponses" as const,
              checked: allowMultiple,
              title: "Allow multiple responses",
            },
            {
              key: "showProgressBar" as const,
              checked: showProgress,
              title: "Show progress bar",
            },
          ].map(({ key, checked, title }, i) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 py-3"
              style={{ borderTop: i === 0 ? "none" : "1px solid var(--dash-border)" }}
            >
              <p className="text-sm dash-text">{title}</p>
              <Toggle checked={checked} onChange={(v) => setValue(key, v)} />
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard"
            className="ef-btn-ghost flex-1 rounded-full py-2.5 text-sm font-medium text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createForm.isPending}
            className="ef-btn-primary flex-[2] rounded-full py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {createForm.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating…
              </>
            ) : (
              <>
                Create blank form <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
