"use client";

import { Check } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  DASHBOARD_TEMPLATES,
  getTemplateMeta,
  type DashboardTemplateId,
} from "~/lib/dashboard-templates";
import { useDashboardTemplate } from "~/providers/dashboard-template-provider";

export function DashboardThemePicker({
  onSelect,
}: {
  onSelect?: (id: DashboardTemplateId) => void;
}) {
  const { template, setTemplate } = useDashboardTemplate();

  function handleSelect(id: DashboardTemplateId) {
    setTemplate(id);
    onSelect?.(id);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {DASHBOARD_TEMPLATES.map((t) => {
        const selected = template === t.id;
        const [bg, accent, third] = t.swatches;

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => handleSelect(t.id)}
            className={cn(
              "group w-full text-left rounded-2xl overflow-hidden transition-all duration-200",
              "hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
              selected ? "ring-2 shadow-md" : "ring-1 ring-[var(--border)]"
            )}
            style={{
              background: "var(--dt-card-bg)",
              ...(selected
                ? { boxShadow: `0 8px 32px ${accent}33`, outline: `2px solid ${accent}`, outlineOffset: "0px" }
                : {}),
            }}
          >
            {/* Mini dashboard preview */}
            <div
              className="relative h-28 p-3 flex gap-2 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${bg} 0%, color-mix(in srgb, ${bg} 70%, ${accent}) 100%)`,
              }}
            >
              {/* Fake sidebar */}
              <div
                className="w-10 rounded-lg shrink-0 flex flex-col gap-1.5 p-1.5"
                style={{ background: "rgba(0,0,0,0.25)" }}
              >
                <div className="h-1.5 rounded-full" style={{ background: accent, opacity: 0.9 }} />
                <div className="h-1 rounded-full bg-white/20" />
                <div className="h-1 rounded-full bg-white/15" />
                <div className="h-1 rounded-full bg-white/15" />
              </div>
              {/* Fake content */}
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <div className="h-2 w-2/3 rounded-full bg-white/30" />
                <div className="flex gap-1.5 flex-1">
                  <div
                    className="flex-1 rounded-md p-1.5 flex flex-col gap-1"
                    style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${accent}44` }}
                  >
                    <div className="h-1 w-1/2 rounded-full" style={{ background: accent }} />
                    <div className="h-2 w-3/4 rounded-full bg-white/25" />
                  </div>
                  <div
                    className="flex-1 rounded-md p-1.5 flex flex-col gap-1"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div className="h-1 w-1/2 rounded-full bg-white/30" />
                    <div className="h-2 w-2/3 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
              {/* Accent orb */}
              <div
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-50 pointer-events-none"
                style={{ background: accent }}
              />
            </div>

            {/* Color swatches */}
            <div className="flex gap-1 px-3 py-2 border-t border-[var(--border)]">
              {[bg, accent, third].map((c) => (
                <div
                  key={c}
                  className="h-2 flex-1 rounded-full"
                  style={{ background: c }}
                />
              ))}
            </div>

            {/* Label */}
            <div className="px-4 py-3 border-t border-[var(--border)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--foreground)]">{t.name}</p>
                {selected && (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: accent, color: "#0a0a0a" }}
                  >
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-xs font-medium mt-0.5" style={{ color: accent }}>
                {t.mood}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
                {t.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function DashboardTemplateLabel() {
  const { template } = useDashboardTemplate();
  return <>{getTemplateMeta(template).name}</>;
}
