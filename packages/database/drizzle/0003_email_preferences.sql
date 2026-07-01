-- Migration 0003: Email preferences per user (GDPR-friendly notification controls)
CREATE TABLE IF NOT EXISTS "email_preferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "marketing_emails" boolean DEFAULT true NOT NULL,
  "product_updates" boolean DEFAULT true NOT NULL,
  "response_notifications" boolean DEFAULT true NOT NULL,
  "weekly_digest" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);

CREATE INDEX IF NOT EXISTS "idx_email_preferences_user_id" ON "email_preferences" ("user_id");
