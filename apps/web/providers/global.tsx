"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { Toaster } from "~/components/ui/sonner";
import { trpc } from "~/trpc/client";
import { httpLink } from "@trpc/client";
import { env } from "~/env.js";
import { getToken } from "~/lib/auth";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";

function makeTrpcClient() {
  return trpc.createClient({
    links: [
      httpLink({
        url: env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/trpc",
        headers() {
          const token = getToken();
          return token
            ? { Authorization: `Bearer ${token}`, "x-csrf-token": "1" }
            : { "x-csrf-token": "1" };
        },
      }),
    ],
  });
}

export const GlobalProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
      })
  );
  const [trpcClient] = useState(() => makeTrpcClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* Our own ThemeProvider — persists to localStorage, applies .dark class */}
      <ThemeProvider>
        <trpc.Provider queryClient={queryClient} client={trpcClient}>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </trpc.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
