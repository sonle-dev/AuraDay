-- ============================================================
-- AuraDay Database Migration: V2__add_user_bio_and_settings.sql
-- Description: Bổ sung trường bio và default_privacy_mode cho users
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_privacy_mode VARCHAR(20) NOT NULL DEFAULT 'FRIENDS_ONLY';
