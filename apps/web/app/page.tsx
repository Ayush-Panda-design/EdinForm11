"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X, Check, CheckCircle2, ArrowUpRight } from "lucide-react";
import { isAuthenticated } from "~/lib/auth";
import { EdinFormLogo } from "~/components/brand/logo";
import { LandingSections } from "~/components/landing/landing-sections";

/* ══════════════════════════════════════════════════
   LIVE DEMO FORM (unchanged from original)
══════════════════════════════════════════════════ */
function LiveDemoForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const questions = [
    {
      id: "role",
      type: "choice",
      tag: "About you",
      question: "What's your primary role?",
      sub: "This helps us show you the most relevant features.",
      options: [
        "Product Manager",
        "Designer",
        "Developer",
        "Researcher",
        "Marketer",
        "Founder / CEO",
      ],
    },
    {
      id: "tool",
      type: "choice",
      tag: "Current setup",
      question: "Which form tool are you currently using?",
      sub: "Don't worry — we'll convince you to switch.",
      options: ["Google Forms", "Tally", "Jotform", "Airtable Forms", "None yet", "Other"],
    },
    {
      id: "pain",
      type: "multiline",
      tag: "The problem",
      question: "What's the biggest frustration with your current setup?",
      sub: "Be blunt — we read every answer.",
      placeholder: "e.g. Ugly, logic is confusing, responses are hard to read…",
    },
    {
      id: "frequency",
      type: "scale",
      tag: "Usage",
      question: "How often does your team create or update forms?",
      sub: "We want to understand your workflow rhythm.",
      options: ["Rarely", "Monthly", "Weekly", "Multiple times/week", "Daily"],
    },
    {
      id: "priority",
      type: "choice",
      tag: "What matters most",
      question: "Which matters most in a form tool?",
      sub: "Pick the single most important factor.",
      options: [
        "Ease of use",
        "Design quality",
        "Logic & branching",
        "Analytics depth",
        "Integrations",
        "Price",
      ],
    },
    {
      id: "email",
      type: "email",
      tag: "Stay in the loop",
      question: "Where should we send your personalised EdinForm walkthrough?",
      sub: "One email, no spam, unsubscribe any time.",
      placeholder: "you@company.com",
    },
  ];

  const current = questions[step]!;
  const progress = (step / questions.length) * 100;
  const answer = answers[current.id];
  const canAdvance =
    (current.type === "choice" && answer) ||
    (current.type === "scale" && answer) ||
    (current.type === "multiline" && typeof answer === "string" && answer.trim().length > 3) ||
    (current.type === "email" &&
      typeof answer === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer));

  function goNext() {
    if (!canAdvance) return;
    setTransitioning(true);
    setTimeout(() => {
      if (step < questions.length - 1) setStep((s) => s + 1);
      else setSubmitted(true);
      setTransitioning(false);
    }, 220);
  }
  function goPrev() {
    if (step === 0) return;
    setTransitioning(true);
    setTimeout(() => {
      setStep((s) => s - 1);
      setTransitioning(false);
    }, 220);
  }

  function formatAnswer(value: string | number | undefined, type: string) {
    if (value === undefined || value === "") return null;
    const str = String(value).trim();
    if (!str) return null;
    if (type === "email") return str;
    return str.length > 64 ? `${str.slice(0, 64)}…` : str;
  }

  return (
    <div className="mkt-demo-layout">
      <div className="mkt-demo-main">
        <div className="mkt-demo-card">
          <div className="mkt-demo-chrome">
            <div style={{ display: "flex", gap: "6px" }}>
              {["rgba(255,99,99,0.4)", "rgba(255,200,50,0.4)", "rgba(50,205,80,0.4)"].map(
                (c, i) => (
                  <span
                    key={i}
                    style={{ width: 9, height: 9, borderRadius: "50%", background: c }}
                  />
                ),
              )}
            </div>
            <span className="mkt-demo-chrome__url">edinform.io/demo/product-feedback</span>
            <span className="mkt-demo-chrome__step">
              {step + 1} / {questions.length}
            </span>
          </div>
          <div className="mkt-demo-progress-track">
            <div
              className="mkt-demo-progress-bar"
              style={{ width: submitted ? "100%" : `${progress}%` }}
            />
          </div>
          <div
            style={{
              padding: "2.5rem 2rem 2rem",
              opacity: transitioning ? 0 : 1,
              transform: transitioning ? "translateY(8px)" : "translateY(0)",
              transition: "opacity 0.22s ease, transform 0.22s ease",
            }}
          >
            {submitted ? (
              <div style={{ textAlign: "center", padding: "1.5rem 0 2rem" }}>
                <div className="mkt-demo-success-icon">
                  <CheckCircle2 style={{ width: 28, height: 28, color: "#16a34a" }} />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    marginBottom: "10px",
                    color: "var(--foreground)",
                  }}
                >
                  You're all set.
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--mkt-muted)",
                    lineHeight: 1.75,
                    marginBottom: "1.75rem",
                    maxWidth: "36ch",
                    margin: "0 auto 1.75rem",
                  }}
                >
                  We've received your answers. In the meantime — your first form is one click away.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href="/auth/register"
                    className="mkt-btn-primary"
                    style={{ fontSize: "13px", padding: "10px 22px" }}
                  >
                    Start building free <ArrowRight style={{ width: 13, height: 13 }} />
                  </Link>
                  <button
                    onClick={() => {
                      setStep(0);
                      setAnswers({});
                      setSubmitted(false);
                    }}
                    className="mkt-btn-outline"
                    style={{
                      padding: "10px 18px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    ↩ Start over
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "1.5rem" }}>
                  <div className="mkt-demo-tag">{current.tag}</div>
                  <h3
                    style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: "var(--foreground)",
                      marginBottom: "6px",
                    }}
                  >
                    {current.question}
                  </h3>
                  <p
                    style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.6 }}
                  >
                    {current.sub}
                  </p>
                </div>

                {current.type === "choice" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      marginBottom: "2rem",
                    }}
                  >
                    {current.options!.map((opt) => {
                      const active = answer === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswers((a) => ({ ...a, [current.id]: opt }))}
                          className={`mkt-demo-option${active ? " mkt-demo-option--active" : ""}`}
                        >
                          {opt}
                          {active && (
                            <CheckCircle2
                              style={{ width: 15, height: 15, flexShrink: 0, color: "#2563eb" }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {current.type === "scale" && (
                  <div style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {current.options!.map((opt) => {
                        const active = answer === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setAnswers((a) => ({ ...a, [current.id]: opt }))}
                            className={`mkt-demo-scale${active ? " mkt-demo-scale--active" : ""}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {current.type === "multiline" && (
                  <textarea
                    value={typeof answer === "string" ? answer : ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [current.id]: e.target.value }))}
                    placeholder={current.placeholder}
                    rows={4}
                    autoFocus
                    className={`mkt-demo-input${answer ? " mkt-demo-input--filled" : ""}`}
                    style={{ resize: "none", lineHeight: 1.65, marginBottom: "2rem" }}
                  />
                )}

                {current.type === "email" && (
                  <div style={{ marginBottom: "2rem" }}>
                    <input
                      type="email"
                      value={typeof answer === "string" ? answer : ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [current.id]: e.target.value }))}
                      placeholder={current.placeholder}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") goNext();
                      }}
                      className="mkt-demo-input"
                      style={{ fontSize: "15px" }}
                    />
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--mkt-muted)",
                        marginTop: "8px",
                      }}
                    >
                      One email, no drip sequences.
                    </p>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={step === 0}
                    className="mkt-btn-outline"
                    style={{
                      padding: "9px 16px",
                      fontSize: "13px",
                      opacity: step === 0 ? 0.35 : 1,
                      cursor: step === 0 ? "default" : "pointer",
                    }}
                  >
                    ← Back
                  </button>
                  <div className="mkt-demo-dots">
                    {questions.map((_, i) => (
                      <div
                        key={i}
                        className={`mkt-demo-dot${
                          i < step
                            ? " mkt-demo-dot--done"
                            : i === step
                              ? " mkt-demo-dot--current"
                              : " mkt-demo-dot--future"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canAdvance}
                    className={canAdvance ? "mkt-btn-primary" : "mkt-btn-outline"}
                    style={{
                      padding: "9px 22px",
                      fontSize: "13px",
                      opacity: canAdvance ? 1 : 0.45,
                      cursor: canAdvance ? "pointer" : "default",
                    }}
                  >
                    {step === questions.length - 1 ? "Submit" : "Next"}
                    <ArrowRight style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <aside className="mkt-demo-sidebar">
        <div className="mkt-demo-answers-card">
          <div className="mkt-demo-answers-title">Your answers so far</div>
          <div className="mkt-demo-answers-list">
            {questions.map((q, i) => {
              const ans = formatAnswer(answers[q.id], q.type);
              const done = !!ans || submitted;
              const isCurrent = i === step && !submitted;
              const rowClass = done
                ? "mkt-demo-answer-row mkt-demo-answer-row--done"
                : isCurrent
                  ? "mkt-demo-answer-row mkt-demo-answer-row--current"
                  : "mkt-demo-answer-row mkt-demo-answer-row--pending";

              return (
                <div key={q.id} className={rowClass}>
                  <div className="mkt-demo-answer-dot">
                    {done ? (
                      <Check style={{ width: 10, height: 10, color: "#16a34a" }} />
                    ) : isCurrent ? (
                      <span className="mkt-demo-answer-dot__pulse" />
                    ) : null}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="mkt-demo-answer-tag">{q.tag}</div>
                    {ans ? (
                      <div className="mkt-demo-answer-value">
                        {q.type === "email" ? `✉ ${ans}` : ans}
                      </div>
                    ) : (
                      <div className="mkt-demo-answer-placeholder">
                        {isCurrent ? "Answering now…" : "Not yet answered"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [announceDismissed, setAnnounceDismissed] = useState(false);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);
  useEffect(() => {
    let ticking = false;
    const fn = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setNavScrolled(window.scrollY > 48);
        ticking = false;
      });
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const ctaHref = loggedIn ? "/dashboard" : "/auth/register";

  const faqs = [
    {
      q: "Is EdinForm free to start?",
      a: "Yes — the free plan gives you unlimited forms with up to 100 responses per month. No credit card required, no time limit.",
    },
    {
      q: "Can I embed forms on my website?",
      a: "Absolutely. EdinForm generates a lightweight embed snippet you can drop into any HTML page, React app, or website builder.",
    },
    {
      q: "How does branching logic work?",
      a: "You define rules on any field: 'if the answer is X, skip to question Y'. Build decision trees visually without writing code.",
    },
    {
      q: "Is my respondents' data secure?",
      a: "All data is encrypted in transit and at rest. We're GDPR-compliant and never sell or share your respondents' data.",
    },
    {
      q: "Can I export my responses?",
      a: "Yes — export to CSV or JSON at any time from your dashboard. Webhook integrations are available on paid plans.",
    },
  ];

  return (
    <div className="min-h-screen marketing-page relative">
      {!announceDismissed && (
        <div className="mkt-announce">
          <span>
            New: Live analytics and drop-off detection are now on every plan.{" "}
            <a href="#features">See what&apos;s new</a>
          </span>
          <button
            type="button"
            className="mkt-announce-close"
            aria-label="Dismiss announcement"
            onClick={() => setAnnounceDismissed(true)}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}
      {/* ── NAVBAR ── */}
      <nav
        className={`mkt-nav${navScrolled ? " mkt-nav--scrolled" : ""}${navOpen ? " mkt-nav--open" : ""}`}
      >
        <div className="mkt-nav-shell">
          <div className="mkt-nav-glass">
            <div className="mkt-nav-bar">
              <EdinFormLogo size={navScrolled ? 26 : 32} className="mkt-nav-logo" />
              <div className="mkt-nav-links hidden-mobile">
                {[
                  { l: "Features", h: "#features" },
                  { l: "How it works", h: "#how" },
                  { l: "Pricing", h: "#pricing" },
                  { l: "Templates", h: "/explore" },
                ].map(({ l, h }) => (
                  <a key={l} href={h} className="mkt-nav-link">
                    {l}
                  </a>
                ))}
              </div>
              <div className="mkt-nav-actions">
                {loggedIn ? (
                  <Link href="/dashboard" className="mkt-btn-primary mkt-nav-cta">
                    Open dashboard <ArrowUpRight style={{ width: 13, height: 13 }} />
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" className="mkt-nav-signin hidden-mobile">
                      Log in
                    </Link>
                    <Link href="/auth/register" className="mkt-btn-primary mkt-nav-cta">
                      Start building free <ArrowRight style={{ width: 14, height: 14 }} />
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setNavOpen((v) => !v)}
                  className="mkt-nav-toggle show-mobile"
                  aria-label="Toggle menu"
                  aria-expanded={navOpen}
                >
                  {navOpen ? (
                    <X style={{ width: 16, height: 16 }} />
                  ) : (
                    <Menu style={{ width: 16, height: 16 }} />
                  )}
                </button>
              </div>
            </div>

            <div className="mkt-nav-mobile">
              <div className="mkt-nav-mobile-inner">
                {[
                  { l: "Features", h: "#features" },
                  { l: "How it works", h: "#how" },
                  { l: "Pricing", h: "#pricing" },
                  { l: "Templates", h: "/explore" },
                ].map(({ l, h }) => (
                  <a
                    key={l}
                    href={h}
                    className="mkt-nav-link mkt-nav-mobile-link"
                    onClick={() => setNavOpen(false)}
                  >
                    {l}
                  </a>
                ))}
                <div className="mkt-nav-mobile-divider" />
                <Link
                  href="/auth/login"
                  className="mkt-nav-link mkt-nav-mobile-link"
                  onClick={() => setNavOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="mkt-btn-primary mkt-nav-cta"
                  style={{ justifyContent: "center" }}
                  onClick={() => setNavOpen(false)}
                >
                  Start free — no card needed
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <LandingSections
        ctaHref={ctaHref}
        liveDemo={<LiveDemoForm />}
        faqs={faqs}
        activeFaq={activeFaq}
        setActiveFaq={setActiveFaq}
      />

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: "1px solid var(--mkt-border)", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", marginBottom: "4rem" }}>
            <div style={{ flex: "2 1 260px" }}>
              <EdinFormLogo />
              <p
                style={{
                  marginTop: "1rem",
                  maxWidth: "36ch",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  color: "var(--mkt-muted)",
                  fontFamily: "var(--font-sans), sans-serif",
                }}
              >
                The form builder for teams who value experience. Build, publish, and analyze — in
                one calm, considered workspace.
              </p>
              <div style={{ marginTop: "1.25rem", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["GDPR", "SOC 2", "CCPA"].map((badge) => (
                  <span
                    key={badge}
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "var(--mkt-muted)",
                      fontFamily: "monospace",
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            {[
              {
                label: "Product",
                links: [
                  { t: "Features", h: "#features" },
                  { t: "Templates", h: "/explore" },
                  { t: "Pricing", h: "#pricing" },
                  { t: "Changelog", h: "/changelog" },
                ],
              },
              {
                label: "Company",
                links: [
                  { t: "About", h: "/about" },
                  { t: "Blog", h: "/blog" },
                  { t: "Careers", h: "/careers" },
                  { t: "Contact", h: "/contact" },
                ],
              },
              {
                label: "Legal",
                links: [
                  { t: "Privacy", h: "/privacy" },
                  { t: "Terms", h: "/terms" },
                  { t: "Security", h: "/security" },
                ],
              },
            ].map(({ label, links }) => (
              <div key={label} style={{ flex: "1 1 120px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.24em",
                    color: "var(--mkt-muted)",
                    fontWeight: 600,
                    marginBottom: "1rem",
                    fontFamily: "monospace",
                  }}
                >
                  {label}
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {links.map(({ t, h }) => (
                    <li key={t}>
                      <a
                        href={h}
                        style={{
                          fontSize: "15px",
                          color: "var(--mkt-muted)",
                          textDecoration: "none",
                          transition: "color 0.2s",
                          fontFamily: "var(--font-sans), sans-serif",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "#e11d8f";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "";
                        }}
                      >
                        {t}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            style={{
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(15,23,42,0.08)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              fontSize: "13px",
              color: "var(--muted-foreground)",
              gap: "1rem",
              fontFamily: "var(--font-sans), sans-serif",
            }}
          >
            <span>© 2026 EdinForm. All rights reserved.</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22d3ee" }} />
              All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
