"use client";

import { useAuth } from "~/providers/auth-provider";
import { useTheme } from "~/providers/theme-provider";
import { User, Mail, Shield, Bell, Sun, Moon } from "lucide-react";
import { DashPageHeader, DashPanel } from "~/components/dashboard/page-chrome";
import { BackendStatusCard } from "~/components/help/backend-status";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const rows = [
    { icon: User, label: "Full name", value: user?.fullName },
    { icon: Mail, label: "Email", value: user?.email },
    { icon: Shield, label: "Role", value: user?.role },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <DashPageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile and appearance preferences."
        helpSection="settings"
      />

      <DashPanel>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
              style={{
                background: "linear-gradient(135deg, var(--dash-accent), var(--dash-accent-2))",
              }}
            >
              {user?.fullName?.[0] || "?"}
            </div>
            <div>
              <p className="text-lg font-bold dash-text">{user?.fullName}</p>
              <p className="text-sm dash-muted capitalize">{user?.role} account</p>
            </div>
          </div>

          <div className="space-y-2">
            {rows.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 rounded-xl border dash-border"
                style={{ background: "var(--dash-accent-soft)" }}
              >
                <Icon className="w-4 h-4 dash-accent shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] dash-faint">{label}</p>
                  <p className="font-medium dash-text truncate capitalize">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashPanel>

      <DashPanel title="Appearance">
        <div className="p-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className="rounded-xl border p-4 text-left transition-all"
            style={{
              borderColor: theme === "light" ? "var(--dash-accent)" : "var(--dash-border)",
              background: theme === "light" ? "var(--dash-accent-soft)" : "transparent",
            }}
          >
            <Sun className="w-5 h-5 dash-accent mb-2" />
            <p className="font-semibold dash-text text-sm">Light</p>
            <p className="text-xs dash-muted mt-0.5">Bright magenta + cyan UI</p>
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className="rounded-xl border p-4 text-left transition-all"
            style={{
              borderColor: theme === "dark" ? "var(--dash-accent)" : "var(--dash-border)",
              background: theme === "dark" ? "var(--dash-accent-soft)" : "transparent",
            }}
          >
            <Moon className="w-5 h-5 dash-accent mb-2" />
            <p className="font-semibold dash-text text-sm">Dark</p>
            <p className="text-xs dash-muted mt-0.5">True black + cyan</p>
          </button>
        </div>
      </DashPanel>

      <DashPanel title="Notifications">
        <div className="p-5 flex items-center gap-3 text-sm dash-muted">
          <Bell className="w-4 h-4 dash-faint" />
          Per-form email, webhook, and digest settings live in each form&apos;s Settings tab.
        </div>
      </DashPanel>

      <BackendStatusCard />
    </div>
  );
}
