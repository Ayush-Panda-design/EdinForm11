"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import {
  FileText,
  Eye,
  BarChart3,
  TrendingUp,
  Loader2,
  Calendar,
  Search,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Mail,
  Clock,
  User,
  Zap,
  Plus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, subDays, formatDistanceToNow } from "date-fns";
import { useTheme } from "~/providers/theme-provider";
import { AnalyticsSparkArt, EmptyFormsArt } from "~/components/dashboard/illustrations";
import { HelpTip } from "~/components/help/help-tip";

export default function AnalyticsDashboardPage() {
  const { theme } = useTheme();
  const accent = theme === "light" ? "#e11d8f" : "#22d3ee";
  const accent2 = theme === "light" ? "#22d3ee" : "#34d399";
  const gridStroke = theme === "light" ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.06)";
  const tooltipBg = theme === "light" ? "#ffffff" : "#0c0c0e";
  const tooltipText = theme === "light" ? "#1e293b" : "#fafafa";
  const tooltipBorder = theme === "light" ? "rgba(225,29,143,0.25)" : "rgba(34,211,238,0.25)";
  const hoverBg = theme === "light" ? "rgba(15,23,42,0.03)" : "rgba(255,255,255,0.03)";
  const trackBg = theme === "light" ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.08)";

  const { data: dashboard, isLoading } = trpc.analytics.dashboard.useQuery(undefined, {
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
  const { data: recentSubmissions, isLoading: isLoadingRecent } =
    trpc.analytics.recentSubmissions.useQuery(
      { limit: 20 },
      { refetchInterval: 15000, refetchOnWindowFocus: true },
    );

  const [daysFilter, setDaysFilter] = useState<7 | 30 | 90>(30);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"views" | "responses" | "conversionRate">("responses");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-7 h-7 animate-spin dash-accent" />
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
      const vA = a[sortField];
      const vB = b[sortField];
      return sortOrder === "asc" ? vA - vB : vB - vA;
    });

  const topForms = [...(dashboard?.formBreakdown ?? [])]
    .sort((a, b) => b.responses - a.responses)
    .slice(0, 3);

  const stats = [
    {
      label: "Total Forms",
      value: dashboard?.totalForms ?? 0,
      icon: FileText,
      desc: "Active forms",
    },
    { label: "Total Views", value: dashboard?.totalViews ?? 0, icon: Eye, desc: "All view count" },
    {
      label: "Submissions",
      value: dashboard?.totalResponses ?? 0,
      icon: BarChart3,
      desc: "Form submissions",
    },
    {
      label: "Avg Conversion",
      value: dashboard ? `${dashboard.avgConversionRate.toFixed(1)}%` : "0%",
      icon: TrendingUp,
      desc: "Views to conversion",
    },
  ];

  const handleSort = (field: "views" | "responses" | "conversionRate") => {
    if (sortField === field) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold dash-faint mb-2">
            Analytics
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-semibold tracking-tight dash-text">
              Workspace <span className="dash-accent">Overview</span>
            </h1>
            <HelpTip section="analytics" size="md" />
            <span
              className="kpi-chip"
              style={{
                color: "var(--dash-success)",
                borderColor: "color-mix(in srgb, var(--dash-success) 30%, transparent)",
                background: "color-mix(in srgb, var(--dash-success) 12%, transparent)",
              }}
            >
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inset-0 rounded-full bg-[var(--dash-success)] opacity-60" />
                <span className="relative w-2 h-2 rounded-full bg-[var(--dash-success)]" />
              </span>
              Live
            </span>
          </div>
          <p className="mt-2 text-sm dash-muted">
            Real-time insights across your EdinForm workspace.
          </p>
        </div>

        <div
          className="flex items-center gap-1 rounded-xl border dash-border p-1"
          style={{ background: "var(--dash-card)" }}
        >
          <Calendar className="w-3.5 h-3.5 dash-faint ml-2" />
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setDaysFilter(days)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: daysFilter === days ? "var(--dash-accent-soft)" : "transparent",
                color: daysFilter === days ? "var(--dash-accent)" : "var(--dash-muted)",
                boxShadow:
                  daysFilter === days ? "inset 0 0 0 1px var(--dash-accent-border)" : "none",
              }}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, desc }) => (
          <div key={label} className="ef-bento">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold dash-faint">
                {label}
              </span>
              <Icon className="w-4 h-4 dash-accent" />
            </div>
            <p className="dash-stat-value">{value}</p>
            <p className="mt-1 text-xs dash-muted">{desc}</p>
          </div>
        ))}
      </div>

      {/* Chart + Top forms */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="ef-bento lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold dash-faint mb-1">
                Performance
              </p>
              <h2 className="text-lg font-bold dash-text">Workspace trend</h2>
            </div>
            <div className="flex items-center gap-4 text-xs dash-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: accent }} /> Views
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: accent2 }} />{" "}
                Submissions
              </span>
            </div>
          </div>

          <div className="h-[260px]">
            {filteredTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredTrend} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accent} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={accent} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gSubs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accent2} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={accent2} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(s) => {
                      try {
                        return format(parseISO(s), "MMM d");
                      } catch {
                        return s;
                      }
                    }}
                    tick={{ fontSize: 10, fill: "var(--dash-faint)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--dash-faint)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: tooltipBg,
                      borderRadius: 12,
                      border: `1px solid ${tooltipBorder}`,
                      color: tooltipText,
                      fontSize: 12,
                      boxShadow: "var(--dash-shadow)",
                    }}
                    labelFormatter={(l) => {
                      try {
                        return format(parseISO(l), "MMMM d, yyyy");
                      } catch {
                        return l;
                      }
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke={accent}
                    strokeWidth={2}
                    fill="url(#gViews)"
                    name="Views"
                  />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    stroke={accent2}
                    strokeWidth={2}
                    fill="url(#gSubs)"
                    name="Submissions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center dash-muted">
                <AnalyticsSparkArt className="w-32 h-14 mb-3 opacity-70" />
                <p className="text-sm font-medium dash-text">No activity in this range</p>
                <p className="text-xs mt-1">Publish a form and share it to see trends here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="ef-bento flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 dash-accent" />
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold dash-faint">
              Top forms
            </p>
          </div>

          <div className="flex flex-col gap-2.5 flex-1">
            {topForms.length > 0 ? (
              topForms.map((form, idx) => (
                <div
                  key={form.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl border dash-border"
                  style={{ background: "var(--dash-accent-soft)" }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="kpi-chip !py-0.5 !px-1.5 text-[10px]">#{idx + 1}</span>
                      <p className="text-sm font-semibold dash-text truncate">{form.title}</p>
                    </div>
                    <p className="text-xs dash-muted">
                      {form.responses} replies · {form.conversionRate.toFixed(0)}% CR
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/forms/${form.id}/analytics`}
                    className="ef-btn-ghost rounded-lg w-8 h-8 inline-flex items-center justify-center shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <EmptyFormsArt className="w-36 h-auto mb-3 opacity-80" />
                <p className="text-sm font-semibold dash-text">No forms yet</p>
                <p className="text-xs dash-muted mt-1 mb-4">
                  Create a form to start tracking performance.
                </p>
                <Link
                  href="/dashboard/forms/new"
                  className="ef-btn-primary rounded-full px-4 py-2 text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> New form
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live feed */}
      <div className="ef-bento !p-0 overflow-hidden">
        <div className="px-5 py-4 border-b dash-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "color-mix(in srgb, var(--dash-success) 12%, transparent)",
                border: "1px solid color-mix(in srgb, var(--dash-success) 25%, transparent)",
              }}
            >
              <Zap className="w-4 h-4" style={{ color: "var(--dash-success)" }} />
            </div>
            <div>
              <p className="text-sm font-semibold dash-text">Live submission feed</p>
              <p className="text-xs dash-muted">Instant via WebSocket · 15s fallback sync</p>
            </div>
          </div>
          <span
            className="kpi-chip"
            style={{
              color: "var(--dash-success)",
              borderColor: "color-mix(in srgb, var(--dash-success) 30%, transparent)",
              background: "color-mix(in srgb, var(--dash-success) 12%, transparent)",
            }}
          >
            Live
          </span>
        </div>

        {isLoadingRecent ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin dash-accent" />
          </div>
        ) : !recentSubmissions || recentSubmissions.length === 0 ? (
          <div className="py-14 px-6 text-center">
            <div
              className="w-11 h-11 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{
                background: "var(--dash-accent-soft)",
                border: "1px solid var(--dash-accent-border)",
              }}
            >
              <Mail className="w-4 h-4 dash-accent" />
            </div>
            <p className="text-sm dash-muted">
              No submissions yet — share your forms to start collecting responses.
            </p>
          </div>
        ) : (
          <div>
            {recentSubmissions.map((sub, idx) => (
              <div
                key={sub.responseId}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                style={{
                  borderBottom:
                    idx < recentSubmissions.length - 1 ? "1px solid var(--dash-border)" : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = hoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--dash-accent-soft)",
                    border: "1px solid var(--dash-accent-border)",
                  }}
                >
                  <User className="w-3.5 h-3.5 dash-accent" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dash-text truncate">
                    {sub.respondentEmail || sub.respondentName || "Anonymous"}
                  </p>
                  <p className="text-xs dash-muted truncate">{sub.formTitle}</p>
                </div>

                <div className="shrink-0 text-right hidden sm:block">
                  <p className="text-xs dash-muted inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })}
                  </p>
                  <p className="text-[10px] dash-faint mt-0.5">
                    {format(new Date(sub.submittedAt), "MMM d · h:mm a")}
                  </p>
                </div>

                <Link
                  href={`/dashboard/forms/${sub.formId}/responses/${sub.responseId}`}
                  className="ef-btn-ghost rounded-lg w-8 h-8 inline-flex items-center justify-center shrink-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Breakdown table */}
      <div className="ef-bento !p-0 overflow-hidden">
        <div className="px-5 py-4 border-b dash-border flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold dash-faint mb-1">
              Breakdown
            </p>
            <h2 className="text-lg font-bold dash-text">Form performance</h2>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 dash-faint" />
            <input
              type="text"
              placeholder="Search forms…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ef-input rounded-xl pl-9 pr-3 py-2 text-sm w-[220px]"
            />
          </div>
        </div>

        {sortedBreakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: "var(--dash-accent-soft)" }}>
                  {[
                    { label: "Form", field: null },
                    { label: "Views", field: "views" as const },
                    { label: "Submissions", field: "responses" as const },
                    { label: "Conversion", field: "conversionRate" as const },
                    { label: "", field: null },
                  ].map(({ label, field }, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.16em] font-semibold dash-faint"
                      style={{ cursor: field ? "pointer" : "default" }}
                      onClick={() => field && handleSort(field)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {label}
                        {field && <ArrowUpDown className="w-3 h-3 opacity-50" />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedBreakdown.map((form) => (
                  <tr
                    key={form.id}
                    className="border-t dash-border transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-semibold dash-text max-w-[240px] truncate">
                      {form.title}
                    </td>
                    <td className="px-4 py-3 text-sm dash-muted tabular-nums">{form.views}</td>
                    <td className="px-4 py-3 text-sm dash-muted tabular-nums">{form.responses}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm dash-text tabular-nums">
                          {form.conversionRate.toFixed(1)}%
                        </span>
                        <div
                          className="w-14 h-1.5 rounded-full overflow-hidden"
                          style={{ background: trackBg }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(form.conversionRate, 100)}%`,
                              background: accent,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`/forms/${form.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ef-btn-ghost rounded-lg w-8 h-8 inline-flex items-center justify-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <Link
                          href={`/dashboard/forms/${form.id}/analytics`}
                          className="kpi-chip !rounded-lg"
                        >
                          Full analytics
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 text-center dash-muted">
            <Search className="w-7 h-7 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No forms match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
