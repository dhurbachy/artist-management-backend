import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../core/database/database.service';
import { BaseRepository } from '../core/database/base.repository';
import { Artist } from './entities/artist.entity';

@Injectable()
export class ArtistsRepository extends BaseRepository<Artist> {
  protected readonly table = 'artists';

  constructor(db: DatabaseService) {
    super(db);
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Artist[]; total: number; page: number; lastPage: number }> {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const offset = (page - 1) * limit;

    const [data, countResult] = await Promise.all([
      this.db.query<Artist>(
        `SELECT * FROM artists ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      this.db.queryOne<{ count: string }>(
        `SELECT COUNT(*) AS count FROM artists`,  // remove ::int, handle in JS
      ),
    ]);

    const total = parseInt(countResult?.count ?? '0', 10);
      const lastPage = total === 0 ? 1 : Math.ceil(total / limit);


    return {
      data,
      total,
      page,
      lastPage,
    };
  }

  async findArtistById(id: string): Promise<Artist | null> {
    const sql = `
      SELECT * FROM artists
      WHERE id = $1
      LIMIT 1
    `;
    return this.db.queryOne<Artist>(sql, [id]);
  }

  async createArtist(data: {
    user_id?: string;
    name: string;
    dob?: string;
    gender?: string;
    address?: string;
    first_release_year?: number;
    no_of_albums_released?: number;
  }): Promise<Artist> {
    const sql = `
      INSERT INTO artists
        (user_id, name, dob, gender, address, first_release_year, no_of_albums_released)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await this.db.queryOne<Artist>(sql, [
      data.user_id ?? null,
      data.name,
      data.dob ?? null,
      data.gender ?? null,
      data.address ?? null,
      data.first_release_year ?? null,
      data.no_of_albums_released ?? 0,
    ]);
    if (!result) throw new InternalServerErrorException('Artist creation failed');
    return result;
  }

  async updateArtist(id: string, data: Record<string, any>): Promise<Artist | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

    const sql = `
      UPDATE artists
      SET ${setClauses}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;
    return this.db.queryOne<Artist>(sql, [...values, id]);
  }

  async deleteArtist(id: string): Promise<Artist | null> {
    const sql = `
      DELETE FROM artists
      WHERE id = $1
      RETURNING *
    `;
    return this.db.queryOne<Artist>(sql, [id]);
  }

  async bulkInsert(artists: {
    name: string;
    dob?: string;
    gender?: string;
    address?: string;
    first_release_year?: number;
    no_of_albums_released?: number;
  }[]): Promise<Artist[]> {
    if (artists.length === 0) return [];

    const values: any[] = [];
    const rowPlaceholders = artists.map((a, i) => {
      const base = i * 6;
      values.push(
        a.name,
        a.dob ?? null,
        a.gender ?? null,
        a.address ?? null,
        a.first_release_year ?? null,
        a.no_of_albums_released ?? 0,
      );
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
    });

    const sql = `
      INSERT INTO artists
        (name, dob, gender, address, first_release_year, no_of_albums_released)
      VALUES ${rowPlaceholders.join(', ')}
      RETURNING *
    `;
    return this.db.query<Artist>(sql, values);
  }

  async findAllForExport(): Promise<Artist[]> {
    const sql = `
      SELECT * FROM artists
      ORDER BY created_at DESC
    `;
    return this.db.query<Artist>(sql);
  }
}