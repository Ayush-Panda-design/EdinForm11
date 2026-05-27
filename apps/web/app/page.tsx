"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  ArrowRight, Menu, X, Check, Sparkles, ShieldCheck,
  Eye, Share2, GitBranch, BarChart3, Zap, Users,
  ChevronDown, Star, TrendingUp, Clock, Globe,
  Layers, MousePointer2, FileText, CheckCircle2,
  ArrowUpRight, Play,
} from "lucide-react";
import { isAuthenticated } from "~/lib/auth";
import { EdinFormLogo, EdinFormMark } from "~/components/brand/logo";

/* ─── useInView ─── */
function useInView(threshold = 0.12) {
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

function Reveal({ children, delay = 0, className = "", style = {} }: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.72s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.72s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      ...style,
    }}>{children}</div>
  );
}

function Counter({ to, suffix = "", fixed }: { to: number; suffix?: string; fixed?: number }) {
  const { ref, inView } = useInView(0.5);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(to / 70));
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(id); }
      else setVal(start);
    }, 14);
    return () => clearInterval(id);
  }, [inView, to]);
  return <span ref={ref}>{fixed !== undefined ? to.toFixed(fixed) : val.toLocaleString()}{suffix}</span>;
}

/* ══════════════════════════════════════════════════
   EDINBURGH SKYLINE HERO — interactive SVG
   Each landmark = a form-product feature metaphor
══════════════════════════════════════════════════ */
function EdinburghSkylineHero() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mist, setMist] = useState(0);
  const [particles, setParticles] = useState<Array<{id:number;x:number;y:number;size:number;speed:number;opacity:number}>>([]);
  const animRef = useRef<number>(0);
  const mistRef = useRef(0);

  // Mist animation
  useEffect(() => {
    const tick = () => {
      mistRef.current = (mistRef.current + 0.003) % (Math.PI * 2);
      setMist(Math.sin(mistRef.current) * 0.5 + 0.5);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Floating data particles
  useEffect(() => {
    const ps = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 60,
      size: 1.5 + Math.random() * 2.5,
      speed: 0.2 + Math.random() * 0.4,
      opacity: 0.15 + Math.random() * 0.4,
    }));
    setParticles(ps);
  }, []);

  const landmarks = [
    {
      id: "castle",
      label: "Conditional Logic",
      sub: "Show only what matters",
      x: 80, y: 90, w: 140,
      color: "#C89B63",
      // Edinburgh Castle on its volcanic rock
      path: "M80,90 L80,105 L85,105 L85,98 L90,98 L90,95 L95,95 L95,88 L100,88 L100,82 L105,82 L105,78 L110,78 L110,72 L115,72 L115,68 L120,68 L120,62 L125,62 L125,58 L130,58 L130,54 L135,54 L135,50 L140,50 L140,48 L142,48 L142,44 L144,44 L144,40 L146,40 L146,38 L148,38 L148,35 L150,35 L150,32 L152,32 L152,35 L154,35 L154,38 L156,38 L156,40 L158,40 L158,44 L160,44 L160,48 L162,48 L162,50 L164,50 L164,54 L170,54 L170,58 L175,58 L175,62 L180,62 L180,68 L185,68 L185,72 L190,72 L190,78 L195,78 L195,82 L200,82 L200,88 L205,88 L205,95 L210,95 L210,98 L215,98 L215,105 L220,105 L220,90 Z",
    },
    {
      id: "spire",
      label: "Multi-step Forms",
      sub: "One question at a time",
      x: 310, y: 90, w: 60,
      color: "#7EB884",
      // Tall church spire
      path: "M320,90 L320,105 L340,105 L340,90 L338,88 L338,78 L336,72 L336,60 L334,52 L334,40 L332,32 L332,22 L331,15 L330,8 L329,15 L328,22 L328,32 L326,40 L326,52 L324,60 L324,72 L322,78 L322,88 L320,90 Z",
    },
    {
      id: "dome",
      label: "Analytics Dashboard",
      sub: "Completion rates & trends",
      x: 390, y: 90, w: 120,
      color: "#6B9ECC",
      // Dome + columns (like Edinburgh City Chambers)
      path: "M395,105 L395,85 L400,85 L400,78 Q430,55 460,78 L460,85 L465,85 L465,105 Z M405,85 Q430,65 455,85 Z M410,85 L410,105 M420,85 L420,105 M430,85 L430,105 M440,85 L440,105 M450,85 L450,105",
    },
    {
      id: "tenement",
      label: "Response Limits",
      sub: "Control & expiry built-in",
      x: 520, y: 90, w: 100,
      color: "#C89B63",
      // Georgian tenement row with windows
      path: "M525,105 L525,55 L540,55 L540,105 M540,55 L540,50 L600,50 L600,55 L600,105 M550,70 L550,60 L560,60 L560,70 Z M570,70 L570,60 L580,60 L580,70 Z M590,70 L590,60 L600,60 L600,70 Z M550,90 L550,80 L560,80 L560,90 Z M570,90 L570,80 L580,80 L580,90 Z M590,90 L590,80 L600,80 L600,90 Z",
    },
    {
      id: "tower",
      label: "QR & Sharing",
      sub: "Publish anywhere, instantly",
      x: 650, y: 90, w: 70,
      color: "#7EB884",
      // Clock tower (Scott Monument inspired)
      path: "M660,105 L660,88 L655,88 L655,78 L658,78 L658,65 L660,58 L660,48 L662,40 L664,32 L666,24 L668,18 L670,12 L672,18 L674,24 L676,32 L678,40 L680,48 L680,58 L682,65 L682,78 L685,78 L685,88 L680,88 L680,105 Z M655,78 L685,78 M655,88 L685,88",
    },
    {
      id: "hill",
      label: "CSV Export & API",
      sub: "Your data, your way",
      x: 730, y: 90, w: 150,
      color: "#8FB87A",
      // Arthur's Seat volcanic hill silhouette
      path: "M730,105 Q760,95 780,88 Q800,78 820,68 Q840,58 860,62 Q870,65 875,72 Q880,80 878,90 L878,105 Z",
    },
  ];

  const tooltipData: Record<string, { label: string; sub: string; color: string }> = {};
  landmarks.forEach(l => { tooltipData[l.id] = { label: l.label, sub: l.sub, color: l.color }; });

  return (
    <div style={{ position: "relative", width: "100%", userSelect: "none" }}>
      <svg
        viewBox="0 0 960 160"
        style={{ width: "100%", display: "block", overflow: "visible" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B1218" />
            <stop offset="60%" stopColor="#0F1A24" />
            <stop offset="100%" stopColor="#141E14" />
          </linearGradient>
          <radialGradient id="moonGlow" cx="85%" cy="18%" r="15%">
            <stop offset="0%" stopColor="#C89B63" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#C89B63" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mistGrad" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#7EB884" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#7EB884" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="skyClip">
            <rect x="0" y="0" width="960" height="160" />
          </clipPath>
        </defs>

        {/* Sky background */}
        <rect width="960" height="160" fill="url(#skyGrad)" />
        <rect width="960" height="160" fill="url(#moonGlow)" />

        {/* Stars */}
        {[
          [45,8],[120,5],[200,12],[280,4],[350,9],[430,6],[510,11],[600,5],[680,9],[750,4],[830,7],[900,11],
          [70,18],[160,15],[240,22],[320,16],[410,19],[490,14],[570,20],[650,16],[720,22],[800,15],[880,18],
        ].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={0.8 + (i % 3) * 0.4}
            fill="#E8D5B0" opacity={0.3 + (i % 4) * 0.15} />
        ))}

        {/* Moon */}
        <circle cx="818" cy="22" r="10" fill="#E8D5B0" opacity="0.9" />
        <circle cx="823" cy="19" r="8" fill="#0B1218" />

        {/* Mist layer - animated */}
        <ellipse cx="480" cy="130" rx="520" ry="40"
          fill="#7EB884" opacity={0.04 + mist * 0.05}
          style={{ transition: "opacity 1s ease" }} />
        <ellipse cx="200" cy="120" rx="300" ry="25"
          fill="#6B9ECC" opacity={0.03 + (1 - mist) * 0.04}
          style={{ transition: "opacity 1.5s ease" }} />
        <ellipse cx="720" cy="118" rx="260" ry="22"
          fill="#C89B63" opacity={0.02 + mist * 0.03}
          style={{ transition: "opacity 2s ease" }} />

        {/* Ground / water reflection */}
        <rect x="0" y="105" width="960" height="55" fill="#0B0F0D" opacity="0.95" />
        {/* Reflection shimmer */}
        {[1,2,3,4,5].map(i => (
          <line key={i}
            x1={160 * i - 80} y1="108"
            x2={160 * i - 60 + (mist * 20)} y2="108"
            stroke="#C89B63" strokeWidth="0.5" opacity={0.08 + mist * 0.06} />
        ))}

        {/* Data flow particles */}
        {particles.map(p => (
          <circle
            key={p.id}
            cx={`${p.x + Math.sin(mistRef.current * p.speed + p.id) * 2}%`}
            cy={`${p.y - mist * p.speed * 8}%`}
            r={p.size}
            fill="#C89B63"
            opacity={p.opacity * (0.6 + mist * 0.4)}
          />
        ))}

        {/* Landmarks */}
        {landmarks.map(({ id, path, color, label }) => {
          const isHov = hovered === id;
          return (
            <g key={id}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <path
                d={path}
                fill={isHov ? color : "#1C2820"}
                stroke={isHov ? color : "#2D3D35"}
                strokeWidth={isHov ? 1.2 : 0.8}
                opacity={isHov ? 1 : 0.85}
                filter={isHov ? "url(#glow)" : undefined}
                style={{ transition: "fill 0.35s ease, stroke 0.35s ease, opacity 0.35s ease" }}
              />
              {/* Glow halo on hover */}
              {isHov && (
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={3}
                  opacity={0.2}
                  filter="url(#softGlow)"
                />
              )}
            </g>
          );
        })}

        {/* Horizontal ground line */}
        <line x1="0" y1="105" x2="960" y2="105" stroke="#2D3D35" strokeWidth="1" opacity="0.6" />

        {/* Cityname text */}
        <text x="480" y="152" textAnchor="middle"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "7px", fill: "#C89B63", opacity: 0.4, letterSpacing: "0.5em" }}>
          EDINBURGH · SCOTLAND
        </text>
      </svg>

      {/* Tooltip */}
      {hovered && tooltipData[hovered] && (
        <div style={{
          position: "absolute", bottom: "calc(100% - 80px)", left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(11,15,13,0.96)",
          border: `1px solid ${tooltipData[hovered]!.color}44`,
          borderRadius: "12px", padding: "10px 16px",
          textAlign: "center", pointerEvents: "none",
          boxShadow: `0 8px 32px ${tooltipData[hovered]!.color}22`,
          whiteSpace: "nowrap", zIndex: 10,
        }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: tooltipData[hovered]!.color, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.05em" }}>
            {tooltipData[hovered]!.label}
          </div>
          <div style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "2px" }}>
            {tooltipData[hovered]!.sub}
          </div>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: "11px", color: "var(--muted-foreground)", opacity: 0.5, marginTop: "8px", letterSpacing: "0.15em" }}>
        ↑ hover each landmark
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   INTERACTIVE FORM FLOW DIAGRAM
   Edinburgh stone-arch style — product-focused
