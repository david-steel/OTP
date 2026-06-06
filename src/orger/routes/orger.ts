/**
 * Orger Fastify plugin.
 *
 * Mounted at `/orger` prefix until orger.ai vhost routing is configured.
 * Once orger.ai DNS is live and the vhost hook is added, this same plugin
 * serves the root path on the orger.ai hostname.
 *
 * View files live in /orger/views/ at repo root (not under src/) — that
 * directory is for content (DESIGN.md + EJS templates + static assets).
 * Renders use absolute paths so we don't conflict with the global
 * fastifyView root which is set to src/views for OTP.
 */
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import {
  ensureOrgerWaitlistTable,
  addToOrgerWaitlist,
  countOrgerWaitlist,
} from '../db/ensure-waitlist.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute paths to orger views.
// Dev (tsx): __dirname = otp-platform/src/orger/routes
// Prod (tsc): __dirname = otp-platform/dist/orger/routes
// Both resolve to otp-platform/orger/views via 3 levels up.
const ORGER_VIEWS = path.join(__dirname, '..', '..', '..', 'orger', 'views');
const VIEW_LAYOUT = path.join(ORGER_VIEWS, 'layouts', 'main.ejs');
const VIEW_HOME = path.join(ORGER_VIEWS, 'home.ejs');
const VIEW_404 = path.join(ORGER_VIEWS, '404.ejs');
const VIEW_WAITLIST_OK = path.join(ORGER_VIEWS, 'waitlist-success.ejs');

const BASE_URL = process.env.ORGER_BASE_URL || 'https://orger.ai';

interface WaitlistBody {
  email?: string;
}

function getClientIp(req: FastifyRequest): string | null {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0]!.trim();
  if (Array.isArray(fwd) && fwd.length > 0) return fwd[0]!;
  return req.ip ?? null;
}

const isValidEmail = (s: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 320;

/**
 * Render an orger view inside the orger layout, bypassing @fastify/view's
 * global layout config (which is locked to OTP's src/views/layouts/main.ejs).
 *
 * Composes manually: render body template, then render layout with body var.
 */
async function renderOrger(
  reply: FastifyReply,
  viewPath: string,
  data: Record<string, unknown>,
  status = 200,
): Promise<FastifyReply> {
  const body = await ejs.renderFile(viewPath, data, { async: true });
  const html = await ejs.renderFile(
    VIEW_LAYOUT,
    { ...data, body },
    { async: true },
  );
  return reply.status(status).type('text/html').send(html);
}

export const orgerRoutes: FastifyPluginAsync = async (fastify) => {
  // Self-heal schema on plugin registration.
  await ensureOrgerWaitlistTable();
  fastify.log.info('[orger] waitlist table ensured');

  fastify.get('/', async (_req, reply) => {
    return renderOrger(reply, VIEW_HOME, {
      title: 'Orger — Your org chart, with agents.',
      description:
        'Free AI-aware org chart builder. Drag and drop the humans you have. Get grounded recommendations for the AI agents you should build.',
      canonical: BASE_URL,
      ogImage: BASE_URL + '/orger/public/images/mockup-homepage.png',
    });
  });

  fastify.get('/product', async (_req, reply) => {
    return renderOrger(reply, VIEW_HOME, {
      title: 'Orger — Product',
      description: 'How Orger turns an empty org chart into a recommended AI team.',
      canonical: BASE_URL + '/product',
    });
  });

  fastify.post('/waitlist', async (req, reply) => {
    const body = (req.body ?? {}) as WaitlistBody;
    const email = (body.email ?? '').trim();

    if (!email || !isValidEmail(email)) {
      return renderOrger(reply, VIEW_HOME, {
        title: 'Orger — Invalid email',
        description: 'Please enter a valid email address.',
        error: 'Please enter a valid email address.',
      }, 400);
    }

    try {
      const result = await addToOrgerWaitlist({
        email,
        source: 'homepage',
        ip: getClientIp(req),
        user_agent: (req.headers['user-agent'] ?? null) as string | null,
        referrer: (req.headers['referer'] ?? null) as string | null,
      });

      const total = await countOrgerWaitlist();
      fastify.log.info({ email, created: result.created, total }, '[orger] waitlist signup');

      return renderOrger(reply, VIEW_WAITLIST_OK, {
        title: 'Saved. Shrub approves.',
        description: 'You are on the Orger waitlist.',
        canonical: BASE_URL,
      });
    } catch (err) {
      fastify.log.error({ err, email }, '[orger] waitlist signup failed');
      return renderOrger(reply, VIEW_HOME, {
        title: 'Orger — Something broke',
        description: 'Please try again in a moment.',
        error: 'Something broke on our end. Try again in a moment.',
      }, 500);
    }
  });

  fastify.get('/_status', async () => {
    const count = await countOrgerWaitlist().catch(() => -1);
    return {
      ok: true,
      product: 'orger',
      waitlist_count: count,
      domain: BASE_URL,
      version: '0.0.1',
    };
  });

  fastify.setNotFoundHandler(async (_req, reply) => {
    return renderOrger(reply, VIEW_404, {
      title: 'Orger — Not found',
      description: 'This seat does not exist. Yet.',
      noindex: true,
    }, 404);
  });
};
