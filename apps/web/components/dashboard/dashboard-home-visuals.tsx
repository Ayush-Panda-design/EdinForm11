"use client";

export function DashboardHomeIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 380 260" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="dh-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--dt-accent)" />
          <stop offset="100%" stopColor="var(--dt-success)" />
        </linearGradient>
      </defs>
      <rect x="32" y="48" width="140" height="168" rx="14" fill="var(--dt-card-bg)" stroke="var(--dt-card-border)" />
      <rect x="52" y="72" width="72" height="8" rx="4" fill="url(#dh-grad)" fillOpacity="0.8" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={52} y={92 + i * 22} width={100 - i * 12} height="6" rx="3" fill="var(--border)" />
      ))}
      <rect x="200" y="64" width="148" height="88" rx="14" fill="var(--dt-card-bg)" stroke="var(--dt-accent-border)" />
      <path d="M220 120 L248 96 L276 108 L320 80" stroke="url(#dh-grad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="320" cy="80" r="5" fill="var(--dt-accent)" />
      <rect x="200" y="168" width="68" height="48" rx="10" fill="var(--dt-accent-soft)" stroke="var(--dt-accent-border)" />
      <rect x="280" y="168" width="68" height="48" rx="10" fill="var(--dt-accent-soft)" stroke="var(--dt-accent-border)" />
      <text x="234" y="198" fill="var(--dt-accent)" fontSize="18" fontWeight="700" fontFamily="system-ui">12</text>
      <text x="314" y="198" fill="var(--dt-success)" fontSize="18" fontWeight="700" fontFamily="system-ui">8</text>
    </svg>
  );
}
