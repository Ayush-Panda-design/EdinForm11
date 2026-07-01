"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import {
  KeyRound,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const mutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setDone(true);

      setTimeout(() => {
        router.push("/auth/login");
      }, 2500);
    },

    onError: (e) => {
      toast.error(e.message);
    },
  });

  if (!token) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
        {/* Atmosphere */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-[rgba(200,155,99,0.10)] blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[rgba(139,115,85,0.08)] blur-3xl" />
        </div>

        <div className="ef-card relative z-10 max-w-md rounded-[28px] p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(200,155,99,0.18)] bg-[rgba(200,155,99,0.08)]">
            <KeyRound className="h-6 w-6 text-[var(--accent-amber)]" />
          </div>

          <h1 className="font-display text-4xl tracking-[-0.04em] text-foreground">
            Invalid reset link
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>

          <Link
            href="/auth/forgot-password"
            className="ef-btn-primary mt-7 inline-flex rounded-2xl px-5 py-3 text-sm font-medium"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(200,155,99,0.10)] blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(200,155,99,0.20)] bg-[rgba(200,155,99,0.08)]">
            <CheckCircle className="h-8 w-8 text-[var(--accent-amber)]" />
          </div>

          <h1 className="font-display text-5xl tracking-[-0.05em] text-foreground">
            Password reset
          </h1>

          <p className="mt-4 text-sm text-muted-foreground">
            Redirecting you back to sign in…
          </p>
        </div>
      </div>
    );
  }

  const isValid =
    password.length >= 8 &&
    password === confirm;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Cinematic atmosphere */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[rgba(200,155,99,0.10)] blur-3xl" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[620px] w-[620px] rounded-full bg-[rgba(139,115,85,0.08)] blur-3xl" />

        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px)] [background-size:80px_100%]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(200,155,99,0.16)] bg-[rgba(200,155,99,0.08)]">
            <KeyRound className="h-6 w-6 text-[var(--accent-amber)]" />
          </div>

          <div className="mx-auto mb-6 h-px w-24 ef-divider" />

          <h1 className="font-display text-5xl leading-none tracking-[-0.045em] text-foreground">
            Set new password
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Your new password must contain at least 8 characters.
          </p>
        </div>

        {/* Card */}
        <div className="ef-card relative overflow-hidden rounded-[30px] p-8 md:p-10">
          {/* Warm glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[rgba(200,155,99,0.08)] blur-3xl" />
          </div>

          <div className="relative z-10 space-y-5">
            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="ef-input w-full rounded-2xl px-4 py-3.5 pr-12 text-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Confirm Password
              </label>

              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={`ef-input w-full rounded-2xl px-4 py-3.5 text-sm ${
                  confirm && password !== confirm
                    ? "!border-[#C97B7B] focus:!border-[#C97B7B]"
                    : ""
                }`}
              />

              {confirm && password !== confirm && (
                <p className="text-xs text-[#C97B7B]">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={() =>
                mutation.mutate({
                  token,
                  password,
                })
              }
              disabled={mutation.isPending || !isValid}
              className="ef-btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}

              Reset password
            </button>
          </div>
        </div>

        {/* Footer meta */}
        <div className="mt-8 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>Encrypted recovery</span>

          <span className="h-1 w-1 rounded-full bg-[var(--accent-amber)]" />

          <span>Secure authentication</span>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
