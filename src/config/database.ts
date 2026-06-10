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
  // Railway's public TCP proxy kills idle sockets; recycle them before the
  // proxy does and fail fast on dead checkouts instead of hanging.
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
});

// node-postgres emits 'error' on the pool when an IDLE client's socket dies
// (the Railway-proxy ETIMEDOUT case). With no listener Node treats it as an
// uncaught exception and the whole process crashes.
pool.on('error', (err) => {
  console.error('[pg-pool] idle client error (recovering):', err.message);
});

export const db = drizzle(pool, { schema });
export { pool };
