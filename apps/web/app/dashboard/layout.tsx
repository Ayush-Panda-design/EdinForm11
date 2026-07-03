"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "~/providers/auth-provider";
import { isAuthenticated } from "~/lib/auth";
import { useTheme } from "~/providers/theme-provider";
import { Sun, Moon, Search } from "lucide-react";
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
    if (tokenChecked && !isLoading && !user && !isAuthenticated()) router.push("/auth/login");
  }, [user, isLoading, tokenChecked, router]);

  if (!tokenChecked || isLoading) {
    return (
      <div className="dashboard-shell min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin ef-neon" />
      </div>
    );
  }

  if (!user) return null;

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all border",
      active
        ? "dash-nav-active font-medium"
        : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03] border-transparent font-normal",
    );

  const navItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/forms/new",
      icon: Plus,
      label: "New Form",
      active: pathname === "/dashboard/forms/new",
    },
    {
      href: "/dashboard/analytics",
      icon: BarChart3,
      label: "Analytics",
      active: pathname.startsWith("/dashboard/analytics"),
    },
    { href: "/explore", icon: FileText, label: "Explore Forms", active: false },
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

  return (
    <div className="dashboard-shell h-screen overflow-hidden flex">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between ef-glass-soft px-4 h-14">
        <EdinFormLogo size={24} />
        <details className="relative">
          <summary className="list-none cursor-pointer w-9 h-9 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center text-zinc-200">
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
                className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-zinc-200"
              >
                {label}
              </Link>
            ))}
            <div className="border-t border-white/10 my-1" />
            <button
              onClick={toggleTheme}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/[0.04] text-zinc-300"
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10"
            >
              Sign out
            </button>
          </div>
        </details>
      </div>

      {/* Sidebar */}
      <aside className="dash-sidebar hidden lg:flex w-[260px] flex-col h-full flex-shrink-0">
        <div className="p-5 border-b border-white/[0.06] flex-shrink-0">
          <EdinFormLogo size={26} />
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-3 font-medium">
            Creator workspace
          </p>
        </div>

        {/* Search bar — crypto dashboard style */}
        <div className="px-4 pt-4 flex-shrink-0">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
            <Search className="w-4 h-4 text-zinc-500" />
            <span className="text-xs text-zinc-500">Search forms...</span>
          </div>
        </div>

        <nav className="p-4 flex-1 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, active }) => (
            <Link key={href} href={href} className={linkClass(active)}>
              <Icon
                className={cn("w-4 h-4 flex-shrink-0", active ? "text-[#00e5c2]" : "text-zinc-500")}
              />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.06] flex-shrink-0">
          <div className="ef-bento p-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #00e5c2 0%, #00b894 100%)",
                  color: "#000",
                }}
              >
                {user.fullName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate">{user.fullName}</p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors w-full mb-1"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-xs text-zinc-500 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-500/[0.06] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
