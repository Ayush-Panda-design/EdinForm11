"use client";

/** Decorative analytics hero — uses theme CSS variables */
export function AnalyticsHeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="ah-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--dt-accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--dt-success)" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="ah-glow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="var(--dt-accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--dt-accent)" stopOpacity="0" />
        </linearGradient>
        <filter id="ah-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      {/* ambient orb */}
      <ellipse cx="300" cy="80" rx="90" ry="70" fill="url(#ah-glow)" filter="url(#ah-blur)" />

      {/* floating card — chart */}
      <rect x="48" y="52" width="200" height="130" rx="16" fill="var(--dt-card-bg)" stroke="var(--dt-card-border)" strokeWidth="1.5" />
      <path
        d="M72 148 L108 118 L142 132 L178 88 L218 108"
        stroke="url(#ah-accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M72 148 L108 118 L142 132 L178 88 L218 108 L218 168 L72 168 Z"
        fill="url(#ah-accent)"
        fillOpacity="0.12"
      />
      {[72, 108, 142, 178, 218].map((x, i) => (
        <circle key={i} cx={x} cy={[148, 118, 132, 88, 108][i]} r="4" fill="var(--dt-accent)" />
      ))}

      {/* stat pills */}
      <rect x="72" y="68" width="56" height="8" rx="4" fill="var(--dt-accent-soft)" />
      <rect x="72" y="82" width="36" height="6" rx="3" fill="var(--border)" />

      {/* orbiting ring */}
      <circle cx="290" cy="150" r="72" stroke="var(--dt-accent-border)" strokeWidth="1" strokeDasharray="6 8" opacity="0.6" />
      <circle cx="290" cy="150" r="48" stroke="var(--dt-success)" strokeWidth="1" strokeOpacity="0.35" />

      {/* floating metric nodes */}
      <g>
        <rect x="268" y="108" width="44" height="44" rx="12" fill="var(--dt-card-bg)" stroke="var(--dt-accent-border)" />
        <text x="290" y="136" textAnchor="middle" fill="var(--dt-accent)" fontSize="14" fontWeight="600" fontFamily="system-ui">↑</text>
      </g>
      <g>
        <rect x="318" y="168" width="52" height="36" rx="10" fill="var(--dt-accent-soft)" stroke="var(--dt-accent-border)" />
        <circle cx="332" cy="186" r="6" fill="var(--dt-success)" fillOpacity="0.8" />
        <rect x="344" y="182" width="18" height="4" rx="2" fill="var(--dt-accent)" fillOpacity="0.5" />
        <rect x="344" y="190" width="12" height="3" rx="1.5" fill="var(--border)" />
      </g>

      {/* connection lines */}
      <path d="M248 118 Q270 100 290 130" stroke="var(--dt-accent)" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 4" />
      <path d="M218 108 Q250 90 268 120" stroke="var(--dt-success)" strokeWidth="1" strokeOpacity="0.35" />

      {/* bottom bars */}
      <rect x="80" y="210" width="240" height="48" rx="14" fill="var(--dt-card-bg)" stroke="var(--dt-card-border)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={100 + i * 42}
          y={228 - [12, 22, 16, 28, 20][i]!}
          width="22"
          height={[12, 22, 16, 28, 20][i]}
          rx="4"
          fill="var(--dt-accent)"
          fillOpacity={0.35 + i * 0.12}
        />
      ))}
    </svg>
  );
}

export function AnalyticsEmptyChartIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-28 h-24 opacity-60" aria-hidden>
      <circle cx="60" cy="50" r="40" stroke="var(--dt-accent-border)" strokeWidth="1" strokeDasharray="4 6" fill="none" />
      <path d="M30 65 Q50 35 70 55 T95 40" stroke="var(--dt-accent)" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.5" />
      <circle cx="95" cy="40" r="4" fill="var(--dt-accent)" fillOpacity="0.6" />
    </svg>
  );
}

export function LiveFeedIllustration() {
  return (
    <svg viewBox="0 0 80 80" className="w-16 h-16" aria-hidden>
      <circle cx="40" cy="40" r="32" fill="var(--dt-accent-soft)" />
      <circle cx="40" cy="40" r="20" stroke="var(--dt-accent)" strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
      <path d="M28 40 L36 48 L52 32" stroke="var(--dt-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
