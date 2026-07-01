"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import {
  FileText, Eye, BarChart3, TrendingUp, Loader2,
  Search, ArrowUpDown, ExternalLink,
  ChevronRight, Mail, Clock, User,
  Radio, Trophy, Medal, Award, Activity,
  BookOpen, Lightbulb, ListOrdered, Share2, PenLine, HelpCircle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { format, parseISO, subDays, formatDistanceToNow } from "date-fns";
import { cn } from "~/lib/utils";

import {
  DashboardPage,
  DashboardFilterGroup,
  DashboardBtnLink,
  DashboardAnimatedSection,
} from "~/components/dashboard/primitives";
import {
  AnalyticsHeroIllustration,
  AnalyticsEmptyChartIllustration,
  LiveFeedIllustration,
} from "~/components/dashboard/analytics-visuals";

const ACCENT = "var(--dt-accent)";
const SUCCESS = "var(--dt-success)";

const PODIUM = [
  { rank: 2, height: "h-16", icon: Medal, label: "2nd" },
  { rank: 1, height: "h-24", icon: Trophy, label: "1st" },
  { rank: 3, height: "h-12", icon: Award, label: "3rd" },
] as const;

const METRIC_GLOSSARY = [
  {
    term: "Views",
    definition: "Every time someone opens your form link or scans its QR code. A single person can generate multiple views if they revisit.",
  },
  {
    term: "Submissions",
    definition: "Completed responses — someone finished the form and hit submit. This is your primary success metric.",
  },
  {
    term: "Conversion rate (CR)",
    definition: "Submissions divided by views, expressed as a percentage. A 25% CR means one in four visitors completes the form.",
  },
  {
    term: "Workspace trend",
    definition: "Daily views and submissions across all your forms. Use the 7d / 30d / 90d filter to spot short-term spikes or long-term patterns.",
  },
] as const;

const PAGE_GUIDE_STEPS = [
  {
    step: 1,
    title: "Scan the hero metrics",
    body: "Start with the four headline numbers at the top. They summarise your entire workspace — how many forms you run, how much traffic you get, and how well you convert visitors into replies.",
  },
  {
    step: 2,
    title: "Read the trend chart",
    body: "The area chart compares views (accent colour) against submissions (secondary colour). Gaps between the two lines show drop-off — when views rise but submissions stay flat, your form may be too long or unclear.",
  },
  {
    step: 3,
    title: "Check the leaderboard",
    body: "See which forms collect the most replies. Open any form's full analytics for field-level breakdowns, option charts, and per-question drop-off.",
  },
  {
    step: 4,
    title: "Watch the live feed",
    body: "New submissions appear here within seconds — no refresh needed. Click any row to open the full response and read answers in context.",
  },
  {
    step: 5,
    title: "Drill into form performance",
    body: "The breakdown section lists every form with sortable metrics. Use search to find a specific form, then open Details for deep analytics or the public link to share again.",
  },
] as const;

