"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { AuthShell } from "~/components/layout/auth-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const mutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => setSent(true),
  });

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="We've sent reset instructions if an account exists."
      >
        <div className="text-center py-4">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.08)]">
            <CheckCircle className="h-7 w-7 text-[var(--signal-accent)]" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If an account with <span className="font-medium text-foreground">{email}</span> exists,
            you will receive a password reset link shortly.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--signal-accent)] hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Forgot password?" subtitle="We'll email you a secure reset link.">
      <div className="space-y-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.06)]">
          <Mail className="h-5 w-5 text-[var(--signal-accent)]" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && mutation.mutate({ email })}
            placeholder="you@example.com"
            className="ef-input w-full rounded-xl px-4 py-3 text-sm"
          />
        </div>

        <button
          onClick={() => mutation.mutate({ email })}
          disabled={mutation.isPending || !email}
          className="ef-btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </button>

        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--signal-accent)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
