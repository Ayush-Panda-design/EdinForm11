-- ============================================================
-- FormCraft — Full Schema Migration
-- Adds all tables beyond the starter "users" table
-- ============================================================

-- Sessions for auth
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "expires_at" timestamp NOT NULL,
  "user_agent" text,
  "ip_address" varchar(45),
  "created_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_sessions_user_id" ON "sessions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_sessions_expires_at" ON "sessions"("expires_at");

-- Verification tokens (email_verify, password_reset)
CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "type" varchar(30) NOT NULL,
  "expires_at" timestamp NOT NULL,
  "used_at" timestamp,
  "created_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_vt_user_type" ON "verification_tokens"("user_id", "type");

-- Themes
CREATE TABLE IF NOT EXISTS "themes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text,
  "config" jsonb NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);

-- Templates
CREATE TABLE IF NOT EXISTS "templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(200) NOT NULL,
  "description" text,
  "category" varchar(50),
  "form_snapshot" jsonb NOT NULL,
  "preview_image_url" text,
  "is_public" boolean DEFAULT true NOT NULL,
  "usage_count" varchar(20) DEFAULT '0',
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);

-- Forms visibility enum
DO $$ BEGIN
  CREATE TYPE "form_visibility" AS ENUM ('public', 'unlisted', 'unpublished');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Form field type enum
DO $$ BEGIN
  CREATE TYPE "form_field_type" AS ENUM (
    'short_text', 'long_text', 'email', 'number',
    'single_select', 'multi_select', 'checkbox', 'date', 'rating'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Forms
CREATE TABLE IF NOT EXISTS "forms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "theme_id" uuid REFERENCES "themes"("id") ON DELETE SET NULL,
  "title" varchar(300) NOT NULL,
  "description" text,
  "slug" varchar(300) NOT NULL UNIQUE,
  "visibility" "form_visibility" DEFAULT 'unpublished' NOT NULL,
  "is_archived" boolean DEFAULT false NOT NULL,
  "allow_multiple_responses" boolean DEFAULT true NOT NULL,
  "show_progress_bar" boolean DEFAULT true NOT NULL,
  "shuffle_fields" boolean DEFAULT false NOT NULL,
  "close_after_date" timestamp,
  "max_responses" integer,
  "submit_button_text" varchar(100) DEFAULT 'Submit',
  "success_message" text DEFAULT 'Thank you for your response!',
  "redirect_url" text,
  "notify_creator_on_submission" boolean DEFAULT true NOT NULL,
  "send_confirmation_email" boolean DEFAULT false NOT NULL,
  "confirmation_email_field" uuid,
  "deleted_at" timestamp,
  "published_at" timestamp,
  "is_password_protected" boolean DEFAULT false NOT NULL,
  "password_hash" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);
CREATE INDEX IF NOT EXISTS "idx_forms_creator_archived" ON "forms"("creator_id", "is_archived");
CREATE INDEX IF NOT EXISTS "idx_forms_deleted_at" ON "forms"("deleted_at");
CREATE INDEX IF NOT EXISTS "idx_forms_visibility" ON "forms"("visibility") WHERE "deleted_at" IS NULL;

-- Form pages (for multi-page forms)
CREATE TABLE IF NOT EXISTS "form_pages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "form_id" uuid NOT NULL REFERENCES "forms"("id") ON DELETE CASCADE,
  "title" varchar(200),
  "description" text,
  "order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now()
);

-- Form fields
CREATE TABLE IF NOT EXISTS "form_fields" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "form_id" uuid NOT NULL REFERENCES "forms"("id") ON DELETE CASCADE,
  "page_id" uuid REFERENCES "form_pages"("id") ON DELETE SET NULL,
  "type" "form_field_type" NOT NULL,
  "label" varchar(500) NOT NULL,
  "placeholder" text,
  "help_text" text,
  "required" boolean DEFAULT false NOT NULL,
  "order" integer DEFAULT 0 NOT NULL,
  "options" jsonb,
  "validation_rules" jsonb,
  "conditional_logic" jsonb,
  "is_locked" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);
CREATE INDEX IF NOT EXISTS "idx_form_fields_form_order" ON "form_fields"("form_id", "order");

-- Response status enum
DO $$ BEGIN
  CREATE TYPE "response_status" AS ENUM ('in_progress', 'completed', 'spam');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Form responses
CREATE TABLE IF NOT EXISTS "form_responses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "form_id" uuid NOT NULL REFERENCES "forms"("id") ON DELETE CASCADE,
  "status" "response_status" DEFAULT 'completed' NOT NULL,
  "respondent_email" varchar(255),
  "respondent_name" varchar(200),
  "ip_address" varchar(45),
  "user_agent" text,
  "referrer" text,
  "completion_time_seconds" integer,
  "browser_fingerprint" varchar(64),
  "submitted_at" timestamp DEFAULT now(),
  "created_at" timestamp DEFAULT now()
);
-- Partial unique index: one fingerprint per form (dedup, only completed responses)
CREATE UNIQUE INDEX IF NOT EXISTS "uq_form_fingerprint_completed"
  ON "form_responses"("form_id", "browser_fingerprint")
  WHERE browser_fingerprint IS NOT NULL AND status = 'completed';
CREATE INDEX IF NOT EXISTS "idx_form_responses_form_submitted" ON "form_responses"("form_id", "submitted_at");

-- Response answers
CREATE TABLE IF NOT EXISTS "response_answers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "response_id" uuid NOT NULL REFERENCES "form_responses"("id") ON DELETE CASCADE,
  "field_id" uuid NOT NULL REFERENCES "form_fields"("id") ON DELETE CASCADE,
  "form_id" uuid NOT NULL REFERENCES "forms"("id") ON DELETE CASCADE,
  "value" text,
  "value_array" jsonb,
  "created_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_response_answers_response" ON "response_answers"("response_id");
CREATE INDEX IF NOT EXISTS "idx_response_answers_form_field" ON "response_answers"("form_id", "field_id");

-- Form views (for analytics)
CREATE TABLE IF NOT EXISTS "form_views" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "form_id" uuid NOT NULL REFERENCES "forms"("id") ON DELETE CASCADE,
  "ip_address" varchar(45),
  "user_agent" text,
  "referrer" text,
  "viewed_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_form_views_form_viewed" ON "form_views"("form_id", "viewed_at");

-- Daily analytics aggregate
CREATE TABLE IF NOT EXISTS "analytics" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "form_id" uuid NOT NULL REFERENCES "forms"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  "views" integer DEFAULT 0 NOT NULL,
  "submissions" integer DEFAULT 0 NOT NULL,
  "conversion_rate" varchar(10),
  "unique_visitors" integer DEFAULT 0 NOT NULL,
  "avg_completion_seconds" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp,
  UNIQUE("form_id", "date")
);

-- Audit logs (append-only)
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "action" varchar(100) NOT NULL,
  "entity_type" varchar(50) NOT NULL,
  "entity_id" uuid,
  "previous_values" jsonb,
  "new_values" jsonb,
  "ip_address" varchar(45),
  "user_agent" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user" ON "audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id");

-- Backfill missing columns on users table (starter migration was minimal)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" varchar(255) UNIQUE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" varchar(20) DEFAULT 'creator' NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
