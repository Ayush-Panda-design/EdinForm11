import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { formsTable } from "./forms";

// Per-request view events for fine-grained analytics
export const formViewsTable = pgTable("form_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

// Daily aggregate analytics per form (upserted daily)
export const analyticsTable = pgTable("analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  views: integer("views").default(0).notNull(),
  submissions: integer("submissions").default(0).notNull(),
  // Derived: submissions / views * 100
  conversionRate: varchar("conversion_rate", { length: 10 }),
  uniqueVisitors: integer("unique_visitors").default(0).notNull(),
  avgCompletionSeconds: integer("avg_completion_seconds").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectFormView = typeof formViewsTable.$inferSelect;
export type InsertFormView = typeof formViewsTable.$inferInsert;
export type SelectAnalytics = typeof analyticsTable.$inferSelect;
export type InsertAnalytics = typeof analyticsTable.$inferInsert;
