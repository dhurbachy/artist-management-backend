// src/core/database/database.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'; // ← add QueryResultRow

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.pool = new Pool({
      host:     this.config.get<string>('DB_HOST'),
      port:     this.config.get<number>('DB_PORT'),
      user:     this.config.get<string>('DB_USER'),
      password: String(this.config.get<string>('DB_PASSWORD')),
      database: this.config.get<string>('DB_NAME'),
      max:                     20,
      idleTimeoutMillis:    30_000,
      connectionTimeoutMillis: 3_000,
    });
  //   this.pool = new Pool({
  //   host:     'localhost',
  //   port:     5432,
  //   user:     'postgres',
  //   password: '12345',
  //   database: 'artist_management',
  //   max:                     20,
  //   idleTimeoutMillis:    30_000,
  //   connectionTimeoutMillis: 3_000,
  // });

    this.pool.on('error', (err: Error) => {
      this.logger.error('Unexpected DB pool error', err.stack);
    });

    this.logger.log('Database pool initialized');
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('Database pool closed');
  }

  async query<T extends QueryResultRow = any>(
    sql: string,
    params: any[] = [],
  ): Promise<T[]> {
    const start  = Date.now();
    const client = await this.pool.connect();

    try {
      const result: QueryResult<T> = await client.query<T>(sql, params);
      this.logger.debug(`query (${Date.now() - start}ms) → ${sql.trim()}`);
      return result.rows;
    } catch (err: any) {
      this.logger.error(`Query failed: ${err.message}\nSQL: ${sql.trim()}`);
      throw new InternalServerErrorException('Database query failed');
    } finally {
      client.release();
    }
  }

  async queryOne<T extends QueryResultRow = any>( 
    sql: string,
    params: any[] = [],
  ): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      this.logger.debug('Transaction BEGIN');

      const result = await fn(client);

      await client.query('COMMIT');
      this.logger.debug('Transaction COMMIT');

      return result;
    } catch (err: any) {
      await client.query('ROLLBACK');
      this.logger.error(`Transaction ROLLBACK → ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }

  // ─── HEALTH CHECK ────────────────────────────────────────────────
  async ping(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}