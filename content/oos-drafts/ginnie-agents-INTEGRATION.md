# INTEGRATION.md for ginnie-agents.oos.md

Companion to `ginnie-agents.oos.md`. Describes exactly what would change in the ginnie-agents framework to load and respect the drafted OOS file. Written as a concrete spec, not a recommendation to adopt.

The framework's principle stated in nitaybz/ginnie-agents#1 is honored throughout: no external service, no API keys, nothing outside the install. The OOS layer adds one file to the framework operator's repo and a small change to system prompt composition. Nothing else.

## File location

```
shared/
├── coordination.oos.md      <-- new file, proposed
├── known-users.json
├── foundation.md (optional)
└── skills/
```

`shared/coordination.oos.md` parallels `shared/known-users.json`: a single shared file every agent reads, with a per-agent override path available if needed (`agents/<name>/coordination.oos.md`, merged with shared by union the same way `known-users.json` is). For the initial cut, only the shared file exists and per-agent override is reserved for v0.2.

## System prompt composition change

The 8-layer composition (per `ARCHITECTURE.md` lines 65-74) becomes 9 layers, with the OOS inserted between steps 4 and 5:

| Step | Today | Proposed |
|---|---|---|
| 1 | `shared/foundation.md` | unchanged |
| 2 | Team directory | unchanged |
| 3 | `SOUL.md` | unchanged |
| 4 | `framework/skills/memory-curation/SKILL.md` | unchanged |
| **4a** | n/a | **`shared/coordination.oos.md` (new)** |
| 5 | `PROMPT.md` | unchanged |
| 6 | `memory/rules.md` | unchanged |
| 7 | `memory/playbook.md` | unchanged |

**Why insert at 4a:** The OOS is closer in shape to the framework-shipped memory-curation skill than to the per-agent prompt. It is shared discipline, not agent-specific role. Loading it before `PROMPT.md` lets the agent's own prompt caveat the cross-agent rules if needed (rare, but allowed). Loading it before `rules.md` means per-agent rules override cross-agent rules for that agent specifically (also rare, but allowed for agents the operator explicitly carves out).

Alternative composition: insert at 4b (after PROMPT.md, before rules.md) if the operator wants per-agent prompts to NOT be able to caveat the cross-agent rules. This is a one-line change and can be flipped per-install via a `config.json` setting (`coordination_load_order: "before_prompt" | "after_prompt"`).

## Code change required

`listener/src/runner.ts` (or wherever the entrypoint composes the system prompt) gains one new step:

```ts
// Existing composition (pseudo)
const systemPrompt = [
  await readIfExists('shared/foundation.md'),
  renderTeamDirectory(),
  wrapSoul(await readFile('SOUL.md')),
  await readFile('framework/skills/memory-curation/SKILL.md'),
  // <-- NEW STEP HERE -->
  await readIfExists('shared/coordination.oos.md'),
  // <-- end new step -->
  await readFile('PROMPT.md'),
  await readFile('memory/rules.md'),
  await readFile('memory/playbook.md'),
].filter(Boolean).join('\n\n');
```

That is the entire load path. No parser, no rules engine, no policy interpreter. The OOS file is markdown; agents read markdown the way they read everything else in the system prompt. The `scope` field carries the authority semantics in plain English; the agent applies them through reading, the same way it applies `rules.md`.

If the operator wants validation (e.g., reject malformed OOS files at load time), the JSON Schema lives at `https://orgtp.com/spec/oos-schema.json` and can be downloaded once and committed to the repo at `framework/schemas/oos-schema.json`. Validation is then a one-call check during `doctor`, not at every spawn. No runtime network.

## What does NOT change

Honoring the framework principle "User content lives in directories the framework never writes to" (per `ARCHITECTURE.md` line 167):

