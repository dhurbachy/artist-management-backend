import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../core/database/database.service';
import { BaseRepository } from '../core/database/base.repository';
import { Song } from './entities/song.entity';

@Injectable()
export class SongsRepository extends BaseRepository<Song> {
  protected readonly table = 'songs';

  constructor(db: DatabaseService) {
    super(db);
  }

  async findByArtistPaginated(
    artistId: string,
    page:     number,
    limit:    number,
  ): Promise<{ data: Song[]; total: number; page: number; lastPage: number }> {
    const offset = (page - 1) * limit;

    const [data, countResult] = await Promise.all([
      this.db.query<Song>(
        `SELECT * FROM songs
         WHERE artist_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [artistId, limit, offset],
      ),
      this.db.queryOne<{ count: string }>(
        `SELECT COUNT(*)::int AS count
         FROM songs
         WHERE artist_id = $1`,
        [artistId],
      ),
    ]);

    const total = parseInt(countResult?.count ?? '0', 10);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }


  // ensures song belongs to the given artist
  async findByIdAndArtist(
    songId:   string,
    artistId: string,
  ): Promise<Song | null> {
    const sql = `
      SELECT * FROM songs
      WHERE id        = $1
        AND artist_id = $2
      LIMIT 1
    `;
    return this.db.queryOne<Song>(sql, [songId, artistId]);
  }

  async createSong(data: {
    artist_id:  string;
    title:      string;
    album_name?: string;
    genre?:      string;
  }): Promise<Song> {
    const sql = `
      INSERT INTO songs
        (artist_id, title, album_name, genre)
      VALUES
        ($1, $2, $3, $4)
      RETURNING *
    `;
    const result=await this.db.queryOne<Song>(sql, [
      data.artist_id,
      data.title,
      data.album_name ?? null,
      data.genre      ?? null,
    ]);
    if(!result) throw new InternalServerErrorException('Song Creation Failed');
    return result;
  }

  async updateSong(
    songId:   string,
    artistId: string,
    data:     Record<string, any>,
  ): Promise<Song | null> {
    const keys       = Object.keys(data);
    const values     = Object.values(data);
    const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

    const sql = `
      UPDATE songs
      SET ${setClauses}, updated_at = NOW()
      WHERE id        = $${keys.length + 1}
        AND artist_id = $${keys.length + 2}
      RETURNING *
    `;
    return this.db.queryOne<Song>(sql, [...values, songId, artistId]);
  }

  async deleteSong(
    songId:   string,
    artistId: string,
  ): Promise<Song | null> {
    const sql = `
      DELETE FROM songs
      WHERE id        = $1
        AND artist_id = $2
      RETURNING *
    `;
    return this.db.queryOne<Song>(sql, [songId, artistId]);
  }

  async findSongWithArtist(songId: string): Promise<any> {
    const sql = `
      SELECT
        s.id,
        s.title,
        s.album_name,
        s.genre,
        s.created_at,
        s.updated_at,
        json_build_object(
          'id',   a.id,
          'name', a.name
        ) AS artist
      FROM songs s
      INNER JOIN artists a ON a.id = s.artist_id
      WHERE s.id = $1
      LIMIT 1
    `;
    return this.db.queryOne(sql, [songId]);
  }
}