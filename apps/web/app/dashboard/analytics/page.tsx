"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import {
  FileText, Eye, BarChart3, TrendingUp, Loader2,
  Calendar, Search, ArrowUpDown, ExternalLink,
  ChevronRight, Sparkles, Mail, Clock, User, Zap,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { format, parseISO, subDays, formatDistanceToNow } from "date-fns";

/* ── shared tokens ── */
const AMBER = "#C89B63";
const AMBER_DIM = "#8B7355";
const GREEN = "#58745C";

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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "8rem" }}>
        <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: AMBER }} />
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

  const stats = [
    { label: "Total Forms",    value: dashboard?.totalForms ?? 0,                              icon: FileText,   desc: "Active forms" },
    { label: "Total Views",    value: dashboard?.totalViews ?? 0,                              icon: Eye,        desc: "All view count" },
    { label: "Submissions",    value: dashboard?.totalResponses ?? 0,                          icon: BarChart3,  desc: "Form submissions" },
    { label: "Avg Conversion", value: dashboard ? dashboard.avgConversionRate.toFixed(1) + "%" : "0%", icon: TrendingUp, desc: "Views to conversion" },
  ];

  const handleSort = (field: "views" | "responses" | "conversionRate") => {
    if (sortField === field) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("desc"); }
  };

  /* ── shared section card style ── */
  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    backdropFilter: "blur(24px)",
  };

  const th: React.CSSProperties = {
    padding: "10px 16px",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.28em",
    color: "var(--muted-foreground)",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    borderBottom: "1px solid var(--border)",
    textAlign: "left",
    background: "rgba(255,255,255,0.02)",
  };

  const td: React.CSSProperties = {
    padding: "12px 16px",
    fontSize: "13px",
    color: "var(--foreground)",
    fontFamily: "'Inter', sans-serif",
    borderBottom: "1px solid var(--border)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)", marginBottom: "6px" }}>
            Analytics
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 400, color: "var(--foreground)", lineHeight: 1.1,
            }}>
              Workspace <em style={{ color: AMBER }}>Overview</em>
            </h1>
            {/* live dot */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "3px 10px", borderRadius: "999px", fontSize: "11px",
              fontWeight: 600, letterSpacing: "0.08em",
              background: "rgba(88,116,92,0.15)", color: "#7EB884",
              border: "1px solid rgba(88,116,92,0.25)", marginTop: "4px",
            }}>
              <span style={{ position: "relative", display: "flex", width: 8, height: 8 }}>
                <span className="animate-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#7EB884", opacity: 0.6 }} />
                <span style={{ position: "relative", width: 8, height: 8, borderRadius: "50%", background: "#7EB884", display: "block" }} />
              </span>
              Live
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "5px" }}>
            Real-time insights across your EdinForm workspace.
          </p>
        </div>

        {/* Days filter */}
        <div style={{
          display: "flex", alignItems: "center", gap: "4px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)", borderRadius: "12px", padding: "4px",
        }}>
          <Calendar style={{ width: 13, height: 13, color: "var(--muted-foreground)", marginLeft: "6px", marginRight: "2px" }} />
          {([7, 30, 90] as const).map((days) => (
            <button key={days} onClick={() => setDaysFilter(days)} style={{
              padding: "6px 12px", borderRadius: "8px", fontSize: "12px",
              fontFamily: "'Inter', sans-serif", border: "none", cursor: "pointer",
              transition: "all 0.18s",
              background: daysFilter === days ? "rgba(200,155,99,0.12)" : "transparent",
              color: daysFilter === days ? AMBER : "var(--muted-foreground)",
              boxShadow: daysFilter === days ? "inset 0 0 0 1px rgba(200,155,99,0.2)" : "none",
              fontWeight: daysFilter === days ? 600 : 400,
            }}>
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {stats.map(({ label, value, icon: Icon, desc }, i) => (
          <div key={label} className="ef-card" style={{ padding: "1.25rem", animation: `ef-fade-up .6s ease ${i * 60}ms both` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)" }}>{label}</span>
              <Icon style={{ width: 13, height: 13, color: AMBER, opacity: 0.7 }} />
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", color: "var(--foreground)", lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "4px" }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* ── Chart + Top Forms ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }} className="lg:grid-cols-3-custom">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }} className="analytics-grid">

          {/* Area chart */}
          <div style={{ ...card, padding: "1.5rem", gridColumn: "1" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)", marginBottom: "4px" }}>Performance</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", color: "var(--foreground)" }}>Workspace Trend</h2>
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: "var(--muted-foreground)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: AMBER, display: "inline-block" }} /> Views
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, display: "inline-block" }} /> Submissions
                </span>
              </div>
            </div>

            <div style={{ height: 260 }}>
              {filteredTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredTrend} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={AMBER} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gSubs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GREEN} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date"
                      tickFormatter={(s) => { try { return format(parseISO(s), "MMM d"); } catch { return s; } }}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "monospace" }}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,15,17,0.95)",
                        borderRadius: "12px",
                        border: "1px solid rgba(200,155,99,0.2)",
                        color: "#F5F1EA",
                        fontSize: "12px",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      labelFormatter={(l) => { try { return format(parseISO(l), "MMMM d, yyyy"); } catch { return l; } }}
                    />
                    <Area type="monotone" dataKey="views" stroke={AMBER} strokeWidth={1.5} fill="url(#gViews)" name="Views" />
                    <Area type="monotone" dataKey="submissions" stroke={GREEN} strokeWidth={1.5} fill="url(#gSubs)" name="Submissions" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)" }}>
                  <BarChart3 style={{ width: 32, height: 32, marginBottom: "8px", opacity: 0.4 }} />
                  <p style={{ fontSize: "13px" }}>No activity in this range</p>
                </div>
              )}
            </div>
          </div>

          {/* Top forms */}
          <div style={{ ...card, padding: "1.5rem", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
              <Sparkles style={{ width: 15, height: 15, color: AMBER }} />
              <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)" }}>Top Forms</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              {topForms.length > 0 ? topForms.map((form, idx) => (
                <div key={form.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px", borderRadius: "12px",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: "border-color 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,155,99,0.2)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"}
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      <span style={{
                        fontSize: "10px", fontWeight: 700, fontFamily: "monospace",
                        color: AMBER, background: "rgba(200,155,99,0.1)",
                        padding: "1px 6px", borderRadius: "4px",
                      }}>#{idx + 1}</span>
                      <p style={{ fontSize: "13px", color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.title}</p>
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)", fontFamily: "monospace" }}>
                      {form.responses} replies · {form.conversionRate.toFixed(0)}% CR
                    </p>
                  </div>
                  <Link href={`/dashboard/forms/${form.id}/analytics`}
                    style={{
                      padding: "6px", borderRadius: "8px", display: "flex",
                      color: "var(--muted-foreground)", textDecoration: "none",
                      background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                      transition: "color 0.15s, background 0.15s", flexShrink: 0,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = AMBER; (e.currentTarget as HTMLElement).style.background = "rgba(200,155,99,0.08)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                  >
                    <ChevronRight style={{ width: 14, height: 14 }} />
                  </Link>
                </div>
              )) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)", fontSize: "13px" }}>
                  No forms yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Feed ── */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(88,116,92,0.12)", border: "1px solid rgba(88,116,92,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap style={{ width: 15, height: 15, color: "#7EB884" }} />
            </div>
            <div>
              <p style={{ fontSize: "14px", color: "var(--foreground)", marginBottom: "1px" }}>Live Submission Feed</p>
              <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>Updates every 3 seconds — no refresh needed</p>
            </div>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 10px",
            borderRadius: "999px", fontSize: "11px", fontWeight: 600,
            background: "rgba(88,116,92,0.15)", color: "#7EB884", border: "1px solid rgba(88,116,92,0.25)",
          }}>
            <span style={{ position: "relative", display: "flex", width: 7, height: 7 }}>
              <span className="animate-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#7EB884", opacity: 0.6 }} />
              <span style={{ position: "relative", width: 7, height: 7, borderRadius: "50%", background: "#7EB884", display: "block" }} />
            </span>
            Live
          </span>
        </div>

        {isLoadingRecent ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <Loader2 className="animate-spin" style={{ width: 20, height: 20, color: AMBER }} />
          </div>
        ) : !recentSubmissions || recentSubmissions.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(200,155,99,0.08)", border: "1px solid rgba(200,155,99,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <Mail style={{ width: 18, height: 18, color: AMBER }} />
            </div>
            <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>No submissions yet — share your forms to start collecting responses.</p>
          </div>
        ) : (
          <div>
            {recentSubmissions.map((sub, idx) => (
              <div key={sub.responseId} style={{
                display: "flex", alignItems: "center", gap: "1rem",
                padding: "14px 24px",
                borderBottom: idx < recentSubmissions.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(200,155,99,0.08)", border: "1px solid rgba(200,155,99,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User style={{ width: 14, height: 14, color: AMBER }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "2px" }}>
                    {sub.respondentEmail ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "var(--foreground)" }}>
                        <Mail style={{ width: 11, height: 11, color: "var(--muted-foreground)" }} />
                        {sub.respondentEmail}
                      </span>
                    ) : sub.respondentName ? (
                      <span style={{ fontSize: "13px", color: "var(--foreground)" }}>{sub.respondentName}</span>
                    ) : (
                      <span style={{ fontSize: "13px", color: "var(--muted-foreground)", fontStyle: "italic" }}>Anonymous</span>
                    )}
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.formTitle}</p>
                </div>

                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <p style={{ fontSize: "11px", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end", marginBottom: "2px", fontFamily: "monospace" }}>
                    <Clock style={{ width: 10, height: 10 }} />
                    {formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })}
                  </p>
                  <p style={{ fontSize: "10px", color: "var(--muted-foreground)", fontFamily: "monospace", opacity: 0.7 }}>
                    {format(new Date(sub.submittedAt), "MMM d · h:mm a")}
                  </p>
                </div>

                <Link href={`/dashboard/forms/${sub.formId}/responses/${sub.responseId}`}
                  style={{ padding: "6px", borderRadius: "8px", display: "flex", color: "var(--muted-foreground)", textDecoration: "none", flexShrink: 0, transition: "color 0.15s, background 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = AMBER; (e.currentTarget as HTMLElement).style.background = "rgba(200,155,99,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <ChevronRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Per-form breakdown table ── */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)", marginBottom: "4px" }}>Breakdown</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "var(--foreground)" }}>Form Performance</h2>
          </div>
          <div style={{ position: "relative" }}>
            <Search style={{ width: 13, height: 13, position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              type="text"
              placeholder="Search forms…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ef-input"
              style={{ paddingLeft: "30px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", borderRadius: "10px", fontSize: "13px", fontFamily: "'Inter', sans-serif", width: "220px" }}
            />
          </div>
        </div>

        {sortedBreakdown.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    { label: "Form", field: null },
                    { label: "Views", field: "views" },
                    { label: "Submissions", field: "responses" },
                    { label: "Conversion", field: "conversionRate" },
                    { label: "", field: null },
                  ].map(({ label, field }, i) => (
                    <th key={i} style={{ ...th, cursor: field ? "pointer" : "default" }}
                      onClick={() => field && handleSort(field as "views" | "responses" | "conversionRate")}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {label}
                        {field && <ArrowUpDown style={{ width: 11, height: 11, opacity: 0.5 }} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedBreakdown.map((form) => (
                  <tr key={form.id}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    style={{ transition: "background 0.15s" }}
                  >
                    <td style={{ ...td, fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {form.title}
                    </td>
                    <td style={{ ...td, fontFamily: "monospace", fontSize: "12px" }}>{form.views}</td>
                    <td style={{ ...td, fontFamily: "monospace", fontSize: "12px" }}>{form.responses}</td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{form.conversionRate.toFixed(1)}%</span>
                        <div style={{ width: 56, height: 3, background: "rgba(255,255,255,0.07)", borderRadius: "999px", overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(form.conversionRate, 100)}%`, height: "100%", background: AMBER, borderRadius: "999px" }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <a href={`/forms/${form.slug}`} target="_blank" rel="noreferrer"
                          style={{ padding: "5px", borderRadius: "7px", display: "flex", color: "var(--muted-foreground)", textDecoration: "none", transition: "color 0.15s, background 0.15s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = AMBER; (e.currentTarget as HTMLElement).style.background = "rgba(200,155,99,0.08)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <ExternalLink style={{ width: 14, height: 14 }} />
                        </a>
                        <Link href={`/dashboard/forms/${form.id}/analytics`}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "4px 10px", borderRadius: "8px", fontSize: "11px",
                            textDecoration: "none", fontFamily: "'Inter', sans-serif",
                            color: AMBER, background: "rgba(200,155,99,0.08)",
                            border: "1px solid rgba(200,155,99,0.15)",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(200,155,99,0.15)"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(200,155,99,0.08)"}
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
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--muted-foreground)" }}>
            <Search style={{ width: 28, height: 28, margin: "0 auto 8px", opacity: 0.4 }} />
            <p style={{ fontSize: "13px" }}>No forms match your search</p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .analytics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
