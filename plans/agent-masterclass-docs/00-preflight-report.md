# Preflight Report: Agent Masterclass Docs

> **Status**: ✅ PASSED — 13 findings (0 🔴, 2 🟠, 7 🟡, 4 🔵); **ALL resolved/applied**
> **Iteration**: 2 (all findings closed — remaining MINOR + all OBSERVATIONS applied)
> **Artifact**: Implementation plan — 9 documents at `plans/agent-masterclass-docs/`
> **Codebase Grounded**: ✅ 8 source files + package.json + tsconfig + .gitignore + git state examined
> **Same-session bias**: Not applicable — this plan was not authored in this session.
> **Last Updated**: 2026-06-07

## Codebase Context Summary

- **Tech Stack:** TypeScript ESM (`type: module`, `module: nodenext`, `target: esnext`, `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). `ai@^6.0.197`, `@ai-sdk/openai@^3.0.68`, `zod@^4.4.3`, `tsx@^4`, `typescript@^6`. Yarn 1.22 (`yarn.lock`).
- **Architecture:** 10 runnable single-concept tutorials in `src/agents/01..10`, shared `src/tools.ts` (`getWeather`, `calculator`/`safeEvaluate`), `src/index.ts` CLI launcher, `src/markdown.ts` renderer. Run via `yarn dev <n>`.
- **Reality check:** No `docs/`, no `.github/`, no test runner, no `.clinerules/project.md`. Git on branch `master` with **0 commits** (all files untracked), **no remote**.
- **Reference Verification:** Every source-file→lesson mapping verified present (zero phantom references). ST-1…10 calculator cases verified line-by-line against the real `safeEvaluate` grammar — all correct.

### Summary by Severity

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 CRITICAL | 0 | — |
| 🟠 MAJOR | 2 | ✅ both resolved (fixes applied) |
| 🟡 MINOR | 7 | ✅ all 7 fixed (PF-003 stamped `codeops-mcp 1.13.0`) |
| 🔵 OBSERVATION | 4 | ✅ all 4 applied |

---

## 🟠 MAJOR

### PF-001: CI `test` job fails until Phase 1 / on early push 🟠 MAJOR
**Dimension:** Ordering & Sequencing / Feasibility / Codebase Alignment
**Location:** `06-deployment-pages.md` (workflow `test` job); `99-execution-plan.md` task 0.3.2 vs Phase 1.
**Codebase Evidence:** `test` script becomes `vitest run` at 0.1.3; no `*.test.ts` exists until Phase 1. `vitest run` with no matching files exits non-zero (`passWithNoTests` defaults false). Workflow is created in Phase 0 and triggers on push to `main`.
**The Problem:** The deploy workflow's `test` gate would fail on any push before Phase 1 lands, blocking the early-preview deploys AR #17 intended.
**Resolution:** ✅ Applied — added `--passWithNoTests` to the CI test invocation and an explicit "do not push `main` until Phase 1 tests land / Ship phase" note in `99-execution-plan.md`. (User-accepted recommendation: Option A + C.)

### PF-002: Task count mismatch (header 41 vs checklist 54) 🟠 MAJOR
**Dimension:** Consistency / Execution-Plan Completeness
**Location:** `99-execution-plan.md` line 6.
**The Problem:** Header read `0/41 tasks`; the Master Progress Checklist contains 54 tasks (P0=12, P1=9, P2=5, P3=5, P4=9, P5=9, P6=5). The progress counter is the execution source of truth.
**Resolution:** ✅ Applied — corrected to `0/54 tasks`.

---

## 🟡 MINOR

- **PF-003 — Unfilled version stamp.** `00-index.md` and `99-execution-plan.md` carried literal `CodeOps Version: (from codeops-mcp)`. ✅ Applied — stamped `codeops-mcp 1.13.0` (the active global install serving the codeops-mcp tools) in both files so `exec_plan`'s version check works.
- **PF-004 — `.gitignore` task redundant.** `coverage/` and `dist/` are already ignored; only `docs/.vitepress/dist` and `docs/.vitepress/cache` are missing. ✅ Applied — narrowed task in `06` and `99`.
- **PF-005 — Branch rename assumes a born branch.** `master` is unborn (0 commits); `git branch -m` can fail. ✅ Applied — `06` now uses `git checkout -b main` before the first commit. *(Evidence: `git log` → "branch 'master' does not have any commits yet".)*
- **PF-006 — `Run: yarn dev <n>` ambiguous.** Lesson numbers (1–16) diverge from file numbers (e.g. Lesson 10 → `yarn dev 11`, Lesson 11 → `yarn dev 9`). ✅ Applied — `04` template clarifies `<n>` = source file number + mapping note.
- **PF-007 — Red-phase claim over-broad.** `safeEvaluate` (export-only) and `rankBySimilarity` (extract-only) spec tests pass immediately; true red phase only applies to the new `evals` scorer. ✅ Applied — reworded task 1.1.5.
- **PF-008 — BYO starter may break `tsc`/smoke.** `13-byo-starter.ts` with `// TODO` bodies must still compile under strict settings. ✅ Applied — `04` requires the starter to typecheck (stub bodies, TODOs as comments).
- **PF-009 — "dev deps" vs project convention.** Repo has no `devDependencies` block (`tsx`/`typescript`/`@types/node` under `dependencies`). ✅ Applied — `05` notes the convention decision (new tooling goes under `devDependencies`, intentionally introducing the block).

## 🔵 OBSERVATIONS (all applied)

- **PF-010 — Characterization vs spec-first.** ST-1…15 derive from existing code behavior — mildly tautological for a "spec-first" frame. ✅ Applied — added a "characterization vs. spec-first" note in `07-testing-strategy.md` clarifying ST-1…15 are characterization/regression tests and only ST-16…20 are true spec-first (red phase).
- **PF-011 — Lesson 16 prose-only.** Deploying *agents* sits next to a pipeline that deploys *docs*. ✅ Applied — `04` now requires Lesson 16 to open with a `::: warning` callout distinguishing "deploy the docs (Pages)" from "deploy the reader's own agent."
- **PF-012 — Verify `@/../src` snippet alias.** ✅ Applied — `03-vitepress-setup.md` adds a verification note to confirm the `@/../src` alias against the installed VitePress during 0.2.x, with an explicit `srcDir`/relative-path fallback.
- **PF-013 — Mock-model export name in `ai@6`.** ✅ Applied — `05-testing-infra.md` adds a note that `MockLanguageModelV2` is illustrative and version-sensitive; resolve the real export via grep (and `ai/test`) when authoring `wiring.spec.test.ts`, else use the minimal fake.

---

## Verdict

**✅ PASSED.** No critical defects, zero phantom references, spec test cases accurate against real code. Both MAJORs and all 7 MINORs resolved (PF-003 stamped `codeops-mcp 1.13.0`), and all 4 OBSERVATIONS applied as plan-doc clarifications. The plan is ready for execution.
