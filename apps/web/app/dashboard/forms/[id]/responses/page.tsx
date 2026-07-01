"use client";

import { use, useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Download, Loader2, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DashboardPage,
  DashboardHeader,
  DashboardBackLink,
  DashboardEmpty,
  DashboardRow,
  DashboardBadge,
  DashboardCard,
} from "~/components/dashboard/primitives";

export default function ResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [page, setPage] = useState(1);

  const { data: form } = trpc.forms.getById.useQuery({ id });
  const { data: responsesData, isLoading } = trpc.responses.list.useQuery({
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
      r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "",
      r.respondentName || r.respondentEmail || "Anonymous",
      ...form.fields.map((f) => {
        const ans = r.answers.find((a) => a.fieldId === f.id);
        return ans?.valueArray?.join(", ") || ans?.value || "";
      }),
    ]);

    const csv = [headers, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (form.title || "responses") + ".csv";
    a.click();
  };

  return (
    <DashboardPage>
      <div className="flex items-center gap-3 mb-8">
        <DashboardBackLink href={`/dashboard/forms/${id}/edit`} />
        <div className="flex-1 min-w-0">
          <h1 className="dt-title text-2xl truncate">
            Responses — {form?.title}
          </h1>
          <p className="dt-subtitle">
            {responsesData?.total ?? 0} total responses
          </p>
        </div>
        <button type="button" onClick={exportCsv} className="dt-btn-ghost">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin dt-accent-icon" />
        </div>
      ) : responsesData?.data.length === 0 ? (
        <DashboardEmpty
          icon={User}
          title="No responses yet"
          description="Share your form to start collecting responses from users."
          action={
            form?.visibility !== "unpublished" ? (
              <code
                className="text-xs px-4 py-2 rounded-xl"
                style={{
                  background: "var(--dt-accent-soft)",
                  border: "1px solid var(--dt-accent-border)",
                  color: "var(--muted-foreground)",
                }}
              >
                {typeof window !== "undefined" ? window.location.origin : ""}
                /forms/{form?.slug}
              </code>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-1">
          {responsesData?.data.map((response) => (
            <DashboardRow key={response.id}>
              <Link
                href={`/dashboard/forms/${id}/responses/${response.id}`}
                className="flex items-center gap-4 flex-1 min-w-0"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--dt-accent-soft)" }}
                >
                  <User className="w-5 h-5 dt-accent-icon" />
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
                      {formatDistanceToNow(new Date(response.submittedAt))} ago
                    </p>
                  )}
                </div>
              </Link>
              <DashboardBadge variant="success">{response.status}</DashboardBadge>
            </DashboardRow>
          ))}

          {responsesData && responsesData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="dt-btn-ghost disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {responsesData.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= responsesData.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="dt-btn-ghost disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </DashboardPage>
  );
}
