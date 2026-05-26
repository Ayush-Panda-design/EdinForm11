"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
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

/* ─── tiny hook: element is in viewport ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e!.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── animated counter ─── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const { ref, inView } = useInView(0.4);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(id); }
      else setVal(start);
    }, 16);
    return () => clearInterval(id);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── stagger wrapper ─── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  void theme; void toggleTheme;

  const [loggedIn, setLoggedIn] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  useEffect(() => { setLoggedIn(isAuthenticated()); }, []);

  const ctaHref = loggedIn ? "/dashboard" : "/auth/register";
  const signInHref = loggedIn ? "/dashboard" : "/auth/login";

  const chapters = [
    { n: "01", t: "The craft of asking" },
    { n: "02", t: "A studio in the rain" },
    { n: "03", t: "Reading the replies" },
    { n: "04", t: "Notes from the field" },
    { n: "05", t: "Pricing, plainly" },
  ];

  const chapterAnchors = ["#craft", "#studio", "#replies", "#notes", "/pricing"];

  const features = [
    { icon: Sparkles, n: "01", t: "Nine field types", d: "Short text, long text, numbers, dates, choice, rating, files — drawn carefully, behaving themselves." },
    { icon: GitBranch, n: "02", t: "Branching logic", d: "Compose questions that listen. Skip, show, or end based on what the reader has said." },
    { icon: Eye, n: "03", t: "Public or unlisted", d: "Open the form to anyone, or share a private link with the people who matter." },
    { icon: Cloud, n: "04", t: "Quiet analytics", d: "Views, replies, conversion, completion time — the numbers that actually inform a decision." },
    { icon: ShieldCheck, n: "05", t: "Spam, deflected", d: "Rate limiting and validation that work in the background, so you don't have to think about them." },
    { icon: Share2, n: "06", t: "Shareable links", d: "Hand someone a link or a QR. They reply on any device, no account required." },
  ];

  return (
    <div className="min-h-screen text-[var(--foreground)]" style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif" }}>

      {/* ══════════ NAVBAR ══════════ */}
      <nav className="sticky top-0 z-50 ef-glass-soft border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="flex h-16 items-center justify-between">
            <EdinFormLogo />

            <div className="hidden md:flex items-center gap-9 text-[13px] tracking-wide text-[color:var(--muted-foreground)]" style={{ fontFamily: "'Inter', sans-serif" }}>
              {[
                { label: "Templates", href: "/explore" },
                { label: "Pricing", href: "/pricing" },
                { label: "The Craft", href: "#craft" },
                { label: "Studio", href: "#studio" },
              ].map(({ label, href }) => (
                <a key={label} href={href}
                  className="relative py-1 hover:text-[color:var(--foreground)] transition-colors group">
                  {label}
                  <span className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full ef-amber-bg transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {loggedIn ? (
                <Link href="/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full ef-btn-primary px-5 py-2 text-[13px] transition-transform hover:scale-[1.03] active:scale-[0.97]"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
                  Open studio <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <>
                  <Link href="/auth/login"
                    className="hidden sm:inline-flex px-3 py-2 text-[13px] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    Sign in
                  </Link>
                  <Link href="/auth/register"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full ef-btn-primary px-5 py-2 text-[13px] transition-transform hover:scale-[1.03] active:scale-[0.97]"
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    Begin <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
              <button aria-label="Open menu" onClick={() => setNavOpen(v => !v)}
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md ef-btn-ghost transition-transform active:scale-90">
                {navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* mobile nav */}
          <div style={{
            maxHeight: navOpen ? "400px" : "0",
            overflow: "hidden",
            transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
            fontFamily: "'Inter', sans-serif",
          }}>
            <div className="pb-6 pt-2 flex flex-col gap-3 text-sm">
              <a href="/explore" className="py-1.5">Templates</a>
              <a href="/pricing" className="py-1.5">Pricing</a>
              <a href="#craft" className="py-1.5">The Craft</a>
              <a href="#studio" className="py-1.5">Studio</a>
              <div className="ef-divider my-2" />
              {loggedIn ? (
                <Link href="/dashboard" className="rounded-full ef-btn-primary px-4 py-2.5 text-center text-sm">Open studio</Link>
              ) : (
                <div className="flex gap-2">
                  <Link href="/auth/login" className="flex-1 rounded-full ef-btn-ghost px-4 py-2.5 text-center text-sm">Sign in</Link>
                  <Link href="/auth/register" className="flex-1 rounded-full ef-btn-primary px-4 py-2.5 text-center text-sm">Begin</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════ HERO — full viewport, two columns ══════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: "calc(100vh - 64px)" }}>
        {/* backdrop */}
        <div className="absolute inset-0 -z-10">
          <img src="/edinburgh-night.jpg" alt="" aria-hidden
            className="h-full w-full object-cover"
            style={{ opacity: 0.38 }} />
          <div className="absolute inset-0 ef-fog" />
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(70% 50% at 50% 0%, rgba(200,155,99,0.18) 0%, transparent 60%)" }} />
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 h-full"
          style={{ minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {/* eyebrow */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pt-8 lg:pt-0"
            style={{
              fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em",
              color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif",
              animation: "fadeUp 0.7s ease both",
            }}>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full ef-amber-bg ef-pulse-amber" />
              Drawn in Edinburgh — MMXXVI
            </span>
            <span className="hidden sm:inline">Volume 02 · A studio in the rain</span>
            <span style={{ fontFamily: "monospace" }}>v 2.6</span>
          </div>

          <div className="ef-divider mb-8" style={{ animation: "fadeUp 0.7s ease 0.1s both" }} />

          {/* TWO COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start pb-10 lg:pb-0">

            {/* LEFT — headline + CTAs */}
            <div style={{ animation: "fadeUp 0.7s ease 0.15s both" }}>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                fontSize: "clamp(2.8rem, 6vw, 6.5rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                marginBottom: "1.5rem",
              }}>
                <span style={{ color: "var(--foreground)" }}>Forms,</span><br />
                <em style={{ color: "var(--ef-amber, #C89B63)" }}>drawn in</em><br />
                <span style={{ color: "var(--foreground)" }}>the city of</span><br />
                <span style={{ color: "var(--foreground)" }}>light &amp; rain.</span>
              </h1>

              <p style={{
                maxWidth: "42ch",
                fontSize: "clamp(14px, 1.5vw, 17px)",
                lineHeight: 1.7,
                color: "var(--muted-foreground)",
                fontFamily: "'Inter', sans-serif",
                marginBottom: "2.25rem",
              }}>
                EdinForm is a cinematic studio for the questions you ask the world.
                Draft, publish, and read the replies inside a calm, considered workspace —
                designed with the patience of a print compositor and the warmth of a rainy
                Edinburgh evening.
              </p>

              <div className="flex flex-wrap items-center gap-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                <Link href={ctaHref}
                  className="group inline-flex items-center gap-2 rounded-full ef-btn-primary px-6 py-3 text-sm"
                  style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}>
                  {loggedIn ? "Open the studio" : "Open the studio"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/explore"
                  className="inline-flex items-center gap-2 rounded-full ef-btn-ghost px-6 py-3 text-sm"
                  style={{ transition: "transform 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}>
                  Browse templates
                </Link>
                <span style={{ fontSize: "12px", color: "var(--muted-foreground)", paddingLeft: "4px" }}>
                  No card needed · Free plan, forever
                </span>
              </div>
            </div>

            {/* RIGHT — "In this volume" panel */}
            <div style={{ animation: "fadeUp 0.7s ease 0.3s both" }}>
              <div className="ef-glass rounded-2xl p-6 sm:p-8"
                style={{ backdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{
                  fontSize: "11px", textTransform: "uppercase",
                  letterSpacing: "0.28em", color: "var(--muted-foreground)",
                  fontFamily: "'Inter', sans-serif", marginBottom: "1.25rem",
                }}>
                  In this volume
                </div>

                <ol className="space-y-1">
                  {chapters.map(({ n, t }, i) => (
                    <li key={n}>
                      <a href={chapterAnchors[i]}
                        onMouseEnter={() => setActiveChapter(i)}
                        onMouseLeave={() => setActiveChapter(null)}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "1rem",
                          padding: "0.65rem 0.75rem",
                          borderRadius: "10px",
                          fontSize: "15px",
                          fontFamily: "'Cormorant Garamond', serif",
                          color: activeChapter === i ? "var(--foreground)" : "rgba(var(--foreground-rgb, 255,255,255), 0.75)",
                          background: activeChapter === i ? "rgba(200,155,99,0.10)" : "transparent",
                          transition: "all 0.2s",
                          textDecoration: "none",
                          cursor: "pointer",
                        }}>
                        <span style={{
                          fontFamily: "monospace", fontSize: "11px",
                          color: "var(--ef-amber, #C89B63)",
                          letterSpacing: "0.22em", minWidth: "24px",
                          transition: "transform 0.2s",
                          transform: activeChapter === i ? "translateX(2px)" : "translateX(0)",
                        }}>{n}</span>
                        <span style={{
                          transform: activeChapter === i ? "translateX(4px)" : "translateX(0)",
                          transition: "transform 0.25s",
                        }}>{t}</span>
                        {activeChapter === i && (
                          <ArrowRight style={{ marginLeft: "auto", width: 14, height: 14, color: "var(--ef-amber, #C89B63)", flexShrink: 0 }} />
                        )}
                      </a>
                    </li>
                  ))}
                </ol>

                <p style={{
                  marginTop: "1.5rem", fontSize: "12px",
                  fontStyle: "italic", color: "var(--muted-foreground)",
                  fontFamily: "'Cormorant Garamond', serif",
                  borderTop: "1px solid var(--border)", paddingTop: "1rem",
                }}>
                  Considered: thought about carefully, with regard for form and consequence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ STATS STRIP ══════════ */}
      <section className="border-y border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-10 grid grid-cols-2 md:grid-cols-4 gap-y-6">
          {[
            { raw: 10000, suffix: "+", label: "Forms drafted" },
            { raw: 500000, suffix: "+", label: "Replies gathered" },
            { raw: 99.9, suffix: "%", label: "Service uptime", fixed: 1 },
            { raw: 4.9, suffix: " / 5", label: "Maker rating", fixed: 1 },
          ].map(({ raw, suffix, label, fixed }) => (
            <Reveal key={label} className="flex flex-col">
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                color: "var(--ef-amber, #C89B63)",
              }}>
                {fixed !== undefined ? raw.toFixed(fixed) : <Counter to={raw} />}{suffix}
              </span>
              <span style={{
                marginTop: "4px", fontSize: "11px", textTransform: "uppercase",
                letterSpacing: "0.24em", color: "var(--muted-foreground)",
                fontFamily: "'Inter', sans-serif",
              }}>{label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════ SECTION 01 — THE CRAFT ══════════ */}
      <section id="craft" className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-24 sm:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 gap-x-8">
            <Reveal className="lg:col-span-4">
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif", marginBottom: "12px" }}>Section 01</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.15 }}>
                The craft <br /> of <em style={{ color: "var(--ef-amber, #C89B63)" }}>asking</em>.
              </h2>
              <p style={{ marginTop: "1.5rem", maxWidth: "38ch", fontSize: "15px", lineHeight: 1.7, color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif" }}>
                Nine considered field types. Branching that reads like a sentence.
                A live preview that mirrors the final page.
              </p>
            </Reveal>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(({ icon: Icon, n, t, d }, i) => (
                <Reveal key={n} delay={i * 60}>
                  <div
                    className="ef-card p-6 rounded-xl"
                    style={{ cursor: "default", transition: "transform 0.25s, box-shadow 0.25s" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(200,155,99,0.12)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "";
                    }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.22em", color: "var(--muted-foreground)" }}>{n}</span>
                      <Icon style={{ width: 16, height: 16, color: "var(--ef-amber, #C89B63)" }} />
                    </div>
                    <h3 style={{ marginTop: "1.25rem", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "var(--foreground)" }}>{t}</h3>
                    <p style={{ marginTop: "0.5rem", fontSize: "13px", lineHeight: 1.65, color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif" }}>{d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 02 — STUDIO ══════════ */}
      <section id="studio" className="relative overflow-hidden border-b border-[color:var(--border)]">
        <div className="absolute inset-0 -z-10">
          <img src="/edinburgh-study.jpg" alt="" aria-hidden
            className="h-full w-full object-cover" style={{ opacity: 0.22 }} loading="lazy" />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(11,11,12,0.6) 0%, rgba(11,11,12,0.88) 70%, rgba(11,11,12,0.98) 100%)" }} />
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-24 sm:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 gap-x-8 items-center">
            <Reveal className="lg:col-span-5">
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif", marginBottom: "12px" }}>Section 02</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.15 }}>
                A studio that<br />stays <em style={{ color: "var(--ef-amber, #C89B63)" }}>out of your way</em>.
              </h2>
              <p style={{ marginTop: "1.5rem", maxWidth: "38ch", fontSize: "15px", lineHeight: 1.7, color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif" }}>
                The editor is a single, quiet surface. Drag a field, write a question, see the result.
              </p>
              <ul style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem", fontFamily: "'Inter', sans-serif" }}>
                {[
                  "Draft and publish in the same window",
                  "Themes that read like printed paper, not plastic",
                  "Keyboard-first for the people who prefer it",
                ].map(t => (
                  <li key={t} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontSize: "14px" }}>
                    <Check style={{ marginTop: 2, width: 16, height: 16, color: "var(--ef-amber, #C89B63)", flexShrink: 0 }} />
                    <span style={{ color: "rgba(255,255,255,0.82)" }}>{t}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="lg:col-span-7" delay={100}>
              <div className="ef-glass rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                {/* window chrome */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["rgba(255,99,99,0.5)", "rgba(255,200,50,0.5)", "rgba(50,205,80,0.5)"].map((c, i) => (
                      <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--muted-foreground)" }}>
                    edinform.studio / drafts / morning-survey
                  </span>
                  <EdinFormMark size={20} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
                  {/* sidebar */}
                  <div style={{ borderRight: "1px solid var(--border)", padding: "16px", minWidth: 130, display: "none" }}
                    className="sm:block">
                    <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)", marginBottom: "12px", fontFamily: "'Inter', sans-serif" }}>Fields</div>
                    <ul style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {["Short text", "Long text", "Choice", "Rating", "Date", "File"].map((f, i) => (
                        <li key={f} style={{
                          display: "flex", justifyContent: "space-between",
                          padding: "6px 8px", borderRadius: "6px",
                          fontSize: "13px", color: "rgba(255,255,255,0.8)",
                          fontFamily: "'Inter', sans-serif",
                          background: i === 0 ? "rgba(200,155,99,0.12)" : "transparent",
                          transition: "background 0.15s",
                          cursor: "pointer",
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i === 0 ? "rgba(200,155,99,0.12)" : "transparent"; }}>
                          <span>{f}</span>
                          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--muted-foreground)" }}>0{i + 1}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* preview */}
                  <div style={{ padding: "clamp(1.5rem, 4vw, 2.5rem)" }}>
                    <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)", marginBottom: "12px", fontFamily: "'Inter', sans-serif" }}>Draft preview</div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.4rem, 3vw, 1.9rem)", marginBottom: "4px" }}>A few quiet questions</h3>
                    <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "1.75rem", fontFamily: "'Inter', sans-serif" }}>Takes about two minutes. Thank you for your time.</p>

                    <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--muted-foreground)", marginBottom: "6px", fontFamily: "'Inter', sans-serif" }}>Your name</label>
                    <div className="ef-input" style={{ borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "1.5rem", fontFamily: "'Inter', sans-serif" }}>Type here…</div>

                    <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--muted-foreground)", marginBottom: "10px", fontFamily: "'Inter', sans-serif" }}>How did the morning feel?</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "1.75rem" }}>
                      {["Calm", "Busy", "Hopeful", "Tired"].map((o, i) => (
                        <span key={o}
                          className={i === 0 ? "ef-btn-primary" : "ef-btn-ghost"}
                          style={{ borderRadius: "999px", padding: "6px 14px", fontSize: "13px", cursor: "pointer", transition: "transform 0.15s", fontFamily: "'Inter', sans-serif" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.06)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}>
                          {o}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--muted-foreground)" }}>02 / 06</span>
                      <button className="ef-btn-primary"
                        style={{ borderRadius: "999px", padding: "6px 20px", fontSize: "12px", cursor: "pointer", transition: "transform 0.15s", fontFamily: "'Inter', sans-serif" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}>
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 03 — REPLIES ══════════ */}
      <section id="replies" className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-24 sm:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 gap-x-8">
            <Reveal className="lg:col-span-5">
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif", marginBottom: "12px" }}>Section 03</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.15 }}>
                Reading the<br /><em style={{ color: "var(--ef-amber, #C89B63)" }}>replies</em>.
              </h2>
              <p style={{ marginTop: "1.5rem", maxWidth: "38ch", fontSize: "15px", lineHeight: 1.7, color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif" }}>
                A page of replies that reads like a printed report. Filter, search, and export to a spreadsheet when you need to.
              </p>

              <div className="ef-glass rounded-2xl p-6 space-y-5 mt-10">
                {[["Total replies", "1,284"], ["Completion rate", "92%"], ["Avg. time", "1m 47s"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}
                    className="last:border-0 last:pb-0">
                    <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.24em", color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif" }}>{k}</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", color: "var(--foreground)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="lg:col-span-7" delay={100}>
              <figure style={{ overflow: "hidden", borderRadius: "1rem", border: "1px solid var(--border)" }}>
                <img src="/edinburgh-rain.jpg" alt="Rain on a tall arched window, Edinburgh by night"
                  style={{ aspectRatio: "16/11", width: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s ease" }}
                  loading="lazy"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }} />
              </figure>
              <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.24em", color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif" }}>
                <span>Plate II — A morning of replies</span>
                <span style={{ fontFamily: "monospace" }}>02 / 03</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 04 — TESTIMONIALS ══════════ */}
      <section id="notes" className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-24 sm:py-28">
          <Reveal>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif", marginBottom: "12px" }}>Section 04</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "3.5rem" }}>
              Notes from <em style={{ color: "var(--ef-amber, #C89B63)" }}>the field</em>.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              ["Replaces three tools at the studio. The team writes more, asks better.", "Isla M.", "Brand designer, Leith"],
              ["Finally a form tool that doesn't shout. Our completion rate went up.", "Marcus K.", "Researcher, Glasgow"],
              ["Looks like something we'd publish in print. Clients notice the difference.", "Priya R.", "Studio lead, London"],
            ].map(([quote, name, role], i) => (
              <Reveal key={name as string} delay={i * 80}>
                <figure className="ef-card p-7 rounded-xl h-full"
                  style={{
                    transition: "transform 0.25s, box-shadow 0.25s",
                    cursor: "default",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(200,155,99,0.10)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3rem", color: "var(--ef-amber, #C89B63)", lineHeight: 1 }}>&ldquo;</span>
                  <blockquote style={{ marginTop: "8px", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", lineHeight: 1.45, color: "var(--foreground)" }}>{quote}</blockquote>
                  <figcaption style={{ marginTop: "1.5rem", fontSize: "13px", color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif" }}>
                    <span style={{ color: "var(--foreground)" }}>{name}</span>
                    <span style={{ margin: "0 8px" }}>·</span>
                    <span>{role}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="relative overflow-hidden border-b border-[color:var(--border)]">
        <div className="absolute inset-0 -z-10"
          style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(200,155,99,0.15) 0%, transparent 70%)" }} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-28 sm:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <Reveal className="lg:col-span-8">
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif", marginBottom: "16px" }}>Begin</div>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(3rem, 8vw, 6rem)",
                lineHeight: 0.98,
                letterSpacing: "-0.02em",
              }}>
                A form is a<br />
                small, <em style={{ color: "var(--ef-amber, #C89B63)" }}>considered</em><br />
                act.
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-4" delay={150}>
              <p style={{ maxWidth: "36ch", fontSize: "15px", lineHeight: 1.7, color: "var(--muted-foreground)", marginBottom: "1.75rem", fontFamily: "'Inter', sans-serif" }}>
                Start with a single question. Publish in minutes. Read the replies tomorrow morning over coffee.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Link href={ctaHref}
                  className="group inline-flex items-center justify-center gap-2 rounded-full ef-btn-primary px-6 py-3 text-sm"
                  style={{ fontFamily: "'Inter', sans-serif", transition: "transform 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}>
                  {loggedIn ? "Open the studio" : "Begin a form, free"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-full ef-btn-ghost px-6 py-3 text-sm"
                  style={{ fontFamily: "'Inter', sans-serif", transition: "transform 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}>
                  See pricing
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background: "var(--sidebar)" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-20">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-5">
              <EdinFormLogo />
              <p style={{ marginTop: "1.5rem", maxWidth: "36ch", fontSize: "14px", color: "var(--muted-foreground)", lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
                A cinematic studio for the questions you ask the world. Drawn in Edinburgh, made for the modern web.
              </p>
            </div>

            {[
              {
                label: "Product",
                links: [
                  { t: "Templates", h: "/explore" },
                  { t: "Pricing", h: "/pricing" },
                  { t: loggedIn ? "Studio" : "Sign in", h: signInHref },
                ],
              },
              {
                label: "Studio",
                links: [
                  { t: "The Craft", h: "#craft" },
                  { t: "Notes", h: "#notes" },
                ],
              },
            ].map(({ label, links }) => (
              <div key={label} className="col-span-6 md:col-span-2">
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.24em", color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif", marginBottom: "1rem" }}>{label}</div>
                <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {links.map(({ t, h }) => (
                    <li key={t}>
                      <a href={h} style={{
                        fontSize: "14px", fontFamily: "'Inter', sans-serif",
                        color: "var(--foreground)", textDecoration: "none", transition: "color 0.2s",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--ef-amber, #C89B63)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; }}>
                        {t}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="col-span-12 md:col-span-3">
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.24em", color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif", marginBottom: "1rem" }}>Atelier</div>
              <p style={{ fontSize: "14px", color: "var(--muted-foreground)", lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
                Old Town, Edinburgh<br />Open all hours, by lamplight.
              </p>
            </div>
          </div>

          <div style={{
            marginTop: "4rem", display: "flex", flexDirection: "column", gap: "1rem",
            borderTop: "1px solid var(--border)", paddingTop: "1.5rem",
            fontSize: "12px", color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif",
          }}
            className="md:flex-row md:items-center md:justify-between">
            <p>© 2026 EdinForm Studio. Set with Cormorant Garamond and Inter.</p>
            <p style={{ letterSpacing: "0.28em", textTransform: "uppercase" }}>Edinburgh — Made with patience</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sm\\:block { display: block; }
        @media (max-width: 639px) { .sm\\:block { display: none !important; } }
      `}</style>
    </div>
  );
}