function getWorkspaceInsights(opts: {
  totalForms: number;
  totalViews: number;
  totalResponses: number;
  conversion: number;
  trendViews: number;
  trendSubs: number;
  daysFilter: number;
}) {
  const insights: { title: string; body: string; action?: { label: string; href: string } }[] = [];

  if (opts.totalForms === 0) {
    insights.push({
      title: "You haven't created a form yet",
      body: "Analytics will populate once you publish your first form and share the link. Start with a simple 3–5 question form — you can always add branching and limits later.",
      action: { label: "Create your first form", href: "/dashboard/forms/new" },
    });
    return insights;
  }

  if (opts.totalViews === 0) {
    insights.push({
      title: "No views recorded yet",
      body: "Publish a form and share the link via email, social, or QR code. Views are counted when someone opens the public form URL.",
      action: { label: "Go to dashboard", href: "/dashboard" },
    });
  }

  if (opts.trendViews > 0 && opts.trendSubs === 0) {
    insights.push({
      title: "Traffic without completions",
      body: `You had ${opts.trendViews} view${opts.trendViews === 1 ? "" : "s"} in the last ${opts.daysFilter} days but no submissions. Try shortening the form, clarifying the first question, or adding a progress bar in form settings.`,
    });
  }

  if (opts.conversion >= 50 && opts.totalResponses > 0) {
    insights.push({
      title: "Strong conversion",
      body: `Your workspace averages ${opts.conversion.toFixed(1)}% conversion — well above typical form benchmarks (10–30%). Consider duplicating your top-performing form structure for new projects.`,
    });
  } else if (opts.conversion > 0 && opts.conversion < 15 && opts.totalViews >= 5) {
    insights.push({
      title: "Room to improve conversion",
      body: "Industry forms often convert 15–40% of views. Shorter forms, one-question-at-a-time layout, and clear submit button text can help. Review your highest-traffic form's analytics for drop-off points.",
    });
  }

  if (opts.totalResponses > 0 && insights.length < 3) {
    insights.push({
      title: "Export and review responses",
      body: "Open any form's responses tab to read individual submissions or download everything as a spreadsheet for offline analysis.",
      action: { label: "View dashboard forms", href: "/dashboard" },
    });
  }

  if (insights.length === 0) {
    insights.push({
      title: "Keep sharing your forms",
      body: "Consistent distribution drives better trends. Re-share links after updates, add QR codes to print materials, and pin your best form in team channels.",
      action: { label: "Explore public forms", href: "/explore" },
    });
  }

  return insights.slice(0, 3);
}

