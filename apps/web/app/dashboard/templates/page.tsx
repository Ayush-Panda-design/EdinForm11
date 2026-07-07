"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { ArrowLeft, Clock, Layers, Loader2, Search, Sparkles, CheckCircle2 } from "lucide-react";
import { HelpTip } from "~/components/help/help-tip";

export default function TemplatesPage() {
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const { data, isLoading } = trpc.templates.list.useQuery({
    category: category === "All" ? undefined : category,
    search: search || undefined,
    page: 1,
    limit: 24,
  });

  const useTemplate = trpc.templates.useTemplate.useMutation({
    onSuccess: (res) => {
      toast.success("Form created from template");
      router.push(`/dashboard/forms/${res.formId}/edit`);
    },
    onError: (e) => toast.error(e.message),
  });

  const preview = data?.data.find((t) => t.id === previewId) ?? null;
  const categories = data?.categories ?? ["All"];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/dashboard/forms/new"
          className="ef-btn-ghost w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold dash-faint mb-1">
            Templates
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-normal tracking-tight dash-text">
              Start from a use case
            </h1>
            <HelpTip section="templates" size="md" />
          </div>
          <p className="mt-1 text-sm dash-muted">
            Pick a polished template — fields, copy, and settings are ready. Customize in the
            builder.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dash-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="ef-input w-full rounded-xl pl-9 pr-3 py-2.5 text-sm"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className="shrink-0 px-3 py-2 rounded-full text-xs font-medium border transition-colors"
              style={{
                borderColor: category === c ? "var(--dash-accent)" : "var(--dash-border)",
                background: category === c ? "var(--dash-accent-soft)" : "var(--dash-card)",
                color: category === c ? "var(--dash-accent)" : "var(--dash-muted)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin dash-accent" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.data.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPreviewId(t.id)}
                className="form-card text-left p-0 overflow-hidden"
                style={{
                  borderColor: previewId === t.id ? "var(--dash-accent)" : "var(--dash-border)",
                  boxShadow:
                    previewId === t.id ? "0 0 0 1px var(--dash-accent)" : "var(--dash-shadow)",
                }}
              >
                <div
                  className="h-20 flex items-end p-3"
                  style={{ background: "var(--dash-accent-soft)" }}
                >
                  <span className="kpi-chip">{t.category ?? "General"}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold dash-text">{t.name}</h3>
                    {t.isBuiltin && <Sparkles className="w-3.5 h-3.5 dash-accent shrink-0" />}
                  </div>
                  <p className="text-xs dash-muted mt-1 line-clamp-2">{t.description}</p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] dash-faint">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-3 h-3" /> {t.fieldCount ?? "—"} fields
                    </span>
                    {t.estimatedMinutes != null && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ~{t.estimatedMinutes} min
                      </span>
                    )}
                  </div>
                  {t.tags && t.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {t.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            background: "var(--dash-bg)",
                            color: "var(--dash-muted)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <aside className="ef-bento lg:sticky lg:top-6" style={{ minHeight: 280 }}>
            {preview ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider dash-faint font-semibold">
                    Preview
                  </p>
                  <h2 className="text-lg font-semibold dash-text mt-1">{preview.name}</h2>
                  <p className="text-sm dash-muted mt-1">{preview.description}</p>
                </div>

                {preview.formSnapshot?.fields && (
                  <ol className="space-y-2">
                    {preview.formSnapshot.fields.map(
                      (f: { label: string; type: string; required: boolean }, i: number) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm rounded-lg p-2.5"
                          style={{ background: "var(--dash-bg)" }}
                        >
                          <span className="text-xs font-semibold dash-accent mt-0.5">{i + 1}.</span>
                          <div>
                            <p className="dash-text font-medium leading-snug">{f.label}</p>
                            <p className="text-[11px] dash-faint mt-0.5">
                              {f.type.replace(/_/g, " ")}
                              {f.required ? " · required" : ""}
                            </p>
                          </div>
                        </li>
                      ),
                    )}
                  </ol>
                )}

                <button
                  type="button"
                  disabled={useTemplate.isPending}
                  onClick={() => useTemplate.mutate({ id: preview.id })}
                  className="ef-btn-primary w-full rounded-full py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2"
                >
                  {useTemplate.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Use this template
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-8 h-8 mx-auto mb-3 dash-faint" />
                <p className="text-sm font-medium dash-text">Select a template</p>
                <p className="text-xs dash-muted mt-1">
                  Preview questions before you create the form.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
