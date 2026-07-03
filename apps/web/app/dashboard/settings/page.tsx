"use client";

import { useAuth } from "~/providers/auth-provider";
import { User, Mail, Shield, Bell } from "lucide-react";
import { DashPageHeader, DashPanel } from "~/components/dashboard/page-chrome";

export default function SettingsPage() {
  const { user } = useAuth();

  const rows = [
    { icon: User, label: "Full name", value: user?.fullName },
    { icon: Mail, label: "Email", value: user?.email },
    { icon: Shield, label: "Role", value: user?.role },
  ];

  return (
    <div className="max-w-2xl">
      <DashPageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile and workspace preferences."
      />

      <DashPanel>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-black"
              style={{ background: "linear-gradient(135deg, #22d3ee 0%, #34d399 100%)" }}
            >
              {user?.fullName?.[0] || "?"}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{user?.fullName}</p>
              <p className="text-sm text-zinc-500 capitalize">{user?.role} account</p>
            </div>
          </div>

          <div className="space-y-2">
            {rows.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
              >
                <Icon className="w-4 h-4 text-[var(--signal-accent)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
                  <p className="font-medium text-zinc-100 truncate capitalize">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashPanel>

      <DashPanel title="Notifications" className="mt-4">
        <div className="p-5 flex items-center gap-3 text-sm text-zinc-400">
          <Bell className="w-4 h-4 text-zinc-500" />
          Email notifications for new responses — coming soon.
        </div>
      </DashPanel>
    </div>
  );
}
