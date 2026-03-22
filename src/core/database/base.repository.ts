import {InternalServerErrorException} from "@nestjs/common"
import { DatabaseService } from './database.service';
import { QueryResultRow, } from 'pg';
export abstract class BaseRepository<T extends QueryResultRow> {
    protected abstract readonly table: string;

    constructor(protected readonly db: DatabaseService) { }

    async findById(id: string): Promise<T | null> {
        const sql = `SELECT * FROM ${this.table} WHERE id = $1 LIMIT 1`;
        return this.db.queryOne<T>(sql, [id]);
    }

    async create(data: Partial<T>): Promise<T> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const cols = keys.join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const sql = `
      INSERT INTO ${this.table} (${cols})
      VALUES (${placeholders})
      RETURNING *
    `;
        const result = await this.db.queryOne<T>(sql, values);
        if (!result) throw new InternalServerErrorException('Insert failed'); 
        return result;
    }

    async updateById(id: string, data: Partial<T>): Promise<T | null> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

        const sql = `
      UPDATE ${this.table}
      SET ${setClauses}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;
        return this.db.queryOne<T>(sql, [...values, id]);
    }

    async deleteById(id: string): Promise<T | null> {
        const sql = `
      DELETE FROM ${this.table}
      WHERE id = $1
      RETURNING *
    `;
        return this.db.queryOne<T>(sql, [id]);
    }

    async exists(column: string, value: any): Promise<boolean> {
        const sql = `SELECT 1 FROM ${this.table} WHERE ${column} = $1 LIMIT 1`;
        const row = await this.db.queryOne(sql, [value]);
        return row !== null;
    }
}