# Prerequisites

This course is hands-on. To get the most out of it, make sure you have the
following in place before you start.

## Knowledge

- **TypeScript fundamentals** — types, interfaces, generics at a basic level.
- **Modern JavaScript** — `async`/`await`, Promises, ES modules (`import`/`export`).
- **The terminal** — running commands, setting environment variables.

You do **not** need prior experience with machine learning or LLM internals. The
course builds the agent concepts from first principles.

## Tooling

| Tool | Version | Notes |
| ---- | ------- | ----- |
| Node.js | 20 LTS or newer | The SDK and tutorials target modern Node. |
| Yarn | 1.22.x | The repo pins Yarn via `packageManager`. |
| Git | any recent | To clone the repo and follow along. |
| An editor | VS Code recommended | TypeScript IntelliSense helps a lot. |

## Accounts & keys

- An **OpenAI API key** with access to the models used in the lessons
  (e.g. `gpt-4o-mini` and `text-embedding-3-small`). You'll place it in a
  git-ignored `.env` file — see [Getting Started](/guide/getting-started).

> **Cost note:** the tutorials use small, inexpensive models and short prompts,
> but every run makes real API calls. The tests, by contrast, never hit the
> network and require no key.

## Verify your setup

```bash
node --version    # >= 20
yarn --version    # 1.22.x
```

Once these check out, continue to [Getting Started](/guide/getting-started).
