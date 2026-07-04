"use client";

import { useState, useEffect } from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import {
  Loader2,
  Users,
  FileText,
  BarChart3,
  Globe,
  Trash2,
  Search,
  ShieldCheck,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Monitor,
  Eye,
  TrendingUp,
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
import { format, parseISO, subDays } from "date-fns";
import { useAuth } from "~/providers/auth-provider";
import { useRouter } from "next/navigation";
import { HelpTip } from "~/components/help/help-tip";

type AdminTab = "overview" | "users" | "forms" | "sessions" | "analytics";

const AMBER = "#22d3ee";

/* ── shared inline style tokens ── */
const T = {
  label: {
    fontSize: "11px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.28em",
    color: "var(--muted-foreground)",
    fontFamily: "'Inter', sans-serif",
  },
  mono: {
    fontFamily: "monospace",
    fontSize: "11px",
    letterSpacing: "0.06em",
    color: "var(--muted-foreground)",
  },
  cell: {
    padding: "12px 16px",
    fontSize: "13px",
    color: "var(--foreground)",
    fontFamily: "'Inter', sans-serif",
    borderBottom: "1px solid var(--border)",
  },
  th: {
    padding: "10px 16px",
    fontSize: "10px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.28em",
    color: "var(--muted-foreground)",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    borderBottom: "1px solid var(--border)",
    textAlign: "left" as const,
  },
};

function VisBadge({ v }: { v: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    public: { bg: "rgba(88,116,92,0.15)", color: "#7EB884", border: "rgba(88,116,92,0.3)" },
    unlisted: { bg: "rgba(34,211,238,0.12)", color: "#22d3ee", border: "rgba(34,211,238,0.25)" },
    unpublished: {
      bg: "rgba(255,255,255,0.04)",
      color: "var(--muted-foreground)",
      border: "rgba(255,255,255,0.07)",
    },
  };
  const s = map[v] ?? map["unpublished"]!;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "10px",
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {v}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "10px",
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        background: isAdmin ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.04)",
        color: isAdmin ? "#22d3ee" : "var(--muted-foreground)",
        border: isAdmin ? "1px solid rgba(34,211,238,0.25)" : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {isAdmin && <ShieldCheck style={{ width: 10, height: 10 }} />}
      {role}
    </span>
  );
}

function PageBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="ef-btn-ghost"
      style={{
        padding: "6px",
        borderRadius: "8px",
        display: "flex",
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [formSearch, setFormSearch] = useState("");
  const [formPage, setFormPage] = useState(1);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionPage, setSessionPage] = useState(1);
  const [analyticsDays, setAnalyticsDays] = useState<7 | 30 | 90>(30);
  const [formAnalyticsSearch, setFormAnalyticsSearch] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") router.push("/dashboard");
  }, [user, router]);

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = trpc.admin.getStats.useQuery();
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = trpc.admin.listUsers.useQuery(
    { page: userPage, limit: 20, search: userSearch || undefined },
    { enabled: tab === "users" },
  );
  const {
    data: formsData,
    isLoading: formsLoading,
    refetch: refetchForms,
  } = trpc.admin.listForms.useQuery(
    { page: formPage, limit: 20, search: formSearch || undefined },
    { enabled: tab === "forms" },
  );
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = trpc.admin.listActiveSessions.useQuery(
    { page: sessionPage, limit: 20, search: sessionSearch || undefined },
    { enabled: tab === "sessions", refetchInterval: 10000 },
  );
  const {
    data: platformAnalytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = trpc.admin.getPlatformAnalytics.useQuery(undefined, {
    enabled: tab === "analytics" || tab === "overview",
    refetchInterval: tab === "analytics" ? 5000 : false,
  });

  const setRoleMutation = trpc.admin.setUserRole.useMutation({
    onSuccess: () => {
      toast.success("Role updated");
      refetchUsers();
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteFormMutation = trpc.admin.deleteForm.useMutation({
    onSuccess: () => {
      toast.success("Form deleted");
      refetchForms();
      refetchStats();
    },
    onError: (e) => toast.error(e.message),
  });

  /* access denied */
  if (!user || user.role !== "admin") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6rem 2rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <ShieldOff
            style={{
              width: 40,
              height: 40,
              color: "var(--muted-foreground)",
              margin: "0 auto 1rem",
            }}
          />
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.3rem",
              color: "var(--foreground)",
            }}
          >
            Admin access required.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as AdminTab, label: "Overview", icon: BarChart3 },
    { id: "sessions" as AdminTab, label: "Logged In", icon: Monitor },
    { id: "analytics" as AdminTab, label: "Analytics", icon: TrendingUp },
    { id: "users" as AdminTab, label: "Users", icon: Users },
    { id: "forms" as AdminTab, label: "All Forms", icon: FileText },
  ];

  const filteredTrend = (platformAnalytics?.dailyTrend ?? []).filter((t) => {
    const date = parseISO(t.date);
    return date >= subDays(new Date(), analyticsDays);
  });

  const filteredFormBreakdown = (platformAnalytics?.formBreakdown ?? [])
    .filter((f) => f.title.toLowerCase().includes(formAnalyticsSearch.toLowerCase()))
    .sort((a, b) => b.responses - a.responses);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <p style={T.label}>Administration</p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 400,
              color: "var(--foreground)",
              lineHeight: 1.1,
              marginTop: "6px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <ShieldCheck style={{ width: 22, height: 22, color: "#22d3ee" }} />
            Admin <em style={{ color: "#22d3ee" }}>Dashboard</em>
            <HelpTip section="admin" size="md" />
          </h1>
          <p style={{ marginTop: "6px", fontSize: "13px", color: "var(--muted-foreground)" }}>
            Manage users, sessions, forms, and platform-wide analytics.
          </p>
        </div>
        <button
          onClick={() => {
            refetchStats();
            refetchUsers();
            refetchForms();
            refetchSessions();
            refetchAnalytics();
          }}
          className="ef-btn-ghost"
          style={{ padding: "8px", borderRadius: "10px", display: "flex", marginTop: "4px" }}
          title="Refresh"
        >
          <RefreshCw style={{ width: 15, height: 15 }} />
        </button>
      </div>

      {/* ── Tabs ── */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "4px",
          marginBottom: "2rem",
          overflowX: "auto",
        }}
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: "1 0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "9px",
                fontSize: "12px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                background: active ? "rgba(34,211,238,0.12)" : "transparent",
                color: active ? "#22d3ee" : "var(--muted-foreground)",
                boxShadow: active ? "inset 0 0 0 1px rgba(34,211,238,0.2)" : "none",
              }}
            >
              <Icon style={{ width: 14, height: 14 }} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ══════ OVERVIEW ══════ */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {statsLoading ? (
            <Spinner />
          ) : stats ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
              }}
            >
              {[
                { label: "Total Users", value: stats.totalUsers, icon: Users },
                {
                  label: "Logged In Now",
                  value: platformAnalytics?.activeSessions ?? "—",
                  icon: Monitor,
                },
                { label: "Total Forms", value: stats.totalForms, icon: FileText },
                { label: "Published Forms", value: stats.publishedForms, icon: Globe },
                { label: "Total Responses", value: stats.totalResponses, icon: BarChart3 },
                { label: "Total Views", value: platformAnalytics?.totalViews ?? "—", icon: Eye },
              ].map(({ label, value, icon: Icon }, i) => (
                <div
                  key={label}
                  className="ef-card"
                  style={{ padding: "1.25rem", animation: `ef-fade-up .6s ease ${i * 60}ms both` }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1rem",
                    }}
                  >
                    <span style={T.label}>{label}</span>
                    <Icon style={{ width: 13, height: 13, color: "#22d3ee", opacity: 0.7 }} />
                  </div>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "2rem",
                      fontWeight: 400,
                      color: "var(--foreground)",
                      lineHeight: 1,
                    }}
                  >
                    {typeof value === "number" ? value.toLocaleString() : value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {/* tip */}
          <div
            style={{
              padding: "1rem 1.25rem",
              borderRadius: "12px",
              background: "rgba(34,211,238,0.07)",
              border: "1px solid rgba(34,211,238,0.15)",
              fontSize: "13px",
              color: "var(--muted-foreground)",
              lineHeight: 1.6,
            }}
          >
            <span style={{ color: "#22d3ee", fontWeight: 600 }}>Tip — </span>
            Use Logged In to see active sessions, Analytics for platform-wide metrics, Users to
            manage roles, and All Forms to moderate content.
          </div>
        </div>
      )}

      {/* ══════ LOGGED IN (SESSIONS) ══════ */}
      {tab === "sessions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {sessionsData && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "1rem",
              }}
            >
              {[
                { label: "Active Sessions", value: sessionsData.total, icon: Monitor },
                { label: "Unique Users", value: sessionsData.uniqueUsers, icon: Users },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="ef-card" style={{ padding: "1rem 1.25rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <span style={T.label}>{label}</span>
                    <Icon style={{ width: 13, height: 13, color: AMBER, opacity: 0.7 }} />
                  </div>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.75rem",
                      color: "var(--foreground)",
                    }}
                  >
                    {value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          <SearchInput
            value={sessionSearch}
            onChange={(v) => {
              setSessionSearch(v);
              setSessionPage(1);
            }}
            placeholder="Search by name or email…"
          />

          {sessionsLoading ? (
            <Spinner />
          ) : sessionsData ? (
            <>
              <div className="ef-card" style={{ overflow: "hidden", borderRadius: "1rem" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["User", "Role", "IP Address", "Device", "Logged In", "Expires"].map(
                          (h) => (
                            <th key={h} style={T.th}>
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {sessionsData.data.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              ...T.cell,
                              textAlign: "center",
                              color: "var(--muted-foreground)",
                            }}
                          >
                            No active sessions found.
                          </td>
                        </tr>
                      ) : (
                        sessionsData.data.map((s) => (
                          <tr
                            key={s.sessionId}
                            style={{ transition: "background 0.15s" }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLElement).style.background =
                                "rgba(255,255,255,0.025)")
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLElement).style.background = "transparent")
                            }
                          >
                            <td style={T.cell}>
                              <p style={{ marginBottom: "1px" }}>{s.fullName}</p>
                              <p style={T.mono}>{s.email}</p>
                            </td>
                            <td style={T.cell}>
                              <RoleBadge role={s.role} />
                            </td>
                            <td style={{ ...T.cell, ...T.mono }}>{s.ipAddress ?? "—"}</td>
                            <td
                              style={{
                                ...T.cell,
                                ...T.mono,
                                maxWidth: 180,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {parseUserAgent(s.userAgent)}
                            </td>
                            <td style={{ ...T.cell, ...T.mono }}>
                              {s.createdAt ? format(new Date(s.createdAt), "MMM d, HH:mm") : "—"}
                            </td>
                            <td style={{ ...T.cell, ...T.mono }}>
                              {format(new Date(s.expiresAt), "MMM d, yyyy")}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                total={sessionsData.total}
                label="sessions"
                page={sessionPage}
                totalPages={sessionsData.totalPages}
                onPrev={() => setSessionPage((p) => Math.max(1, p - 1))}
                onNext={() => setSessionPage((p) => Math.min(sessionsData.totalPages, p + 1))}
              />
            </>
          ) : null}
        </div>
      )}

      {/* ══════ PLATFORM ANALYTICS ══════ */}
      {tab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {analyticsLoading ? (
            <Spinner />
          ) : platformAnalytics ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "1rem",
                }}
              >
                {[
                  { label: "Total Views", value: platformAnalytics.totalViews, icon: Eye },
                  {
                    label: "Submissions",
                    value: platformAnalytics.totalResponses,
                    icon: BarChart3,
                  },
                  {
                    label: "Avg Conversion",
                    value: `${platformAnalytics.avgConversionRate}%`,
                    icon: TrendingUp,
                  },
                  { label: "Active Forms", value: platformAnalytics.totalForms, icon: FileText },
                ].map(({ label, value, icon: Icon }, i) => (
                  <div
                    key={label}
                    className="ef-card"
                    style={{
                      padding: "1.25rem",
                      animation: `ef-fade-up .6s ease ${i * 60}ms both`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "1rem",
                      }}
                    >
                      <span style={T.label}>{label}</span>
                      <Icon style={{ width: 13, height: 13, color: AMBER, opacity: 0.7 }} />
                    </div>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "2rem",
                        color: "var(--foreground)",
                      }}
                    >
                      {typeof value === "number" ? value.toLocaleString() : value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Trend chart */}
              <div className="ef-card" style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.25rem",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <p style={T.label}>Platform Trend</p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--muted-foreground)",
                        marginTop: "4px",
                      }}
                    >
                      Views & submissions over time
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {([7, 30, 90] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setAnalyticsDays(d)}
                        style={{
                          padding: "4px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          cursor: "pointer",
                          border:
                            analyticsDays === d
                              ? "1px solid rgba(34,211,238,0.3)"
                              : "1px solid var(--border)",
                          background: analyticsDays === d ? "rgba(34,211,238,0.12)" : "transparent",
                          color: analyticsDays === d ? AMBER : "var(--muted-foreground)",
                        }}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredTrend}>
                      <defs>
                        <linearGradient id="adminViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={AMBER} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="adminSubs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#58745C" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#58745C" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => format(parseISO(d), "MMM d")}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <Tooltip
                        contentStyle={{
                          background: "#1a1612",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelFormatter={(d) => format(parseISO(String(d)), "MMM d, yyyy")}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke={AMBER}
                        fill="url(#adminViews)"
                        name="Views"
                      />
                      <Area
                        type="monotone"
                        dataKey="submissions"
                        stroke="#58745C"
                        fill="url(#adminSubs)"
                        name="Submissions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top creators */}
              <div className="ef-card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
                  <p style={T.label}>Top Creators</p>
                  <p
                    style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "4px" }}
                  >
                    By total submissions
                  </p>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Creator", "Forms", "Submissions"].map((h) => (
                          <th key={h} style={T.th}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {platformAnalytics.topCreators.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              ...T.cell,
                              textAlign: "center",
                              color: "var(--muted-foreground)",
                            }}
                          >
                            No creators yet.
                          </td>
                        </tr>
                      ) : (
                        platformAnalytics.topCreators.map((c) => (
                          <tr key={c.id}>
                            <td style={T.cell}>
                              <p>{c.fullName}</p>
                              <p style={T.mono}>{c.email}</p>
                            </td>
                            <td style={{ ...T.cell, ...T.mono }}>{c.formCount}</td>
                            <td style={{ ...T.cell, ...T.mono }}>
                              {c.totalResponses.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* All forms breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <SearchInput
                  value={formAnalyticsSearch}
                  onChange={setFormAnalyticsSearch}
                  placeholder="Search forms by title…"
                />
                <div className="ef-card" style={{ overflow: "hidden" }}>
                  <div
                    style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}
                  >
                    <p style={T.label}>All Forms Performance</p>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["Form", "Owner", "Views", "Responses", "Conversion"].map((h) => (
                            <th key={h} style={T.th}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFormBreakdown.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              style={{
                                ...T.cell,
                                textAlign: "center",
                                color: "var(--muted-foreground)",
                              }}
                            >
                              No forms found.
                            </td>
                          </tr>
                        ) : (
                          filteredFormBreakdown.map((f) => (
                            <tr key={f.id}>
                              <td style={T.cell}>
                                <p>{f.title}</p>
                                <p style={T.mono}>/{f.slug}</p>
                              </td>
                              <td style={{ ...T.cell, ...T.mono }}>{f.ownerName}</td>
                              <td style={{ ...T.cell, ...T.mono }}>{f.views.toLocaleString()}</td>
                              <td style={{ ...T.cell, ...T.mono }}>
                                {f.responses.toLocaleString()}
                              </td>
                              <td style={{ ...T.cell, ...T.mono }}>{f.conversionRate}%</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ══════ USERS ══════ */}
      {tab === "users" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <SearchInput
            value={userSearch}
            onChange={(v) => {
              setUserSearch(v);
              setUserPage(1);
            }}
            placeholder="Search by name or email…"
          />

          {usersLoading ? (
            <Spinner />
          ) : usersData ? (
            <>
              <div className="ef-card" style={{ overflow: "hidden", borderRadius: "1rem" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["User", "Role", "Forms", "Joined", ""].map((h, i) => (
                          <th key={i} style={{ ...T.th, textAlign: i === 4 ? "right" : "left" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {usersData.data.map((u) => (
                        <tr
                          key={u.id}
                          style={{ transition: "background 0.15s" }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              "rgba(255,255,255,0.025)")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = "transparent")
                          }
                        >
                          <td style={T.cell}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  flexShrink: 0,
                                  background: "linear-gradient(140deg, #22d3ee 0%, #8B7355 100%)",
                                  color: "#14110C",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                }}
                              >
                                {u.fullName[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p
                                  style={{
                                    fontSize: "13px",
                                    color: "var(--foreground)",
                                    marginBottom: "1px",
                                  }}
                                >
                                  {u.fullName}
                                </p>
                                <p style={T.mono}>{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={T.cell}>
                            <RoleBadge role={u.role} />
                          </td>
                          <td style={{ ...T.cell, ...T.mono }}>{u.formCount}</td>
                          <td style={{ ...T.cell, ...T.mono }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td style={{ ...T.cell, textAlign: "right" }}>
                            {u.id !== user.id && (
                              <button
                                onClick={() => {
                                  const newRole = u.role === "admin" ? "creator" : "admin";
                                  if (
                                    confirm(
                                      `${newRole === "admin" ? "Promote" : "Demote"} ${u.fullName} to ${newRole}?`,
                                    )
                                  )
                                    setRoleMutation.mutate({ id: u.id, role: newRole });
                                }}
                                className="ef-btn-ghost"
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  color: u.role === "admin" ? "#C05050" : "#22d3ee",
                                }}
                              >
                                {u.role === "admin" ? "Demote" : "Make Admin"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                total={usersData.total}
                label="users"
                page={userPage}
                totalPages={usersData.totalPages}
                onPrev={() => setUserPage((p) => Math.max(1, p - 1))}
                onNext={() => setUserPage((p) => Math.min(usersData.totalPages, p + 1))}
              />
            </>
          ) : null}
        </div>
      )}

      {/* ══════ FORMS ══════ */}
      {tab === "forms" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <SearchInput
            value={formSearch}
            onChange={(v) => {
              setFormSearch(v);
              setFormPage(1);
            }}
            placeholder="Search forms by title…"
          />

          {formsLoading ? (
            <Spinner />
          ) : formsData ? (
            <>
              <div className="ef-card" style={{ overflow: "hidden", borderRadius: "1rem" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Form", "Status", "Owner", "Created", ""].map((h, i) => (
                          <th key={i} style={{ ...T.th, textAlign: i === 4 ? "right" : "left" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {formsData.data.map((f) => (
                        <tr
                          key={f.id}
                          style={{ transition: "background 0.15s" }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              "rgba(255,255,255,0.025)")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = "transparent")
                          }
                        >
                          <td style={T.cell}>
                            <p style={{ marginBottom: "2px" }}>{f.title}</p>
                            <p style={T.mono}>/{f.slug}</p>
                          </td>
                          <td style={T.cell}>
                            <VisBadge v={f.visibility} />
                          </td>
                          <td style={{ ...T.cell, ...T.mono }}>
                            {"ownerName" in f
                              ? String((f as Record<string, unknown>).ownerName ?? "—")
                              : "—"}
                          </td>
                          <td style={{ ...T.cell, ...T.mono }}>
                            {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td style={{ ...T.cell, textAlign: "right" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: "6px",
                              }}
                            >
                              <a
                                href={`/forms/${f.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="ef-btn-ghost"
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  textDecoration: "none",
                                }}
                              >
                                View
                              </a>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Permanently delete "${f.title}"? This cannot be undone.`,
                                    )
                                  )
                                    deleteFormMutation.mutate({ id: f.id });
                                }}
                                className="ef-btn-ghost"
                                style={{
                                  padding: "6px",
                                  borderRadius: "8px",
                                  display: "flex",
                                  color: "#C05050",
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 style={{ width: 14, height: 14 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                total={formsData.total}
                label="forms"
                page={formPage}
                totalPages={formsData.totalPages}
                onPrev={() => setFormPage((p) => Math.max(1, p - 1))}
                onNext={() => setFormPage((p) => Math.min(formsData.totalPages, p + 1))}
              />
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ── sub-components ── */

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <Loader2 className="animate-spin" style={{ width: 20, height: 20, color: "#22d3ee" }} />
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <Search
        style={{
          width: 14,
          height: 14,
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--muted-foreground)",
        }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="ef-input"
        style={{
          width: "100%",
          paddingLeft: "36px",
          paddingRight: "16px",
          paddingTop: "10px",
          paddingBottom: "10px",
          borderRadius: "10px",
          fontSize: "13px",
          fontFamily: "'Inter', sans-serif",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function Pagination({
  total,
  label,
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  total: number;
  label: string;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "12px",
        color: "var(--muted-foreground)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <span style={{ fontFamily: "monospace" }}>
        {total.toLocaleString()} {label} total
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <PageBtn onClick={onPrev} disabled={page === 1}>
          <ChevronLeft style={{ width: 14, height: 14 }} />
        </PageBtn>
        <span>
          Page <strong style={{ color: "var(--foreground)" }}>{page}</strong> of {totalPages}
        </span>
        <PageBtn onClick={onNext} disabled={page >= totalPages}>
          <ChevronRight style={{ width: 14, height: 14 }} />
        </PageBtn>
      </div>
    </div>
  );
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return "—";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return ua.slice(0, 40) + (ua.length > 40 ? "…" : "");
}
