import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../core/database/database.service';
import { BaseRepository } from '../core/database/base.repository';
import { User } from '../auth/auth.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserRepository extends BaseRepository<User> {
    protected readonly table = 'users';

    constructor(db: DatabaseService) {
        super(db);
    }

    async findByEmail(email: string): Promise<User | null> {
        const sql = `SELECT * FROM users WHERE email = $1 LIMIT 1`;
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

    async findAll(page: number, limit: number) {
        const offset = (page - 1) * limit;

        const dataSql = `
            SELECT
                id, first_name, last_name, email,
                phone, dob, gender, address, role,
                created_at, updated_at
            FROM users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const countSql = `SELECT COUNT(*)::int AS total FROM users`;

        const [data, countResult] = await Promise.all([
            this.db.query<Omit<User, 'password' | 'refresh_token'>>(dataSql, [limit, offset]),
            this.db.queryOne<{ total: number }>(countSql, []),
        ]);

        return {
            data,
            total: countResult?.total ?? 0,
        };
    }

async createUser(dto: CreateUserDto): Promise<Omit<User, 'password' | 'refresh_token'>> {
    const hashed = await bcrypt.hash(dto.password, 12);

    const sql = `
        INSERT INTO users
            (first_name, last_name, email, password, phone, dob, gender, address, role)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7::gender_type, $8, $9::user_role)
        RETURNING
            id, first_name, last_name, email,
            phone, dob, gender, address, role,
            created_at, updated_at
    `;

    const result = await this.db.queryOne(sql, [
        dto.first_name,
        dto.last_name,
        dto.email,
        hashed,
        dto.phone   ?? null,
        dto.dob     ?? null,
        dto.gender  ?? null,
        dto.address ?? null,
        dto.role    ?? 'artist',
    ]);

    if (!result) throw new InternalServerErrorException('User creation failed');
    return result;
}

    async update(id: string, dto: UpdateUserDto): Promise<Omit<User, 'password' | 'refresh_token'> | null> {
        const sql = `
            UPDATE users SET
                first_name = COALESCE($1, first_name),
                last_name  = COALESCE($2, last_name),
                email      = COALESCE($3, email),
                role       = COALESCE($4::user_role, role),
                phone      = COALESCE($5, phone),
                dob        = COALESCE($6, dob),
                gender     = COALESCE($7::gender_type, gender),
                address    = COALESCE($8, address),
                updated_at = NOW()
            WHERE id = $9
            RETURNING
                id, first_name, last_name, email,
                phone, dob, gender, address, role,
                created_at, updated_at
        `;

        return this.db.queryOne(sql, [
            dto.first_name ?? null,
            dto.last_name  ?? null,
            dto.email      ?? null,
            dto.role       ?? null,
            dto.phone      ?? null,
            dto.dob        ?? null,
            dto.gender     ?? null,
            dto.address    ?? null,
            id,
        ]);
    }

    async delete(id: string): Promise<void> {
        const sql = `DELETE FROM users WHERE id = $1`;
        await this.db.query(sql, [id]);
    }
}