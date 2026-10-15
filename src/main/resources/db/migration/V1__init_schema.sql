-- ============================================================
-- AuraDay Database Schema Migration: V1__init_schema.sql
-- Description: Khởi tạo các bảng cốt lõi cho ứng dụng AuraDay
-- ============================================================

-- 1. Table: users
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Table: daily_logs
CREATE TABLE IF NOT EXISTS daily_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    log_date DATE NOT NULL,
    ate_on_time VARCHAR(20) NOT NULL, -- 'ON_TIME', 'LATE', 'SKIPPED'
    had_snacks BOOLEAN NOT NULL DEFAULT FALSE,
    study_minutes INT NOT NULL DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_daily_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_daily_logs_user_date UNIQUE (user_id, log_date),
    CONSTRAINT chk_study_minutes CHECK (study_minutes >= 0)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, log_date);

-- 3. Table: custom_tasks
CREATE TABLE IF NOT EXISTS custom_tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    target_time TIME,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_custom_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_custom_tasks_user_completed ON custom_tasks(user_id, is_completed);

-- 4. Table: friendships
CREATE TABLE IF NOT EXISTS friendships (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_friendships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friendships_friend FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_friendships_pair UNIQUE (user_id, friend_id),
    CONSTRAINT chk_friendships_not_self CHECK (user_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user_status ON friendships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_status ON friendships(friend_id, status);

-- 5. Table: proof_posts
CREATE TABLE IF NOT EXISTS proof_posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    daily_log_id BIGINT,
    image_url VARCHAR(500) NOT NULL,
    caption TEXT,
    privacy_mode VARCHAR(20) NOT NULL DEFAULT 'PUBLIC', -- 'PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proof_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_proof_posts_daily_log FOREIGN KEY (daily_log_id) REFERENCES daily_logs(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_proof_posts_user_created ON proof_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proof_posts_privacy ON proof_posts(privacy_mode, created_at DESC);

-- 6. Table: interactions
CREATE TABLE IF NOT EXISTS interactions (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'LIKE', 'COMMENT', 'NUDGE'
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interactions_post FOREIGN KEY (post_id) REFERENCES proof_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_interactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_interactions_post_created ON interactions(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON interactions(user_id);
