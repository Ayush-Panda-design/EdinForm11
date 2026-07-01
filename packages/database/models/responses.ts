import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  jsonb,
  timestamp,
  integer,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { formsTable } from "./forms";
import { formFieldsTable } from "./forms";

export const responseStatusEnum = pgEnum("response_status", [
  "in_progress",
  "completed",
  "spam",
]);

export const formResponsesTable = pgTable(
  "form_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),

    status: responseStatusEnum("status").default("completed").notNull(),

    // Respondent metadata (anonymous - no login needed)
    respondentEmail: varchar("respondent_email", { length: 255 }),
    respondentName: varchar("respondent_name", { length: 200 }),

    // Analytics metadata
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    referrer: text("referrer"),
    completionTimeSeconds: integer("completion_time_seconds"),

    // Browser fingerprint for deduplication: SHA-256 of "formId:ip:userAgent"
    browserFingerprint: varchar("browser_fingerprint", { length: 64 }),

    submittedAt: timestamp("submitted_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    // Partial unique index: one fingerprint per form (only for completed, non-spam)
    fingerprintUniqueIdx: uniqueIndex("uq_form_fingerprint_completed")
      .on(table.formId, table.browserFingerprint)
      .where(sql`browser_fingerprint IS NOT NULL AND status = 'completed'`),
    // Index for fast lookup by formId + submittedAt
    formSubmittedIdx: index("idx_form_responses_form_submitted")
      .on(table.formId, table.submittedAt),
  })
);

export const responseAnswersTable = pgTable("response_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  responseId: uuid("response_id")
    .notNull()
    .references(() => formResponsesTable.id, { onDelete: "cascade" }),
  fieldId: uuid("field_id")
    .notNull()
    .references(() => formFieldsTable.id, { onDelete: "cascade" }),
  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),

  // Store as text for all types; arrays stored as JSON string
  value: text("value"),
  // For multi-select / checkbox arrays
  valueArray: jsonb("value_array"),

  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectFormResponse = typeof formResponsesTable.$inferSelect;
export type InsertFormResponse = typeof formResponsesTable.$inferInsert;
export type SelectResponseAnswer = typeof responseAnswersTable.$inferSelect;
export type InsertResponseAnswer = typeof responseAnswersTable.$inferInsert;
