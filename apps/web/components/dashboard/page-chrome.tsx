import type { LucideIcon } from "lucide-react";
import { HelpTip } from "~/components/help/help-tip";
import type { SectionHelpKey } from "~/lib/help-content";

export function DashPageHeader({
  eyebrow,
  title,
  description,
  actions,
  helpSection,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  helpSection?: SectionHelpKey;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
      <div>
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-[0.22em] dash-faint font-semibold mb-2">
            {eyebrow}
          </p>
        )}
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight dash-text">{title}</h1>
          {helpSection && <HelpTip section={helpSection} size="md" />}
        </div>
        {description && <p className="mt-2 text-sm dash-muted max-w-xl">{description}</p>}
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
        <span className="text-[10px] uppercase tracking-[0.2em] dash-faint font-medium">
          {label}
        </span>
        <Icon className="w-4 h-4 dash-accent opacity-90" />
      </div>
      <p className="dash-stat-value">
        {value}
        {suffix && <span className="text-base dash-accent ml-0.5">{suffix}</span>}
      </p>
      {delta && (
        <p className={`mt-2 text-xs ${deltaUp ? "text-[var(--dash-success)]" : "dash-faint"}`}>
          {delta}
        </p>
      )}
    </div>
  );
}

export function DashPanel({
  title,
  action,
  helpSection,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  helpSection?: SectionHelpKey;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`ef-bento overflow-hidden !p-0 ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b dash-border">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] dash-faint font-semibold">
              {title}
            </span>
            {helpSection && <HelpTip section={helpSection} />}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
