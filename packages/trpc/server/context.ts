import type { Request, Response } from "express";
import { authService } from "@repo/services/auth";
import type { AuthUser } from "@repo/types/auth";

export interface CreateContextOptions {
  req: Request;
  res: Response;
}

export async function createContext({ req, res }: CreateContextOptions) {
  let user: AuthUser | null = null;

  // 1. Try Authorization: Bearer header (localStorage / API clients)
  const authHeader = req.headers.authorization;
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }
  // 2. Fallback: httpOnly cookie (browser-native, XSS-safe)
  else if ((req as any).cookies?.formcraft_token) {
    token = (req as any).cookies.formcraft_token as string;
  }

  if (token) {
    try {
      user = await authService.validateToken(token);
    } catch {
      // Invalid token — leave user as null
    }
  }

  return {
    req,
    res,
    user,
    requireAuth(): AuthUser {
      if (!user) throw new Error("UNAUTHORIZED");
      return user;
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