══════════════════════════════════════════════════ */
function FormFlowDiagram() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [flowStep, setFlowStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFlowStep(s => (s + 1) % 6), 1600);
    return () => clearInterval(id);
  }, []);

  const nodes = [
    { id: "create", x: 80, y: 100, label: "Create", icon: "✦", color: "#C89B63", desc: "Draft fields in minutes" },
    { id: "logic",  x: 260, y: 60,  label: "Add Logic", icon: "⟁", color: "#7EB884", desc: "Branch by answer" },
    { id: "pub",    x: 440, y: 100, label: "Publish", icon: "◎", color: "#6B9ECC", desc: "Link, embed or QR" },
    { id: "resp",   x: 620, y: 60,  label: "Collect", icon: "▣", color: "#C89B63", desc: "Live responses stream in" },
    { id: "ana",    x: 800, y: 100, label: "Analyse", icon: "◈", color: "#7EB884", desc: "Charts & CSV export" },
  ];

  const edges = [
    { from: "create", to: "logic" },
    { from: "logic",  to: "pub" },
    { from: "pub",    to: "resp" },
    { from: "resp",   to: "ana" },
  ];

  const stepOrder = ["create","logic","pub","resp","ana","ana"];

  const getNode = (id: string) => nodes.find(n => n.id === id)!;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox="0 0 920 200" style={{ width: "100%", display: "block", overflow: "visible" }}>
        <defs>
          <marker id="fArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="rgba(200,155,99,0.6)" />
          </marker>
          <marker id="fArrowActive" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#C89B63" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map(({ from, to }, i) => {
          const a = getNode(from); const b = getNode(to);
          const isActive = flowStep >= i;
          const isAnimating = flowStep === i;
          return (
            <g key={`${from}-${to}`}>
              <line
                x1={a.x + 44} y1={a.y + 22}
                x2={b.x + 4}  y2={b.y + 22}
                stroke={isActive ? "#C89B63" : "rgba(255,255,255,0.08)"}
                strokeWidth={isActive ? 1.5 : 1}
                strokeDasharray={isAnimating ? "6 4" : "none"}
                markerEnd={isActive ? "url(#fArrowActive)" : "url(#fArrow)"}
                opacity={isActive ? 1 : 0.4}
                style={{ transition: "all 0.5s ease" }}
              />
              {/* Animated dot on active edge */}
              {isAnimating && (
                <circle r="4" fill="#C89B63" opacity="0.9">
                  <animateMotion dur="1.6s" repeatCount="indefinite"
                    path={`M${a.x + 44},${a.y + 22} L${b.x + 4},${b.y + 22}`} />
                </circle>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(({ id, x, y, label, icon, color, desc }, i) => {
          const isHov = activeNode === id;
          const isFlow = stepOrder[flowStep] === id;
          const isPast = nodes.findIndex(n => n.id === stepOrder[flowStep]) >= i;
          return (
            <g key={id} transform={`translate(${x}, ${y})`}
              onMouseEnter={() => setActiveNode(id)}
              onMouseLeave={() => setActiveNode(null)}
              style={{ cursor: "pointer" }}>
              {/* Outer ring */}
              <rect x="-2" y="-2" width="96" height="52" rx="14"
                fill="none"
                stroke={isFlow ? color : "transparent"}
                strokeWidth="1.5"
                opacity={isFlow ? 0.6 : 0}
                style={{ transition: "all 0.4s" }}
              />
              {/* Card */}
              <rect width="92" height="48" rx="12"
                fill={isHov || isFlow ? `${color}18` : "rgba(255,255,255,0.04)"}
                stroke={isHov || isFlow ? `${color}66` : "rgba(255,255,255,0.09)"}
                strokeWidth="1"
                style={{ transition: "all 0.3s" }}
              />
              {/* Icon */}
              <text x="14" y="22"
                style={{ fontSize: "16px", fill: isPast ? color : "rgba(255,255,255,0.3)", transition: "fill 0.4s" }}>
                {icon}
              </text>
              {/* Label */}
              <text x="30" y="18"
                style={{ fontSize: "12px", fontWeight: 700, fill: isPast ? "var(--foreground, #E8D5B0)" : "rgba(255,255,255,0.4)", fontFamily: "'Cormorant Garamond', serif", transition: "fill 0.4s" }}>
                {label}
              </text>
              <text x="30" y="34"
                style={{ fontSize: "9.5px", fill: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                {desc}
              </text>
              {/* Step number */}
              <text x="78" y="12"
                style={{ fontSize: "8px", fill: color, opacity: 0.5, fontFamily: "monospace" }}>
                0{i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   BRANCHING LOGIC VISUALISER
   Interactive decision-tree diagram
══════════════════════════════════════════════════ */
function BranchingVisualiser() {
  const [selected, setSelected] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string[]>([]);

  const paths: Record<string, string[]> = {
    "yes": ["root", "yes-node", "q2a", "end-a"],
    "no":  ["root", "no-node",  "q2b", "end-b"],
  };

  function pick(branch: string) {
    setSelected(branch);
    setHighlight(paths[branch] || []);
  }

  const nodes = [
    { id: "root",   x: 340, y: 20,  w: 200, h: 36, label: "Do you collect feedback regularly?", type: "q", color: "#C89B63" },
    { id: "yes-node", x: 100, y: 100, w: 120, h: 28, label: "Yes →", type: "branch", color: "#7EB884" },
    { id: "no-node",  x: 660, y: 100, w: 120, h: 28, label: "No →", type: "branch", color: "#6B9ECC" },
    { id: "q2a",    x: 60,  y: 168, w: 200, h: 36, label: "What's your biggest bottleneck?", type: "q", color: "#7EB884" },
    { id: "q2b",    x: 620, y: 168, w: 200, h: 36, label: "What's stopping you?", type: "q", color: "#6B9ECC" },
    { id: "end-a",  x: 100, y: 244, w: 120, h: 28, label: "✓ Thank you", type: "end", color: "#7EB884" },
    { id: "end-b",  x: 660, y: 244, w: 120, h: 28, label: "✓ Thank you", type: "end", color: "#6B9ECC" },
  ];

  const edges = [
    { from: "root", to: "yes-node", x1: 440, y1: 56, x2: 160, y2: 100 },
    { from: "root", to: "no-node",  x1: 440, y1: 56, x2: 720, y2: 100 },
    { from: "yes-node", to: "q2a",  x1: 160, y1: 128, x2: 160, y2: 168 },
    { from: "no-node",  to: "q2b",  x1: 720, y1: 128, x2: 720, y2: 168 },
    { from: "q2a",  to: "end-a",    x1: 160, y1: 204, x2: 160, y2: 244 },
    { from: "q2b",  to: "end-b",    x1: 720, y1: 204, x2: 720, y2: 244 },
  ];

  const getNode = (id: string) => nodes.find(n => n.id === id)!;
  const isLit = (id: string) => highlight.includes(id);

  return (
    <div>
      <svg viewBox="0 0 880 300" style={{ width: "100%", display: "block", overflow: "visible" }}>
        <defs>
          <marker id="bArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(200,155,99,0.4)" />
          </marker>
          <marker id="bArrowLit" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#C89B63" />
          </marker>
        </defs>

        {edges.map(({ from, to, x1, y1, x2, y2 }) => {
          const lit = isLit(from) && isLit(to);
          const toNode = getNode(to);
          return (
            <line key={`${from}-${to}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={lit ? (toNode?.color || "#C89B63") : "rgba(255,255,255,0.1)"}
              strokeWidth={lit ? 1.8 : 1}
              markerEnd={lit ? "url(#bArrowLit)" : "url(#bArrow)"}
              style={{ transition: "all 0.4s ease" }}
            />
          );
        })}

        {nodes.map(({ id, x, y, w, h, label, type, color }) => {
          const lit = isLit(id);
          const isBtn = id === "yes-node" || id === "no-node";
          return (
            <g key={id}
              onClick={() => isBtn ? pick(id === "yes-node" ? "yes" : "no") : undefined}
              style={{ cursor: isBtn ? "pointer" : "default" }}>
              <rect x={x} y={y} width={w} height={h} rx={type === "q" ? 10 : 20}
                fill={lit ? `${color}18` : "rgba(255,255,255,0.04)"}
                stroke={lit ? `${color}88` : "rgba(255,255,255,0.1)"}
                strokeWidth={lit ? 1.5 : 1}
                style={{ transition: "all 0.4s" }}
              />
              <text
                x={x + w / 2} y={y + h / 2 + 1}
                textAnchor="middle" dominantBaseline="middle"
                style={{
                  fontSize: type === "q" ? "10px" : "11px",
                  fill: lit ? color : "rgba(255,255,255,0.55)",
                  fontFamily: type === "q" ? "'Cormorant Garamond', serif" : "monospace",
                  fontWeight: isBtn ? "700" : "400",
                  transition: "fill 0.4s",
                }}>
                {label.length > 34 ? label.slice(0, 34) + "…" : label}
              </text>
            </g>
          );
        })}
      </svg>

      <p style={{ textAlign: "center", fontSize: "11px", color: "var(--muted-foreground)", opacity: 0.5, marginTop: "4px", letterSpacing: "0.12em" }}>
        ↑ click Yes or No to trace the logic path
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   RESPONSE WAVE — animated analytics preview
══════════════════════════════════════════════════ */
function ResponseWave() {
  const [phase, setPhase] = useState(0);
  const [hBar, setHBar] = useState<number | null>(null);
  const phaseRef = useRef(0);
  const rafRef = useRef<number>(0);
  const { ref, inView } = useInView(0.3);

  useEffect(() => {
    if (!inView) return;
    const tick = () => {
      phaseRef.current += 0.025;
      setPhase(phaseRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView]);

  const bars = [38, 55, 48, 72, 65, 88, 74, 92, 80, 96, 85, 100];

  // Wave overlay on bars
  const waveOffset = (i: number) => Math.sin(phase + i * 0.6) * 5;

  return (
    <div ref={ref} style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "20px", padding: "1.75rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.26em", color: "var(--muted-foreground)", marginBottom: "6px" }}>Responses · 30 days</div>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "2.4rem", color: "var(--foreground)", lineHeight: 1 }}>
            {inView ? <Counter to={2847} /> : "0"}
          </div>
          <div style={{ fontSize: "12px", color: "#7EB884", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            <TrendingUp style={{ width: 12, height: 12 }} /> +18.4% this month
          </div>
        </div>
        <div style={{ background: "rgba(126,184,132,0.12)", border: "1px solid rgba(126,184,132,0.2)", borderRadius: "10px", padding: "5px 10px", fontSize: "11px", color: "#7EB884" }}>● Live</div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "90px", position: "relative" }}>
        {/* Wave SVG overlay */}
        <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }} viewBox="0 0 240 90" preserveAspectRatio="none">
          <path
            d={`M0,${55 + waveOffset(0)} ${bars.map((b, i) => `L${i * 20 + 10},${90 - b * 0.75 + waveOffset(i)}`).join(" ")} L240,90 L0,90 Z`}
            fill="rgba(200,155,99,0.05)" stroke="rgba(200,155,99,0.2)" strokeWidth="1"
          />
        </svg>

        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, position: "relative", height: "100%", display: "flex", alignItems: "flex-end" }}
            onMouseEnter={() => setHBar(i)} onMouseLeave={() => setHBar(null)}>
            <div style={{
              width: "100%",
              height: inView ? `${Math.max(8, h + waveOffset(i))}%` : "0%",
              borderRadius: "3px 3px 2px 2px",
              background: hBar === i ? "#C89B63" : i === bars.length - 1
                ? "linear-gradient(180deg, #C89B63 0%, #7A5A35 100%)"
                : "rgba(200,155,99,0.22)",
              transition: `height 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 35}ms, background 0.2s`,
            }} />
            {hBar === i && (
              <div style={{ position: "absolute", bottom: "108%", left: "50%", transform: "translateX(-50%)", background: "#C89B63", color: "#0B0B0C", fontSize: "10px", borderRadius: "5px", padding: "2px 6px", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {[["Completion", "91%"], ["Avg. time", "2m 3s"], ["Drop-off", "9%"]].map(([k, v]) => (
          <div key={k} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", color: "var(--foreground)" }}>{v}</div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted-foreground)", marginTop: "2px" }}>{k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   HERO FORM CARD (unchanged from original)
══════════════════════════════════════════════════ */
function HeroFormCard() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    { type: "choice", question: "What best describes your team?", sub: "We'll tailor EdinForm to your workflow.", options: ["Product & Design", "Research & UX", "Marketing", "Operations"] },
    { type: "rating", question: "How satisfied are you with your current form tool?", sub: "1 = very unhappy, 5 = completely satisfied" },
    { type: "text",   question: "What's one thing your current tool gets wrong?", sub: "Be honest — this helps us build better." },
  ];

  const current = steps[step]!;
  const canContinue =
    (current.type === "choice" && selected !== null) ||
    (current.type === "rating" && rating !== null) ||
    (current.type === "text" && typed.trim().length > 0);

  function handleNext() {
    if (step < steps.length - 1) { setStep(s => s + 1); setSelected(null); setRating(null); setTyped(""); }
    else setSubmitted(true);
  }

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "24px", overflow: "hidden", backdropFilter: "blur(24px)", boxShadow: "0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(200,155,99,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["rgba(255,99,99,0.45)", "rgba(255,200,50,0.45)", "rgba(50,205,80,0.45)"].map((c, i) => (
            <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--muted-foreground)" }}>edinform.io · live preview</span>
        <div style={{ display: "flex", gap: "4px" }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 16 : 6, height: 6, borderRadius: "999px", background: i < step ? "#7EB884" : i === step ? "#C89B63" : "rgba(255,255,255,0.12)", transition: "all 0.3s" }} />
          ))}
        </div>
      </div>

      <div style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
        <div style={{ height: "100%", width: submitted ? "100%" : `${(step / steps.length) * 100}%`, background: "linear-gradient(90deg, #C89B63, #8B6540)", transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>

      <div style={{ padding: "2rem 2rem 1.75rem" }}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(126,184,132,0.15)", border: "1px solid rgba(126,184,132,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <CheckCircle2 style={{ width: 26, height: 26, color: "#7EB884" }} />
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600, marginBottom: "8px", color: "var(--foreground)" }}>Thanks for trying it out!</h3>
            <p style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: "1.5rem" }}>That was a live EdinForm — clean, fast, distraction-free.</p>
            <button onClick={() => { setStep(0); setSubmitted(false); setSelected(null); setRating(null); setTyped(""); }} style={{ borderRadius: "999px", padding: "9px 20px", fontSize: "13px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--foreground)", cursor: "pointer" }}>Try again ↩</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.24em", color: "#C89B63", fontWeight: 700, marginBottom: "10px" }}>Question {step + 1} of {steps.length}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.35, color: "var(--foreground)", marginBottom: "5px" }}>{current.question}</h3>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{current.sub}</p>
            </div>

            {current.type === "choice" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.5rem" }}>
                {current.options!.map(opt => (
                  <button key={opt} onClick={() => setSelected(opt)} style={{ textAlign: "left", padding: "10px 14px", borderRadius: "12px", border: "1px solid " + (selected === opt ? "rgba(200,155,99,0.5)" : "rgba(255,255,255,0.08)"), background: selected === opt ? "rgba(200,155,99,0.10)" : "rgba(255,255,255,0.02)", color: selected === opt ? "#C89B63" : "rgba(255,255,255,0.8)", fontSize: "13px", fontWeight: selected === opt ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.18s" }}>
                    {opt}{selected === opt && <Check style={{ width: 14, height: 14 }} />}
                  </button>
                ))}
              </div>
            )}

            {current.type === "rating" && (
              <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "8px" }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setRating(n)} style={{ width: 48, height: 48, borderRadius: "14px", border: "1px solid " + (rating !== null && n <= rating ? "rgba(200,155,99,0.5)" : "rgba(255,255,255,0.08)"), background: rating !== null && n <= rating ? "rgba(200,155,99,0.15)" : "rgba(255,255,255,0.03)", color: rating !== null && n <= rating ? "#C89B63" : "rgba(255,255,255,0.5)", fontSize: "16px", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, cursor: "pointer", transition: "all 0.15s", transform: rating === n ? "scale(1.12)" : "scale(1)" }}>{n}</button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted-foreground)", padding: "0 4px" }}>
                  <span>Very unhappy</span><span>Completely satisfied</span>
                </div>
              </div>
            )}

            {current.type === "text" && (
              <textarea value={typed} onChange={e => setTyped(e.target.value)} placeholder="Write your answer here…" rows={3}
                style={{ width: "100%", borderRadius: "12px", padding: "12px 14px", border: "1px solid " + (typed ? "rgba(200,155,99,0.3)" : "rgba(255,255,255,0.08)"), background: "rgba(255,255,255,0.03)", color: "var(--foreground)", fontSize: "13px", resize: "none", lineHeight: 1.6, outline: "none", transition: "border-color 0.2s", marginBottom: "1.5rem", boxSizing: "border-box" }} />
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--muted-foreground)" }}>{step + 1} / {steps.length}</span>
              <button onClick={handleNext} disabled={!canContinue} style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "999px", padding: "9px 20px", fontSize: "13px", background: canContinue ? "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)" : "rgba(255,255,255,0.06)", color: canContinue ? "#0B0B0C" : "rgba(255,255,255,0.25)", border: "none", cursor: canContinue ? "pointer" : "default", fontWeight: 700, transition: "all 0.2s", transform: canContinue ? "scale(1)" : "scale(0.97)" }}>
                {step === steps.length - 1 ? "Submit" : "Continue"}<ArrowRight style={{ width: 13, height: 13 }} />
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "11px", color: "var(--muted-foreground)" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#7EB884", boxShadow: "0 0 6px #7EB88488" }} />
        Powered by EdinForm · Free to build
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   LIVE DEMO FORM (unchanged from original)
══════════════════════════════════════════════════ */
function LiveDemoForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const questions = [
    { id: "role", type: "choice", tag: "About you", question: "What's your primary role?", sub: "This helps us show you the most relevant features.", options: ["Product Manager", "Designer", "Developer", "Researcher", "Marketer", "Founder / CEO"] },
    { id: "tool", type: "choice", tag: "Current setup", question: "Which form tool are you currently using?", sub: "Don't worry — we'll convince you to switch.", options: ["Google Forms", "Tally", "Jotform", "Airtable Forms", "None yet", "Other"] },
    { id: "pain", type: "multiline", tag: "The problem", question: "What's the biggest frustration with your current setup?", sub: "Be blunt — we read every answer.", placeholder: "e.g. Ugly, logic is confusing, responses are hard to read…" },
    { id: "frequency", type: "scale", tag: "Usage", question: "How often does your team create or update forms?", sub: "We want to understand your workflow rhythm.", options: ["Rarely", "Monthly", "Weekly", "Multiple times/week", "Daily"] },
    { id: "priority", type: "choice", tag: "What matters most", question: "Which matters most in a form tool?", sub: "Pick the single most important factor.", options: ["Ease of use", "Design quality", "Logic & branching", "Analytics depth", "Integrations", "Price"] },
    { id: "email", type: "email", tag: "Stay in the loop", question: "Where should we send your personalised EdinForm walkthrough?", sub: "One email, no spam, unsubscribe any time.", placeholder: "you@company.com" },
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
    setTimeout(() => { if (step < questions.length - 1) setStep(s => s + 1); else setSubmitted(true); setTransitioning(false); }, 220);
  }
  function goPrev() {
    if (step === 0) return;
    setTransitioning(true);
    setTimeout(() => { setStep(s => s - 1); setTransitioning(false); }, 220);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-start" }}>
      <div style={{ flex: "1 1 420px", minWidth: 0 }}>
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {["rgba(255,99,99,0.4)", "rgba(255,200,50,0.4)", "rgba(50,205,80,0.4)"].map((c, i) => <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
            </div>
            <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--muted-foreground)" }}>edinform.io/demo/product-feedback</span>
            <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{step + 1} / {questions.length}</span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.05)" }}>
            <div style={{ height: "100%", width: submitted ? "100%" : `${progress}%`, background: "linear-gradient(90deg, #C89B63, #D4A96A)", transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)", borderRadius: "0 999px 999px 0" }} />
          </div>
          <div style={{ padding: "2.5rem 2rem 2rem", opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(8px)" : "translateY(0)", transition: "opacity 0.22s ease, transform 0.22s ease" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "1.5rem 0 2rem" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, rgba(200,155,99,0.2), rgba(126,184,132,0.15))", border: "1px solid rgba(200,155,99,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", boxShadow: "0 0 40px rgba(200,155,99,0.15)" }}>
                  <CheckCircle2 style={{ width: 28, height: 28, color: "#C89B63" }} />
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 700, marginBottom: "10px", color: "var(--foreground)" }}>You're all set.</h3>
                <p style={{ fontSize: "14px", color: "var(--muted-foreground)", lineHeight: 1.75, marginBottom: "1.75rem", maxWidth: "36ch", margin: "0 auto 1.75rem" }}>We've received your answers. In the meantime — your first form is one click away.</p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/auth/register" style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "999px", padding: "10px 22px", fontSize: "13px", background: "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)", color: "#0B0B0C", textDecoration: "none", fontWeight: 700 }}>Start building free <ArrowRight style={{ width: 13, height: 13 }} /></Link>
                  <button onClick={() => { setStep(0); setAnswers({}); setSubmitted(false); }} style={{ borderRadius: "999px", padding: "10px 18px", fontSize: "13px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--muted-foreground)", cursor: "pointer" }}>↩ Start over</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "1.75rem" }}>
                  <div style={{ display: "inline-block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.22em", color: "#C89B63", fontWeight: 700, marginBottom: "12px", background: "rgba(200,155,99,0.10)", padding: "3px 10px", borderRadius: "999px" }}>{current.tag}</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)", fontWeight: 600, lineHeight: 1.3, color: "var(--foreground)", marginBottom: "6px" }}>{current.question}</h3>
                  <p style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.6 }}>{current.sub}</p>
                </div>

                {current.type === "choice" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "2rem" }}>
                    {current.options!.map(opt => {
                      const active = answer === opt;
                      return (
                        <button key={opt} onClick={() => setAnswers(a => ({ ...a, [current.id]: opt }))}
                          style={{ textAlign: "left", padding: "11px 16px", borderRadius: "12px", border: "1px solid " + (active ? "rgba(200,155,99,0.55)" : "rgba(255,255,255,0.07)"), background: active ? "rgba(200,155,99,0.10)" : "rgba(255,255,255,0.02)", color: active ? "#C89B63" : "rgba(255,255,255,0.75)", fontSize: "13px", fontWeight: active ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s" }}>
                          {opt}{active && <CheckCircle2 style={{ width: 15, height: 15, flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {current.type === "scale" && (
                  <div style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {current.options!.map(opt => {
                        const active = answer === opt;
                        return (
                          <button key={opt} onClick={() => setAnswers(a => ({ ...a, [current.id]: opt }))}
                            style={{ flex: "1 1 80px", padding: "10px 8px", borderRadius: "12px", textAlign: "center", border: "1px solid " + (active ? "rgba(200,155,99,0.55)" : "rgba(255,255,255,0.07)"), background: active ? "rgba(200,155,99,0.10)" : "rgba(255,255,255,0.02)", color: active ? "#C89B63" : "rgba(255,255,255,0.65)", fontSize: "12px", fontWeight: active ? 700 : 400, cursor: "pointer", transition: "all 0.15s" }}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {current.type === "multiline" && (
                  <textarea value={typeof answer === "string" ? answer : ""} onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))} placeholder={current.placeholder} rows={4} autoFocus
                    style={{ width: "100%", borderRadius: "14px", padding: "14px 16px", border: "1px solid " + (answer ? "rgba(200,155,99,0.35)" : "rgba(255,255,255,0.08)"), background: "rgba(255,255,255,0.03)", color: "var(--foreground)", fontSize: "14px", resize: "none", lineHeight: 1.65, outline: "none", transition: "border-color 0.2s", marginBottom: "2rem", boxSizing: "border-box" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(200,155,99,0.5)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = answer ? "rgba(200,155,99,0.35)" : "rgba(255,255,255,0.08)"; }}
                  />
                )}

                {current.type === "email" && (
                  <div style={{ marginBottom: "2rem" }}>
                    <input type="email" value={typeof answer === "string" ? answer : ""} onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))} placeholder={current.placeholder} autoFocus onKeyDown={e => { if (e.key === "Enter") goNext(); }}
                      style={{ width: "100%", borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "var(--foreground)", fontSize: "15px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(200,155,99,0.5)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                    />
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "8px" }}>One email, no drip sequences.</p>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <button onClick={goPrev} disabled={step === 0} style={{ padding: "9px 16px", borderRadius: "999px", fontSize: "13px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: step === 0 ? "rgba(255,255,255,0.2)" : "var(--muted-foreground)", cursor: step === 0 ? "default" : "pointer", transition: "all 0.15s" }}>← Back</button>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {questions.map((_, i) => (
                      <div key={i} style={{ width: i === step ? 18 : 6, height: 6, borderRadius: "999px", background: i < step ? "#7EB884" : i === step ? "#C89B63" : "rgba(255,255,255,0.1)", transition: "all 0.3s" }} />
                    ))}
                  </div>
                  <button onClick={goNext} disabled={!canAdvance} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 22px", borderRadius: "999px", fontSize: "13px", background: canAdvance ? "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)" : "rgba(255,255,255,0.05)", border: "none", color: canAdvance ? "#0B0B0C" : "rgba(255,255,255,0.2)", cursor: canAdvance ? "pointer" : "default", fontWeight: 700, transition: "all 0.2s", boxShadow: canAdvance ? "0 4px 16px rgba(200,155,99,0.3)" : "none" }}>
                    {step === questions.length - 1 ? "Submit" : "Next"}<ArrowRight style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: "0 1 280px", minWidth: 220 }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "1.5rem", position: "sticky", top: "80px" }}>
          <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.24em", color: "var(--muted-foreground)", marginBottom: "1.25rem", fontWeight: 600 }}>Your answers so far</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {questions.map((q, i) => {
              const ans = answers[q.id];
              const done = !!ans;
              const isCurrent = i === step && !submitted;
              return (
                <div key={q.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px", opacity: i > step && !submitted ? 0.35 : 1, transition: "opacity 0.3s" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: "1px", display: "flex", alignItems: "center", justifyContent: "center", background: done || submitted ? "rgba(126,184,132,0.15)" : isCurrent ? "rgba(200,155,99,0.15)" : "rgba(255,255,255,0.04)", border: "1px solid " + (done || submitted ? "rgba(126,184,132,0.3)" : isCurrent ? "rgba(200,155,99,0.35)" : "rgba(255,255,255,0.08)") }}>
                    {done || submitted ? <Check style={{ width: 10, height: 10, color: "#7EB884" }} /> : <span style={{ width: 5, height: 5, borderRadius: "50%", background: isCurrent ? "#C89B63" : "rgba(255,255,255,0.2)" }} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "11px", color: "var(--muted-foreground)", marginBottom: "2px" }}>{q.tag}</div>
                    {ans ? <div style={{ fontSize: "12px", color: "var(--foreground)", fontWeight: 500, wordBreak: "break-word", lineHeight: 1.4 }}>{q.type === "email" ? "✉ " : ""}{String(ans).length > 40 ? String(ans).slice(0, 40) + "…" : String(ans)}</div>
                    : <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>{isCurrent ? "answering now…" : "not yet answered"}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
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

  useEffect(() => { setLoggedIn(isAuthenticated()); }, []);
  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const ctaHref = loggedIn ? "/dashboard" : "/auth/register";

  const faqs = [
    { q: "Is EdinForm free to start?", a: "Yes — the free plan gives you unlimited forms with up to 100 responses per month. No credit card required, no time limit." },
    { q: "Can I embed forms on my website?", a: "Absolutely. EdinForm generates a lightweight embed snippet you can drop into any HTML page, React app, or website builder." },
    { q: "How does branching logic work?", a: "You define rules on any field: 'if the answer is X, skip to question Y'. Build decision trees visually without writing code." },
    { q: "Is my respondents' data secure?", a: "All data is encrypted in transit and at rest. We're GDPR-compliant and never sell or share your respondents' data." },
    { q: "Can I export my responses?", a: "Yes — export to CSV or JSON at any time from your dashboard. Webhook integrations are available on paid plans." },
  ];

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", background: "var(--background)", color: "var(--foreground)" }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid " + (navScrolled ? "rgba(200,155,99,0.12)" : "transparent"), backdropFilter: navScrolled ? "blur(20px)" : "none", background: navScrolled ? "rgba(11,11,12,0.88)" : "transparent", transition: "all 0.3s" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", height: "64px", alignItems: "center", justifyContent: "space-between" }}>
            <EdinFormLogo />
            <div style={{ display: "flex", gap: "2rem", fontSize: "14px", color: "var(--muted-foreground)", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.04em" }} className="hidden-mobile">
              {[{ l: "Features", h: "#features" }, { l: "How it works", h: "#how" }, { l: "Pricing", h: "/pricing" }, { l: "Templates", h: "/explore" }].map(({ l, h }) => (
                <a key={l} href={h} style={{ textDecoration: "none", color: "inherit", transition: "color 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#C89B63"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ""; }}>{l}</a>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {loggedIn ? (
                <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "999px", padding: "8px 20px", fontSize: "13px", background: "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)", color: "#0B0B0C", textDecoration: "none", fontWeight: 700 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}>
                  Open dashboard <ArrowUpRight style={{ width: 13, height: 13 }} />
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" style={{ padding: "8px 16px", fontSize: "13px", color: "var(--muted-foreground)", textDecoration: "none", borderRadius: "999px", fontFamily: "'Cormorant Garamond', serif" }} className="hidden-mobile">Sign in</Link>
                  <Link href="/auth/register" style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "999px", padding: "8px 20px", fontSize: "13px", background: "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)", color: "#0B0B0C", textDecoration: "none", fontWeight: 700 }}>Start free</Link>
                </>
              )}
              <button onClick={() => setNavOpen(v => !v)} className="show-mobile" style={{ width: 36, height: 36, borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--foreground)" }}>
                {navOpen ? <X style={{ width: 16, height: 16 }} /> : <Menu style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>
          <div style={{ maxHeight: navOpen ? "360px" : "0", overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)" }}>
            <div style={{ paddingBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "2px" }}>
              {[{ l: "Features", h: "#features" }, { l: "How it works", h: "#how" }, { l: "Pricing", h: "/pricing" }, { l: "Templates", h: "/explore" }].map(({ l, h }) => (
                <a key={l} href={h} style={{ padding: "10px 4px", fontSize: "16px", color: "var(--foreground)", textDecoration: "none" }}>{l}</a>
              ))}
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
              <Link href="/auth/login" style={{ padding: "10px 4px", fontSize: "15px", color: "var(--muted-foreground)", textDecoration: "none" }}>Sign in</Link>
              <Link href="/auth/register" style={{ marginTop: "4px", borderRadius: "12px", padding: "12px 16px", textAlign: "center", background: "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)", color: "#0B0B0C", textDecoration: "none", fontWeight: 700, fontSize: "15px" }}>Start free — no card needed</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ position: "relative", overflow: "hidden", padding: "4rem 1.5rem 0" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(200,155,99,0.09) 0%, transparent 65%)" }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Top text */}
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(200,155,99,0.10)", border: "1px solid rgba(200,155,99,0.22)", borderRadius: "999px", padding: "5px 14px", marginBottom: "2rem", fontSize: "12px", fontWeight: 600, color: "#C89B63", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.06em", animation: "fadeUp 0.6s ease both" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C89B63", boxShadow: "0 0 8px #C89B6388" }} />
              Precision-crafted in Edinburgh
              <ArrowRight style={{ width: 12, height: 12 }} />
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(3rem, 7vw, 6.5rem)",
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              fontWeight: 700,
              color: "var(--foreground)",
              animation: "fadeUp 0.7s ease 0.1s both",
              marginBottom: "1.5rem",
            }}>
              Ask better<br />
              <em style={{ color: "#C89B63", fontStyle: "italic" }}>questions.</em>
            </h1>

            <p style={{
              maxWidth: "54ch",
              margin: "0 auto 2.25rem",
              fontSize: "clamp(15px, 1.6vw, 18px)",
              lineHeight: 1.8,
              color: "var(--muted-foreground)",
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              animation: "fadeUp 0.7s ease 0.2s both",
              letterSpacing: "0.01em",
            }}>
              EdinForm is the form builder for teams who care about the quality of every conversation. Adaptive logic, live analytics, and a respondent experience that's quietly exceptional — like the city that inspired its name.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", justifyContent: "center", animation: "fadeUp 0.7s ease 0.3s both", marginBottom: "2.5rem" }}>
              <Link href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "999px", padding: "13px 28px", fontSize: "15px", background: "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)", color: "#0B0B0C", textDecoration: "none", fontWeight: 700, boxShadow: "0 4px 20px rgba(200,155,99,0.30)", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.03em", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(200,155,99,0.45)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(200,155,99,0.30)"; }}>
                Build your first form — free <ArrowRight style={{ width: 15, height: 15 }} />
              </Link>
              <Link href="#demo" style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "999px", padding: "13px 22px", fontSize: "15px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "var(--foreground)", textDecoration: "none", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.03em", transition: "background 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}>
                <Play style={{ width: 13, height: 13, fill: "currentColor" }} /> See a live demo
              </Link>
            </div>

            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1.5rem", fontSize: "13px", color: "var(--muted-foreground)", animation: "fadeUp 0.7s ease 0.4s both", fontFamily: "'Cormorant Garamond', serif" }}>
              {["Free plan forever", "No credit card needed", "GDPR compliant", "Trusted by 8,400+ teams"].map(t => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Check style={{ width: 12, height: 12, color: "#7EB884" }} /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Edinburgh Skyline — full width */}
          <div style={{ animation: "fadeUp 0.9s ease 0.35s both", marginBottom: "0" }}>
            <EdinburghSkylineHero />
          </div>

          {/* Horizontal two-col below skyline */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem", padding: "4rem 0 5rem", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 380px", minWidth: 0, animation: "fadeUp 0.8s ease 0.5s both" }}>
              <HeroFormCard />
            </div>
            <div style={{ flex: "1 1 340px", minWidth: 0, animation: "fadeUp 0.8s ease 0.6s both" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", marginBottom: "10px", fontFamily: "monospace" }}>Form lifecycle</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "10px" }}>From draft to data in minutes.</h2>
                <p style={{ fontSize: "14px", lineHeight: 1.75, color: "var(--muted-foreground)", fontFamily: "'Cormorant Garamond', serif" }}>The form on the left is live — fill it out and see EdinForm from your respondents' perspective. Everything from field focus to progress animation is intentional.</p>
              </div>
              <FormFlowDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how" style={{ padding: "6rem 1.5rem", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "12px", fontFamily: "monospace" }}>How it works</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, marginBottom: "1rem" }}>From idea to insights in four steps.</h2>
              <p style={{ maxWidth: "48ch", margin: "0 auto", fontSize: "16px", lineHeight: 1.75, color: "var(--muted-foreground)", fontFamily: "'Cormorant Garamond', serif" }}>EdinForm removes every unnecessary step between asking a question and understanding the answer.</p>
            </div>
          </Reveal>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", marginTop: "1.5rem" }}>
            {[
              { n: "01", title: "Draft your form", body: "Choose from 9 field types — short text, long text, multiple choice, rating, date picker, file upload, email, number, and scale. Reorder with drag-and-drop.", color: "#C89B63" },
              { n: "02", title: "Add logic & branching", body: "Define skip logic and conditional display rules. Respondents get a path tailored to their answers. Works on any field, no code required.", color: "#7EB884" },
              { n: "03", title: "Publish in one click", body: "Generate a shareable URL, embed snippet, or QR code. Your form works on any device, in any browser, no account needed for respondents.", color: "#6B9ECC" },
              { n: "04", title: "Read and act on replies", body: "Responses appear in real time. Filter, search, export to CSV. View aggregate charts or individual submissions — your data, your way.", color: "#C89B63" },
            ].map(({ n, title, body, color }, i) => (
              <Reveal key={n} delay={i * 60} style={{ flex: "1 1 220px", minWidth: "200px" }}>
                <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.75rem", transition: "transform 0.3s, box-shadow 0.3s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${color}22`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", color, marginBottom: "12px", letterSpacing: "0.2em" }}>{n}</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px", color: "var(--foreground)" }}>{title}</h3>
                  <p style={{ fontSize: "14px", lineHeight: 1.65, color: "var(--muted-foreground)", fontFamily: "'Cormorant Garamond', serif" }}>{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BRANCHING VISUALISER ══ */}
      <section style={{ padding: "6rem 1.5rem", borderTop: "1px solid var(--border)", background: "rgba(200,155,99,0.015)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "flex-start" }}>
            <Reveal style={{ flex: "1 1 300px" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#7EB884", fontWeight: 600, marginBottom: "12px", fontFamily: "monospace" }}>Conditional logic</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "1.25rem" }}>Forms that listen and adapt.</h2>
              <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)", marginBottom: "1.5rem", fontFamily: "'Cormorant Garamond', serif" }}>
                A single form that shows different questions to different people. With EdinForm, you set simple if/then rules on any field. The form adapts in real time — showing only what matters to each respondent.
              </p>
              <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)", fontFamily: "'Cormorant Garamond', serif" }}>
                The result: shorter, more relevant forms. Higher completion rates. Better data quality. Less cleanup on your end.
              </p>
            </Reveal>
            <Reveal delay={120} style={{ flex: "1 1 380px" }}>
              <div style={{ background: "rgba(126,184,132,0.04)", border: "1px solid rgba(126,184,132,0.12)", borderRadius: "20px", padding: "1.75rem" }}>
                <BranchingVisualiser />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ LIVE DEMO ══ */}
      <section id="demo" style={{ padding: "7rem 1.5rem", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "12px", fontFamily: "monospace" }}>Try it now</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, marginBottom: "1rem" }}>A real EdinForm, live right here.</h2>
              <p style={{ maxWidth: "50ch", margin: "0 auto", fontSize: "16px", lineHeight: 1.75, color: "var(--muted-foreground)", fontFamily: "'Cormorant Garamond', serif" }}>This isn't a mockup. Every interaction — field focus, validation, progress, submission — is exactly what your respondents will experience.</p>
            </div>
          </Reveal>
          <Reveal delay={100}><LiveDemoForm /></Reveal>

          <Reveal delay={160}>
            <div style={{ marginTop: "2rem", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem", padding: "1.5rem 2rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px" }}>
              {[
                { icon: Zap, label: "Instant responses", desc: "Submissions appear in your dashboard in real time" },
                { icon: GitBranch, label: "Adaptive logic", desc: "Questions change based on previous answers" },
                { icon: Globe, label: "Works everywhere", desc: "Any device, any browser — no app needed" },
                { icon: BarChart3, label: "Built-in analytics", desc: "Completion rates, drop-off, and timing tracked automatically" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "10px", flex: "1 1 200px", maxWidth: "260px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "10px", flexShrink: 0, background: "rgba(200,155,99,0.10)", border: "1px solid rgba(200,155,99,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: 15, height: 15, color: "#C89B63" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)", marginBottom: "2px", fontFamily: "'Cormorant Garamond', serif" }}>{label}</div>
                    <div style={{ fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.5, fontFamily: "'Cormorant Garamond', serif" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexWrap: "wrap" }}>
          {[
            { raw: 10000, suffix: "+", label: "Forms created" },
            { raw: 1200000, suffix: "+", label: "Responses collected" },
            { raw: 99.9, suffix: "%", label: "Uptime SLA", fixed: 1 },
            { raw: 4.9, suffix: "/5", label: "Average rating", fixed: 1 },
          ].map(({ raw, suffix, label, fixed }, i) => (
            <Reveal key={label} delay={i * 80} style={{ flex: "1 1 180px", textAlign: "center", padding: "1.5rem", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "#C89B63", fontWeight: 700, lineHeight: 1 }}>
                {fixed !== undefined ? raw.toFixed(fixed) : <Counter to={raw} />}{suffix}
              </div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.24em", color: "var(--muted-foreground)", marginTop: "8px", fontFamily: "monospace" }}>{label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ ANALYTICS SECTION ══ */}
      <section style={{ padding: "7rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "flex-start" }}>
            <Reveal style={{ flex: "1 1 300px" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#6B9ECC", fontWeight: 600, marginBottom: "12px", fontFamily: "monospace" }}>Analytics</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "1.25rem" }}>Numbers that actually mean something.</h2>
              <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)", marginBottom: "1.5rem", fontFamily: "'Cormorant Garamond', serif" }}>EdinForm tracks the metrics that tell you whether your form is working — not just how many responses you received. See where respondents drop off, which questions take the longest to answer, and how completion rates change over time.</p>
              <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)", fontFamily: "'Cormorant Garamond', serif" }}>Export everything to CSV or JSON. Filter by date range, device type, or referrer. Build a picture of your audience — without leaving your dashboard.</p>
            </Reveal>
            <Reveal delay={120} style={{ flex: "1 1 360px" }}>
              <ResponseWave />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" style={{ padding: "7rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ marginBottom: "4rem" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "12px", fontFamily: "monospace" }}>Everything you need</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, maxWidth: "20ch", lineHeight: 1.15 }}>Built for the whole form lifecycle.</h2>
              <p style={{ maxWidth: "52ch", fontSize: "16px", lineHeight: 1.75, color: "var(--muted-foreground)", marginTop: "1rem", fontFamily: "'Cormorant Garamond', serif" }}>Most form tools stop at collecting responses. EdinForm goes further — giving you logic, analytics, collaboration, and integrations in one place.</p>
            </div>
          </Reveal>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
            {[
              { icon: Layers, n: "01", title: "Nine field types", body: "Short text, long text, multiple choice, checkboxes, rating scale, date picker, file upload, email validation, and number input — all styled consistently and accessible by default.", color: "#C89B63" },
              { icon: GitBranch, n: "02", title: "Conditional branching logic", body: "Skip irrelevant questions, show fields only when needed, redirect to custom endings. Build complex decision trees without writing a single line of code.", color: "#7EB884" },
              { icon: Eye, n: "03", title: "Live preview mode", body: "See your form exactly as respondents will — including all conditional logic paths — before you publish. Catch issues before they reach your audience.", color: "#6B9ECC" },
              { icon: BarChart3, n: "04", title: "Built-in analytics", body: "View total responses, completion rates, average time-to-complete, and drop-off points. Per-question summaries and response distribution charts included.", color: "#C89B63" },
              { icon: ShieldCheck, n: "05", title: "Spam protection & validation", body: "Rate limiting, honeypot fields, and email validation keep your data clean. Optional CAPTCHA integration available on all plans.", color: "#7EB884" },
              { icon: Share2, n: "06", title: "Flexible sharing", body: "Share a public link, restrict access with a password, or embed directly in your website. Generate QR codes for offline use. All responses stream in live.", color: "#6B9ECC" },
              { icon: Zap, n: "07", title: "Webhooks & integrations", body: "Fire a webhook on every submission. Connect to Zapier, Make, or direct REST endpoints to route responses wherever your workflow lives.", color: "#C89B63" },
              { icon: Users, n: "08", title: "Team collaboration", body: "Invite teammates as editors or viewers. Comment on questions, review drafts, and publish together — with full audit history on paid plans.", color: "#7EB884" },
              { icon: Globe, n: "09", title: "Custom domains & branding", body: "Serve forms from your own domain, swap the logo, customize the color palette and font. Your form should look like you, not like a form tool.", color: "#6B9ECC" },
            ].map(({ icon: Icon, n, title, body, color }, i) => (
              <Reveal key={n} delay={i * 50} style={{ flex: "1 1 280px" }}>
                <div style={{ padding: "1.75rem", borderRadius: "18px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", height: "100%", boxSizing: "border-box", transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px ${color}22`; (e.currentTarget as HTMLElement).style.borderColor = `${color}44`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; }}>
                  <div style={{ width: 40, height: 40, borderRadius: "12px", background: `${color}18`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                    <Icon style={{ width: 18, height: 18, color }} />
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.2em", marginBottom: "8px" }}>{n}</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontWeight: 700, marginBottom: "10px", color: "var(--foreground)" }}>{title}</h3>
                  <p style={{ fontSize: "14px", lineHeight: 1.65, color: "var(--muted-foreground)", fontFamily: "'Cormorant Garamond', serif" }}>{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ padding: "7rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "12px", fontFamily: "monospace" }}>What people say</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700 }}>Teams who switched, didn't look back.</h2>
            </div>
          </Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
            {[
              { q: "We replaced three different tools with EdinForm. It does everything, in one place, and it looks better than any of them.", name: "Isla M.", role: "Head of Research, DEPT®", stars: 5 },
              { q: "The branching logic is the best I've used. Building a path for yes/no answers used to take me 30 minutes. With EdinForm it takes 90 seconds.", name: "Marcus K.", role: "Product Designer, Mono", stars: 5 },
              { q: "Clients mention the forms. That never happened before. They say things like 'that felt polished'. That's EdinForm.", name: "Priya R.", role: "Studio Lead, Forma", stars: 5 },
              { q: "Completion rates went up 34% when we switched. I attribute most of that to the cleaner interface and conditional logic eliminating irrelevant questions.", name: "Tom H.", role: "Growth Lead, Layers", stars: 5 },
              { q: "The analytics are genuinely useful. I can see exactly where people abandon the form and fix it. Before EdinForm I was guessing.", name: "Sara L.", role: "UX Researcher, Craft", stars: 5 },
              { q: "We run all our user interviews through EdinForm now. The embed is clean and our completion rates reflect that.", name: "James O.", role: "Design Lead, Arc", stars: 5 },
            ].map(({ q, name, role, stars }, i) => (
              <Reveal key={name} delay={i * 50} style={{ flex: "1 1 280px" }}>
                <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "18px", padding: "1.75rem", height: "100%", boxSizing: "border-box", transition: "transform 0.3s, box-shadow 0.3s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(200,155,99,0.10)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                  <div style={{ display: "flex", gap: "2px", marginBottom: "1rem" }}>
                    {Array.from({ length: stars }).map((_, i) => <Star key={i} style={{ width: 13, height: 13, fill: "#C89B63", color: "#C89B63" }} />)}
                  </div>
                  <blockquote style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem", lineHeight: 1.6, color: "var(--foreground)", marginBottom: "1.5rem", fontStyle: "italic" }}>"{q}"</blockquote>
                  <div style={{ fontSize: "13px", color: "var(--muted-foreground)", fontFamily: "'Cormorant Garamond', serif" }}>
                    <span style={{ color: "var(--foreground)", fontWeight: 700 }}>{name}</span>
                    <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>{role}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section style={{ padding: "7rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "12px", fontFamily: "monospace" }}>FAQ</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>Common questions, answered plainly.</h2>
            </div>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {faqs.map(({ q, a }, i) => (
              <Reveal key={q} delay={i * 40}>
                <div style={{ borderRadius: "14px", border: "1px solid " + (activeFaq === i ? "rgba(200,155,99,0.3)" : "rgba(255,255,255,0.06)"), overflow: "hidden", transition: "border-color 0.3s" }}>
                  <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", background: "none", border: "none", cursor: "pointer", gap: "1rem", textAlign: "left" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 600, color: "var(--foreground)" }}>{q}</span>
                    <ChevronDown style={{ width: 18, height: 18, flexShrink: 0, color: "var(--muted-foreground)", transform: activeFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }} />
                  </button>
                  <div style={{ maxHeight: activeFaq === i ? "300px" : "0", overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)" }}>
                    <p style={{ padding: "0 1.5rem 1.25rem", fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)", fontFamily: "'Cormorant Garamond', serif" }}>{a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{ padding: "8rem 1.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(200,155,99,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <Reveal>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "1.5rem", fontFamily: "monospace" }}>Get started</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
              Your next great form<br />starts <em style={{ color: "#C89B63" }}>here.</em>
            </h2>
            <p style={{ maxWidth: "42ch", margin: "0 auto 2.5rem", fontSize: "17px", lineHeight: 1.8, color: "var(--muted-foreground)", fontFamily: "'Cormorant Garamond', serif" }}>
              Join thousands of teams using EdinForm to ask better questions and get cleaner answers. Free plan available — no credit card, no time limit, no catch.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginBottom: "2rem" }}>
              <Link href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "999px", padding: "14px 32px", fontSize: "16px", background: "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)", color: "#0B0B0C", textDecoration: "none", fontWeight: 700, boxShadow: "0 4px 24px rgba(200,155,99,0.35)", transition: "transform 0.2s, box-shadow 0.2s", fontFamily: "'Cormorant Garamond', serif" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(200,155,99,0.5)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(200,155,99,0.35)"; }}>
                Start building for free <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "999px", padding: "14px 28px", fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "var(--foreground)", textDecoration: "none", fontFamily: "'Cormorant Garamond', serif", transition: "background 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}>
                Browse templates
              </Link>
            </div>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1.5rem", fontSize: "13px", color: "var(--muted-foreground)", fontFamily: "'Cormorant Garamond', serif" }}>
              {["Free plan forever", "No credit card needed", "GDPR compliant", "Cancel anytime"].map(t => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Check style={{ width: 12, height: 12, color: "#7EB884" }} /> {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", marginBottom: "4rem" }}>
            <div style={{ flex: "2 1 260px" }}>
              <EdinFormLogo />
              <p style={{ marginTop: "1rem", maxWidth: "36ch", fontSize: "15px", lineHeight: 1.7, color: "var(--muted-foreground)", fontFamily: "'Cormorant Garamond', serif" }}>The form builder for teams who value experience. Build, publish, and analyze — in one calm, considered workspace.</p>
              <div style={{ marginTop: "1.25rem", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["GDPR", "SOC 2", "CCPA"].map(badge => (
                  <span key={badge} style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--muted-foreground)", fontFamily: "monospace" }}>{badge}</span>
                ))}
              </div>
            </div>
            {[
              { label: "Product", links: [{ t: "Features", h: "#features" }, { t: "Templates", h: "/explore" }, { t: "Pricing", h: "/pricing" }, { t: "Changelog", h: "/changelog" }] },
              { label: "Company", links: [{ t: "About", h: "/about" }, { t: "Blog", h: "/blog" }, { t: "Careers", h: "/careers" }, { t: "Contact", h: "/contact" }] },
              { label: "Legal", links: [{ t: "Privacy", h: "/privacy" }, { t: "Terms", h: "/terms" }, { t: "Security", h: "/security" }] },
            ].map(({ label, links }) => (
              <div key={label} style={{ flex: "1 1 120px" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.24em", color: "var(--muted-foreground)", fontWeight: 600, marginBottom: "1rem", fontFamily: "monospace" }}>{label}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {links.map(({ t, h }) => (
                    <li key={t}><a href={h} style={{ fontSize: "15px", color: "var(--muted-foreground)", textDecoration: "none", transition: "color 0.2s", fontFamily: "'Cormorant Garamond', serif" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#C89B63"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ""; }}>{t}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", fontSize: "13px", color: "var(--muted-foreground)", gap: "1rem", fontFamily: "'Cormorant Garamond', serif" }}>
            <span>© 2026 EdinForm. All rights reserved.</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7EB884" }} />
              All systems operational
            </span>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hidden-mobile { display: flex !important; }
        .show-mobile { display: none !important; }

        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        h1, h2, h3, h4 { margin: 0; }
        p { margin: 0; }
        ul { margin: 0; padding: 0; list-style: none; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(200,155,99,0.3); border-radius: 999px; }
      `}</style>
    </div>
  );
}
