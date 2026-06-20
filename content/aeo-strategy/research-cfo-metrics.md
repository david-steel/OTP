# Research Brief — AI-Era Finance Metrics, Token Economics, FinOps for CFOs

**Source:** MetricsScout (OTP research run, 2026-06-20). Citation-anchored. Numbers flagged where approximate or single-source.
**Use:** grounds the CFO-B (token/unit economics) and CFO-C (ROI/scorecard) cluster posts.

## CFO-plain glossary
- **Token** — unit a model reads/writes. ~4 chars ≈ 1 token; ~750 words ≈ 1,000 tokens. Billed per token, not per request. (OpenAI Help Center)
- **Input (prompt) tokens** — everything you send (question, instructions, pasted docs, prior turns). Paid on every call.
- **Output (completion) tokens** — what the model writes back. Typically priced **3–5x higher than input**. A runaway output is the more expensive failure.
- **Context window** — max tokens held at once (prompt + output). Big windows are capacity, not a flat fee; you still pay per token used.
- **Cost-per-token** — price per million tokens (the atomic COGS unit). Split input/output.
- **Cost-per-task** — all-in cost of one unit of useful work = tokens × prices across all calls + tool/API + orchestration overhead. This maps to gross margin, not cost-per-token.

## The AI-era finance scorecard (definitions + formulas)
- **Cost per task** = (input_tokens × in_price + output_tokens × out_price) + tool/API costs, per completed task.
- **Token efficiency** = successful_tasks ÷ total_token_spend (higher better); or tokens ÷ task (lower better).
- **Automation / deflection rate** = tasks_resolved_by_agent ÷ total_tasks.
- **Human-hours freed** = tasks_automated × avg_human_minutes_per_task; × fully_loaded_hourly_rate = dollar value.
- **Error / rework rate** = (reworked + escalated outputs) ÷ total agent outputs. The brake: high rework erases automation gains.
- **Margin per workflow** = (value_per_task − cost_per_task) ÷ value_per_task.

## Token pricing trend (well-sourced)
- Cost to run GPT-3.5-quality (64.8 MMLU) fell from **~$20.00/M tokens (Nov 2022) to ~$0.07/M (Oct 2024) — a ~280x drop in ~18 months.** (Stanford HAI, 2025 AI Index Report)
- Same report: LLM inference prices falling **9x to 900x per year depending on task** (wide range — treat "10x/yr" as rough planning, not a guarantee).
- CFO implication: a token-heavy workflow break-even today is likely margin-positive within a year at constant model choice; route simple tasks to a cheaper model for immediate cuts.

## Margin levers (vendor-published magnitudes; exact % approximate)
- **Batch / async: ~50% off** non-urgent work.
- **Prompt caching: up to ~90% off** repeated input (system prompts, reference docs).
- FLAG: exact per-model token prices and exact discount % pending per-vendor page verification. Do not quote exact per-model rates until confirmed.

## FinOps for AI (governance asks)
- Cost allocation / showback / chargeback so every team's token spend is visible and owned.
- Budget for VARIABLE spend — token cost scales with usage and is non-deterministic; forecast in ranges, not fixed lines.
- Runaway-cost guardrails: budget caps + alerts, per-task token ceilings, model routing, caching, spend observability.

## Cost-per-agent-task vs fully-loaded labor — the method
1. agent_cost_per_task = model_token_cost + tool/API + orchestration overhead (retries, context reloads, multi-step — easy to undercount).
2. human_cost_per_task = fully_loaded_hourly_rate × hours_per_task. Fully-loaded ≈ base × **1.25–1.4** (planning range, not precise).
3. savings_per_task = human − agent; payback = implementation_cost ÷ (monthly_volume × savings_per_task).
- Always net savings against the error/escalation rate. A 20% rework rate silently rebuilds the labor cost you thought you removed.

## The honest counterweight (cite this for credibility)
- **MIT Project NANDA, "The GenAI Divide: State of AI in Business 2025": ~95% of enterprise GenAI pilots delivered no measurable P&L impact** (52 interviews, 153 survey leaders, 300 public deployments). The unit economics only work when the workflow is genuinely automatable and quality-gated. Cheap-per-token is necessary, not sufficient.

## Verified sources
- OpenAI, "What are tokens": help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them
- Stanford HAI, 2025 AI Index Report: hai.stanford.edu/ai-index/2025-ai-index-report
- MIT Project NANDA, GenAI Divide 2025: mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf
