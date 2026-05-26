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

export default function AnalyticsDashboardPage() {
  // Configured to poll for absolute live real-time updates!
  const { data: dashboard, isLoading } = trpc.analytics.dashboard.useQuery(undefined, {
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
  });

  // Real-time recent submissions feed — polls every 3 seconds
  const { data: recentSubmissions, isLoading: isLoadingRecent } =
    trpc.analytics.recentSubmissions.useQuery(
      { limit: 20 },
      {
        refetchInterval: 3000,
        refetchOnWindowFocus: true,
      }
    );

  const [daysFilter, setDaysFilter] = useState<7 | 30 | 90>(30);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"views" | "responses" | "conversionRate">("responses");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-32">
        <Loader2 className="w-10 h-10 animate-spin text-stone-900 dark:text-stone-400" />
      </div>
    );
  }

  const filteredTrend =
    dashboard?.dailyTrend.filter((t) => {
      const date = parseISO(t.date);
      const minDate = subDays(new Date(), daysFilter);
      return date >= minDate;
    }) ?? [];

  const sortedBreakdown = [...(dashboard?.formBreakdown ?? [])]
    .filter((f) => f.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

  const topForms = [...(dashboard?.formBreakdown ?? [])]
    .sort((a, b) => b.responses - a.responses)
    .slice(0, 3);

  const stats = [
    { label: "Total Forms", value: dashboard?.totalForms ?? 0, icon: FileText, desc: "Active forms" },
    { label: "Total Views", value: dashboard?.totalViews ?? 0, icon: Eye, desc: "All view count" },
    { label: "Submissions", value: dashboard?.totalResponses ?? 0, icon: BarChart3, desc: "Form submissions" },
    {
      label: "Avg Conversion",
      value: dashboard ? dashboard.avgConversionRate.toFixed(1) + "%" : "0%",
      icon: TrendingUp,
      desc: "Views to conversion",
    },
  ];

  const handleSort = (field: "views" | "responses" | "conversionRate") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Analytics Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time insights across your entire EdinForm workspace
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 self-start">
          <Calendar className="w-4 h-4 text-gray-500 ml-2 mr-1" />
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              onClick={() => setDaysFilter(days)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                daysFilter === days
                  ? "bg-white dark:bg-gray-800 text-stone-900 dark:text-stone-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Last {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-stone-950/30 flex items-center justify-center mb-4">
              <s.icon className="w-5 h-5 text-stone-900 dark:text-stone-400" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {s.value}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1.5">{s.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Trend Chart & Top Forms Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Workspace Performance</h2>
              <p className="text-xs text-gray-500">Cumulative views and submissions trend</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-900 inline-block" />
                <span className="text-gray-600 dark:text-gray-400">Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-gray-600 dark:text-gray-400">Submissions</span>
              </div>
            </div>
          </div>

          <div className="h-[280px]">
            {filteredTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="subs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-gray-100 dark:stroke-gray-800"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(str) => {
                      try {
                        return format(parseISO(str), "MMM d");
                      } catch {
                        return str;
                      }
                    }}
                    tick={{ fontSize: 11 }}
                    className="text-gray-400"
                  />
                  <YAxis tick={{ fontSize: 11 }} className="text-gray-400" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(17, 24, 39, 0.95)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    labelFormatter={(label) => format(parseISO(label), "MMMM d, yyyy")}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fill="url(#views)"
                    name="Views"
                  />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#subs)"
                    name="Submissions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <BarChart3 className="w-10 h-10 mb-2 stroke-1" />
                <p className="text-sm">No activity recorded in this range</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Performers Spotlight */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Performing Forms</h2>
          </div>

          <div className="space-y-4 flex-1">
            {topForms.length > 0 ? (
              topForms.map((form, idx) => (
                <div
                  key={form.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 hover:border-stone-300 dark:hover:border-stone-900 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-400 bg-stone-100 dark:bg-stone-950/50 px-2 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {form.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span>{form.responses} submissions</span>
                      <span>{form.conversionRate.toFixed(0)}% CR</span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/forms/${form.id}/analytics`}
                    className="p-2 bg-white dark:bg-gray-900 hover:bg-stone-50 dark:hover:bg-stone-950/30 rounded-lg text-gray-500 hover:text-stone-900 dark:hover:text-stone-400 border border-gray-150 dark:border-gray-800 transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No forms created yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── REAL-TIME LIVE SUBMISSION FEED ───────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Submission Feed</h2>
              <p className="text-xs text-gray-500">
                Instantly updates when someone submits — no refresh needed
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live
          </span>
        </div>

        {isLoadingRecent ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-stone-900" />
          </div>
        ) : !recentSubmissions || recentSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No submissions yet — share your forms to start collecting responses!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
            {recentSubmissions.map((sub) => (
              <div
                key={sub.responseId}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 dark:hover:bg-gray-800/20 transition-colors group"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-900/30 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-stone-900 dark:text-stone-400" />
                </div>

                {/* Respondent info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {sub.respondentEmail ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                        <Mail className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                        {sub.respondentEmail}
                      </span>
                    ) : sub.respondentName ? (
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {sub.respondentName}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-gray-400 italic">Anonymous</span>
                    )}
                    {sub.respondentName && sub.respondentEmail && (
                      <span className="text-xs text-gray-400">({sub.respondentName})</span>
                    )}
                  </div>
                  <div className="mt-0.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {sub.formTitle}
                    </span>
                  </div>
                </div>

                {/* Time + Link */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(sub.submittedAt), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/forms/${sub.formId}/responses/${sub.responseId}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-stone-900 dark:hover:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-950/30 transition-colors opacity-0 group-hover:opacity-100"
                    title="View full response"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* ── END LIVE SUBMISSION FEED ─────────────────────────────────────── */}

      {/* Per-form breakdown table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-150 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Form Performance List</h2>
            <p className="text-xs text-gray-500">Key metrics broken down per form</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 w-full text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        {sortedBreakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-950/40 text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-150 dark:border-gray-800">
                  <th className="p-4 pl-6">Form Name</th>
                  <th
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleSort("views")}
                  >
                    <div className="flex items-center gap-1.5">
                      Views <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleSort("responses")}
                  >
                    <div className="flex items-center gap-1.5">
                      Submissions <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleSort("conversionRate")}
                  >
                    <div className="flex items-center gap-1.5">
                      Conversion Rate <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sortedBreakdown.map((form) => (
                  <tr
                    key={form.id}
                    className="text-sm hover:bg-gray-50/55 dark:hover:bg-gray-800/10 transition-colors"
                  >
                    <td className="p-4 pl-6 font-semibold text-gray-900 dark:text-white max-w-[240px] truncate">
                      {form.title}
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{form.views}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{form.responses}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 dark:text-gray-300 font-semibold">
                          {form.conversionRate.toFixed(1)}%
                        </span>
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-stone-900 dark:bg-stone-400 rounded-full"
                            style={{ width: `${Math.min(form.conversionRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/forms/${form.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors"
                          title="Open Form Live"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/dashboard/forms/${form.id}/analytics`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-50 hover:bg-stone-100 text-stone-900 dark:bg-stone-950/30 dark:hover:bg-stone-950/60 dark:text-stone-300 rounded-lg transition-colors border border-stone-100/20"
                        >
                          Full Analytics
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-400 stroke-1" />
            <p className="text-sm">No forms match your search queries</p>
          </div>
        )}
      </div>
    </div>
  );
}
