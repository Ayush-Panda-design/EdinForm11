import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { createContext } from "./context";
import type { AuthUser } from "@repo/types/auth";
import type { Context } from "./context";
import {
  isInternalInfrastructureError,
  USER_FACING_INTERNAL_ERROR,
} from "./utils/sanitize-error";
import { formatClientErrorMessage, formatZodError } from "./utils/format-validation-error";
import { ZodError } from "zod";

function sanitizeClientMessage(message: string): string {
  if (isInternalInfrastructureError(message)) {
    return USER_FACING_INTERNAL_ERROR;
  }
  return formatClientErrorMessage(message);
}

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<Awaited<ReturnType<typeof createContext>>>()
  .create({
    errorFormatter({ shape, error }) {
      let message = shape.message;
      if (error.cause instanceof ZodError) {
        message = formatZodError(error.cause);
      } else {
        message = sanitizeClientMessage(shape.message);
      }
      return {
        ...shape,
        message,
        data: {
          ...shape.data,
          domainCode: error.message,
          httpStatus: shape.data.httpStatus,
          stack: process.env.NODE_ENV === "development" ? shape.data.stack : undefined,
        },
      };
    },
  });

const errorSanitizer = tRPCContext.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof TRPCError) {
      if (isInternalInfrastructureError(error.message)) {
        console.error("[trpc] internal error:", error.cause ?? error.message);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: USER_FACING_INTERNAL_ERROR,
        });
      }
      throw error;
    }

    const raw = error instanceof Error ? error.message : String(error);
    if (isInternalInfrastructureError(raw)) {
      console.error("[trpc] internal error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: USER_FACING_INTERNAL_ERROR,
      });
    }

    throw error;
  }
});

export const router = tRPCContext.router;

/** Public procedure — no auth required */
export const publicProcedure = tRPCContext.procedure.use(errorSanitizer);

/** Protected procedure — requires valid session token */

type ProtectedContext = Omit<Context, "user"> & { user: AuthUser };

export const protectedProcedure = tRPCContext.procedure
  .use(errorSanitizer)
  .use(
    tRPCContext.middleware(async ({ ctx, next }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be signed in to perform this action.",
        });
      }
      return next({
        ctx: ctx as unknown as ProtectedContext,
      });
    })
  );

/** Admin procedure — requires role === 'admin' */
export const adminProcedure = protectedProcedure.use(
  tRPCContext.middleware(({ ctx, next }) => {
    if ((ctx.user as AuthUser | null)?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required.",
      });
    }
    return next({ ctx: ctx as unknown as ProtectedContext });
  })
);
