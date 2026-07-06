/** Inline SVG illustrations for the features bento — no external image deps */

export function FeatureIllustration({ id, accent = "#22d3ee" }: { id: string; accent?: string }) {
  const props = { accent };

  switch (id) {
    case "01":
      return <FieldsIllus {...props} />;
    case "02":
      return <BranchingIllus {...props} />;
    case "03":
      return <PreviewIllus {...props} />;
    case "04":
      return <AnalyticsIllus {...props} />;
    case "05":
      return <ShieldIllus {...props} />;
    case "06":
      return <ShareIllus {...props} />;
    case "07":
      return <WebhookIllus {...props} />;
    case "08":
      return <TeamIllus {...props} />;
    case "09":
      return <BrandIllus {...props} />;
    default:
      return <FieldsIllus {...props} />;
  }
}

function FieldsIllus({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" aria-hidden>
      <rect
        x="40"
        y="20"
        width="120"
        height="80"
        rx="8"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        fill="#fff"
      />
      <rect x="52" y="34" width="56" height="8" rx="4" fill="#e2e8f0" />
      <rect x="52" y="50" width="96" height="8" rx="4" fill="#e2e8f0" />
      <circle cx="56" cy="72" r="4" stroke={accent} strokeWidth="1.5" />
      <rect x="68" y="69" width="40" height="6" rx="3" fill="#e2e8f0" />
      <circle
        cx="56"
        cy="86"
        r="4"
        fill={accent}
        fillOpacity="0.2"
        stroke={accent}
        strokeWidth="1.5"
      />
      <rect x="68" y="83" width="52" height="6" rx="3" fill="#e2e8f0" />
    </svg>
  );
}

function BranchingIllus({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" aria-hidden>
      <circle
        cx="100"
        cy="24"
        r="10"
        fill={accent}
        fillOpacity="0.15"
        stroke={accent}
        strokeWidth="1.5"
      />
      <text x="100" y="28" textAnchor="middle" fontSize="9" fill={accent} fontWeight="600">
        ?
      </text>
      <path d="M100 34 L100 52" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M100 52 L60 52 L60 68" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M100 52 L140 52 L140 68" stroke="#94a3b8" strokeWidth="1.5" />
      <rect
        x="40"
        y="68"
        width="40"
        height="28"
        rx="6"
        stroke="#cbd5e1"
        fill="#fff"
        strokeWidth="1.5"
      />
      <rect x="48" y="78" width="24" height="5" rx="2.5" fill="#e2e8f0" />
      <rect
        x="120"
        y="68"
        width="40"
        height="28"
        rx="6"
        stroke={accent}
        strokeWidth="1.5"
        fill={accent}
        fillOpacity="0.08"
      />
      <rect x="128" y="78" width="24" height="5" rx="2.5" fill={accent} fillOpacity="0.35" />
    </svg>
  );
}

function PreviewIllus({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" aria-hidden>
      <rect
        x="55"
        y="16"
        width="90"
        height="88"
        rx="8"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        fill="#fff"
      />
      <rect x="55" y="16" width="90" height="14" rx="8" fill="#f1f5f9" />
      <rect x="65" y="38" width="50" height="6" rx="3" fill="#e2e8f0" />
      <rect x="65" y="52" width="70" height="6" rx="3" fill="#e2e8f0" />
      <rect
        x="65"
        y="72"
        width="36"
        height="14"
        rx="7"
        fill={accent}
        fillOpacity="0.2"
        stroke={accent}
        strokeWidth="1.5"
      />
      <path
        d="M118 42 L148 28 L148 56 Z"
        fill={accent}
        fillOpacity="0.12"
        stroke={accent}
        strokeWidth="1.5"
      />
      <circle cx="138" cy="42" r="3" fill={accent} />
    </svg>
  );
}

function AnalyticsIllus({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" aria-hidden>
      <rect
        x="36"
        y="24"
        width="128"
        height="72"
        rx="8"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        fill="#fff"
      />
      <polyline
        points="52,76 72,58 92,64 112,40 132,48 152,32"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="112" cy="40" r="3" fill={accent} />
      <rect x="52" y="84" width="16" height="4" rx="2" fill="#e2e8f0" />
      <rect x="92" y="84" width="16" height="4" rx="2" fill="#e2e8f0" />
      <rect x="132" y="84" width="16" height="4" rx="2" fill="#e2e8f0" />
    </svg>
  );
}

