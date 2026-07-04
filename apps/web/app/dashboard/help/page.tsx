"use client";

import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Compass,
  LayoutDashboard,
  LayoutTemplate,
  BarChart3,
  Share2,
  Inbox,
  Bell,
  Settings,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { FULL_GUIDE } from "~/lib/help-content";
import { BackendStatusCard } from "~/components/help/backend-status";

const QUICK_LINKS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/forms/new", label: "Create form", icon: Sparkles },
  { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const SECTION_ICONS: Record<string, React.ElementType> = {
  "getting-started": Sparkles,
  create: LayoutDashboard,
  templates: LayoutTemplate,
  builder: BookOpen,
  share: Share2,
  responses: Inbox,
  analytics: BarChart3,
  notifications: Bell,
  settings: Settings,
  admin: ShieldCheck,
};

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Hero */}
      <section
        className="ef-bento !p-0 overflow-hidden mb-8"
        style={{ background: "var(--dash-card)" }}
      >
        <div
          className="px-6 sm:px-8 py-8 sm:py-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 0% 0%, var(--dash-accent-soft), transparent 55%)",
          }}
        >
          <div className="inline-flex items-center gap-2 kpi-chip mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Platform guide
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight dash-text">
            How to use EdinForm
          </h1>
          <p className="mt-3 text-sm sm:text-base dash-muted max-w-2xl leading-relaxed">
            A complete walkthrough for new users — from your first form to sharing, analytics, and
            notifications. Use the ? buttons on any page for quick tips.
          </p>
        </div>

        <div className="px-6 sm:px-8 py-5 border-t dash-border">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold dash-faint mb-3">
            Jump to
          </p>
          <div className="flex flex-wrap gap-2">
            {FULL_GUIDE.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors hover:border-[var(--dash-accent-border)] hover:bg-[var(--dash-accent-soft)]"
                style={{
                  borderColor: "var(--dash-border)",
                  color: "var(--dash-text)",
                }}
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-10">
        <BackendStatusCard />
      </section>

      {/* Quick actions */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold dash-text mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="form-card flex items-center gap-3 p-3.5 no-underline"
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "var(--dash-accent-soft)", color: "var(--dash-accent)" }}
              >
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-sm font-medium dash-text">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Full guide sections */}
      <div className="space-y-4">
        {FULL_GUIDE.map((section, index) => {
          const Icon = SECTION_ICONS[section.id] ?? BookOpen;
          return (
            <section key={section.id} id={section.id} className="ef-bento scroll-mt-24">
              <div className="flex items-start gap-3 mb-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--dash-accent-soft)", color: "var(--dash-accent)" }}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] font-semibold dash-faint">
                    Step {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="text-lg font-semibold dash-text">{section.title}</h2>
                  <p className="text-sm dash-muted mt-1">{section.summary}</p>
                </div>
              </div>

              <ol className="space-y-2.5 mt-4">
                {section.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 dash-accent" />
                    <span className="dash-text leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>

              {section.tips && section.tips.length > 0 && (
                <div
                  className="mt-4 rounded-xl px-4 py-3 space-y-1.5"
                  style={{ background: "var(--dash-accent-soft)" }}
                >
                  {section.tips.map((tip, i) => (
                    <p key={i} className="text-xs leading-relaxed dash-text">
                      <span className="font-semibold dash-accent">Tip: </span>
                      {tip}
                    </p>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Footer CTA */}
      <section className="mt-10 ef-bento flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold dash-text">Ready to build?</p>
          <p className="text-xs dash-muted mt-1">
            Start from a template or a blank form — you can always edit later.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/templates"
            className="ef-btn-ghost rounded-full px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5"
          >
            Templates
          </Link>
          <Link
            href="/dashboard/forms/new"
            className="ef-btn-primary rounded-full px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5"
          >
            Create form <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
