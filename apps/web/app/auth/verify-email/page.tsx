"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import {
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<
    "pending" | "success" | "error"
  >("pending");

  const [message, setMessage] = useState("");

  const mutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setMessage(data.message);
    },

    onError: (e) => {
      setStatus("error");
      setMessage(e.message);
    },
  });

  useEffect(() => {
    if (token) {
      mutation.mutate({ token });
    } else {
      setStatus("error");
      setMessage("No verification token found.");
    }
  }, [token]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Cinematic background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[rgba(200,155,99,0.10)] blur-3xl" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[620px] w-[620px] rounded-full bg-[rgba(139,115,85,0.08)] blur-3xl" />

        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px)] [background-size:80px_100%]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="ef-card overflow-hidden rounded-[30px] p-10 text-center">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[rgba(200,155,99,0.08)] blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* Pending */}
            {status === "pending" && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(200,155,99,0.18)] bg-[rgba(200,155,99,0.08)]">
                  <Loader2 className="h-7 w-7 animate-spin text-[var(--accent-amber)]" />
                </div>

                <div className="mx-auto mb-6 h-px w-24 ef-divider" />

                <h1 className="font-display text-5xl tracking-[-0.05em] text-foreground">
                  Verifying
                </h1>

                <p className="mt-4 text-sm text-muted-foreground">
                  Confirming your email address…
                </p>
              </>
            )}

            {/* Success */}
            {status === "success" && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(200,155,99,0.18)] bg-[rgba(200,155,99,0.08)]">
                  <CheckCircle className="h-8 w-8 text-[var(--accent-amber)]" />
                </div>

                <div className="mx-auto mb-6 h-px w-24 ef-divider" />

                <h1 className="font-display text-5xl tracking-[-0.05em] text-foreground">
                  Email verified
                </h1>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {message}
                </p>

                <Link
                  href="/dashboard"
                  className="ef-btn-primary mt-8 inline-flex rounded-2xl px-6 py-3 text-sm font-medium"
                >
                  Go to dashboard
                </Link>
              </>
            )}

            {/* Error */}
            {status === "error" && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(201,123,123,0.20)] bg-[rgba(201,123,123,0.08)]">
                  <XCircle className="h-8 w-8 text-[#C97B7B]" />
                </div>

                <div className="mx-auto mb-6 h-px w-24 ef-divider" />

                <h1 className="font-display text-5xl tracking-[-0.05em] text-foreground">
                  Verification failed
                </h1>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {message}
                </p>

                <Link
                  href="/auth/login"
                  className="mt-8 inline-flex text-sm text-[var(--accent-amber)] transition-opacity hover:opacity-80"
                >
                  Return to sign in
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Footer detail */}
        <div className="mt-8 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>Secure identity verification</span>

          <span className="h-1 w-1 rounded-full bg-[var(--accent-amber)]" />

          <span>Encrypted confirmation flow</span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
          {/* Ambient background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[rgba(200,155,99,0.10)] blur-3xl" />

            <div className="absolute bottom-[-15%] right-[-10%] h-[620px] w-[620px] rounded-full bg-[rgba(139,115,85,0.08)] blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-5 py-4 backdrop-blur-xl">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-amber)]" />

            <span className="text-sm text-muted-foreground">
              Loading verification…
            </span>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
