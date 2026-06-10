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
  // Per-worker port. NOTE: vitest's default pool is THREADS, so process.pid is
  // the SAME across concurrently-running test files -- pid alone collided as
  // soon as a second DB-backed suite ran in parallel (caught 2026-06-10 when
  // merge.authz.test.ts hung for 120s next to tickets.authz.test.ts). Mix in
  // the vitest worker id and retry on bind failure for safety.
  const workerId = Number(process.env.VITEST_POOL_ID || process.env.VITEST_WORKER_ID || 0);
  const pglite = await PGlite.create();
  let server: InstanceType<typeof PGLiteSocketServer> | undefined;
  let port = 0;
  for (let attempt = 0; attempt < 20; attempt++) {
    port = 5500 + ((process.pid + workerId * 41 + attempt * 7) % 400);
    server = new PGLiteSocketServer({ db: pglite, port, host: '127.0.0.1' });
    try {
      await server.start();
      break;
    } catch (err) {
      server = undefined;
      if (attempt === 19) throw err;
    }
  }
  if (!server) throw new Error('pg-harness: could not bind a port');
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

  const boundServer = server;
  return {
    url,
    stop: async () => {
      await boundServer.stop();
      await pglite.close();
    },
  };
}
