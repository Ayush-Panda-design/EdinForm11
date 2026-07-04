/** Inline product illustrations — no external assets required */

export function HeroWorkspaceArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 260" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="hw-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--dash-accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--dash-accent-2)" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="hw-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--dash-accent)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--dash-accent-2)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect
        x="24"
        y="28"
        width="280"
        height="190"
        rx="20"
        fill="var(--dash-card)"
        stroke="var(--dash-border)"
        strokeWidth="2"
      />
      <rect x="24" y="28" width="280" height="36" rx="20" fill="url(#hw-b)" />
      <circle cx="48" cy="46" r="5" fill="var(--dash-danger)" opacity="0.7" />
      <circle cx="66" cy="46" r="5" fill="var(--dash-warn)" opacity="0.7" />
      <circle cx="84" cy="46" r="5" fill="var(--dash-success)" opacity="0.7" />
      <rect x="44" y="84" width="120" height="10" rx="5" fill="var(--dash-accent)" opacity="0.35" />
      <rect x="44" y="106" width="200" height="8" rx="4" fill="var(--dash-border)" />
      <rect x="44" y="124" width="170" height="8" rx="4" fill="var(--dash-border)" />
      <rect x="44" y="152" width="88" height="36" rx="10" fill="url(#hw-a)" />
      <rect
        x="144"
        y="152"
        width="88"
        height="36"
        rx="10"
        fill="var(--dash-card)"
        stroke="var(--dash-border)"
        strokeWidth="2"
      />
      <rect
        x="220"
        y="48"
        width="170"
        height="150"
        rx="18"
        fill="var(--dash-card)"
        stroke="var(--dash-border)"
        strokeWidth="2"
        transform="rotate(6 305 123)"
      />
      <rect
        x="240"
        y="72"
        width="90"
        height="8"
        rx="4"
        fill="var(--dash-accent)"
        opacity="0.4"
        transform="rotate(6 285 76)"
      />
      <rect
        x="238"
        y="96"
        width="120"
        height="6"
        rx="3"
        fill="var(--dash-border)"
        transform="rotate(6 298 99)"
      />
      <rect
        x="236"
        y="114"
        width="100"
        height="6"
        rx="3"
        fill="var(--dash-border)"
        transform="rotate(6 286 117)"
      />
      <circle cx="340" cy="180" r="28" fill="url(#hw-a)" opacity="0.9" />
      <path d="M330 180h20M340 170v20" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyFormsArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 180" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="ef-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--dash-accent)" />
          <stop offset="100%" stopColor="var(--dash-accent-2)" />
        </linearGradient>
      </defs>
      <ellipse cx="140" cy="150" rx="90" ry="14" fill="var(--dash-accent)" opacity="0.1" />
      <rect
        x="70"
        y="30"
        width="140"
        height="110"
        rx="16"
        fill="var(--dash-card)"
        stroke="var(--dash-border)"
        strokeWidth="2"
      />
      <rect x="90" y="52" width="70" height="8" rx="4" fill="var(--dash-accent)" opacity="0.35" />
      <rect x="90" y="72" width="100" height="6" rx="3" fill="var(--dash-border)" />
      <rect x="90" y="88" width="80" height="6" rx="3" fill="var(--dash-border)" />
      <circle cx="200" cy="40" r="22" fill="url(#ef-a)" />
      <path d="M192 40h16M200 32v16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function AnalyticsSparkArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 56" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="as-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--dash-accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--dash-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M4 44 L22 36 L40 40 L58 22 L76 28 L94 12 L116 18 L116 52 L4 52 Z"
        fill="url(#as-a)"
      />
      <path
        d="M4 44 L22 36 L40 40 L58 22 L76 28 L94 12 L116 18"
        stroke="var(--dash-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="94" cy="12" r="4" fill="var(--dash-accent)" />
    </svg>
  );
}

export function FlowDiagramArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 120" fill="none" className={className} aria-hidden>
      <rect
        x="8"
        y="36"
        width="72"
        height="48"
        rx="12"
        fill="var(--dash-accent-soft)"
        stroke="var(--dash-accent-border)"
      />
      <text
        x="44"
        y="64"
        textAnchor="middle"
        fill="var(--dash-accent)"
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui"
      >
        Build
      </text>
      <path d="M88 60h28" stroke="var(--dash-faint)" strokeWidth="2" strokeDasharray="4 4" />
      <polygon points="116,56 124,60 116,64" fill="var(--dash-faint)" />
      <rect
        x="124"
        y="36"
        width="72"
        height="48"
        rx="12"
        fill="var(--dash-accent-soft)"
        stroke="var(--dash-accent-border)"
      />
      <text
        x="160"
        y="64"
        textAnchor="middle"
        fill="var(--dash-accent)"
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui"
      >
        Share
      </text>
      <path d="M204 60h28" stroke="var(--dash-faint)" strokeWidth="2" strokeDasharray="4 4" />
      <polygon points="232,56 240,60 232,64" fill="var(--dash-faint)" />
      <rect
        x="240"
        y="36"
        width="72"
        height="48"
        rx="12"
        fill="var(--dash-accent-soft)"
        stroke="var(--dash-accent-border)"
      />
      <text
        x="276"
        y="64"
        textAnchor="middle"
        fill="var(--dash-accent)"
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui"
      >
        Analyze
      </text>
    </svg>
  );
}
