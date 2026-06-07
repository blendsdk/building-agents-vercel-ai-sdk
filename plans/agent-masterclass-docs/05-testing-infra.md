# Testing Infrastructure: Agent Masterclass Docs

> **Document**: 05-testing-infra.md
> **Parent**: [Index](00-index.md)

## Overview

Defines the Vitest setup and the strategy for testing deterministic logic and agent wiring **without live network calls**. *(AR #12, #13)*

## Architecture

### Why Vitest
- ESM- and TypeScript-native (matches `type: module`, `nodenext`).
- Fast, zero-config-ish, Jest-compatible API.
- Works alongside `tsx`/`tsc` without changing runtime.

### Dependencies (dev)
- `vitest`
- `@vitest/coverage-v8` (optional, for coverage)

> **PF-009 — dependency placement.** The repo currently has **no `devDependencies` block** (`tsx`, `typescript`, `@types/node` all live under `dependencies`). Decision: all new build/test/docs tooling (Vitest, VitePress, Mermaid plugin) is intentionally added under a new **`devDependencies`** block — it is not needed at runtime and CI installs with `--frozen-lockfile`. Apply this convention consistently in tasks 0.1.2 and 0.1.3.

### Config (`vitest.config.ts`)

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{spec,impl}.test.ts"],
    coverage: { provider: "v8", reportsDirectory: "coverage" },
  },
});
```

### Scripts (`package.json`)
- `"test": "vitest run"` (replaces the placeholder error script)
- `"test:watch": "vitest"`
- `"test:cov": "vitest run --coverage"`

## Test Categories & Naming

Per the Specification-First protocol:
- **Spec tests** (`*.spec.test.ts`) — written BEFORE implementation, derived from `07-testing-strategy.md` ST-cases. Verified to FAIL first (red), then PASS (green).
- **Impl tests** (`*.impl.test.ts`) — written AFTER implementation for edge cases/internals.

## What Gets Tested (AR #13)

### 1. Deterministic logic (pure unit tests)
- **`safeEvaluate`** (calculator parser in `src/tools.ts`): operator precedence, parentheses, decimals, division, whitespace, and rejection of invalid characters / malformed input.
  - Requires exporting `safeEvaluate` from `src/tools.ts` (currently file-local). Export does not change behavior.
- **RAG ranking** (`cosineSimilarity` ordering): given fixed vectors, the retrieval returns the correct top-K in the correct order.
  - Extract a pure `rankBySimilarity(queryVec, docs)` helper (or export the existing logic) so it can be tested without embeddings.
- **Eval scorer** (`src/agents/12-evals.ts`): deterministic scoring function maps known outputs to expected scores.

### 2. Agent wiring (structural, mocked model)
- Use a **mock language model** (the AI SDK provides test doubles, e.g. `MockLanguageModelV2` from `ai/test`, or a minimal fake) to assert:
  - tools are registered and called with schema-valid input,
  - structured-error tools return `{ ok: false, ... }` objects rather than throwing,
  - the agent loop terminates (respects `stopWhen`).
- **No network, no OpenAI key required** in CI. *(AR #13)*

> **Verification note:** Before writing mocked-model tests, verify the exact mock export available in the installed SDK:
> `grep -rnE "Mock(Language|Embedding)Model|simulateReadableStream" node_modules/ai/`
> If no suitable mock is exported, implement a minimal fake conforming to the model interface used by `generateText`.

> **PF-013 — mock export name is version-sensitive.** `MockLanguageModelV2` is illustrative; in the
> installed `ai@^6` the export may be a different version suffix (e.g. `…V3`) or live at a different
> path. **Do not hardcode the name** — resolve it from the grep above (and check `node_modules/ai/test`)
> when authoring `wiring.spec.test.ts` (task 1.2.2). The matching mocked model interface version must
> line up with the model interface `generateText` consumes in this SDK version; otherwise fall back to
> the minimal fake.

### 3. Out of scope
- No live OpenAI/embedding calls in CI.
- No snapshot tests of nondeterministic LLM text.

## Integration Points
- `yarn test` runs in the deploy/CI workflow as a gate before building docs (or as a separate `test` job).
- Coverage artifacts ignored by git (`.gitignore`).

## Error Handling

| Error Case | Handling Strategy | AR Ref |
| ---------- | ----------------- | ------ |
| `safeEvaluate` not exported | Add `export`; no behavior change | AR #13 |
| SDK mock model export differs | Verify via grep; fall back to minimal fake | AR #13 |
| Flaky/network test introduced | Prohibited — CI must be deterministic | AR #13 |

## Testing Requirements
- All ST-cases in `07-testing-strategy.md` implemented as `*.spec.test.ts`.
- Red phase demonstrated for new code (security scorer, evals) before implementation.
- `yarn test` green before any commit of a testing task.
