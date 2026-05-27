"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "~/trpc/client";
import { setToken, isAuthenticated } from "~/lib/auth";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { env } from "~/env.js";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

const GOOGLE_AUTH_URL =
  (env.NEXT_PUBLIC_API_BASE_URL ??
    (env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace("/trpc", "")) +
  "/auth/google";

function LoginForm() {
  const [showPass, setShowPass] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }

    const oauthError = searchParams.get("oauth_error");

    if (oauthError) {
      toast.error(decodeURIComponent(oauthError));
    }
  }, [router, searchParams]);

  const signIn = trpc.auth.signIn.useMutation({
    onSuccess: (data) => {
      setToken(data.token);
      toast.success("Welcome back, " + data.user.fullName + "!");
      window.location.href = "/dashboard";
    },
    onError: (err) => toast.error(err.message || "Invalid credentials"),
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4">
      {/* Atmospheric overlays */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[rgba(200,155,99,0.10)] blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[rgba(139,115,85,0.08)] blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-10 text-center">
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
            >
              <div className="ef-btn-primary flex h-11 w-11 items-center justify-center rounded-2xl">
                <span className="font-display text-lg font-semibold">
                  E
                </span>
              </div>

              <div className="text-left">
                <p className="font-display text-2xl tracking-tight text-foreground">
                  EdinForm
                </p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Cinematic Forms
                </p>
              </div>
            </Link>

            <div className="mx-auto mt-8 mb-6 h-px w-24 ef-divider" />

            <h1 className="font-display text-5xl leading-none tracking-[-0.04em] text-foreground">
              Welcome back
            </h1>

            <p className="mt-3 text-sm text-muted-foreground">
              Return to your workspace and continue building elegant forms.
            </p>
          </div>

          {/* Card */}
          <div className="ef-card relative overflow-hidden rounded-[28px] p-8 md:p-10">
            {/* cinematic glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[rgba(200,155,99,0.08)] blur-3xl" />
            </div>

            <div className="relative z-10 space-y-6">
              {/* Google */}
              <a
                href={GOOGLE_AUTH_URL}
                className="ef-btn-ghost flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium"
              >
                <GoogleIcon />
                Continue with Google
              </a>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full ef-divider" />
                </div>

                <div className="relative flex justify-center">
                  <span className="bg-card px-4 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                    or continue
                  </span>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit((d) => signIn.mutate(d))}
                className="space-y-5"
              >
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Email Address
                  </label>

                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="ef-input w-full rounded-2xl px-4 py-3.5 text-sm"
                  />

                  {errors.email && (
                    <p className="text-xs text-[#C97B7B]">
                      Valid email required
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      {...register("password")}
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      className="ef-input w-full rounded-2xl px-4 py-3.5 pr-12 text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPass ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="text-xs text-[#C97B7B]">
                      Password required
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={signIn.isPending}
                  className="ef-btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium disabled:opacity-50"
                >
                  {signIn.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  Sign in
                </button>

                {/* Forgot */}
                <div className="pt-1 text-center">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </form>

              {/* Footer */}
              <div className="pt-2 text-center text-sm text-muted-foreground">
                No account yet?{" "}
                <Link
                  href="/auth/register"
                  className="font-medium text-[var(--accent-amber)] transition-colors hover:opacity-80"
                >
                  Create one
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom atmosphere */}
          <div className="mt-8 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Secure authentication</span>
            <span className="h-1 w-1 rounded-full bg-[var(--accent-amber)]" />
            <span>Encrypted session</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-90"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A9 9 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
