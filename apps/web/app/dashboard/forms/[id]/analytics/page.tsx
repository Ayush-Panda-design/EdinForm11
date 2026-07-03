"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import {
  ArrowLeft,
  Eye,
  FileText,
  TrendingUp,
  Clock,
  Loader2,
  Activity,
  Heart,
  Users,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#22d3ee", "#0891b2", "#34d399", "#67e8f9", "#14b8a6", "#0e7490"];

function HealthScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#22d3ee" : score >= 50 ? "#0891b2" : "#f87171";

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />

        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.8s ease",
          }}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold font-display" style={{ color }}>
          {score}
        </span>

        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

export default function FormAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: form } = trpc.forms.getById.useQuery({ id });

  const { data: analytics, isLoading } = trpc.analytics.getFormAnalytics.useQuery({
    formId: id,
    groupBy: "day",
  });

  const { data: fieldAnalytics } = trpc.analytics.getFieldAnalytics.useQuery({
    formId: id,
    groupBy: "day",
  });

  const stats = [
    {
      label: "Total Views",
      value: analytics?.totalViews ?? 0,
      icon: Eye,
    },
    {
      label: "Submissions",
      value: analytics?.totalSubmissions ?? 0,
      icon: FileText,
    },
    {
      label: "Conversion Rate",
      value: analytics ? analytics.conversionRate.toFixed(1) + "%" : "0%",
      icon: TrendingUp,
    },
    {
      label: "Avg Completion",
      value: analytics?.avgCompletionSeconds
        ? Math.round(analytics.avgCompletionSeconds) + "s"
        : "—",
      icon: Clock,
    },
    {
      label: "Unique Ratio",
      value: analytics ? analytics.uniqueResponseRatio.toFixed(1) + "%" : "0%",
      icon: Users,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto ef-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Link
          href={"/dashboard/forms/" + id + "/edit"}
          className="h-11 w-11 rounded-2xl ef-glass flex items-center justify-center hover:scale-105 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </Link>

        <div>
          <h1 className="text-3xl font-display text-foreground">{form?.title ?? "Analytics"}</h1>

          <p className="text-sm text-muted-foreground mt-1">
            Performance overview from the last 30 days
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-7 h-7 animate-spin ef-amber" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="ef-card p-5 group">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-2xl ef-glass-soft flex items-center justify-center">
                    <s.icon className="w-5 h-5 ef-amber" />
                  </div>

                  <div className="w-2 h-2 rounded-full bg-[var(--accent-amber)] opacity-70 ef-pulse-amber" />
                </div>

                <div className="text-3xl font-display text-foreground">{s.value}</div>

                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Health + Velocity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Health */}
            <div className="ef-card p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl ef-glass-soft flex items-center justify-center">
                  <Heart className="w-4 h-4 ef-amber" />
                </div>

                <div>
                  <h2 className="font-display text-xl text-foreground">Form Health Score</h2>

                  <p className="text-sm text-muted-foreground">Overall engagement quality</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                <HealthScoreRing score={analytics?.healthScore ?? 0} />

                <div className="space-y-4 text-sm w-full">
                  <div className="flex items-center justify-between ef-glass-soft rounded-2xl px-4 py-3">
                    <span className="text-muted-foreground">Conversion Rate</span>

                    <span className="ef-amber font-medium">
                      {analytics?.conversionRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between ef-glass-soft rounded-2xl px-4 py-3">
                    <span className="text-muted-foreground">Unique Response Ratio</span>

                    <span className="ef-amber font-medium">
                      {analytics?.uniqueResponseRatio.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between ef-glass-soft rounded-2xl px-4 py-3">
                    <span className="text-muted-foreground">Recent Activity</span>

                    <span className="ef-amber font-medium">
                      {(analytics?.hourlyVelocity?.length ?? 0) > 0 ? "Active" : "No activity"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Velocity */}
            <div className="ef-card p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl ef-glass-soft flex items-center justify-center">
                  <Activity className="w-4 h-4 ef-amber" />
                </div>

                <div>
                  <h2 className="font-display text-xl text-foreground">Response Velocity</h2>

                  <p className="text-sm text-muted-foreground">Hourly submission activity</p>
                </div>
              </div>

              {analytics?.hourlyVelocity && analytics.hourlyVelocity.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={analytics.hourlyVelocity.map((h) => ({
                      ...h,
                      hour: new Date(h.hour).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10, fill: "#A1A1AA" }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{ fontSize: 10, fill: "#A1A1AA" }}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#121214",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "16px",
                        color: "#fff",
                      }}
                    />

                    <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} name="Responses" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
                  No hourly data available
                </div>
              )}
            </div>
          </div>

          {/* Daily Chart */}
          {analytics?.dailyData && analytics.dailyData.length > 0 && (
            <div className="ef-card p-7">
              <div className="mb-6">
                <h2 className="font-display text-2xl text-foreground">Daily Performance</h2>

                <p className="text-sm text-muted-foreground mt-1">
                  Views and submissions over time
                </p>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={analytics.dailyData}>
                  <defs>
                    <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />

                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="subs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891b2" stopOpacity={0.25} />

                      <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 11,
                      fill: "#A1A1AA",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "#A1A1AA",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#121214",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      color: "#fff",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#22d3ee"
                    fill="url(#views)"
                    strokeWidth={2}
                    name="Views"
                  />

                  <Area
                    type="monotone"
                    dataKey="submissions"
                    stroke="#0891b2"
                    fill="url(#subs)"
                    strokeWidth={2}
                    name="Submissions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Funnel */}
          {analytics?.dropoffFunnel && analytics.dropoffFunnel.length > 0 && (
            <div className="ef-card p-7">
              <div className="mb-6">
                <h2 className="font-display text-2xl text-foreground">Question Drop-off Funnel</h2>

                <p className="text-sm text-muted-foreground mt-1">
                  Completion rate across form fields
                </p>
              </div>

              <div className="space-y-5">
                {analytics.dropoffFunnel.map((q, i) => {
                  const maxAnswered = Math.max(
                    ...analytics.dropoffFunnel.map((f) => f.answeredCount),
                    1,
                  );

                  const pct = Math.round((q.answeredCount / maxAnswered) * 100);

                  return (
                    <div key={q.fieldId}>
                      <div className="flex items-center justify-between mb-2 gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-full ef-glass-soft flex items-center justify-center text-xs ef-amber shrink-0">
                            {i + 1}
                          </div>

                          <span className="truncate text-sm text-foreground">{q.label}</span>
                        </div>

                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {q.answeredCount} answered · {q.dropoffRate}% drop-off
                        </span>
                      </div>

                      <div className="h-3 rounded-full overflow-hidden bg-[var(--accent)] border border-[var(--border)]">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Field-wise answer analytics */}
          {fieldAnalytics && fieldAnalytics.length > 0 && (
            <div className="ef-card p-7">
              <div className="mb-6">
                <h2 className="font-display text-2xl text-foreground">Field Answer Summary</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Option distributions, ratings, and numeric aggregates per field
                </p>
              </div>

              <div className="space-y-8">
                {fieldAnalytics.map((field, idx) => (
                  <div key={field.fieldId} className="rounded-2xl p-5 ef-glass-soft">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <h3 className="font-medium text-foreground">{field.label}</h3>
                      <span className="text-xs text-muted-foreground">
                        {field.totalAnswers} answers · {field.skipRate}% skip rate
                      </span>
                    </div>

                    {field.optionCounts && field.optionCounts.length > 0 && (
                      <div className="grid md:grid-cols-2 gap-6 items-center">
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie
                              data={field.optionCounts.filter((o) => o.count > 0)}
                              dataKey="count"
                              nameKey="label"
                              cx="50%"
                              cy="50%"
                              outerRadius={70}
                              label={({ label, percentage }) => `${label} (${percentage}%)`}
                            >
                              {field.optionCounts.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                background: "#121214",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "16px",
                                color: "#fff",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2">
                          {field.optionCounts.map((opt, i) => (
                            <div
                              key={opt.value}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{
                                    background: COLORS[i % COLORS.length],
                                  }}
                                />
                                {opt.label}
                              </span>
                              <span className="text-muted-foreground">
                                {opt.count} ({opt.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {field.ratingDistribution && (
                      <div>
                        {field.avgRating !== undefined && (
                          <p className="text-sm text-muted-foreground mb-3">
                            Average rating:{" "}
                            <span className="ef-amber font-medium">
                              {field.avgRating} / {field.ratingDistribution.length}
                            </span>
                          </p>
                        )}
                        <ResponsiveContainer width="100%" height={140}>
                          <BarChart data={field.ratingDistribution}>
                            <XAxis dataKey="rating" tick={{ fontSize: 11, fill: "#A1A1AA" }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#A1A1AA" }} />
                            <Tooltip
                              contentStyle={{
                                background: "#121214",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "16px",
                                color: "#fff",
                              }}
                            />
                            <Bar
                              dataKey="count"
                              fill={COLORS[idx % COLORS.length]}
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {field.numericStats && (
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="ef-glass-soft rounded-xl py-3">
                          <p className="text-xs text-muted-foreground">Avg</p>
                          <p className="text-lg font-semibold ef-amber">{field.numericStats.avg}</p>
                        </div>
                        <div className="ef-glass-soft rounded-xl py-3">
                          <p className="text-xs text-muted-foreground">Min</p>
                          <p className="text-lg font-semibold text-foreground">
                            {field.numericStats.min}
                          </p>
                        </div>
                        <div className="ef-glass-soft rounded-xl py-3">
                          <p className="text-xs text-muted-foreground">Max</p>
                          <p className="text-lg font-semibold text-foreground">
                            {field.numericStats.max}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
