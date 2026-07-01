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
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { themesTable } from "./themes";

// Visibility enum
export const formVisibilityEnum = pgEnum("form_visibility", [
  "public",
  "unlisted",
  "unpublished",
]);

export const formFieldTypeEnum = pgEnum("form_field_type", [
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "date",
  "rating",
]);

export const formsTable = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    themeId: uuid("theme_id").references(() => themesTable.id, {
      onDelete: "set null",
    }),

    title: varchar("title", { length: 300 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 300 }).notNull().unique(),

    visibility: formVisibilityEnum("visibility").default("unpublished").notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),

    // Submission settings
    allowMultipleResponses: boolean("allow_multiple_responses")
      .default(true)
      .notNull(),
    showProgressBar: boolean("show_progress_bar").default(true).notNull(),
    shuffleFields: boolean("shuffle_fields").default(false).notNull(),
    closeAfterDate: timestamp("close_after_date"),
    maxResponses: integer("max_responses"),

    // Branding
    submitButtonText: varchar("submit_button_text", { length: 100 }).default(
      "Submit"
    ),
    successMessage: text("success_message").default(
      "Thank you for your response!"
    ),
    redirectUrl: text("redirect_url"),

    // Notification settings
    notifyCreatorOnSubmission: boolean("notify_creator_on_submission")
      .default(true)
      .notNull(),
    sendConfirmationEmail: boolean("send_confirmation_email")
      .default(false)
      .notNull(),
    confirmationEmailField: uuid("confirmation_email_field"),

    // Password protection
    isPasswordProtected: boolean("is_password_protected").default(false).notNull(),
    passwordHash: text("password_hash"),

    // Soft delete
    deletedAt: timestamp("deleted_at"),

    // Meta
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    // Index on deletedAt for soft-delete queries
    deletedAtIdx: index("idx_forms_deleted_at").on(table.deletedAt),
    // Index for creator + archived queries
    creatorArchivedIdx: index("idx_forms_creator_archived").on(
      table.creatorId,
      table.isArchived
    ),
  })
);

export const formPagesTable = pgTable("form_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const formFieldsTable = pgTable("form_fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),
  pageId: uuid("page_id").references(() => formPagesTable.id, {
    onDelete: "set null",
  }),

  type: formFieldTypeEnum("type").notNull(),
  label: varchar("label", { length: 500 }).notNull(),
  placeholder: text("placeholder"),
  helpText: text("help_text"),
  required: boolean("required").default(false).notNull(),
  order: integer("order").default(0).notNull(),

  // For select/multi-select fields: [{ value, label }]
  options: jsonb("options"),

  // Validation rules: { min, max, minLength, maxLength, pattern, ... }
  validationRules: jsonb("validation_rules"),

  // Conditional logic: { showIf: { fieldId, operator, value } }
  conditionalLogic: jsonb("conditional_logic"),

  // Lock field from editing when responses exist
  isLocked: boolean("is_locked").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;
export type SelectFormPage = typeof formPagesTable.$inferSelect;
export type InsertFormPage = typeof formPagesTable.$inferInsert;
