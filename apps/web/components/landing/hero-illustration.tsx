/** Branded EdinForm builder mock — bold shapes + large type only */

export function HeroIllustration() {
  return (
    <svg
      className="mkt-hero-illustration"
      viewBox="0 -44 720 556"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="EdinForm builder — multi-step form with branching and live analytics"
    >
      <defs>
        <linearGradient id="ef-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <linearGradient id="ef-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="55%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="ef-progress" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <filter id="ef-shadow" x="-6%" y="-6%" width="112%" height="118%">
          <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#0f172a" floodOpacity="0.14" />
        </filter>
        <filter id="ef-callout-shadow" x="-20%" y="-30%" width="140%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.12" />
        </filter>
      </defs>

      <g className="mkt-hero-illustration__app" filter="url(#ef-shadow)">
        <rect
          x="8"
          y="8"
          width="704"
          height="464"
          rx="16"
          fill="#fff"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />

        {/* Title bar — quiet chrome; step progress leads below */}
        <rect x="8" y="8" width="704" height="44" rx="16" fill="url(#ef-accent)" />
        <rect x="8" y="36" width="704" height="16" fill="url(#ef-accent)" />
        <circle cx="34" cy="30" r="4" fill="rgba(255,255,255,0.35)" />
        <circle cx="48" cy="30" r="4" fill="rgba(255,255,255,0.35)" />
        <circle cx="62" cy="30" r="4" fill="rgba(255,255,255,0.35)" />
        <text
          x="84"
          y="35"
          fill="rgba(255,255,255,0.88)"
          fontSize="12"
          fontWeight="500"
          fontFamily="ui-monospace, monospace"
        >
          edinform.io/builder
        </text>
        <circle cx="688" cy="30" r="4" fill="#4ade80" opacity="0.9" />

        {/* Sidebar — icon blocks only */}
        <rect x="8" y="52" width="148" height="420" fill="#f8fafc" />
        <line x1="156" y1="52" x2="156" y2="472" stroke="#e2e8f0" strokeWidth="1.5" />
        {[80, 124, 168, 212, 256].map((y, i) => (
          <rect
            key={y}
            x="28"
            y={y}
            width="108"
            height="36"
            rx="10"
            fill={i === 1 ? "#eff6ff" : "#fff"}
            stroke={i === 1 ? "#3b82f6" : "#e2e8f0"}
            strokeWidth={i === 1 ? 2 : 1}
          />
        ))}
        <rect x="44" y="92" width="20" height="12" rx="3" fill="#3b82f6" />
        <circle cx="54" cy="144" r="9" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
        <circle cx="54" cy="144" r="4" fill="#3b82f6" />
        <rect x="44" y="180" width="20" height="12" rx="3" fill="#cbd5e1" />
        <path
          d="M44 224 H64 M54 224 V244 M44 244 H64"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <rect x="44" y="268" width="20" height="14" rx="3" fill="#cbd5e1" />

        {/* Logic block */}
        <rect
          x="28"
          y="310"
          width="108"
          height="72"
          rx="12"
          fill="#fff"
          stroke="#c7d2fe"
          strokeWidth="1.5"
        />
        <path
          d="M44 334 H120 M82 334 V360 M44 360 H120"
          stroke="#818cf8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="44" cy="334" r="6" fill="#3b82f6" />
        <circle cx="120" cy="360" r="6" fill="#22c55e" />

        {/* Step progress — primary hierarchy */}
        <rect x="180" y="68" width="118" height="32" rx="16" fill="#2563eb" />
        <text
          x="198"
          y="89"
          fill="#fff"
          fontSize="14"
          fontWeight="700"
          letterSpacing="0.04em"
          fontFamily="system-ui, sans-serif"
        >
          STEP 3 OF 5
        </text>

        <text
          x="180"
          y="128"
          fill="#0f172a"
          fontSize="23"
          fontWeight="700"
          fontFamily="var(--font-display), Georgia, serif"
        >
          Why did they stop
        </text>
        <text
          x="180"
          y="156"
          fill="#0f172a"
          fontSize="23"
          fontWeight="700"
          fontFamily="var(--font-display), Georgia, serif"
        >
          halfway through?
        </text>

        {/* Options — shape-forward */}
        <rect
          x="180"
          y="172"
          width="512"
          height="168"
          rx="16"
          fill="url(#ef-screen)"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        {[
          { y: 188, on: true, w: 220 },
          { y: 236, on: false, w: 188 },
          { y: 284, on: false, w: 156 },
        ].map(({ y, on, w }) => (
          <g key={y}>
            <rect
              x="200"
              y={y}
              width="472"
              height="36"
              rx="12"
              fill="#fff"
              stroke={on ? "#2563eb" : "#e2e8f0"}
              strokeWidth={on ? 2.5 : 1.5}
            />
            <circle
              cx="222"
              cy={y + 18}
              r="9"
              fill={on ? "#2563eb" : "none"}
              stroke={on ? "#2563eb" : "#94a3b8"}
              strokeWidth="2.5"
            />
            {on && <circle cx="222" cy={y + 18} r="4" fill="#fff" />}
            <rect
              x="246"
              y={y + 12}
              width={w}
              height="12"
              rx="6"
              fill={on ? "#334155" : "#cbd5e1"}
              opacity={on ? 1 : 0.55}
            />
          </g>
        ))}

        {/* Big completion stat */}
        <rect
          x="180"
          y="354"
          width="112"
          height="44"
          rx="22"
          fill="#ecfdf5"
          stroke="#86efac"
          strokeWidth="1.5"
        />
        <text
          x="204"
          y="384"
          fill="#15803d"
          fontSize="22"
          fontWeight="800"
          fontFamily="system-ui, sans-serif"
        >
          91%
        </text>

        <rect x="180" y="410" width="512" height="12" rx="6" fill="#e2e8f0" />
        <rect
          x="180"
          y="410"
          width="466"
          height="12"
          rx="6"
          fill="url(#ef-progress)"
          className="mkt-hero-illustration__progress"
        />

        {/* Analytics strip + big response count */}
        <rect x="308" y="354" width="384" height="68" rx="14" fill="#0f172a" />
        <polyline
          points="332,398 380,378 428,388 476,362 524,372 572,352 620,362 668,348"
          stroke="#38bdf8"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mkt-hero-illustration__spark"
        />
        <text
          x="332"
          y="382"
          fill="rgba(255,255,255,0.5)"
          fontSize="12"
          fontWeight="600"
          fontFamily="system-ui, sans-serif"
        >
          Responses
        </text>
        <text
          x="668"
          y="404"
          fill="#4ade80"
          fontSize="28"
          fontWeight="800"
          textAnchor="end"
          fontFamily="system-ui, sans-serif"
        >
          2,847
        </text>
      </g>

      {/* Floating callout — outside browser frame, top-right */}
      <g
        className="mkt-hero-illustration__callout"
        transform="translate(452 -32)"
        filter="url(#ef-callout-shadow)"
        aria-hidden
      >
        <g transform="rotate(-2)">
          <g className="mkt-hero-illustration__callout-inner">
            <rect
              x="0"
              y="0"
              width="174"
              height="38"
              rx="19"
              fill="#fff"
              stroke="#34d399"
              strokeWidth="1.5"
            />
            <rect x="0" y="0" width="174" height="38" rx="19" fill="#ecfdf5" fillOpacity="0.85" />
            <text
              x="87"
              y="24"
              fill="#047857"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
            >
              ↓{" "}
              <tspan fontWeight="800" fill="#15803d">
                23%
              </tspan>{" "}
              fewer drop-offs
            </text>
          </g>
        </g>
      </g>
      <path
        d="M 608 8 Q 648 14, 676 28"
        stroke="#34d399"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        fill="none"
        strokeLinecap="round"
        opacity="0.45"
        aria-hidden
      />
    </svg>
  );
}
