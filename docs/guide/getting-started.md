# Getting Started

Welcome to **Building AI Agents with the Vercel AI SDK**. This guide gets the
repo running on your machine so you can follow along with every lesson by
running the real code.

## 1. Clone the repo

```bash
git clone https://github.com/blendsdk/building-agents-vercel-ai-sdk.git
cd building-agents-vercel-ai-sdk
```

## 2. Install dependencies

This project uses **Yarn 1.x**:

```bash
yarn install
```

## 3. Add your OpenAI API key

The tutorials call OpenAI through the Vercel AI SDK. Create a `.env` file in the
project root:

```bash
echo "OPENAI_API_KEY=sk-..." > .env
```

> The `.env` file is git-ignored — never commit your key.

## 4. Run a tutorial

Each lesson maps to a numbered source file under `src/agents/`. Run one by its
**source file number** with `yarn dev`:

```bash
yarn dev 1     # runs src/agents/01-oneshot.ts
yarn dev 5     # runs src/agents/05-rag.ts
```

## 5. Run the tests

The deterministic logic (calculator parser, RAG ranking, eval scorer) is covered
by a fast, network-free test suite:

```bash
yarn test
```

## How this course works

- **Read a lesson** on this site — every code sample is imported directly from
  the real source files, so what you read is exactly what runs.
- **Run the matching file** with `yarn dev <n>` and watch the agent work.
- **Experiment** — tweak prompts, tools, and schemas, then re-run.

When you're ready, the course begins with **Part I — Foundations** (added as the
curriculum lands).

Next: make sure you meet the [Prerequisites](/guide/prerequisites).

