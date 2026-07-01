"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "~/lib/auth";
import { Loader2 } from "lucide-react";

function OAuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      const msg =
        {
          google_denied: "Google sign-in was cancelled.",
          invalid_state: "Invalid OAuth state. Please try again.",
          oauth_failed: "Google sign-in failed. Please try again.",
          account_disabled: "Your account has been disabled.",
        }[error] ?? "Sign-in failed. Please try again.";

      router.replace(
        `/auth/login?oauth_error=${encodeURIComponent(msg)}`
      );

      return;
    }

    if (token) {
      setToken(token);
      window.location.href = "/dashboard";
      return;
    }

    router.replace("/auth/login");
  }, [searchParams, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[rgba(200,155,99,0.10)] blur-3xl" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[620px] w-[620px] rounded-full bg-[rgba(139,115,85,0.08)] blur-3xl" />

        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px)] [background-size:80px_100%]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Brand */}
        <div className="mb-8 inline-flex flex-col items-center">
          <div className="ef-btn-primary flex h-14 w-14 items-center justify-center rounded-2xl">
            <span className="font-display text-xl font-semibold">
              E
            </span>
          </div>

          <div className="mx-auto mt-6 mb-5 h-px w-20 ef-divider" />

          <h1 className="font-display text-4xl tracking-[-0.04em] text-foreground">
            EdinForm
          </h1>

          <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Secure Authentication
          </p>
        </div>

        {/* Loading state */}
        <div className="ef-card inline-flex items-center gap-3 rounded-2xl px-5 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--accent-amber)]" />

          <span className="text-sm text-muted-foreground">
            Signing you in…
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense>
      <OAuthCallbackInner />
    </Suspense>
  );
}
