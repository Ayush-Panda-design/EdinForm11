"use client";

import Link from "next/link";
import { ArrowRight, Check, ChevronDown, MessageCircle } from "lucide-react";
import { Reveal, Counter, LogoMarquee, BlurReveal, Stagger } from "~/components/landing/motion";
import {
  ResponseSparkline,
  TimeSavedBar,
  DropoffCalendar,
} from "~/components/landing/editorial-viz";
import {
  TRUST_LOGOS,
  HOW_STEPS,
  BENTO_FEATURES,
  LANDING_PLANS,
  TESTIMONIALS,
  STATS,
  PROBLEM_INSIGHTS,
} from "~/components/landing/landing-data";
import { LandingImage } from "~/components/landing/landing-image";
import { LANDING_VIDEOS } from "~/components/landing/landing-videos";
import { LANDING_IMAGES } from "~/components/landing/landing-images";
import { StepMedia } from "~/components/landing/step-media";
import { HeroSection } from "~/components/landing/hero-section";
import { VideoHeroSection, TeamVideoSection } from "~/components/landing/video-hero-section";

function SectionHeader({
  label,
  title,
  description,
  align = "left",
  compact = false,
}: {
  label: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  compact?: boolean;
}) {
  return (
    <div
      className={compact ? "mkt-section-header--compact" : undefined}
      style={{
        textAlign: align,
        marginBottom: compact ? undefined : "3rem",
        maxWidth: align === "left" ? "52ch" : "56ch",
        marginLeft: align === "center" ? "auto" : undefined,
        marginRight: align === "center" ? "auto" : undefined,
      }}
    >
      <p className="mkt-section-label">{label}</p>
      <h2 className="mkt-heading">{title}</h2>
      {description && (
        <p className="mkt-body" style={{ marginTop: "1rem" }}>
          {description}
        </p>
      )}
    </div>
  );
}

function TestimonialCard({
  q,
  name,
  role,
  metric,
  metricLabel,
  category,
  avatar,
}: {
  q: string;
  name: string;
  role: string;
  metric: string;
  metricLabel: string;
  category: string;
  avatar?: string;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mkt-testimonial-card mkt-hover-lift">
      <div className="mkt-testimonial-head">
        <div className="mkt-testimonial-icon" aria-hidden>
          <MessageCircle style={{ width: 14, height: 14 }} />
        </div>
        <span className="mkt-testimonial-cat">{category}</span>
      </div>
      <div className="mkt-testimonial-metric">{metric}</div>
      <div className="mkt-testimonial-metric-sub">{metricLabel}</div>
      <blockquote className="mkt-testimonial-quote">&ldquo;{q}&rdquo;</blockquote>
      <div className="mkt-testimonial-author">
        {avatar ? (
          <div className="mkt-testimonial-avatar mkt-testimonial-avatar--photo">
            <LandingImage
              src={avatar}
              alt={name}
              width={32}
              height={32}
              className="mkt-photo-cover"
            />
          </div>
        ) : (
          <div className="mkt-testimonial-avatar">{initials}</div>
        )}
        <div>
          <div className="mkt-testimonial-name">{name}</div>
          <div className="mkt-testimonial-role">{role}</div>
        </div>
      </div>
    </div>
  );
}

const VIZ_MAP = {
  sparkline: ResponseSparkline,
  bar: TimeSavedBar,
  calendar: DropoffCalendar,
} as const;

