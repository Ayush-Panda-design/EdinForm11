"use client";

import "./landing.css";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  ArrowRight, Menu, X, Check, Share2, GitBranch,
  BarChart3, Zap, Users, ChevronDown, Star, TrendingUp, Globe, Layers,
  CheckCircle2, Play, ArrowUpRight, Sun, Moon, Clock, Download, Sparkles,
} from "lucide-react";
import { isAuthenticated } from "~/lib/auth";
import { useTheme } from "~/providers/theme-provider";

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Reveal({ children, delay = 0, className = "", from }: {
  children: React.ReactNode; delay?: number; className?: string; from?: "left" | "right" | "scale";
}) {
  const { ref, inView } = useInView();
  const fromClass = from === "left" ? " lp-reveal-from-left" : from === "right" ? " lp-reveal-from-right" : from === "scale" ? " lp-reveal-scale" : "";
  return (
    <div ref={ref} className={`lp-reveal${inView ? " visible" : ""}${fromClass} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4); }

function SmoothCounter({ to, suffix = "", fixed }: { to: number; suffix?: string; fixed?: number }) {
  const { ref, inView } = useInView(0.5);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    let start: number | null = null;
    let raf = 0;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = easeOutQuart(p);
      setVal(fixed !== undefined ? parseFloat((to * eased).toFixed(fixed)) : Math.floor(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, fixed]);
  const display = fixed !== undefined ? val.toFixed(fixed) : val.toLocaleString();
  return <span ref={ref}>{display}{suffix}</span>;
}

function SectionGlow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function BorderBeam({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`lp-viz-frame ${className}`}>{children}</div>;
}

function MarqueeRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp-marquee" aria-hidden>
      <div className="lp-marquee-track">{children}{children}</div>
    </div>
  );
}

function StaggerItem({ index, children, className = "" }: { index: number; children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView(0.12);
  return (
    <div
      ref={ref}
      className={`lp-stagger-item${inView ? " visible" : ""} ${className}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {children}
    </div>
  );
}

function HeroAskHeadline() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [accentIdx, setAccentIdx] = useState(0);
  const accentWords = ["better", "smarter", "sharper", "fewer"];

  useEffect(() => {
    const id = setInterval(() => setAccentIdx((i) => (i + 1) % accentWords.length), 2600);
    return () => clearInterval(id);
  }, [accentWords.length]);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / r.width;
    const y = (e.clientY - r.top - r.height / 2) / r.height;
    setTilt({ x: x * 10, y: -y * 8 });
  }, []);

  const floatQs = [
    { text: "What's your role?", left: "4%", top: "14%", delay: 0, tone: "green" },
    { text: "Skip if N/A →", left: "86%", top: "18%", delay: 1.4, tone: "slate" },
    { text: "Rate 1–5 ★", left: "88%", top: "50%", delay: 2.6, tone: "gold" },
    { text: "Logic ON ✓", left: "3%", top: "54%", delay: 0.9, tone: "gold" },
    { text: "Branch → Yes", left: "84%", top: "70%", delay: 1.8, tone: "green" },
    { text: "Export CSV", left: "6%", top: "80%", delay: 3.1, tone: "slate" },
  ];

  return (
    <div
      ref={stageRef}
      className="lp-hero-headline-stage"
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ transform: `perspective(900px) rotateX(${tilt.y * 0.4}deg) rotateY(${tilt.x * 0.4}deg)` }}
    >
      {floatQs.map(({ text, left, top, delay, tone }, i) => (
        <span
          key={text}
          className={`lp-hero-float-q lp-chip-${tone}`}
          style={{ left, top, animationDelay: `${delay}s`, animationDuration: `${6 + i * 0.5}s` }}
        >
          {text}
        </span>
      ))}

      <h1 className="lp-h1 lp-hero-h1-crazy">
        <span className="lp-h1-word" style={{ animationDelay: "0ms" }}>Ask</span>{" "}
        <span className="lp-h1-word lp-hero-accent-wrap" style={{ animationDelay: "140ms" }}>
          <span key={accentWords[accentIdx]} className="lp-hero-accent-word">{accentWords[accentIdx]}</span>
        </span>{" "}
        <span className="lp-h1-word" style={{ animationDelay: "280ms" }}>questions</span>
        <span className="lp-h1-word lp-hero-qmark" style={{ animationDelay: "420ms" }}>.</span>
      </h1>

      <p className="lp-hero-headline-tagline">
        <span className="lp-hero-tagline-shimmer">Forms that listen</span>
        <span className="lp-hero-tagline-dot" aria-hidden>·</span>
        <span className="lp-hero-tagline-shimmer" style={{ animationDelay: "0.4s" }}>Logic that adapts</span>
        <span className="lp-hero-tagline-dot" aria-hidden>·</span>
        <span className="lp-hero-tagline-shimmer" style={{ animationDelay: "0.8s" }}>Data that matters</span>
      </p>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
          return (
    <button type="button" className="lp-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

const SOCIAL_PROOF = [
  { initials: "IM", name: "Isla M.", action: "published a UX survey" },
  { initials: "MK", name: "Marcus K.", action: "hit 91% completion" },
  { initials: "PR", name: "Priya R.", action: "exported 2,400 responses" },
  { initials: "TH", name: "Tom H.", action: "added branching logic" },
  { initials: "SL", name: "Sara L.", action: "shared a form embed" },
];

function SocialProofTicker() {
  const cards = [...SOCIAL_PROOF, ...SOCIAL_PROOF];
  return (
    <div className="lp-social-ticker" aria-hidden>
      <div className="lp-social-ticker-track">
        {cards.map(({ initials, name, action }, i) => (
          <div key={i} className="lp-social-card">
            <div className="lp-social-avatar">{initials}</div>
            <span><strong>{name}</strong> {action}</span>
          </div>
        ))}
          </div>
        </div>
  );
}

function EdinburghSkylineHero() {
  const [hovered, setHovered] = useState<string | null>(null);
  const tooltips: Record<string, string> = {
    hill: "Analytics overview", castle: "Rock-solid reliability",
    scott: "Multi-step forms", calton: "Team collaboration",
  };
  return (
    <div className="lp-skyline-wrap">
      <div className="lp-skyline-bg">
        <Image src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4" alt="" fill priority sizes="1200px" />
      </div>
      <svg viewBox="0 0 960 220" className="w-full block lp-skyline-svg" xmlns="http://www.w3.org/2000/svg">
        <rect width="960" height="220" fill="var(--sky-fill)" />
        <ellipse cx="120" cy="42" rx="70" ry="22" fill="var(--cloud)" />
        <ellipse cx="480" cy="32" rx="90" ry="26" fill="var(--cloud)" />
        <ellipse cx="780" cy="48" rx="65" ry="20" fill="var(--cloud)" />
        <g onMouseEnter={() => setHovered("hill")} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
          <path d="M0 175 Q60 120 120 135 Q170 95 220 115 Q250 100 280 125 L280 220 L0 220 Z" fill="var(--green)" className="lp-skyline-fill lp-skyline-fill-1" opacity={hovered === "hill" ? 1 : 0.92} />
          <path d="M0 175 Q60 120 120 135 Q170 95 220 115 Q250 100 280 125" fill="none" stroke="var(--green)" strokeWidth="2" className="lp-skyline-draw lp-skyline-draw-1" />
        </g>
        <g onMouseEnter={() => setHovered("castle")} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
          <path d="M340 175 L340 145 L355 145 L355 130 L365 130 L365 118 L375 118 L375 108 L385 100 L395 108 L395 118 L405 118 L405 130 L415 130 L415 145 L430 145 L430 175 Z" fill="var(--text)" className="lp-skyline-fill lp-skyline-fill-2" />
          <path d="M330 175 L330 150 Q380 125 430 150 L430 175 Z" fill="var(--muted)" className="lp-skyline-fill lp-skyline-fill-2" opacity="0.5" />
          <path d="M340 175 L340 145 L355 145 L355 130 L365 130 L365 118 L375 118 L375 108 L385 100 L395 108 L395 118 L405 118 L405 130 L415 130 L415 145 L430 145 L430 175" fill="none" stroke="var(--text)" strokeWidth="2" className="lp-skyline-draw lp-skyline-draw-2" />
        </g>
        <g onMouseEnter={() => setHovered("scott")} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
          <path d="M548 175 L548 155 L552 148 L552 120 L554 100 L556 75 L558 55 L560 40 L562 55 L564 75 L566 100 L568 120 L568 148 L572 155 L572 175 Z" fill="var(--text)" className="lp-skyline-fill lp-skyline-fill-3" />
          <path d="M548 175 L548 155 L552 148 L552 120 L554 100 L556 75 L558 55 L560 40 L562 55 L564 75 L566 100 L568 120 L568 148 L572 155 L572 175" fill="none" stroke="var(--text)" strokeWidth="1.5" className="lp-skyline-draw lp-skyline-draw-3" />
        </g>
        <g onMouseEnter={() => setHovered("calton")} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
          <path d="M680 175 Q720 140 760 150 Q800 125 840 140 Q880 130 920 155 L920 220 L680 220 Z" fill="var(--green)" className="lp-skyline-fill lp-skyline-fill-4" opacity={0.85} />
          <ellipse cx="820" cy="138" rx="18" ry="12" fill="var(--text)" className="lp-skyline-fill lp-skyline-fill-4" />
          <rect x="812" y="138" width="16" height="18" fill="var(--text)" className="lp-skyline-fill lp-skyline-fill-4" />
          <path d="M680 175 Q720 140 760 150 Q800 125 840 140 Q880 130 920 155" fill="none" stroke="var(--green)" strokeWidth="2" className="lp-skyline-draw lp-skyline-draw-4" />
        </g>
        <path d="M0 195 Q120 185 240 192 Q360 178 480 190 Q600 182 720 188 Q840 180 960 194 L960 220 L0 220 Z" fill="var(--green)" opacity="0.35" />
        <path d="M0 205 Q160 198 320 204 Q480 196 640 202 Q800 195 960 208 L960 220 L0 220 Z" fill="var(--green)" opacity="0.25" />
        <line x1="0" y1="175" x2="960" y2="175" stroke="var(--border)" strokeWidth="1" />
      </svg>
      {hovered && tooltips[hovered] && <div className="lp-skyline-tooltip">{tooltips[hovered]}</div>}
      <p className="lp-skyline-hint">Hover each landmark to explore EdinForm features</p>
    </div>
  );
}

function ThistleIllustration() {
  const { ref, inView } = useInView(0.2);
  return (
    <div ref={ref} className="lp-thistle" aria-hidden>
      <svg viewBox="0 0 120 200" width="150" height="200" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 190 L60 120" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" />
        <path d="M60 150 Q30 140 25 110 Q35 125 60 130" fill="var(--green)" opacity="0.8" />
        <path d="M60 150 Q90 140 95 110 Q85 125 60 130" fill="var(--green)" opacity="0.8" />
        <path d="M60 165 Q20 155 15 125 Q30 140 60 145" fill="var(--green)" opacity="0.7" />
        <path d="M60 165 Q100 155 105 125 Q90 140 60 145" fill="var(--green)" opacity="0.7" />
        <ellipse cx="60" cy="75" rx="22" ry="28" fill="var(--yellow)" className={inView ? "lp-thistle-petal lp-thistle-petal-1" : ""} />
        <path d="M60 50 L45 85 L60 75 L75 85 Z" fill="var(--yellow)" className={inView ? "lp-thistle-petal lp-thistle-petal-2" : ""} />
        <path d="M38 70 L60 75 L42 95 Z" fill="var(--green)" className={inView ? "lp-thistle-petal lp-thistle-petal-3" : ""} />
        <path d="M82 70 L60 75 L78 95 Z" fill="var(--green)" className={inView ? "lp-thistle-petal lp-thistle-petal-3" : ""} />
      </svg>
    </div>
  );
}

function TartanPattern() {
  return (
    <svg className="lp-tartan-bg lp-tartan-drift w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
        <pattern id="tartan" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="var(--surface)" />
          <path d="M0 20 H40 M20 0 V40" stroke="var(--border)" strokeWidth="0.5" />
          <path d="M0 10 H40 M0 30 H40 M10 0 V40 M30 0 V40" stroke="var(--border)" strokeWidth="0.35" opacity="0.6" />
        </pattern>
        </defs>
      <rect width="100%" height="100%" fill="url(#tartan)" />
    </svg>
  );
}

function HogmanayCtaIllustration() {
  const silhouettes = Array.from({ length: 14 }, (_, i) => ({ x: 30 + i * 44, h: 28 + (i % 3) * 8 }));
          return (
    <svg viewBox="0 0 640 100" className="w-full block" xmlns="http://www.w3.org/2000/svg">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <polygon
          key={i}
          points={`${80 + i * 100},18 ${85 + i * 100},12 ${90 + i * 100},18`}
          fill="var(--yellow)"
          opacity="0.85"
          className="lp-cta-firework"
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
      {silhouettes.map(({ x, h }, i) => (
        <g key={i} className="lp-cta-crowd" style={{ animationDelay: `${i * 0.1}s` }}>
          <circle cx={x + 8} cy={72 - h} r="7" fill="var(--text)" />
          <path d={`M${x} 72 L${x + 4} ${82 - h} L${x + 8} 72 L${x + 12} ${82 - h} L${x + 16} 72 Z`} fill="var(--text)" />
        </g>
      ))}
      <line x1="0" y1="82" x2="640" y2="82" stroke="var(--border)" strokeWidth="1" />
    </svg>
  );
}

const LIFECYCLE_STEPS = [
  { icon: Layers, label: "Create", desc: "Draft fields & layout" },
  { icon: GitBranch, label: "Add Logic", desc: "Branch by answer" },
  { icon: Share2, label: "Publish", desc: "Link, embed, QR" },
  { icon: Users, label: "Collect", desc: "Live responses" },
  { icon: BarChart3, label: "Analyse", desc: "Charts & export" },
];

function FormLifecycleStepper() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((s) => (s + 1) % 5), 2000);
    return () => clearInterval(id);
  }, []);
          return (
    <div>
      <div className="flex flex-col gap-3">
        {LIFECYCLE_STEPS.map(({ icon: Icon, label, desc }, i) => (
          <div key={label} className={`lp-lifecycle-step${active === i ? " active" : ""}`}>
            <Icon className="w-5 h-5 flex-shrink-0" style={{ color: "var(--green)" }} />
            <div>
              <div className="font-semibold text-sm">{label}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{desc}</div>
            </div>
            <span className="lp-lifecycle-step-num ml-auto">0{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="lp-trusted-strip">
        <div className="lp-label">Trusted by</div>
        <div className="lp-trusted-pills">
          {["DEPT®", "Mono", "Forma", "Layers", "Craft", "Arc"].map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full border text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BranchingVisualiser() {
  const [branch, setBranch] = useState<"yes" | "no" | null>(null);
  const [hover, setHover] = useState<"yes" | "no" | null>(null);
  const [traceStep, setTraceStep] = useState(0);
  const [userTouched, setUserTouched] = useState(false);
  const [pulseT, setPulseT] = useState(0);

  const pathEdges: Record<"yes" | "no", string[]> = {
    yes: ["root-yes-node", "yes-node-q2a", "q2a-end-a"],
    no: ["root-no-node", "no-node-q2b", "q2b-end-b"],
  };
  const nodeOrder: Record<"yes" | "no", string[]> = {
    yes: ["root", "yes-node", "q2a", "end-a"],
    no: ["root", "no-node", "q2b", "end-b"],
  };

  const preview = branch ?? hover;

  useEffect(() => {
    if (userTouched) return;
    const id = setInterval(() => setBranch((b) => (b === "yes" ? "no" : b === "no" ? null : "yes")), 2800);
    return () => clearInterval(id);
  }, [userTouched]);

  useEffect(() => {
    if (!branch) {
      setTraceStep(0);
      return;
    }
    setTraceStep(0);
    let step = 0;
    const id = window.setInterval(() => {
      step += 1;
      setTraceStep(step);
      if (step >= 4) window.clearInterval(id);
    }, 320);
    return () => window.clearInterval(id);
  }, [branch]);

  useEffect(() => {
    if (!branch) return;
    let raf = 0;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      setPulseT(((ts - start) % 2200) / 2200);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [branch]);

  const selectBranch = (b: "yes" | "no") => {
    setUserTouched(true);
    setBranch((prev) => (prev === b ? null : b));
  };

  const nodeLit = (id: string) => {
    if (!preview) return id === "root";
    const order = nodeOrder[preview];
    if (!order.includes(id)) return false;
    if (!branch) return true;
    const idx = order.indexOf(id);
    return idx <= traceStep;
  };

  const edgeLit = (edgeId: string) => {
    if (!preview) return false;
    const edges = pathEdges[preview];
    if (!edges.includes(edgeId)) return false;
    if (!branch) return true;
    const idx = edges.indexOf(edgeId);
    return idx < traceStep;
  };

  const edgeColor = (edgeId: string) => {
    if (preview === "no" || edgeId.includes("no")) return "var(--red)";
    if (preview === "yes" || edgeId.includes("yes") || edgeId.includes("q2a") || edgeId.includes("end-a")) return "var(--green)";
    return "var(--border)";
  };

  const nodes = [
    { id: "root", x: 350, y: 16, w: 200, h: 36, label: "Do you collect feedback regularly?", type: "q" as const },
    { id: "yes-node", x: 80, y: 96, w: 200, h: 28, label: "Yes →", type: "yes" as const },
    { id: "no-node", x: 620, y: 96, w: 200, h: 28, label: "No →", type: "no" as const },
    { id: "q2a", x: 40, y: 168, w: 200, h: 36, label: "What's your biggest bottleneck?", type: "q" as const },
    { id: "q2b", x: 580, y: 168, w: 200, h: 36, label: "What's stopping you?", type: "q" as const },
    { id: "end-a", x: 80, y: 260, w: 200, h: 28, label: "✓ Thank you", type: "end" as const },
    { id: "end-b", x: 620, y: 260, w: 200, h: 28, label: "✓ Thank you", type: "end" as const },
  ];

  const edges = [
    { id: "root-yes-node", from: "root", to: "yes-node", x1: 450, y1: 52, x2: 180, y2: 96 },
    { id: "root-no-node", from: "root", to: "no-node", x1: 450, y1: 52, x2: 720, y2: 96 },
    { id: "yes-node-q2a", from: "yes-node", to: "q2a", x1: 180, y1: 124, x2: 140, y2: 168 },
    { id: "no-node-q2b", from: "no-node", to: "q2b", x1: 720, y1: 124, x2: 680, y2: 168 },
    { id: "q2a-end-a", from: "q2a", to: "end-a", x1: 140, y1: 204, x2: 180, y2: 260 },
    { id: "q2b-end-b", from: "q2b", to: "end-b", x1: 680, y1: 204, x2: 720, y2: 260 },
  ];

  const activeEdgeList = branch ? pathEdges[branch] : [];
  const pulseSeg = activeEdgeList.length > 0
    ? Math.min(Math.floor(pulseT * activeEdgeList.length), activeEdgeList.length - 1)
    : 0;
  const pulseSegT = activeEdgeList.length > 0 ? (pulseT * activeEdgeList.length) % 1 : 0;
  const pulseEdge = branch && activeEdgeList[pulseSeg]
    ? edges.find((e) => e.id === activeEdgeList[pulseSeg])
    : null;
  const pulsePos = pulseEdge && traceStep >= 4
    ? {
        x: pulseEdge.x1 + (pulseEdge.x2 - pulseEdge.x1) * pulseSegT,
        y: pulseEdge.y1 + (pulseEdge.y2 - pulseEdge.y1) * pulseSegT,
      }
    : branch && traceStep < 4
      ? (() => {
          const tracing = activeEdgeList[traceStep - 1];
          const pe = tracing ? edges.find((e) => e.id === tracing) : null;
          return pe
            ? { x: pe.x1 + (pe.x2 - pe.x1) * pulseT, y: pe.y1 + (pe.y2 - pe.y1) * pulseT }
            : null;
        })()
      : null;

  const chips = [
    { id: "chip-yes", x: 310, y: 72, text: "if answer = yes", show: preview === "yes" },
    { id: "chip-no", x: 560, y: 72, text: "if answer = no", show: preview === "no" },
    { id: "chip-q2a", x: 80, y: 142, text: "show Q2a", show: preview === "yes" },
    { id: "chip-q2b", x: 660, y: 142, text: "show Q2b", show: preview === "no" },
  ];

  return (
    <div className="lp-branch-viz">
      <svg viewBox="0 0 900 340" className="w-full block lp-branch-svg" role="img" aria-label="Conditional logic branching diagram">
        <defs>
          <filter id="lp-branch-glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="lp-branch-glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {edges.map(({ id, x1, y1, x2, y2 }) => {
          const on = edgeLit(id);
          const len = Math.hypot(x2 - x1, y2 - y1);
          const color = on ? edgeColor(id) : "var(--border)";
          const dimmed = preview && !on;
          return (
            <line
              key={id}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={color}
              strokeWidth={on ? 2.5 : 1}
              strokeLinecap="round"
              className={`lp-branch-path${on ? " lp-branch-path-on" : ""}${dimmed ? " lp-branch-path-dim" : ""}`}
              strokeDasharray={len}
              strokeDashoffset={on ? 0 : len}
              style={{ "--path-len": len } as React.CSSProperties}
            />
          );
        })}

        {chips.filter((c) => c.show).map(({ id, x, y, text }) => (
          <g key={id} className="lp-branch-chip">
            <rect x={x} y={y} width={text.length * 6.2 + 18} height={18} rx={9} fill="var(--yellow)" opacity={branch ? 1 : 0.75} />
            <text x={x + (text.length * 6.2 + 18) / 2} y={y + 12} textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--text)">{text}</text>
          </g>
        ))}

        {pulsePos && branch && (
          <circle cx={pulsePos.x} cy={pulsePos.y} r="5" className={`lp-branch-pulse lp-branch-pulse-${branch}`} />
        )}

        {nodes.map(({ id, x, y, w, h, label, type }) => {
          const on = nodeLit(id);
          const isBtn = type === "yes" || type === "no";
          const inactive = preview && !on && id !== "root";
          const activeClass = on && branch ? (type === "no" || id === "q2b" || id === "end-b" ? "lp-branch-node-no" : "lp-branch-node-yes") : "";
          const hoverClass = hover === type ? " lp-branch-node-hover" : "";

          return (
            <g
              key={id}
              className={`lp-branch-node${isBtn ? " lp-branch-node-btn" : ""}${on ? " lp-branch-node-on" : ""}${inactive ? " lp-branch-node-off" : ""}${activeClass ? ` ${activeClass}` : ""}${hoverClass}`}
              onClick={() => isBtn && selectBranch(type)}
              onMouseEnter={() => isBtn && setHover(type)}
              onMouseLeave={() => isBtn && setHover(null)}
              onKeyDown={(e) => isBtn && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), selectBranch(type))}
              tabIndex={isBtn ? 0 : undefined}
              role={isBtn ? "button" : undefined}
              aria-pressed={isBtn ? branch === type : undefined}
              aria-label={isBtn ? `Trace ${type} branch` : undefined}
              style={{ cursor: isBtn ? "pointer" : "default" }}
            >
              <rect
                x={x} y={y} width={w} height={h}
                rx={type === "q" ? 8 : 14}
                className="lp-branch-node-rect"
              />
              <text
                x={x + w / 2}
                y={y + (type === "q" ? 22 : 18)}
                textAnchor="middle"
                className="lp-branch-node-label"
              >
                {label.length > 34 ? `${label.slice(0, 34)}…` : label}
              </text>
              {isBtn && on && branch === type && (
                <circle cx={x + w - 14} cy={y + h / 2} r="3" className="lp-branch-node-dot" />
              )}
            </g>
          );
        })}
      </svg>

      <div className="lp-branch-controls">
        <button
          type="button"
          className={`lp-branch-btn lp-branch-btn-yes${branch === "yes" ? " active" : ""}${hover === "yes" && !branch ? " hover" : ""}`}
          onClick={() => selectBranch("yes")}
          onMouseEnter={() => setHover("yes")}
          onMouseLeave={() => setHover(null)}
          aria-pressed={branch === "yes"}
        >
          <span className="lp-branch-btn-icon">✓</span> Yes path
        </button>
        <button
          type="button"
          className={`lp-branch-btn lp-branch-btn-no${branch === "no" ? " active" : ""}${hover === "no" && !branch ? " hover" : ""}`}
          onClick={() => selectBranch("no")}
          onMouseEnter={() => setHover("no")}
          onMouseLeave={() => setHover(null)}
          aria-pressed={branch === "no"}
        >
          <span className="lp-branch-btn-icon">→</span> No path
        </button>
        {branch && (
          <button type="button" className="lp-branch-btn-reset" onClick={() => { setBranch(null); setTraceStep(0); }}>
            Reset
          </button>
        )}
      </div>

      <p className="lp-branch-status" aria-live="polite">
        {!branch && !userTouched && <span className="lp-branch-status-hint">Auto-demoing — click to take over</span>}
        {!branch && userTouched && <span>Click <strong>Yes</strong> or <strong>No</strong> to trace a logic path</span>}
        {branch === "yes" && traceStep < 4 && <span className="lp-branch-status-yes">Tracing Yes branch…</span>}
        {branch === "yes" && traceStep >= 4 && <span className="lp-branch-status-yes">Yes → personalised follow-up → thank you</span>}
        {branch === "no" && traceStep < 4 && <span className="lp-branch-status-no">Tracing No branch…</span>}
        {branch === "no" && traceStep >= 4 && <span className="lp-branch-status-no">No → alternative question → thank you</span>}
      </p>
    </div>
  );
}

function BeforeAfterToggle() {
  const [after, setAfter] = useState(false);
  return (
    <div className="mt-5">
      <button type="button" className="lp-toggle-pill" onClick={() => setAfter((v) => !v)} aria-pressed={after}>
        <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>See the difference</span>
        <div className={`lp-toggle-knob${after ? " on" : ""}`} />
        <span className="text-xs font-medium" style={{ color: "var(--text)" }}>{after ? "Logic ON" : "Logic OFF"}</span>
      </button>
      <div className="lp-before-after">
        <div className={`lp-ba-panel${after ? " hidden" : ""}`}>
          <div className="lp-label mb-2">Without logic</div>
          <ul className="text-sm space-y-1 mb-2" style={{ color: "var(--muted)" }}>
            {["Company size?", "Industry?", "Budget range?", "Timeline?", "Decision maker?", "Current tools?", "Team size?", "How did you hear about us?"].map((q) => (
              <li key={q}>· {q}</li>
            ))}
          </ul>
          <p className="text-xs" style={{ color: "var(--muted)" }}>8 questions · no branching · 58% completion</p>
        </div>
        <div className={`lp-ba-panel${!after ? " hidden" : ""}`}>
          <div className="lp-label mb-2">With EdinForm logic</div>
          <ul className="text-sm space-y-1 mb-2" style={{ color: "var(--text)" }}>
            <li>· Do you collect feedback regularly?</li>
            <li className="pl-3" style={{ color: "var(--green)" }}>↳ Yes → What&apos;s your biggest bottleneck?</li>
            <li className="pl-3" style={{ color: "var(--green)" }}>↳ No → What&apos;s stopping you?</li>
          </ul>
          <p className="text-xs" style={{ color: "var(--muted)" }}>3 relevant questions · branching · 91% completion</p>
        </div>
      </div>
      <p className="text-center text-xs italic mt-3 px-2" style={{ color: "var(--muted)" }}>
        TRY IT: Toggle above to see what your respondents experience with and without conditional logic applied.
      </p>
    </div>
  );
}

function CompletionRateInline() {
  const { ref, inView } = useInView(0.3);
  const spark = [40, 52, 48, 58, 62, 72, 78, 85, 91];
  return (
    <div ref={ref} className="lp-stat-inline mt-6">
      <div className="lp-label mb-2">Completion rate lift</div>
      <div className="flex items-end gap-3">
        <div className="lp-completion-num">+{inView ? <SmoothCounter to={34} suffix="%" /> : "0%"}</div>
        <div className="flex items-end gap-0.5 h-10 flex-1">
          {spark.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm lp-spark-bar"
              style={{
                height: inView ? `${h}%` : "0%",
                background: "var(--green)",
                opacity: 0.4 + i * 0.06,
                transitionDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RealNumbersInline() {
  const { ref, inView } = useInView(0.2);
  return (
    <div ref={ref} className="lp-stat-inline mt-6">
      <div className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>What our data shows</div>
      {[
        { label: "Forms without logic", pct: 58, fill: "var(--border)" },
        { label: "Forms with EdinForm", pct: 91, fill: "var(--green)" },
      ].map(({ label, pct, fill }) => (
        <div key={label} className="mb-3">
          <div className="flex justify-between text-[13px] mb-1" style={{ color: "var(--muted)" }}>
            <span>{label}</span>
            <span className="font-semibold" style={{ color: "var(--text)" }}>{pct}% completion</span>
          </div>
          <div className="lp-stat-bar-track">
            <div className="lp-stat-bar-fill" style={{ width: inView ? `${pct}%` : "0%", background: fill }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function HowLogicWorksSteps() {
  const { ref, inView } = useInView(0.15);
  const steps = [
    { n: "1", title: "Set a rule", desc: "If answer = X, show question Y" },
    { n: "2", title: "Form adapts", desc: "Respondent never sees irrelevant fields" },
    { n: "3", title: "Data stays clean", desc: "No blank answers, no noise in your export" },
  ];
  return (
    <div ref={ref} className={`lp-logic-steps mt-5${inView ? " visible" : ""}`}>
      {steps.map(({ n, title, desc }, i) => (
        <div key={n} className="lp-logic-step-row" style={{ transitionDelay: `${i * 120}ms` }}>
          <div className="lp-logic-step-num">{n}</div>
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>→ {desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LogicQuotePullout() {
  const { ref, inView } = useInView(0.2);
  return (
    <div ref={ref}>
      <blockquote className={`lp-quote-pullout${inView ? " visible" : ""}`}>
      <p className="text-[15px] italic leading-relaxed mb-2" style={{ color: "var(--text)" }}>
        &ldquo;We removed 4 questions using logic. Completion rate jumped from 61% to 89% in one week.&rdquo;
      </p>
      <footer className="text-xs" style={{ color: "var(--muted)" }}>— Marcus K., Product Designer, Mono</footer>
    </blockquote>
    </div>
  );
}

function AnalyticsLeftExtras() {
  const features = [
    { icon: BarChart3, title: "Response volume over time", desc: "Daily and weekly trends, filterable by date range", tone: "green" },
    { icon: Clock, title: "Time-per-question heatmap", desc: "See which questions slow respondents down", tone: "gold" },
    { icon: GitBranch, title: "Drop-off point detection", desc: "Pinpoint exactly where people abandon", tone: "slate" },
    { icon: Download, title: "One-click CSV / JSON export", desc: "Your data, your format, no lock-in", tone: "warm" },
  ];
  const integrations = ["Zapier", "Make", "Slack", "Notion", "Airtable", "REST API"];
  return (
    <div className="flex flex-col gap-6 mt-8">
        <div>
        <div className="lp-label mb-4">What you get</div>
        <div className="flex flex-col gap-3">
          {features.map(({ icon: Icon, title, desc, tone }, i) => (
            <StaggerItem key={title} index={i} className="lp-feature-row">
              <div className={`lp-feature-row-icon lp-feature-row-icon-${tone}`}>
                <Icon className="w-4 h-4" />
          </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</div>
                <div className="text-[13px]" style={{ color: "var(--muted)" }}>{desc}</div>
          </div>
            </StaggerItem>
          ))}
        </div>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>Connects with</div>
        <div className="flex flex-wrap gap-1.5">
          {integrations.map((name, i) => (
            <span key={name} className="lp-pill-wave px-3 py-1 rounded-full border text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)", animationDelay: `${i * 0.08}s` }}>{name}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px]" style={{ color: "var(--muted)" }}>
        <span className="lp-gdpr-badge"><span className="lp-gdpr-icon">🔒</span> GDPR Compliant</span>
        <span aria-hidden>·</span>
        <span className="lp-gdpr-badge"><span className="lp-gdpr-icon">🇪🇺</span> EU Data Storage</span>
        <span aria-hidden>·</span>
        <span className="lp-gdpr-badge"><span className="lp-gdpr-icon">🔐</span> Encrypted at rest</span>
      </div>
    </div>
  );
}

function CastleMark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden role="img">
      <title>EdinForm</title>
      <path d="M8 20 L8 14 L10 14 L10 11 L12 11 L12 8 L14 6 L16 8 L16 11 L18 11 L18 14 L20 14 L20 20 Z" fill="var(--text)" />
      <path d="M6 20 L6 16 Q14 12 22 16 L22 20 Z" fill="var(--green)" opacity="0.7" />
        </svg>
  );
}

function ResponseWave() {
  const [hBar, setHBar] = useState<number | null>(null);
  const { ref, inView } = useInView(0.3);
  const bars = [38, 55, 48, 72, 65, 88];
  const dates = ["May 20", "May 27", "Jun 3", "Jun 10", "Jun 17", "Jun 20"];
  return (
    <BorderBeam>
      <div ref={ref} className="lp-viz-panel p-7">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="lp-label mb-1.5">Responses · 30 days</div>
          <div className="text-[2.4rem] font-bold leading-none" style={{ color: "var(--text)" }}>
            {inView ? <SmoothCounter to={2847} /> : "0"}
          </div>
          <div className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--green)" }}>
            <TrendingUp className="w-3 h-3" /> +18.4% this month
          </div>
        </div>
        <div className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: "var(--green)", color: "var(--cta-text)" }}>● Live</div>
      </div>
      <div className="flex items-end gap-2 h-[90px] relative">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 h-full flex flex-col items-center justify-end relative"
            onMouseEnter={() => setHBar(i)} onMouseLeave={() => setHBar(null)}>
            <div className="w-full rounded-t-sm transition-all duration-300"
              style={{ height: inView ? `${Math.max(8, h)}%` : "0%", background: "var(--text)", opacity: hBar === i ? 0.85 : 0.7, transitionDelay: `${i * 35}ms` }} />
            {hBar === i && (
              <div className="absolute bottom-[108%] text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                style={{ background: "var(--green)", color: "var(--cta-text)" }}>{h}</div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px]" style={{ color: "var(--muted)" }}>
        {dates.map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="flex justify-between mt-5 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
        {[["Completion", "91%"], ["Avg. time", "2m 3s"], ["Drop-off", "9%"]].map(([k, v]) => (
          <div key={k} className="text-center">
            <div className="text-lg font-semibold" style={{ color: "var(--text)" }}>{v}</div>
            <div className="lp-label mt-0.5">{k}</div>
          </div>
        ))}
      </div>
    </div>
    </BorderBeam>
  );
}

function DropOffFunnel() {
  const { ref, inView } = useInView(0.3);
  const steps = [
    { q: "Q1", pct: 100 }, { q: "Q2", pct: 92 }, { q: "Q3", pct: 78 },
    { q: "Q4", pct: 54 }, { q: "Q5", pct: 48 },
  ];
  return (
    <div ref={ref} className={`lp-viz-frame lp-dropoff-wrap${inView ? " visible" : ""}`}>
      <div className="lp-viz-panel lp-dropoff-funnel">
      <div className="lp-label mb-4">Drop-off funnel</div>
      {steps.map(({ q, pct }, i) => (
        <div key={q} className="lp-funnel-row" style={{ animationDelay: `${i * 100}ms` }}>
          <span className="font-mono text-xs w-6" style={{ color: "var(--muted)" }}>{q}</span>
          <div className="lp-funnel-bar-wrap">
            <div className="lp-funnel-bar" style={{ width: inView ? `${pct}%` : "0%" }} />
          </div>
          <span className="text-xs font-semibold w-10 text-right" style={{ color: "var(--text)" }}>{pct}%</span>
        </div>
      ))}
      <p className="lp-funnel-annotation">↓ 24% drop between Q3 and Q4 — fix with skip logic</p>
      </div>
    </div>
  );
}

function HeroFormCard() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const steps = [
    { type: "choice", question: "What best describes your team?", sub: "We'll tailor EdinForm to your workflow.", options: ["Product & Design", "Research & UX", "Marketing", "Operations"] },
    { type: "rating", question: "How satisfied are you with your current form tool?", sub: "1 = very unhappy, 5 = completely satisfied" },
    { type: "text", question: "What's one thing your current tool gets wrong?", sub: "Be honest — this helps us build better." },
  ];
  const current = steps[step]!;
  const canContinue =
    (current.type === "choice" && selected !== null) ||
    (current.type === "rating" && rating !== null) ||
    (current.type === "text" && typed.trim().length > 0);

  function handleNext() {
    if (step < steps.length - 1) { setStep((s) => s + 1); setSelected(null); setRating(null); setTyped(""); }
    else setSubmitted(true);
  }

  return (
    <div className="lp-card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
        <span className="font-mono text-[11px]" style={{ color: "var(--muted)" }}>edinform.io · live preview</span>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div key={i} className="h-1.5 rounded-full transition-all"
              style={{ width: i === step ? 16 : 6, background: i <= step ? "var(--cta)" : "var(--border)" }} />
          ))}
        </div>
      </div>
      <div className="h-0.5" style={{ background: "var(--border)" }}>
        <div className="h-full transition-all duration-500" style={{ width: submitted ? "100%" : `${(step / steps.length) * 100}%`, background: "var(--cta)" }} />
      </div>
      <div className="p-8">
        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--green)" }} />
            <h3 className="text-xl font-semibold mb-2">Thanks for trying it out!</h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>That was a live EdinForm — clean, fast, distraction-free.</p>
            <button type="button" onClick={() => { setStep(0); setSubmitted(false); setSelected(null); setRating(null); setTyped(""); }}
              className="text-sm px-5 py-2 rounded-full border cursor-pointer" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Try again ↩</button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="lp-label mb-2">Question {step + 1} of {steps.length}</div>
              <h3 className="text-lg font-semibold mb-1">{current.question}</h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{current.sub}</p>
            </div>
            {current.type === "choice" && (
              <div className="flex flex-col gap-2 mb-6">
                {current.options!.map((opt) => (
                  <button key={opt} type="button" onClick={() => setSelected(opt)}
                    className="text-left px-3.5 py-2.5 rounded-xl border text-sm flex justify-between items-center transition-all cursor-pointer"
                    style={{
                      borderColor: selected === opt ? "var(--cta)" : "var(--border)",
                      background: selected === opt ? "var(--cta)" : "var(--surface)",
                      color: selected === opt ? "var(--cta-text)" : "var(--text)",
                      fontWeight: selected === opt ? 600 : 400,
                    }}>
                    {opt}{selected === opt && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
            {current.type === "rating" && (
              <div className="mb-7">
                <div className="flex gap-2 justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)}
                      className="w-12 h-12 rounded-xl border text-base font-semibold cursor-pointer transition-all"
                      style={{
                        borderColor: rating !== null && n <= rating ? "var(--cta)" : "var(--border)",
                        background: rating !== null && n <= rating ? "var(--cta)" : "var(--surface)",
                        color: rating !== null && n <= rating ? "var(--cta-text)" : "var(--muted)",
                      }}>{n}</button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] px-1" style={{ color: "var(--muted)" }}>
                  <span>Very unhappy</span><span>Completely satisfied</span>
                </div>
              </div>
            )}
            {current.type === "text" && (
              <textarea value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Write your answer here…" rows={3}
                className="w-full rounded-xl px-3.5 py-3 border text-sm resize-none mb-6 outline-none"
                style={{ borderColor: typed ? "var(--cta)" : "var(--border)", color: "var(--text)", background: "var(--surface)" }} />
            )}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px]" style={{ color: "var(--muted)" }}>{step + 1} / {steps.length}</span>
              <button type="button" onClick={handleNext} disabled={!canContinue}
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-default"
                style={{ background: canContinue ? "var(--cta)" : "var(--border)", color: canContinue ? "var(--cta-text)" : "var(--muted)" }}>
                {step === steps.length - 1 ? "Submit" : "Continue"}<ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const ROLE_CHART = [
  { label: "PM", pct: 32 }, { label: "Designer", pct: 28 },
  { label: "Dev", pct: 22 }, { label: "Researcher", pct: 10 }, { label: "Other", pct: 8 },
];

function LiveDemoForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const questions = [
    { id: "role", type: "choice", tag: "About you", question: "What's your primary role?", sub: "This helps us show you the most relevant features.", options: ["Product Manager", "Designer", "Developer", "Researcher", "Marketer", "Founder / CEO"] },
    { id: "tool", type: "choice", tag: "Current setup", question: "Which form tool are you currently using?", sub: "Don't worry — we'll convince you to switch.", options: ["Google Forms", "Tally", "Jotform", "Airtable Forms", "None yet", "Other"] },
    { id: "pain", type: "multiline", tag: "The problem", question: "What's the biggest frustration with your current setup?", sub: "Be blunt — we read every answer.", placeholder: "e.g. Ugly, logic is confusing…" },
    { id: "frequency", type: "scale", tag: "Usage", question: "How often does your team create or update forms?", sub: "We want to understand your workflow rhythm.", options: ["Rarely", "Monthly", "Weekly", "Multiple times/week", "Daily"] },
    { id: "priority", type: "choice", tag: "What matters most", question: "Which matters most in a form tool?", sub: "Pick the single most important factor.", options: ["Ease of use", "Design quality", "Logic & branching", "Analytics depth", "Integrations", "Price"] },
    { id: "email", type: "email", tag: "Stay in the loop", question: "Where should we send your personalised walkthrough?", sub: "One email, no spam.", placeholder: "you@company.com" },
  ];
  const current = questions[step]!;
  const progress = (step / questions.length) * 100;
  const answer = answers[current.id];
  const canAdvance =
    (current.type === "choice" && answer) ||
    (current.type === "scale" && answer) ||
    (current.type === "multiline" && typeof answer === "string" && answer.trim().length > 3) ||
    (current.type === "email" && typeof answer === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer));

  function goNext() {
    if (!canAdvance) return;
    setTransitioning(true);
    setTimeout(() => { if (step < questions.length - 1) setStep((s) => s + 1); else setSubmitted(true); setTransitioning(false); }, 220);
  }
  function goPrev() {
    if (step === 0) return;
    setTransitioning(true);
    setTimeout(() => { setStep((s) => s - 1); setTransitioning(false); }, 220);
  }

  const choiceStyle = (active: boolean): React.CSSProperties => ({
    borderColor: active ? "var(--cta)" : "var(--border)",
    background: active ? "var(--cta)" : "var(--surface)",
    color: active ? "var(--cta-text)" : "var(--text)",
    fontWeight: active ? 600 : 400,
  });

  return (
    <div className="flex flex-wrap gap-8 items-start">
      <div className="flex-[1_1_420px] min-w-0">
        <div className="lp-card overflow-hidden shadow-sm">
          <div className="px-5 py-3 flex justify-between items-center" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
            <span className="font-mono text-[11px]" style={{ color: "var(--muted)" }}>edinform.io/demo/product-feedback</span>
            <span className="text-[11px]" style={{ color: "var(--muted)" }}>{step + 1} / {questions.length}</span>
            </div>
          <div className="h-[3px]" style={{ background: "var(--border)" }}>
            <div className="h-full transition-all duration-500" style={{ width: submitted ? "100%" : `${progress}%`, background: "var(--cta)" }} />
          </div>
          <div className="p-10 transition-all duration-200" style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(8px)" : "none" }}>
            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: "var(--green)" }} />
                <h3 className="text-2xl font-semibold mb-2">You&apos;re all set.</h3>
                <p className="text-sm mb-7 max-w-[36ch] mx-auto" style={{ color: "var(--muted)" }}>We&apos;ve received your answers. Your first form is one click away.</p>
                <div className="flex gap-2.5 justify-center flex-wrap">
                  <Link href="/auth/register" className="lp-btn-primary lp-btn-shimmer text-[13px]">Start building free <ArrowRight className="w-3.5 h-3.5" /></Link>
                  <button type="button" onClick={() => { setStep(0); setAnswers({}); setSubmitted(false); }}
                    className="text-sm px-4 py-2.5 rounded-full border cursor-pointer" style={{ borderColor: "var(--border)", color: "var(--text)" }}>↩ Start over</button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <span className="inline-block lp-label mb-3 px-2.5 py-0.5 rounded-full border" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>{current.tag}</span>
                  <h3 className="text-xl font-semibold mb-1.5">{current.question}</h3>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{current.sub}</p>
                </div>
                {current.type === "choice" && (
                  <div className="flex flex-col gap-2 mb-8">
                    {current.options!.map((opt) => {
                      const active = answer === opt;
                      return (
                        <button key={opt} type="button" onClick={() => setAnswers((a) => ({ ...a, [current.id]: opt }))}
                          className="text-left px-4 py-3 rounded-xl border text-sm flex justify-between cursor-pointer transition-all"
                          style={choiceStyle(active)}>{opt}{active && <CheckCircle2 className="w-4 h-4" />}</button>
                      );
                    })}
                  </div>
                )}
                {current.type === "scale" && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {current.options!.map((opt) => {
                        const active = answer === opt;
                        return (
                        <button key={opt} type="button" onClick={() => setAnswers((a) => ({ ...a, [current.id]: opt }))}
                          className="flex-1 min-w-[80px] py-2.5 rounded-xl border text-xs text-center cursor-pointer transition-all"
                          style={choiceStyle(active)}>{opt}</button>
                        );
                      })}
                  </div>
                )}
                {current.type === "multiline" && (
                  <textarea value={typeof answer === "string" ? answer : ""} onChange={(e) => setAnswers((a) => ({ ...a, [current.id]: e.target.value }))}
                    placeholder={current.placeholder} rows={4}
                    className="w-full rounded-xl px-4 py-3.5 border text-sm resize-none mb-8 outline-none"
                    style={{ borderColor: answer ? "var(--cta)" : "var(--border)", background: "var(--surface)", color: "var(--text)" }} />
                )}
                {current.type === "email" && (
                  <input type="email" value={typeof answer === "string" ? answer : ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [current.id]: e.target.value }))}
                    placeholder={current.placeholder} onKeyDown={(e) => e.key === "Enter" && goNext()}
                    className="w-full rounded-xl px-4 py-3.5 border text-[15px] mb-8 outline-none"
                    style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }} />
                )}
                <div className="flex items-center justify-between gap-2">
                  <button type="button" onClick={goPrev} disabled={step === 0}
                    className="px-4 py-2 rounded-full text-sm border cursor-pointer disabled:opacity-30" style={{ borderColor: "var(--border)", color: "var(--text)" }}>← Back</button>
                  <button type="button" onClick={goNext} disabled={!canAdvance}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold cursor-pointer disabled:opacity-40"
                    style={{ background: canAdvance ? "var(--cta)" : "var(--border)", color: canAdvance ? "var(--cta-text)" : "var(--muted)" }}>
                    {step === questions.length - 1 ? "Submit" : "Next"}<ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex-[0_1_280px] min-w-[220px]">
        <div className="lp-demo-sidebar sticky top-20">
          {/* Form identity + progress */}
          <div className="pb-4 mb-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-3">
              <CastleMark size={20} />
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>Product Feedback Survey</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>6 questions · ~2 min</div>
              </div>
            </div>
            <div className="flex justify-between text-[11px] mb-1" style={{ color: "var(--muted)" }}>
              <span>{submitted ? "6/6" : `${step + 1}/6`}</span>
              <span>{submitted ? "100%" : `${Math.round(((step + 1) / questions.length) * 100)}%`}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)", height: "4px" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{
                width: submitted ? "100%" : `${((step + 1) / questions.length) * 100}%`,
                background: "var(--green)",
              }} />
        </div>
      </div>

          <div className="lp-label mb-4">Your answers so far</div>
          <div className="flex flex-col gap-3">
            {questions.map((q, i) => {
              const ans = answers[q.id];
              const done = !!ans || submitted;
              const isCurrent = i === step && !submitted;
              return (
                <div key={q.id} className="flex gap-2.5 items-start transition-opacity" style={{ opacity: i > step && !submitted ? 0.5 : 1 }}>
                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{
                      border: done ? "none" : `1px solid ${isCurrent ? "var(--green)" : "var(--border)"}`,
                      background: done ? "var(--green)" : "var(--surface)",
                    }}>
                    {done ? <Check className="w-3 h-3" style={{ color: "var(--cta-text)" }} /> : null}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold mb-0.5" style={{ color: "var(--text)" }}>{q.tag}</div>
                    {ans ? (
                      <div className="text-[13px] font-medium break-words" style={{ color: "var(--text)" }}>
                        {String(ans).slice(0, 40)}{String(ans).length > 40 ? "…" : ""}
                      </div>
                    ) : (
                      <div className="text-xs italic" style={{
                        color: isCurrent ? "var(--green)" : "var(--muted)",
                        fontWeight: isCurrent ? 500 : 400,
                        fontStyle: isCurrent ? "normal" : "italic",
                      }}>
                        {isCurrent ? "answering now…" : "not yet answered"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {answers.role && (
            <div className="pt-4 mt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="lp-label mb-2">How others answered Q1</div>
              <p className="text-[10px] mb-2" style={{ color: "var(--muted)" }}>Based on 2,847 real responses</p>
              {ROLE_CHART.map(({ label, pct }) => (
                <div key={label} className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] w-16 flex-shrink-0" style={{ color: "var(--muted)" }}>{label}</span>
                  <svg width="130" height="6" aria-hidden>
                    <rect width="130" height="6" rx="3" fill="var(--border)" />
                    <rect width={130 * (pct / 100)} height="6" rx="3" fill="var(--green)" />
                  </svg>
                  <span className="text-[10px] font-semibold w-7 text-right" style={{ color: "var(--text)" }}>{pct}%</span>
        </div>
              ))}
            </div>
          )}

          {/* About this demo */}
          <div className="lp-sidebar-footer mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>About this form</div>
            <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--muted)" }}>
              Live EdinForm — responses collected in your dashboard.
            </p>
            <ul className="space-y-1 mb-3">
              {["Conditional logic", "6 field types", "Live analytics", "CSV export"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs">
                  <Check className="w-3 h-3 flex-shrink-0" style={{ color: "var(--green)" }} />
                  <span style={{ color: "var(--text)" }}>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/auth/register" className="lp-btn-primary lp-btn-shimmer w-full justify-center text-xs py-2">
              Start building free <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorksSteps() {
  const [open, setOpen] = useState(0);
  const steps = [
    { n: "01", title: "Draft your form", body: "Choose from 9 field types. Reorder with drag-and-drop.", mini: "Short text · Multiple choice · Rating" },
    { n: "02", title: "Add logic & branching", body: "Skip logic and conditional display on any field — no code.", mini: "if answer = yes → skip to Q4" },
    { n: "03", title: "Publish in one click", body: "Shareable URL, embed snippet, or QR code.", mini: "edinform.io/your-form" },
    { n: "04", title: "Read and act on replies", body: "Real-time responses. Filter, search, export to CSV.", mini: "2,847 responses · 91% completion" },
  ];
  return (
    <SectionGlow>
      <div className="lp-how-layout">
        <div className="lp-how-left">
          <ThistleIllustration />
          <StaggerItem index={1}>
            <blockquote className="lp-callout-yellow">
              &ldquo;Building a path for yes/no answers used to take 30 minutes. With EdinForm it takes 90 seconds.&rdquo;
              <div className="lp-callout-source">— Marcus K., Product Designer</div>
            </blockquote>
          </StaggerItem>
        </div>
        <div>
          <div className="lp-how-progress"><div className="lp-how-progress-dot" style={{ left: `${(open / (steps.length - 1)) * 100}%` }} /></div>
          <div className="lp-how-accordion">
            {steps.map(({ n, title, body, mini }, i) => (
              <StaggerItem key={n} index={i}>
                <div className={`lp-how-acc-item${open === i ? " open" : ""}`} onClick={() => setOpen(i)} role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setOpen(i)}>
                  <div className="lp-how-acc-header">
                    <span className="font-mono text-xs" style={{ color: "var(--green)" }}>{n}</span>
                    <span className="font-semibold flex-1">{title}</span>
                    <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: open === i ? "rotate(180deg)" : "none" }} />
                  </div>
                  {open === i && (
                    <>
                      <p className="lp-how-acc-preview">{body}</p>
                      <div className="lp-how-acc-mini lp-cursor-blink">{mini}</div>
                    </>
                  )}
                </div>
              </StaggerItem>
            ))}
          </div>
        </div>
      </div>
    </SectionGlow>
  );
}

function ComparisonStrip() {
  const rows = [
    { feature: "Conditional logic", google: "Limited", tally: "Yes", jotform: "Yes", edinform: "Visual editor" },
    { feature: "Live analytics", google: "Basic", tally: "Basic", jotform: "Paid", edinform: "Built-in" },
    { feature: "Custom branding", google: "No", tally: "Paid", jotform: "Paid", edinform: "Free plan" },
    { feature: "Completion tracking", google: "No", tally: "Limited", jotform: "Yes", edinform: "Real-time" },
    { feature: "Team collaboration", google: "Yes", tally: "Limited", jotform: "Paid", edinform: "Included" },
  ];
  return (
    <section className="lp-section">
      <div className="lp-container">
        <Reveal>
          <div className="lp-section-header">
            <div className="lp-label lp-label-green mb-3">Compare</div>
            <h2 className="lp-h2">Why teams switch to EdinForm.</h2>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="lp-compare-wrap overflow-x-auto">
            <table className="lp-compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Google Forms</th>
                  <th>Tally</th>
                  <th>Jotform</th>
                  <th className="lp-compare-highlight">EdinForm</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ feature, google, tally, jotform, edinform }, i) => (
                  <tr key={feature} className="lp-compare-row" style={{ animationDelay: `${i * 70}ms` }}>
                    <td>{feature}</td>
                    <td>{google}</td>
                    <td>{tally}</td>
                    <td>{jotform}</td>
                    <td className="lp-compare-highlight font-semibold">{edinform}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function WorldMapSection() {
  const { ref, inView } = useInView(0.2);
  const dots = [
    { cx: 120, cy: 80 }, { cx: 200, cy: 60 }, { cx: 340, cy: 70 },
    { cx: 420, cy: 90 }, { cx: 500, cy: 55 }, { cx: 580, cy: 75 },
    { cx: 660, cy: 65 }, { cx: 740, cy: 85 },
  ];
  return (
    <section className="lp-section lp-section-alt">
      <div className="lp-container">
        <Reveal>
          <div className="lp-section-header">
            <div className="lp-label lp-label-slate mb-3">Global reach</div>
            <h2 className="lp-h2">Teams worldwide, one calm workspace.</h2>
            <p className="lp-body">From Edinburgh to Tokyo — 8,400+ teams collect better answers every day.</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div ref={ref} className={`lp-world-map${inView ? " lp-map-visible" : ""}`}>
            <svg viewBox="0 0 860 160" className="w-full max-w-[860px] mx-auto">
              <ellipse cx="430" cy="80" rx="400" ry="60" fill="var(--green-tint)" stroke="var(--border)" strokeWidth="1" />
              <path
                d="M60 80 Q200 40 430 50 Q660 60 800 80"
                fill="none"
                stroke="var(--green)"
                strokeWidth="1.5"
                strokeDasharray="420"
                strokeDashoffset={inView ? 0 : 420}
                className="lp-map-line"
              />
              {dots.map(({ cx, cy }, i) => (
                <circle key={i} cx={cx} cy={cy} r="6" className={i % 3 === 1 ? "lp-map-dot-gold" : "lp-map-dot"} style={{ animationDelay: `${i * 0.25}s` }} />
              ))}
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  { q: "We replaced three different tools with EdinForm. It does everything, in one place, and it looks better than any of them.", name: "Isla M.", role: "Head of Research, DEPT®" },
  { q: "The branching logic is the best I've used. Building a path for yes/no answers used to take me 30 minutes. With EdinForm it takes 90 seconds.", name: "Marcus K.", role: "Product Designer, Mono" },
  { q: "Clients mention the forms. That never happened before. They say things like 'that felt polished'. That's EdinForm.", name: "Priya R.", role: "Studio Lead, Forma" },
  { q: "Completion rates went up 34% when we switched. Cleaner interface and conditional logic eliminating irrelevant questions.", name: "Tom H.", role: "Growth Lead, Layers" },
  { q: "The analytics are genuinely useful. I can see exactly where people abandon the form and fix it.", name: "Sara L.", role: "UX Researcher, Craft" },
  { q: "We run all our user interviews through EdinForm now. The embed is clean and our completion rates reflect that.", name: "James O.", role: "Design Lead, Arc" },
];

function TestimonialMarquee() {
  return (
    <MarqueeRow>
      {TESTIMONIALS.map(({ q, name, role }) => (
        <div key={name} className="lp-testimonial-slide">
          <div className="flex gap-0.5 mb-3">
            {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="w-3 h-3" style={{ fill: "var(--yellow)", color: "var(--yellow)" }} />)}
          </div>
          <blockquote className="text-sm leading-relaxed mb-4">&ldquo;{q}&rdquo;</blockquote>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            <span className="font-semibold" style={{ color: "var(--text)" }}>{name}</span>
            <span className="mx-2">·</span>{role}
          </div>
        </div>
      ))}
    </MarqueeRow>
  );
}

function FooterIcons() {
  const icons = [
    <path key="castle" d="M4 18 L4 12 L6 12 L6 9 L8 9 L8 6 L10 4 L12 6 L12 9 L14 9 L14 12 L16 12 L16 18 Z" />,
    <path key="hill" d="M0 18 Q6 10 12 12 Q18 6 24 10 L24 18 Z" />,
    <path key="monument" d="M11 18 L11 14 L12 10 L13 6 L14 10 L15 14 L15 18 Z" />,
    <circle key="thistle" cx="12" cy="10" r="4" />,
    <ellipse key="calton" cx="12" cy="14" rx="8" ry="4" />,
  ];
  return (
    <div className="lp-footer-icons">
      {icons.map((icon, i) => (
        <svg key={i} viewBox="0 0 24 24" className="lp-footer-icon" fill="currentColor">{icon}</svg>
      ))}
    </div>
  );
}

function FieldTypesIllustration() {
  return (
    <svg viewBox="0 0 300 180" className="lp-illus-svg" aria-hidden>
      <circle cx="72" cy="90" r="32" fill="var(--illus-warm-accent)" opacity="0.9" className="lp-illus-float" />
      <text x="72" y="98" textAnchor="middle" fontSize="28" fill="#fff">☺</text>
      <path d="M108 90 Q130 70 155 90" fill="none" stroke="var(--illus-warm-accent)" strokeWidth="2" strokeDasharray="4 4" className="lp-illus-float-d1" />
      <g className="lp-illus-float-d1">
        <rect x="158" y="52" width="110" height="76" rx="10" fill="var(--surface)" stroke="var(--illus-warm-accent)" strokeWidth="2" />
        <circle cx="178" cy="72" r="6" fill="var(--illus-warm-accent)" />
        <rect x="192" y="68" width="60" height="6" rx="3" fill="var(--border)" />
        <circle cx="178" cy="92" r="6" stroke="var(--illus-warm-accent)" strokeWidth="2" fill="none" />
        <rect x="192" y="88" width="48" height="6" rx="3" fill="var(--border)" />
        <circle cx="178" cy="112" r="6" stroke="var(--border)" strokeWidth="2" fill="none" />
        <rect x="192" y="108" width="52" height="6" rx="3" fill="var(--border)" />
      </g>
      <rect x="48" y="128" width="44" height="10" rx="5" fill="var(--illus-warm-accent)" opacity="0.5" />
      <rect x="96" y="128" width="32" height="10" rx="5" fill="var(--border)" />
      <rect x="132" y="128" width="56" height="10" rx="5" fill="var(--illus-warm-accent)" />
    </svg>
  );
}

function ScenariosIllustration() {
  return (
    <svg viewBox="0 0 300 180" className="lp-illus-svg" aria-hidden>
      <ellipse cx="150" cy="155" rx="90" ry="12" fill="var(--illus-cool-accent)" opacity="0.12" />
      <rect x="118" y="108" width="64" height="40" rx="6" fill="var(--surface)" stroke="var(--illus-cool-accent)" strokeWidth="2" />
      <rect x="126" y="116" width="48" height="28" rx="3" fill="var(--illus-cool-art)" />
      <circle cx="150" cy="72" r="22" fill="#f5d0b5" stroke="var(--illus-cool-accent)" strokeWidth="2" />
      <path d="M128 78 Q150 58 172 78" fill="#3d2c24" />
      <rect x="128" y="88" width="44" height="28" rx="14" fill="var(--illus-cool-accent)" />
      <g className="lp-illus-float">
        <rect x="52" y="48" width="36" height="44" rx="8" fill="var(--surface)" stroke="var(--illus-cool-accent)" strokeWidth="1.5" />
        <rect x="60" y="58" width="20" height="3" rx="1.5" fill="var(--illus-cool-accent)" />
        <rect x="60" y="66" width="16" height="3" rx="1.5" fill="var(--border)" />
      </g>
      <g className="lp-illus-float-d1">
        <rect x="210" y="40" width="40" height="32" rx="8" fill="var(--surface)" stroke="var(--yellow)" strokeWidth="1.5" />
        <path d="M222 52 L228 58 L238 46" fill="none" stroke="var(--yellow)" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g className="lp-illus-float-d2">
        <circle cx="230" cy="100" r="18" fill="var(--surface)" stroke="var(--slate)" strokeWidth="1.5" />
        <circle cx="230" cy="100" r="8" fill="none" stroke="var(--slate)" strokeWidth="1.5" />
        <circle cx="248" cy="88" r="4" fill="var(--slate)" />
      </g>
    </svg>
  );
}

function LogicIllustration() {
  return (
    <svg viewBox="0 0 300 180" className="lp-illus-svg" aria-hidden>
      <rect x="100" y="24" width="100" height="32" rx="8" fill="var(--surface)" stroke="var(--illus-green-accent)" strokeWidth="2" />
      <text x="150" y="44" textAnchor="middle" fontSize="9" fill="var(--illus-green-accent)" fontWeight="600">If Yes?</text>
      <line x1="130" y1="56" x2="80" y2="88" stroke="var(--illus-green-accent)" strokeWidth="2" />
      <line x1="170" y1="56" x2="220" y2="88" stroke="var(--red)" strokeWidth="2" opacity="0.6" />
      <rect x="40" y="88" width="80" height="28" rx="14" fill="var(--illus-green-accent)" className="lp-illus-float" />
      <text x="80" y="106" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="600">Yes path</text>
      <rect x="180" y="88" width="80" height="28" rx="14" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" opacity="0.7" />
      <text x="220" y="106" textAnchor="middle" fontSize="10" fill="var(--muted)">No path</text>
      <rect x="55" y="132" width="90" height="28" rx="8" fill="var(--surface)" stroke="var(--illus-green-accent)" strokeWidth="1.5" className="lp-illus-float-d1" />
      <text x="100" y="150" textAnchor="middle" fontSize="9" fill="var(--text)">Follow-up Q</text>
      <path d="M80 116 L100 132" stroke="var(--illus-green-accent)" strokeWidth="2" strokeDasharray="4 3" />
    </svg>
  );
}

function AnalyticsIllustration() {
  return (
    <svg viewBox="0 0 300 180" className="lp-illus-svg" aria-hidden>
      <rect x="48" y="40" width="204" height="110" rx="12" fill="var(--surface)" stroke="var(--illus-slate-accent)" strokeWidth="1.5" />
      <rect x="68" y="118" width="24" height="16" rx="3" fill="var(--illus-slate-accent)" opacity="0.5" className="lp-illus-float" />
      <rect x="100" y="102" width="24" height="32" rx="3" fill="var(--illus-slate-accent)" className="lp-illus-float-d1" />
      <rect x="132" y="88" width="24" height="46" rx="3" fill="var(--green)" className="lp-illus-float" />
      <rect x="164" y="96" width="24" height="38" rx="3" fill="var(--illus-slate-accent)" opacity="0.7" />
      <rect x="196" y="72" width="24" height="62" rx="3" fill="var(--yellow)" className="lp-illus-float-d2" />
      <polyline points="72,110 108,88 140,96 172,72 208,58" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="208" cy="58" r="5" fill="var(--green)" />
      <text x="150" y="62" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="600">30-day responses</text>
    </svg>
  );
}

function PublishIllustration() {
  return (
    <svg viewBox="0 0 300 180" className="lp-illus-svg" aria-hidden>
      <rect x="72" y="28" width="156" height="100" rx="10" fill="var(--surface)" stroke="var(--illus-violet-accent)" strokeWidth="2" className="lp-illus-float" />
      <rect x="72" y="28" width="156" height="22" rx="10" fill="var(--illus-violet-accent)" opacity="0.15" />
      <circle cx="88" cy="39" r="4" fill="var(--red)" opacity="0.7" />
      <circle cx="100" cy="39" r="4" fill="var(--yellow)" opacity="0.7" />
      <circle cx="112" cy="39" r="4" fill="var(--green)" opacity="0.7" />
      <text x="150" y="70" textAnchor="middle" fontSize="8" fill="var(--illus-violet-accent)" fontFamily="monospace">edinform.io/your-form</text>
      <rect x="88" y="80" width="124" height="8" rx="4" fill="var(--illus-violet-art)" />
      <rect x="88" y="96" width="90" height="8" rx="4" fill="var(--illus-violet-art)" />
      <g className="lp-illus-float-d1">
        <rect x="36" y="118" width="52" height="52" rx="8" fill="var(--surface)" stroke="var(--illus-violet-accent)" strokeWidth="1.5" />
        <rect x="44" y="126" width="12" height="12" fill="var(--illus-violet-accent)" opacity="0.3" />
        <rect x="58" y="126" width="12" height="12" fill="var(--illus-violet-accent)" />
        <rect x="44" y="140" width="12" height="12" fill="var(--illus-violet-accent)" />
        <rect x="58" y="140" width="12" height="12" fill="var(--illus-violet-accent)" opacity="0.3" />
        <text x="62" y="162" textAnchor="middle" fontSize="7" fill="var(--muted)">QR</text>
      </g>
      <g className="lp-illus-float-d2">
        <rect x="212" y="118" width="52" height="52" rx="26" fill="var(--illus-violet-accent)" opacity="0.15" stroke="var(--illus-violet-accent)" strokeWidth="1.5" />
        <circle cx="238" cy="138" r="14" fill="none" stroke="var(--illus-violet-accent)" strokeWidth="2" />
        <ellipse cx="238" cy="138" rx="14" ry="6" fill="none" stroke="var(--illus-violet-accent)" strokeWidth="1.5" />
        <line x1="224" y1="138" x2="252" y2="138" stroke="var(--illus-violet-accent)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function IntegrationsIllustration() {
  return (
    <svg viewBox="0 0 300 180" className="lp-illus-svg" aria-hidden>
      <circle cx="150" cy="90" r="28" fill="var(--illus-amber-accent)" className="lp-illus-float" />
      <text x="150" y="95" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">EF</text>
      <line x1="122" y1="90" x2="68" y2="90" stroke="var(--illus-amber-accent)" strokeWidth="2" strokeDasharray="4 3" />
      <line x1="178" y1="90" x2="232" y2="90" stroke="var(--illus-amber-accent)" strokeWidth="2" strokeDasharray="4 3" />
      <line x1="150" y1="62" x2="150" y2="38" stroke="var(--illus-amber-accent)" strokeWidth="2" strokeDasharray="4 3" />
      <line x1="150" y1="118" x2="150" y2="142" stroke="var(--illus-amber-accent)" strokeWidth="2" strokeDasharray="4 3" />
      <g className="lp-illus-float-d1">
        <rect x="36" y="72" width="56" height="36" rx="10" fill="var(--surface)" stroke="var(--green)" strokeWidth="1.5" />
        <text x="64" y="94" textAnchor="middle" fontSize="8" fill="var(--green)" fontWeight="600">Zapier</text>
      </g>
      <g className="lp-illus-float-d2">
        <rect x="208" y="72" width="56" height="36" rx="10" fill="var(--surface)" stroke="var(--slate)" strokeWidth="1.5" />
        <text x="236" y="94" textAnchor="middle" fontSize="8" fill="var(--slate)" fontWeight="600">Slack</text>
      </g>
      <g className="lp-illus-float">
        <rect x="122" y="18" width="56" height="36" rx="10" fill="var(--surface)" stroke="var(--yellow)" strokeWidth="1.5" />
        <text x="150" y="40" textAnchor="middle" fontSize="8" fill="var(--yellow)" fontWeight="600">Notion</text>
      </g>
      <g className="lp-illus-float-d1">
        <rect x="122" y="126" width="56" height="36" rx="10" fill="var(--surface)" stroke="var(--illus-amber-accent)" strokeWidth="1.5" />
        <text x="150" y="148" textAnchor="middle" fontSize="7" fill="var(--illus-amber-accent)" fontWeight="600">REST API</text>
      </g>
    </svg>
  );
}

function FeatureIllustrationCards() {
  const cards = [
    {
      tone: "warm" as const,
      title: "9+ flexible field types",
      illustration: <FieldTypesIllustration />,
      body: (
        <>From short text to ratings and file uploads — pick from <a href="#demo">9 free field types</a> and compose any workflow without code.</>
      ),
    },
    {
      tone: "cool" as const,
      title: "Versatile scenarios",
      illustration: <ScenariosIllustration />,
      body: (
        <>Run <a href="#demo">customer</a>, <a href="#demo">employee</a>, and <a href="#demo">NPS</a> surveys from one workspace — embed anywhere, share a link, or collect in-app.</>
      ),
    },
    {
      tone: "green" as const,
      title: "Visual branching logic",
      illustration: <LogicIllustration />,
      body: (
        <>Build <a href="#how">if/then rules</a> on any answer — respondents only see questions that matter, and your data stays clean.</>
      ),
    },
    {
      tone: "slate" as const,
      title: "Live analytics built in",
      illustration: <AnalyticsIllustration />,
      body: (
        <>Track <a href="#demo">completion rates</a>, drop-off points, and response volume in real time — export to CSV or JSON anytime.</>
      ),
    },
    {
      tone: "violet" as const,
      title: "Publish anywhere",
      illustration: <PublishIllustration />,
      body: (
        <>Share a <a href="#demo">branded link</a>, drop an <a href="#demo">embed snippet</a> on your site, or generate a QR code — live in one click, no dev team required.</>
      ),
    },
    {
      tone: "amber" as const,
      title: "Connect your stack",
      illustration: <IntegrationsIllustration />,
      body: (
        <>Pipe responses to <a href="#how">Zapier</a>, <a href="#how">Slack</a>, <a href="#how">Notion</a>, or your own app via <a href="#how">REST API</a> — no manual exports needed.</>
      ),
    },
  ];

  return (
    <section className="lp-section">
      <div className="lp-container">
        <Reveal>
          <div className="lp-section-header">
            <div className="lp-label lp-label-gold mb-3">Capabilities</div>
            <h2 className="lp-h2">Everything you need to ask better questions.</h2>
            <p className="lp-body">Purpose-built for product teams, researchers, and operators who care about the respondent experience.</p>
          </div>
        </Reveal>
        <div className="lp-illus-grid">
          {cards.map(({ tone, title, illustration, body }, i) => (
            <Reveal key={title} delay={i * 80} from="scale">
              <article className={`lp-illus-card lp-illus-card-${tone}`}>
                <div className="lp-illus-card-art">{illustration}</div>
                <div className="lp-illus-card-body">
                  <h3 className="lp-illus-card-title">{title}</h3>
                  <p className="lp-illus-card-text">{body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => { setLoggedIn(isAuthenticated()); }, []);
  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const ctaHref = loggedIn ? "/dashboard" : "/auth/register";
  const navLinks = [
    { l: "How it works", h: "#how", chevron: true },
    { l: "Templates", h: "/explore", chevron: true },
    { l: "Pricing", h: "/pricing", chevron: true },
    { l: "Smart logic", h: "#how", highlight: true },
  ];
  const faqs = [
    { q: "Is EdinForm free to start?", a: "Yes — the free plan gives you unlimited forms with up to 100 responses per month. No credit card required, no time limit." },
    { q: "Can I embed forms on my website?", a: "Absolutely. EdinForm generates a lightweight embed snippet you can drop into any HTML page, React app, or website builder." },
    { q: "How does branching logic work?", a: "You define rules on any field: 'if the answer is X, skip to question Y'. Build decision trees visually without writing code." },
    { q: "Is my respondents' data secure?", a: "All data is encrypted in transit and at rest. We're GDPR-compliant and never sell or share your respondents' data." },
    { q: "Can I export my responses?", a: "Yes — export to CSV or JSON at any time from your dashboard. Webhook integrations are available on paid plans." },
  ];

  return (
    <div className="landing-page min-h-screen">
      <nav className={`lp-nav lp-nav-enter${navScrolled ? " scrolled" : ""}`} aria-label="Main">
        <div className="lp-nav-shell">
          <div className="lp-nav-inner">
            <Link href="/" className="lp-nav-brand">
              <span className="lp-nav-logo-mark"><Check className="w-4 h-4" strokeWidth={3} /></span>
              EdinForm
            </Link>
            <div className="lp-nav-links lp-hide-mobile">
              {navLinks.map(({ l, h, chevron, highlight }) => (
                <a
                  key={l}
                  href={h}
                  className={`lp-nav-link${highlight ? " lp-nav-link-highlight" : ""}`}
                >
                  {highlight && <Sparkles className="lp-nav-sparkle" />}
                  {l}
                  {chevron && !highlight && <ChevronDown className="lp-nav-link-chevron" />}
                </a>
              ))}
            </div>
            <div className="lp-nav-actions">
              {loggedIn ? (
                <Link href="/dashboard" className="lp-btn-primary lp-btn-shimmer lp-nav-cta lp-hide-mobile">
                  Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="lp-nav-signin lp-hide-mobile">Sign in</Link>
                  <Link href="/auth/register" className="lp-btn-primary lp-btn-shimmer lp-nav-cta lp-hide-mobile">Start free</Link>
                </>
              )}
              <ThemeToggle />
              <button type="button" className="lp-mobile-toggle lp-mobile-only" onClick={() => setNavOpen((v) => !v)} aria-label="Menu">
                {navOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className={`lp-mobile-menu lp-mobile-only${navOpen ? " open" : ""}`} style={{ padding: "0 1.25rem" }}>
            <div className="pb-5 flex flex-col gap-1">
              {navLinks.map(({ l, h, highlight }) => (
                <a key={l} href={h} className={`lp-nav-link py-2.5${highlight ? " lp-nav-link-highlight" : ""}`}>
                  {highlight && <Sparkles className="lp-nav-sparkle" />}
                  {l}
                </a>
              ))}
              <div className="h-px my-2" style={{ background: "var(--border)" }} />
              <Link href="/auth/login" className="lp-nav-link py-2.5">Sign in</Link>
              <Link href="/auth/register" className="lp-btn-primary lp-btn-shimmer justify-center mt-2">Start free</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          SECTION: HERO
          Contains: EdinburghSkylineHero SVG + HeroFormCard + FormLifecycleStepper
          Left: social proof ticker + stat pills + skyline SVG + form card
          Right: lifecycle stepper + trusted-by strip
          Animations: HeroAskHeadline (gradient cycle, float chips, beams, parallax, underline draw)
          Void rule: ✓ both columns have ≥3 blocks
          ═══════════════════════════════════════════ */}
      <section className="lp-hero">
        <div className="lp-container">
          <div className="lp-hero-text">
            <div className="lp-live-badge lp-live-badge-bob lp-fade-up">
              <span className="lp-live-dot" />
              <SmoothCounter to={8412} /> live respondents right now
            </div>
            <HeroAskHeadline />
            <p className="lp-body lp-fade-up lp-fade-up-d2">
              EdinForm is the form builder for teams who care about the quality of every conversation. Adaptive logic, live analytics, and a respondent experience that&apos;s quietly exceptional.
            </p>
            <div className="lp-stat-pills lp-stat-pills-anim lp-fade-up lp-fade-up-d2">
              {([
                ["91%", "avg completion", "green", ""],
                ["2m 3s", "avg time", "gold", "gold"],
                ["+34%", "completion lift", "slate", "slate"],
              ] as const).map(([v, l, pillTone, dotTone]) => (
                <span key={l} className={`lp-stat-pill lp-stat-pill-${pillTone}`}>
                  <span className={`lp-stat-pill-dot${dotTone ? ` lp-stat-pill-dot-${dotTone}` : ""}`} />
                  <strong>{v}</strong> {l}
                </span>
              ))}
            </div>
            <div className="lp-hero-cta lp-fade-up lp-fade-up-d3">
              <Link href={ctaHref} className="lp-btn-primary lp-btn-shimmer text-[15px] px-7 py-3.5">
                Build your first form — free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#demo" className="lp-btn-ghost"><Play className="w-3 h-3 fill-current" /> See a live demo</Link>
            </div>
            <div className="lp-trust-row lp-trust-stagger lp-fade-up lp-fade-up-d3">
              {["Free plan forever", "No credit card needed", "GDPR compliant", "Trusted by 8,400+ teams"].map((t) => (
                <span key={t} className="lp-trust-item"><Check className="w-3 h-3" /> {t}</span>
              ))}
            </div>
          </div>
          <div className="lp-hero-skyline-row lp-fade-up lp-fade-up-d2">
            <SocialProofTicker />
            <EdinburghSkylineHero />
          </div>
          <div className="flex flex-wrap gap-10 py-16 items-start">
            <div className="flex-[1_1_380px] min-w-0"><HeroFormCard /></div>
            <div className="flex-[1_1_340px] min-w-0">
              <p className="lp-label mb-2">Form lifecycle</p>
              <h2 className="text-2xl font-semibold mb-2">From draft to data in minutes.</h2>
              <p className="lp-body mb-6">The form on the left is live — fill it out and see EdinForm from your respondents&apos; perspective.</p>
              <FormLifecycleStepper />
            </div>
          </div>
        </div>
      </section>

      <FeatureIllustrationCards />

      {/* ═══════════════════════════════════════════
          SECTION: HOW IT WORKS
          Contains: 4 step cards (accordion) + thistle + callout cards
          Left: thistle SVG + did-you-know card + Edinburgh nature fact
          Right: 4 accordion step cards with animated progress connector
          Animations: stagger slide-up, accordion expand, dot progress
          Void rule: ✓ left column has 3 content blocks
          ═══════════════════════════════════════════ */}
      <section id="how" className="lp-section lp-section-alt">
        <div className="lp-container">
          <Reveal>
            <div className="lp-section-header">
              <div className="lp-label lp-label-slate mb-3">How it works</div>
              <h2 className="lp-h2">From idea to insights in four steps.</h2>
              <p className="lp-body">EdinForm removes every unnecessary step between asking a question and understanding the answer.</p>
            </div>
          </Reveal>
          <HowItWorksSteps />
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-container">
          <SectionGlow>
            <div className="lp-branching-grid">
              <Reveal from="left">
                <hr className="border-0 h-px mb-3" style={{ background: "var(--border)" }} />
                <div className="font-mono text-[10px] uppercase tracking-widest mb-4 lp-label-gold">Conditional logic</div>
                <h2 className="lp-h2 mb-5">Forms that listen and adapt.</h2>
                <p className="lp-body mb-4">A single form that shows different questions to different people. Set simple if/then rules on any field — the form adapts in real time.</p>
                <ul className="space-y-2 text-sm mb-2" style={{ color: "var(--muted)" }}>
                  {["Skip irrelevant questions automatically", "Route by answer in real time", "Custom endings per branch", "Visual logic editor — no code"].map((item, i) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 lp-check-${(["green", "gold", "slate", "green"] as const)[i]}`} />
                      {item}
                    </li>
                  ))}
                </ul>
                <RealNumbersInline />
                <HowLogicWorksSteps />
                <LogicQuotePullout />
                <CompletionRateInline />
            </Reveal>
              <Reveal delay={120} from="right">
                <div className="lp-col-stack">
                  <BorderBeam>
                    <div className="lp-viz-panel p-6"><BranchingVisualiser /></div>
                  </BorderBeam>
                  <BeforeAfterToggle />
              </div>
            </Reveal>
          </div>
          </SectionGlow>
        </div>
      </section>

      <section className="lp-section lp-section-cool">
        <div className="lp-container">
          <SectionGlow>
            <div className="lp-branching-grid">
              <Reveal from="left">
                <div>
                  <div className="lp-label lp-label-green mb-3">Analytics</div>
                  <h2 className="lp-h2 mb-5">Numbers that actually mean something.</h2>
                  <p className="lp-body mb-4">See where respondents drop off, which questions take the longest, and how completion rates change over time.</p>
                  <p className="lp-body mb-0">Export everything to CSV or JSON. Filter by date range, device type, or referrer.</p>
                  <AnalyticsLeftExtras />
            </div>
          </Reveal>
              <Reveal delay={120} from="right">
                <div className="lp-analytics-stack">
                  <ResponseWave />
                  <DropOffFunnel />
            </div>
          </Reveal>
            </div>
          </SectionGlow>
        </div>
      </section>

      <section className="lp-stats-section">
        <div className="lp-container">
          <div className="lp-stats">
            {[
              { raw: 10000, suffix: "+", label: "Forms created", tone: "green" },
              { raw: 1200000, suffix: "+", label: "Responses collected", tone: "gold" },
              { raw: 99.9, suffix: "%", label: "Uptime SLA", fixed: 1, tone: "slate" },
              { raw: 4.9, suffix: "/5", label: "Average rating", fixed: 1, tone: "green" },
            ].map(({ raw, suffix, label, fixed, tone }, i) => (
              <Reveal key={label} delay={i * 80}>
                <div className="lp-stat">
                  <div className={`lp-stat-value lp-stat-value-${tone}`}>{fixed !== undefined ? raw.toFixed(fixed) : <SmoothCounter to={raw} />}{suffix}</div>
                  <div className="lp-stat-label">{label}</div>
              </div>
            </Reveal>
          ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION: LIVE DEMO
          Contains: LiveDemoForm (6 questions) + enriched sidebar
          Sidebar: form identity header + progress bar + answers list +
                   about-this-form card + post-Q1 mini chart
          Void rule: ✓ sidebar has 4 content blocks
          ═══════════════════════════════════════════ */}
      <section id="demo" className="lp-section lp-section-alt">
        <SectionGlow>
        <div className="lp-container">
          <Reveal>
            <div className="lp-section-header">
              <div className="lp-label lp-label-gold mb-3">Try it now</div>
              <h2 className="lp-h2">A real EdinForm, live right here.</h2>
              <p className="lp-body">Every interaction — field focus, validation, progress, submission — is exactly what your respondents will experience.</p>
            </div>
          </Reveal>
          <Reveal delay={100}><LiveDemoForm /></Reveal>
          <Reveal delay={160}>
            <MarqueeRow>
              {[
                { icon: Zap, label: "Instant responses", desc: "Live dashboard updates", tone: "green" },
                { icon: GitBranch, label: "Adaptive logic", desc: "Questions change by answer", tone: "gold" },
                { icon: Globe, label: "Works everywhere", desc: "Any device, any browser", tone: "slate" },
                { icon: BarChart3, label: "Built-in analytics", desc: "Completion & drop-off tracked", tone: "green" },
              ].map(({ icon: Icon, label, desc, tone }) => (
                <div key={label} className="lp-marquee-chip">
                  <Icon className={`w-4 h-4 flex-shrink-0 lp-marquee-icon-${tone}`} />
                  <div>
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>{desc}</div>
                  </div>
                </div>
            ))}
            </MarqueeRow>
          </Reveal>
          </div>
        </SectionGlow>
      </section>

      <ComparisonStrip />
      <WorldMapSection />

      <section className="lp-section lp-tartan-section relative">
        <TartanPattern />
        <div className="lp-container relative z-[1]">
          <Reveal>
            <div className="lp-section-header">
              <div className="lp-label lp-label-gold mb-3">What people say</div>
              <h2 className="lp-h2">Teams who switched, didn&apos;t look back.</h2>
            </div>
          </Reveal>
          <TestimonialMarquee />
        </div>
      </section>

      <section className="lp-section lp-section-alt">
        <SectionGlow>
          <div className="lp-container-narrow">
          <Reveal>
            <div className="lp-section-header">
              <div className="lp-label lp-label-slate mb-3">FAQ</div>
              <h2 className="lp-h2">Common questions, answered plainly.</h2>
            </div>
          </Reveal>
          <div className="flex flex-col gap-1.5">
            {faqs.map(({ q, a }, i) => (
              <Reveal key={q} delay={i * 40}>
                <div className={`lp-faq-item${activeFaq === i ? " open" : ""}`}>
                  <button type="button" className="lp-faq-btn" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                    <span>{q}</span>
                    <ChevronDown className="w-[18px] h-[18px]" />
                  </button>
                  <div style={{ maxHeight: activeFaq === i ? "300px" : "0", overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)" }}>
                    <p className="lp-faq-answer">{a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        </SectionGlow>
      </section>

      <section className="lp-cta-section">
        <div className="lp-container">
          <Reveal>
            <div className="lp-cta-grid">
              <div>
                <div className="lp-cta-illustration mb-6"><HogmanayCtaIllustration /></div>
                <div className="lp-label mb-4">Get started</div>
                <h2 className="lp-h2 mb-5">Your next great form starts here.</h2>
                <p className="lp-body mb-10 max-w-[42ch]">
                  Join thousands of teams using EdinForm to ask better questions and get cleaner answers. Free plan available — no credit card, no time limit.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  <Link href={ctaHref} className="lp-btn-primary lp-btn-shimmer text-base px-8 py-3.5">
                    Start building for free <ArrowRight className="w-4 h-4" />
              </Link>
                  <Link href="/explore" className="lp-btn-ghost">Browse templates</Link>
            </div>
                <div className="lp-trust-row">
                  {["Free plan forever", "No credit card needed", "GDPR compliant", "Cancel anytime"].map((t) => (
                    <span key={t} className="lp-trust-item"><Check className="w-3 h-3" /> {t}</span>
                  ))}
                </div>
              </div>
              <div className="lp-cta-image-wrap lp-cta-image-float">
                <Image src="https://images.unsplash.com/photo-1484712401471-05c7215830eb" alt="" fill loading="lazy" sizes="340px" className="object-cover" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-container">
          <FooterIcons />
          <div className="flex flex-wrap gap-12 mb-12">
            <div className="flex-[2_1_260px]">
              <Link href="/" className="lp-nav-brand text-xl">EdinForm</Link>
              <p className="lp-body mt-4 max-w-[36ch] text-[15px]">The form builder for teams who value experience. Build, publish, and analyze — in one calm workspace.</p>
              <div className="flex gap-1.5 mt-5 flex-wrap">
                {["GDPR", "SOC 2", "CCPA"].map((badge) => (
                  <span key={badge} className="font-mono text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md border" style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--muted)" }}>{badge}</span>
                ))}
              </div>
            </div>
            {[
              { label: "Product", links: [{ t: "Features", h: "#how" }, { t: "Templates", h: "/explore" }, { t: "Pricing", h: "/pricing" }, { t: "Changelog", h: "/changelog" }] },
              { label: "Company", links: [{ t: "About", h: "/about" }, { t: "Blog", h: "/blog" }, { t: "Careers", h: "/careers" }, { t: "Contact", h: "/contact" }] },
              { label: "Legal", links: [{ t: "Privacy", h: "/privacy" }, { t: "Terms", h: "/terms" }, { t: "Security", h: "/security" }] },
            ].map(({ label, links }) => (
              <div key={label} className="flex-[1_1_120px]">
                <div className="lp-label mb-4">{label}</div>
                <ul className="flex flex-col gap-2">
                  {links.map(({ t, h }) => <li key={t}><a href={h} className="text-[15px] no-underline transition-colors" style={{ color: "var(--muted)" }}>{t}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-6 flex flex-wrap justify-between gap-4 text-sm" style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
            <span>© 2026 EdinForm. All rights reserved.</span>
            <span className="lp-footer-coords">🏴󠁧󠁢󠁳󠁣󠁴󠁿 55.9533° N, 3.1883° W</span>
            <span className="flex items-center gap-1.5">
              <span className="lp-status-dot" />
              All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}



