-- Migration 0002: Add password-protection columns to forms
-- Safe to run even if the main schema already has these columns.
ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "is_password_protected" boolean NOT NULL DEFAULT false;
ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "password_hash" text;
