-- ============================================================
-- EdinForm5 patch.sql
-- Run this ONCE against your live Postgres database to fix:
--   1. Missing is_password_protected / password_hash columns
--   2. Promote a user to admin so the Admin panel appears
-- ============================================================

-- 1. Add the missing columns (safe – uses IF NOT EXISTS)
ALTER TABLE "forms"
  ADD COLUMN IF NOT EXISTS "is_password_protected" boolean NOT NULL DEFAULT false;

ALTER TABLE "forms"
  ADD COLUMN IF NOT EXISTS "password_hash" text;

-- 2. Promote a user to admin.
--    Replace 'your@email.com' with the email of the account you want to be admin.
--    After saving, refresh the dashboard – the Admin link will appear.
UPDATE "users"
  SET "role" = 'admin'
  WHERE "email" = 'your@email.com';

-- Optional: to promote ALL existing users to admin (dev/testing only):
-- UPDATE "users" SET "role" = 'admin';

-- Verify:
-- SELECT id, email, role FROM users ORDER BY created_at LIMIT 10;
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'forms' AND column_name IN ('is_password_protected','password_hash');
