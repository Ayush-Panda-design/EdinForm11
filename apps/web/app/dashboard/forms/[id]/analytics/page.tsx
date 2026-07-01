"use client";

import { use } from "react";
import { trpc } from "~/trpc/client";
import {
  Eye,
  FileText,
  TrendingUp,
  Clock,
  Loader2,
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
  Legend,
} from "recharts";

import {
  DashboardPage,
  DashboardBackLink,
  DashboardStatGrid,
  DashboardStatCard,
  DashboardChartCard,
  DashboardSection,
  DashboardCard,
} from "~/components/dashboard/primitives";

const COLORS = [
  "var(--dt-accent)",
  "color-mix(in srgb, var(--dt-accent) 75%, #000)",
  "color-mix(in srgb, var(--dt-accent) 55%, #000)",
  "color-mix(in srgb, var(--dt-accent) 40%, #000)",
  "color-mix(in srgb, var(--dt-accent) 25%, #000)",
  "color-mix(in srgb, var(--dt-accent) 15%, #000)",
];

function HealthScoreRing({ score }: { score: number }) {
  const color = "var(--dt-accent)";

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
        <span
          className="text-2xl font-bold font-display"
          style={{ color }}
        >
          {score}
        </span>

        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

export default function FormAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: form } = trpc.forms.getById.useQuery({ id });

  const { data: analytics, isLoading } =
    trpc.analytics.getFormAnalytics.useQuery({
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
      value: analytics
        ? analytics.conversionRate.toFixed(1) + "%"
        : "0%",
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
      value: analytics
        ? analytics.uniqueResponseRatio.toFixed(1) + "%"
        : "0%",
      icon: Users,
    },
  ];

  return (
    <DashboardPage wide>
      <div className="flex items-center gap-4 mb-10">
        <DashboardBackLink href={"/dashboard/forms/" + id + "/edit"} />

        <div>
          <p className="dt-eyebrow">Form analytics</p>
          <h1 className="dt-title">{form?.title ?? "Analytics"}</h1>
          <p className="dt-subtitle">Performance overview from the last 30 days</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-7 h-7 animate-spin dt-accent-icon" />
        </div>
      ) : (
        <div className="space-y-8">
          <DashboardStatGrid cols={5}>
            {stats.map((s) => (
              <DashboardStatCard
                key={s.label}
                label={s.label}
                value={s.value}
                icon={s.icon}
              />
            ))}
          </DashboardStatGrid>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <DashboardChartCard title="Form Health Score" subtitle="Overall engagement quality">

              <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                <HealthScoreRing
                  score={analytics?.healthScore ?? 0}
                />

                <div className="space-y-4 text-sm w-full">
                  <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "var(--dt-accent-soft)" }}>
                    <span className="text-muted-foreground">Conversion Rate</span>
                    <span className="dt-accent-icon font-medium">
                      {analytics?.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "var(--dt-accent-soft)" }}>
                    <span className="text-muted-foreground">Unique Response Ratio</span>
                    <span className="dt-accent-icon font-medium">
                      {analytics?.uniqueResponseRatio.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "var(--dt-accent-soft)" }}>
                    <span className="text-muted-foreground">Recent Activity</span>
                    <span className="dt-accent-icon font-medium">
                      {(analytics?.hourlyVelocity?.length ?? 0) > 0 ? "Active" : "No activity"}
                    </span>
                  </div>
                </div>
              </div>
            </DashboardChartCard>

            <DashboardChartCard title="Response Velocity" subtitle="Hourly submission activity">

              {analytics?.hourlyVelocity &&
              analytics.hourlyVelocity.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={analytics.hourlyVelocity.map((h) => ({
                      ...h,
                      hour: new Date(h.hour).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      ),
                    }))}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />

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

                    <Bar
                      dataKey="count"
                      fill="var(--dt-accent)"
                      radius={[6, 6, 0, 0]}
                      name="Responses"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
                  No hourly data available
                </div>
              )}
            </DashboardChartCard>
          </div>

          {analytics?.dailyData && analytics.dailyData.length > 0 && (
            <DashboardChartCard title="Daily Performance" subtitle="Views and submissions over time">

                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={analytics.dailyData}>
                    <defs>
                      <linearGradient
                        id="views"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="var(--dt-accent)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--dt-accent)" stopOpacity={0} />
                      </linearGradient>

                      <linearGradient
                        id="subs"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="var(--dt-success)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--dt-success)" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />

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
                      stroke="var(--dt-accent)"
                      fill="url(#views)"
                      strokeWidth={2}
                      name="Views"
                    />
                    <Area
                      type="monotone"
                      dataKey="submissions"
                      stroke="var(--dt-success)"
                      fill="url(#subs)"
                      strokeWidth={2}
                      name="Submissions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
            </DashboardChartCard>
          )}

          {analytics?.dropoffFunnel && analytics.dropoffFunnel.length > 0 && (
            <DashboardSection title="Question Drop-off Funnel" subtitle="Completion rate across form fields">
              <DashboardCard className="p-7">

                <div className="space-y-5">
                  {analytics.dropoffFunnel.map((q, i) => {
                    const maxAnswered = Math.max(
                      ...analytics.dropoffFunnel.map(
                        (f) => f.answeredCount
                      ),
                      1
                    );

                    const pct = Math.round(
                      (q.answeredCount / maxAnswered) * 100
                    );

                    return (
                      <div key={q.fieldId}>
                        <div className="flex items-center justify-between mb-2 gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs dt-accent-icon shrink-0" style={{ background: "var(--dt-accent-soft)" }}>
                              {i + 1}
                            </div>

                            <span className="truncate text-sm text-foreground">
                              {q.label}
                            </span>
                          </div>

                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {q.answeredCount} answered ·{" "}
                            {q.dropoffRate}% drop-off
                          </span>
                        </div>

                        <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-card-border)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background:
                                COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DashboardCard>
            </DashboardSection>
          )}

          {analytics?.fieldSummaries && analytics.fieldSummaries.length > 0 && (
            <DashboardSection title="Field Summary Statistics" subtitle="Per-question answer distributions and value breakdowns">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {analytics.fieldSummaries.map((field, i) => (
                    <div
                      key={field.fieldId}
                      className="rounded-2xl p-5"
                      style={{ background: "var(--dt-card-bg)", border: "1px solid var(--dt-card-border)" }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="font-medium text-foreground">
                            {field.label}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                            {field.type.replace(/_/g, " ")} · {field.answeredCount} responses · {field.skipRate}% skip
                          </p>
                        </div>
                      </div>

                      {field.optionDistribution &&
                        field.optionDistribution.length > 0 && (
                          <div className="flex flex-col md:flex-row items-center gap-4">
                            <ResponsiveContainer width="100%" height={180}>
                              <PieChart>
                                <Pie
                                  data={field.optionDistribution}
                                  dataKey="count"
                                  nameKey="label"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={70}
                                  paddingAngle={2}
                                >
                                  {field.optionDistribution.map((_, idx) => (
                                    <Cell
                                      key={idx}
                                      fill={COLORS[idx % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value: number, _name, props) => [
                                    `${value} (${props.payload.percentage}%)`,
                                    props.payload.label,
                                  ]}
                                  contentStyle={{
                                    background: "#121214",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: "16px",
                                    color: "#fff",
                                  }}
                                />
                                <Legend
                                  wrapperStyle={{ fontSize: 11 }}
                                  formatter={(value) =>
                                    value.length > 18
                                      ? value.slice(0, 18) + "…"
                                      : value
                                  }
                                />
                              </PieChart>
                            </ResponsiveContainer>

                            <div className="flex-1 space-y-2 w-full">
                              {field.optionDistribution.map((opt, idx) => (
                                <div
                                  key={opt.value}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className="w-2 h-2 rounded-full shrink-0"
                                      style={{
                                        background: COLORS[idx % COLORS.length],
                                      }}
                                    />
                                    <span className="truncate text-foreground">
                                      {opt.label}
                                    </span>
                                  </div>
                                  <span className="text-muted-foreground whitespace-nowrap ml-2">
                                    {opt.count} ({opt.percentage}%)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {field.numericStats &&
                        field.numericStats.distribution.length > 0 && (
                          <div>
                            <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                              {[
                                { label: "Min", value: field.numericStats.min },
                                { label: "Max", value: field.numericStats.max },
                                { label: "Avg", value: field.numericStats.avg },
                                { label: "Median", value: field.numericStats.median },
                              ].map((s) => (
                                <div key={s.label} className="rounded-xl py-2 px-1" style={{ background: "var(--dt-accent-soft)" }}>
                                  <div className="text-lg font-display text-foreground">
                                    {s.value}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {s.label}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <ResponsiveContainer width="100%" height={140}>
                              <BarChart data={field.numericStats.distribution}>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="rgba(255,255,255,0.05)"
                                />
                                <XAxis
                                  dataKey="value"
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
                                <Bar
                                  dataKey="count"
                                  fill={COLORS[i % COLORS.length]}
                                  radius={[4, 4, 0, 0]}
                                  name="Responses"
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                      {field.textStats && (
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[
                            { label: "Avg length", value: field.textStats.avgLength },
                            { label: "Min", value: field.textStats.minLength },
                            { label: "Max", value: field.textStats.maxLength },
                          ].map((s) => (
                            <div key={s.label} className="rounded-xl py-3 px-2" style={{ background: "var(--dt-accent-soft)" }}>
                              <div className="text-lg font-display text-foreground">
                                {s.value}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {s.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {!field.optionDistribution?.length &&
                        !field.numericStats?.distribution.length &&
                        !field.textStats && (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            No answer data yet
                          </p>
                        )}
                    </div>
                  ))}
                </div>
            </DashboardSection>
          )}
        </div>
      )}
    </DashboardPage>
  );
}
