"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "~/providers/auth-provider";
import { isAuthenticated } from "~/lib/auth";
import { useTheme } from "~/providers/theme-provider";
import {
  Sun,
  Moon,
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Loader2,
  ShieldCheck,
  Compass,
  CircleHelp,
  LayoutTemplate,
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
    if (tokenChecked && !isLoading && !user && !isAuthenticated()) router.push("/auth/login");
  }, [user, isLoading, tokenChecked, router]);

  if (!tokenChecked || isLoading) {
    return (
      <div className="dashboard-shell min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin dash-accent" />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home", active: pathname === "/dashboard" },
    {
      href: "/dashboard/forms/new",
      icon: Plus,
      label: "Create",
      active: pathname === "/dashboard/forms/new",
    },
    {
      href: "/dashboard/templates",
      icon: LayoutTemplate,
      label: "Templates",
      active: pathname.startsWith("/dashboard/templates"),
    },
    {
      href: "/dashboard/analytics",
      icon: BarChart3,
      label: "Analytics",
      active: pathname.startsWith("/dashboard/analytics"),
    },
    { href: "/explore", icon: Compass, label: "Explore", active: pathname.startsWith("/explore") },
    {
      href: "/dashboard/help",
      icon: CircleHelp,
      label: "Guide",
      active: pathname.startsWith("/dashboard/help"),
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      label: "Settings",
      active: pathname.startsWith("/dashboard/settings"),
    },
    ...(user.role === "admin"
      ? [
          {
            href: "/dashboard/admin",
            icon: ShieldCheck,
            label: "Admin",
            active: pathname.startsWith("/dashboard/admin"),
          },
        ]
      : []),
  ];

  const crumbs = pathname.split("/").filter(Boolean).slice(1);
  const crumbLabel = crumbs.length ? crumbs.join(" / ") : "home";
  const isBuilder = /\/dashboard\/forms\/[^/]+\/edit/.test(pathname);

  return (
    <div className="dashboard-shell h-screen overflow-hidden flex">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between dash-topbar px-4 h-14">
        <EdinFormLogo size={24} />
        <details className="relative">
          <summary className="list-none cursor-pointer w-9 h-9 rounded-lg border dash-border flex items-center justify-center dash-text">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-xl ef-card p-2 space-y-1 text-sm z-50">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block px-3 py-2 rounded-lg dash-text hover:opacity-80"
              >
                {label}
              </Link>
            ))}
            <div className="border-t dash-border my-1" />
            <button
              onClick={toggleTheme}
              className="w-full text-left px-3 py-2 rounded-lg dash-muted"
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-red-500">
              Sign out
            </button>
          </div>
        </details>
      </div>

      {/* Sidebar */}
      <aside className="dash-sidebar hidden lg:flex w-[248px] flex-col h-full flex-shrink-0">
        <div className="p-5 border-b dash-border flex-shrink-0">
          <EdinFormLogo size={26} />
          <p className="text-[10px] uppercase tracking-[0.2em] dash-faint mt-3 font-semibold">
            Workspace
          </p>
        </div>

        <nav className="p-3 flex-1 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, active }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "dash-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                active && "dash-nav-active font-semibold",
              )}
            >
              <Icon
                className={cn("w-4 h-4 flex-shrink-0", active ? "dash-accent" : "dash-faint")}
              />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t dash-border flex-shrink-0 space-y-3">
          {!pathname.startsWith("/dashboard/help") && (
            <Link
              href="/dashboard/help"
              className="block rounded-xl p-3 no-underline transition-colors"
              style={{
                background: "var(--dash-accent-soft)",
                border: "1px solid var(--dash-accent-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <CircleHelp className="w-4 h-4 dash-accent" />
                <span className="text-xs font-semibold dash-text">New here?</span>
              </div>
              <p className="text-[11px] leading-snug dash-muted">
                Open the full platform guide — create, share, analytics & more.
              </p>
            </Link>
          )}

          <div className="ef-bento !p-3 !shadow-none">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                style={{
                  background: "var(--dash-accent)",
                }}
              >
                {user.fullName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold dash-text truncate">{user.fullName}</p>
                <p className="text-xs dash-faint truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-xs dash-muted hover:dash-text px-2 py-2 rounded-lg w-full transition-colors"
            style={{ color: "var(--dash-muted)" }}
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {theme === "dark" ? "Switch to light" : "Switch to dark"}
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-xs px-2 py-2 rounded-lg transition-colors"
            style={{ color: "var(--dash-faint)" }}
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <main
        className={cn(
          "flex-1 pt-14 lg:pt-0 flex flex-col",
          isBuilder ? "overflow-hidden" : "overflow-y-auto",
        )}
      >
        {!isBuilder && (
          <header className="hidden lg:flex items-center justify-between px-6 lg:px-8 py-3.5 dash-topbar sticky top-0 z-30">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] dash-faint font-semibold">
                Product
              </p>
              <p className="text-sm dash-text font-medium capitalize">{crumbLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="ef-btn-ghost rounded-lg w-9 h-9 inline-flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {pathname !== "/dashboard/forms/new" && (
                <Link
                  href="/dashboard/forms/new"
                  className="ef-btn-primary rounded-full px-4 py-2 text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Blank form
                </Link>
              )}
            </div>
          </header>
        )}
        <div
          className={cn(
            "flex-1 w-full",
            isBuilder ? "overflow-hidden" : "p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto",
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
