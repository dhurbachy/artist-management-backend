
CREATE TYPE genre_type AS ENUM ('rnb', 'country', 'classic', 'rock', 'jazz');

CREATE TABLE IF NOT EXISTS songs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id  UUID        NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  album_name TEXT,
  genre      genre_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_songs_artist_id ON songs(artist_id);
CREATE INDEX idx_songs_genre     ON songs(genre);