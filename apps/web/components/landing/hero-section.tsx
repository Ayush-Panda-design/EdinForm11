"use client";

import Link from "next/link";
import { ArrowRight, Check, Play, Star } from "lucide-react";
import { RevealOnMount, Counter } from "~/components/landing/motion";
import { LANDING_IMAGES } from "~/components/landing/landing-images";
import { LandingImage } from "~/components/landing/landing-image";
import { HeroIllustration } from "~/components/landing/hero-illustration";

const HERO_AVATARS = [
  LANDING_IMAGES.testimonials.isla,
  LANDING_IMAGES.testimonials.marcus,
  LANDING_IMAGES.testimonials.priya,
  LANDING_IMAGES.testimonials.tom,
];

const HERO_METRICS = [
  { to: 10000, suffix: "+", label: "Forms built" },
  { to: 1200000, suffix: "+", label: "Responses" },
  { to: 4.9, suffix: "/5", label: "Rating", fixed: 1 as const },
];

export function HeroSection({ ctaHref }: { ctaHref: string }) {
  return (
    <section className="mkt-hero" aria-label="EdinForm hero">
      <div className="mkt-hero__orbs" aria-hidden>
        <span className="mkt-hero__orb mkt-hero__orb--1" />
        <span className="mkt-hero__orb mkt-hero__orb--2" />
        <span className="mkt-hero__orb mkt-hero__orb--3" />
      </div>

      <div className="mkt-container">
        <div className="mkt-hero__grid">
          <div className="mkt-hero__copy">
            <RevealOnMount delay={0}>
              <div className="mkt-badge mkt-badge--pulse mkt-shimmer mkt-hero__badge">
                <span className="mkt-badge-dot mkt-badge-dot--live" aria-hidden />
                Intelligent form builder
              </div>
            </RevealOnMount>

            <RevealOnMount delay={80} variant="up">
              <h1 className="mkt-hero-title mkt-hero-title--compact">
                <span className="mkt-hero-title__line">
                  <span className="mkt-hero-word mkt-hero-word--1">Build</span>{" "}
                  <span className="mkt-hero-word mkt-hero-word--2">forms</span>{" "}
                  <em className="mkt-hero-word mkt-hero-word--3">people actually</em>
                </span>
                <span className="mkt-hero-title__line mkt-hero-title__line--finish">
                  <span className="mkt-hero-word mkt-hero-word--5">
                    finish<span className="mkt-hero-word__punct">.</span>
                  </span>
                  <svg className="mkt-hero-title__underline" viewBox="0 0 200 12" aria-hidden>
                    <path
                      d="M4 8 C48 2, 92 10, 196 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
            </RevealOnMount>

            <RevealOnMount delay={160} variant="up">
              <p className="mkt-hero-lead">
                Multi-step flows, conditional logic, and live analytics — one calm workspace for
                teams who care about completion rates.
              </p>
            </RevealOnMount>

            <RevealOnMount delay={200} variant="fade">
              <div className="mkt-hero__trust mkt-hero__trust--compact">
                <div className="mkt-hero__avatars mkt-hero__avatars--compact" aria-hidden>
                  {HERO_AVATARS.map((src, i) => (
                    <span key={src} className="mkt-hero__avatar" style={{ zIndex: 4 - i }}>
                      <LandingImage
                        src={src}
                        alt=""
                        width={28}
                        height={28}
                        className="mkt-photo-cover"
                      />
                    </span>
                  ))}
                </div>
                <div className="mkt-hero__trust-stars" aria-label="4.9 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} style={{ width: 11, height: 11 }} fill="currentColor" />
                  ))}
                </div>
                <p className="mkt-hero__trust-text">
                  <strong>4.9</strong> · 10,000+ teams ship forms here
                </p>
              </div>
            </RevealOnMount>

            <RevealOnMount delay={240} variant="up">
              <div className="mkt-hero__actions">
                <Link
                  href={ctaHref}
                  className="mkt-btn-primary mkt-btn-animated mkt-hero__cta-primary"
                >
                  Start building free <ArrowRight style={{ width: 15, height: 15 }} aria-hidden />
                </Link>
                <a href="#demo" className="mkt-hero__cta-demo mkt-btn-animated">
                  <span className="mkt-hero__cta-demo-icon" aria-hidden>
                    <Play style={{ width: 14, height: 14 }} fill="currentColor" />
                  </span>
                  <span className="mkt-hero__cta-demo-copy">
                    <span className="mkt-hero__cta-demo-label">Try interactive demo</span>
                    <span className="mkt-hero__cta-demo-hint">
                      No signup — scroll to form below
                    </span>
                  </span>
                </a>
              </div>
            </RevealOnMount>

            <RevealOnMount delay={320} variant="fade">
              <ul
                className="mkt-hero__checks mkt-hero__checks--inline"
                aria-label="Product highlights"
              >
                {["Free plan forever", "No credit card", "GDPR compliant"].map((t) => (
                  <li key={t}>
                    <Check style={{ width: 12, height: 12 }} aria-hidden /> {t}
                  </li>
                ))}
              </ul>
            </RevealOnMount>

            <div className="mkt-hero__below-fold">
              <RevealOnMount delay={480} variant="up">
                <div className="mkt-hero__metrics">
                  {HERO_METRICS.map(({ to, suffix, label, fixed }) => (
                    <div key={label} className="mkt-hero__metric">
                      <span className="mkt-hero__metric-value">
                        <Counter to={to} suffix={suffix} fixed={fixed} />
                      </span>
                      <span className="mkt-hero__metric-label">{label}</span>
                    </div>
                  ))}
                </div>
              </RevealOnMount>
            </div>
          </div>

          <div className="mkt-hero__visual-col">
            <RevealOnMount delay={180} variant="scale" className="mkt-hero__visual-reveal">
              <div className="mkt-hero__visual-wrap">
                <div className="mkt-hero-glow" aria-hidden />
                <div className="mkt-hero__visual-card mkt-animate-float-slow">
                  <HeroIllustration />
                </div>
              </div>
            </RevealOnMount>
          </div>
        </div>
      </div>
    </section>
  );
}
