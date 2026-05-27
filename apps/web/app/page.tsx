"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Check,
  Sparkles,
  ShieldCheck,
  Eye,
  Share2,
  GitBranch,
  BarChart3,
  Zap,
  Users,
  ChevronDown,
  Play,
  Star,
  TrendingUp,
  Clock,
  Globe,
  Lock,
  Layers,
  MousePointer2,
  FileText,
  CheckCircle2,
  MapPin,
  Castle,
  Mountain,
  Landmark,
} from "lucide-react";
import { isAuthenticated } from "~/lib/auth";
import { EdinFormLogo, EdinFormMark } from "~/components/brand/logo";

/* ─── useInView hook ─── */
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

/* ─── Reveal animation ─── */
function Reveal({ children, delay = 0, className = "", style = {} }: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Animated Counter ─── */
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
  return (
    <span ref={ref}>
      {fixed !== undefined ? to.toFixed(fixed) : val.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Flow Diagram ─── */
function FlowDiagram() {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActiveStep(s => (s + 1) % 4), 1800);
    return () => clearInterval(id);
  }, []);

  const steps = [
    { icon: FileText, label: "Draft", desc: "Build your form with 9 field types", color: "#C89B63" },
    { icon: Eye, label: "Preview", desc: "See it live before publishing", color: "#7C9EE8" },
    { icon: Globe, label: "Publish", desc: "Share a link or embed anywhere", color: "#6FCF97" },
    { icon: BarChart3, label: "Analyze", desc: "Read replies and export data", color: "#BB87E8" },
  ];

  return (
    <div style={{ padding: "2rem 0", position: "relative" }}>
      <div style={{
        position: "absolute", top: "50%", left: "10%", right: "10%", height: "2px",
        background: "linear-gradient(90deg, rgba(200,155,99,0.3), rgba(124,158,232,0.3), rgba(111,207,151,0.3), rgba(187,135,232,0.3))",
        transform: "translateY(-50%)", zIndex: 0,
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
        {steps.map(({ icon: Icon, label, desc, color }, i) => (
          <div key={label} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
            cursor: "pointer", flex: 1,
          }} onClick={() => setActiveStep(i)}>
            <div style={{
              width: 56, height: 56, borderRadius: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: activeStep === i ? color : "rgba(255,255,255,0.04)",
              border: `2px solid ${activeStep === i ? color : "rgba(255,255,255,0.1)"}`,
              boxShadow: activeStep === i ? `0 0 24px ${color}44` : "none",
              transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
              transform: activeStep === i ? "scale(1.12)" : "scale(1)",
            }}>
              <Icon style={{ width: 22, height: 22, color: activeStep === i ? "#0B0B0C" : color }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "13px", fontWeight: 600,
                color: activeStep === i ? color : "var(--foreground)",
                transition: "color 0.3s",
              }}>{label}</div>
              <div style={{
                fontSize: "11px", color: "var(--muted-foreground)",
                marginTop: "2px", maxWidth: "90px", lineHeight: 1.4,
                opacity: activeStep === i ? 1 : 0.5, transition: "opacity 0.3s",
              }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Analytics Mini Dashboard ─── */
function AnalyticsDashboard() {
  const bars = [42, 68, 55, 80, 72, 91, 63, 88, 76, 95, 83, 100];
  const [hovered, setHovered] = useState<number | null>(null);
  const { ref, inView } = useInView(0.3);

  return (
    <div ref={ref} style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "20px",
      padding: "1.75rem",
      backdropFilter: "blur(20px)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.24em", color: "var(--muted-foreground)", marginBottom: "6px" }}>Responses over time</div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "2.2rem", color: "var(--foreground)", lineHeight: 1 }}>
            {inView ? <Counter to={1284} /> : "0"}
          </div>
          <div style={{ fontSize: "12px", color: "#6FCF97", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            <TrendingUp style={{ width: 12, height: 12 }} /> +24% this week
          </div>
        </div>
        <div style={{
          background: "rgba(111,207,151,0.12)", border: "1px solid rgba(111,207,151,0.2)",
          borderRadius: "10px", padding: "6px 10px",
          fontSize: "12px", color: "#6FCF97",
        }}>Live</div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px" }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, position: "relative" }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <div style={{
              width: "100%",
              height: inView ? `${h}%` : "0%",
              borderRadius: "4px 4px 2px 2px",
              background: hovered === i
                ? "#C89B63"
                : i === bars.length - 1
                  ? "linear-gradient(180deg, #C89B63 0%, #8B6540 100%)"
                  : "rgba(200,155,99,0.25)",
              transition: `height 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 40}ms, background 0.2s`,
              cursor: "default",
            }} />
            {hovered === i && (
              <div style={{
                position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)",
                background: "#C89B63", color: "#0B0B0C", fontSize: "11px",
                borderRadius: "6px", padding: "3px 7px", whiteSpace: "nowrap", fontWeight: 600,
              }}>{h}</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {[["Completion", "92%"], ["Avg. time", "1m 47s"], ["Drop-off", "8%"]].map(([k, v]) => (
          <div key={k} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "var(--foreground)" }}>{v}</div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted-foreground)", marginTop: "2px" }}>{k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Form Builder Preview ─── */
function FormBuilderPreview() {
  const [activeField, setActiveField] = useState(0);
  const fields = ["Short text", "Long text", "Choice", "Rating", "Date", "File upload", "Email", "Number", "Scale"];

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "20px",
      overflow: "hidden",
      backdropFilter: "blur(20px)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px",
        background: "rgba(255,255,255,0.02)",
      }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["rgba(255,99,99,0.5)", "rgba(255,200,50,0.5)", "rgba(50,205,80,0.5)"].map((c, i) => (
            <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--muted-foreground)" }}>
          edinform.io / editor
        </span>
        <EdinFormMark size={18} />
      </div>

      <div style={{ display: "flex" }}>
        <div style={{ width: 140, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "16px 12px", flexShrink: 0 }}>
          <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--muted-foreground)", marginBottom: "10px", fontWeight: 600 }}>Field types</div>
          {fields.map((f, i) => (
            <div key={f}
              onClick={() => setActiveField(i)}
              style={{
                padding: "7px 10px", borderRadius: "8px",
                fontSize: "12px",
                color: activeField === i ? "#C89B63" : "rgba(255,255,255,0.7)",
                background: activeField === i ? "rgba(200,155,99,0.12)" : "transparent",
                cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "2px",
              }}>
              <span>{f}</span>
              {activeField === i && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C89B63" }} />}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, padding: "clamp(1rem, 3vw, 2rem)" }}>
          <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--muted-foreground)", marginBottom: "14px", fontWeight: 600 }}>Live canvas</div>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.5rem", marginBottom: "4px", color: "var(--foreground)", fontWeight: 400 }}>Customer feedback</h3>
          <p style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>Two minutes of your time means a lot to us.</p>

          <div style={{
            background: "rgba(200,155,99,0.06)", border: "1px solid rgba(200,155,99,0.25)",
            borderRadius: "12px", padding: "14px 16px", marginBottom: "12px",
          }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#C89B63", marginBottom: "8px", fontWeight: 600 }}>
              {fields[activeField]}
            </div>
            {activeField === 3 ? (
              <div style={{ display: "flex", gap: "6px" }}>
                {[1,2,3,4,5].map(n => (
                  <div key={n} style={{
                    width: 28, height: 28, borderRadius: "8px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: n <= 3 ? "rgba(200,155,99,0.25)" : "rgba(255,255,255,0.04)",
                    fontSize: "13px", color: n <= 3 ? "#C89B63" : "var(--muted-foreground)",
                    border: "1px solid " + (n <= 3 ? "rgba(200,155,99,0.4)" : "rgba(255,255,255,0.06)"),
                    fontWeight: 600, cursor: "pointer",
                  }}>{n}</div>
                ))}
              </div>
            ) : activeField === 2 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {["Option A", "Option B", "Option C"].map((o, i) => (
                  <span key={o} style={{
                    borderRadius: "999px", padding: "5px 12px",
                    fontSize: "12px",
                    background: i === 0 ? "rgba(200,155,99,0.2)" : "rgba(255,255,255,0.04)",
                    border: "1px solid " + (i === 0 ? "rgba(200,155,99,0.5)" : "rgba(255,255,255,0.08)"),
                    color: i === 0 ? "#C89B63" : "var(--muted-foreground)",
                    cursor: "pointer",
                  }}>{o}</span>
                ))}
              </div>
            ) : (
              <div style={{
                padding: "8px 12px", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                fontSize: "13px", color: "var(--muted-foreground)",
              }}>Type your answer…</div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--muted-foreground)" }}>Q 01 / 06</span>
            <button style={{
              background: "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)",
              border: "none", borderRadius: "999px", padding: "7px 18px",
              fontSize: "12px", fontWeight: 600,
              color: "#0B0B0C", cursor: "pointer",
            }}>Continue →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Logic / Branching Diagram ─── */
function BranchingDiagram() {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const nodes = [
    { id: "q1", x: 120, y: 30, label: "Do you use our product daily?", type: "question" },
    { id: "yes", x: 40, y: 110, label: "Yes →", type: "branch", color: "#6FCF97" },
    { id: "no", x: 200, y: 110, label: "No →", type: "branch", color: "#E87C7C" },
    { id: "q2a", x: 40, y: 180, label: "What's your #1 use case?", type: "question" },
    { id: "q2b", x: 200, y: 180, label: "What's stopping you?", type: "question" },
    { id: "end", x: 120, y: 260, label: "Thank you!", type: "end" },
  ];

  const edges = [
    { from: "q1", to: "yes" }, { from: "q1", to: "no" },
    { from: "yes", to: "q2a" }, { from: "no", to: "q2b" },
    { from: "q2a", to: "end" }, { from: "q2b", to: "end" },
  ];

  const getNode = (id: string) => nodes.find(n => n.id === id)!;

  return (
    <svg width="100%" viewBox="0 0 280 310" style={{ overflow: "visible" }}>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.2)" />
        </marker>
        <marker id="arrow-amber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#C89B63" />
        </marker>
      </defs>

      {edges.map(({ from, to }) => {
        const a = getNode(from); const b = getNode(to);
        const isActive = highlighted === from || highlighted === to;
        return (
          <line key={`${from}-${to}`}
            x1={a.x + 60} y1={a.y + 22} x2={b.x + 60} y2={b.y}
            stroke={isActive ? "#C89B63" : "rgba(255,255,255,0.12)"}
            strokeWidth={isActive ? 1.5 : 1}
            markerEnd={isActive ? "url(#arrow-amber)" : "url(#arrow)"}
            style={{ transition: "all 0.3s" }}
          />
        );
      })}

      {nodes.map(({ id, x, y, label, type, color }) => (
        <g key={id} transform={`translate(${x}, ${y})`}
          onMouseEnter={() => setHighlighted(id)}
          onMouseLeave={() => setHighlighted(null)}
          style={{ cursor: "pointer" }}>
          <rect width={120} height={28} rx={8}
            fill={highlighted === id
              ? (type === "branch" ? (color || "#C89B63") + "33" : "rgba(200,155,99,0.15)")
              : type === "end" ? "rgba(200,155,99,0.08)" : "rgba(255,255,255,0.04)"}
            stroke={highlighted === id ? (color || "#C89B63") : "rgba(255,255,255,0.1)"}
            strokeWidth={highlighted === id ? 1.5 : 1}
            style={{ transition: "all 0.25s" }}
          />
          <text x={60} y={18} textAnchor="middle"
            style={{
              fontSize: "9px", fontFamily: "'Inter', sans-serif",
              fill: type === "branch" ? (color || "#C89B63") : "rgba(255,255,255,0.8)",
              fontWeight: type === "branch" ? "700" : "400",
            }}>
            {label.length > 22 ? label.slice(0, 22) + "…" : label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Live Demo Form ─── */
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
      options: ["Product Manager", "Designer", "Developer", "Researcher", "Marketer", "Founder / CEO"],
    },
    {
      id: "tool",
      type: "choice",
      tag: "Current setup",
      question: "Which form tool are you currently using?",
      sub: "Don't worry — we'll convince you to switch.",
      options: ["Google Forms", "Typeform", "Tally", "Jotform", "Airtable Forms", "None yet"],
    },
    {
      id: "pain",
      type: "multiline",
      tag: "The problem",
      question: "What's the biggest frustration with your current setup?",
      sub: "Be blunt — we read every answer and use it to improve EdinForm.",
      placeholder: "e.g. It's ugly, logic is confusing, responses are hard to read…",
    },
    {
      id: "frequency",
      type: "scale",
      tag: "Usage",
      question: "How often does your team need to create or update forms?",
      sub: "We want to understand your workflow rhythm.",
      options: ["Rarely", "Monthly", "Weekly", "Multiple times a week", "Daily"],
    },
    {
      id: "priority",
      type: "choice",
      tag: "What matters most",
      question: "Which matters most to you in a form tool?",
      sub: "Pick the single most important factor.",
      options: ["Ease of use", "Design quality", "Logic & branching", "Analytics depth", "Integrations", "Price"],
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
  const progress = ((step) / questions.length) * 100;
  const answer = answers[current.id];
  const canAdvance =
    (current.type === "choice" && answer) ||
    (current.type === "scale" && answer) ||
    (current.type === "multiline" && typeof answer === "string" && answer.trim().length > 3) ||
    (current.type === "email" && typeof answer === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer));

  function goNext() {
    if (!canAdvance) return;
    setTransitioning(true);
    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep(s => s + 1);
      } else {
        setSubmitted(true);
      }
      setTransitioning(false);
    }, 220);
  }

  function goPrev() {
    if (step === 0) return;
    setTransitioning(true);
    setTimeout(() => { setStep(s => s - 1); setTransitioning(false); }, 220);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-start" }}>
      <div style={{ flex: "1 1 420px", minWidth: 0 }}>
        <div style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "24px", overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}>
          <div style={{
            padding: "12px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {["rgba(255,99,99,0.4)", "rgba(255,200,50,0.4)", "rgba(50,205,80,0.4)"].map((c, i) => (
                <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
              ))}
            </div>
            <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--muted-foreground)" }}>
              edinform.io/demo/product-feedback
            </span>
            <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
              {step + 1} / {questions.length}
            </span>
          </div>

          <div style={{ height: 3, background: "rgba(255,255,255,0.05)" }}>
            <div style={{
              height: "100%",
              width: submitted ? "100%" : `${progress}%`,
              background: "linear-gradient(90deg, #C89B63, #D4A96A)",
              transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
              borderRadius: "0 999px 999px 0",
            }} />
          </div>

          <div style={{
            padding: "2.5rem 2rem 2rem",
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 0.22s ease, transform 0.22s ease",
          }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "1.5rem 0 2rem" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(200,155,99,0.2), rgba(111,207,151,0.15))",
                  border: "1px solid rgba(200,155,99,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  boxShadow: "0 0 40px rgba(200,155,99,0.15)",
                }}>
                  <CheckCircle2 style={{ width: 28, height: 28, color: "#C89B63" }} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, marginBottom: "10px", color: "var(--foreground)" }}>
                  You're all set.
                </h3>
                <p style={{ fontSize: "14px", color: "var(--muted-foreground)", lineHeight: 1.75, marginBottom: "1.75rem", maxWidth: "36ch", margin: "0 auto 1.75rem" }}>
                  We've received your answers and will send a personalised walkthrough to your inbox. In the meantime — your first form is one click away.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/auth/register" style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    borderRadius: "999px", padding: "10px 22px", fontSize: "13px",
                    background: "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)",
                    color: "#0B0B0C", textDecoration: "none", fontWeight: 700,
                  }}>
                    Start building free <ArrowRight style={{ width: 13, height: 13 }} />
                  </Link>
                  <button onClick={() => { setStep(0); setAnswers({}); setSubmitted(false); }}
                    style={{
                      borderRadius: "999px", padding: "10px 18px", fontSize: "13px",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--muted-foreground)", cursor: "pointer",
                    }}>
                    ↩ Start over
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "1.75rem" }}>
                  <div style={{
                    display: "inline-block", fontSize: "10px", textTransform: "uppercase",
                    letterSpacing: "0.22em", color: "#C89B63", fontWeight: 700,
                    marginBottom: "12px",
                    background: "rgba(200,155,99,0.10)", padding: "3px 10px", borderRadius: "999px",
                  }}>
                    {current.tag}
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)", fontWeight: 600, lineHeight: 1.3, color: "var(--foreground)", marginBottom: "6px" }}>
                    {current.question}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                    {current.sub}
                  </p>
                </div>

                {current.type === "choice" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "2rem" }}>
                    {current.options!.map(opt => {
                      const active = answer === opt;
                      return (
                        <button key={opt}
                          onClick={() => setAnswers(a => ({ ...a, [current.id]: opt }))}
                          style={{
                            textAlign: "left", padding: "11px 16px", borderRadius: "12px",
                            border: "1px solid " + (active ? "rgba(200,155,99,0.55)" : "rgba(255,255,255,0.07)"),
                            background: active ? "rgba(200,155,99,0.10)" : "rgba(255,255,255,0.02)",
                            color: active ? "#C89B63" : "rgba(255,255,255,0.75)",
                            fontSize: "13px", fontWeight: active ? 600 : 400,
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                          onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}>
                          {opt}
                          {active && <CheckCircle2 style={{ width: 15, height: 15, flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {current.type === "scale" && (
                  <div style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {current.options!.map((opt, i) => {
                        const active = answer === opt;
                        return (
                          <button key={opt}
                            onClick={() => setAnswers(a => ({ ...a, [current.id]: opt }))}
                            style={{
                              flex: "1 1 80px", padding: "10px 8px", borderRadius: "12px", textAlign: "center",
                              border: "1px solid " + (active ? "rgba(200,155,99,0.55)" : "rgba(255,255,255,0.07)"),
                              background: active ? "rgba(200,155,99,0.10)" : "rgba(255,255,255,0.02)",
                              color: active ? "#C89B63" : "rgba(255,255,255,0.65)",
                              fontSize: "12px", fontWeight: active ? 700 : 400,
                              cursor: "pointer", transition: "all 0.15s",
                            }}>
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
                    onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))}
                    placeholder={current.placeholder}
                    rows={4}
                    autoFocus
                    style={{
                      width: "100%", borderRadius: "14px", padding: "14px 16px",
                      border: "1px solid " + (answer ? "rgba(200,155,99,0.35)" : "rgba(255,255,255,0.08)"),
                      background: "rgba(255,255,255,0.03)",
                      color: "var(--foreground)", fontSize: "14px",
                      resize: "none", lineHeight: 1.65, outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      marginBottom: "2rem", boxSizing: "border-box",
                      boxShadow: answer ? "0 0 0 3px rgba(200,155,99,0.08)" : "none",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(200,155,99,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(200,155,99,0.10)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = answer ? "rgba(200,155,99,0.35)" : "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                )}

                {current.type === "email" && (
                  <div style={{ marginBottom: "2rem" }}>
                    <input
                      type="email"
                      value={typeof answer === "string" ? answer : ""}
                      onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))}
                      placeholder={current.placeholder}
                      autoFocus
                      onKeyDown={e => { if (e.key === "Enter") goNext(); }}
                      style={{
                        width: "100%", borderRadius: "14px", padding: "14px 16px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--foreground)", fontSize: "15px",
                        outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                        boxSizing: "border-box",
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(200,155,99,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(200,155,99,0.10)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "8px" }}>
                      We respect your inbox. One email, no drip sequences.
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <button
                    onClick={goPrev}
                    disabled={step === 0}
                    style={{
                      padding: "9px 16px", borderRadius: "999px", fontSize: "13px",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      color: step === 0 ? "rgba(255,255,255,0.2)" : "var(--muted-foreground)",
                      cursor: step === 0 ? "default" : "pointer",
                      transition: "all 0.15s",
                    }}>
                    ← Back
                  </button>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {questions.map((_, i) => (
                      <div key={i} style={{
                        width: i === step ? 18 : 6, height: 6, borderRadius: "999px",
                        background: i < step ? "#6FCF97" : i === step ? "#C89B63" : "rgba(255,255,255,0.1)",
                        transition: "all 0.3s",
                      }} />
                    ))}
                  </div>
                  <button
                    onClick={goNext}
                    disabled={!canAdvance}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "9px 22px", borderRadius: "999px", fontSize: "13px",
                      background: canAdvance
                        ? "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)"
                        : "rgba(255,255,255,0.05)",
                      border: "none",
                      color: canAdvance ? "#0B0B0C" : "rgba(255,255,255,0.2)",
                      cursor: canAdvance ? "pointer" : "default",
                      fontWeight: 700,
                      transition: "all 0.2s",
                      boxShadow: canAdvance ? "0 4px 16px rgba(200,155,99,0.3)" : "none",
                    }}>
                    {step === questions.length - 1 ? "Submit" : "Next"}
                    <ArrowRight style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: "0 1 280px", minWidth: 220 }}>
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "20px", padding: "1.5rem",
          position: "sticky", top: "80px",
        }}>
          <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.24em", color: "var(--muted-foreground)", marginBottom: "1.25rem", fontWeight: 600 }}>
            Your answers so far
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {questions.map((q, i) => {
              const ans = answers[q.id];
              const done = !!ans;
              const isCurrent = i === step && !submitted;
              return (
                <div key={q.id} style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  opacity: i > step && !submitted ? 0.35 : 1,
                  transition: "opacity 0.3s",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: "1px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: done || submitted
                      ? "rgba(111,207,151,0.15)"
                      : isCurrent
                        ? "rgba(200,155,99,0.15)"
                        : "rgba(255,255,255,0.04)",
                    border: "1px solid " + (done || submitted ? "rgba(111,207,151,0.3)" : isCurrent ? "rgba(200,155,99,0.35)" : "rgba(255,255,255,0.08)"),
                  }}>
                    {done || submitted
                      ? <Check style={{ width: 10, height: 10, color: "#6FCF97" }} />
                      : <span style={{ width: 5, height: 5, borderRadius: "50%", background: isCurrent ? "#C89B63" : "rgba(255,255,255,0.2)" }} />
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "11px", color: "var(--muted-foreground)", marginBottom: "2px" }}>
                      {q.tag}
                    </div>
                    {ans ? (
                      <div style={{ fontSize: "12px", color: "var(--foreground)", fontWeight: 500, wordBreak: "break-word", lineHeight: 1.4 }}>
                        {q.type === "email" ? "✉ " : ""}{String(ans).length > 40 ? String(ans).slice(0, 40) + "…" : String(ans)}
                      </div>
                    ) : (
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>
                        {isCurrent ? "answering now…" : "not yet answered"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {Object.keys(answers).length > 0 && !submitted && (
            <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "11px", color: "var(--muted-foreground)", marginBottom: "6px" }}>Progress</div>
              <div style={{ height: 4, borderRadius: "999px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "999px",
                  width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                  background: "linear-gradient(90deg, #C89B63, #6FCF97)",
                  transition: "width 0.4s ease",
                }} />
              </div>
              <div style={{ fontSize: "11px", color: "#C89B63", marginTop: "5px", fontWeight: 600 }}>
                {Object.keys(answers).length} of {questions.length} answered
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Hero Right-side Form Card ─── */
function HeroFormCard() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    {
      type: "choice",
      question: "What best describes your team?",
      sub: "We'll tailor EdinForm to your workflow.",
      options: ["Product & Design", "Research & UX", "Marketing", "Operations"],
    },
    {
      type: "rating",
      question: "How satisfied are you with your current form tool?",
      sub: "1 = very unhappy, 5 = completely satisfied",
    },
    {
      type: "text",
      question: "What's one thing your current tool gets wrong?",
      sub: "Be honest — this helps us build better.",
    },
  ];

  const current = steps[step]!;

  const canContinue =
    (current.type === "choice" && selected !== null) ||
    (current.type === "rating" && rating !== null) ||
    (current.type === "text" && typed.trim().length > 0);

  function handleNext() {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
      setSelected(null);
      setRating(null);
      setTyped("");
    } else {
      setSubmitted(true);
    }
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: "24px",
      overflow: "hidden",
      backdropFilter: "blur(24px)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(200,155,99,0.08)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
      }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["rgba(255,99,99,0.45)", "rgba(255,200,50,0.45)", "rgba(50,205,80,0.45)"].map((c, i) => (
            <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.05em" }}>
          edinform.io · live preview
        </span>
        <div style={{ display: "flex", gap: "4px" }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 16 : 6, height: 6, borderRadius: "999px",
              background: i < step ? "#6FCF97" : i === step ? "#C89B63" : "rgba(255,255,255,0.12)",
              transition: "all 0.3s",
            }} />
          ))}
        </div>
      </div>

      <div style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
        <div style={{
          height: "100%",
          width: submitted ? "100%" : `${((step) / steps.length) * 100}%`,
          background: "linear-gradient(90deg, #C89B63, #8B6540)",
          transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>

      <div style={{ padding: "2rem 2rem 1.75rem" }}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(111,207,151,0.15)", border: "1px solid rgba(111,207,151,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.25rem",
            }}>
              <CheckCircle2 style={{ width: 26, height: 26, color: "#6FCF97" }} />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 600, marginBottom: "8px", color: "var(--foreground)" }}>
              Thanks for trying it out!
            </h3>
            <p style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              This was a live EdinForm form. You just experienced the respondent view — clean, fast, and distraction-free.
            </p>
            <button onClick={() => { setStep(0); setSubmitted(false); setSelected(null); setRating(null); setTyped(""); }}
              style={{
                borderRadius: "999px", padding: "9px 20px", fontSize: "13px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--foreground)", cursor: "pointer",
                transition: "background 0.2s",
              }}>
              Try again ↩
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.24em", color: "#C89B63", fontWeight: 700, marginBottom: "10px" }}>
                Question {step + 1} of {steps.length}
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.35, color: "var(--foreground)", marginBottom: "5px" }}>
                {current.question}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                {current.sub}
              </p>
            </div>

            {current.type === "choice" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.5rem" }}>
                {current.options!.map(opt => (
                  <button key={opt} onClick={() => setSelected(opt)}
                    style={{
                      textAlign: "left", padding: "10px 14px", borderRadius: "12px",
                      border: "1px solid " + (selected === opt ? "rgba(200,155,99,0.5)" : "rgba(255,255,255,0.08)"),
                      background: selected === opt ? "rgba(200,155,99,0.10)" : "rgba(255,255,255,0.02)",
                      color: selected === opt ? "#C89B63" : "rgba(255,255,255,0.8)",
                      fontSize: "13px", fontWeight: selected === opt ? 600 : 400,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                      transition: "all 0.18s",
                    }}>
                    {opt}
                    {selected === opt && <Check style={{ width: 14, height: 14 }} />}
                  </button>
                ))}
              </div>
            )}

            {current.type === "rating" && (
              <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "8px" }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setRating(n)}
                      style={{
                        width: 48, height: 48, borderRadius: "14px",
                        border: "1px solid " + (rating !== null && n <= rating ? "rgba(200,155,99,0.5)" : "rgba(255,255,255,0.08)"),
                        background: rating !== null && n <= rating ? "rgba(200,155,99,0.15)" : "rgba(255,255,255,0.03)",
                        color: rating !== null && n <= rating ? "#C89B63" : "rgba(255,255,255,0.5)",
                        fontSize: "16px", fontFamily: "'Playfair Display', serif", fontWeight: 700,
                        cursor: "pointer", transition: "all 0.15s",
                        transform: rating === n ? "scale(1.12)" : "scale(1)",
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted-foreground)", padding: "0 4px" }}>
                  <span>Very unhappy</span><span>Completely satisfied</span>
                </div>
              </div>
            )}

            {current.type === "text" && (
              <textarea
                value={typed}
                onChange={e => setTyped(e.target.value)}
                placeholder="Write your answer here…"
                rows={3}
                style={{
                  width: "100%", borderRadius: "12px", padding: "12px 14px",
                  border: "1px solid " + (typed ? "rgba(200,155,99,0.3)" : "rgba(255,255,255,0.08)"),
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--foreground)", fontSize: "13px",
                  resize: "none", lineHeight: 1.6, outline: "none",
                  transition: "border-color 0.2s",
                  marginBottom: "1.5rem", boxSizing: "border-box",
                }}
              />
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--muted-foreground)" }}>
                {step + 1} / {steps.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!canContinue}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  borderRadius: "999px", padding: "9px 20px", fontSize: "13px",
                  background: canContinue
                    ? "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)"
                    : "rgba(255,255,255,0.06)",
                  color: canContinue ? "#0B0B0C" : "rgba(255,255,255,0.25)",
                  border: "none", cursor: canContinue ? "pointer" : "default",
                  fontWeight: 700,
                  transition: "all 0.2s",
                  transform: canContinue ? "scale(1)" : "scale(0.97)",
                }}>
                {step === steps.length - 1 ? "Submit" : "Continue"}
                <ArrowRight style={{ width: 13, height: 13 }} />
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{
        padding: "10px 16px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
        fontSize: "11px", color: "var(--muted-foreground)",
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6FCF97", boxShadow: "0 0 6px #6FCF9788" }} />
        Powered by EdinForm · Free to build
      </div>
    </div>
  );
}

