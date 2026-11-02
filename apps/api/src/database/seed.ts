import { drizzle } from 'drizzle-orm/node-postgres';
import { existsSync } from 'node:fs';
import { Pool } from 'pg';
import type { Database } from './database.constants.js';
import * as schema from './schema.js';
import { seedDatabase } from './seed-database.js';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

if (process.env.NODE_ENV === 'production') {
  throw new Error('The seed must not run in production');
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
try {
  await seedDatabase(drizzle(pool, { schema }) as unknown as Database);
  console.log('Seed concluído.');
} finally {
  await pool.end();
}
