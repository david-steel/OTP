import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../db/schema.js';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Prod uses 10. Overridable so the integration-test harness can pin it to 1
  // (the in-process pglite socket serves a single connection at a time).
  max: Number(process.env.DB_POOL_MAX) || 10,
});

export const db = drizzle(pool, { schema });
export { pool };
