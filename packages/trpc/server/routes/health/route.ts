import { z, zodUndefinedModel } from "../../schema";
import { publicProcedure, router } from "../../trpc";
import db from "@repo/database";
import { sql } from "drizzle-orm";
import {
  EXPECTED_ROUTERS,
  EXPECTED_TABLES,
} from "../../utils/architecture";

export const healthRouter = router({
  getHealth: publicProcedure
    .meta({ openapi: { method: "GET", path: "/health" } })
    .input(zodUndefinedModel)
    .output(
      z.object({
        status: z.literal("healthy").describe("status of the server"),
      }),
    )
    .query(async () => {
      return {
        status: "healthy",
      };
    }),

  getArchitectureStatus: publicProcedure
    .meta({ openapi: { method: "GET", path: "/health/architecture" } })
    .input(zodUndefinedModel)
    .output(
      z.object({
        status: z.enum(["healthy", "degraded"]),
        trpc: z.object({
          routers: z.array(z.string()),
          routerCount: z.number(),
          procedureCount: z.number(),
          typeSafeClient: z.literal(true),
          inputValidation: z.literal("zod"),
          outputValidation: z.literal("zod"),
          subscriptions: z.literal(false),
        }),
        database: z.object({
          connected: z.boolean(),
          tablesFound: z.array(z.string()),
          tableCount: z.number(),
          emailPreferencesTable: z.boolean(),
          jsonbColumns: z.array(z.string()),
        }),
        scorecard: z.object({
          trpcReady: z.boolean(),
          databaseReady: z.boolean(),
        }),
      }),
    )
    .query(async () => {
      const { getTrpcArchitecture } = await import("../../utils/architecture-snapshot");
      let connected = false;
      let tablesFound: string[] = [];

      try {
        const result = await db.execute(sql`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);
        tablesFound = (result.rows as { table_name: string }[]).map((r) => r.table_name);
        connected = true;
      } catch {
        connected = false;
      }

      const { routers, procedureCount } = getTrpcArchitecture();
      const emailPreferencesTable = tablesFound.includes("email_preferences");

      const jsonbColumns = [
        "themes.config",
        "form_fields.options",
        "form_fields.validation_rules",
        "form_fields.conditional_logic",
        "templates.form_snapshot",
        "audit_logs.old_values",
        "audit_logs.new_values",
      ];

      const trpcReady =
        routers.length === EXPECTED_ROUTERS.length &&
        procedureCount >= 51 &&
        EXPECTED_ROUTERS.every((name) => routers.includes(name));

      const databaseReady =
        connected &&
        emailPreferencesTable &&
        EXPECTED_TABLES.every((t) => tablesFound.includes(t));

      return {
        status: trpcReady && databaseReady ? "healthy" : "degraded",
        trpc: {
          routers,
          routerCount: routers.length,
          procedureCount,
          typeSafeClient: true as const,
          inputValidation: "zod" as const,
          outputValidation: "zod" as const,
          subscriptions: false as const,
        },
        database: {
          connected,
          tablesFound,
          tableCount: tablesFound.length,
          emailPreferencesTable,
          jsonbColumns,
        },
        scorecard: {
          trpcReady,
          databaseReady,
        },
      };
    }),
});
