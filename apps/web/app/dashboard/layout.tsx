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
    if (!isAuthenticated()) {
      router.push("/auth/login");
    }
  }, [router]);

  useEffect(() => {
    if (tokenChecked && !isLoading && !user && !isAuthenticated()) {
      router.push("/auth/login");
    }
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
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
      active
        ? "bg-white/[0.05] text-[color:var(--foreground)] border border-[color:var(--border)]"
        : "text-[color:var(--muted-foreground)] hover:bg-white/[0.03] hover:text-[color:var(--foreground)]",
    );

  return (
    <div className="min-h-screen flex">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between ef-glass-soft px-4 h-14">
        <EdinFormLogo size={24} />
        <details className="relative">
          <summary className="list-none cursor-pointer w-9 h-9 rounded-md ef-btn-ghost flex items-center justify-center text-[color:var(--foreground)]">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-lg ef-glass p-2 space-y-1 text-sm">
            <Link href="/dashboard" className="block px-3 py-2 rounded hover:bg-white/[0.04]">Dashboard</Link>
            <Link href="/dashboard/forms/new" className="block px-3 py-2 rounded hover:bg-white/[0.04]">New form</Link>
            <Link href="/dashboard/analytics" className="block px-3 py-2 rounded hover:bg-white/[0.04]">Analytics</Link>
            <Link href="/explore" className="block px-3 py-2 rounded hover:bg-white/[0.04]">Templates</Link>
            <Link href="/dashboard/settings" className="block px-3 py-2 rounded hover:bg-white/[0.04]">Settings</Link>
            {user.role === "admin" && (
              <Link href="/dashboard/admin" className="block px-3 py-2 rounded hover:bg-white/[0.04]">Admin</Link>
            )}
            <div className="border-t border-[color:var(--border)] my-1" />
            <button
              onClick={toggleTheme}
              className="w-full text-left px-3 py-2 rounded hover:bg-white/[0.04]"
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded text-[color:var(--destructive)] hover:bg-white/[0.04]"
            >
              Sign out
            </button>
          </div>
        </details>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[color:var(--sidebar)]/80 backdrop-blur-xl border-r border-[color:var(--border)] flex-col fixed h-full">
        <div className="p-6 border-b border-[color:var(--border)]">
          <EdinFormLogo size={26} />
        </div>

        <nav className="p-4 flex-1 space-y-1">
          <Link href="/dashboard" className={linkClass(pathname === "/dashboard")}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/dashboard/forms/new" className={linkClass(pathname === "/dashboard/forms/new")}>
            <Plus className="w-4 h-4" /> New Form
          </Link>
          <Link href="/dashboard/analytics" className={linkClass(pathname === "/dashboard/analytics")}>
            <BarChart3 className="w-4 h-4" /> Analytics
          </Link>
          <Link href="/explore" className={linkClass(false)}>
            <FileText className="w-4 h-4" /> Explore Forms
          </Link>
          <Link href="/dashboard/settings" className={linkClass(pathname === "/dashboard/settings")}>
            <Settings className="w-4 h-4" /> Settings
          </Link>
          {user.role === "admin" && (
            <Link href="/dashboard/admin" className={linkClass(pathname.startsWith("/dashboard/admin"))}>
              <ShieldCheck className="w-4 h-4" /> Admin
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-[color:var(--border)]">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{
                background: "linear-gradient(140deg, #C89B63 0%, #8B7355 100%)",
                color: "#14110C",
              }}
            >
              {user.fullName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[color:var(--foreground)] truncate">
                {user.fullName}
              </p>
              <p className="text-xs text-[color:var(--muted-foreground)] truncate">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)] px-2 py-1.5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
