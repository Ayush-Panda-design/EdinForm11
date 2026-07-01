"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { useAuth } from "~/providers/auth-provider";
import {
  Plus, FileText, Eye, BarChart3, Globe, Lock,
  MoreHorizontal, Trash2, Copy, ExternalLink,
  Loader2, QrCode, Layers, TrendingUp, Zap,
  Shield, GitBranch, MousePointer2,
  ChevronRight, Activity, Calendar, Download, Users,
  BookOpen, ListOrdered, Lightbulb, HelpCircle, Radio,
} from "lucide-react";
import { toast } from "sonner";
import { QRShareModal } from "~/components/forms/qr-share-modal";
import {
  DashboardPage as DashboardPageShell,
  DashboardStatGrid,
  DashboardStatCard,
  DashboardCard,
  DashboardBtnLink,
  DashboardAnimatedSection,
  dtBtnGhostClass,
} from "~/components/dashboard/primitives";
import { DashboardHomeIllustration } from "~/components/dashboard/dashboard-home-visuals";

const ACCENT = "var(--dt-accent)";

const WORKSPACE_STEPS = [
  { step: 1, title: "Create a form", body: "Start from + New Form, add a title, then build questions in the editor with branching and layout options." },
  { step: 2, title: "Publish & share", body: "Set visibility to Public or Unlisted, then copy the link or download a QR code for print and events." },
  { step: 3, title: "Collect responses", body: "Submissions appear in your forms list and the live feed on Analytics — no manual refresh needed." },
  { step: 4, title: "Review insights", body: "Open workspace Analytics for trends, or per-form analytics for field-level charts and option breakdowns." },
  { step: 5, title: "Iterate & improve", body: "Duplicate top performers, shorten low-converting forms, and export responses to spreadsheet when needed." },
] as const;

const QUICK_GUIDE = [
  { term: "Draft forms", definition: "Saved but not public. Only you can see and edit them until you publish." },
  { term: "Views vs replies", definition: "Views count link opens; replies count completed submissions. Conversion = replies ÷ views." },
  { term: "Quick actions", definition: "Shortcuts in the sidebar column for common tasks — new form, analytics, explore, settings." },
  { term: "Form menu (⋯)", definition: "Publish, duplicate, copy link, open live form, or delete — available on each form row." },
] as const;

