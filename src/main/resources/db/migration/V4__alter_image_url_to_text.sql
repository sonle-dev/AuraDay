-- ============================================================
-- AuraDay Database Schema Migration: V4__alter_image_url_to_text.sql
-- Description: Mở rộng trường image_url trong proof_posts sang TEXT để hỗ trợ mọi URL và base64 an toàn
-- ============================================================

ALTER TABLE proof_posts ALTER COLUMN image_url TYPE TEXT;