export function LandingSections({
  ctaHref,
  liveDemo,
  faqs,
  activeFaq,
  setActiveFaq,
}: {
  ctaHref: string;
  liveDemo: React.ReactNode;
  faqs: { q: string; a: string }[];
  activeFaq: number | null;
  setActiveFaq: (v: number | null) => void;
}) {
  const featuredTestimonials = TESTIMONIALS.slice(0, 3);

  return (
    <>
      {/* 1. Hero */}
      <HeroSection ctaHref={ctaHref} />

      {/* 2. Logo cloud */}
      <section className="mkt-logo-cloud" aria-label="Trusted by">
        <p className="mkt-logo-cloud__label">
          From research surveys to onboarding flows — built in one place
        </p>
        <LogoMarquee logos={TRUST_LOGOS} />
      </section>

      {/* 3. How it works */}
      <section className="mkt-section" id="how">
        <div className="mkt-container">
          <Reveal>
            <SectionHeader
              label="How it works"
              title="From idea to insights in four steps."
              description="EdinForm removes every unnecessary step between asking a question and understanding the answer."
              align="center"
            />
          </Reveal>
          <div className="mkt-steps-grid">
            {HOW_STEPS.map(({ n, title, body, image, imageAlt }, i) => (
              <Reveal key={n} delay={i * 70} variant="up">
                <div
                  className="mkt-grid-card mkt-grid-card--photo mkt-hover-lift"
                  style={{ height: "100%", padding: 0, overflow: "hidden" }}
                >
                  <StepMedia image={image} imageAlt={imageAlt} />
                  <div style={{ padding: "1.5rem" }}>
                    <p className="mkt-step-label">Step {n}</p>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        marginBottom: "8px",
                        color: "var(--mkt-text)",
                      }}
                    >
                      {title}
                    </h3>
                    <p style={{ fontSize: "14px", lineHeight: 1.65, color: "var(--mkt-muted)" }}>
                      {body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Problem / insights */}
      <section className="mkt-section">
        <div className="mkt-container">
          <Reveal>
            <SectionHeader
              label="The problem"
              title={
                <>
                  Most form tools overwhelm.
                  <br />
                  Most builders disappoint.
                </>
              }
              align="center"
            />
          </Reveal>
          <div className="mkt-problem-grid">
            {PROBLEM_INSIGHTS.map(({ title, viz, caption }, i) => {
              const Viz = VIZ_MAP[viz];
              return (
                <BlurReveal key={title} delay={i * 90}>
                  <div className="mkt-problem-card mkt-hover-lift mkt-animate-problem">
                    <Viz />
                    <div className="mkt-problem-card-body">
                      <p className="mkt-step-label">{title}</p>
                      <p>{caption}</p>
                    </div>
                  </div>
                </BlurReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Team showcase — cinematic video */}
      <TeamVideoSection clip={LANDING_VIDEOS.showcase} />

      {/* 6. Features bento */}
      <section className="mkt-section" id="features">
        <div className="mkt-container">
          <Reveal>
            <SectionHeader
              label="Features"
              title="Built for the whole form lifecycle."
              description="Logic, analytics, collaboration, and integrations — in one calm workspace."
            />
          </Reveal>
          <Stagger stagger={45} variant="scale" className="mkt-features-grid">
            {BENTO_FEATURES.map(({ icon: Icon, n, title, body, color }) => (
              <article
                key={n}
                className="mkt-feature-card mkt-hover-lift mkt-feature-card--animated"
                style={{ "--feature-accent": color } as React.CSSProperties}
              >
                <div className="mkt-feature-card__top">
                  <div className="mkt-feature-card__icon" aria-hidden>
                    <Icon />
                  </div>
                  <span className="mkt-step-label">{n}</span>
                </div>
                <h3 className="mkt-feature-card__title">{title}</h3>
                <p className="mkt-feature-card__body">{body}</p>
              </article>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 7. Live demo — before cinematic video so nav stays on light bg */}
      <section className="mkt-section mkt-section--demo" id="demo">
        <div className="mkt-container">
          <Reveal>
            <SectionHeader
              label="Live demo"
              title="A real EdinForm, live right here."
              description="Every interaction — field focus, validation, progress — is exactly what your respondents will experience."
              align="center"
              compact
            />
          </Reveal>
          <Reveal delay={100}>
            <div className="mkt-demo-wrap">{liveDemo}</div>
          </Reveal>
        </div>
      </section>

      {/* 8. Product video — full-bleed cinematic */}
      <VideoHeroSection clip={LANDING_VIDEOS.product} ctaHref={ctaHref} />

      {/* 9. Stats */}
      <section className="mkt-logo-cloud" style={{ padding: "3.5rem 1.5rem" }}>
        <div className="mkt-container" style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
          {STATS.map(({ raw, suffix, label, fixed }, i) => (
            <Reveal
              key={label}
              delay={i * 80}
              style={{
                flex: "1 1 180px",
                textAlign: "center",
                padding: "1rem",
                borderRight: i < 3 ? "1px solid var(--mkt-border)" : "none",
              }}
            >
              <div className="mkt-stat-value">
                {fixed !== undefined ? raw.toFixed(fixed) : <Counter to={raw} />}
                {suffix}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  color: "var(--mkt-muted)",
                  marginTop: "8px",
                }}
              >
                {label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 8. Testimonials */}
      <section className="mkt-section">
        <div className="mkt-container">
          <Reveal>
            <SectionHeader
              label="Testimonials"
              title="Trusted by teams building better forms."
              align="center"
            />
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            {featuredTestimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 80} variant="up">
                <div className={`mkt-float-stagger-${i % 3}`}>
                  <TestimonialCard {...t} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Pricing */}
      <section className="mkt-section" id="pricing">
        <div className="mkt-container">
          <Reveal>
            <SectionHeader
              label="Pricing"
              title="Simple pricing, built to scale."
              description="Start free and grow from personal forms to team workflows — no hidden costs."
              align="center"
            />
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.25rem",
              alignItems: "stretch",
            }}
          >
            {LANDING_PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 60} variant="scale">
                <div
                  className={`mkt-pricing-card relative${plan.highlight ? " mkt-pricing-card--highlight" : ""}`}
                >
                  {plan.highlight && <span className="mkt-pricing-popular">Popular</span>}
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "var(--mkt-muted)",
                    }}
                  >
                    {plan.name}
                  </p>
                  <p
                    style={{
                      fontSize: "2.25rem",
                      fontWeight: 600,
                      color: "var(--mkt-text)",
                      marginTop: "0.75rem",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {plan.price}
                  </p>
                  <p style={{ fontSize: "14px", color: "var(--mkt-muted)" }}>/ {plan.period}</p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--mkt-muted)",
                      marginTop: "1rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {plan.desc}
                  </p>
                  <Link
                    href={plan.href}
                    className={plan.highlight ? "mkt-btn-primary" : "mkt-btn-outline"}
                    style={{ marginTop: "1.5rem", justifyContent: "center", width: "100%" }}
                  >
                    {plan.cta}
                  </Link>
                  <ul
                    style={{
                      marginTop: "1.5rem",
                      paddingTop: "1.5rem",
                      borderTop: "1px solid var(--mkt-border)",
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.65rem",
                      flex: 1,
                    }}
                  >
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.5rem",
                          fontSize: "13px",
                          color: "var(--mkt-muted)",
                        }}
                      >
                        <Check
                          style={{
                            width: 14,
                            height: 14,
                            color: "var(--mkt-text)",
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="mkt-section" id="faq">
        <div className="mkt-container" style={{ maxWidth: "720px" }}>
          <Reveal>
            <SectionHeader label="FAQ" title="Common questions, answered plainly." align="center" />
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {faqs.map(({ q, a }, i) => (
              <Reveal key={q} delay={i * 40}>
                <div className={`mkt-faq-item${activeFaq === i ? " mkt-faq-item--open" : ""}`}>
                  <button
                    type="button"
                    className="mkt-faq-trigger"
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  >
                    <span className="mkt-faq-question">{q}</span>
                    <ChevronDown className="mkt-faq-chevron" />
                  </button>
                  <div className="mkt-faq-answer">
                    <p>{a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Final CTA */}
      <section
        className="mkt-section--xl mkt-cta-section"
        style={{ position: "relative", overflow: "hidden", textAlign: "center" }}
      >
        <div className="mkt-cta-bg mkt-ken-burns-wrap" aria-hidden>
          <LandingImage
            src={LANDING_IMAGES.cta}
            alt=""
            fill
            className="mkt-photo-cover mkt-ken-burns"
            sizes="100vw"
          />
        </div>
        <div className="mkt-cta-overlay" aria-hidden />
        <div
          className="mkt-container"
          style={{ position: "relative", maxWidth: "720px", zIndex: 1 }}
        >
          <Reveal>
            <p className="mkt-section-label" style={{ textAlign: "center", marginBottom: "1rem" }}>
              Get started
            </p>
            <h2 className="mkt-heading mkt-heading--lg" style={{ marginBottom: "1.25rem" }}>
              Your next great form
              <br />
              starts <em>here.</em>
            </h2>
            <p
              className="mkt-body"
              style={{ maxWidth: "42ch", margin: "0 auto 2rem", fontSize: "17px" }}
            >
              Join thousands of teams using EdinForm to ask better questions and get cleaner
              answers. Free plan — no credit card, no time limit.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "0.75rem",
                marginBottom: "2rem",
              }}
            >
              <Link
                href={ctaHref}
                className="mkt-btn-primary"
                style={{ fontSize: "15px", padding: "14px 28px" }}
              >
                Start building for free <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <a
                href="#demo"
                className="mkt-btn-secondary"
                style={{ fontSize: "15px", padding: "14px 28px" }}
              >
                See how it works <ArrowRight style={{ width: 16, height: 16 }} />
              </a>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "1.5rem",
                fontSize: "13px",
                color: "var(--mkt-muted)",
              }}
            >
              {["Free plan forever", "No credit card needed", "GDPR compliant"].map((t) => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Check style={{ width: 12, height: 12, color: "var(--mkt-text)" }} /> {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
