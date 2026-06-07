# Preflight Report: Agent Masterclass Docs

> **Status**: ✅ PASSED WITH NOTES (latest: Iteration 3) — see Iteration 3 section at the bottom.
> **Iteration**: 3 (post-execution re-scan after Phases 0–1 landed). Iteration 1–2 history below.
> **Artifact**: Implementation plan — 9 documents at `plans/agent-masterclass-docs/`
> **Codebase Grounded**: ✅ Iter 1–2: 8 source files + manifests + git state. Iter 3: re-examined live repo (docs/, .github/, vitest.config, deploy.yml, src/index.ts, src/agents/*) + empirically built a snippet probe.
> **Same-session bias**: Iter 1–2 N/A. **Iter 3: ELEVATED** — the auditing agent executed Phases 0–1 of this plan earlier in the same session (disclosed in the Iteration 3 section).
> **Last Updated**: 2026-06-07 (Iteration 3)


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

---

# Preflight Report — Iteration 3 (2026-06-07, post-execution re-scan)

> **Status**: ✅ PASSED WITH NOTES — 5 new findings (0 🔴, 1 🟠, 2 🟡, 2 🔵) + 1 positive verification.
> **Previous Iteration**: Iteration 2 — 13 findings, all resolved.
> **This Iteration**: 5 new findings (PF-014 … PF-018). Numbering continues from PF-013.
> **Trigger**: `preflight agent-masterclass-docs` after Phases 0 & 1 were executed.
> ⚠️ **SAME-SESSION REVIEW (elevated bias risk):** The agent running this audit executed
> Phases 0–1 of this plan earlier in the same session. Part of the "reality" being audited
> reflects the agent's own changes. A future independent review is advisable before Ship.

## Codebase Context Summary (Iteration 3)

The repo has materially advanced past the Iteration-1/2 snapshot:
- Branch `main` with commits; remote `origin` → `blendsdk/building-agents-vercel-ai-sdk.git`.
- `docs/.vitepress/config.ts` (base `/building-agents-vercel-ai-sdk/`, Mermaid, Shiki dual theme,
  local search), `docs/guide/*`, `docs/DEPLOYMENT.md`, `.github/workflows/deploy.yml`,
  `vitest.config.ts`, `.clinerules/project.md` all **exist**.
- `src/agents/12-evals.ts` exists; `src/index.ts` menu still wires only 1–10.
- **Verification runs:** `yarn test` → 44 tests pass (6 files); `yarn docs:build` → success.

## Positive verification — PF-012 now CLOSED by evidence

Iteration 2 left PF-012 (the `@/../src` snippet alias) as a *verify-later* note. Iteration 3
tested it empirically: a throwaway page with `<<< @/../src/tools.ts{ts}` was built via
`yarn docs:build`, and `safeEvaluate` was confirmed present in the rendered HTML. **The alias
resolves correctly under installed VitePress 1.6.4** — no `srcDir`/relative fallback needed.
(Probe file removed after the test.)

## Findings (Iteration 3)

### PF-014: `02-current-state.md` contradicts the live repo 🟠 MAJOR
**Dimension:** Codebase Alignment / Consistency
**Location:** `02-current-state.md` "What Exists"; mirrored in this report's old "Reality check" line.
**Codebase Evidence:** Doc claims "no `docs/`, no `.github/`, no test runner, no `.clinerules/project.md`; branch `master` with 0 commits, no remote." All now false (branch `main`, commits, `origin` set, `docs/`, `deploy.yml`, `vitest.config.ts`, `.clinerules/project.md` exist).
**Problem:** A future session resuming from this plan would be misled about the starting point.
**Resolution:** ✅ Applied — Option A: added a dated "⚠️ SUPERSEDED" banner at the top of
`02-current-state.md` pointing to the execution plan for live status; historical snapshot preserved.

### PF-015: Iteration-2 report header read as current truth 🟡 MINOR
**Dimension:** Consistency
**Location:** `00-preflight-report.md` header.
**Problem:** The PASSED Iteration-2 header described a repo state (`master`, 0 commits) that no longer exists.
**Resolution:** ✅ Applied — Option A: header updated to point to Iteration 3; this section persisted into the same file (single audit trail).

### PF-016: PF-001 CI-sequencing caveat now obsolete 🟡 MINOR
**Dimension:** Ordering & Sequencing
**Location:** `99-execution-plan.md` CI-sequencing callout; `deploy.yml` `yarn test --passWithNoTests`.
**Codebase Evidence:** Phase 1 test files now exist and pass, so "don't push `main` until Phase 1 lands" no longer applies and `--passWithNoTests` is now inert.
**Resolution:** ✅ Applied — Option B: callout in `99-execution-plan.md` marked RESOLVED; `--passWithNoTests` kept in the workflow as harmless insurance.

### PF-017: `12-evals.ts` exists but is unreachable via `yarn dev` 🔵 OBSERVATION
**Dimension:** Codebase Alignment
**Codebase Evidence:** `src/agents/12-evals.ts` exists; `src/index.ts` validates only `["1".."10"]`, so `yarn dev 12` fails today. `04-curriculum-content.md` already advertises `yarn dev 12`.
**Disposition:** No plan change — wiring is correctly scheduled at task **4.1.2** (and covers `11-security`). Flagged so 4.1.2 isn't missed.

### PF-018: Dependency placement remains split (already adjudicated) 🔵 OBSERVATION
**Dimension:** Consistency
**Codebase Evidence:** `tsx`/`typescript`/`@types/node` under `dependencies`; new tooling under `devDependencies`.
**Disposition:** Accept — this is the settled PF-009 decision (avoid churning existing entries). No action.

## Verdict (Iteration 3)

**✅ PASSED WITH NOTES.** Zero critical, one major (a stale pre-execution snapshot — fixed), two
minors (audit-trail + obsolete CI caveat — fixed), two benign observations (accepted). The plan's
unexecuted phases (2–6) remain sound; the lesson→source mapping is internally consistent; and the
sole outstanding technical risk from Iteration 2 (snippet alias) is now empirically verified working.

