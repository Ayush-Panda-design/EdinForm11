"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const mutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => setSent(true),
  });

  if (sent) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
        {/* Atmosphere */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[rgba(200,155,99,0.10)] blur-3xl" />

          <div className="absolute bottom-[-15%] right-[-10%] h-[620px] w-[620px] rounded-full bg-[rgba(139,115,85,0.08)] blur-3xl" />

          <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px)] [background-size:80px_100%]" />
        </div>

        <div className="relative z-10 w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(200,155,99,0.20)] bg-[rgba(200,155,99,0.08)]">
            <CheckCircle className="h-8 w-8 text-[var(--accent-amber)]" />
          </div>

          <div className="mx-auto mb-6 h-px w-24 ef-divider" />

          <h1 className="font-display text-5xl tracking-[-0.05em] text-foreground">
            Check your email
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            If an account with{" "}
            <span className="font-medium text-foreground">
              {email}
            </span>{" "}
            exists, we've sent password reset instructions.
          </p>

          <Link
            href="/auth/login"
            className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Ambient cinematic layers */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[rgba(200,155,99,0.10)] blur-3xl" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[620px] w-[620px] rounded-full bg-[rgba(139,115,85,0.08)] blur-3xl" />

        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px)] [background-size:80px_100%]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back */}
        <Link
          href="/auth/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        {/* Card */}
        <div className="ef-card relative overflow-hidden rounded-[30px] p-8 md:p-10">
          {/* Warm glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[rgba(200,155,99,0.08)] blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* Icon */}
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(200,155,99,0.16)] bg-[rgba(200,155,99,0.08)]">
              <Mail className="h-6 w-6 text-[var(--accent-amber)]" />
            </div>

            <div className="mb-6 h-px w-20 ef-divider" />

            {/* Heading */}
            <h1 className="font-display text-5xl leading-none tracking-[-0.045em] text-foreground">
              Forgot password?
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              No worries — we'll send you a secure password reset link.
            </p>

            {/* Form */}
            <div className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    mutation.mutate({ email })
                  }
                  placeholder="you@example.com"
                  className="ef-input w-full rounded-2xl px-4 py-3.5 text-sm"
                />
              </div>

              <button
                onClick={() =>
                  mutation.mutate({
                    email,
                  })
                }
                disabled={mutation.isPending || !email}
                className="ef-btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}

                Send reset link
              </button>
            </div>
          </div>
        </div>

        {/* Footer detail */}
        <div className="mt-8 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>Encrypted email recovery</span>

          <span className="h-1 w-1 rounded-full bg-[var(--accent-amber)]" />

          <span>Secure access flow</span>
        </div>
      </div>
    </div>
  );
}
