# Building AI Agents with the Vercel AI SDK

A hands-on, ten-part course for learning to build AI agents in TypeScript using the
[Vercel AI SDK](https://ai-sdk.dev) (`ai` v6) with the OpenAI provider. Each tutorial
is a small, heavily-commented, runnable program that teaches one concept — building
from a basic agent loop all the way to a production-style capstone.

## What's an "agent"?

An **agent** is an LLM running in a *loop* that can call **tools** (functions you
define), observe the results, and keep going until it produces a final answer. The
single line that enables that loop in this SDK is `stopWhen: stepCountIs(N)`.

## Setup

```bash
# 1. Install dependencies
yarn install

# 2. Add your OpenAI API key
echo "OPENAI_API_KEY=sk-..." > .env
```

> ⚠️ Keep `.env` out of version control and rotate any key that's been exposed.

## Running

```bash
yarn dev          # interactive menu — pick a tutorial 1–10
yarn dev <n>      # run a specific tutorial directly, e.g. `yarn dev 5`
yarn build        # type-check + compile with tsc
```

## The tutorials

Run them in order — each builds on the last.

| # | Tutorial | What you learn | File |
|---|----------|----------------|------|
| 1 | **One-shot agent** | The core agent loop + tool calling (`generateText` + `stepCountIs`) | `src/agents/01-oneshot.ts` |
| 2 | **Interactive chat** | Streaming (`streamText`) + conversation memory (`messages`) | `src/agents/02-interactive.ts` |
| 3 | **Structured JSON** | Typed, validated output via `Output.object` + Zod | `src/agents/03-json.ts` |
| 4 | **Agent class** | The reusable `ToolLoopAgent` abstraction | `src/agents/04-agent-class.ts` |
| 5 | **RAG** | Grounding answers in your own docs with embeddings + retrieval | `src/agents/05-rag.ts` |
| 6 | **Robust agents** | Structured tool errors + the tool-repair hook | `src/agents/06-robust.ts` |
| 7 | **Human-in-the-loop** | Approval gates for sensitive tools | `src/agents/07-human-in-the-loop.ts` |
| 8 | **Multi-agent** | Orchestration — a supervisor that delegates to specialist agents | `src/agents/08-multi-agent.ts` |
| 9 | **Observability** | Tracing steps, token usage & cost | `src/agents/09-observability.ts` |
| 10 | **Capstone** | A support agent combining RAG + JSON + approval + errors + observability | `src/agents/10-capstone.ts` |

## Project layout

```
src/
  index.ts        # launcher / menu — dispatches to a tutorial
  tools.ts        # shared example tools (getWeather, calculator)
  markdown.ts     # terminal markdown renderer (pretty output)
  agents/         # the ten tutorials (01 … 10)
.clinerules/
  ai-sdk.md       # conventions & gotchas — read this for the "rules"
```

## Key things to know (see `.clinerules/ai-sdk.md` for details)

- **Structured output:** `generateObject` / `streamObject` are **deprecated** in v6.
  Use `generateText` / `streamText` with an `output: Output.object({ schema })` setting
  and read `result.output`.
- **System prompts:** pass via the `system` option (or `instructions` on `ToolLoopAgent`),
  not as a `{ role: "system" }` message.
- **Embeddings:** use `openai.embedding(...)` (`textEmbedding` is deprecated).
- **Robust tools:** return structured `{ ok: false, error }` results instead of throwing,
  so the agent can recover.
- **Verify the API:** when unsure, check the installed types directly:
  `grep -nE "@deprecated" node_modules/ai/dist/index.d.ts`.

## Tech stack

- [`ai`](https://www.npmjs.com/package/ai) v6 — the Vercel AI SDK
- [`@ai-sdk/openai`](https://www.npmjs.com/package/@ai-sdk/openai) v3 — OpenAI provider
- [`zod`](https://zod.dev) — tool input + structured output schemas
- TypeScript (ESM, `nodenext`) run with [`tsx`](https://www.npmjs.com/package/tsx)
