import Link from "next/link";

export function EdinFormMark({ size = 30 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="relative inline-flex items-center justify-center rounded-md"
    >
      <span
        className="absolute inset-0 rounded-md"
        style={{
          background:
            "linear-gradient(140deg, rgba(200,155,99,0.18) 0%, rgba(255,255,255,0.03) 60%)",
          border: "1px solid rgba(200,155,99,0.35)",
          boxShadow:
            "inset 0 1px 0 rgba(255,235,200,0.18), 0 6px 18px -8px rgba(200,155,99,0.4)",
        }}
      />
      <svg
        viewBox="0 0 32 32"
        width={size * 0.7}
        height={size * 0.7}
        fill="none"
        className="relative"
      >
        {/* Gothic spire monogram E */}
        <path
          d="M9 6h14M9 6v20M9 16h11M9 26h14"
          stroke="#C89B63"
          strokeWidth="2"
          strokeLinecap="square"
        />
        <circle cx="23" cy="6" r="1.4" fill="#C89B63" />
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
          className="font-display text-[1.55rem] tracking-tight"
          style={{ color: "#F5F1EA" }}
        >
          Edin
        </span>
        <span
          className="font-display text-[1.55rem] italic"
          style={{ color: "#C89B63" }}
        >
          Form
        </span>
      </span>
    </Link>
  );
}
