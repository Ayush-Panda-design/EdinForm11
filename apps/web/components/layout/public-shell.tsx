"use client";

import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { EdinFormLogo } from "~/components/brand/logo";
import { useTheme } from "~/providers/theme-provider";

export function PublicShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-public min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <EdinFormLogo href="/" />
          <nav className="flex items-center gap-3 sm:gap-5 text-sm font-medium text-[var(--muted-foreground)]">
            <Link
              href="/explore"
              className="hidden sm:inline hover:text-[var(--signal-accent)] transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/pricing"
              className="hidden sm:inline hover:text-[var(--signal-accent)] transition-colors"
            >
              Pricing
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="ef-btn-ghost rounded-lg w-9 h-9 inline-flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/auth/login" className="ef-btn-ghost rounded-lg px-3 py-2 text-sm">
              Sign in
            </Link>
            <Link href="/auth/register" className="ef-btn-primary rounded-full px-4 py-2 text-sm">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-[var(--border)] py-14 px-4 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 8% 12%, color-mix(in srgb, var(--signal-accent) 16%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 92% 8%, rgba(34, 211, 238, 0.14), transparent 50%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">{children}</main>
    </div>
  );
}
