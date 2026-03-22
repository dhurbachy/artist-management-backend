// src/migrations/runner.ts
import * as fs   from 'fs';
import * as path from 'path';
import { DatabaseService } from '../core/database/database.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('MigrationRunner');

export async function runMigrations(db: DatabaseService): Promise<void> {
  console.log('runMigrations called');                  
  console.log('__dirname =', __dirname);               


  const migrationsDir = path.join(__dirname);
  const allFiles      = fs.readdirSync(migrationsDir);

  console.log('Files in dir:', allFiles);            

  const sqlFiles = allFiles.filter(f => f.endsWith('.sql')).sort();
  console.log('SQL files:', sqlFiles);                 

  //  Create migrations tracking table 
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id         SERIAL      PRIMARY KEY,
      filename   TEXT        UNIQUE NOT NULL,
      run_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  if (sqlFiles.length === 0) {
    console.log('No SQL files found — nest-cli.json assets not copying .sql files');
    return;
  }

  for (const file of sqlFiles) {
    const already = await db.queryOne(
      `SELECT id FROM migrations WHERE filename = $1`,
      [file],
    );

    if (already) {
      logger.log(`Skipped: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

    await db.transaction(async (client) => {
      await client.query(sql);
      await client.query(
        `INSERT INTO migrations (filename) VALUES ($1)`,
        [file],
      );
    });

    logger.log(`Migration applied: ${file}`);
  }

  logger.log('All migrations completed');
}