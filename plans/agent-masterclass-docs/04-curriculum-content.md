# Curriculum Content: Agent Masterclass Docs

> **Document**: 04-curriculum-content.md
> **Parent**: [Index](00-index.md)

## Overview

Defines the full four-part curriculum, the mapping to existing `src/` code, the new lessons/code to be authored, and the consistent per-lesson page template. *(AR #1–#6, #16)*

## Per-Lesson Page Template (AR #6, #16)

Every lesson page MUST follow this structure:

```md
# Lesson N — <Title>

> **You'll build:** <one-line outcome banner>
> **Concepts:** <comma-separated>  ·  **Run:** `yarn dev <n>` (if runnable)

## The idea            <!-- plain-English concept, analogy -->
## Mental model        <!-- Mermaid diagram where useful -->
## The problem         <!-- naive attempt → why it fails -->
## Walkthrough         <!-- annotated code IMPORTED from src/ via <<< -->
## Run it              <!-- expected output / what to observe -->
## Production caveats  <!-- "why it matters" callouts, gotchas -->
## Exercises           <!-- 2–3; solutions in <details> collapsible -->
## Key takeaways       <!-- bullet summary -->
```

> **PF-006 — `<n>` is the source FILE number, not the lesson number.** Lesson numbers (1–16) diverge from the runnable file numbers. Each lesson page MUST state the exact `yarn dev <file#>`. Mapping where they differ:
>
> | Lesson | Runnable file | Command |
> | ------ | ------------- | ------- |
> | 1, 2 | `01-oneshot.ts` | `yarn dev 1` |
> | 5 | `03-json.ts` | `yarn dev 3` |
> | 6 | `04-agent-class.ts` | `yarn dev 4` |
> | 7 | `05-rag.ts` | `yarn dev 5` |
> | 8 | `06-robust.ts` | `yarn dev 6` |
> | 9 | `07-human-in-the-loop.ts` | `yarn dev 7` |
> | 10 | `11-security.ts` (new) | `yarn dev 11` |
> | 11 | `09-observability.ts` | `yarn dev 9` |
> | 12 | `12-evals.ts` (new) | `yarn dev 12` |
> | 13 | `08-multi-agent.ts` | `yarn dev 8` |
> | 14 | `10-capstone.ts` | `yarn dev 10` |

Conventions:
- Code is **imported from `src/`** (`<<< @/../src/...`) — never hand-pasted. *(AR #11)*
- Use VitePress callouts (`::: tip`, `::: warning`, `::: details`) for refreshers and solutions.
- LLM-basics refreshers (tokens, embeddings, prompts) appear as `::: tip Refresher` callouts, not full sections. *(AR #1)*

## Curriculum Map (AR #2, #4)

### Getting Started (pre-Part)
- `getting-started.md` — install, `.env`, running lessons, how the course works.
- `prerequisites.md` — what you need to know (TS, async), light LLM refresher.

### Part I — Foundations
| Lesson | Title | Source | New code? |
| ------ | ----- | ------ | --------- |
| 1 | What is an agent? (loop, autonomy spectrum, agent vs workflow vs single call) | theory + `src/agents/01-oneshot.ts` | No |
| 2 | Your first agent loop (`generateText` + `stepCountIs`) | `src/agents/01-oneshot.ts` | No |
| 3 | Anatomy of a tool (schemas, descriptions, the model's decision) | `src/tools.ts` | No |

### Part II — Core Capabilities
| Lesson | Title | Source | New code? |
| ------ | ----- | ------ | --------- |
| 4 | Streaming & conversation memory | `src/agents/02-interactive.ts` | No |
| 5 | Structured output (`Output.object`, why `generateObject` is deprecated) | `src/agents/03-json.ts` | No |
| 6 | The reusable `ToolLoopAgent` | `src/agents/04-agent-class.ts` | No |
| 7 | RAG — embeddings + retrieval | `src/agents/05-rag.ts` | No |

### Part III — Production Hardening
| Lesson | Title | Source | New code? |
| ------ | ----- | ------ | --------- |
| 8 | Robust agents (structured errors + tool repair) | `src/agents/06-robust.ts` | No |
| 9 | Human-in-the-loop (approval gates) | `src/agents/07-human-in-the-loop.ts` | No |
| 10 | Security & safety (prompt injection, tool sandboxing, no-`eval`) | NEW: `src/agents/11-security.ts` | **Yes** |
| 11 | Observability, token usage & cost | `src/agents/09-observability.ts` | No |
| 12 | Testing & evaluating agents | NEW: tests + `src/agents/12-evals.ts` | **Yes** |

### Part IV — Architecture & Scale
| Lesson | Title | Source | New code? |
| ------ | ----- | ------ | --------- |
| 13 | Multi-agent orchestration | `src/agents/08-multi-agent.ts` | No |
| 14 | Capstone walkthrough (the support agent) | `src/agents/10-capstone.ts` | No |
| 15 | Build your own agent (guided, new domain) | NEW: `src/agents/13-byo-starter.ts` + `13-byo-solution.ts` | **Yes** |
| 16 | Deploying & running agents in production | theory + deploy notes | No (prose) |

> **PF-011 — scope callout for Lesson 16.** This lesson sits next to the docs-deployment pipeline (doc 06), which ships **this documentation site** to GitHub Pages. Lesson 16 is about deploying **the reader's own agent** (serverless/long-running processes, secrets, rate limits, observability in prod) — *not* about the Pages workflow. The lesson page MUST open with a `::: warning` callout drawing this distinction so readers don't conflate "deploy the docs" with "deploy my agent."

### Appendix
- `sdk-cheatsheet.md` — distilled from `.clinerules/ai-sdk.md` (deprecations, `Output`, `ToolLoopAgent`, embeddings, repair hook).
- `glossary.md` — agent, tool, token, embedding, RAG, step, etc.

## New Code To Author (AR #3)

| File | Purpose | Tested? |
| ---- | ------- | ------- |
| `src/agents/11-security.ts` | Demonstrates prompt-injection defense + sandboxed tool (reuses safe `calculator` pattern) | Structural (mocked model) |
| `src/agents/12-evals.ts` | A tiny eval harness scoring agent outputs against expected criteria | Unit (deterministic scorer) |
| `src/agents/13-byo-starter.ts` | Blank-ish scaffold with TODOs for the reader | Smoke |
| `src/agents/13-byo-solution.ts` | Reference solution (new domain, e.g. a "trip planner" agent) | Structural (mocked model) |

- New runnable lessons are wired into `src/index.ts` menu (extend `valid` array + switch). The build-your-own *starter* is referenced from docs but need not be in the numbered menu (or added as an optional entry).

> **Decision per AR #3 & #5:** new topics get runnable, tested code; the BYO capstone ships a starter + a separate solution file.

## "Build your own agent" lesson design (AR #5)

- Domain: a **Trip Planner** agent (distinct from the support bot) — tools: `searchDestinations`, `getWeatherForecast` (mock), `estimateBudget` (deterministic calc).
- Reader builds incrementally with checkpoints; each checkpoint maps to a concept from Parts I–III.
- Starter file has `// TODO:` markers; solution file is complete and tested.
- **PF-008 — the starter MUST typecheck under `tsc`** (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). Use valid stub bodies (e.g. `throw new Error("TODO")` or typed placeholder returns) with TODOs as comments, so `yarn build` and the smoke-run stay green.
- Page ends with a checklist: "You can now build an agent if you can do X, Y, Z."

## Error Handling

| Error Case | Handling Strategy | AR Ref |
| ---------- | ----------------- | ------ |
| New runnable lesson breaks `yarn dev` menu | Extend `valid`/switch carefully; smoke-run after adding | AR #3 |
| Snippet region missing in new files | Add `#region` markers when authoring | AR #11 |
| BYO solution drifts from starter | Keep both in `src/`; solution imported into docs | AR #5 |

## Testing Requirements
- `safeEvaluate` (calculator) — spec-first unit tests (doc 07).
- RAG `cosineSimilarity` ranking — spec-first unit tests (doc 07).
- Eval-harness scorer (`12-evals.ts`) — unit tests (deterministic).
- Agent wiring (security, BYO solution) — structural tests with a mocked model (no network).