/* ─── Scotland & Europe Templates Section ─── */
function TemplatesSection() {
  const templates = [
    {
      id: "scotland-visitor",
      icon: Castle,
      accent: "#4A7C9E",
      accentBg: "rgba(74,124,158,0.10)",
      accentBorder: "rgba(74,124,158,0.25)",
      tag: "Tourism · Scotland",
      title: "Scotland Visitor Experience Survey",
      desc: "Collect feedback from tourists visiting Scotland — covering highlights, accommodation, transport, and what would bring them back. Includes branching logic for first-time vs. returning visitors.",
      questions: 8,
      est: "3 min",
      fields: ["Choice", "Rating", "Long text", "Scale"],
    },
    {
      id: "highland-event",
      icon: Mountain,
      accent: "#5C8A5A",
      accentBg: "rgba(92,138,90,0.10)",
      accentBorder: "rgba(92,138,90,0.25)",
      tag: "Events · Scotland",
      title: "Highland Games Registration Form",
      desc: "Full event sign-up form for Highland Games competitors and spectators. Captures participant category, age group, dietary requirements, and emergency contacts. Ready to embed on any event website.",
      questions: 10,
      est: "4 min",
      fields: ["Short text", "Choice", "Date", "Email"],
    },
    {
      id: "europe-travel",
      icon: Landmark,
      accent: "#8B6AC4",
      accentBg: "rgba(139,106,196,0.10)",
      accentBorder: "rgba(139,106,196,0.25)",
      tag: "Travel · Europe",
      title: "European City Break Preferences",
      desc: "A travel planning survey for teams, agencies, or individuals mapping out ideal European city breaks. Covers destination shortlists, travel style, budget range, and must-have experiences across the continent.",
      questions: 7,
      est: "3 min",
      fields: ["Choice", "Rating", "Scale", "Short text"],
    },
  ];

  return (
    <section style={{ padding: "7rem 1.5rem", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "1.5rem", marginBottom: "3.5rem" }}>
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "12px" }}>Featured templates</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "0.75rem" }}>
                Ready to use. Built for<br />Scotland & Europe.
              </h2>
              <p style={{ maxWidth: "48ch", fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)" }}>
                Start with a polished template and customise it in minutes. Every field, question, and logic path is fully editable.
              </p>
            </div>
            <Link href="/explore" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              borderRadius: "999px", padding: "10px 22px", fontSize: "13px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
              color: "var(--foreground)", textDecoration: "none", fontWeight: 500,
              transition: "background 0.2s", flexShrink: 0,
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}>
              Browse all templates <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
        </Reveal>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
          {templates.map(({ id, icon: Icon, accent, accentBg, accentBorder, tag, title, desc, questions, est, fields }, i) => (
            <Reveal key={id} delay={i * 80} style={{ flex: "1 1 300px" }}>
              <div style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "20px", overflow: "hidden",
                height: "100%", boxSizing: "border-box",
                display: "flex", flexDirection: "column",
                transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 48px ${accent}22`;
                  (e.currentTarget as HTMLElement).style.borderColor = `${accent}44`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                }}>

                {/* header stripe */}
                <div style={{
                  padding: "1.5rem 1.5rem 1.25rem",
                  background: accentBg,
                  borderBottom: `1px solid ${accentBorder}`,
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "14px",
                    background: accentBg, border: `1px solid ${accentBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon style={{ width: 20, height: 20, color: accent }} />
                  </div>
                  <span style={{
                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em",
                    textTransform: "uppercase", color: accent,
                    background: accentBg, border: `1px solid ${accentBorder}`,
                    borderRadius: "999px", padding: "4px 10px", whiteSpace: "nowrap",
                  }}>{tag}</span>
                </div>

                {/* body */}
                <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.15rem", fontWeight: 600, lineHeight: 1.3, color: "var(--foreground)", marginBottom: "10px" }}>{title}</h3>
                  <p style={{ fontSize: "13px", lineHeight: 1.65, color: "var(--muted-foreground)", marginBottom: "1.25rem", flex: 1 }}>{desc}</p>

                  {/* meta row */}
                  <div style={{ display: "flex", gap: "12px", marginBottom: "1.25rem" }}>
                    <span style={{ fontSize: "12px", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <FileText style={{ width: 12, height: 12 }} /> {questions} questions
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock style={{ width: 12, height: 12 }} /> ~{est}
                    </span>
                  </div>

                  {/* field type chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "1.5rem" }}>
                    {fields.map(f => (
                      <span key={f} style={{
                        fontSize: "11px", borderRadius: "6px", padding: "3px 9px",
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "var(--muted-foreground)",
                      }}>{f}</span>
                    ))}
                  </div>

                  {/* cta */}
                  <Link href={`/explore/template/${id}`} style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    borderRadius: "12px", padding: "10px 0", fontSize: "13px",
                    background: accentBg, border: `1px solid ${accentBorder}`,
                    color: accent, textDecoration: "none", fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${accent}22`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = accentBg; }}>
                    Use this template <ArrowRight style={{ width: 13, height: 13 }} />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Main Component ─── */
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
    <div className="min-h-screen" style={{
      fontFamily: "'Inter', 'system-ui', sans-serif",
      background: "var(--background)",
      color: "var(--foreground)",
    }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid " + (navScrolled ? "var(--border)" : "transparent"),
        backdropFilter: navScrolled ? "blur(20px)" : "none",
        background: navScrolled ? "rgba(11,11,12,0.85)" : "transparent",
        transition: "all 0.3s",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", height: "64px", alignItems: "center", justifyContent: "space-between" }}>
            <EdinFormLogo />

            <div style={{
              display: "flex", gap: "2rem", fontSize: "13px",
              color: "var(--muted-foreground)", fontWeight: 500,
            }} className="hidden-mobile">
              {[{ l: "Features", h: "#features" }, { l: "How it works", h: "#how" }, { l: "Pricing", h: "/pricing" }, { l: "Templates", h: "/explore" }].map(({ l, h }) => (
                <a key={l} href={h} style={{
                  textDecoration: "none", color: "inherit", transition: "color 0.2s",
                  position: "relative", padding: "4px 0",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ""; }}>
                  {l}
                </a>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {loggedIn ? (
                <Link href="/dashboard" style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  borderRadius: "999px", padding: "8px 20px", fontSize: "13px",
                  background: "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)",
                  color: "#0B0B0C", textDecoration: "none", fontWeight: 600,
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(200,155,99,0.35)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                  Open dashboard <ArrowUpRight style={{ width: 13, height: 13 }} />
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" style={{
                    display: "inline-flex", padding: "8px 16px", fontSize: "13px",
                    color: "var(--muted-foreground)", textDecoration: "none", fontWeight: 500,
                    transition: "color 0.2s", borderRadius: "999px",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ""; }}
                    className="hidden-mobile">
                    Sign in
                  </Link>
                  <Link href="/auth/register" style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    borderRadius: "999px", padding: "8px 20px", fontSize: "13px",
                    background: "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)",
                    color: "#0B0B0C", textDecoration: "none", fontWeight: 700,
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(200,155,99,0.35)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                    Start free
                  </Link>
                </>
              )}
              <button onClick={() => setNavOpen(v => !v)} className="show-mobile" style={{
                width: 36, height: 36, borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--foreground)",
              }}>
                {navOpen ? <X style={{ width: 16, height: 16 }} /> : <Menu style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          <div style={{
            maxHeight: navOpen ? "360px" : "0", overflow: "hidden",
            transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
          }}>
            <div style={{ paddingBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "2px" }}>
              {[{ l: "Features", h: "#features" }, { l: "How it works", h: "#how" }, { l: "Pricing", h: "/pricing" }, { l: "Templates", h: "/explore" }].map(({ l, h }) => (
                <a key={l} href={h} style={{ padding: "10px 4px", fontSize: "15px", color: "var(--foreground)", textDecoration: "none" }}>{l}</a>
              ))}
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
              <Link href="/auth/login" style={{ padding: "10px 4px", fontSize: "15px", color: "var(--muted-foreground)", textDecoration: "none" }}>Sign in</Link>
              <Link href="/auth/register" style={{
                marginTop: "4px", borderRadius: "12px", padding: "12px 16px", textAlign: "center",
                background: "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)",
                color: "#0B0B0C", textDecoration: "none", fontWeight: 700, fontSize: "14px",
              }}>Start free — no card needed</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ position: "relative", overflow: "hidden", padding: "5rem 1.5rem 5rem" }}>
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 55% at 30% 40%, rgba(200,155,99,0.13) 0%, transparent 65%), radial-gradient(ellipse 50% 50% at 80% 50%, rgba(124,158,232,0.07) 0%, transparent 60%)",
        }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3.5rem", alignItems: "center" }}>

            <div style={{ flex: "1 1 420px", minWidth: 0 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(200,155,99,0.10)", border: "1px solid rgba(200,155,99,0.25)",
                borderRadius: "999px", padding: "5px 14px", marginBottom: "1.75rem",
                fontSize: "12px", fontWeight: 600, color: "#C89B63",
                animation: "fadeUp 0.6s ease both",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C89B63", boxShadow: "0 0 8px #C89B6388" }} />
                Introducing EdinForm 2.0 — with AI-powered logic
                <ArrowRight style={{ width: 12, height: 12 }} />
              </div>

              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(2.6rem, 5vw, 4.8rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                marginBottom: "1.5rem",
                animation: "fadeUp 0.7s ease 0.1s both",
                fontWeight: 700,
                color: "var(--foreground)",
              }}>
                Forms that{" "}
                <em style={{ color: "#C89B63", fontStyle: "italic" }}>think</em>
                <br />with you.
              </h1>

              <p style={{
                maxWidth: "48ch",
                fontSize: "clamp(14px, 1.4vw, 16px)",
                lineHeight: 1.8,
                color: "var(--muted-foreground)",
                marginBottom: "2rem",
                animation: "fadeUp 0.7s ease 0.2s both",
                fontWeight: 400,
                letterSpacing: "0.01em",
              }}>
                EdinForm is the form builder for teams who care about experience. Build branching surveys, collect structured data, and analyze responses — all from one clean, fast interface. No code. No friction. Just better conversations with your audience.
              </p>

              <div style={{
                display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center",
                animation: "fadeUp 0.7s ease 0.3s both",
              }}>
                <Link href={ctaHref} style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  borderRadius: "999px", padding: "12px 26px", fontSize: "14px",
                  background: "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)",
                  color: "#0B0B0C", textDecoration: "none", fontWeight: 700,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 4px 20px rgba(200,155,99,0.30)",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(200,155,99,0.45)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(200,155,99,0.30)"; }}>
                  Build your first form — free
                  <ArrowRight style={{ width: 15, height: 15 }} />
                </Link>
                <Link href="/explore" style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  borderRadius: "999px", padding: "12px 22px", fontSize: "14px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
                  color: "var(--foreground)", textDecoration: "none", fontWeight: 500,
                  transition: "background 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}>
                  <Play style={{ width: 13, height: 13, fill: "currentColor" }} /> See a live demo
                </Link>
              </div>

              <div style={{
                marginTop: "2.25rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "18px",
                animation: "fadeUp 0.7s ease 0.4s both",
              }}>
                <div style={{ display: "flex" }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{
                      width: 30, height: 30, borderRadius: "50%",
                      border: "2px solid var(--background)",
                      background: `hsl(${i * 47 + 30}, 55%, 45%)`,
                      marginLeft: i > 1 ? "-9px" : "0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "10px", fontWeight: 700, color: "white",
                    }}>
                      {String.fromCharCode(65 + i - 1)}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: "flex", gap: "2px", marginBottom: "2px" }}>
                    {[1,2,3,4,5].map(i => <Star key={i} style={{ width: 11, height: 11, fill: "#C89B63", color: "#C89B63" }} />)}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                    Trusted by <strong style={{ color: "var(--foreground)" }}>8,400+</strong> teams
                  </div>
                </div>
                <div style={{ height: 28, width: 1, background: "rgba(255,255,255,0.08)" }} />
                <div style={{ fontSize: "12px", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "5px" }}>
                  <ShieldCheck style={{ width: 13, height: 13, color: "#6FCF97" }} />
                  Free forever · No credit card
                </div>
              </div>
            </div>

            <div style={{ flex: "1 1 380px", minWidth: 0, animation: "fadeUp 0.8s ease 0.25s both" }}>
              <HeroFormCard />
            </div>

          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how" style={{ padding: "6rem 1.5rem", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "12px" }}>How it works</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, marginBottom: "1rem" }}>
                From idea to insights in four steps.
              </h2>
              <p style={{ maxWidth: "48ch", margin: "0 auto", fontSize: "15px", lineHeight: 1.7, color: "var(--muted-foreground)" }}>
                EdinForm removes every unnecessary step between "I have a question to ask" and "I have the answers I need."
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "24px", padding: "2rem",
              backdropFilter: "blur(20px)",
            }}>
              <FlowDiagram />
            </div>
          </Reveal>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", marginTop: "1.5rem" }}>
            {[
              { n: "01", title: "Draft your form", body: "Choose from 9 field types — short text, long text, multiple choice, rating, date picker, file upload, email, number, and scale. Reorder with drag-and-drop.", color: "#C89B63" },
              { n: "02", title: "Add logic & branching", body: "Define skip logic, conditional display rules, and end screens. Respondents get a path tailored to their answers. Works on any field.", color: "#7C9EE8" },
              { n: "03", title: "Publish in one click", body: "Generate a shareable URL, embed snippet, or QR code. Your form works on any device, in any browser, no account required for respondents.", color: "#6FCF97" },
              { n: "04", title: "Read and act on replies", body: "Responses appear in real time. Filter, search, export to CSV. View aggregate charts or individual submissions — your data, your way.", color: "#BB87E8" },
            ].map(({ n, title, body, color }, i) => (
              <Reveal key={n} delay={i * 60} style={{ flex: "1 1 220px", minWidth: "200px" }}>
                <div style={{
                  background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "16px", padding: "1.5rem",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${color}22`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", color, marginBottom: "12px", letterSpacing: "0.2em" }}>{n}</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", fontWeight: 600, marginBottom: "8px", color: "var(--foreground)" }}>{title}</h3>
                  <p style={{ fontSize: "13px", lineHeight: 1.65, color: "var(--muted-foreground)" }}>{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LIVE DEMO ══ */}
      <section id="demo" style={{ padding: "7rem 1.5rem", borderTop: "1px solid var(--border)", background: "rgba(200,155,99,0.02)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "12px" }}>Try it now</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, marginBottom: "1rem" }}>
                A real EdinForm form, live right here.
              </h2>
              <p style={{ maxWidth: "50ch", margin: "0 auto", fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)" }}>
                This isn't a mockup or a screenshot. Every interaction below — field focus, validation, progress, submission — is exactly what your respondents will experience. Fill it out and see for yourself.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <LiveDemoForm />
          </Reveal>

          <Reveal delay={160}>
            <div style={{
              marginTop: "2rem", display: "flex", flexWrap: "wrap", justifyContent: "center",
              gap: "2rem", padding: "1.5rem 2rem",
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
            }}>
              {[
                { icon: Zap, label: "Instant responses", desc: "Submissions appear in your dashboard in real time" },
                { icon: GitBranch, label: "Adaptive logic", desc: "Questions change based on previous answers" },
                { icon: Globe, label: "Works everywhere", desc: "Any device, any browser — no app needed" },
                { icon: BarChart3, label: "Built-in analytics", desc: "Completion rates, drop-off, and timing tracked automatically" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "10px", flex: "1 1 200px", maxWidth: "260px" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "10px", flexShrink: 0,
                    background: "rgba(200,155,99,0.10)", border: "1px solid rgba(200,155,99,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon style={{ width: 15, height: 15, color: "#C89B63" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)", marginBottom: "2px" }}>{label}</div>
                    <div style={{ fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "0" }}>
          {[
            { raw: 10000, suffix: "+", label: "Forms created" },
            { raw: 1200000, suffix: "+", label: "Responses collected" },
            { raw: 99.9, suffix: "%", label: "Uptime SLA", fixed: 1 },
            { raw: 4.9, suffix: "/5", label: "Average rating", fixed: 1 },
          ].map(({ raw, suffix, label, fixed }, i) => (
            <Reveal key={label} delay={i * 80} style={{ flex: "1 1 180px", textAlign: "center", padding: "1.5rem", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "#C89B63", fontWeight: 700, lineHeight: 1 }}>
                {fixed !== undefined ? raw.toFixed(fixed) : <Counter to={raw} />}{suffix}
              </div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.24em", color: "var(--muted-foreground)", marginTop: "8px" }}>{label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" style={{ padding: "7rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ marginBottom: "4rem" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "12px" }}>Everything you need</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, maxWidth: "18ch", lineHeight: 1.15 }}>
                Built for the whole form lifecycle.
              </h2>
              <p style={{ maxWidth: "52ch", fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)", marginTop: "1rem" }}>
                Most form tools stop at "collect responses." EdinForm goes further — giving you logic, analytics, collaboration, and integrations in one place. Everything your team needs, nothing you don't.
              </p>
            </div>
          </Reveal>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
            {[
              { icon: Layers, n: "01", title: "Nine field types", body: "Short text, long text, multiple choice, checkboxes, rating scale, date picker, file upload, email validation, and number input — all styled consistently and accessible by default.", color: "#C89B63" },
              { icon: GitBranch, n: "02", title: "Conditional branching logic", body: "Skip irrelevant questions, show fields only when needed, redirect to custom endings. Build complex decision trees without writing a single line of code.", color: "#7C9EE8" },
              { icon: Eye, n: "03", title: "Live preview mode", body: "See your form exactly as respondents will — including all conditional logic paths — before you publish. Catch issues before they reach your audience.", color: "#6FCF97" },
              { icon: BarChart3, n: "04", title: "Built-in analytics", body: "View total responses, completion rates, average time-to-complete, and drop-off points. Per-question summaries and response distribution charts included.", color: "#BB87E8" },
              { icon: ShieldCheck, n: "05", title: "Spam protection & validation", body: "Rate limiting, honeypot fields, and email validation keep your data clean. Optional CAPTCHA integration available on all plans.", color: "#F2994A" },
              { icon: Share2, n: "06", title: "Flexible sharing", body: "Share a public link, restrict access with a password, or embed directly in your website. Generate QR codes for offline use. All responses stream in live.", color: "#56CCF2" },
              { icon: Zap, n: "07", title: "Webhooks & integrations", body: "Fire a webhook on every submission. Connect to Zapier, Make, or direct REST endpoints to route responses wherever your workflow lives.", color: "#C89B63" },
              { icon: Users, n: "08", title: "Team collaboration", body: "Invite teammates as editors or viewers. Comment on questions, review drafts, and publish together — with full audit history on paid plans.", color: "#7C9EE8" },
              { icon: Globe, n: "09", title: "Custom domains & branding", body: "Serve forms from your own domain, swap the logo, customize the color palette and font. Your form should look like you, not like a form tool.", color: "#6FCF97" },
            ].map(({ icon: Icon, n, title, body, color }, i) => (
              <Reveal key={n} delay={i * 50} style={{ flex: "1 1 280px" }}>
                <div style={{
                  padding: "1.75rem", borderRadius: "18px",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  height: "100%", boxSizing: "border-box",
                  transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px ${color}22`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${color}44`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                  }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "12px",
                    background: `${color}18`, border: `1px solid ${color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "1.25rem",
                  }}>
                    <Icon style={{ width: 18, height: 18, color }} />
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.2em", marginBottom: "8px" }}>{n}</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 600, marginBottom: "10px", color: "var(--foreground)" }}>{title}</h3>
                  <p style={{ fontSize: "13px", lineHeight: 1.65, color: "var(--muted-foreground)" }}>{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BUILDER + DIAGRAM SPLIT ══ */}
      <section style={{ padding: "7rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 340px" }}>
              <Reveal>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "12px" }}>The form editor</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "1.25rem" }}>
                  An editor built around focus, not features.
                </h2>
                <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
                  The EdinForm editor keeps everything you need visible and everything you don't out of the way. A field palette on the left, your live canvas in the center. Click a field type, it appears. Drag it to reorder. Double-click to edit. That's it.
                </p>
                <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)", marginBottom: "2rem" }}>
                  Unlike tools that bury settings in modal dialogs or multi-tab panels, EdinForm exposes all field options inline. Change the label, mark it required, add helper text — all without losing your place.
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "0" }}>
                  {["Keyboard shortcuts for everything", "Undo / redo stack — never lose work", "Auto-save every five seconds"].map(t => (
                    <li key={t} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--foreground)" }}>
                      <CheckCircle2 style={{ width: 16, height: 16, color: "#6FCF97", flexShrink: 0 }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <Reveal delay={120} style={{ flex: "1 1 380px" }}>
              <FormBuilderPreview />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ BRANCHING + ANALYTICS ══ */}
      <section style={{ padding: "7rem 1.5rem", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 300px" }}>
              <Reveal>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#7C9EE8", fontWeight: 600, marginBottom: "12px" }}>Branching logic</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "1.25rem" }}>
                  Forms that listen and adapt.
                </h2>
                <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
                  A single form that shows different questions to different people isn't magic — it's branching logic. With EdinForm, you set simple if/then rules on any field. The form adapts in real time, showing only the questions that matter to each respondent.
                </p>
                <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)", marginBottom: "2rem" }}>
                  The result: shorter, more relevant forms that respondents actually complete. Higher completion rates. Better data quality. Less cleanup on your end.
                </p>
              </Reveal>
              <Reveal delay={80}>
                <div style={{
                  background: "rgba(124,158,232,0.06)", border: "1px solid rgba(124,158,232,0.15)",
                  borderRadius: "20px", padding: "1.5rem",
                }}>
                  <BranchingDiagram />
                  <p style={{ fontSize: "11px", color: "var(--muted-foreground)", textAlign: "center", marginTop: "1rem" }}>Hover nodes to trace logic paths</p>
                </div>
              </Reveal>
            </div>

            <div style={{ flex: "1 1 300px" }}>
              <Reveal delay={100}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#BB87E8", fontWeight: 600, marginBottom: "12px" }}>Analytics</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "1.25rem" }}>
                  Numbers that actually mean something.
                </h2>
                <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
                  EdinForm tracks the metrics that tell you whether your form is working — not just how many responses you got. You'll see where respondents drop off, which questions take the longest to answer, and how completion rates change over time.
                </p>
                <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--muted-foreground)", marginBottom: "1.75rem" }}>
                  Export everything to CSV or JSON. Filter by date range, device type, or referrer. Build a picture of your audience — without leaving your dashboard.
                </p>
              </Reveal>
              <Reveal delay={140}>
                <AnalyticsDashboard />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SCOTLAND & EUROPE TEMPLATES ══ */}
      <TemplatesSection />

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ padding: "7rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "12px" }}>What people say</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700 }}>
                Teams who switched, didn't look back.
              </h2>
            </div>
          </Reveal>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
            {[
              { q: "We replaced three different tools with EdinForm. Typeform for surveys, Airtable forms for data collection, and Google Forms for internal stuff. EdinForm does all three, in one place, and it looks better than any of them.", name: "Isla M.", role: "Head of Research, DEPT®", stars: 5 },
              { q: "The branching logic is the best I've used — and I've tried everything. Building a path for yes/no answers used to take me 30 minutes. With EdinForm it takes 90 seconds.", name: "Marcus K.", role: "Product Designer, Mono", stars: 5 },
              { q: "Clients mention the forms. That never happened before. They say things like 'that felt polished' or 'I liked how it only showed me relevant questions'. That's EdinForm.", name: "Priya R.", role: "Studio Lead, Forma", stars: 5 },
              { q: "Completion rates went up 34% when we switched from our old tool. I attribute most of that to the cleaner interface and conditional logic eliminating irrelevant questions.", name: "Tom H.", role: "Growth Lead, Layers", stars: 5 },
              { q: "The analytics are genuinely useful. I can see exactly where people abandon the form and fix it. Before EdinForm I was guessing.", name: "Sara L.", role: "UX Researcher, Craft", stars: 5 },
              { q: "We run all our user interviews through EdinForm now — screener survey, consent form, post-session feedback. The embed is clean and our completion rates reflect that.", name: "James O.", role: "Design Lead, Arc", stars: 5 },
            ].map(({ q, name, role, stars }, i) => (
              <Reveal key={name} delay={i * 50} style={{ flex: "1 1 280px" }}>
                <div style={{
                  background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "18px", padding: "1.75rem", height: "100%", boxSizing: "border-box",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(200,155,99,0.10)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}>
                  <div style={{ display: "flex", gap: "2px", marginBottom: "1rem" }}>
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} style={{ width: 13, height: 13, fill: "#C89B63", color: "#C89B63" }} />
                    ))}
                  </div>
                  <blockquote style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.05rem", lineHeight: 1.55, color: "var(--foreground)", marginBottom: "1.5rem", fontStyle: "italic" }}>
                    "{q}"
                  </blockquote>
                  <div style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                    <span style={{ color: "var(--foreground)", fontWeight: 600 }}>{name}</span>
                    <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
                    {role}
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
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "12px" }}>FAQ</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>
                Common questions, answered plainly.
              </h2>
            </div>
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {faqs.map(({ q, a }, i) => (
              <Reveal key={q} delay={i * 40}>
                <div style={{
                  borderRadius: "14px",
                  border: "1px solid " + (activeFaq === i ? "rgba(200,155,99,0.3)" : "rgba(255,255,255,0.06)"),
                  overflow: "hidden",
                  transition: "border-color 0.3s",
                  marginBottom: "6px",
                }}>
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "1.25rem 1.5rem", background: "none", border: "none",
                      cursor: "pointer", gap: "1rem", textAlign: "left",
                    }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", fontWeight: 500, color: "var(--foreground)" }}>{q}</span>
                    <ChevronDown style={{
                      width: 18, height: 18, flexShrink: 0, color: "var(--muted-foreground)",
                      transform: activeFaq === i ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.3s",
                    }} />
                  </button>
                  <div style={{
                    maxHeight: activeFaq === i ? "300px" : "0",
                    overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
                  }}>
                    <p style={{ padding: "0 1.5rem 1.25rem", fontSize: "14px", lineHeight: 1.75, color: "var(--muted-foreground)" }}>{a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{ padding: "8rem 1.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(200,155,99,0.13) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <Reveal>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#C89B63", fontWeight: 600, marginBottom: "1.5rem" }}>Get started</div>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
            }}>
              Your next great<br />
              form starts <em style={{ color: "#C89B63" }}>here.</em>
            </h2>
            <p style={{ maxWidth: "42ch", margin: "0 auto 2.5rem", fontSize: "16px", lineHeight: 1.75, color: "var(--muted-foreground)" }}>
              Join thousands of teams using EdinForm to ask better questions and get cleaner answers. Free plan available — no credit card, no time limit, no catch.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginBottom: "2rem" }}>
              <Link href={ctaHref} style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                borderRadius: "999px", padding: "14px 32px", fontSize: "15px",
                background: "linear-gradient(135deg, #C89B63 0%, #8B6540 100%)",
                color: "#0B0B0C", textDecoration: "none", fontWeight: 700,
                boxShadow: "0 4px 24px rgba(200,155,99,0.35)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(200,155,99,0.5)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(200,155,99,0.35)"; }}>
                Start building for free <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/explore" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                borderRadius: "999px", padding: "14px 28px", fontSize: "15px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
                color: "var(--foreground)", textDecoration: "none", fontWeight: 500,
                transition: "background 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}>
                Browse templates
              </Link>
            </div>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1.5rem", fontSize: "12px", color: "var(--muted-foreground)" }}>
              {["Free plan forever", "No credit card needed", "GDPR compliant", "Cancel anytime"].map(t => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Check style={{ width: 12, height: 12, color: "#6FCF97" }} /> {t}
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
              <p style={{ marginTop: "1rem", maxWidth: "36ch", fontSize: "14px", lineHeight: 1.7, color: "var(--muted-foreground)" }}>
                The form builder for teams who value experience. Build, publish, and analyze — in one calm, considered workspace.
              </p>
              <div style={{ marginTop: "1.25rem", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["GDPR", "SOC 2", "CCPA"].map(badge => (
                  <span key={badge} style={{
                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
                    padding: "4px 10px", borderRadius: "6px",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "var(--muted-foreground)",
                  }}>{badge}</span>
                ))}
              </div>
            </div>

            {[
              { label: "Product", links: [{ t: "Features", h: "#features" }, { t: "Templates", h: "/explore" }, { t: "Pricing", h: "/pricing" }, { t: "Changelog", h: "/changelog" }] },
              { label: "Company", links: [{ t: "About", h: "/about" }, { t: "Blog", h: "/blog" }, { t: "Careers", h: "/careers" }, { t: "Contact", h: "/contact" }] },
              { label: "Legal", links: [{ t: "Privacy", h: "/privacy" }, { t: "Terms", h: "/terms" }, { t: "Security", h: "/security" }] },
            ].map(({ label, links }) => (
              <div key={label} style={{ flex: "1 1 120px" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.24em", color: "var(--muted-foreground)", fontWeight: 600, marginBottom: "1rem" }}>{label}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {links.map(({ t, h }) => (
                    <li key={t}>
                      <a href={h} style={{ fontSize: "14px", color: "var(--muted-foreground)", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ""; }}>
                        {t}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{
            paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexWrap: "wrap", justifyContent: "space-between",
            fontSize: "12px", color: "var(--muted-foreground)", gap: "1rem",
          }}>
            <span>© 2026 EdinForm. All rights reserved.</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock style={{ width: 11, height: 11 }} /> Status: All systems operational
            </span>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&display=swap');

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
      `}</style>
    </div>
  );
}