function getDashboardInsights(opts: {
  formCount: number;
  views: number;
  responses: number;
  conversion: number;
}) {
  const items: { title: string; body: string; href?: string; label?: string }[] = [];
  if (opts.formCount === 0) {
    items.push({ title: "Start your first form", body: "Your dashboard is ready — create a draft, add a few questions, and publish when you're happy with the preview.", href: "/dashboard/forms/new", label: "Create form" });
  } else if (opts.responses === 0 && opts.views === 0) {
    items.push({ title: "Share to collect data", body: "You have forms but no traffic yet. Publish if still in draft, then share the link or QR code.", href: "/dashboard", label: "View forms below" });
  } else if (opts.conversion < 15 && opts.views >= 5) {
    items.push({ title: "Boost completion rate", body: "Conversion is below typical benchmarks. Try fewer questions, enable the progress bar, or use one-question-at-a-time layout.", href: "/dashboard/analytics", label: "Open analytics" });
  } else if (opts.responses > 0) {
    items.push({ title: "Check live analytics", body: `You've collected ${opts.responses} submission${opts.responses === 1 ? "" : "s"}. Review trends and your live feed for real-time activity.`, href: "/dashboard/analytics", label: "View analytics" });
  }
  items.push({ title: "Explore templates", body: "Browse public forms for inspiration on structure, tone, and question types before building your next one.", href: "/explore", label: "Explore forms" });
  return items.slice(0, 3);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const [qrForm, setQrForm] = useState<{ title: string; slug: string } | null>(null);

  const { data: forms, isLoading } = trpc.forms.list.useQuery({ includeArchived: false });
  const { data: dashboard } = trpc.analytics.dashboard.useQuery(undefined);

  const closeMenu = () => { setOpenMenu(null); setMenuPos(null); };

  const publishMutation = trpc.forms.publish.useMutation({
    onSuccess: () => { toast.success("Form published!"); utils.forms.list.invalidate(); closeMenu(); },
    onError: (e) => toast.error(e.message),
  });
  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => { toast.success("Form unpublished"); utils.forms.list.invalidate(); closeMenu(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => { toast.success("Form deleted"); utils.forms.list.invalidate(); closeMenu(); },
    onError: (e) => toast.error(e.message),
  });
  const duplicateMutation = trpc.forms.duplicate.useMutation({
    onSuccess: () => { toast.success("Form duplicated!"); utils.forms.list.invalidate(); closeMenu(); },
    onError: (e) => toast.error(e.message),
  });

  const conversion = dashboard?.avgConversionRate ?? 0;
  const insights = getDashboardInsights({
    formCount: dashboard?.totalForms ?? 0,
    views: dashboard?.totalViews ?? 0,
    responses: dashboard?.totalResponses ?? 0,
    conversion,
  });

  const stats = [
    { label: "Total Forms", value: dashboard?.totalForms ?? 0, icon: FileText, desc: "In your workspace" },
    { label: "Total Views", value: dashboard?.totalViews ?? 0, icon: Eye, desc: "All-time opens" },
    { label: "Responses", value: dashboard?.totalResponses ?? 0, icon: BarChart3, desc: "Completed subs" },
    { label: "Avg Conversion", value: `${conversion.toFixed(1)}%`, icon: TrendingUp, desc: "Views → replies" },
  ];

  const features = [
    { icon: GitBranch, title: "Smart Branching", desc: "Show or hide questions based on answers — forms that feel like a conversation." },
    { icon: MousePointer2, title: "One Question at a Time", desc: "Focused single-question layout with smooth transitions and keyboard support." },
    { icon: QrCode, title: "QR Code Sharing", desc: "Downloadable QR for every published form — ideal for print and events." },
    { icon: Shield, title: "Limits & Close Dates", desc: "Cap responses or set an expiry — enforced automatically." },
    { icon: Eye, title: "Live Preview", desc: "See exactly what respondents see before you share." },
    { icon: Download, title: "Export to Spreadsheet", desc: "One-click export for Excel, Sheets, or any CSV tool." },
  ];

  const visibilityBadge = (v: string) => {
    if (v === "public")
      return <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase" style={{ background: "color-mix(in srgb, var(--dt-success) 18%, transparent)", color: "var(--dt-success)", border: "1px solid color-mix(in srgb, var(--dt-success) 30%, transparent)" }}><Globe className="w-2.5 h-2.5" /> Public</span>;
    if (v === "unlisted")
      return <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase" style={{ background: "var(--dt-accent-soft)", color: ACCENT, border: "1px solid var(--dt-accent-border)" }}><Lock className="w-2.5 h-2.5" /> Unlisted</span>;
    return <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase text-[var(--muted-foreground)]" style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--border)" }}>Draft</span>;
  };

  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  return (
    <DashboardPageShell wide className="space-y-8">
      {/* Hero */}
      <DashboardAnimatedSection animation="fade-up">
        <section
          className="relative overflow-hidden rounded-3xl border dt-anim-shimmer"
          style={{
            borderColor: "var(--dt-card-border)",
            background: "linear-gradient(135deg, var(--dt-card-bg) 0%, color-mix(in srgb, var(--dt-accent) 10%, var(--dt-main-bg)) 50%, var(--dt-card-bg) 100%)",
            backgroundImage: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--dt-accent) 6%, transparent), transparent)",
          }}
        >
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: "var(--dt-main-gradient)" }} />
          <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 p-6 sm:p-8 lg:p-10">
            <div className="z-[1]">
              <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4 dt-anim-pulse-glow" style={{ background: "var(--dt-accent-soft)", color: ACCENT, border: "1px solid var(--dt-accent-border)" }}>
                <Radio className="w-3 h-3 animate-pulse" /> Workspace live
              </span>
              <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight text-[var(--foreground)] mb-2">
                Welcome back, <em className="not-italic" style={{ color: ACCENT }}>{firstName}</em>
              </h1>
              <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed mb-2">
                Your command centre for forms, responses, and insights. Everything below updates as your workspace activity grows.
              </p>
              <p className="text-xs text-[var(--muted-foreground)] max-w-lg leading-relaxed mb-6">
                {(dashboard?.totalResponses ?? 0) > 0 ? (
                  <>You have <strong className="text-[var(--foreground)]">{dashboard?.totalForms}</strong> form{(dashboard?.totalForms ?? 0) === 1 ? "" : "s"} and <strong className="text-[var(--foreground)]">{dashboard?.totalResponses}</strong> total responses. Open Analytics for trends or manage forms in the list below.</>
                ) : (
                  <>Create your first form, publish it, and share the link — stats and the live feed will populate automatically.</>
                )}
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <DashboardBtnLink href="/dashboard/forms/new" variant="primary" className="w-full sm:w-auto justify-center">
                  <Plus className="w-4 h-4" /> New Form
                </DashboardBtnLink>
                <DashboardBtnLink href="/dashboard/analytics" variant="ghost" className="w-full sm:w-auto justify-center">
                  <Activity className="w-4 h-4" /> Analytics
                </DashboardBtnLink>
              </div>
            </div>
            <div className="hidden lg:flex items-center dt-anim-float">
              <DashboardHomeIllustration className="w-full max-w-[340px] opacity-90" />
            </div>
          </div>
        </section>
      </DashboardAnimatedSection>

      {/* Stats */}
      <DashboardAnimatedSection animation="scale-in" delay={100}>
        <DashboardStatGrid>
          {stats.map((s) => (
            <DashboardStatCard key={s.label} label={s.label} value={s.value} desc={s.desc} icon={s.icon} />
          ))}
        </DashboardStatGrid>
      </DashboardAnimatedSection>

      {/* Guide + glossary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DashboardAnimatedSection animation="slide-in" delay={150} className="rounded-3xl border p-6 sm:p-7 dt-hover-lift" style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}>
          <div className="flex items-start gap-3 mb-5">
            <ListOrdered className="w-5 h-5 shrink-0 mt-0.5" style={{ color: ACCENT }} />
            <div>
              <h2 className="font-display text-lg text-[var(--foreground)]">Your workflow in 5 steps</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">From blank draft to actionable insights — the typical EdinForm journey.</p>
            </div>
          </div>
          <ol className="space-y-4">
            {WORKSPACE_STEPS.map(({ step, title, body }) => (
              <li key={step} className="flex gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "var(--dt-accent-soft)", color: ACCENT, border: "1px solid var(--dt-accent-border)" }}>{step}</span>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </DashboardAnimatedSection>

        <DashboardAnimatedSection animation="slide-in" delay={220} className="rounded-3xl border p-6 sm:p-7 dt-hover-lift" style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}>
          <div className="flex items-start gap-3 mb-5">
            <BookOpen className="w-5 h-5 shrink-0 mt-0.5" style={{ color: ACCENT }} />
            <div>
              <h2 className="font-display text-lg text-[var(--foreground)]">Dashboard quick reference</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">Terms you&apos;ll see on this page and what they mean.</p>
            </div>
          </div>
          <dl className="space-y-4">
            {QUICK_GUIDE.map(({ term, definition }) => (
              <div key={term}>
                <dt className="text-sm font-medium text-[var(--foreground)]">{term}</dt>
                <dd className="text-xs text-[var(--muted-foreground)] leading-relaxed mt-1">{definition}</dd>
              </div>
            ))}
          </dl>
        </DashboardAnimatedSection>
      </div>

      {/* Insights */}
      <DashboardAnimatedSection animation="fade-in" delay={280}>
        <section className="rounded-3xl border p-6 sm:p-7" style={{ background: "linear-gradient(135deg, var(--dt-accent-soft), var(--dt-card-bg) 55%)", borderColor: "var(--dt-accent-border)" }}>
          <div className="flex items-start gap-3 mb-5">
            <Lightbulb className="w-5 h-5" style={{ color: ACCENT }} />
            <div>
              <h2 className="font-display text-lg text-[var(--foreground)]">Suggested next steps</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Personalised tips based on your current workspace activity.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 dt-stagger">
            {insights.map((item) => (
              <div key={item.title} className="rounded-2xl p-5 dt-anim-scale-in dt-hover-lift" style={{ background: "var(--dt-card-bg)", border: "1px solid var(--dt-card-border)" }}>
                <p className="text-sm font-medium text-[var(--foreground)] mb-2">{item.title}</p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">{item.body}</p>
                {item.href && item.label && (
                  <Link href={item.href} className="text-xs font-medium inline-flex items-center gap-1" style={{ color: ACCENT }}>
                    {item.label} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      </DashboardAnimatedSection>

      {/* Forms + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <DashboardAnimatedSection animation="fade-up" delay={320}>
          <DashboardCard className="overflow-hidden p-0">
            <div className="p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Your forms</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Click a title to edit · use ⋯ for publish, share, duplicate</p>
              </div>
              <DashboardBtnLink href="/dashboard/forms/new" variant="primary" className="text-xs w-full sm:w-auto justify-center">
                <Plus className="w-4 h-4" /> New form
              </DashboardBtnLink>
            </div>

            {isLoading && (
              <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: ACCENT }} /></div>
            )}

            {!isLoading && forms?.length === 0 && (
              <div className="py-14 px-6 text-center">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color: ACCENT }} />
                <p className="font-display text-xl text-[var(--foreground)] mb-2">No forms yet</p>
                <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto leading-relaxed">Draft your first form in under a minute — add questions and publish when ready.</p>
                <DashboardBtnLink href="/dashboard/forms/new" variant="primary" className="justify-center">
                  <Plus className="w-4 h-4" /> Create a form
                </DashboardBtnLink>
              </div>
            )}

            {forms && forms.length > 0 && forms.map((form) => (
              <div
                key={form.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:px-5 border-b last:border-b-0 transition-colors"
                style={{ borderColor: "var(--border)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dt-accent-soft)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-accent-border)" }}>
                    <FileText className="w-4 h-4" style={{ color: ACCENT }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/dashboard/forms/${form.id}/edit`} className="font-display text-lg text-[var(--foreground)] hover:underline truncate max-w-[200px] sm:max-w-none">{form.title}</Link>
                      {visibilityBadge(form.visibility)}
                    </div>
                    <p className="text-[11px] font-mono text-[var(--muted-foreground)] mt-1">
                      {form.responseCount} replies · {form.viewCount} views
                      {form.conversionRate > 0 && ` · ${form.conversionRate.toFixed(0)}% CR`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {form.visibility !== "unpublished" && (
                    <button type="button" onClick={() => setQrForm({ title: form.title, slug: form.slug })} title="Share QR" className={`${dtBtnGhostClass()} !min-w-[44px] !min-h-[44px] !p-0`} style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-accent-border)" }}>
                      <QrCode className="w-4 h-4" />
                    </button>
                  )}
                  <Link href={`/dashboard/forms/${form.id}/responses`} title="Responses" className={`${dtBtnGhostClass()} !min-w-[44px] !min-h-[44px] !p-0`} style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-accent-border)" }}>
                    <BarChart3 className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      if (openMenu === form.id) { closeMenu(); return; }
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const right = window.innerWidth - rect.right;
                      const spaceBelow = window.innerHeight - rect.bottom;
                      setMenuPos(spaceBelow < 270 ? { bottom: window.innerHeight - rect.top + 6, right } : { top: rect.bottom + 6, right });
                      setOpenMenu(form.id);
                    }}
                    className={`${dtBtnGhostClass()} !min-w-[44px] !min-h-[44px] !p-0`}
                    style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-accent-border)" }}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </DashboardCard>
        </DashboardAnimatedSection>

        <div className="space-y-5">
          <DashboardAnimatedSection animation="scale-in" delay={380}>
            <DashboardCard className="p-0 overflow-hidden">
              <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Quick actions</p>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Jump to common tasks</p>
              </div>
              <div className="p-2">
                {[
                  { icon: Plus, label: "New form", sub: "Start from scratch", href: "/dashboard/forms/new" },
                  { icon: Users, label: "Analytics", sub: "Workspace insights", href: "/dashboard/analytics" },
                  { icon: Globe, label: "Explore forms", sub: "Public library", href: "/explore" },
                  { icon: Calendar, label: "Settings", sub: "Themes & account", href: "/dashboard/settings" },
                ].map(({ icon: Icon, label, sub, href }) => (
                  <Link key={label} href={href} className="flex items-center gap-3 p-3 rounded-xl transition-colors dt-touch-target min-h-[52px]" onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dt-accent-soft)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-accent-border)" }}>
                      <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">{sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </Link>
                ))}
              </div>
            </DashboardCard>
          </DashboardAnimatedSection>

          <DashboardAnimatedSection animation="fade-in" delay={440}>
            <DashboardCard className="p-5" style={{ background: "var(--dt-accent-soft)", borderColor: "var(--dt-accent-border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4" style={{ color: ACCENT }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>Pro tip</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Pin this dashboard in your browser during a launch. The forms list and Analytics live feed update automatically as responses arrive.
              </p>
            </DashboardCard>
          </DashboardAnimatedSection>
        </div>
      </div>

      {/* Features */}
      <DashboardAnimatedSection animation="fade-up" delay={500}>
        <section>
          <h2 className="font-display text-2xl text-[var(--foreground)] mb-2">Everything in EdinForm</h2>
          <p className="text-sm text-[var(--muted-foreground)] max-w-xl leading-relaxed mb-6">
            Built-in tools so you can create, share, and understand forms without switching apps.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 dt-stagger">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border p-5 dt-anim-scale-in dt-hover-lift" style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}>
                <f.icon className="w-5 h-5 mb-3" style={{ color: ACCENT }} />
                <p className="font-display text-lg text-[var(--foreground)] mb-1">{f.title}</p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </DashboardAnimatedSection>

      <p className="text-[11px] text-[var(--muted-foreground)] flex items-start gap-2 dt-anim-fade-in" style={{ animationDelay: "560ms" }}>
        <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: ACCENT }} />
        <span>Need help? Visit <Link href="/docs" className="underline" style={{ color: ACCENT }}>documentation</Link> or open Settings to change your dashboard theme.</span>
      </p>

      {openMenu && menuPos && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[9990]" onClick={closeMenu} />
          <div
            className="fixed z-[9999] rounded-xl p-1 w-[210px] shadow-2xl"
            style={{
              ...(menuPos.top !== undefined ? { top: menuPos.top } : {}),
              ...(menuPos.bottom !== undefined ? { bottom: menuPos.bottom } : {}),
              right: menuPos.right,
              background: "var(--dt-card-bg)",
              border: "1px solid var(--dt-card-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {forms?.filter((f) => f.id === openMenu).map((form) => (
              <div key={form.id}>
                <Link href={`/dashboard/forms/${form.id}/edit`} onClick={closeMenu} className="dt-touch-target flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm min-h-[44px] no-underline" style={{ color: "var(--foreground)" }} onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dt-accent-soft)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  <Layers className="w-4 h-4 shrink-0" style={{ color: ACCENT }} /> Edit &amp; Preview
                </Link>
                {form.visibility !== "unpublished" ? (
                  <MenuBtn icon={Lock} label="Unpublish" onClick={() => unpublishMutation.mutate({ id: form.id })} />
                ) : (
                  <MenuBtn icon={Globe} label="Publish" onClick={() => publishMutation.mutate({ id: form.id, visibility: "public" })} />
                )}
                <MenuBtn icon={Copy} label="Duplicate" onClick={() => duplicateMutation.mutate({ id: form.id })} />
                {form.visibility !== "unpublished" && (
                  <>
                    <MenuBtn icon={Copy} label="Copy Link" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/forms/${form.slug}`); toast.success("Link copied!"); closeMenu(); }} />
                    <MenuAnchor icon={ExternalLink} label="Open Form" href={`/forms/${form.slug}`} onNavigate={closeMenu} />
                  </>
                )}
                <div className="my-1 mx-2 border-t" style={{ borderColor: "var(--border)" }} />
                <MenuBtn icon={Trash2} label="Delete" danger onClick={() => { closeMenu(); if (confirm("Delete this form and all its responses?")) deleteMutation.mutate({ id: form.id }); }} />
              </div>
            ))}
          </div>
        </>,
        document.body
      )}

      {qrForm && <QRShareModal open={!!qrForm} onClose={() => setQrForm(null)} formTitle={qrForm.title} formSlug={qrForm.slug} />}
    </DashboardPageShell>
  );
}

function MenuBtn({ icon: Icon, label, onClick, danger = false }: { icon: React.ElementType; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className="dt-touch-target w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors min-h-[44px]" style={{ color: danger ? "#e05555" : "var(--foreground)" }} onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dt-accent-soft)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
      <Icon className="w-4 h-4 shrink-0" style={{ color: danger ? "#e05555" : ACCENT }} /> {label}
    </button>
  );
}

function MenuAnchor({ icon: Icon, label, href, onNavigate }: { icon: React.ElementType; label: string; href: string; onNavigate?: () => void }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={onNavigate} className="dt-touch-target flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors min-h-[44px]" style={{ color: "var(--foreground)" }} onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dt-accent-soft)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
      <Icon className="w-4 h-4 shrink-0" style={{ color: ACCENT }} /> {label}
    </a>
  );
}
