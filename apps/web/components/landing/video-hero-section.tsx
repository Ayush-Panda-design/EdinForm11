"use client";

import Link from "next/link";
import { ArrowRight, Play, Users } from "lucide-react";
import { BlurReveal, Reveal } from "~/components/landing/motion";
import { LandingVideo } from "~/components/landing/landing-video";
import type { LandingVideoClip } from "~/components/landing/landing-videos";

type CinematicVideoSectionProps = {
  clip: LandingVideoClip;
  id?: string;
  label: string;
  labelIcon?: "play" | "users";
  title: React.ReactNode;
  description: string;
  align?: "center" | "left";
  size?: "default" | "compact";
  chips?: string[];
  ctaHref?: string;
  showActions?: boolean;
};

export function CinematicVideoSection({
  clip,
  id,
  label,
  labelIcon = "play",
  title,
  description,
  align = "center",
  size = "default",
  chips = [],
  ctaHref,
  showActions = false,
}: CinematicVideoSectionProps) {
  const LabelIcon = labelIcon === "users" ? Users : Play;

  return (
    <section
      id={id}
      className={`mkt-video-hero mkt-video-hero--${align} mkt-video-hero--${size}`}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className="mkt-video-hero__media" aria-hidden>
        <LandingVideo
          src={clip.src}
          poster={clip.poster}
          className="mkt-video-hero__player"
          playWhenVisible
          kenBurns
        />
        <div className="mkt-video-hero__overlay" />
        <div className="mkt-video-hero__grain" />
      </div>

      <div className="mkt-container mkt-video-hero__content">
        <BlurReveal delay={0}>
          <p className="mkt-video-hero__label">
            <LabelIcon style={{ width: 12, height: 12 }} aria-hidden />
            {label}
          </p>
        </BlurReveal>

        <BlurReveal delay={80}>
          <h2 id={id ? `${id}-title` : undefined} className="mkt-video-hero__title">
            {title}
          </h2>
        </BlurReveal>

        <BlurReveal delay={160}>
          <p className="mkt-video-hero__desc">{description}</p>
        </BlurReveal>

        {showActions && ctaHref && (
          <BlurReveal delay={240}>
            <div className="mkt-video-hero__actions">
              <Link href={ctaHref} className="mkt-btn-primary mkt-video-hero__cta mkt-btn-animated">
                Start building free <ArrowRight style={{ width: 15, height: 15 }} />
              </Link>
              <a href="#demo" className="mkt-video-hero__cta-secondary mkt-btn-animated">
                Try the live demo <ArrowRight style={{ width: 14, height: 14 }} />
              </a>
            </div>
          </BlurReveal>
        )}

        {chips.length > 0 && (
          <div className="mkt-video-hero__chips">
            {chips.map((chip, i) => (
              <Reveal key={chip} delay={showActions ? 320 + i * 70 : 240 + i * 70} variant="up">
                <span className="mkt-video-hero__chip">{chip}</span>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <span className="mkt-video-hero__badge">{clip.label}</span>
    </section>
  );
}

const PRODUCT_CHIPS = ["Publish in minutes", "Logic built-in", "Live analytics"];
const TEAM_CHIPS = ["User research", "Customer onboarding", "Team feedback"];

export function VideoHeroSection({ clip, ctaHref }: { clip: LandingVideoClip; ctaHref: string }) {
  return (
    <CinematicVideoSection
      clip={clip}
      label="See it in action"
      title={
        <>
          Watch how teams ship
          <br />
          <span className="mkt-video-hero__title-accent">forms in minutes.</span>
        </>
      }
      description="From first question to published form — a calm, focused workflow your whole team can run."
      align="center"
      chips={PRODUCT_CHIPS}
      ctaHref={ctaHref}
      showActions
    />
  );
}

export function TeamVideoSection({ clip }: { clip: LandingVideoClip }) {
  return (
    <CinematicVideoSection
      id="teams"
      clip={clip}
      label="Teams at work"
      labelIcon="users"
      title={
        <>
          A calmer way to
          <br />
          <span className="mkt-video-hero__title-accent">collect answers.</span>
        </>
      }
      description="Whether you're running research, onboarding customers, or gathering feedback — EdinForm keeps the experience polished for respondents and effortless for your team."
      align="left"
      size="compact"
      chips={TEAM_CHIPS}
    />
  );
}
