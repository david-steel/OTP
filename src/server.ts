import Fastify from 'fastify';
import fastifyView from '@fastify/view';
import fastifyStatic from '@fastify/static';
import fastifyRateLimit from '@fastify/rate-limit';
import { clerkPlugin } from '@clerk/fastify';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = Fastify({
  logger: true,
});

// Rate limiting
await app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Clerk authentication
await app.register(clerkPlugin, {
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Static files
await app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/public/',
});

// Derive Clerk frontend API domain from publishable key
const clerkPubKey = process.env.CLERK_PUBLISHABLE_KEY || '';
const clerkInstance = clerkPubKey.startsWith('pk_')
  ? Buffer.from(clerkPubKey.split('_').slice(2).join('_'), 'base64').toString().replace(/\$$/, '')
  : '';

// EJS templates
await app.register(fastifyView, {
  engine: { ejs: await import('ejs') },
  root: path.join(__dirname, 'views'),
  layout: 'layouts/main',
  defaultContext: {
    clerkPubKey,
    clerkInstance,
  },
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', version: '0.1.0', phase: 'mvp' };
});

// ---- API Routes ----
await app.register(import('./routes/api/auth.js'), { prefix: '/api/v1/auth' });
await app.register(import('./routes/api/oos.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/search.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/browse.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/graph.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/merge.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/scanner.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/api-keys.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/recommendations.js'), { prefix: '/api/v1' });

// ---- Page Routes (SSR) ----
await app.register(import('./routes/pages/pages.js'));

// Start server
const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

try {
  await app.listen({ port, host });
  app.log.info(`OTP Platform running at http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
