# Current State: Agent Masterclass Docs

> **Document**: 02-current-state.md
> **Parent**: [Index](00-index.md)

> ⚠️ **SUPERSEDED (2026-06-07, preflight PF-014).** This is a point-in-time
> snapshot of the repo *before execution began*. **Phases 0 and 1 of the plan
> have since been executed**, so the "What Exists" statements below are no longer
> accurate: `docs/` (VitePress site), `.github/workflows/deploy.yml`,
> `vitest.config.ts` + test files, and `.clinerules/project.md` now exist; git is
> on branch `main` with commits and a configured `origin` remote. For live
> status, see `99-execution-plan.md` (Master Progress Checklist). This document
> is retained as historical context — do not treat it as current truth.

## Existing Implementation


### What Exists

The repository is a working set of 10 runnable Vercel AI SDK tutorials plus shared infrastructure. Each tutorial is a heavily-commented, single-concept program runnable via `yarn dev <n>`. A `README.md` ties them together as a course. Conventions live in `.clinerules/ai-sdk.md`.

There is **no documentation site, no test runner, no git remote, and no `.clinerules/project.md`** yet.

### Relevant Files

| File | Purpose | Changes Needed |
| ---- | ------- | -------------- |
| `src/index.ts` | Launcher/menu dispatching tutorials 1–10 | Reference only; extend menu if new runnable lessons added |
| `src/tools.ts` | Shared `getWeather` + `calculator` (safe parser) tools | Source for snippet imports; `safeEvaluate` is a spec-test target |
| `src/markdown.ts` | Terminal markdown renderer | Reference only |
| `src/agents/01..10*.ts` | The 10 tutorials | Source for snippet imports into lesson pages |
| `README.md` | Existing course README | Keep; landing page complements it |
| `.clinerules/ai-sdk.md` | SDK conventions & gotchas | Source for appendix cheat-sheet |
| `package.json` | Scripts + deps | Add Vitest + VitePress deps/scripts; replace placeholder `test` |
| `tsconfig.json` | TS ESM config | Reference; ensure compatible with Vitest |
| `.gitignore` | Ignores | Add VitePress cache/dist + coverage |

### Code Analysis

- **`src/tools.ts`** contains `safeEvaluate` — a recursive-descent arithmetic parser (no `eval`). Deterministic and pure → ideal **spec-first** unit-test target (precedence, parentheses, decimals, invalid input rejection).
- **`src/agents/05-rag.ts`** contains `cosineSimilarity`-based retrieval with deterministic ranking given fixed embeddings → testable by injecting known vectors (mock the embedding model) and asserting ordering.
- All agent files export a single `runXxx()` entrypoint and use `openai("gpt-4o-mini")` / `openai.embedding(...)`. For wiring tests we mock the model rather than call the network.

## Gaps Identified

### Gap 1: No documentation site
**Current:** Lessons are code + README only.
**Required:** VitePress site in `docs/` with landing page and per-lesson pages.
**Fix:** Scaffold VitePress, config (base, Mermaid, Shiki), nav/sidebar.

### Gap 2: No tests
**Current:** `test` script is a placeholder that errors.
**Required:** Vitest suite for deterministic logic + mocked-model wiring.
**Fix:** Add Vitest, `vitest.config.ts`, spec/impl tests.

### Gap 3: No deployment
**Current:** No remote, branch is `master`.
**Required:** Remote `blendsdk/building-agents-vercel-ai-sdk`, branch `main`, Pages via Actions.
**Fix:** Configure git, add deploy workflow + DEPLOYMENT.md.

### Gap 4: No project config for CodeOps
**Current:** No `.clinerules/project.md`.
**Required:** Generated config reflecting yarn/TS/Vitest/VitePress.
**Fix:** Run `analyze_project` first; save output.

### Gap 5: Missing masterclass theory/topics
**Current:** Lessons are mechanic-focused, no security/testing/build-your-own.
**Required:** New theory + runnable lessons.
**Fix:** Author new pages + new `src/` code where AR #3 applies.

## Dependencies

### Internal Dependencies
- Snippet imports depend on stable `src/` file paths and (optionally) region markers.
- Tests depend on exported pure functions / mockable model boundaries.

### External Dependencies
- `vitepress`, `vitepress-plugin-mermaid`, `mermaid` (dev).
- `vitest` (+ `@vitest/coverage-v8` optional) (dev).
- GitHub repo + Pages enabled (user one-time UI step).

## Risks and Concerns

| Risk | Likelihood | Impact | Mitigation |
| ---- | ---------- | ------ | ---------- |
| Snippet imports break if `src/` refactored | Med | Med | Use region markers + a build step that fails on missing regions |
| `safeEvaluate`/`cosineSimilarity` not exported for tests | High | Low | Export them (or test via small re-exports) without changing behavior |
| VitePress base path misconfig breaks Pages assets | Med | High | Set `base: '/building-agents-vercel-ai-sdk/'`; verify in built output |
| Mocking the AI SDK model is non-trivial | Med | Med | Use SDK test/mock model utilities or a minimal fake `LanguageModel`; keep wiring tests structural |
| Large lesson pages exceed context to author | Med | Low | Author part-by-part (phases); one page at a time |
| Trademark concern (Vercel) | Low | Low | Frame as "built with the Vercel AI SDK", not official |