- **The team directory is unchanged.** It still says "agent A exists, here's what they own." It does not gain an authority field. Authority lives in the OOS file's `scope` per claim, not in the directory.
- **Memory tiers are unchanged.** `rules.md` is still per-agent, capped at 200, agent-edited. `playbook.md` is still per-agent, capped at 300, consolidation-only writer. `episodes/` is still per-agent, journal-style, grep-on-demand.
- **The git enforcement layer is unchanged.** `.gitattributes` still applies `merge=union` to memory files. The OOS file is shared, single-writer (the operator), and does not need union-merge protection because it is not edited by agents.
- **Boundaries are unchanged.** `read-only` agents still get the restricted toolkit. C007 in the OOS draft explicitly defers to the boundaries primitive on action-affecting conflicts.
- **The docker isolation is unchanged.** Each agent still runs ephemeral, with shared dirs mounted read-only. `shared/coordination.oos.md` mounts at `/workspace/.shared/coordination.oos.md` (read-only) just like `shared/known-users.json` does today.

## What new behavior would need testing

If this lands, the integration tests and the `doctor` skill would need extensions:

1. **OOS schema validation.** `doctor` runs the JSON Schema validator against `shared/coordination.oos.md` at health check time. Local validation, no network.
2. **Cap on the OOS itself.** Suggest a 500-line cap on the shared OOS, parallel to the per-agent caps, enforced via the same `commit-msg` hook that already enforces the 200/300 caps. Beyond 500 lines, the file is too long to load into every agent's prompt every session.
3. **Conflict-instance counter.** If the OOS resolves a conflict, the receiving agent appends an entry to its `episodes/`. Operator-facing dashboard could count these to surface "rules that fire often" (candidates for promotion to the framework).

## What this would NOT add to the framework's surface area

- No new background daemon. The Watcher does not gain an OOS responsibility.
- No new Slack integration. The OOS is not posted to Slack; it is read by agents.
- No new external dependency. The schema is a static JSON file the operator can vendor into the repo.
- No new credential. The OOS does not authenticate against anything.
- No new container per session. The OOS is mounted into the existing agent containers.
- No new framework skill, in v0.1. Editing the OOS is `git` + a text editor. A future `manage-coordination` skill could wrap the edit flow, but it is not load-bearing.

## What it explicitly does add

- **One file in the operator's repo:** `shared/coordination.oos.md`.
- **One step in system prompt composition:** read the file, splice it in.
- **One paragraph in `ARCHITECTURE.md`:** name the ninth layer.
- **One paragraph in `CLAUDE.md`:** name the new file's role.
- **Optionally, one new entry in the doctor's checklist:** schema-validate the OOS file.

## Whether the framework needs this layer

Three honest reads on the answer Nitay's reply asked for:

**Read 1: framework needs the layer.** If multi-agent ginnie-agents installs grow past the "one operator picks the answer in Slack" scale (which the framework explicitly targets), the merge layer is necessary, and putting it at the file level keeps it in the framework's "no external service" lane. This is the reading where this file lands as a v0.3 framework feature.

**Read 2: framework needs better docs around the limit.** The current honest-by-omission stance is acceptable for the framework's stated audience (small teams, single operator), and the merge layer is out of scope. The framework's `ARCHITECTURE.md` gains a "Cross-agent conflict resolution: not handled. See [Limits.md] for failure modes at scale." section, and OTP's OOS format is referenced as a pattern operators can adopt at the per-install level without framework support. This is the reading where this file lands as a referenced example, not a feature.

**Read 3: hybrid.** The framework documents the limit in v0.3, ships an experimental OOS-loader skill in v0.4 (operator-installable, not core), and watches whether real installs adopt it before promoting to core in v0.5 or later. This is the reading where the framework grows the layer based on demand instead of speculation.

The framework operator picks. The drafter has no skin in the game beyond the GitHub thread that prompted this exercise.

## Provenance

- **Drafted by:** Sneeze It / OTP, 2026-04-28.
- **In response to:** nitaybz/ginnie-agents#1.
- **License:** MIT, matching ginnie-agents' license, so this can be vendored or referenced freely.
- **No commitment expected.** The drafter understands the framework operator may read this and decide the framework does not need the layer at all. That is a legitimate outcome and the exercise still has value: the merge logic is now explicit in writing rather than implicit by omission.
