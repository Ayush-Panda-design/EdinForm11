import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  text,
  inet,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * Audit log — records who changed what and when.
 * Append-only: never delete or update audit log entries.
 */
export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Who performed the action (null for anonymous/public actions)
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "set null" }),

  // What action was performed
  action: varchar("action", { length: 100 }).notNull(),
  // e.g. "form.created", "form.published", "form.deleted", "response.marked_spam"

  // What entity was affected
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  // e.g. "form", "response", "field", "user"
  entityId: uuid("entity_id"),

  // Before/after snapshot (optional — for update events)
  previousValues: jsonb("previous_values"),
  newValues: jsonb("new_values"),

  // Request metadata
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InsertAuditLog = typeof auditLogsTable.$inferInsert;
export type SelectAuditLog = typeof auditLogsTable.$inferSelect;
