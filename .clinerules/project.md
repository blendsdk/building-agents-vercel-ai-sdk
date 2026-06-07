# Project Configuration

> **Bootstrapped by `analyze_project`**, then hand-tuned for this repo.
> **Project:** my_project
> **Type:** library / teaching repo (Vercel AI SDK agent masterclass + VitePress docs)

---

## 🚨 MANDATORY: Load CodeOps Rules Before Any Work

**Before ANY planning or implementation, the AI agent MUST load these rules
using the codeops-mcp tools:**

1. `get_rule("agents")` — Load agent behavior rules **(REQUIRED FIRST)**
2. `get_rule("code")` — Load coding standards
3. `get_rule("testing")` — Load testing workflows
4. `get_rule("git-commands")` — Load git commit protocols

These rules are **mandatory** and must be consulted before every task.
**Do NOT skip this step. Do NOT proceed without reading these documents.**

---

## Project Overview

- **Name:** my_project
- **Description:** A hands-on masterclass repo for building production-grade AI
  agents in TypeScript with the Vercel AI SDK (`ai@6` + `@ai-sdk/openai@3`).
  Ships 10+ runnable single-concept tutorials under `src/agents/` plus a
  VitePress documentation site deployed to GitHub Pages.
- **Type:** library

## Toolchain

- **Language(s):** TypeScript (ESM, `type: module`, `module: nodenext`,
  `target: esnext`, `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **Framework(s):** Vercel AI SDK (`ai`), VitePress (docs), Vitest (tests)
- **Package Manager:** yarn (1.22)
- **Test Framework:** Vitest

**Manifest files found:** package.json, tsconfig.json

## Commands

All commands assume execution from the project root. Prefix all shell commands with `clear && sleep [delay] &&` (see Terminal Delay below).

### Terminal Delay

- **Delay (seconds):** 3
- The `clear` ensures a clean terminal; the `sleep` gives VS Code time to initialize the terminal before the command runs.
- Adjust the delay for your environment: `1` for fast machines, `3` (default) for normal, `5` for slower environments.

### Run a tutorial

```bash
clear && sleep 3 && yarn dev <n>   # <n> = source file number under src/agents
```

### Build

```bash
clear && sleep 3 && yarn build
```

### Test

```bash
# Run all tests
clear && sleep 3 && yarn test
```

### Docs

```bash
clear && sleep 3 && yarn docs:build     # build the VitePress site
clear && sleep 3 && yarn docs:dev       # local docs preview
```

### Verify (before commit)

```bash
# Full verification — run this before any git commit
clear && sleep 3 && yarn test && yarn docs:build
```

## Project Structure

### Type: Single repository

### Directory Layout

```
docs/        # VitePress documentation site (built to docs/.vitepress/dist)
plans/       # CodeOps plan artifacts
src/         # TypeScript sources
  agents/    # numbered single-concept tutorials (01..)
  tools.ts   # shared tools (getWeather, calculator/safeEvaluate)
  index.ts   # CLI launcher (yarn dev <n>)
  markdown.ts
dist/        # tsc output (git-ignored)
coverage/    # vitest coverage output (git-ignored)
```

## Coding Conventions

### Naming

- **Files:** kebab-case, numbered for tutorials (e.g. `01-oneshot.ts`)
- **Components/Classes:** PascalCase
- **Functions/Methods:** camelCase
- **Constants:** UPPER_SNAKE_CASE

### Dependencies

- New build/test/docs tooling (Vitest, VitePress, Mermaid) goes under a
  **`devDependencies`** block — not needed at runtime; CI installs frozen.
- See `.clinerules/ai-sdk.md` for Vercel AI SDK conventions and gotchas
  (use `generateText`/`streamText` + `Output`, not the deprecated
  `generateObject`/`streamObject`).

## Git & Commit Conventions

### Commit Scope

```
# Use module/feature as scope:
# feat(agents): ...   fix(tools): ...   docs(plans): ...   chore(ci): ...
```

### Branch Strategy

- **Main branch:** `main`
- **Feature branches:** `feature/[name]`

## Special Rules (Project-Specific)

```
- Docs must never drift from code: import real source via VitePress <<< snippets.
- No live OpenAI/embedding calls in tests; CI must be deterministic (mock model).
- Never commit secrets; OPENAI_API_KEY lives in .env (git-ignored).
```

## Cross-References

The generic rule files that read this `project.md`:

- **make_plan.md** — Uses verify command, file paths, commit scope, task file path patterns
- **code.md** — Uses language conventions, architecture rules
- **testing.md** — Uses test commands, test locations, test framework
- **git-commands.md** — Uses commit scope, verify command
- **agents.md** — Uses shell commands, verify command
- **preflight.md** — Uses project type, tech stack, and conventions for grounded quality audits
