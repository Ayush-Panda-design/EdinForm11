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
      const msg = {
        google_denied: "Google sign-in was cancelled.",
        invalid_state: "Invalid OAuth state. Please try again.",
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-50 dark:from-gray-950 dark:to-gray-900">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-900 to-stone-900 flex items-center justify-center mx-auto">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Signing you in…</span>
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
