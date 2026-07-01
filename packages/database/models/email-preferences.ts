import {
  pgTable,
  uuid,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const emailPreferencesTable = pgTable("email_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  marketingEmails: boolean("marketing_emails").default(true).notNull(),
  productUpdates: boolean("product_updates").default(true).notNull(),
  responseNotifications: boolean("response_notifications").default(true).notNull(),
  weeklyDigest: boolean("weekly_digest").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectEmailPreferences = typeof emailPreferencesTable.$inferSelect;
export type InsertEmailPreferences = typeof emailPreferencesTable.$inferInsert;
