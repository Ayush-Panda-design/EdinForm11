import Link from "next/link";

export function EdinFormMark({ size = 30 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="relative inline-flex items-center justify-center rounded-lg"
    >
      <span
        className="absolute inset-0 rounded-lg"
        style={{
          background: "linear-gradient(140deg, rgba(34,211,238,0.2) 0%, rgba(52,211,153,0.08) 60%)",
          border: "1px solid rgba(34,211,238,0.35)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 6px 18px -8px rgba(34,211,238,0.35)",
        }}
      />
      <svg
        viewBox="0 0 32 32"
        width={size * 0.7}
        height={size * 0.7}
        fill="none"
        className="relative"
      >
        <path
          d="M9 6h14M9 6v20M9 16h11M9 26h14"
          stroke="var(--signal-accent, #22d3ee)"
          strokeWidth="2"
          strokeLinecap="square"
        />
        <circle cx="23" cy="6" r="1.4" fill="var(--signal-accent, #22d3ee)" />
      </svg>
    </span>
  );
}

export function EdinFormLogo({
  size = 30,
  className = "",
  href = "/",
}: {
  size?: number;
  className?: string;
  href?: string;
}) {
  return (
    <Link href={href} className={`flex items-center gap-3 group ${className}`}>
      <EdinFormMark size={size} />
      <span className="flex items-baseline gap-[2px] leading-none">
        <span
          className="text-[1.35rem] font-bold tracking-tight marketing-logo-edin"
          style={{ color: "var(--foreground, #fafafa)" }}
        >
          Edin
        </span>
        <span
          className="text-[1.35rem] font-bold tracking-tight marketing-logo-form"
          style={{ color: "var(--signal-accent, #22d3ee)" }}
        >
          Form
        </span>
      </span>
    </Link>
  );
}
