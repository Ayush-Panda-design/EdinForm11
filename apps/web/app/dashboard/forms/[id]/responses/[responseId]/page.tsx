"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import {
  ArrowLeft,
  Loader2,
  User,
 Clock,
  Mail,
  Globe,
  AlertCircle,
  Flag,
} from "lucide-react";
import {
  formatDistanceToNow,
  format,
} from "date-fns";
import { toast } from "sonner";

export default function ResponseDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
    responseId: string;
  }>;
}) {
  const { id, responseId } = use(params);

  const utils = trpc.useUtils();

  const { data: form } =
    trpc.forms.getById.useQuery({
      id,
    });

  const { data: response, isLoading } =
    trpc.responses.getById.useQuery({
      id: responseId,
    });

  const markSpamMutation =
    trpc.responses.markAsSpam.useMutation({
      onSuccess: () => {
        toast.success(
          "Response marked as spam"
        );

        utils.responses.list.invalidate({
          formId: id,
        });
      },

      onError: (e) =>
        toast.error(e.message),
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!response) {
    return (
      <div className="relative max-w-2xl mx-auto text-center py-20">
        {/* Ambient glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="rounded-3xl border border-border/50 bg-background/70 backdrop-blur-xl shadow-sm p-12">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Response not found
          </h1>

          <p className="text-muted-foreground mb-6">
            This response may have been deleted
            or is no longer available.
          </p>

          <Link
            href={`/dashboard/forms/${id}/responses`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to responses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Cinematic ambient glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/dashboard/forms/${id}/responses`}
          className="p-2.5 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-foreground">
            Response Detail
          </h1>

          <p className="text-sm text-muted-foreground mt-1 truncate">
            {form?.title}
          </p>
        </div>

        {response.status !== "spam" && (
          <button
            onClick={() => {
              if (
                confirm(
                  "Mark this response as spam?"
                )
              ) {
                markSpamMutation.mutate({
                  id: responseId,
                });
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <Flag className="w-4 h-4" />
            Mark Spam
          </button>
        )}
      </div>

      {/* Respondent Info */}
      <div className="rounded-3xl border border-border/50 bg-background/70 backdrop-blur-xl shadow-sm p-7 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Respondent Info
            </p>

            <h2 className="text-lg font-semibold text-foreground mt-1">
              Submission Metadata
            </h2>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              response.status ===
              "completed"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : response.status === "spam"
                ? "border-red-500/20 bg-red-500/10 text-red-400"
                : "border-border/60 bg-secondary/60 text-muted-foreground"
            }`}
          >
            {response.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Name */}
          <InfoCard
            icon={
              <User className="w-4 h-4 text-primary" />
            }
            title="Name"
            value={
              response.respondentName || (
                <span className="italic text-muted-foreground">
                  Anonymous
                </span>
              )
            }
          />

          {/* Email */}
          <InfoCard
            icon={
              <Mail className="w-4 h-4 text-blue-400" />
            }
            title="Email"
            value={
              response.respondentEmail || (
                <span className="italic text-muted-foreground">
                  Not provided
                </span>
              )
            }
          />

          {/* Submitted */}
          <InfoCard
            icon={
              <Clock className="w-4 h-4 text-emerald-400" />
            }
            title="Submitted"
            value={
              response.submittedAt
                ? `${format(
                    new Date(
                      response.submittedAt
                    ),
                    "PPP 'at' p"
                  )} (${formatDistanceToNow(
                    new Date(
                      response.submittedAt
                    )
                  )} ago)`
                : "—"
            }
          />

          {/* Completion */}
          <InfoCard
            icon={
              <Globe className="w-4 h-4 text-orange-400" />
            }
            title="Completion Time"
            value={
              response.completionTimeSeconds !=
              null
                ? `${response.completionTimeSeconds}s`
                : "—"
            }
          />
        </div>
      </div>

      {/* Answers */}
      <div className="rounded-3xl border border-border/50 bg-background/70 backdrop-blur-xl shadow-sm p-7">
        <div className="mb-7">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Answers
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-1">
            {response.answers.length} Responses
          </h2>
        </div>

        {response.answers.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md p-8 text-center">
            <p className="text-muted-foreground italic">
              No answers recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {response.answers.map((ans, i) => {
              const field = form?.fields.find(
                (f) => f.id === ans.fieldId
              );

              const value =
                ans.valueArray?.join(", ") ||
                ans.value ||
                "";

              return (
                <div
                  key={ans.id}
                  className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md p-5"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex items-center justify-center min-w-8 h-8 rounded-xl bg-secondary/60 text-xs font-mono text-muted-foreground">
                      Q{i + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {field?.label ??
                          `Field ${ans.fieldId.slice(
                            0,
                            8
                          )}`}
                      </p>

                      {field?.required && (
                        <span className="inline-flex mt-1 text-xs text-red-400">
                          * required
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-11">
                    {value ? (
                      <div className="rounded-2xl border border-border/50 bg-background/60 backdrop-blur-md px-4 py-3">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                          {value}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm italic text-muted-foreground">
                        Not answered
                      </p>
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

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-secondary/60 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-muted-foreground mb-1">
            {title}
          </p>

          <div className="text-sm font-medium text-foreground break-words">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}
