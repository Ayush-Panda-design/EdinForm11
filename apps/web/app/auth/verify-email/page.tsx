"use client";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");
  const mutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: (data) => { setStatus("success"); setMessage(data.message); },
    onError: (e) => { setStatus("error"); setMessage(e.message); },
  });
  useEffect(() => {
    if (token) mutation.mutate({ token });
    else { setStatus("error"); setMessage("No verification token found."); }
  }, [token]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="text-center max-w-sm">
        {status === "pending" && (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-stone-900 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email verified!</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link href="/dashboard" className="inline-block px-6 py-2.5 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-900 transition-colors">
              Go to dashboard
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification failed</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link href="/auth/login" className="text-stone-900 hover:text-stone-900 font-medium">Sign in</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-stone-900" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
