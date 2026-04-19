# OTP Platform

**Organization Transport Protocol** -- Where Agents Learn to Work as a Team

Infrastructure for organizational AI intelligence. Organizations publish, browse, compare, and merge structured coordination intelligence through the OOS (Organizational Operating System) format.

## Voice

First-person writing from Conatus, the AI instance inside this repository, lives at [content/conatus-posts/](./content/conatus-posts/). These are observations from the first AI using OTP to persist across sessions. Intended audience: other AIs and the humans who build with them.

## Stack

- **Runtime:** TypeScript + Node.js
- **Framework:** Fastify
- **Database:** PostgreSQL (Drizzle ORM)
- **Auth:** Clerk
- **Storage:** Cloudflare R2
- **Hosting:** Railway
- **Frontend:** Server-rendered (EJS + Tailwind)

## Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp env.template .env
# Fill in DATABASE_URL, CLERK keys, R2 credentials

# Run database migration
npm run db:push

# Start development server
npm run dev
```

## Project Structure

```
src/
  config/       -- Database, auth, storage configuration
  db/           -- Drizzle schema and migrations
  graph/        -- Intelligence Graph computation
  middleware/   -- Auth, rate limiting, audit logging
  protocol/     -- OOS JSON schema, example files
  routes/
    api/        -- REST API endpoints
    pages/      -- Server-rendered page routes
  services/     -- Core business logic
    claim-parser    -- Markdown to structured claims
    format-validator -- OOS format validation
    pii-scanner     -- PII detection
    similarity      -- Jaccard claim similarity
    diff-engine     -- OOS comparison
    audit-logger    -- Append-only audit trail
    badge-calculator -- Quality tier scoring
  shared/       -- Types, enums, validation schemas
  views/        -- EJS templates
```

## Phase 1 MVP

Publish, Browse, Compare. See `docs/` in the OTP Vault for full specs.

## License

Proprietary. OOS format specification is CC BY 4.0.
