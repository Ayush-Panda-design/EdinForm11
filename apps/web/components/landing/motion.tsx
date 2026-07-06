"use client";

import { useEffect, useState, useRef, Children, isValidElement } from "react";

export function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "fade" | "blur";

const VARIANT_HIDDEN: Record<RevealVariant, string> = {
  up: "translateY(32px)",
  down: "translateY(-32px)",
  left: "translateX(-28px)",
  right: "translateX(28px)",
  scale: "scale(0.94)",
  fade: "none",
  blur: "translateY(20px)",
};

export function Reveal({
  children,
  delay = 0,
  className = "",
  style = {},
  variant = "up",
  duration = 720,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  variant?: RevealVariant;
  duration?: number;
}) {
  const { ref, inView } = useInView();
  const isBlur = variant === "blur";

  return (
    <div
      ref={ref}
      className={`mkt-reveal${isBlur ? " mkt-reveal--blur" : ""} ${className}`.trim()}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : VARIANT_HIDDEN[variant],
        filter: isBlur ? (inView ? "blur(0)" : "blur(14px)") : undefined,
        transition: isBlur
          ? `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
          : `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Hero / above-the-fold — animates on mount, not scroll */
export function RevealOnMount({
  children,
  delay = 0,
  className = "",
  variant = "up",
  duration = 800,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variant?: RevealVariant;
  duration?: number;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`mkt-reveal ${className}`.trim()}
      style={{
        opacity: ready ? 1 : 0,
        transform: ready ? "none" : VARIANT_HIDDEN[variant],
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function Stagger({
  children,
  stagger = 80,
  className = "",
  variant = "up",
}: {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
  variant?: RevealVariant;
}) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) =>
        isValidElement(child) ? (
          <Reveal key={child.key ?? i} delay={i * stagger} variant={variant}>
            {child}
          </Reveal>
        ) : (
          child
        ),
      )}
    </div>
  );
}

export function LogoMarquee({ logos }: { logos: readonly string[] }) {
  const track = [...logos, ...logos];

  return (
    <div className="mkt-logo-marquee" aria-hidden>
      <div className="mkt-logo-marquee-track">
        {track.map((name, i) => (
          <span key={`${name}-${i}`} className="mkt-logo-cloud__item">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Counter({
  to,
  suffix = "",
  fixed,
}: {
  to: number;
  suffix?: string;
  fixed?: number;
}) {
  const { ref, inView } = useInView(0.5);
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(to / 70));
    const id = setInterval(() => {
      start += step;
      if (start >= to) {
        setVal(to);
        clearInterval(id);
      } else setVal(start);
    }, 14);
    return () => clearInterval(id);
  }, [inView, to]);

  return (
    <span ref={ref} className="mkt-counter">
      {fixed !== undefined ? to.toFixed(fixed) : val.toLocaleString()}
      {suffix}
    </span>
  );
}

/** Subtle vertical parallax tied to scroll position */
export function Parallax({
  children,
  className = "",
  speed = 0.12,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height * 0.5 - window.innerHeight * 0.5;
      setY(center * speed);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translate3d(0, ${y}px, 0)`,
        transition: "transform 0.1s linear",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

/** Blur + fade entrance optimized for video tiles */
export function BlurReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <Reveal variant="blur" delay={delay} duration={900} className={className}>
      {children}
    </Reveal>
  );
}