export default function AnalyticsDashboardPage() {
  const { data: dashboard, isLoading } = trpc.analytics.dashboard.useQuery(undefined, {
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
  });
  const { data: recentSubmissions, isLoading: isLoadingRecent } =
    trpc.analytics.recentSubmissions.useQuery(
      { limit: 20 },
      { refetchInterval: 3000, refetchOnWindowFocus: true }
    );

  const [daysFilter, setDaysFilter] = useState<7 | 30 | 90>(30);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"views" | "responses" | "conversionRate">("responses");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin w-8 h-8" style={{ color: ACCENT }} />
        <p className="text-sm text-[var(--muted-foreground)]">Loading workspace insights…</p>
      </div>
    );
  }

  const filteredTrend = (dashboard?.dailyTrend ?? []).filter((t) => {
    const date = parseISO(t.date);
    return date >= subDays(new Date(), daysFilter);
  });

  const sortedBreakdown = [...(dashboard?.formBreakdown ?? [])]
    .filter((f) => f.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const vA = a[sortField], vB = b[sortField];
      return sortOrder === "asc" ? vA - vB : vB - vA;
    });

  const topForms = [...(dashboard?.formBreakdown ?? [])]
    .sort((a, b) => b.responses - a.responses)
    .slice(0, 3);

  const podiumData = PODIUM.map((slot) => ({
    ...slot,
    form: topForms[slot.rank - 1] ?? null,
  }));

  const totalViews = dashboard?.totalViews ?? 0;
  const totalResponses = dashboard?.totalResponses ?? 0;
  const conversion = dashboard?.avgConversionRate ?? 0;

  const heroStats = [
    { label: "Forms", value: dashboard?.totalForms ?? 0, icon: FileText, hint: "published & draft" },
    { label: "Views", value: totalViews, icon: Eye, hint: "all-time impressions" },
    { label: "Submissions", value: totalResponses, icon: BarChart3, hint: "total collected" },
    { label: "Conversion", value: `${conversion.toFixed(1)}%`, icon: TrendingUp, hint: "views → replies" },
  ];

  const trendViews = filteredTrend.reduce((s, d) => s + d.views, 0);
  const trendSubs = filteredTrend.reduce((s, d) => s + d.submissions, 0);

  const handleSort = (field: "views" | "responses" | "conversionRate") => {
    if (sortField === field) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortOrder("desc"); }
  };

  const insights = getWorkspaceInsights({
    totalForms: dashboard?.totalForms ?? 0,
    totalViews,
    totalResponses,
    conversion,
    trendViews,
    trendSubs,
    daysFilter,
  });

  const periodConversion = trendViews > 0 ? ((trendSubs / trendViews) * 100).toFixed(1) : "0.0";
  const topForm = topForms[0];

  return (
    <DashboardPage wide className="space-y-8">
      {/* ── Hero ── */}
      <DashboardAnimatedSection animation="fade-up">
      <section
        className="relative overflow-hidden rounded-3xl border dt-anim-shimmer"
        style={{
          borderColor: "var(--dt-card-border)",
          background: "linear-gradient(135deg, var(--dt-card-bg) 0%, color-mix(in srgb, var(--dt-accent) 8%, var(--dt-main-bg)) 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{ background: "var(--dt-main-gradient)" }}
        />
        <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 p-6 sm:p-8 lg:p-10">
          <div className="min-w-0 z-[1]">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: "var(--dt-accent-soft)", color: ACCENT, border: "1px solid var(--dt-accent-border)" }}
              >
                <Radio className="w-3 h-3 animate-pulse" />
                Live analytics
              </span>
              <DashboardFilterGroup
                options={[
                  { label: "7d", value: 7 },
                  { label: "30d", value: 30 },
                  { label: "90d", value: 90 },
                ]}
                value={daysFilter}
                onChange={(v) => setDaysFilter(v as 7 | 30 | 90)}
              />
            </div>

            <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-[1.05] text-[var(--foreground)] mb-2">
              Your workspace{" "}
              <em className="not-italic" style={{ color: ACCENT }}>pulse</em>
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed mb-3">
              Real-time views, submissions, and conversion — everything happening across your forms in one glance.
              This page refreshes automatically so you can keep it open while campaigns run.
            </p>
            <p className="text-xs text-[var(--muted-foreground)] max-w-lg leading-relaxed mb-8 opacity-90">
              {totalResponses > 0 ? (
                <>
                  Your workspace has collected <strong className="text-[var(--foreground)] font-medium">{totalResponses}</strong> submission{totalResponses === 1 ? "" : "s"} from{" "}
                  <strong className="text-[var(--foreground)] font-medium">{totalViews}</strong> total view{totalViews === 1 ? "" : "s"}.
                  {topForm && (
                    <> Your top form right now is <strong className="text-[var(--foreground)] font-medium">{topForm.title}</strong> with {topForm.responses} repl{topForm.responses === 1 ? "y" : "ies"}.</>
                  )}
                </>
              ) : totalViews > 0 ? (
                <>You have <strong className="text-[var(--foreground)] font-medium">{totalViews}</strong> view{totalViews === 1 ? "" : "s"} but no submissions yet — check that your forms are published and the first questions are easy to answer.</>
              ) : (
                <>Publish a form and share its link to start collecting data. Analytics will appear here within seconds of the first visit.</>
              )}
            </p>

            {/* inline metrics strip */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border"
              style={{ borderColor: "var(--dt-card-border)", background: "var(--dt-card-border)" }}
            >
              {heroStats.map(({ label, value, icon: Icon, hint }) => (
                <div
                  key={label}
                  className="p-4 sm:p-5"
                  style={{ background: "color-mix(in srgb, var(--dt-card-bg) 92%, var(--dt-accent) 8%)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{label}</span>
                  </div>
                  <p className="font-display text-2xl sm:text-3xl text-[var(--foreground)] leading-none">{value}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-1.5 hidden sm:block">{hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center w-[min(100%,380px)] opacity-90 dt-anim-float">
            <AnalyticsHeroIllustration className="w-full max-w-[360px] h-auto drop-shadow-2xl" />
          </div>
        </div>
      </section>
      </DashboardAnimatedSection>

      {/* ── Glossary + page guide ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section
          className="rounded-3xl border p-6 sm:p-7 dt-hover-lift dt-anim-slide-in"
          style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}
        >
          <div className="flex items-start gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-accent-border)" }}
            >
              <BookOpen className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h2 className="font-display text-lg text-[var(--foreground)]">What these metrics mean</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                A quick reference so you know exactly what each number represents before you act on it.
              </p>
            </div>
          </div>
          <dl className="space-y-4">
            {METRIC_GLOSSARY.map(({ term, definition }) => (
              <div key={term}>
                <dt className="text-sm font-medium text-[var(--foreground)] mb-1">{term}</dt>
                <dd className="text-xs text-[var(--muted-foreground)] leading-relaxed">{definition}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          className="rounded-3xl border p-6 sm:p-7 dt-hover-lift dt-anim-slide-in"
          style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}
        >
          <div className="flex items-start gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-accent-border)" }}
            >
              <ListOrdered className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h2 className="font-display text-lg text-[var(--foreground)]">How to read this page</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                Follow these five steps top-to-bottom — each section builds on the one above it.
              </p>
            </div>
          </div>
          <ol className="space-y-4">
            {PAGE_GUIDE_STEPS.map(({ step, title, body }) => (
              <li key={step} className="flex gap-4">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: "var(--dt-accent-soft)", color: ACCENT, border: "1px solid var(--dt-accent-border)" }}
                >
                  {step}
                </span>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)] mb-1">{title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* ── Dynamic insights ── */}
      <section
        className="rounded-3xl border p-6 sm:p-7"
        style={{
          background: "linear-gradient(135deg, var(--dt-accent-soft) 0%, var(--dt-card-bg) 50%)",
          borderColor: "var(--dt-accent-border)",
        }}
      >
        <div className="flex items-start gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--dt-card-bg)", border: "1px solid var(--dt-accent-border)" }}
          >
            <Lightbulb className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <div>
            <h2 className="font-display text-lg text-[var(--foreground)]">Insights & recommended next steps</h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed max-w-2xl">
              Based on your current workspace data. These update as your forms collect more views and responses.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-5"
              style={{ background: "var(--dt-card-bg)", border: "1px solid var(--dt-card-border)" }}
            >
              <p className="text-sm font-medium text-[var(--foreground)] mb-2">{item.title}</p>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-4">{item.body}</p>
              {item.action && (
                <Link
                  href={item.action.href}
                  className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: ACCENT }}
                >
                  {item.action.label} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Bento: chart + podium + insight ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Main chart */}
        <div
          className="xl:col-span-8 rounded-3xl border p-6 sm:p-7 relative overflow-hidden"
          style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4" style={{ color: ACCENT }} />
                <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Trend</span>
              </div>
              <h2 className="font-display text-xl text-[var(--foreground)]">Views & submissions</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-md leading-relaxed">
                Last {daysFilter} days · {trendViews} views · {trendSubs} submissions
                {trendViews > 0 && (
                  <> · <span style={{ color: ACCENT }}>{periodConversion}%</span> period conversion</>
                )}
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-2 max-w-lg leading-relaxed hidden sm:block">
                Hover over the chart to see exact daily figures. A healthy form typically shows submissions tracking views — if the gap widens on busy days, respondents may be abandoning mid-form.
              </p>
            </div>
            <div className="flex gap-5 text-[11px] text-[var(--muted-foreground)]">
              <span className="flex items-center gap-2">
                <span className="w-3 h-0.5 rounded-full" style={{ background: ACCENT }} /> Views
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-0.5 rounded-full" style={{ background: SUCCESS }} /> Submissions
              </span>
            </div>
          </div>

          <div className="h-[280px] sm:h-[300px]">
            {filteredTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredTrend} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gSubs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SUCCESS} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={SUCCESS} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 8" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(s) => { try { return format(parseISO(s), "MMM d"); } catch { return s; } }}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--dt-card-bg)",
                      borderRadius: "12px",
                      border: "1px solid var(--dt-accent-border)",
                      color: "var(--foreground)",
                      fontSize: "12px",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                    }}
                    labelFormatter={(l) => { try { return format(parseISO(l), "MMMM d, yyyy"); } catch { return l; } }}
                  />
                  <Area type="monotone" dataKey="views" stroke={ACCENT} strokeWidth={2} fill="url(#gViews)" name="Views" />
                  <Area type="monotone" dataKey="submissions" stroke={SUCCESS} strokeWidth={2} fill="url(#gSubs)" name="Submissions" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                <AnalyticsEmptyChartIllustration />
                <p className="text-sm text-[var(--muted-foreground)]">No activity in this range yet</p>
                <p className="text-xs text-[var(--muted-foreground)] opacity-70">Share a form to start seeing trends</p>
              </div>
            )}
          </div>

          <div
            className="mt-5 pt-5 border-t text-xs text-[var(--muted-foreground)] leading-relaxed"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="flex items-start gap-2">
              <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: ACCENT }} />
              <span>
                <strong className="text-[var(--foreground)] font-medium">Tip:</strong> Switch between 7d, 30d, and 90d using the filter in the hero.
                Short windows highlight campaign spikes; longer windows reveal whether growth is sustained or one-off.
              </span>
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          {/* Podium */}
          <div
            className="rounded-3xl border p-6 flex-1"
            style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] mb-1">Leaderboard</p>
                <h2 className="font-display text-lg text-[var(--foreground)]">Top forms</h2>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-1.5 leading-relaxed max-w-[220px]">
                  Ranked by total submissions. Use this to see which topics and formats resonate most with your audience.
                </p>
              </div>
              <Trophy className="w-5 h-5 shrink-0" style={{ color: ACCENT }} />
            </div>

            {topForms.length > 0 ? (
              <>
                <div className="flex items-end justify-center gap-3 mb-6 px-2">
                  {podiumData.map(({ rank, height, icon: Icon, form }) => (
                    <div key={rank} className="flex flex-col items-center flex-1 max-w-[100px]">
                      {form ? (
                        <>
                          <Icon className="w-5 h-5 mb-2" style={{ color: rank === 1 ? ACCENT : "var(--muted-foreground)" }} />
                          <p className="text-[11px] font-medium text-[var(--foreground)] text-center line-clamp-2 mb-2 min-h-[2rem]">
                            {form.title}
                          </p>
                          <p className="text-[10px] font-mono mb-2" style={{ color: ACCENT }}>{form.responses} replies</p>
                        </>
                      ) : (
                        <p className="text-[10px] text-[var(--muted-foreground)] mb-2">—</p>
                      )}
                      <div
                        className={cn("w-full rounded-t-xl transition-all", height)}
                        style={{
                          background: form
                            ? `linear-gradient(180deg, color-mix(in srgb, var(--dt-accent) ${rank === 1 ? 55 : 30}%, transparent) 0%, var(--dt-accent-soft) 100%)`
                            : "var(--dt-accent-soft)",
                          border: "1px solid var(--dt-accent-border)",
                          borderBottom: "none",
                        }}
                      />
                      <span className="text-[10px] font-mono mt-1 text-[var(--muted-foreground)]">#{rank}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {topForms.map((form, idx) => (
                    <Link
                      key={form.id}
                      href={`/dashboard/forms/${form.id}/analytics`}
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors group"
                      style={{ background: "var(--dt-accent-soft)", border: "1px solid transparent" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--dt-accent-border)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                    >
                      <span className="text-xs font-mono font-bold w-6" style={{ color: ACCENT }}>#{idx + 1}</span>
                      <span className="flex-1 text-sm truncate text-[var(--foreground)]">{form.title}</span>
                      <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{form.conversionRate.toFixed(0)}% CR</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: ACCENT }} />
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <PenLine className="w-8 h-8 mx-auto mb-3 opacity-40" style={{ color: ACCENT }} />
                <p className="text-sm text-[var(--foreground)] font-medium mb-1">No rankings yet</p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-4 px-4">
                  Once you have multiple forms with submissions, they will appear here ranked by reply count.
                </p>
                <DashboardBtnLink href="/dashboard/forms/new" variant="primary" className="text-xs">
                  Create a form
                </DashboardBtnLink>
              </div>
            )}
          </div>

          {/* Funnel insight */}
          <div
            className="rounded-3xl border p-5"
            style={{
              background: "linear-gradient(160deg, var(--dt-accent-soft) 0%, var(--dt-card-bg) 60%)",
              borderColor: "var(--dt-accent-border)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)] mb-3">Funnel snapshot</p>
            <div className="space-y-3">
              {[
                { label: "Views", value: totalViews, pct: 100 },
                { label: "Submissions", value: totalResponses, pct: totalViews > 0 ? (totalResponses / totalViews) * 100 : 0 },
              ].map((step, i) => (
                <div key={step.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[var(--muted-foreground)]">{step.label}</span>
                    <span className="font-mono text-[var(--foreground)]">{step.value}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--dt-card-bg)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(step.pct, i === 0 ? 8 : 4)}%`,
                        background: i === 0 ? ACCENT : SUCCESS,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] mt-4 leading-relaxed text-[var(--muted-foreground)]">
              <span style={{ color: ACCENT, fontWeight: 600 }}>{conversion.toFixed(1)}%</span> average conversion across all forms.
              {totalViews > 0 && totalResponses > 0 && (
                <> That means roughly <span className="text-[var(--foreground)] font-medium">{Math.round(totalViews / Math.max(totalResponses, 1))}</span> views per completed submission workspace-wide.</>
              )}
            </p>
            <p className="text-[10px] mt-2 text-[var(--muted-foreground)] leading-relaxed opacity-80">
              Funnel shows how many visitors become respondents. If the second bar is much shorter than the first, focus on form length and clarity.
            </p>
          </div>
        </div>
      </div>

      {/* ── Live feed timeline ── */}
      <section
        className="rounded-3xl border overflow-hidden"
        style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}
      >
        <div className="p-6 sm:p-7 border-b flex flex-wrap items-center justify-between gap-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-4">
            <LiveFeedIllustration />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl text-[var(--foreground)]">Live submission feed</h2>
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                  style={{ background: "color-mix(in srgb, var(--dt-success) 15%, transparent)", color: SUCCESS, border: "1px solid color-mix(in srgb, var(--dt-success) 30%, transparent)" }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: SUCCESS }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: SUCCESS }} />
                  </span>
                  Live
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed max-w-md">
                New submissions appear here within seconds — no refresh needed. Click any entry to read the full response, export data, or jump to that form&apos;s analytics.
              </p>
            </div>
          </div>
          <div className="hidden sm:block max-w-xs text-right">
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-2">What you can do</p>
            <ul className="text-[11px] text-[var(--muted-foreground)] space-y-1.5 leading-relaxed">
              <li className="flex items-center justify-end gap-1.5"><Share2 className="w-3 h-3" /> Share forms to grow this feed</li>
              <li className="flex items-center justify-end gap-1.5"><Eye className="w-3 h-3" /> Click a row to open the response</li>
              <li className="flex items-center justify-end gap-1.5"><BarChart3 className="w-3 h-3" /> Open form analytics for field stats</li>
            </ul>
          </div>
        </div>

        {isLoadingRecent ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin w-6 h-6" style={{ color: ACCENT }} />
          </div>
        ) : !recentSubmissions?.length ? (
          <div className="py-12 px-6 sm:px-10">
            <div className="max-w-lg mx-auto text-center mb-8">
              <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: ACCENT }} />
              <p className="text-sm text-[var(--foreground)] font-medium mb-2">No submissions yet</p>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                The live feed will stream new responses here as they arrive. To get started: publish a form, copy its link from the dashboard, and share it with your audience.
              </p>
            </div>
            <ol className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { n: 1, title: "Publish", text: "Set a form to Public or Unlisted in the editor." },
                { n: 2, title: "Share", text: "Send the link, embed QR code, or post on social." },
                { n: 3, title: "Watch", text: "Submissions appear here automatically." },
              ].map(({ n, title, text }) => (
                <li
                  key={n}
                  className="rounded-xl p-4 text-left"
                  style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-accent-border)" }}
                >
                  <span className="text-xs font-bold" style={{ color: ACCENT }}>Step {n}</span>
                  <p className="text-sm font-medium text-[var(--foreground)] mt-1 mb-1">{title}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="p-6 sm:p-7">
            <div className="relative">
              <div
                className="absolute left-[19px] top-3 bottom-3 w-px"
                style={{ background: "linear-gradient(180deg, var(--dt-accent) 0%, var(--dt-success) 50%, transparent 100%)" }}
              />
              <ul className="space-y-1">
                {recentSubmissions.map((sub) => (
                  <li key={sub.responseId}>
                    <Link
                      href={`/dashboard/forms/${sub.formId}/responses/${sub.responseId}`}
                      className="flex items-start gap-4 p-3 rounded-2xl transition-colors group"
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dt-accent-soft)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <div
                        className="relative z-[1] w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2"
                        style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-accent-border)" }}
                      >
                        <User className="w-4 h-4" style={{ color: ACCENT }} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-[var(--foreground)]">
                            {sub.respondentEmail ?? sub.respondentName ?? "Anonymous"}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: "var(--dt-accent-soft)", color: ACCENT }}>
                            {sub.formTitle}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--muted-foreground)] mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })}
                          <span className="opacity-50">·</span>
                          {format(new Date(sub.submittedAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: ACCENT }} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* ── Form performance ── */}
      <section>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div className="max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] mb-1">Breakdown</p>
            <h2 className="font-display text-2xl text-[var(--foreground)] mb-2">Form performance</h2>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Every form in your workspace, compared side by side. Click any metric label to sort — views, submissions, or conversion rate.
              The bar under each title is relative traffic (longest bar = most views in this list).
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-2 leading-relaxed opacity-90">
              Open <strong className="text-[var(--foreground)] font-medium">Details</strong> for per-form analytics including field-level charts and option breakdowns.
              Use the external link icon to preview the live public form.
            </p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search forms…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ef-input dt-input pl-9 pr-4 py-2.5 rounded-xl text-sm w-full sm:w-56"
              style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}
            />
          </div>
        </div>

        {sortedBreakdown.length > 0 ? (
          <div className="space-y-2">
            {sortedBreakdown.map((form) => {
              const maxViews = Math.max(...sortedBreakdown.map((f) => f.views), 1);
              const viewPct = (form.views / maxViews) * 100;
              return (
                <div
                  key={form.id}
                  className="rounded-2xl border p-4 sm:p-5 transition-all hover:-translate-y-px"
                  style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--dt-accent-border)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--dt-card-border)"; }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg text-[var(--foreground)] truncate mb-2">{form.title}</h3>
                      <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "var(--dt-accent-soft)" }}>
                        <div className="h-full rounded-full" style={{ width: `${viewPct}%`, background: ACCENT, opacity: 0.7 }} />
                      </div>
                      <div className="flex flex-wrap gap-4 text-[11px] font-mono text-[var(--muted-foreground)]">
                        <button type="button" className="flex items-center gap-1 hover:text-[var(--foreground)]" onClick={() => handleSort("views")}>
                          <Eye className="w-3 h-3" /> {form.views} views
                          {sortField === "views" && <ArrowUpDown className="w-3 h-3" />}
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-[var(--foreground)]" onClick={() => handleSort("responses")}>
                          <BarChart3 className="w-3 h-3" /> {form.responses} subs
                          {sortField === "responses" && <ArrowUpDown className="w-3 h-3" />}
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-[var(--foreground)]" onClick={() => handleSort("conversionRate")}>
                          <TrendingUp className="w-3 h-3" /> {form.conversionRate.toFixed(1)}% CR
                          {sortField === "conversionRate" && <ArrowUpDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-2xl"
                        style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-accent-border)" }}
                      >
                        <span className="font-display text-xl leading-none" style={{ color: ACCENT }}>{form.conversionRate.toFixed(0)}</span>
                        <span className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]">CR %</span>
                      </div>
                      <DashboardBtnLink href={`/forms/${form.slug}`} variant="ghost" className="p-2.5" target="_blank">
                        <ExternalLink className="w-4 h-4" />
                      </DashboardBtnLink>
                      <DashboardBtnLink href={`/dashboard/forms/${form.id}/analytics`} variant="primary" className="text-xs px-4">
                        Details
                      </DashboardBtnLink>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-2xl border py-16 px-6 text-center"
            style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}
          >
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm text-[var(--foreground)] font-medium mb-1">No forms match your search</p>
            <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto leading-relaxed">
              Try a different keyword or clear the search box to see all forms again.
            </p>
          </div>
        )}

        <p className="text-[11px] text-[var(--muted-foreground)] mt-6 leading-relaxed flex items-start gap-2 max-w-3xl">
          <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: ACCENT }} />
          <span>
            <strong className="text-[var(--foreground)] font-medium">Need more detail?</strong> Workspace analytics summarise all forms.
            For question-by-question stats, open a form&apos;s individual analytics page from the Details button or your dashboard forms list.
          </span>
        </p>
      </section>
    </DashboardPage>
  );
}
