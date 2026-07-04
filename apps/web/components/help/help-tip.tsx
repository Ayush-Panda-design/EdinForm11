"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { CircleHelp, X, ArrowRight } from "lucide-react";
import type { HelpTipContent } from "~/lib/help-content";
import { SECTION_HELP, type SectionHelpKey } from "~/lib/help-content";
import { cn } from "~/lib/utils";

type HelpTipProps = {
  section?: SectionHelpKey;
  content?: HelpTipContent;
  label?: string;
  className?: string;
  size?: "sm" | "md";
  align?: "left" | "right";
};

export function HelpTip({
  section,
  content: contentProp,
  label = "Help",
  className,
  size = "sm",
  align = "right",
}: HelpTipProps) {
  const content: HelpTipContent | null = contentProp ?? (section ? SECTION_HELP[section] : null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!content) return null;

  const btnSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${label}: ${content.title}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          btnSize,
          "rounded-full inline-flex items-center justify-center transition-all",
          "border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-muted)]",
          "hover:text-[var(--dash-accent)] hover:border-[var(--dash-accent-border)] hover:bg-[var(--dash-accent-soft)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)]/30",
          open &&
            "text-[var(--dash-accent)] border-[var(--dash-accent-border)] bg-[var(--dash-accent-soft)]",
        )}
      >
        <CircleHelp className={iconSize} />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={content.title}
          className={cn(
            "absolute z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border p-4 shadow-xl",
            align === "right" ? "right-0" : "left-0",
          )}
          style={{
            background: "var(--dash-card)",
            borderColor: "var(--dash-border)",
            boxShadow: "var(--dash-shadow)",
          }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold dash-faint">
                Guide
              </p>
              <h3 className="text-sm font-semibold dash-text mt-0.5">{content.title}</h3>
            </div>
            <button
              type="button"
              aria-label="Close help"
              onClick={() => setOpen(false)}
              className="p-1 rounded-md dash-faint hover:dash-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs leading-relaxed dash-muted">{content.body}</p>

          {content.steps && content.steps.length > 0 && (
            <ol className="mt-3 space-y-1.5">
              {content.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs dash-text">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{
                      background: "var(--dash-accent-soft)",
                      color: "var(--dash-accent)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="leading-snug pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          )}

          {content.tip && (
            <p
              className="mt-3 text-[11px] leading-relaxed rounded-lg px-2.5 py-2"
              style={{
                background: "var(--dash-accent-soft)",
                color: "var(--dash-text)",
              }}
            >
              <span className="font-semibold dash-accent">Tip: </span>
              {content.tip}
            </p>
          )}

          {content.guideHref && (
            <Link
              href={content.guideHref}
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold dash-accent hover:underline"
            >
              {content.guideLabel ?? "Open full guide"}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/** Section header with optional help tip — use on page sections */
export function HelpSectionTitle({
  children,
  section,
  content,
  className,
}: {
  children: React.ReactNode;
  section?: SectionHelpKey;
  content?: HelpTipContent;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="min-w-0">{children}</div>
      <HelpTip section={section} content={content} />
    </div>
  );
}
