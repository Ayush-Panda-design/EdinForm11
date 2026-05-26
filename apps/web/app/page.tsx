"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Check,
  Cloud,
  Sparkles,
  ShieldCheck,
  Eye,
  Share2,
  GitBranch,
} from "lucide-react";
import { isAuthenticated } from "~/lib/auth";
import { useTheme } from "~/providers/theme-provider";
import { EdinFormLogo, EdinFormMark } from "~/components/brand/logo";

export default function LandingPage() {
  // Theme provider preserved — toggling stays functional even with cinematic palette.
  const { theme, toggleTheme } = useTheme();
  void theme;
  void toggleTheme;

  const [loggedIn, setLoggedIn] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  const ctaHref = loggedIn ? "/dashboard" : "/auth/register";
  const signInHref = loggedIn ? "/dashboard" : "/auth/login";

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      {/* ========== NAVBAR ========== */}
      <nav className="sticky top-0 z-50 ef-glass-soft">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="flex h-16 items-center justify-between">
            <EdinFormLogo />

            <div className="hidden md:flex items-center gap-9 text-[13px] tracking-wide text-[color:var(--muted-foreground)]">
              <Link
                href="/explore"
                className="hover:text-[color:var(--foreground)] transition-colors"
              >
                Templates
              </Link>
              <Link
                href="/pricing"
                className="hover:text-[color:var(--foreground)] transition-colors"
              >
                Pricing
              </Link>
              <a
                href="#craft"
                className="hover:text-[color:var(--foreground)] transition-colors"
              >
                The Craft
              </a>
              <a
                href="#studio"
                className="hover:text-[color:var(--foreground)] transition-colors"
              >
                Studio
              </a>
            </div>

            <div className="flex items-center gap-2">
              {loggedIn ? (
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full ef-btn-primary px-5 py-2 text-[13px]"
                >
                  Open studio <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="hidden sm:inline-flex px-3 py-2 text-[13px] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full ef-btn-primary px-5 py-2 text-[13px]"
                  >
                    Begin <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}

              <button
                aria-label="Open menu"
                onClick={() => setNavOpen((v) => !v)}
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md ef-btn-ghost"
              >
                {navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {navOpen && (
            <div className="md:hidden pb-6 pt-2 flex flex-col gap-3 text-sm">
              <Link href="/explore" className="py-1.5">Templates</Link>
              <Link href="/pricing" className="py-1.5">Pricing</Link>
              <a href="#craft" className="py-1.5">The Craft</a>
              <a href="#studio" className="py-1.5">Studio</a>
              <div className="ef-divider my-2" />
              {loggedIn ? (
                <Link
                  href="/dashboard"
                  className="rounded-full ef-btn-primary px-4 py-2.5 text-center text-sm"
                >
                  Open studio
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/auth/login"
                    className="flex-1 rounded-full ef-btn-ghost px-4 py-2.5 text-center text-sm"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex-1 rounded-full ef-btn-primary px-4 py-2.5 text-center text-sm"
                  >
                    Begin
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden">
        {/* cinematic backdrop image */}
        <div className="absolute inset-0 -z-10">
          <img
            src="/edinburgh-night.jpg"
            alt=""
            aria-hidden
            className="h-full w-full object-cover opacity-[0.45]"
          />
          <div className="absolute inset-0 ef-fog" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 50% at 50% 0%, rgba(200,155,99,0.18) 0%, transparent 60%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pt-16 sm:pt-24 lg:pt-32 pb-24 lg:pb-36">
          <div className="grid grid-cols-12 gap-y-12 gap-x-8">
            <div className="col-span-12 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)] ef-fade-up">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full ef-amber-bg ef-pulse-amber" />
                Drawn in Edinburgh — MMXXVI
              </span>
              <span className="hidden sm:inline">Volume 02 · A studio in the rain</span>
              <span className="font-mono">v 2.6</span>
            </div>

            <div className="col-span-12 ef-divider ef-fade-up ef-delay-1" />

            <div className="col-span-12 lg:col-span-9">
              <h1 className="font-display text-[3.25rem] leading-[1.02] sm:text-7xl lg:text-[7.5rem] lg:leading-[0.94] tracking-tight ef-fade-up ef-delay-1">
                <span className="text-[color:var(--foreground)]">Forms,</span>
                <br />
                <span className="italic ef-amber">drawn in</span>
                <br />
                <span className="text-[color:var(--foreground)]">the city of</span>
                <br />
                <span className="text-[color:var(--foreground)]">light &amp; rain.</span>
              </h1>
            </div>

            <div className="col-span-12 lg:col-span-7 lg:col-start-1 ef-fade-up ef-delay-2">
              <p className="max-w-xl text-[15px] sm:text-[17px] leading-relaxed text-[color:var(--muted-foreground)]">
                EdinForm is a cinematic studio for the questions you ask the
                world. Draft, publish, and read the replies inside a calm,
                considered workspace — designed with the patience of a print
                compositor and the warmth of a rainy Edinburgh evening.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  href={ctaHref}
                  className="group inline-flex items-center gap-2 rounded-full ef-btn-primary px-6 py-3 text-sm"
                >
                  {loggedIn ? "Open the studio" : "Begin a form, free"}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-full ef-btn-ghost px-6 py-3 text-sm"
                >
                  Browse templates
                </Link>
                <span className="text-xs text-[color:var(--muted-foreground)] pl-1">
                  No card needed · Free plan, forever
                </span>
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:col-start-9 lg:row-start-3 ef-fade-up ef-delay-3">
              <div className="ef-glass rounded-2xl p-6">
                <div className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)] mb-4">
                  In this volume
                </div>
                <ol className="space-y-3 text-[15px]">
                  {[
                    ["01", "The craft of asking"],
                    ["02", "A studio in the rain"],
                    ["03", "Reading the replies"],
                    ["04", "Notes from the field"],
                    ["05", "Pricing, plainly"],
                  ].map(([n, t]) => (
                    <li
                      key={n}
                      className="flex items-baseline gap-4 text-[color:var(--foreground)]/85 hover:text-[color:var(--foreground)] transition-colors"
                    >
                      <span className="font-mono text-xs tabular-nums ef-amber">
                        {n}
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-7 text-xs italic text-[color:var(--muted-foreground)]">
                  Considered: thought about carefully, with regard for form and
                  consequence.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ========== MARQUEE STRIP ========== */}
      <section className="border-y border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-10 grid grid-cols-2 md:grid-cols-4 gap-y-6">
          {[
            ["10,000+", "Forms drafted"],
            ["500,000+", "Replies gathered"],
            ["99.9%", "Service uptime"],
            ["4.9 / 5", "Maker rating"],
          ].map(([n, l]) => (
            <div key={l} className="flex flex-col">
              <span className="font-display text-3xl sm:text-4xl">
                <span className="ef-amber">{n}</span>
              </span>
              <span className="mt-1 text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
                {l}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ========== SECTION 01 — THE CRAFT ========== */}
      <section id="craft" className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-24 sm:py-32">
          <div className="grid grid-cols-12 gap-y-10 gap-x-8">
            <div className="col-span-12 lg:col-span-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)] mb-3">
                Section 01
              </div>
              <h2 className="font-display text-4xl lg:text-5xl leading-tight">
                The craft <br /> of <span className="italic ef-amber">asking</span>.
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
                Nine considered field types. Branching that reads like a
                sentence. A live preview that mirrors the final page. Everything
                you need — and nothing you don&rsquo;t.
              </p>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    icon: Sparkles,
                    n: "01",
                    t: "Nine field types",
                    d: "Short text, long text, numbers, dates, choice, rating, files — drawn carefully, behaving themselves.",
                  },
                  {
                    icon: GitBranch,
                    n: "02",
                    t: "Branching logic",
                    d: "Compose questions that listen. Skip, show, or end based on what the reader has said.",
                  },
                  {
                    icon: Eye,
                    n: "03",
                    t: "Public or unlisted",
                    d: "Open the form to anyone, or share a private link with the people who matter.",
                  },
                  {
                    icon: Cloud,
                    n: "04",
                    t: "Quiet analytics",
                    d: "Views, replies, conversion, completion time — the numbers that actually inform a decision.",
                  },
                  {
                    icon: ShieldCheck,
                    n: "05",
                    t: "Spam, deflected",
                    d: "Rate limiting and validation that work in the background, so you don't have to think about them.",
                  },
                  {
                    icon: Share2,
                    n: "06",
                    t: "Shareable links",
                    d: "Hand someone a link or a QR. They reply on any device, no account required.",
                  },
                ].map(({ icon: Icon, n, t, d }) => (
                  <div key={n} className="ef-card p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] tabular-nums tracking-[0.22em] text-[color:var(--muted-foreground)]">
                        {n}
                      </span>
                      <Icon className="h-4 w-4 ef-amber" />
                    </div>
                    <h3 className="mt-5 font-display text-xl text-[color:var(--foreground)]">
                      {t}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                      {d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 02 — A STUDIO IN THE RAIN ========== */}
      <section id="studio" className="relative overflow-hidden border-b border-[color:var(--border)]">
        <div className="absolute inset-0 -z-10">
          <img
            src="/edinburgh-study.jpg"
            alt=""
            aria-hidden
            className="h-full w-full object-cover opacity-25"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,11,12,0.6) 0%, rgba(11,11,12,0.85) 70%, rgba(11,11,12,0.98) 100%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-24 sm:py-32">
          <div className="grid grid-cols-12 gap-y-12 gap-x-8 items-center">
            <div className="col-span-12 lg:col-span-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)] mb-3">
                Section 02
              </div>
              <h2 className="font-display text-4xl lg:text-5xl leading-tight">
                A studio that
                <br />
                stays <span className="italic ef-amber">out of your way</span>.
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
                The editor is a single, quiet surface. Drag a field, write a
                question, see the result. No panels to open, no menus to learn —
                just the work, lit by a single warm lamp.
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {[
                  "Draft and publish in the same window",
                  "Themes that read like printed paper, not plastic",
                  "Keyboard-first for the people who prefer it",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 ef-amber" />
                    <span className="text-[color:var(--foreground)]/85">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-12 lg:col-span-7">
              <div className="ef-glass rounded-2xl overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-[color:var(--muted-foreground)]">
                    edinform.studio / drafts / morning-survey
                  </span>
                  <EdinFormMark size={20} />
                </div>

                <div className="grid grid-cols-12">
                  <div className="col-span-4 border-r border-[color:var(--border)] p-4 hidden sm:block">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)] mb-3">
                      Fields
                    </div>
                    <ul className="space-y-1.5 text-[13px]">
                      {[
                        "Short text",
                        "Long text",
                        "Choice",
                        "Rating",
                        "Date",
                        "File",
                      ].map((f, i) => (
                        <li
                          key={f}
                          className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-white/[0.04] transition-colors"
                        >
                          <span className="text-[color:var(--foreground)]/85">
                            {f}
                          </span>
                          <span className="font-mono text-[10px] tabular-nums text-[color:var(--muted-foreground)]">
                            0{i + 1}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="col-span-12 sm:col-span-8 p-6 sm:p-10">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)] mb-3">
                      Draft preview
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl mb-1">
                      A few quiet questions
                    </h3>
                    <p className="text-sm text-[color:var(--muted-foreground)] mb-7">
                      Takes about two minutes. Thank you for your time.
                    </p>

                    <label className="block text-xs uppercase tracking-[0.22em] text-[color:var(--muted-foreground)] mb-1.5">
                      Your name
                    </label>
                    <div className="mb-6 ef-input rounded-md px-3 py-2 text-sm text-[color:var(--muted-foreground)]">
                      Type here…
                    </div>

                    <label className="block text-xs uppercase tracking-[0.22em] text-[color:var(--muted-foreground)] mb-2">
                      How did the morning feel?
                    </label>
                    <div className="mb-7 flex flex-wrap gap-2 text-[13px]">
                      {["Calm", "Busy", "Hopeful", "Tired"].map((o, i) => (
                        <span
                          key={o}
                          className={`rounded-full px-3.5 py-1.5 ${
                            i === 0
                              ? "ef-btn-primary"
                              : "ef-btn-ghost"
                          }`}
                        >
                          {o}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-[color:var(--border)] pt-4">
                      <span className="font-mono text-[11px] tabular-nums text-[color:var(--muted-foreground)]">
                        02 / 06
                      </span>
                      <button className="rounded-full ef-btn-primary px-5 py-1.5 text-xs">
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 03 — READING THE REPLIES ========== */}
      <section className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-24 sm:py-32">
          <div className="grid grid-cols-12 gap-y-10 gap-x-8">
            <div className="col-span-12 lg:col-span-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)] mb-3">
                Section 03
              </div>
              <h2 className="font-display text-4xl lg:text-5xl leading-tight">
                Reading the
                <br />
                <span className="italic ef-amber">replies</span>.
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
                A page of replies that reads like a printed report. Filter,
                search, and export to a spreadsheet when you need to. The
                numbers are calm and honest.
              </p>

              <div className="mt-10 ef-glass rounded-2xl p-6 space-y-5">
                {[
                  ["Total replies", "1,284"],
                  ["Completion rate", "92%"],
                  ["Avg. time", "1m 47s"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-baseline justify-between border-b border-[color:var(--border)] pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
                      {k}
                    </span>
                    <span className="font-display text-2xl">
                      <span className="text-[color:var(--foreground)]">{v}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7">
              <figure className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
                <img
                  src="/edinburgh-rain.jpg"
                  alt="Rain on a tall arched window, Edinburgh by night"
                  className="aspect-[16/11] w-full object-cover"
                  loading="lazy"
                />
              </figure>
              <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
                <span>Plate II — A morning of replies</span>
                <span className="font-mono">02 / 03</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== NOTES FROM THE FIELD ========== */}
      <section className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-24 sm:py-28">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)] mb-3">
            Section 04
          </div>
          <h2 className="font-display text-4xl lg:text-5xl mb-14">
            Notes from <span className="italic ef-amber">the field</span>.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              [
                "Replaces three tools at the studio. The team writes more, asks better.",
                "Isla M.",
                "Brand designer, Leith",
              ],
              [
                "Finally a form tool that doesn't shout. Our completion rate went up.",
                "Marcus K.",
                "Researcher, Glasgow",
              ],
              [
                "Looks like something we'd publish in print. Clients notice the difference.",
                "Priya R.",
                "Studio lead, London",
              ],
            ].map(([quote, name, role]) => (
              <figure key={name} className="ef-card p-7">
                <span className="font-display text-4xl ef-amber leading-none">
                  &ldquo;
                </span>
                <blockquote className="mt-2 font-display text-xl leading-snug text-[color:var(--foreground)]">
                  {quote}
                </blockquote>
                <figcaption className="mt-6 text-sm text-[color:var(--muted-foreground)]">
                  <span className="text-[color:var(--foreground)]">{name}</span>
                  <span className="mx-2">·</span>
                  <span>{role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="relative overflow-hidden border-b border-[color:var(--border)]">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(200,155,99,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-28 sm:py-36">
          <div className="grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 lg:col-span-8">
              <div className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)] mb-4">
                Begin
              </div>
              <h2 className="font-display text-5xl sm:text-7xl lg:text-[6rem] leading-[0.98] tracking-tight">
                A form is a
                <br />
                small, <span className="italic ef-amber">considered</span>
                <br />
                act.
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <p className="max-w-sm text-[15px] leading-relaxed text-[color:var(--muted-foreground)] mb-7">
                Start with a single question. Publish in minutes. Read the
                replies tomorrow morning over coffee.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={ctaHref}
                  className="group inline-flex items-center justify-center gap-2 rounded-full ef-btn-primary px-6 py-3 text-sm"
                >
                  {loggedIn ? "Open the studio" : "Begin a form, free"}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-full ef-btn-ghost px-6 py-3 text-sm"
                >
                  See pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-[color:var(--sidebar)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-20">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-5">
              <EdinFormLogo />
              <p className="mt-6 max-w-sm text-sm text-[color:var(--muted-foreground)] leading-relaxed">
                A cinematic studio for the questions you ask the world. Drawn
                in Edinburgh, made for the modern web.
              </p>
            </div>

            <div className="col-span-6 md:col-span-2">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)] mb-4">
                Product
              </div>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/explore" className="hover:ef-amber transition-colors">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:ef-amber transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href={signInHref} className="hover:ef-amber transition-colors">
                    {loggedIn ? "Studio" : "Sign in"}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-6 md:col-span-2">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)] mb-4">
                Studio
              </div>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#craft" className="hover:ef-amber transition-colors">
                    The Craft
                  </a>
                </li>
                <li>
                  <a href="#studio" className="hover:ef-amber transition-colors">
                    Notes
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-span-12 md:col-span-3">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)] mb-4">
                Atelier
              </div>
              <p className="text-sm text-[color:var(--muted-foreground)] leading-relaxed">
                Old Town, Edinburgh
                <br />
                Open all hours, by lamplight.
              </p>
            </div>
          </div>

          <div className="mt-16 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4 border-t border-[color:var(--border)] pt-6 text-xs text-[color:var(--muted-foreground)]">
            <p>© 2026 EdinForm Studio. Set with Cormorant Garamond and Inter.</p>
            <p className="tracking-[0.28em] uppercase">
              Edinburgh — Made with patience
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
