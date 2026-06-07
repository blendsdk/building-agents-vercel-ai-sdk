---
layout: home
hero:
  name: Building AI Agents
  text: with the Vercel AI SDK
  tagline: From the agent loop to a production-grade, multi-agent system — in TypeScript.
  actions:
    - theme: brand
      text: Start the Course →
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/blendsdk/building-agents-vercel-ai-sdk
features:
  - icon: 🔁
    title: The Agent Loop
    details: Understand what turns an LLM call into an autonomous, tool-using agent.
  - icon: 🛠
    title: Tools & Structured Output
    details: Give agents real capabilities and typed, validated results with Zod.
  - icon: 📚
    title: RAG
    details: Ground answers in your own documents with embeddings + retrieval.
  - icon: 🛡
    title: Production Hardening
    details: Robust errors, human approval gates, security, observability & cost.
  - icon: 🤝
    title: Multi-Agent
    details: Orchestrate specialist agents behind a supervisor.
  - icon: 🚀
    title: Ship It
    details: Test, deploy, and run agents with confidence.
---

## What you'll build

A complete, runnable masterclass in building AI agents — starting from a single
LLM call and ending with a tested, deployed, multi-agent system. Every concept
is backed by real, runnable TypeScript under `src/agents/`, and **every code
sample on this site is imported directly from those source files** so the docs
can never drift from the code.

```mermaid
flowchart LR
    U[User prompt] --> M[LLM]
    M -->|tool call| T[Tool]
    T -->|result| M
    M -->|final answer| A[Answer]
```

The diagram above is the **agent loop**: an LLM in a loop that can call tools,
inspect their results, and decide what to do next until it produces a final
answer.

## The curriculum

The course is organized into four parts:

- **Part I — Foundations**: what an agent is, your first agent loop, the anatomy
  of a tool.
- **Part II — Core Capabilities**: streaming & memory, structured output,
  the `ToolLoopAgent` class, and RAG.
- **Part III — Production Hardening**: robust error handling, human-in-the-loop
  approval, security, observability & cost, and testing/evaluating agents.
- **Part IV — Architecture & Scale**: multi-agent orchestration, a capstone
  walkthrough, building your own agent, and deploying to production.

## Who this is for

TypeScript developers who want to build real, production-grade AI agents — not
just call a chat API. You should be comfortable with `async`/`await`, ES modules,
and the basics of the terminal. See [Prerequisites](/guide/prerequisites) for the
full list, then head to [Getting Started](/guide/getting-started).

## A taste of the code

Here is a real shared tool from the repo (`src/tools.ts`), imported live into
this page:

<<< @/../src/tools.ts{ts}
