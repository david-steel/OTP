// Integration-test database harness.
//
// Spins up a real Postgres (pglite, Postgres compiled to WASM) entirely
// in-process -- no external DB server, no Docker, nothing to install. The
// instance is fronted by a TCP socket so the app's normal `node-postgres`
// layer (config/database.ts) connects to it unchanged via DATABASE_URL.
//
// The schema is materialised from the real `schema.ts` via `drizzle-kit push`,
// so it always matches production with zero drift (no hand-maintained fixture).
//
// Usage (see tickets.authz.test.ts):
//   const tdb = await startTestDb();
//   process.env.DATABASE_URL = tdb.url;        // BEFORE importing config/database
//   const { db } = await import('../config/database.js');
//   ... run the real route handlers against `db` ...
//   await tdb.stop();
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { spawn } from 'node:child_process';

export interface TestDb {
  url: string;
  stop: () => Promise<void>;
}

export async function startTestDb(): Promise<TestDb> {
  // Per-worker port: vitest runs each test file in its own process, so the pid
  // keeps parallel DB-backed files from colliding on a port.
  const port = 5500 + (process.pid % 400);
  const pglite = await PGlite.create();
  const server = new PGLiteSocketServer({ db: pglite, port, host: '127.0.0.1' });
  await server.start();
  const url = `postgresql://postgres:postgres@127.0.0.1:${port}/postgres`;

  // Materialise the full schema from schema.ts. push talks to the in-process
  // pglite over the same socket; `y` answers its apply prompt non-interactively.
  // MUST be async (not execFileSync): a synchronous child blocks this event
  // loop, which starves the in-process socket server, so push could never
  // connect. Awaiting a spawned child keeps the loop free to serve it.
  await new Promise<void>((resolve, reject) => {
    const child = spawn('npx', ['drizzle-kit', 'push'], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: url },
    });
    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.stdin.write('y\n'.repeat(10));
    child.stdin.end();
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('drizzle-kit push timed out after 90s\n' + stderr));
    }, 90_000);
    child.on('exit', (code) => {
      clearTimeout(timer);
      code === 0 ? resolve() : reject(new Error(`drizzle-kit push exited ${code}\n${stderr}`));
    });
    child.on('error', (err) => { clearTimeout(timer); reject(err); });
  });

  return {
    url,
    stop: async () => {
      await server.stop();
      await pglite.close();
    },
  };
}
