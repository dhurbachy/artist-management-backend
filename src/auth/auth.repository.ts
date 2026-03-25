import { Injectable,InternalServerErrorException  } from '@nestjs/common';
import { DatabaseService } from '../core/database/database.service';
import { BaseRepository } from '../core/database/base.repository';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string | null;
  dob: Date | null;
  gender: 'm' | 'f' | 'o' | null;
  address: string | null;
  role: 'super_admin' | 'artist_manager' | 'artist';
  refresh_token: string | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class AuthRepository extends BaseRepository<User> {
  protected readonly table = 'users';

  constructor(db: DatabaseService) {
    super(db);
  }

  async findByEmail(email: string): Promise<User | null> {
    const sql = `
      SELECT * FROM users
      WHERE email = $1
      LIMIT 1
    `;
    return this.db.queryOne<User>(sql, [email]);
  }

  async findByIdSafe(id: string): Promise<Omit<User, 'password' | 'refresh_token'> | null> {
    const sql = `
      SELECT
        id, first_name, last_name, email,
        phone, dob, gender, address, role,
        created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    return this.db.queryOne(sql, [id]);
  }

  async saveRefreshToken(userId: string, hashedToken: string): Promise<void> {
    const sql = `
      UPDATE users
      SET refresh_token = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await this.db.query(sql, [hashedToken, userId]);
  }

  async clearRefreshToken(userId: string): Promise<void> {
    const sql = `
      UPDATE users
      SET refresh_token = NULL, updated_at = NOW()
      WHERE id = $1
    `;
    await this.db.query(sql, [userId]);
  }

async createUser(data: Partial<User>): Promise<Omit<User, 'password' | 'refresh_token'>> {
  const sql = `
    INSERT INTO users
      (first_name, last_name, email, password, phone, dob, gender, address, role)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING
      id, first_name, last_name, email,
      phone, dob, gender, address, role,
      created_at, updated_at
  `;

  const result = await this.db.queryOne(sql, [
    data.first_name,
    data.last_name,
    data.email,
    data.password,
    data.phone   ?? null,
    data.dob     ?? null,
    data.gender  ?? null,
    data.address ?? null,
    data.role    ?? 'artist',
  ]);

  if (!result) throw new InternalServerErrorException('User creation failed'); 
  return result;
}

}