
CREATE TABLE IF NOT EXISTS artists (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        REFERENCES users(id) ON DELETE SET NULL,
  name                  TEXT        NOT NULL,
  dob                   DATE,
  gender                gender_type,
  address               TEXT,
  first_release_year    INTEGER,
  no_of_albums_released INTEGER     NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_artists_user_id ON artists(user_id);
CREATE INDEX idx_artists_name    ON artists(name);