function ShieldIllus({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" aria-hidden>
      <path
        d="M100 22 L140 36 V58 C140 78 122 92 100 98 C78 92 60 78 60 58 V36 Z"
        stroke={accent}
        strokeWidth="1.5"
        fill={accent}
        fillOpacity="0.1"
      />
      <path
        d="M88 58 L96 66 L114 48"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIllus({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" aria-hidden>
      <circle
        cx="140"
        cy="40"
        r="10"
        stroke={accent}
        strokeWidth="1.5"
        fill={accent}
        fillOpacity="0.12"
      />
      <circle cx="60" cy="60" r="10" stroke="#94a3b8" strokeWidth="1.5" fill="#fff" />
      <circle cx="140" cy="80" r="10" stroke="#94a3b8" strokeWidth="1.5" fill="#fff" />
      <path d="M70 56 L128 44" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M70 64 L128 76" stroke="#94a3b8" strokeWidth="1.5" />
      <rect
        x="88"
        y="88"
        width="24"
        height="24"
        rx="4"
        stroke={accent}
        strokeWidth="1.5"
        fill="#fff"
      />
      <rect x="94" y="94" width="4" height="4" fill={accent} />
      <rect x="100" y="94" width="4" height="4" fill={accent} />
      <rect x="106" y="94" width="4" height="4" fill={accent} />
    </svg>
  );
}

function WebhookIllus({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" aria-hidden>
      <rect
        x="32"
        y="40"
        width="48"
        height="40"
        rx="8"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        fill="#fff"
      />
      <path d="M44 56 H68 M44 64 H60" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
      <path d="M88 60 H112" stroke={accent} strokeWidth="2" strokeDasharray="4 3" />
      <polygon points="112,56 120,60 112,64" fill={accent} />
      <rect
        x="124"
        y="40"
        width="48"
        height="40"
        rx="8"
        stroke={accent}
        strokeWidth="1.5"
        fill={accent}
        fillOpacity="0.1"
      />
      <path
        d="M136 56 H160 M136 64 H152"
        stroke={accent}
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

function TeamIllus({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" aria-hidden>
      <circle cx="72" cy="48" r="14" stroke="#cbd5e1" strokeWidth="1.5" fill="#fff" />
      <circle
        cx="128"
        cy="48"
        r="14"
        stroke={accent}
        strokeWidth="1.5"
        fill={accent}
        fillOpacity="0.12"
      />
      <path
        d="M48 88 C48 72 62 64 72 64 C82 64 96 72 96 88"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        fill="#f8fafc"
      />
      <path
        d="M104 88 C104 72 118 64 128 64 C138 64 152 72 152 88"
        stroke={accent}
        strokeWidth="1.5"
        fill={accent}
        fillOpacity="0.08"
      />
      <rect
        x="78"
        y="78"
        width="44"
        height="20"
        rx="6"
        stroke="#e2e8f0"
        strokeWidth="1.5"
        fill="#fff"
      />
    </svg>
  );
}

function BrandIllus({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" aria-hidden>
      <rect
        x="48"
        y="28"
        width="104"
        height="64"
        rx="10"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        fill="#fff"
      />
      <circle cx="68" cy="48" r="10" fill={accent} fillOpacity="0.25" />
      <rect x="84" y="42" width="48" height="8" rx="4" fill="#e2e8f0" />
      <rect x="60" y="64" width="80" height="6" rx="3" fill="#e2e8f0" />
      <rect x="60" y="76" width="56" height="6" rx="3" fill="#e2e8f0" />
      <rect
        x="130"
        y="20"
        width="32"
        height="12"
        rx="6"
        fill={accent}
        fillOpacity="0.2"
        stroke={accent}
        strokeWidth="1"
      />
    </svg>
  );
}

/** How-it-works step 02 & 03 — illustration slots */
export function StepIllustration({ step }: { step: "02" | "03" }) {
  if (step === "02") return <BranchingIllus accent="#22d3ee" />;
  return <PublishMobileIllus accent="#22d3ee" />;
}

function PublishMobileIllus({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" aria-hidden className="mkt-step-illus-svg">
      <rect
        x="72"
        y="12"
        width="56"
        height="96"
        rx="12"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        fill="#fff"
      />
      <rect x="88" y="20" width="24" height="4" rx="2" fill="#e2e8f0" />
      <rect x="80" y="36" width="40" height="6" rx="3" fill="#e2e8f0" />
      <rect x="80" y="50" width="40" height="6" rx="3" fill="#e2e8f0" />
      <rect
        x="80"
        y="68"
        width="40"
        height="16"
        rx="8"
        fill={accent}
        fillOpacity="0.2"
        stroke={accent}
        strokeWidth="1.5"
      />
      <path
        d="M148 44 L168 32 V56 Z"
        fill={accent}
        fillOpacity="0.15"
        stroke={accent}
        strokeWidth="1.5"
      />
      <text x="158" y="48" textAnchor="middle" fontSize="8" fill={accent} fontWeight="600">
        QR
      </text>
    </svg>
  );
}
