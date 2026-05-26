import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { authService } from "@repo/services/auth";
import { emailService } from "@repo/services/email";
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@repo/validators/auth";

const TAGS = ["Auth"];
const getPath = generatePath("/auth");

// Helper: set auth cookie on the Express response
function setAuthCookie(ctx: { res?: { setHeader: (name: string, value: string | string[]) => void } }, token: string, expiresAt: Date): void {
  if (!ctx.res) return;
  const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
const isProduction = process.env.NODE_ENV === "production";
  const cookieValue = [
    `formcraft_token=${token}`,
    `Max-Age=${maxAge}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    ...(isProduction ? ["Secure"] : []),
  ].join("; ");
  ctx.res.setHeader("Set-Cookie", cookieValue);
}

function clearAuthCookie(ctx: { res?: { setHeader: (name: string, value: string | string[]) => void } }): void {
  if (!ctx.res) return;
  ctx.res.setHeader("Set-Cookie", "formcraft_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax");
}

export const authRouter = router({
  signUp: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/sign-up"), tags: TAGS } })
    .input(signUpSchema)
    .output(z.object({
      token: z.string(),
      expiresAt: z.date(),
      user: z.object({ id: z.string(), fullName: z.string(), email: z.string(), role: z.string() }),
    }))
  .mutation(async ({ input, ctx }) => {
      try {
        const result = await authService.signUp(input);
        // Send welcome email AND verification email (non-blocking)
        emailService.sendWelcomeEmail(result.user.email, result.user.fullName).catch(() => {});
        authService.sendVerificationEmail(result.user.id, result.user.email, result.user.fullName).catch(() => {});
        setAuthCookie(ctx as any, result.token, result.expiresAt);
        return result;
      } catch (err) {
        if ((err as Error).message === "EMAIL_ALREADY_EXISTS") {
          throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
        }
        throw err;
      }
    }),

  signIn: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/sign-in"), tags: TAGS } })
    .input(signInSchema)
    .output(z.object({
      token: z.string(),
      expiresAt: z.date(),
      user: z.object({ id: z.string(), fullName: z.string(), email: z.string(), role: z.string() }),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const ipAddress = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? ctx.req.socket.remoteAddress;
        const userAgent = ctx.req.headers["user-agent"];
        const result = await authService.signIn(input, { ipAddress, userAgent });
        setAuthCookie(ctx as any, result.token, result.expiresAt);
        return result;
      } catch (err) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
      }
    }),

  signOut: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/sign-out"), tags: TAGS } })
    .input(z.undefined())
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      const token = ctx.req.headers.authorization?.slice(7)
        ?? (ctx.req as any).cookies?.formcraft_token
        ?? "";
      await authService.signOut(token);
      clearAuthCookie(ctx as any);
      return { success: true };
    }),

  me: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/me"), tags: TAGS } })
    .input(z.undefined())
    .output(z.object({
      id: z.string(), fullName: z.string(), email: z.string(),
      emailVerified: z.boolean().nullable(), profileImageUrl: z.string().nullable(),
      role: z.string(), createdAt: z.date().nullable(),
    }))
    .query(({ ctx }) => ctx.user),

  // -----------------------------------------------------------------------
  // Email verification
  // -----------------------------------------------------------------------
  verifyEmail: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/verify-email"), tags: TAGS } })
    .input(z.object({ token: z.string().min(1) }))
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await authService.verifyEmail(input.token);
        return { success: true, message: "Email verified successfully." };
      } catch (err) {
        const msg = (err as Error).message;
        if (msg === "INVALID_TOKEN" || msg === "TOKEN_EXPIRED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This verification link is invalid or has expired.",
          });
        }
        if (msg === "ALREADY_VERIFIED") {
          throw new TRPCError({ code: "CONFLICT", message: "Email is already verified." });
        }
        throw err;
      }
    }),

  resendVerification: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/resend-verification"), tags: TAGS } })
    .input(z.undefined())
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      if (ctx.user.emailVerified) {
        throw new TRPCError({ code: "CONFLICT", message: "Email is already verified." });
      }
      await authService.sendVerificationEmail(ctx.user.id, ctx.user.email, ctx.user.fullName);
      return { success: true };
    }),

  // -----------------------------------------------------------------------
  // Password reset
  // -----------------------------------------------------------------------
  forgotPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/forgot-password"), tags: TAGS } })
    .input(forgotPasswordSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      // Always return success to prevent email enumeration
      await authService.initiatePasswordReset(input.email).catch(() => {});
      return { success: true };
    }),

  resetPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/reset-password"), tags: TAGS } })
    .input(resetPasswordSchema)
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await authService.resetPassword(input.token, input.password);
        return { success: true, message: "Password reset successfully. You can now sign in." };
      } catch (err) {
        const msg = (err as Error).message;
        if (msg === "INVALID_TOKEN" || msg === "TOKEN_EXPIRED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This reset link is invalid or has expired. Please request a new one.",
          });
        }
        throw err;
      }
    }),
});
