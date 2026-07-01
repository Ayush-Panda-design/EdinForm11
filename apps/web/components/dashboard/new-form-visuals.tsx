"use client";

/** Illustration for the new-form creation flow */
export function NewFormHeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 260" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="nf-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--dt-accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--dt-success)" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* document */}
      <rect x="40" y="36" width="180" height="200" rx="16" fill="var(--dt-card-bg)" stroke="var(--dt-card-border)" strokeWidth="1.5" />
      <rect x="64" y="64" width="80" height="8" rx="4" fill="var(--dt-accent)" fillOpacity="0.7" />
      <rect x="64" y="82" width="120" height="5" rx="2.5" fill="var(--border)" />
      <rect x="64" y="96" width="100" height="5" rx="2.5" fill="var(--border)" fillOpacity="0.6" />

      {/* question blocks */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="64" y={118 + i * 36} width="132" height="24" rx="8" fill="var(--dt-accent-soft)" stroke="var(--dt-accent-border)" strokeWidth="1" />
          <circle cx="76" cy={130 + i * 36} r="4" fill="var(--dt-accent)" fillOpacity={0.5 + i * 0.15} />
        </g>
      ))}

      {/* plus bubble */}
      <circle cx="248" cy="80" r="36" fill="url(#nf-accent)" fillOpacity="0.2" />
      <circle cx="248" cy="80" r="24" fill="var(--dt-card-bg)" stroke="var(--dt-accent)" strokeWidth="2" />
      <path d="M248 70v20M238 80h20" stroke="var(--dt-accent)" strokeWidth="2.5" strokeLinecap="round" />

      {/* arrow flow */}
      <path d="M272 120 L300 120 L300 180 L220 180" stroke="var(--dt-accent)" strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.5" fill="none" />

      {/* publish card */}
      <rect x="260" y="168" width="88" height="56" rx="12" fill="var(--dt-card-bg)" stroke="var(--dt-success)" strokeWidth="1.5" strokeOpacity="0.6" />
      <path d="M280 196 L292 208 L316 184" stroke="var(--dt-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="276" y="176" width="40" height="5" rx="2" fill="var(--dt-success)" fillOpacity="0.5" />
    </svg>
  );
}
