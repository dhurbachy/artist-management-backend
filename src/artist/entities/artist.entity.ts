export interface Artist {
  id:                    string;
  user_id:               string | null;
  name:                  string;
  dob:                   Date   | null;
  gender:                'm' | 'f' | 'o' | null;
  address:               string | null;
  first_release_year:    number | null;
  no_of_albums_released: number;
  created_at:            Date;
  updated_at:            Date;
}