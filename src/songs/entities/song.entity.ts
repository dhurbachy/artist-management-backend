export type GenreType = 'rnb' | 'country' | 'classic' | 'rock' | 'jazz';

export interface Song {
  id:         string;
  artist_id:  string;
  title:      string;
  album_name: string | null;
  genre:      GenreType | null;
  created_at: Date;
  updated_at: Date;
}