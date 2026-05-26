"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { ArrowLeft, Loader2, User, Clock, Mail, Globe, AlertCircle, Flag } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

export default function ResponseDetailPage({
  params,
}: {
  params: Promise<{ id: string; responseId: string }>;
}) {
  const { id, responseId } = use(params);
  const utils = trpc.useUtils();

  const { data: form } = trpc.forms.getById.useQuery({ id });
  const { data: response, isLoading } = trpc.responses.getById.useQuery({ id: responseId });

  const markSpamMutation = trpc.responses.markAsSpam.useMutation({
    onSuccess: () => {
      toast.success("Response marked as spam");
      utils.responses.list.invalidate({ formId: id });
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="w-6 h-6 animate-spin text-stone-900" />
      </div>
    );
  }

  if (!response) {
    return (
      <div className="max-w-2xl mx-auto text-center p-16">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">Response not found.</p>
        <Link href={`/dashboard/forms/${id}/responses`} className="text-stone-900 hover:underline text-sm mt-2 inline-block">
          ← Back to responses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/dashboard/forms/${id}/responses`}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Response Detail
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{form?.title}</p>
        </div>
        {response.status !== "spam" && (
          <button
            onClick={() => {
              if (confirm("Mark this response as spam?")) {
                markSpamMutation.mutate({ id: responseId });
              }
            }}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" /> Mark Spam
          </button>
        )}
      </div>

      {/* Metadata card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          Respondent Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-900/30 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-stone-900" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {response.respondentName || <span className="text-gray-400 italic">Anonymous</span>}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {response.respondentEmail || <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Submitted</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {response.submittedAt
                  ? `${format(new Date(response.submittedAt), "PPP 'at' p")} (${formatDistanceToNow(new Date(response.submittedAt))} ago)`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completion time</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {response.completionTimeSeconds != null
                  ? `${response.completionTimeSeconds}s`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <span className="text-xs text-gray-500">Status:</span>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              response.status === "completed"
                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                : response.status === "spam"
                ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
          >
            {response.status}
          </span>
        </div>
      </div>

      {/* Answers */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-6">
          Answers ({response.answers.length})
        </h2>

        {response.answers.length === 0 ? (
          <p className="text-gray-400 italic text-sm">No answers recorded.</p>
        ) : (
          <div className="space-y-6">
            {response.answers.map((ans, i) => {
              const field = form?.fields.find((f) => f.id === ans.fieldId);
              const value = ans.valueArray?.join(", ") || ans.value || "";

              return (
                <div key={ans.id} className="pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded font-mono flex-shrink-0 mt-0.5">
                      Q{i + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field?.label ?? `Field ${ans.fieldId.slice(0, 8)}`}
                      {field?.required && (
                        <span className="ml-1.5 text-xs text-red-400">*required</span>
                      )}
                    </p>
                  </div>
                  <div className="ml-8">
                    {value ? (
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                        {value}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Not answered</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
