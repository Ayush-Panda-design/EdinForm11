"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { ArrowLeft, Eye, FileText, TrendingUp, Clock, Loader2, Activity, Heart, Users } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, FunnelChart, Funnel, Cell, LabelList,
} from "recharts";

const COLORS = ["#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#3b0764", "#2e1065"];

function HealthScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-500">/100</span>
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

  const stats = [
    { label: "Total Views", value: analytics?.totalViews ?? 0, icon: Eye, color: "text-blue-600" },
    { label: "Submissions", value: analytics?.totalSubmissions ?? 0, icon: FileText, color: "text-stone-900" },
    { label: "Conversion Rate", value: analytics ? analytics.conversionRate.toFixed(1) + "%" : "0%", icon: TrendingUp, color: "text-green-600" },
    { label: "Avg Completion", value: analytics?.avgCompletionSeconds ? Math.round(analytics.avgCompletionSeconds) + "s" : "—", icon: Clock, color: "text-orange-600" },
    { label: "Unique Ratio", value: analytics ? analytics.uniqueResponseRatio.toFixed(1) + "%" : "0%", icon: Users, color: "text-teal-600" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href={"/dashboard/forms/" + id + "/edit"} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{form?.title ?? "Analytics"}</h1>
          <p className="text-sm text-gray-500">Last 30 days</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-16"><Loader2 className="w-6 h-6 animate-spin text-stone-900" /></div>
      ) : (
        <div className="space-y-6">
          {/* Stats cards + Health Score */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                <div className={`${s.color} mb-2`}><s.icon className="w-5 h-5" /></div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Health Score + Hourly Velocity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Health Score */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-4 h-4 text-stone-700" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Form Health Score</h2>
              </div>
              <div className="flex items-center gap-6">
                <HealthScoreRing score={analytics?.healthScore ?? 0} />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-stone-500" />
                    <span className="text-gray-600 dark:text-gray-400">Conversion rate: {analytics?.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    <span className="text-gray-600 dark:text-gray-400">Unique ratio: {analytics?.uniqueResponseRatio.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-gray-600 dark:text-gray-400">Recent activity: {(analytics?.hourlyVelocity?.length ?? 0) > 0 ? "✓" : "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Velocity */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-stone-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Response Velocity (hourly)</h2>
              </div>
              {analytics?.hourlyVelocity && analytics.hourlyVelocity.length > 0 ? (
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={analytics.hourlyVelocity.map(h => ({ ...h, hour: new Date(h.hour).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }))}>
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#7c3aed" radius={[3, 3, 0, 0]} name="Responses" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[120px] flex items-center justify-center text-gray-400 text-sm">
                  No hourly data in range
                </div>
              )}
            </div>
          </div>

          {/* Daily chart */}
          {analytics?.dailyData && analytics.dailyData.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Submissions & Views</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={analytics.dailyData}>
                  <defs>
                    <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="subs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stroke="#7c3aed" fill="url(#views)" name="Views" />
                  <Area type="monotone" dataKey="submissions" stroke="#059669" fill="url(#subs)" name="Submissions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Drop-off Funnel */}
          {analytics?.dropoffFunnel && analytics.dropoffFunnel.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Per-Question Drop-off Funnel</h2>
              <div className="space-y-3">
                {analytics.dropoffFunnel.map((q, i) => {
                  const maxAnswered = Math.max(...analytics.dropoffFunnel.map(f => f.answeredCount), 1);
                  const pct = Math.round((q.answeredCount / maxAnswered) * 100);
                  return (
                    <div key={q.fieldId}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[60%]">
                          <span className="text-gray-400 mr-1">Q{i + 1}.</span>{q.label}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {q.answeredCount} answered · {q.dropoffRate}% drop-off
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
