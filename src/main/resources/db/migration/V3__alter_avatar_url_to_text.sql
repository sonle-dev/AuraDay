-- ============================================================
-- AuraDay Database Schema Migration: V3__alter_avatar_url_to_text.sql
-- Description: Mở rộng trường avatar_url sang TEXT để lưu trữ URL linh hoạt
-- ============================================================

ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;
