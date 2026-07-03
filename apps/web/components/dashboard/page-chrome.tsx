import type { LucideIcon } from "lucide-react";

export function DashPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
      <div>
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-semibold mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{title}</h1>
        {description && <p className="mt-2 text-sm text-zinc-400 max-w-xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function DashStat({
  label,
  value,
  suffix,
  delta,
  deltaUp,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  delta?: string;
  deltaUp?: boolean;
  icon: LucideIcon;
}) {
  return (
    <div className="ef-bento h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
          {label}
        </span>
        <Icon className="w-4 h-4 text-[var(--signal-accent)] opacity-90" />
      </div>
      <p className="dash-stat-value">
        {value}
        {suffix && <span className="text-base text-[var(--signal-accent)] ml-0.5">{suffix}</span>}
      </p>
      {delta && (
        <p className={`mt-2 text-xs ${deltaUp ? "text-[var(--signal-success)]" : "text-zinc-500"}`}>
          {delta}
        </p>
      )}
    </div>
  );
}

export function DashPanel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`ef-bento overflow-hidden p-0 ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">
            {title}
          </span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
