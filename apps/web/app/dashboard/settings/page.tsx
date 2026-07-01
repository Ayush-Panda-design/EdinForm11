"use client";

import { useEffect, useState } from "react";
import { useAuth } from "~/providers/auth-provider";
import { trpc } from "~/trpc/client";
import {
  User, Mail, Shield, Bell, Palette, Check,
  BookOpen, ListOrdered, Lightbulb, HelpCircle,
} from "lucide-react";
import Link from "next/link";
import {
  DashboardPage,
  DashboardSection,
  DashboardCard,
  DashboardThemePicker,
  DashboardAnimatedSection,
} from "~/components/dashboard/primitives";
import { DashboardTemplateLabel } from "~/components/dashboard/theme-picker";

const ACCENT = "var(--dt-accent)";

const SETTINGS_STEPS = [
  { step: 1, title: "Pick a dashboard theme", body: "Choose from six inner-page templates. Changes apply instantly to dashboard, analytics, and responses." },
  { step: 2, title: "Review your account", body: "Confirm your name, email, and role. Contact support if any details need updating." },
  { step: 3, title: "Set email preferences", body: "Toggle marketing, product updates, response alerts, and weekly digest to match how you want to hear from us." },
  { step: 4, title: "Toggle light / dark mode", body: "Use the control in the sidebar footer — it works alongside your chosen dashboard theme." },
] as const;

