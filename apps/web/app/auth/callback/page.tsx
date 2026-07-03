"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "~/lib/auth";
import { Loader2 } from "lucide-react";
import { AuthShell } from "~/components/layout/auth-shell";

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
          token_exchange_failed:
            "Google redirect URI mismatch. Check BASE_URL and Google Cloud Console.",
          db_error: "Database error during sign-in. Check Render logs and run migrations.",
          oauth_failed: "Google sign-in failed. Please try again.",
          account_disabled: "Your account has been disabled.",
        }[error] ?? "Sign-in failed. Please try again.";

      router.replace(`/auth/login?oauth_error=${encodeURIComponent(msg)}`);
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
    <AuthShell title="Signing you in" subtitle="Completing secure authentication…">
      <div className="flex items-center justify-center gap-3 py-6">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--signal-accent)]" />
        <span className="text-sm text-muted-foreground">Please wait</span>
      </div>
    </AuthShell>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense>
      <OAuthCallbackInner />
    </Suspense>
  );
}
