"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "~/providers/auth-provider";
import { isAuthenticated } from "~/lib/auth";
import { useTheme } from "~/providers/theme-provider";
import { useDashboardTemplate } from "~/providers/dashboard-template-provider";
import { Sun, Moon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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

const SIDEBAR_STORAGE_KEY = "edinform_sidebar_open";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { template } = useDashboardTemplate();
  const router = useRouter();
  const pathname = usePathname();
  const [tokenChecked, setTokenChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMounted, setSidebarMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved === "false") setSidebarOpen(false);
    setSidebarMounted(true);
  }, []);

  function toggleSidebar() {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
  }

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
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all min-h-[44px]",
      active
        ? "font-medium border"
        : "text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] border border-transparent font-normal",
    );

  const linkStyle = (active: boolean): React.CSSProperties =>
    active
      ? {
          background: "var(--dt-sidebar-accent)",
          color: "var(--foreground)",
          borderColor: "var(--dt-accent-border)",
        }
      : {};

  const navHoverStyle = (e: React.MouseEvent<HTMLElement>, enter: boolean) => {
    (e.currentTarget as HTMLElement).style.background = enter ? "var(--dt-accent-soft)" : "";
  };

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
    <div
      className="h-screen overflow-hidden flex dt-shell"
      data-dashboard-template={template}
    >

      {/* ══════ MOBILE TOP BAR ══════ */}
      <div
        className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14"
        style={{
          background: "var(--dt-sidebar-bg, var(--sidebar))",
          borderBottom: "1px solid var(--dt-card-border, var(--border))",
          backdropFilter: "blur(12px)",
        }}
      >
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
            <button onClick={toggleTheme} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[color:var(--dt-accent-soft)] min-h-[44px]">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button onClick={logout} className="w-full text-left px-3 py-2 rounded text-[color:var(--destructive)] hover:bg-white/[0.04]">
              Sign out
            </button>
          </div>
        </details>
      </div>

      {/* ══════ SIDEBAR ══════ */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-full flex-shrink-0 transition-[width,opacity] duration-300 ease-in-out overflow-hidden",
          sidebarMounted && (sidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 pointer-events-none"),
          !sidebarMounted && "w-64"
        )}
        style={{
          background: "var(--dt-sidebar-bg, var(--sidebar))",
          borderRight: sidebarOpen ? "1px solid var(--dt-card-border, var(--border))" : "none",
        }}
        aria-hidden={!sidebarOpen}
      >
        {/* Logo + close */}
        <div
          className="p-4 sm:p-5 flex-shrink-0 flex items-center justify-between gap-2 min-w-[16rem]"
          style={{ borderBottom: "1px solid var(--dt-card-border, var(--border))" }}
        >
          <EdinFormLogo size={26} />
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
            title="Close sidebar"
            className="dt-touch-target flex items-center justify-center w-10 h-10 rounded-xl transition-colors shrink-0"
            style={{
              background: "var(--dt-accent-soft)",
              border: "1px solid var(--dt-accent-border)",
              color: "var(--foreground)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dt-accent-border)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--dt-accent-soft)"; }}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links — flex-1 so it fills all space between logo and user */}
        <nav className="p-4 flex-1 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, active }) => (
            <Link key={href} href={href} className={linkClass(active)} style={linkStyle(active)} onMouseEnter={(e) => !active && navHoverStyle(e, true)} onMouseLeave={(e) => !active && navHoverStyle(e, false)}>
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: active ? "var(--dt-accent)" : "currentColor" }}
              />
              {label}
            </Link>
          ))}
        </nav>

        {/* User section — flex-shrink-0 keeps it always visible at the bottom */}
        <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid var(--dt-card-border, var(--border))" }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
              style={{
                background: "linear-gradient(140deg, var(--dt-accent) 0%, color-mix(in srgb, var(--dt-accent) 60%, #000) 100%)",
                color: "var(--dt-btn-primary-fg, #14110C)",
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
            className="dt-touch-target flex items-center gap-1.5 text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] px-3 py-2.5 rounded-lg transition-colors w-full mb-1 min-h-[44px]"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dt-accent-soft)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
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
      <main
        className="flex-1 overflow-y-auto pt-14 lg:pt-0 relative"
        style={{ background: "var(--dt-main-bg, var(--background))" }}
      >
        {/* Open sidebar — desktop, when collapsed */}
        {sidebarMounted && !sidebarOpen && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
            title="Open sidebar"
            className="hidden lg:flex fixed top-5 left-5 z-30 items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all dt-touch-target shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "var(--dt-card-bg, var(--card))",
              border: "1px solid var(--dt-accent-border)",
              color: "var(--foreground)",
            }}
          >
            <PanelLeftOpen className="w-4 h-4" style={{ color: "var(--dt-accent)" }} />
            <span className="text-xs">Menu</span>
          </button>
        )}

        <div className="p-4 sm:p-6 lg:p-8 dt-page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
