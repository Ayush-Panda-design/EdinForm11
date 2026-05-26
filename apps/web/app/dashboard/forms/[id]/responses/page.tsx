"use client";

import { use, useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { ArrowLeft, Download, Loader2, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
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
    const headers = ["Submitted At", "Respondent", ...form.fields.map(f => f.label)];
    const rows = responsesData.data.map(r => [
      r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "",
      r.respondentName || r.respondentEmail || "Anonymous",
      ...form.fields.map(f => {
        const ans = r.answers.find(a => a.fieldId === f.id);
        return ans?.valueArray?.join(", ") || ans?.value || "";
      }),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = (form.title || "responses") + ".csv"; a.click();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href={"/dashboard/forms/" + id + "/edit"} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Responses — {form?.title}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{responsesData?.total ?? 0} total responses</p>
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-stone-900" /></div>
      ) : responsesData?.data.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No responses yet. Share your form to start collecting data!</p>
          {form?.visibility !== "unpublished" && (
            <p className="text-sm text-gray-500 mt-2">Share link: {typeof window !== "undefined" ? window.location.origin : ""}/forms/{form?.slug}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {responsesData?.data.map((response, idx) => (
            <div key={response.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 hover:border-stone-200 dark:hover:border-stone-900 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <Link href={`/dashboard/forms/${id}/responses/${response.id}`} className="flex items-center gap-3 flex-1 hover:opacity-80">
                  <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-900/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-stone-900 dark:text-stone-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {response.respondentName || response.respondentEmail || "Anonymous"}
                    </p>
                    {response.submittedAt && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(response.submittedAt))} ago
                      </p>
                    )}
                  </div>
                </Link>
                <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                  {response.status}
                </span>
              </div>
              <div className="space-y-3">
                {response.answers.map((ans) => {
                  const field = form?.fields.find(f => f.id === ans.fieldId);
                  if (!field) return null;
                  const value = ans.valueArray?.join(", ") || ans.value || "";
                  return (
                    <div key={ans.id} className="pl-3 border-l-2 border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{field.label}</p>
                      <p className="text-sm text-gray-900 dark:text-white">{value || <span className="text-gray-400 italic">—</span>}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {responsesData && responsesData.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                {page} / {responsesData.totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(responsesData.totalPages, p + 1))} disabled={page === responsesData.totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
