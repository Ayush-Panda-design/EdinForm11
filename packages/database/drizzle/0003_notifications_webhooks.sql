ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "webhook_url" text;
ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "digest_enabled" boolean DEFAULT false NOT NULL;
