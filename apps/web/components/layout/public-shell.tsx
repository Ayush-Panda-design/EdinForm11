"use client";

import Link from "next/link";
import { EdinFormLogo } from "~/components/brand/logo";

export function PublicShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="app-public min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <EdinFormLogo href="/" />
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-[var(--muted-foreground)]">
            <Link href="/explore" className="hover:text-[var(--signal-accent)] transition-colors">
              Explore
            </Link>
            <Link href="/pricing" className="hover:text-[var(--signal-accent)] transition-colors">
              Pricing
            </Link>
            <Link href="/auth/login" className="ef-btn-ghost rounded-lg px-4 py-2 text-sm">
              Sign in
            </Link>
            <Link href="/auth/register" className="ef-btn-primary rounded-lg px-4 py-2 text-sm">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-[var(--border)] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)]">
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
