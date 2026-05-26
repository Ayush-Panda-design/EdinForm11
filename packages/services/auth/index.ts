import { eq, and, gt } from "@repo/database";
import db, {
  usersTable,
  sessionsTable,
  verificationTokensTable,
} from "@repo/database";
import type { SignUpInput, SignInInput } from "@repo/validators/auth";
import type { AuthUser, SignInResult } from "@repo/types/auth";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { emailService } from "../email"; 

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function generateSalt(): string {
  return randomBytes(16).toString("hex");
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = hashPassword(password, salt);
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

export function createPasswordHash(password: string): string {
  const salt = generateSalt();
  const hash = hashPassword(password, salt);
  return `${salt}:${hash}`;
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function getSessionExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

function getTokenExpiry(hours: number): Date {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class AuthService {
  /** Register a new creator account */
  async signUp(input: SignUpInput): Promise<SignInResult> {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, input.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = createPasswordHash(input.password);

    const [user] = await db
      .insert(usersTable)
      .values({
        fullName: input.fullName,
        email: input.email.toLowerCase(),
        passwordHash,
        role: "creator",
        emailVerified: false,
      })
      .returning();

    if (!user) throw new Error("FAILED_TO_CREATE_USER");

    return this.createSession(user.id, {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      emailVerified: user.emailVerified,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      createdAt: user.createdAt,
    });
  }

  /** Sign in with email/password */
  async signIn(input: SignInInput, meta?: { userAgent?: string; ipAddress?: string }): Promise<SignInResult> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email.toLowerCase()))
      .limit(1);

    if (!user || !user.passwordHash) {
      throw new Error("INVALID_CREDENTIALS");
    }

    if (!user.isActive) {
      throw new Error("ACCOUNT_DISABLED");
    }

    const valid = verifyPassword(input.password, user.passwordHash);
    if (!valid) throw new Error("INVALID_CREDENTIALS");

    return this.createSession(user.id, {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      emailVerified: user.emailVerified,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      createdAt: user.createdAt,
    }, meta);
  }

  /** Create a new session for a user (with token rotation) */
  async createSession(
    userId: string,
    user: AuthUser,
    meta?: { userAgent?: string; ipAddress?: string }
  ): Promise<SignInResult> {
    const token = generateToken();
    const expiresAt = getSessionExpiry();

    await db.insert(sessionsTable).values({
      userId,
      token,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    return { user, token, expiresAt };
  }

  /** Validate a session token and return user */
  async validateToken(token: string): Promise<AuthUser | null> {
    const [row] = await db
      .select({
        session: sessionsTable,
        user: usersTable,
      })
      .from(sessionsTable)
      .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
      .where(
        and(
          eq(sessionsTable.token, token),
          gt(sessionsTable.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!row) return null;
    if (!row.user.isActive) return null;

    return {
      id: row.user.id,
      fullName: row.user.fullName,
      email: row.user.email,
      emailVerified: row.user.emailVerified,
      profileImageUrl: row.user.profileImageUrl,
      role: row.user.role,
      createdAt: row.user.createdAt,
    };
  }

  /** Invalidate a session (sign out) */
  async signOut(token: string): Promise<void> {
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }

  /** Get user profile by id */
  async getUserById(userId: string): Promise<AuthUser | null> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) return null;

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      emailVerified: user.emailVerified,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  // -------------------------------------------------------------------------
  // Email Verification
  // -------------------------------------------------------------------------

  /** Send an email verification link */
  async sendVerificationEmail(userId: string, email: string, fullName: string): Promise<void> {
    // Invalidate any existing email_verify tokens for this user
    await db
      .delete(verificationTokensTable)
      .where(
        and(
          eq(verificationTokensTable.userId, userId),
          eq(verificationTokensTable.type, "email_verify")
        )
      );

    const token = generateToken();
    const expiresAt = getTokenExpiry(24); // 24h expiry

    await db.insert(verificationTokensTable).values({
      userId,
      token,
      type: "email_verify",
      expiresAt,
    });

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const verifyUrl = `${appUrl}/auth/verify-email?token=${token}`;

    await emailService.sendEmailVerification({ to: email, fullName, verifyUrl });
  }

  /** Confirm an email verification token */
  async verifyEmail(token: string): Promise<void> {
    const [row] = await db
      .select()
      .from(verificationTokensTable)
      .where(
        and(
          eq(verificationTokensTable.token, token),
          eq(verificationTokensTable.type, "email_verify")
        )
      )
      .limit(1);

    if (!row) throw new Error("INVALID_TOKEN");
    if (row.usedAt) throw new Error("ALREADY_VERIFIED");
    if (new Date() > row.expiresAt) throw new Error("TOKEN_EXPIRED");

    // Mark user as verified
    await db
      .update(usersTable)
      .set({ emailVerified: true })
      .where(eq(usersTable.id, row.userId));

    // Mark token as used
    await db
      .update(verificationTokensTable)
      .set({ usedAt: new Date() })
      .where(eq(verificationTokensTable.id, row.id));
  }

  // -------------------------------------------------------------------------
  // Password Reset
  // -------------------------------------------------------------------------

  /** Initiate a password reset flow */
  async initiatePasswordReset(email: string): Promise<void> {
    const [user] = await db
      .select({ id: usersTable.id, fullName: usersTable.fullName, email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    // Silently return if user not found — prevent email enumeration
    if (!user) return;

    // Invalidate existing password_reset tokens
    await db
      .delete(verificationTokensTable)
      .where(
        and(
          eq(verificationTokensTable.userId, user.id),
          eq(verificationTokensTable.type, "password_reset")
        )
      );

    const token = generateToken();
    const expiresAt = getTokenExpiry(1); // 1h expiry for password resets

    await db.insert(verificationTokensTable).values({
      userId: user.id,
      token,
      type: "password_reset",
      expiresAt,
    });

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

    await emailService.sendPasswordReset({ to: user.email, fullName: user.fullName, resetUrl });
  }

  /** Complete a password reset */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const [row] = await db
      .select()
      .from(verificationTokensTable)
      .where(
        and(
          eq(verificationTokensTable.token, token),
          eq(verificationTokensTable.type, "password_reset")
        )
      )
      .limit(1);

    if (!row) throw new Error("INVALID_TOKEN");
    if (row.usedAt) throw new Error("INVALID_TOKEN");
    if (new Date() > row.expiresAt) throw new Error("TOKEN_EXPIRED");

    const passwordHash = createPasswordHash(newPassword);

    // Update password and invalidate all sessions
    await db
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, row.userId));

    // Invalidate all active sessions for security
    await db.delete(sessionsTable).where(eq(sessionsTable.userId, row.userId));

    // Mark token as used
    await db
      .update(verificationTokensTable)
      .set({ usedAt: new Date() })
      .where(eq(verificationTokensTable.id, row.id));
  }
}

export const authService = new AuthService();
