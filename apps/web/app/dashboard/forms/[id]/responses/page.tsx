"use client";

import { use, useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import {
  ArrowLeft,
  Download,
  Loader2,
  User,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [page, setPage] = useState(1);

  const { data: form } = trpc.forms.getById.useQuery({ id });

  const { data: responsesData, isLoading } =
    trpc.responses.list.useQuery({
      formId: id,
      page,
      limit: 20,
    });

  const exportCsv = () => {
    if (!responsesData?.data || !form?.fields) return;

    const headers = [
      "Submitted At",
      "Respondent",
      ...form.fields.map((f) => f.label),
    ];

    const rows = responsesData.data.map((r) => [
      r.submittedAt
        ? new Date(r.submittedAt).toLocaleString()
        : "",
      r.respondentName ||
        r.respondentEmail ||
        "Anonymous",
      ...form.fields.map((f) => {
        const ans = r.answers.find(
          (a) => a.fieldId === f.id
        );

        return (
          ans?.valueArray?.join(", ") ||
          ans?.value ||
          ""
        );
      }),
    ]);

    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((c) =>
            `"${String(c).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download =
      (form.title || "responses") + ".csv";

    a.click();
  };

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Ambient cinematic glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/dashboard/forms/${id}/edit`}
          className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary transition-colors text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-foreground truncate">
            Responses — {form?.title}
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            {responsesData?.total ?? 0} total responses
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border/60 bg-secondary/60 hover:bg-secondary text-sm font-medium text-foreground backdrop-blur-xl transition-all"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : responsesData?.data.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-border/50 bg-background/70 backdrop-blur-xl shadow-sm p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center mx-auto mb-5">
            <User className="w-7 h-7 text-muted-foreground" />
          </div>

          <h2 className="text-lg font-semibold text-foreground mb-2">
            No responses yet
          </h2>

          <p className="text-muted-foreground max-w-md mx-auto">
            Share your form to start collecting responses
            from users.
          </p>

          {form?.visibility !== "unpublished" && (
            <div className="mt-5 inline-flex items-center rounded-xl border border-border/60 bg-background/60 backdrop-blur-md px-4 py-2 text-sm text-muted-foreground">
              {typeof window !== "undefined"
                ? window.location.origin
                : ""}
              /forms/{form?.slug}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {responsesData?.data.map((response) => (
            <div
              key={response.id}
              className="rounded-2xl border border-border/50 bg-background/70 backdrop-blur-xl shadow-sm p-6 transition-all hover:border-primary/20 hover:bg-background/80"
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <Link
                  href={`/dashboard/forms/${id}/responses/${response.id}`}
                  className="flex items-center gap-4 flex-1 hover:opacity-90 transition-opacity"
                >
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {response.respondentName ||
                        response.respondentEmail ||
                        "Anonymous"}
                    </p>

                    {response.submittedAt && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDistanceToNow(
                          new Date(response.submittedAt)
                        )}{" "}
                        ago
                      </p>
                    )}
                  </div>
                </Link>

                <span className="px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  {response.status}
                </span>
              </div>

              {/* Answers */}
              <div className="space-y-4">
                {response.answers.map((ans) => {
                  const field = form?.fields.find(
                    (f) => f.id === ans.fieldId
                  );

                  if (!field) return null;

                  const value =
                    ans.valueArray?.join(", ") ||
                    ans.value ||
                    "";

                  return (
                    <div
                      key={ans.id}
                      className="pl-4 border-l-2 border-border/60"
                    >
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                        {field.label}
                      </p>

                      <p className="text-sm leading-relaxed text-foreground">
                        {value || (
                          <span className="italic text-muted-foreground">
                            —
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {responsesData &&
            responsesData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.max(1, p - 1)
                    )
                  }
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-border/60 bg-secondary/50 hover:bg-secondary text-sm text-foreground disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>

                <div className="px-4 py-2 rounded-xl bg-background/60 border border-border/50 backdrop-blur-md text-sm text-muted-foreground">
                  Page {page} of{" "}
                  {responsesData.totalPages}
                </div>

                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(
                        responsesData.totalPages,
                        p + 1
                      )
                    )
                  }
                  disabled={
                    page === responsesData.totalPages
                  }
                  className="px-4 py-2 rounded-xl border border-border/60 bg-secondary/50 hover:bg-secondary text-sm text-foreground disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
