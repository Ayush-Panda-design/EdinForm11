"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { KeyRound, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "~/components/layout/auth-shell";

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
      setTimeout(() => router.push("/auth/login"), 2500);
    },
    onError: (e) => toast.error(e.message),
  });

  if (!token) {
    return (
      <AuthShell title="Invalid reset link" subtitle="This link is invalid or has expired.">
        <div className="text-center py-4">
          <KeyRound className="mx-auto h-8 w-8 text-[var(--signal-accent)] mb-4" />
          <Link
            href="/auth/forgot-password"
            className="ef-btn-primary inline-flex rounded-xl px-5 py-3 text-sm"
          >
            Request a new link
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password reset" subtitle="Redirecting you to sign in…">
        <div className="flex justify-center py-6">
          <CheckCircle className="h-10 w-10 text-[var(--signal-success)]" />
        </div>
      </AuthShell>
    );
  }

  const isValid = password.length >= 8 && password === confirm;

  return (
    <AuthShell title="Set new password" subtitle="Use at least 8 characters.">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            New password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="ef-input w-full rounded-xl px-4 py-3 pr-12 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Confirm
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="ef-input w-full rounded-xl px-4 py-3 text-sm"
          />
          {confirm && password !== confirm && (
            <p className="text-xs text-red-400">Passwords do not match</p>
          )}
        </div>

        <button
          onClick={() => mutation.mutate({ token, password })}
          disabled={mutation.isPending || !isValid}
          className="ef-btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Reset password
        </button>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
