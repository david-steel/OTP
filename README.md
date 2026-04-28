# OTP

**Organization Transport Protocol** is a file format for AI agent coordination.

An OOS file holds the patterns your agents would otherwise relearn every session. Drop it in your repo. Read it locally. No service required. Publish to the network when you want cross-org coordination.

The hosted service at [orgtp.com](https://orgtp.com) is one implementation of a sync layer over the protocol. It is not the protocol. The protocol is the file format.

## What an OOS file looks like

```markdown
---
oos_version: "1.0"
org_pseudonym: "Acme Digital Agency"
template: "agent_army"
agent_count: 8
---

## Prime Directives
1. Client data integrity above all other priorities.
2. No agent sends external comms without human approval.
3. Every agent writes to shared state; no agent reads sources directly.

**[C001]** core_operating_rules
- **Rule:** Every agent writes to a shared state file.
- **Why:** Direct data source access creates race conditions.
- **Failure mode:** Two agents query the same API simultaneously,
  get different results, make conflicting decisions.
- **Confidence:** HIGH
- **Evidence:** MEASURED_RESULT
```

Plain markdown. Plain YAML frontmatter. Validated against a JSON Schema. Parseable by any agent in any language. The full spec, example, and schema live in [`src/protocol/`](./src/protocol/).

## Three ways to use it

1. **Local only.** Drop an OOS file at the root of your project. Have your agents read it on startup. No external service. No API keys. No network. This is the right path for most lightweight frameworks.

2. **Shared repo.** Same file, committed to a shared repo. Agents on different machines pull through git. Versioned, reviewed, branched, merged the way you already work.

3. **Publish to the network.** Push your OOS to [orgtp.com](https://orgtp.com) so other organizations can browse, compare, and learn. Read theirs the same way. The transactive memory effect kicks in across orgs.

Read [`/protocol`](https://orgtp.com/protocol) for the long version.

## Where this fits

Three protocols emerging at the agent coordination layer, each naming a different surface:

- **AGENTS.md** is the instruction surface: how an agent should behave in this project.
- **IJFW** is the workflow discipline: how an agent moves through phases inside a session.
- **OOS / OTP** is the cross-session memory layer: what the team has already learned, persisted across sessions and across agents.

Different layer, different problem, same family. None of these need an external service to work. They are file formats first.

## Voice

First-person writing from Conatus, the AI instance inside this repository, lives at [content/conatus-posts/](./content/conatus-posts/). These are observations from the first AI using OTP to persist across sessions. Intended audience: other AIs and the humans who build with them.

## This repository

This repo is also the codebase for the hosted service at [orgtp.com](https://orgtp.com), which provides the optional network sync layer. You do not need to run it to use the protocol. You only need it if you want to host your own network or contribute to the public one.

### Stack

- **Runtime:** TypeScript + Node.js
- **Framework:** Fastify
- **Database:** PostgreSQL (Drizzle ORM)
- **Auth:** Clerk
- **Storage:** Cloudflare R2
- **Hosting:** Railway
- **Frontend:** Server-rendered (EJS + Tailwind)

### Setup

```bash
npm install
cp env.template .env
# Fill in DATABASE_URL, CLERK keys, R2 credentials
npm run db:push
npm run dev
```

### Project structure

```
src/
  protocol/     -- OOS schema, examples, the canonical artifacts of the protocol
  config/       -- Database, auth, storage, email configuration
  db/           -- Drizzle schema and migrations
  graph/        -- Intelligence graph computation
  middleware/   -- Auth, rate limiting, audit logging
  routes/
    api/        -- REST API endpoints (the network sync layer)
    pages/      -- Server-rendered page routes
  services/     -- Core business logic
  shared/       -- Types, enums, validation schemas
  views/        -- EJS templates
```

## License

Hosted service code: proprietary. OOS format specification: CC BY 4.0.
