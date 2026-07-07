"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
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
  TrendingUp,
  ArrowUpRight,
  Pencil,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { QRShareModal } from "~/components/forms/qr-share-modal";
import {
  HeroWorkspaceArt,
  EmptyFormsArt,
  AnalyticsSparkArt,
  FlowDiagramArt,
} from "~/components/dashboard/illustrations";
import { HelpTip } from "~/components/help/help-tip";

export default function DashboardPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; right: number } | null>(
    null,
  );
  const [qrForm, setQrForm] = useState<{ title: string; slug: string } | null>(null);

  const { data: forms, isLoading } = trpc.forms.list.useQuery(
    { includeArchived: false },
    { refetchInterval: 15000, refetchOnWindowFocus: true },
  );
  const { data: dashboard } = trpc.analytics.dashboard.useQuery(undefined, {
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const closeMenu = () => {
    setOpenMenu(null);
    setMenuPos(null);
  };

  const publishMutation = trpc.forms.publish.useMutation({
    onSuccess: () => {
      toast.success("Form published!");
      utils.forms.list.invalidate();
      closeMenu();
    },
    onError: (e) => toast.error(e.message),
  });
  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => {
      toast.success("Form unpublished");
      utils.forms.list.invalidate();
      closeMenu();
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted");
      utils.forms.list.invalidate();
      closeMenu();
    },
    onError: (e) => toast.error(e.message),
  });
  const duplicateMutation = trpc.forms.duplicate.useMutation({
    onSuccess: () => {
      toast.success("Form duplicated!");
      utils.forms.list.invalidate();
      closeMenu();
    },
    onError: (e) => toast.error(e.message),
  });

  const firstName = user?.fullName?.split(" ")[0] ?? "there";
  const formList = forms ?? [];
  const publishedCount = formList.filter((f) => f.visibility !== "unpublished").length;

  const kpis = [
    {
      label: "Forms",
      value: dashboard?.totalForms ?? formList.length,
      icon: FileText,
      hint: `${publishedCount} live`,
    },
    {
      label: "Views",
      value: dashboard?.totalViews ?? 0,
      icon: Eye,
      hint: "All time",
    },
    {
      label: "Responses",
      value: dashboard?.totalResponses ?? 0,
      icon: Inbox,
      hint: "Collected",
    },
    {
      label: "Completion",
      value: dashboard ? `${dashboard.avgConversionRate.toFixed(1)}%` : "0%",
      icon: TrendingUp,
      hint: "Avg rate",
    },
  ];

  const coverGradients = [
    "linear-gradient(135deg, var(--dash-accent) 0%, var(--dash-accent-2) 100%)",
    "linear-gradient(135deg, #22d3ee 0%, #34d399 100%)",
    "linear-gradient(135deg, #facc15 0%, #e11d8f 100%)",
    "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
  ];

  const statusBadge = (visibility: string) => {
    if (visibility === "unpublished") {
      return (
        <span className="kpi-chip" style={{ opacity: 0.75 }}>
          Draft
        </span>
      );
    }
    if (visibility === "public") {
      return (
        <span className="kpi-chip">
          <Globe className="w-3 h-3" /> Public
        </span>
      );
    }
    return (
      <span className="kpi-chip">
        <Lock className="w-3 h-3" /> Unlisted
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="ef-bento !p-0 overflow-hidden relative border-[var(--dash-accent-border)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(225,29,143,0.08), transparent 60%), radial-gradient(ellipse 50% 60% at 100% 20%, rgba(34,211,238,0.1), transparent 55%)",
          }}
        />
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-0 items-stretch relative">
          <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <span className="kpi-chip w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--dash-accent-2)] inline-block" />
                Your workspace
              </span>
              <HelpTip section="home" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight dash-text leading-[1.05]">
              Welcome back,{" "}
              <span className="dash-accent" style={{ fontStyle: "normal" }}>
                {firstName}
              </span>
            </h1>
            <p className="mt-3 text-sm sm:text-base dash-muted max-w-md leading-relaxed">
              Create forms, share them anywhere, and watch responses land in real time.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/forms/new"
                className="ef-btn-primary rounded-full px-5 py-2.5 text-sm inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create form
              </Link>
              <Link
                href="/dashboard/templates"
                className="ef-btn-ghost rounded-full px-5 py-2.5 text-sm inline-flex items-center gap-2"
              >
                Templates
              </Link>
              <Link
                href="/dashboard/help"
                className="ef-btn-ghost rounded-full px-5 py-2.5 text-sm inline-flex items-center gap-2"
              >
                Guide
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex items-end justify-end pr-4 pb-2">
            <HeroWorkspaceArt className="w-full max-w-[380px] h-auto" />
          </div>
        </div>
      </section>

      {/* KPI row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="ef-bento">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-[0.16em] font-semibold dash-faint">
                {k.label}
              </span>
              <k.icon className="w-4 h-4 dash-accent" />
            </div>
            <p className="dash-stat-value">{k.value}</p>
            <p className="mt-1 text-xs dash-muted">{k.hint}</p>
          </div>
        ))}
      </section>

      {/* Workflow diagram */}
      <section className="ef-bento !py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 px-1">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] font-semibold dash-faint">
              How it works
            </p>
            <p className="text-sm font-semibold dash-text mt-0.5">Build → Share → Analyze</p>
          </div>
          <AnalyticsSparkArt className="w-28 h-12 hidden sm:block" />
        </div>
        <FlowDiagramArt className="w-full max-w-xl mx-auto h-auto" />
      </section>

      {/* Forms library */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] font-semibold dash-faint">
              Library
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-xl font-semibold dash-text">Your forms</h2>
              <HelpTip section="home" />
            </div>
          </div>
          <Link
            href="/dashboard/forms/new"
            className="text-sm font-semibold dash-accent inline-flex items-center gap-1"
          >
            New form <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="ef-bento flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin dash-accent" />
          </div>
        ) : formList.length === 0 ? (
          <div className="ef-bento flex flex-col items-center text-center py-12 px-6">
            <EmptyFormsArt className="w-48 h-auto mb-4" />
            <h3 className="text-lg font-bold dash-text">No forms yet</h3>
            <p className="mt-2 text-sm dash-muted max-w-sm">
              Start with a blank form or pick a structure. You can publish, share a QR code, and
              track responses in minutes.
            </p>
            <Link
              href="/dashboard/forms/new"
              className="ef-btn-primary mt-6 rounded-full px-6 py-2.5 text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create your first form
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {formList.map((form, i) => (
              <article key={form.id} className="form-card group">
                <div
                  className="form-card-cover"
                  style={{ background: coverGradients[i % coverGradients.length] }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 20% 30%, #fff 0, transparent 40%), radial-gradient(circle at 80% 70%, #fff 0, transparent 35%)",
                    }}
                  />
                  <div className="absolute top-3 left-3">{statusBadge(form.visibility)}</div>
                  <button
                    type="button"
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const spaceBelow = window.innerHeight - rect.bottom;
                      setMenuPos(
                        spaceBelow < 220
                          ? {
                              bottom: window.innerHeight - rect.top + 6,
                              right: window.innerWidth - rect.right,
                            }
                          : { top: rect.bottom + 6, right: window.innerWidth - rect.right },
                      );
                      setOpenMenu(openMenu === form.id ? null : form.id);
                    }}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4">
                  <Link href={`/dashboard/forms/${form.id}/edit`}>
                    <h3 className="font-bold dash-text text-base leading-snug line-clamp-1 group-hover:opacity-80">
                      {form.title || "Untitled form"}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs dash-muted line-clamp-2 min-h-[2rem]">
                    {form.description || "No description"}
                  </p>

                  <div className="mt-4 flex items-center gap-3 text-xs dash-faint">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {form.viewCount ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Inbox className="w-3 h-3" /> {form.responseCount ?? 0}
                    </span>
                    <span className="ml-auto">
                      {form.updatedAt
                        ? formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })
                        : "—"}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t dash-border flex items-center gap-2">
                    <Link
                      href={`/dashboard/forms/${form.id}/edit`}
                      className="ef-btn-ghost flex-1 rounded-lg py-2 text-xs font-semibold inline-flex items-center justify-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </Link>
                    <Link
                      href={`/dashboard/forms/${form.id}/analytics`}
                      className="ef-btn-ghost flex-1 rounded-lg py-2 text-xs font-semibold inline-flex items-center justify-center gap-1"
                    >
                      <BarChart3 className="w-3 h-3" /> Stats
                    </Link>
                    {form.visibility !== "unpublished" && form.slug && (
                      <button
                        type="button"
                        className="ef-btn-ghost rounded-lg w-9 h-9 inline-flex items-center justify-center"
                        onClick={() => setQrForm({ title: form.title, slug: form.slug })}
                        title="QR code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {/* Create card */}
            <Link
              href="/dashboard/forms/new"
              className="form-card flex flex-col items-center justify-center min-h-[280px] border-dashed !shadow-none"
              style={{ borderStyle: "dashed", borderWidth: 2 }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "var(--dash-accent-soft)", color: "var(--dash-accent)" }}
              >
                <Plus className="w-6 h-6" />
              </div>
              <p className="font-bold dash-text">Create new form</p>
              <p className="text-xs dash-muted mt-1">Blank or from template</p>
            </Link>
          </div>
        )}
      </section>

      {/* Action menu portal */}
      {openMenu &&
        menuPos &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
            <div
              className="fixed z-50 ef-card !p-1.5 w-48 text-sm shadow-xl"
              style={{
                top: menuPos.top,
                bottom: menuPos.bottom,
                right: menuPos.right,
              }}
            >
              {(() => {
                const form = formList.find((f) => f.id === openMenu);
                if (!form) return null;
                return (
                  <>
                    <Link
                      href={`/dashboard/forms/${form.id}/edit`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg dash-text hover:opacity-80"
                      onClick={closeMenu}
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <Link
                      href={`/dashboard/forms/${form.id}/responses`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg dash-text hover:opacity-80"
                      onClick={closeMenu}
                    >
                      <Inbox className="w-3.5 h-3.5" /> Responses
                    </Link>
                    {form.visibility !== "unpublished" && form.slug && (
                      <a
                        href={`/forms/${form.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg dash-text hover:opacity-80"
                        onClick={closeMenu}
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open live
                      </a>
                    )}
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg dash-text"
                      onClick={() => duplicateMutation.mutate({ id: form.id })}
                    >
                      <Copy className="w-3.5 h-3.5" /> Duplicate
                    </button>
                    {form.visibility !== "unpublished" ? (
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg dash-text"
                        onClick={() => unpublishMutation.mutate({ id: form.id })}
                      >
                        <Lock className="w-3.5 h-3.5" /> Unpublish
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg dash-text"
                        onClick={() =>
                          publishMutation.mutate({ id: form.id, visibility: "public" })
                        }
                      >
                        <Globe className="w-3.5 h-3.5" /> Publish
                      </button>
                    )}
                    <div className="border-t dash-border my-1" />
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500"
                      onClick={() => {
                        if (confirm("Delete this form?")) deleteMutation.mutate({ id: form.id });
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </>
                );
              })()}
            </div>
          </>,
          document.body,
        )}

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
