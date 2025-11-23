DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================
-- Tenants Table
-- =============================
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    plan            VARCHAR(50) DEFAULT 'free',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- =============================
-- Users Table
-- =============================
CREATE TABLE IF NOT EXISTS users (
    user_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    name            VARCHAR(255),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password        TEXT NULL,
    timezone        VARCHAR(100) DEFAULT 'UTC',
    role            VARCHAR(50) DEFAULT 'owner',
    refresh_token   TEXT,
    google_id      VARCHAR(255) UNIQUE,
    profile_pic     TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    google_calendar_access_token TEXT,
    google_calendar_refresh_token TEXT,
    google_calendar_token_expires TIMESTAMPTZ,
    google_calendar_connected BOOLEAN DEFAULT false,
    google_calendar_email VARCHAR(255)
);

-- =============================
-- Meeting Types Table
-- =============================
CREATE TABLE IF NOT EXISTS meeting_types (
    meeting_type_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    slug                VARCHAR(255) UNIQUE NOT NULL,
    url_path            VARCHAR(255) UNIQUE,    
    duration_min        INT NOT NULL,
    buffer_before       INT DEFAULT 0,
    buffer_after        INT DEFAULT 0,
    max_per_day         INT DEFAULT NULL,
    location_type       VARCHAR(50) DEFAULT 'online'
                        CHECK (location_type IN ('online', 'phone', 'in_person')),
    visibility          VARCHAR(20) DEFAULT 'public'
                        CHECK (visibility IN ('public', 'private', 'team')),
    active              BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- =============================
-- Availability rule Table
-- =============================
CREATE TABLE IF NOT EXISTS availability_rules (
    rule_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES users(user_id),
    day_of_week  INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL
);

-- =============================
-- Availability exception Table
-- =============================
CREATE TABLE IF NOT EXISTS availability_exceptions (
    exception_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID NOT NULL REFERENCES users(user_id),
    start_datetime TIMESTAMPTZ,
    end_datetime   TIMESTAMPTZ,
    type           VARCHAR(20) CHECK (type IN ('available', 'unavailable'))
);

-- =============================
-- Events Table
-- =============================
CREATE TABLE IF NOT EXISTS events (
    event_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(tenant_id),
    user_id         UUID NOT NULL REFERENCES users(user_id),
    meeting_type_id UUID NOT NULL REFERENCES meeting_types(meeting_type_id),

    start_datetime  TIMESTAMPTZ NOT NULL,
    end_datetime    TIMESTAMPTZ NOT NULL,
    status          VARCHAR(20) DEFAULT 'scheduled',

    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- =============================
-- Event Invitees Table
-- =============================
CREATE TABLE IF NOT EXISTS event_invitees (
    invitee_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id     UUID NOT NULL REFERENCES events(event_id),
    name         VARCHAR(255),
    email        VARCHAR(255),
    created_at   TIMESTAMPTZ DEFAULT now()
);