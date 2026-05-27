"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { useAuth } from "~/providers/auth-provider";
import {
  Plus,
  FileText,
  Eye,
  BarChart3,
  Globe,
  Lock,
  MoreHorizontal,
  Trash2,
  Copy,
  ExternalLink,
  Loader2,
  QrCode,
  Layers,
  TrendingUp,
  Clock3,
  Sparkles,
  ArrowUpRight,
  Activity,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Users,
  MousePointerClick,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { QRShareModal } from "~/components/forms/qr-share-modal";

export default function DashboardPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [qrForm, setQrForm] = useState<{
    title: string;
    slug: string;
  } | null>(null);

  const { data: forms, isLoading } =
    trpc.forms.list.useQuery({
      includeArchived: false,
    });

  const { data: dashboard } =
    trpc.analytics.dashboard.useQuery(undefined);

  const publishMutation =
    trpc.forms.publish.useMutation({
      onSuccess: () => {
        toast.success("Form published!");
        utils.forms.list.invalidate();
      },
      onError: (e) => toast.error(e.message),
    });

  const unpublishMutation =
    trpc.forms.unpublish.useMutation({
      onSuccess: () => {
        toast.success("Form unpublished");
        utils.forms.list.invalidate();
      },
      onError: (e) => toast.error(e.message),
    });

  const deleteMutation =
    trpc.forms.delete.useMutation({
      onSuccess: () => {
        toast.success("Form deleted");
        utils.forms.list.invalidate();
      },
      onError: (e) => toast.error(e.message),
    });

  const duplicateMutation =
    trpc.forms.duplicate.useMutation({
      onSuccess: () => {
        toast.success("Form duplicated!");
        utils.forms.list.invalidate();
      },
      onError: (e) => toast.error(e.message),
    });

  const publishedForms = useMemo(
    () =>
      forms?.filter(
        (f) => f.visibility !== "unpublished"
      ) ?? [],
    [forms]
  );

  const draftForms = useMemo(
    () =>
      forms?.filter(
        (f) => f.visibility === "unpublished"
      ) ?? [],
    [forms]
  );

  const recentForms = useMemo(
    () =>
      [...(forms ?? [])]
          .sort((a, b) => {
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

  return bTime - aTime;
})
        .slice(0, 5),
    [forms]
  );


  const bestPerformingForm = useMemo(() => {
    if (!forms?.length) return null;

    return [...forms].sort(
      (a, b) =>
        (b.conversionRate ?? 0) -
        (a.conversionRate ?? 0)
    )[0];
  }, [forms]);

  const stats = [
    {
      label: "Total Forms",
      value: dashboard?.totalForms ?? 0,
      icon: FileText,
      description: "Active and draft forms",
    },
    {
      label: "Total Views",
      value: dashboard?.totalViews ?? 0,
      icon: Eye,
      description: "Visitors across all forms",
    },
    {
      label: "Responses",
      value: dashboard?.totalResponses ?? 0,
      icon: BarChart3,
      description: "Collected submissions",
    },
    {
      label: "Avg Conversion",
      value: dashboard
        ? dashboard.avgConversionRate.toFixed(1)
        : "0",
      icon: TrendingUp,
      suffix: "%",
      description: "Average completion rate",
    },
  ];

  const visibilityBadge = (v: string) => {
    if (v === "public")
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-400">
          <Globe className="h-2.5 w-2.5" />
          Public
        </span>
      );

    if (v === "unlisted")
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-amber-300">
          <Lock className="h-2.5 w-2.5" />
          Unlisted
        </span>
      );

    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Draft
      </span>
    );
  };

  return (
    <div className="relative">
      {/* Ambient cinematic glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* HEADER */}
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Edinburgh Studio
            </span>
          </div>

          <h1 className="font-serif text-4xl text-foreground md:text-5xl">
            Welcome back,{" "}
            <span className="italic text-primary">
              {user?.fullName?.split(" ")[0]}
            </span>
            .
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Monitor performance, publish new forms,
            track responses, and manage your
            collection from one cinematic workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/forms/new"
            className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create New Form
          </Link>

          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-secondary/60 px-5 py-3 text-sm text-foreground backdrop-blur-xl transition hover:bg-secondary"
          >
            <LayoutDashboard className="h-4 w-4" />
            Templates
          </Link>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="group rounded-3xl border border-border/50 bg-background/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/20"
            style={{
              animationDelay: `${i * 70}ms`,
              animation:
                "ef-fade-up .6s cubic-bezier(.2,.7,.2,1) both",
            }}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  {s.label}
                </p>

                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
                  {s.value}
                  {s.suffix && (
                    <span className="ml-1 text-xl text-primary">
                      {s.suffix}
                    </span>
                  )}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {s.description}
              </p>

              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </div>
        ))}
      </div>

      {/* INSIGHTS */}
      <div className="mb-10 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Performance */}
        <div className="rounded-3xl border border-border/50 bg-background/70 p-6 backdrop-blur-xl xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Workspace Insights
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Quick overview of your current form
                ecosystem.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InsightCard
              icon={Globe}
              title="Published Forms"
              value={publishedForms.length}
              subtitle="Currently accessible"
            />

            <InsightCard
              icon={Lock}
              title="Draft Forms"
              value={draftForms.length}
              subtitle="Private drafts"
            />

            <InsightCard
              icon={Users}
              title="Audience Reach"
              value={dashboard?.totalViews ?? 0}
              subtitle="Total viewers"
            />
          </div>

          {bestPerformingForm && (
            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-primary">
                    Best Performing Form
                  </p>

                  <h4 className="mt-2 text-xl font-semibold text-foreground">
                    {bestPerformingForm.title}
                  </h4>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Highest conversion rate across
                    your workspace.
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Conversion
                    </p>

                    <p className="text-2xl font-semibold text-foreground">
                      {bestPerformingForm.conversionRate.toFixed(
                        1
                      )}
                      %
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Responses
                    </p>

                    <p className="text-2xl font-semibold text-foreground">
                      {bestPerformingForm.responseCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-3xl border border-border/50 bg-background/70 p-6 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Recent Activity
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Latest forms and updates.
              </p>
            </div>

            <Clock3 className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-4">
            {recentForms.length === 0 && (
              <div className="rounded-2xl border border-border/60 bg-secondary/40 p-5 text-sm text-muted-foreground">
                No recent activity yet.
              </div>
            )}

            {recentForms.map((form) => (
              <div
                key={form.id}
                className="flex items-start gap-3 rounded-2xl border border-border/50 bg-secondary/30 p-4"
              >
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/forms/${form.id}/edit`}
                    className="line-clamp-1 text-sm font-medium text-foreground transition hover:text-primary"
                  >
                    {form.title}
                  </Link>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {visibilityBadge(form.visibility)}
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      {form.responseCount}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {form.viewCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FORMS TABLE */}
      <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 backdrop-blur-xl">
        {/* Top */}
        <div className="flex flex-col gap-4 border-b border-border/60 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Your Forms
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage publishing, responses,
              analytics, and distribution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-secondary/40 px-4 py-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Updated live
            </div>

            <Link
              href="/dashboard/forms/new"
              className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              New Form
            </Link>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center p-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && forms?.length === 0 && (
          <div className="p-16 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10">
              <FileText className="h-7 w-7 text-primary" />
            </div>

            <h3 className="text-2xl font-semibold text-foreground">
              Your workspace is empty
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
              Start building cinematic forms with
              analytics, public sharing, QR access,
              and response tracking.
            </p>

            <Link
              href="/dashboard/forms/new"
              className="mt-7 inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create Your First Form
            </Link>
          </div>
        )}

        {/* Rows */}
        {!isLoading && forms && forms.length > 0 && (
          <div>
            {forms.map((form, idx) => (
              <div
                key={form.id}
                className={`group flex flex-col gap-5 border-border/50 p-6 transition-all duration-200 hover:bg-secondary/20 lg:flex-row lg:items-center ${
                  idx !== forms.length - 1
                    ? "border-b"
                    : ""
                }`}
              >
                {/* Left */}
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/forms/${form.id}/edit`}
                        className="truncate text-lg font-semibold text-foreground transition hover:text-primary"
                      >
                        {form.title}
                      </Link>

                      {visibilityBadge(form.visibility)}
                    </div>

                    <p className="mb-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                      Track responses, engagement,
                      and conversions from your
                      Edinburgh workspace.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary/40 px-3 py-1">
                        <BarChart3 className="h-3 w-3" />
                        {form.responseCount} responses
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary/40 px-3 py-1">
                        <Eye className="h-3 w-3" />
                        {form.viewCount} views
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary/40 px-3 py-1">
                        <MousePointerClick className="h-3 w-3" />
                        {form.conversionRate.toFixed(0)}%
                        conversion
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary/40 px-3 py-1">
                        <Clock3 className="h-3 w-3" />
                        {formatDistanceToNow(
                          new Date(form.createdAt)
                        )}{" "}
                        ago
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {form.visibility !==
                    "unpublished" && (
                    <button
                      onClick={() =>
                        setQrForm({
                          title: form.title,
                          slug: form.slug,
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-secondary/40 px-4 py-2 text-sm text-foreground transition hover:bg-secondary"
                    >
                      <QrCode className="h-4 w-4" />
                      QR
                    </button>
                  )}

                  <Link
                    href={`/dashboard/forms/${form.id}/responses`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-secondary/40 px-4 py-2 text-sm text-foreground transition hover:bg-secondary"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Responses
                  </Link>

                  {/* MENU */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenu(
                          openMenu === form.id
                            ? null
                            : form.id
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-secondary/40 px-4 py-2 text-sm text-foreground transition hover:bg-secondary"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {openMenu === form.id && (
                      <div
                        className="absolute right-0 top-[calc(100%+10px)] z-30 w-64 rounded-2xl border border-border/60 bg-background/90 p-2 shadow-2xl backdrop-blur-2xl"
                        onClick={() =>
                          setOpenMenu(null)
                        }
                      >
                        <MenuAnchor
                          icon={Layers}
                          label="Edit & Preview"
                          href={`/dashboard/forms/${form.id}/edit`}
                        />

                        {form.visibility !==
                        "unpublished" ? (
                          <MenuBtn
                            icon={Lock}
                            label="Unpublish"
                            onClick={() =>
                              unpublishMutation.mutate({
                                id: form.id,
                              })
                            }
                          />
                        ) : (
                          <MenuBtn
                            icon={Globe}
                            label="Publish"
                            onClick={() =>
                              publishMutation.mutate({
                                id: form.id,
                                visibility:
                                  "public",
                              })
                            }
                          />
                        )}

                        <MenuBtn
                          icon={Copy}
                          label="Duplicate"
                          onClick={() =>
                            duplicateMutation.mutate({
                              id: form.id,
                            })
                          }
                        />

                        {form.visibility !==
                          "unpublished" && (
                          <>
                            <MenuBtn
                              icon={Copy}
                              label="Copy Share Link"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  window.location
                                    .origin +
                                    "/forms/" +
                                    form.slug
                                );

                                toast.success(
                                  "Link copied!"
                                );
                              }}
                            />

                            <MenuAnchor
                              icon={ExternalLink}
                              label="Open Public Form"
                              href={`/forms/${form.slug}`}
                            />
                          </>
                        )}

                        <div className="my-2 border-t border-border/60" />

                        <MenuBtn
                          icon={Trash2}
                          label="Delete Form"
                          danger
                          onClick={() => {
                            if (
                              confirm(
                                "Delete this form and all its responses?"
                              )
                            ) {
                              deleteMutation.mutate({
                                id: form.id,
                              });
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 rounded-3xl border border-primary/20 bg-primary/5 p-8 backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Workspace Healthy
            </div>

            <h3 className="text-2xl font-semibold text-foreground">
              Your dashboard is running smoothly
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              Continue building forms, collecting
              responses, and improving conversion
              rates with your Edinburgh-inspired
              cinematic workspace.
            </p>
          </div>

          <Link
            href="/dashboard/forms/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Build Another Form
          </Link>
        </div>
      </div>

      {/* QR */}
      {qrForm && (
        <QRShareModal
          open={!!qrForm}
          onClose={() => setQrForm(null)}
          formTitle={qrForm.title}
          formSlug={qrForm.slug}
        />
      )}
    </div>
  );
}

/* ========================================================= */
/* INSIGHT CARD */
/* ========================================================= */

function InsightCard({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  value: number;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-secondary/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {title}
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>

      <p className="text-3xl font-semibold text-foreground">
        {value}
      </p>

      <p className="mt-2 text-sm text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}

/* ========================================================= */
/* MENU BUTTON */
/* ========================================================= */

function MenuBtn({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-foreground hover:bg-secondary/70"
      }`}
    >
      <Icon
        className={`h-4 w-4 ${
          danger
            ? "text-red-400"
            : "text-primary"
        }`}
      />

      {label}
    </button>
  );
}

/* ========================================================= */
/* MENU LINK */
/* ========================================================= */

function MenuAnchor({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition hover:bg-secondary/70"
    >
      <Icon className="h-4 w-4 text-primary" />

      {label}
    </a>
  );
}
