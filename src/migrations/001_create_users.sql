
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('super_admin', 'artist_manager', 'artist');
CREATE TYPE gender_type AS ENUM ('m', 'f', 'o');

CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    TEXT        NOT NULL,
  last_name     TEXT        NOT NULL,
  email         TEXT        UNIQUE NOT NULL,
  password      TEXT        NOT NULL,
  phone         VARCHAR(20),
  dob           DATE,
  gender        gender_type,
  address       TEXT,
  role          user_role   NOT NULL DEFAULT 'artist',
  refresh_token TEXT,                         
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);