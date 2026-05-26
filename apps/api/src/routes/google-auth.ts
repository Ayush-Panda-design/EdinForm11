/**
 * Google OAuth 2.0 — redirect-based flow
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   APP_URL (e.g. http://localhost:3000)
 *   BASE_URL (e.g. http://localhost:8000)
 */
import type { Router } from "express";
import { randomBytes } from "crypto";
import { authService } from "@repo/services/auth";
import db, { usersTable } from "@repo/database";
import { eq } from "@repo/database";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const BASE_URL = process.env.BASE_URL ?? "http://localhost:8000";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const REDIRECT_URI = `${BASE_URL}/auth/google/callback`;

// Simple in-memory state store (CSRF guard)
const stateStore = new Map<string, number>();

export function registerGoogleAuthRoutes(router: Router): void {
  router.get("/auth/google", (_req, res) => {
    if (!GOOGLE_CLIENT_ID) {
      res.status(503).json({ error: "Google OAuth is not configured." });
      return;
    }
    const state = randomBytes(16).toString("hex");
    stateStore.set(state, Date.now());
    // Prune states older than 10 min
    for (const [k, t] of stateStore) {
      if (Date.now() - t > 600_000) stateStore.delete(k);
    }
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "select_account",
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  router.get("/auth/google/callback", async (req, res) => {
    const { code, state, error } = req.query as Record<string, string>;
    if (error) { res.redirect(`${APP_URL}/auth/login?error=google_denied`); return; }
    if (!state || !stateStore.has(state)) { res.redirect(`${APP_URL}/auth/login?error=invalid_state`); return; }
    stateStore.delete(state);
    try {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: // After
new URLSearchParams({
  code: req.query.code as string ?? "",
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  redirect_uri: REDIRECT_URI,
  grant_type: "authorization_code",
}),
      });
      if (!tokenRes.ok) throw new Error("token_exchange_failed");
      const { access_token } = await tokenRes.json() as { access_token: string };

      const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (!profileRes.ok) throw new Error("profile_fetch_failed");
      const profile = await profileRes.json() as {
        sub: string; email: string; name: string; picture: string; email_verified: boolean;
      };

      let [user] = await db.select().from(usersTable)
        .where(eq(usersTable.email, profile.email.toLowerCase())).limit(1);

      if (!user) {
        const [created] = await db.insert(usersTable).values({
          fullName: profile.name,
          email: profile.email.toLowerCase(),
          passwordHash: null,
          role: "creator",
          emailVerified: profile.email_verified,
          profileImageUrl: profile.picture,
          googleId: profile.sub,
        }).returning();
        user = created!;
      } else if (!user.googleId) {
        const [updated] = await db.update(usersTable)
          .set({ googleId: profile.sub, emailVerified: true, profileImageUrl: user.profileImageUrl ?? profile.picture })
          .where(eq(usersTable.id, user.id)).returning();
        user = updated!;
      }

      if (!user.isActive) { res.redirect(`${APP_URL}/auth/login?error=account_disabled`); return; }

      const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress;
      const session = await authService.createSession(user.id, {
        id: user.id, fullName: user.fullName, email: user.email,
        emailVerified: user.emailVerified, profileImageUrl: user.profileImageUrl ?? null,
        role: user.role, createdAt: user.createdAt,
      }, { ipAddress, userAgent: req.headers["user-agent"] });

      res.redirect(`${APP_URL}/auth/callback?token=${session.token}`);
    } catch (err) {
      console.error("[Google OAuth]", err);
      res.redirect(`${APP_URL}/auth/login?error=oauth_failed`);
    }
  });
}
