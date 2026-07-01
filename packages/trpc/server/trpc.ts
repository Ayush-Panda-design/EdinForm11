import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { createContext } from "./context";
import type { AuthUser } from "@repo/types/auth";
import type { Context } from "./context";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
.context<Awaited<ReturnType<typeof createContext>>>()
  .create({
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          // Surface our domain error codes to clients
          domainCode: error.message,
          // Include HTTP status code mapping
          httpStatus: shape.data.httpStatus,
          // Stack only in dev
          stack: process.env.NODE_ENV === "development" ? shape.data.stack : undefined,
        },
      };
    },
  });

export const router = tRPCContext.router;

/** Public procedure — no auth required */
export const publicProcedure = tRPCContext.procedure;

/** Protected procedure — requires valid session token */


type ProtectedContext = Omit<Context, "user"> & { user: AuthUser };

export const protectedProcedure = tRPCContext.procedure.use(
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
