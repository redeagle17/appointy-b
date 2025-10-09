-- =============================
-- Tenants Table
-- =============================
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id       BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    plan            VARCHAR(50) DEFAULT 'free',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- =============================
-- Users Table
-- =============================
CREATE TABLE IF NOT EXISTS users (
    user_id         BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    name            VARCHAR(255),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password        TEXT NULL,
    timezone        VARCHAR(100) DEFAULT 'UTC',
    role            VARCHAR(50) DEFAULT 'owner',
    refresh_token   VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);
