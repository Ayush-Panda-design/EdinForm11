"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "~/providers/auth-provider";
import { isAuthenticated } from "~/lib/auth";
import { useTheme } from "~/providers/theme-provider";
import { Sun, Moon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { EdinFormLogo } from "~/components/brand/logo";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    setTokenChecked(true);
    if (!isAuthenticated()) router.push("/auth/login");
  }, [router]);

  useEffect(() => {
    if (tokenChecked && !isLoading && !user && !isAuthenticated())
      router.push("/auth/login");
  }, [user, isLoading, tokenChecked, router]);

  if (!tokenChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin ef-amber" />
      </div>
    );
  }

  if (!user) return null;

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
      active
        ? "bg-[rgba(200,155,99,0.10)] text-[color:var(--foreground)] border border-[rgba(200,155,99,0.18)] font-medium"
        : "text-[color:var(--muted-foreground)] hover:bg-white/[0.03] hover:text-[color:var(--foreground)] border border-transparent font-normal",
    );

  const navItems = [
    { href: "/dashboard",           icon: LayoutDashboard, label: "Dashboard",    active: pathname === "/dashboard" },
    { href: "/dashboard/forms/new", icon: Plus,            label: "New Form",     active: pathname === "/dashboard/forms/new" },
    { href: "/dashboard/analytics", icon: BarChart3,       label: "Analytics",    active: pathname.startsWith("/dashboard/analytics") },
    { href: "/explore",             icon: FileText,        label: "Explore Forms",active: false },
    { href: "/dashboard/settings",  icon: Settings,        label: "Settings",     active: pathname.startsWith("/dashboard/settings") },
    ...(user.role === "admin"
      ? [{ href: "/dashboard/admin", icon: ShieldCheck, label: "Admin", active: pathname.startsWith("/dashboard/admin") }]
      : []),
  ];

  return (
    /* KEY FIX: h-screen + overflow-hidden on the shell so sidebar can be h-full */
    <div className="h-screen overflow-hidden flex">

      {/* ══════ MOBILE TOP BAR ══════ */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between ef-glass-soft px-4 h-14">
        <EdinFormLogo size={24} />
        <details className="relative">
          <summary className="list-none cursor-pointer w-9 h-9 rounded-md ef-btn-ghost flex items-center justify-center text-[color:var(--foreground)]">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-lg ef-glass p-2 space-y-1 text-sm z-50">
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} className="block px-3 py-2 rounded hover:bg-white/[0.04]">{label}</Link>
            ))}
            <div className="border-t border-[color:var(--border)] my-1" />
            <button onClick={toggleTheme} className="w-full text-left px-3 py-2 rounded hover:bg-white/[0.04]">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button onClick={logout} className="w-full text-left px-3 py-2 rounded text-[color:var(--destructive)] hover:bg-white/[0.04]">
              Sign out
            </button>
          </div>
        </details>
      </div>

      {/* ══════ SIDEBAR ══════ */}
      {/* h-full works because parent is h-screen (defined height, not min-h-screen) */}
      <aside className="hidden lg:flex w-64 flex-col h-full bg-[color:var(--sidebar)] border-r border-[color:var(--border)] flex-shrink-0">

        {/* Logo */}
        <div className="p-6 border-b border-[color:var(--border)] flex-shrink-0">
          <EdinFormLogo size={26} />
        </div>

        {/* Nav links — flex-1 so it fills all space between logo and user */}
        <nav className="p-4 flex-1 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, active }) => (
            <Link key={href} href={href} className={linkClass(active)}>
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: active ? "#C89B63" : "currentColor" }}
              />
              {label}
            </Link>
          ))}
        </nav>

        {/* User section — flex-shrink-0 keeps it always visible at the bottom */}
        <div className="p-4 border-t border-[color:var(--border)] flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
              style={{
                background: "linear-gradient(140deg, #C89B63 0%, #8B7355 100%)",
                color: "#14110C",
              }}
            >
              {user.fullName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[color:var(--foreground)] truncate">{user.fullName}</p>
              <p className="text-xs text-[color:var(--muted-foreground)] truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors w-full mb-1"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-xs text-[color:var(--muted-foreground)] hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-500/[0.06] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* ══════ MAIN CONTENT ══════ */}
      {/* overflow-y-auto here so only main scrolls, sidebar stays fixed */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
