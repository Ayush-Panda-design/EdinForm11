"use client";

import Link from "next/link";
import { EdinFormLogo } from "~/components/brand/logo";
import { CheckCircle2 } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="app-auth min-h-screen grid lg:grid-cols-2">
      <div className="auth-hero hidden lg:flex flex-col justify-between p-10 xl:p-14">
        <EdinFormLogo href="/" />
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--signal-accent)] font-semibold mb-4">
            Form intelligence
          </p>
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight max-w-md">
            Build forms that feel fast, clear, and professional.
          </h2>
          <p className="mt-4 text-zinc-400 max-w-md leading-relaxed">
            Multi-step flows, live analytics, and secure submissions — designed for teams who care
            about quality.
          </p>
          <ul className="mt-10 space-y-3">
            {["Branching logic", "Real-time analytics", "Export & API access"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[var(--signal-success)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-zinc-600">© EdinForm</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <EdinFormLogo href="/" />
          </div>
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">{title}</h1>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{subtitle}</p>
          </div>
          <div className="ef-card p-8 rounded-2xl">{children}</div>
          <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
            <Link href="/" className="hover:text-[var(--signal-accent)] transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
