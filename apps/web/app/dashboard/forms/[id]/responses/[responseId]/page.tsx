"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import {
  Loader2,
  User,
  Clock,
  Mail,
  Globe,
  AlertCircle,
  Flag,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import {
  DashboardPage,
  DashboardBackLink,
  DashboardCard,
  DashboardSection,
  DashboardInfoTile,
  DashboardBadge,
} from "~/components/dashboard/primitives";

export default function ResponseDetailPage({
  params,
}: {
  params: Promise<{ id: string; responseId: string }>;
}) {
  const { id, responseId } = use(params);
  const utils = trpc.useUtils();

  const { data: form } = trpc.forms.getById.useQuery({ id });
  const { data: response, isLoading } = trpc.responses.getById.useQuery({
    id: responseId,
  });

  const markSpamMutation = trpc.responses.markAsSpam.useMutation({
    onSuccess: () => {
      toast.success("Response marked as spam");
      utils.responses.list.invalidate({ formId: id });
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin dt-accent-icon" />
      </div>
    );
  }

  if (!response) {
    return (
      <DashboardPage>
        <DashboardCard className="p-12 text-center max-w-lg mx-auto">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.1)" }}
          >
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-medium text-foreground mb-2">
            Response not found
          </h1>
          <p className="text-muted-foreground mb-6">
            This response may have been deleted or is no longer available.
          </p>
          <Link href={`/dashboard/forms/${id}/responses`} className="dt-btn-primary">
            Back to responses
          </Link>
        </DashboardCard>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>
      <div className="flex items-center gap-3 mb-8">
        <DashboardBackLink href={`/dashboard/forms/${id}/responses`} />
        <div className="flex-1 min-w-0">
          <h1 className="dt-title text-2xl">Response Detail</h1>
          <p className="dt-subtitle truncate">{form?.title}</p>
        </div>
        {response.status !== "spam" && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Mark this response as spam?")) {
                markSpamMutation.mutate({ id: responseId });
              }
            }}
            className="dt-btn-ghost text-red-400 border-red-500/20"
          >
            <Flag className="w-4 h-4" />
            Mark Spam
          </button>
        )}
      </div>

      <DashboardSection title="Submission metadata">
        <DashboardCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Respondent info
            </p>
            <DashboardBadge variant={response.status === "completed" ? "success" : "default"}>
              {response.status}
            </DashboardBadge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DashboardInfoTile
              icon={<User className="w-4 h-4 dt-accent-icon" />}
              label="Name"
              value={
                response.respondentName || (
                  <span className="italic text-muted-foreground">Anonymous</span>
                )
              }
            />
            <DashboardInfoTile
              icon={<Mail className="w-4 h-4 dt-accent-icon" />}
              label="Email"
              value={
                response.respondentEmail || (
                  <span className="italic text-muted-foreground">Not provided</span>
                )
              }
            />
            <DashboardInfoTile
              icon={<Clock className="w-4 h-4 dt-accent-icon" />}
              label="Submitted"
              value={
                response.submittedAt
                  ? `${format(new Date(response.submittedAt), "PPP 'at' p")} (${formatDistanceToNow(new Date(response.submittedAt))} ago)`
                  : "—"
              }
            />
            <DashboardInfoTile
              icon={<Globe className="w-4 h-4 dt-accent-icon" />}
              label="Completion time"
              value={
                response.completionTimeSeconds != null
                  ? `${response.completionTimeSeconds}s`
                  : "—"
              }
            />
          </div>
        </DashboardCard>
      </DashboardSection>

      <DashboardSection
        title={`${response.answers.length} answers`}
        subtitle="Individual field responses"
      >
        <DashboardCard className="p-6">
          {response.answers.length === 0 ? (
            <p className="text-muted-foreground italic text-center py-8">
              No answers recorded.
            </p>
          ) : (
            <div className="space-y-4">
              {response.answers.map((ans, i) => {
                const field = form?.fields.find((f) => f.id === ans.fieldId);
                const value =
                  ans.valueArray?.join(", ") || ans.value || "";

                return (
                  <div
                    key={ans.id}
                    className="rounded-xl p-5"
                    style={{
                      background: "var(--dt-accent-soft)",
                      border: "1px solid var(--dt-accent-border)",
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span
                        className="min-w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono"
                        style={{ background: "var(--dt-card-bg)" }}
                      >
                        Q{i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {field?.label ?? `Field ${ans.fieldId.slice(0, 8)}`}
                        </p>
                        {field?.required && (
                          <span className="text-xs text-red-400">* required</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-11">
                      {value ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                          {value}
                        </p>
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
        </DashboardCard>
      </DashboardSection>
    </DashboardPage>
  );
}
