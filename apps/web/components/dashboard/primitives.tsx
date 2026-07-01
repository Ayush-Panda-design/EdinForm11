"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export function DashboardAnimatedSection({
  children,
  className,
  animation = "fade-up",
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-in" | "slide-in" | "scale-in";
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(`dt-anim-${animation}`, className)}
      style={{ animationDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

const cardBase =
  "rounded-2xl border transition-all duration-200 bg-[var(--dt-card-bg,var(--card))] border-[var(--dt-card-border,var(--border))]";

export function DashboardPage({
  children,
  wide,
  className,
}: {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative z-[1] mx-auto max-w-6xl dt-anim-fade-up",
        wide && "max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DashboardHeader({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  actions,
  badge,
}: {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted-foreground)] mb-1.5">
            {eyebrow}
          </p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight text-[var(--foreground)]">
            {title}
            {titleAccent && (
              <>
                {" "}
                <em className="not-italic" style={{ color: "var(--dt-accent)" }}>
                  {titleAccent}
                </em>
              </>
            )}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1.5 max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}

export function DashboardStatGrid({
  children,
  cols = 4,
}: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4 | 5;
}) {
  const colClass =
    cols === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : cols === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : cols === 5
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={cn("grid gap-4 mb-8", colClass)}>{children}</div>
  );
}

export function DashboardStatCard({
  label,
  value,
  suffix,
  desc,
  icon: Icon,
  delta,
  deltaUp,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  desc?: string;
  icon?: LucideIcon;
  delta?: string;
  deltaUp?: boolean;
}) {
  return (
    <div
      className={cn(cardBase, "p-5 relative overflow-hidden")}
      style={{ borderRadius: "var(--dt-card-radius, 1rem)" }}
    >
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-80"
        style={{ background: "var(--dt-stat-glow, var(--dt-accent-soft))" }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
            {label}
          </span>
          {Icon && (
            <Icon className="w-3.5 h-3.5 opacity-80" style={{ color: "var(--dt-accent)" }} />
          )}
        </div>
        <p className="font-display text-3xl leading-none text-[var(--foreground)]">
          {value}
          {suffix && (
            <span className="text-base ml-0.5" style={{ color: "var(--dt-accent)" }}>
              {suffix}
            </span>
          )}
        </p>
        {desc && (
          <p className="text-[11px] text-[var(--muted-foreground)] mt-1">{desc}</p>
        )}
        {delta && (
          <p
            className="text-[11px] mt-2 flex items-center gap-1"
            style={{ color: deltaUp ? "var(--dt-success)" : "var(--muted-foreground)" }}
          >
            {delta}
          </p>
        )}
      </div>
    </div>
  );
}

export function DashboardSection({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title?: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-8", className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h2 className="font-display text-xl text-[var(--foreground)]">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-[var(--muted-foreground)] mt-1">{subtitle}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function DashboardCard({
  children,
  className,
  padding = true,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(cardBase, padding && "p-5", className)}
      style={{ borderRadius: "var(--dt-card-radius, 1rem)", ...style }}
    >
      {children}
    </div>
  );
}

export function DashboardChartCard({
  title,
  subtitle,
  legend,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(cardBase, "p-6", className)}
      style={{ borderRadius: "var(--dt-card-radius, 1rem)" }}
    >
      {(title || legend) && (
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            {title && (
              <h3 className="font-display text-lg text-[var(--foreground)]">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{subtitle}</p>
            )}
          </div>
          {legend}
        </div>
      )}
      {children}
    </div>
  );
}

export function DashboardEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn(cardBase, "text-center py-14 px-8")}>
      <div
        className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
        style={{
          background: "var(--dt-accent-soft)",
          border: "1px solid var(--dt-accent-border)",
        }}
      >
        <Icon className="w-6 h-6" style={{ color: "var(--dt-accent)" }} />
      </div>
      <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] max-w-sm mx-auto mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export function DashboardBackLink({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 transition-colors",
        className
      )}
      style={{
        background: "var(--dt-accent-soft)",
        border: "1px solid var(--dt-accent-border)",
        color: "var(--foreground)",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}

export function DashboardBadge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success";
}) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
      style={
        variant === "success"
          ? {
              background: "color-mix(in srgb, var(--dt-success) 15%, transparent)",
              color: "var(--dt-success)",
              border: "1px solid color-mix(in srgb, var(--dt-success) 30%, transparent)",
            }
          : {
              background: "var(--dt-accent-soft)",
              color: "var(--dt-accent)",
              border: "1px solid var(--dt-accent-border)",
            }
      }
    >
      {children}
    </span>
  );
}

export function DashboardFilterGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string | number }[];
  value: string | number;
  onChange: (v: string | number) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-xl"
      style={{
        background: "var(--dt-accent-soft)",
        border: "1px solid var(--dt-accent-border)",
      }}
    >
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs transition-all",
            value === opt.value
              ? "font-semibold"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
          style={
            value === opt.value
              ? {
                  background: "var(--dt-accent-soft)",
                  color: "var(--dt-accent)",
                  boxShadow: "inset 0 0 0 1px var(--dt-accent-border)",
                }
              : undefined
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function DashboardRow({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(cardBase, "flex items-center gap-4 p-4 mb-3", onClick && "cursor-pointer", className)}
      style={{ borderRadius: "var(--dt-card-radius, 1rem)" }}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export function DashboardInfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className={cn(cardBase, "p-4")}
      style={{ borderRadius: "var(--dt-card-radius, 1rem)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--dt-accent-soft)" }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-[var(--muted-foreground)] mb-1">{label}</p>
          <div className="text-sm font-medium text-[var(--foreground)] break-words">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Primary CTA button — use on Link or button */
export function dtBtnPrimaryClass() {
  return "dt-btn-primary dt-touch-target inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-px active:scale-[0.97] no-underline min-w-[44px]";
}

export function dtBtnGhostClass() {
  return "dt-btn-ghost dt-touch-target inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-full text-sm font-medium transition-all hover:opacity-90 active:scale-[0.97] no-underline min-w-[44px]";
}

const btnPrimaryStyle: React.CSSProperties = {
  background: "var(--dt-accent)",
  color: "var(--dt-btn-primary-fg, #14110C)",
  border: "1px solid var(--dt-accent-border)",
};

const btnGhostStyle: React.CSSProperties = {
  background: "var(--dt-accent-soft)",
  color: "var(--foreground)",
  border: "1px solid var(--dt-accent-border)",
};

export function DashboardBtnLink({
  href,
  variant = "primary",
  className,
  children,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: "primary" | "ghost" }) {
  return (
    <Link
      href={href}
      className={cn(variant === "primary" ? dtBtnPrimaryClass() : dtBtnGhostClass(), className)}
      style={variant === "primary" ? btnPrimaryStyle : btnGhostStyle}
      {...props}
    >
      {children}
    </Link>
  );
}

export function DashboardBtn({
  variant = "primary",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  return (
    <button
      type="button"
      className={cn(variant === "primary" ? dtBtnPrimaryClass() : dtBtnGhostClass(), className)}
      style={variant === "primary" ? btnPrimaryStyle : btnGhostStyle}
      {...props}
    >
      {children}
    </button>
  );
}

export { DashboardThemePicker } from "./theme-picker";
