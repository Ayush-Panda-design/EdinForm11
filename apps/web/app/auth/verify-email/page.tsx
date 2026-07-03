"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { AuthShell } from "~/components/layout/auth-shell";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
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
    if (token) mutation.mutate({ token });
    else {
      setStatus("error");
      setMessage("No verification token found.");
    }
  }, [token, mutation]);

  if (status === "pending") {
    return (
      <AuthShell title="Verifying email" subtitle="Confirming your address…">
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--signal-accent)]" />
        </div>
      </AuthShell>
    );
  }

  if (status === "success") {
    return (
      <AuthShell title="Email verified" subtitle={message}>
        <div className="text-center py-4">
          <CheckCircle className="mx-auto h-10 w-10 text-[var(--signal-success)] mb-6" />
          <Link
            href="/dashboard"
            className="ef-btn-primary inline-flex rounded-xl px-6 py-3 text-sm"
          >
            Go to dashboard
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Verification failed" subtitle={message}>
      <div className="text-center py-4">
        <XCircle className="mx-auto h-10 w-10 text-red-400 mb-6" />
        <Link href="/auth/login" className="text-sm text-[var(--signal-accent)] hover:opacity-80">
          Return to sign in
        </Link>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Loading" subtitle="Preparing verification…">
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--signal-accent)]" />
          </div>
        </AuthShell>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
