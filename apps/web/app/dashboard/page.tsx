"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { useAuth } from "~/providers/auth-provider";
import {
  Plus, FileText, Eye, BarChart3, Globe, Lock,
  MoreHorizontal, Trash2, Copy, ExternalLink,
  Loader2, QrCode, Layers, TrendingUp, Zap,
  Shield, Clock, GitBranch, MousePointer2,
  ArrowUpRight, ChevronRight, Sparkles, Users,
  CheckCircle2, Activity, Calendar, Download,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { QRShareModal } from "~/components/forms/qr-share-modal";

export default function DashboardPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [qrForm, setQrForm] = useState<{ title: string; slug: string } | null>(null);

  const { data: forms, isLoading } = trpc.forms.list.useQuery({ includeArchived: false });
  const { data: dashboard } = trpc.analytics.dashboard.useQuery(undefined);

  const publishMutation = trpc.forms.publish.useMutation({
    onSuccess: () => { toast.success("Form published!"); utils.forms.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => { toast.success("Form unpublished"); utils.forms.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => { toast.success("Form deleted"); utils.forms.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const duplicateMutation = trpc.forms.duplicate.useMutation({
    onSuccess: () => { toast.success("Form duplicated!"); utils.forms.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const stats = [
    {
      label: "Total Forms",
      value: dashboard?.totalForms ?? 0,
      icon: FileText,
      suffix: "",
      delta: "+2 this week",
      deltaUp: true,
    },
    {
      label: "Total Views",
      value: dashboard?.totalViews ?? 0,
      icon: Eye,
      suffix: "",
      delta: "+12% vs last week",
      deltaUp: true,
    },
    {
      label: "Responses",
      value: dashboard?.totalResponses ?? 0,
      icon: BarChart3,
      suffix: "",
      delta: "+8 today",
      deltaUp: true,
    },
    {
      label: "Avg Conversion",
      value: dashboard ? dashboard.avgConversionRate.toFixed(1) : "0",
      icon: TrendingUp,
      suffix: "%",
      delta: "Industry avg 3.2%",
      deltaUp: false,
    },
  ];

  const features = [
    {
      icon: GitBranch,
      title: "Conditional Logic",
      desc: "Show or hide fields based on previous answers. Build smart, adaptive forms that feel conversational and reduce respondent friction.",
    },
    {
      icon: MousePointer2,
      title: "Multi-step Typeform UI",
      desc: "One question at a time with animated transitions, keyboard navigation, and a polished progress bar. Designed to maximise completion rates.",
    },
    {
      icon: QrCode,
      title: "QR Code Sharing",
      desc: "Every published form gets a downloadable QR code. Perfect for print, events, and offline-to-online campaigns.",
    },
    {
      icon: Shield,
      title: "Response Limits & Expiry",
      desc: "Set a max response count or a close date. FormCraft enforces both server-side so you never over-collect.",
    },
    {
      icon: Eye,
      title: "Live Preview",
      desc: "Preview your form in multi-step or classic mode before you hit publish. No guessing how respondents will see it.",
    },
    {
      icon: Download,
      title: "CSV Export",
      desc: "One-click export of all responses to CSV. Bring your data into Excel, Google Sheets, or any analytics tool instantly.",
    },
  ];

  const visibilityBadge = (v: string) => {
    if (v === "public")
      return (
        <span className="ef-badge-public inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase"
          style={{ background: "rgba(88,116,92,0.18)", color: "#7EB884", border: "1px solid rgba(88,116,92,0.3)", letterSpacing: "0.1em" }}>
          <Globe className="w-2.5 h-2.5" /> Public
        </span>
      );
    if (v === "unlisted")
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase"
          style={{ background: "rgba(200,155,99,0.12)", color: "#C89B63", border: "1px solid rgba(200,155,99,0.25)", letterSpacing: "0.1em" }}>
          <Lock className="w-2.5 h-2.5" /> Unlisted
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase"
        style={{ background: "rgba(255,255,255,0.04)", color: "var(--muted-foreground)", border: "1px solid rgba(255,255,255,0.07)", letterSpacing: "0.1em" }}>
        Draft
      </span>
    );
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)" }}>
              Studio
            </p>
            <span style={{ fontSize: "11px", color: "var(--muted-foreground)", opacity: 0.4 }}>/</span>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)", opacity: 0.6 }}>
              Dashboard
            </p>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 400, color: "var(--foreground)", lineHeight: 1.1 }}>
            Welcome back,{" "}
            <em style={{ color: "#C89B63" }}>{user?.fullName?.split(" ")[0]}</em>.
          </h1>
          <p style={{ marginTop: "6px", fontSize: "14px", color: "var(--muted-foreground)", maxWidth: "420px", lineHeight: 1.6 }}>
            Your forms are live and collecting responses. Here's everything happening in your workspace today.
          </p>
        </div>

        <div className="flex items-center gap-2" style={{ flexShrink: 0, marginTop: "4px" }}>
          <Link href="/dashboard/analytics"
            className="ef-btn-ghost inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm">
            <Activity className="w-4 h-4" /> Analytics
          </Link>
          <Link href="/dashboard/forms/new"
            className="ef-btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm">
            <Plus className="w-4 h-4" /> New Form
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <div key={s.label} className="ef-card p-5"
            style={{ animationDelay: `${i * 60}ms`, animation: "ef-fade-up .6s cubic-bezier(.2,.7,.2,1) both" }}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)" }}>
                {s.label}
              </span>
              <s.icon style={{ width: 14, height: 14, color: "#C89B63", opacity: 0.7 }} />
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, color: "var(--foreground)", lineHeight: 1 }}>
              {s.value}
              <span style={{ fontSize: "1rem", color: "#C89B63" }}>{s.suffix}</span>
            </p>
            <p style={{ marginTop: "8px", fontSize: "11px", color: s.deltaUp ? "#7EB884" : "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "3px" }}>
              {s.deltaUp && <ArrowUpRight style={{ width: 11, height: 11 }} />}
              {s.delta}
            </p>
          </div>
        ))}
      </div>

      {/* ── Platform callout banner ── */}
      <div className="ef-card mb-10 overflow-hidden" style={{ borderRadius: "1rem", position: "relative" }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "radial-gradient(circle at 20% 50%, #C89B63 0%, transparent 60%), radial-gradient(circle at 80% 50%, #7EB884 0%, transparent 60%)",
          pointerEvents: "none",
        }} />
        <div style={{ padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "12px",
              background: "rgba(200,155,99,0.1)", border: "1px solid rgba(200,155,99,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Sparkles style={{ width: 20, height: 20, color: "#C89B63" }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", color: "var(--foreground)", marginBottom: "3px" }}>
                FormCraft is your end-to-end form intelligence platform.
              </p>
              <p style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.5 }}>
                Build adaptive multi-step forms with conditional logic, share via QR, enforce response limits, and analyse every submission — all from one workspace.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <Link href="/explore"
              className="ef-btn-ghost inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm">
              Explore public forms <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/docs"
              className="ef-btn-ghost inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm">
              API docs <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Two-column: Forms list + Sidebar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>

        {/* LEFT — Forms list */}
        <div>
          <div className="ef-card overflow-hidden" style={{ borderRadius: "1rem" }}>
            {/* List header */}
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)" }}>
                  Your Forms
                </span>
                {forms && forms.length > 0 && (
                  <span style={{ marginLeft: "10px", fontSize: "11px", background: "rgba(200,155,99,0.12)", color: "#C89B63", border: "1px solid rgba(200,155,99,0.2)", borderRadius: "20px", padding: "1px 8px" }}>
                    {forms.length}
                  </span>
                )}
              </div>
              <Link href="/dashboard/forms/new"
                className="ef-btn-ghost inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs">
                <Plus className="w-3 h-3" /> New
              </Link>
            </div>

            {/* Loading */}
            {isLoading && (
              <div style={{ padding: "4rem", display: "flex", justifyContent: "center" }}>
                <Loader2 className="animate-spin" style={{ width: 20, height: 20, color: "#C89B63" }} />
              </div>
            )}

            {/* Empty */}
            {!isLoading && forms?.length === 0 && (
              <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(200,155,99,0.08)", border: "1px solid rgba(200,155,99,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                  <FileText style={{ width: 22, height: 22, color: "#C89B63" }} />
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "var(--foreground)", marginBottom: "0.5rem" }}>
                  No forms yet.
                </p>
                <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
                  Draft your first question. It only takes a minute.
                </p>
                <Link href="/dashboard/forms/new"
                  className="ef-btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm">
                  <Plus className="w-4 h-4" /> Begin a form
                </Link>
              </div>
            )}

            {/* Rows */}
            {!isLoading && forms && forms.length > 0 && (
              <div>
                {forms.map((form, idx) => (
                  <div key={form.id}
                    style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.5rem", borderBottom: idx < forms.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>

                    <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(200,155,99,0.08)", border: "1px solid rgba(200,155,99,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileText style={{ width: 15, height: 15, color: "#C89B63" }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "3px" }}>
                        <Link href={`/dashboard/forms/${form.id}/edit`}
                          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", color: "var(--foreground)", textDecoration: "none", transition: "color 0.2s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "240px" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#C89B63"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; }}>
                          {form.title}
                        </Link>
                        {visibilityBadge(form.visibility)}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "11px", color: "var(--muted-foreground)", fontFamily: "monospace", letterSpacing: "0.04em" }}>
                        <span>{form.responseCount} replies</span>
                        <span>{form.viewCount} views</span>
                        {form.conversionRate > 0 && <span>{form.conversionRate.toFixed(0)}% conv.</span>}
                        {form.createdAt && <span>{formatDistanceToNow(new Date(form.createdAt))} ago</span>}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 }}>
                      {form.visibility !== "unpublished" && (
                        <button onClick={() => setQrForm({ title: form.title, slug: form.slug })}
                          title="Share QR" className="ef-btn-ghost"
                          style={{ padding: "7px", borderRadius: "8px", display: "flex" }}>
                          <QrCode style={{ width: 15, height: 15 }} />
                        </button>
                      )}
                      <Link href={`/dashboard/forms/${form.id}/responses`} title="Responses"
                        className="ef-btn-ghost" style={{ padding: "7px", borderRadius: "8px", display: "flex" }}>
                        <BarChart3 style={{ width: 15, height: 15 }} />
                      </Link>

                      {/* Dropdown */}
                      <div style={{ position: "relative" }}>
                        <button
                          onClick={(e) => {
                            if (openMenu === form.id) { setOpenMenu(null); setMenuPos(null); return; }
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
                            setOpenMenu(form.id);
                          }}
                          className="ef-btn-ghost"
                          style={{ padding: "7px", borderRadius: "8px", display: "flex" }}>
                          <MoreHorizontal style={{ width: 15, height: 15 }} />
                        </button>

                        {openMenu === form.id && (
                          <div className="ef-glass"
                            style={{ position: "fixed", top: menuPos?.top ?? 0, right: menuPos?.right ?? 0, width: 200, borderRadius: "12px", padding: "4px", zIndex: 9999 }}
                            onClick={() => { setOpenMenu(null); setMenuPos(null); }}>
                            {[{ icon: Layers, label: "Edit & Preview", href: `/dashboard/forms/${form.id}/edit` }].map(({ icon: Icon, label, href }) => (
                              <Link key={label} href={href}
                                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "var(--foreground)", textDecoration: "none", transition: "background 0.15s" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                                <Icon style={{ width: 14, height: 14, color: "#C89B63" }} /> {label}
                              </Link>
                            ))}

                            {form.visibility !== "unpublished" ? (
                              <MenuBtn icon={Lock} label="Unpublish" onClick={() => unpublishMutation.mutate({ id: form.id })} />
                            ) : (
                              <MenuBtn icon={Globe} label="Publish" onClick={() => publishMutation.mutate({ id: form.id, visibility: "public" })} />
                            )}
                            <MenuBtn icon={Copy} label="Duplicate" onClick={() => duplicateMutation.mutate({ id: form.id })} />
                            {form.visibility !== "unpublished" && (
                              <>
                                <MenuBtn icon={Copy} label="Copy Link" onClick={() => { navigator.clipboard.writeText(window.location.origin + "/forms/" + form.slug); toast.success("Link copied!"); }} />
                                <MenuAnchor icon={ExternalLink} label="Open Form" href={`/forms/${form.slug}`} />
                              </>
                            )}
                            <div style={{ margin: "4px 0", borderTop: "1px solid var(--border)" }} />
                            <MenuBtn icon={Trash2} label="Delete" danger
                              onClick={() => { if (confirm("Delete this form and all its responses?")) deleteMutation.mutate({ id: form.id }); }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Quick actions */}
          <div className="ef-card" style={{ borderRadius: "1rem", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)" }}>
                Quick Actions
              </span>
            </div>
            <div style={{ padding: "0.5rem" }}>
              {[
                { icon: Plus, label: "New form", sub: "Start from scratch", href: "/dashboard/forms/new" },
                { icon: Users, label: "View responses", sub: "All recent submissions", href: "/dashboard/analytics" },
                { icon: Globe, label: "Explore forms", sub: "Browse public library", href: "/explore" },
                { icon: Calendar, label: "Set expiry", sub: "Manage form limits", href: "/dashboard/settings" },
              ].map(({ icon: Icon, label, sub, href }) => (
                <Link key={label} href={href}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", textDecoration: "none", transition: "background 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <div style={{ width: 30, height: 30, borderRadius: "8px", background: "rgba(200,155,99,0.08)", border: "1px solid rgba(200,155,99,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 13, height: 13, color: "#C89B63" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--foreground)", marginBottom: "1px", fontWeight: 500 }}>{label}</p>
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{sub}</p>
                  </div>
                  <ChevronRight style={{ width: 13, height: 13, color: "var(--muted-foreground)", marginLeft: "auto" }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Platform features */}
          <div className="ef-card" style={{ borderRadius: "1rem", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)" }}>
                What's Available
              </span>
            </div>
            <div style={{ padding: "0.75rem 1.25rem 1rem" }}>
              {[
                "Typeform-style multi-step UI",
                "Conditional field logic",
                "QR code sharing + PNG export",
                "Response limits & expiry dates",
                "Live form preview (modal)",
                "CSV export of all responses",
                "Recharts analytics dashboard",
                "Scalar API documentation",
                "Rate limiting via Upstash Redis",
                "JWT auth with bearer tokens",
              ].map((feat) => (
                <div key={feat} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "5px 0" }}>
                  <CheckCircle2 style={{ width: 13, height: 13, color: "#7EB884", marginTop: "2px", flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.4 }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* API hint */}
          <div className="ef-card" style={{ borderRadius: "1rem", padding: "1.25rem", background: "rgba(200,155,99,0.04)", border: "1px solid rgba(200,155,99,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Zap style={{ width: 14, height: 14, color: "#C89B63" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#C89B63", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                API Access
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.6, marginBottom: "12px" }}>
              Full REST + tRPC API. Manage forms, submit responses, and pull analytics programmatically. Full OpenAPI 3.1 docs available.
            </p>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#C89B63", textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}>
              Open API docs <ExternalLink style={{ width: 11, height: 11 }} />
            </a>
          </div>

        </div>
      </div>

      {/* ── Divider ── */}
      <div className="ef-divider my-10" />

      {/* ── Feature grid ── */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)", marginBottom: "6px" }}>
            Platform
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 400, color: "var(--foreground)" }}>
            Everything you need to build great forms.
          </h2>
          <p style={{ marginTop: "6px", fontSize: "14px", color: "var(--muted-foreground)", maxWidth: "480px", lineHeight: 1.6 }}>
            FormCraft combines a beautiful respondent experience with serious backend infrastructure — rate limiting, expiry enforcement, conditional logic, and a full analytics suite.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {features.map((f, i) => (
            <div key={f.title} className="ef-card p-5"
              style={{ borderRadius: "1rem", animationDelay: `${i * 50}ms`, animation: "ef-fade-up .6s cubic-bezier(.2,.7,.2,1) both" }}>
              <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(200,155,99,0.08)", border: "1px solid rgba(200,155,99,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <f.icon style={{ width: 16, height: 16, color: "#C89B63" }} />
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", color: "var(--foreground)", marginBottom: "6px" }}>
                {f.title}
              </p>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tech stack strip ── */}
      <div className="ef-card" style={{ borderRadius: "1rem", padding: "1.25rem 1.75rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)", marginBottom: "4px" }}>
            Built on
          </p>
          <p style={{ fontSize: "13px", color: "var(--foreground)", lineHeight: 1.5 }}>
            Turborepo · Next.js 16 · tRPC · Drizzle ORM · PostgreSQL · Zod · Recharts · Scalar
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7EB884" }} />
          <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>All systems operational</span>
        </div>
      </div>

      {/* Backdrop for dropdown */}
      {openMenu && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9998 }}
          onClick={() => { setOpenMenu(null); setMenuPos(null); }} />
      )}

      {/* QR Modal */}
      {qrForm && (
        <QRShareModal open={!!qrForm} onClose={() => setQrForm(null)}
          formTitle={qrForm.title} formSlug={qrForm.slug} />
      )}
    </div>
  );
}

/* ── helpers ── */
function MenuBtn({ icon: Icon, label, onClick, danger = false }: {
  icon: React.ElementType; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onClick}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: danger ? "#C05050" : "var(--foreground)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s", fontFamily: "'Inter', sans-serif" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = danger ? "rgba(192,80,80,0.08)" : "rgba(255,255,255,0.05)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
      <Icon style={{ width: 14, height: 14, color: danger ? "#C05050" : "#C89B63" }} />
      {label}
    </button>
  );
}

function MenuAnchor({ icon: Icon, label, href }: {
  icon: React.ElementType; label: string; href: string;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "var(--foreground)", textDecoration: "none", transition: "background 0.15s", fontFamily: "'Inter', sans-serif" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
      <Icon style={{ width: 14, height: 14, color: "#C89B63" }} /> {label}
    </a>
  );
}
