"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "~/trpc/client";
import { getToken, removeToken } from "~/lib/auth";

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  emailVerified: boolean | null;
  profileImageUrl: string | null;
  createdAt: string | null;  // ← was Date | null
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasToken, setHasToken] = useState(false);
  // mounted = true after the first client-side render, at which point
  // localStorage is readable. Before that, we treat auth as "loading".
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = !!getToken();
    setHasToken(token);
    setMounted(true);
  }, []);

  const { data: user, isLoading: queryLoading } = trpc.auth.me.useQuery(undefined, {
    enabled: hasToken && mounted,
    retry: false,
  });

  // If token existed but auth.me returned nothing → token is invalid, clear it
  useEffect(() => {
    if (mounted && hasToken && !queryLoading && !user) {
      removeToken();
    }
  }, [mounted, hasToken, queryLoading, user]);

  const signOutMutation = trpc.auth.signOut.useMutation({
    onSettled: () => {
      removeToken();
      window.location.href = "/";
    },
  });

  const logout = () => signOutMutation.mutate(undefined);

  // isLoading = true while:
  //   1. Not yet mounted (SSR / hydration)
  //   2. Token exists and auth.me query is in flight
  const isLoading = !mounted || (hasToken && queryLoading);

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