const SETTINGS_GUIDE = [
  { term: "Dashboard themes", definition: "Visual styles for inner pages only — sidebar, cards, and accents. Your public forms keep their own look." },
  { term: "Response notifications", definition: "Email when someone submits a form you own. Recommended if you want immediate alerts." },
  { term: "Weekly digest", definition: "A summary of workspace activity once per week. Good for low-traffic forms." },
  { term: "Light mode", definition: "Use the sidebar toggle to switch any dashboard theme to its light variant — backgrounds, cards, and accents all adapt while keeping the same template." },
] as const;

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: prefs, isLoading } = trpc.auth.getEmailPreferences.useQuery(undefined, { enabled: !!user });
  const updatePrefs = trpc.auth.updateEmailPreferences.useMutation();
  const [local, setLocal] = useState({
    marketingEmails: true,
    productUpdates: true,
    responseNotifications: true,
    weeklyDigest: false,
  });
  const [saved, setSaved] = useState(false);
  const [themeSaved, setThemeSaved] = useState(false);

  useEffect(() => {
    if (prefs) setLocal(prefs);
  }, [prefs]);

  async function toggle(key: keyof typeof local) {
    const next = { ...local, [key]: !local[key] };
    setLocal(next);
    await updatePrefs.mutateAsync(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <DashboardPage className="space-y-8">
      {/* Hero */}
      <DashboardAnimatedSection animation="fade-up">
        <section
          className="rounded-3xl border p-6 sm:p-8 relative overflow-hidden dt-anim-shimmer"
          style={{
            borderColor: "var(--dt-card-border)",
            background: "linear-gradient(135deg, var(--dt-card-bg), color-mix(in srgb, var(--dt-accent) 8%, var(--dt-main-bg)))",
          }}
        >
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: "var(--dt-main-gradient)" }} />
          <div className="relative z-[1]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted-foreground)] mb-2">Settings</p>
            <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-[var(--foreground)] mb-2">
              Your <em className="not-italic" style={{ color: ACCENT }}>workspace</em>
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed">
              Manage appearance, account details, and email notifications. Theme changes save automatically and persist across sessions.
            </p>
          </div>
        </section>
      </DashboardAnimatedSection>

      {/* Guide */}
      <div className="grid lg:grid-cols-2 gap-5">
        <DashboardAnimatedSection animation="slide-in" delay={100} className="rounded-3xl border p-6 sm:p-7 dt-hover-lift" style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}>
          <div className="flex items-start gap-3 mb-5">
            <ListOrdered className="w-5 h-5 shrink-0" style={{ color: ACCENT }} />
            <div>
              <h2 className="font-display text-lg text-[var(--foreground)]">Settings walkthrough</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">What to configure and in what order.</p>
            </div>
          </div>
          <ol className="space-y-4">
            {SETTINGS_STEPS.map(({ step, title, body }) => (
              <li key={step} className="flex gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "var(--dt-accent-soft)", color: ACCENT, border: "1px solid var(--dt-accent-border)" }}>{step}</span>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </DashboardAnimatedSection>

        <DashboardAnimatedSection animation="slide-in" delay={180} className="rounded-3xl border p-6 sm:p-7 dt-hover-lift" style={{ background: "var(--dt-card-bg)", borderColor: "var(--dt-card-border)" }}>
          <div className="flex items-start gap-3 mb-5">
            <BookOpen className="w-5 h-5 shrink-0" style={{ color: ACCENT }} />
            <div>
              <h2 className="font-display text-lg text-[var(--foreground)]">Settings explained</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">Quick reference for each section on this page.</p>
            </div>
          </div>
          <dl className="space-y-4">
            {SETTINGS_GUIDE.map(({ term, definition }) => (
              <div key={term}>
                <dt className="text-sm font-medium text-[var(--foreground)]">{term}</dt>
                <dd className="text-xs text-[var(--muted-foreground)] leading-relaxed mt-1">{definition}</dd>
              </div>
            ))}
          </dl>
        </DashboardAnimatedSection>
      </div>

      <DashboardAnimatedSection animation="scale-in" delay={240}>
        <div className="rounded-3xl border p-5 flex flex-wrap items-start gap-4" style={{ background: "var(--dt-accent-soft)", borderColor: "var(--dt-accent-border)" }}>
          <Lightbulb className="w-5 h-5 shrink-0" style={{ color: ACCENT }} />
          <div>
            <p className="text-sm font-medium text-[var(--foreground)] mb-1">Tip: preview themes before deciding</p>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              After selecting a theme, visit <Link href="/dashboard" className="underline" style={{ color: ACCENT }}>Dashboard</Link> and{" "}
              <Link href="/dashboard/analytics" className="underline" style={{ color: ACCENT }}>Analytics</Link> to see backgrounds, cards, and accents update together.
            </p>
          </div>
        </div>
      </DashboardAnimatedSection>

      <DashboardAnimatedSection animation="fade-up" delay={300}>
        <DashboardSection
          title="Dashboard themes"
          subtitle={<>Active: <DashboardTemplateLabel />. Click a card to apply — changes are instant.</>}
        >
          <DashboardCard className="p-6 dt-hover-lift">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4" style={{ color: ACCENT }} />
              <p className="text-sm font-medium text-[var(--foreground)]">Inner page templates</p>
              {themeSaved && (
                <span className="text-xs ml-auto flex items-center gap-1 dt-anim-fade-in" style={{ color: "var(--dt-success)" }}>
                  <Check className="w-3 h-3" /> Applied
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mb-5 leading-relaxed">
              Six Envato-inspired styles for dashboard inner pages. Each theme updates shell background, sidebar, cards, and accent colours.
            </p>
            <DashboardThemePicker onSelect={() => { setThemeSaved(true); setTimeout(() => setThemeSaved(false), 2000); }} />
          </DashboardCard>
        </DashboardSection>
      </DashboardAnimatedSection>

      <DashboardAnimatedSection animation="fade-up" delay={380}>
        <DashboardSection title="Account" subtitle="Your profile information — managed by your login credentials.">
          <DashboardCard className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold dt-anim-pulse-glow" style={{ background: "linear-gradient(140deg, var(--dt-accent), color-mix(in srgb, var(--dt-accent) 55%, #000))", color: "#14110C" }}>
                {user?.fullName?.[0] || "?"}
              </div>
              <div>
                <p className="text-xl font-medium text-[var(--foreground)]">{user?.fullName}</p>
                <p className="text-sm text-[var(--muted-foreground)] capitalize">{user?.role} account</p>
              </div>
            </div>
            <div className="h-px" style={{ background: "var(--dt-card-border)" }} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: User, label: "Full Name", value: user?.fullName },
                { icon: Mail, label: "Email", value: user?.email },
                { icon: Shield, label: "Role", value: user?.role },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl p-4 dt-hover-lift" style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-accent-border)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)] capitalize">{value}</p>
                </div>
              ))}
            </div>
          </DashboardCard>
        </DashboardSection>
      </DashboardAnimatedSection>

      <DashboardAnimatedSection animation="fade-up" delay={460}>
        <DashboardSection
          title="Email preferences"
          subtitle="Control which notifications you receive — toggles save immediately."
          actions={saved ? <span className="text-xs flex items-center gap-1 dt-anim-fade-in" style={{ color: "var(--dt-success)" }}><Check className="w-3 h-3" /> Saved</span> : null}
        >
          <DashboardCard className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4" style={{ color: ACCENT }} />
              <h3 className="text-sm font-medium text-[var(--foreground)]">Notifications</h3>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mb-4 leading-relaxed">
              Tap each row to toggle. Large touch targets on mobile — no separate save button needed.
            </p>
            {isLoading ? (
              <p className="text-sm text-[var(--muted-foreground)]">Loading preferences…</p>
            ) : (
              <div className="space-y-3">
                {([
                  ["marketingEmails", "Marketing emails", "Occasional news and offers from EdinForm."],
                  ["productUpdates", "Product updates", "New features and improvements to the platform."],
                  ["responseNotifications", "New response notifications", "Instant alert when someone submits your form."],
                  ["weeklyDigest", "Weekly digest", "Summary of views, submissions, and top forms."],
                ] as const).map(([key, label, desc]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-4 p-4 sm:p-5 rounded-xl cursor-pointer transition-colors dt-touch-target min-h-[56px] dt-hover-lift"
                    style={{ background: "var(--dt-accent-soft)", border: "1px solid var(--dt-accent-border)" }}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-sm font-medium text-[var(--foreground)] block">{label}</span>
                      <span className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">{desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={local[key]}
                      onChange={() => toggle(key)}
                      disabled={updatePrefs.isPending}
                      className="w-5 h-5 shrink-0 cursor-pointer"
                      style={{ accentColor: "var(--dt-accent)" }}
                    />
                  </label>
                ))}
              </div>
            )}
          </DashboardCard>
        </DashboardSection>
      </DashboardAnimatedSection>

      <p className="text-[11px] text-[var(--muted-foreground)] flex items-start gap-2 dt-anim-fade-in" style={{ animationDelay: "520ms" }}>
        <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: ACCENT }} />
        <span>Questions about your account? Return to the <Link href="/dashboard" className="underline" style={{ color: ACCENT }}>dashboard</Link> or browse <Link href="/docs" className="underline" style={{ color: ACCENT }}>help docs</Link>.</span>
      </p>
    </DashboardPage>
  );
}
