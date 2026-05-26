"use client";
import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const mutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => setSent(true),
  });

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h1>
          <p className="text-gray-500 mb-6">If an account with <strong>{email}</strong> exists, we sent a password reset link. Check your inbox.</p>
          <Link href="/auth/login" className="text-stone-900 hover:text-stone-900 font-medium text-sm">
            ← Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-900/30 flex items-center justify-center mb-4">
            <Mail className="w-5 h-5 text-stone-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Forgot password?</h1>
          <p className="text-gray-500 text-sm mb-6">No worries — we'll send you reset instructions.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && mutation.mutate({ email })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={() => mutation.mutate({ email })}
              disabled={mutation.isPending || !email}
              className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Send reset link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
