# Execution Plan: Agent Masterclass Docs

> **Document**: 99-execution-plan.md
> **Parent**: [Index](00-index.md)
> **Last Updated**: 2026-06-07 20:26
> **Progress**: 26/54 tasks (48%) — Phases 0–2 complete (44 tests green; docs build OK)

> **CodeOps Version**: codeops-mcp 1.13.0


## Overview

Build the VitePress masterclass and ship it to GitHub Pages. Work proceeds part-by-part (AR #17) so content can be reviewed early. Specification-first testing is applied to all new deterministic code.

> **✅ CI sequencing (PF-001 — RESOLVED 2026-06-07, preflight PF-016):** Phase 1 tests have landed (44 tests green), so the original "do not push `main` until Phase 1 tests land" caveat no longer applies — pushing `main` is now safe. The deploy workflow's `test` job keeps `--passWithNoTests` as harmless insurance (inert now that test files exist).

**🚨 Update this document after EACH completed task!**

---

## Implementation Phases

| Phase | Title | Sessions | Est. Time |
| ----- | ----- | -------- | --------- |
| 0 | Foundation (config, deps, scaffold, deploy plumbing, landing) | 3 | 2–3 h |
| 1 | Testing infra (spec-first) | 2 | 2–3 h |
| 2 | Part I — Foundations (lessons 1–3) | 1 | 2 h |
| 3 | Part II — Core Capabilities (lessons 4–7) | 1 | 3 h |
| 4 | Part III — Production Hardening (lessons 8–12 + new code) | 2 | 4 h |
| 5 | Part IV — Architecture & Scale (lessons 13–16 + BYO) | 2 | 4 h |
| 6 | Ship (build, verify, deploy, appendix) | 1 | 1–2 h |

**Total: ~12 sessions, ~18–23 hours**

---

## Phase 0: Foundation

### Session 0.1: Project config & dependencies
**Reference**: 05-testing-infra.md, 03-vitepress-setup.md
**Tasks**:

| # | Task | File |
| - | ---- | ---- |
| 0.1.1 | Generate `.clinerules/project.md` via `analyze_project` | `.clinerules/project.md` |
| 0.1.2 | Add VitePress + Mermaid dev deps; add `docs:*` scripts | `package.json` |
| 0.1.3 | Add Vitest dev deps; replace `test` script; add `test:*` scripts | `package.json` |
| 0.1.4 | Add `docs/.vitepress/dist` + `docs/.vitepress/cache` to `.gitignore` (note: `dist/` and `coverage/` already ignored — PF-004) | `.gitignore` |

### Session 0.2: VitePress scaffold & landing page
**Tasks**:

| # | Task | File |
| - | ---- | ---- |
| 0.2.1 | Create `docs/.vitepress/config.ts` (base, Mermaid, Shiki, nav/sidebar) | `docs/.vitepress/config.ts` |
| 0.2.2 | Create theme entry + `docs/public/.nojekyll` | `docs/.vitepress/theme/index.ts`, `docs/public/.nojekyll` |
| 0.2.3 | Create landing page with hero, features, Mermaid teaser | `docs/index.md` |
| 0.2.4 | Create `getting-started.md` + `prerequisites.md` | `docs/guide/*` |
| 0.2.5 | Verify `yarn docs:build` succeeds | — |

### Session 0.3: Git & deployment plumbing
**Tasks**:

| # | Task | File |
| - | ---- | ---- |
| 0.3.1 | Add git remote `origin`; rename branch `master`→`main` | (git config) |
| 0.3.2 | Create deploy workflow | `.github/workflows/deploy.yml` |
| 0.3.3 | Create `docs/DEPLOYMENT.md` checklist | `docs/DEPLOYMENT.md` |

---

## Phase 1: Testing infra (spec-first)

### Session 1.1: Spec tests (red phase)
**Reference**: 07-testing-strategy.md
**Tasks**:

| # | Task | File |
| - | ---- | ---- |
| 1.1.1 | Add `vitest.config.ts` | `vitest.config.ts` |
| 1.1.2 | Export `safeEvaluate`; write `tools.spec.test.ts` (ST-1…10) | `src/tools.ts`, `src/tools.spec.test.ts` |
| 1.1.3 | Extract pure `rankBySimilarity`; write `rag-ranking.spec.test.ts` (ST-11…15) | `src/agents/05-rag.ts`, `src/agents/rag-ranking.spec.test.ts` |
| 1.1.4 | Write `evals.spec.test.ts` (ST-16…20) for not-yet-existing scorer | `src/agents/evals.spec.test.ts` |
| 1.1.5 | Verify red phase **for new code only** — `evals.spec.test.ts` (ST-16…20) must FAIL pre-impl. `safeEvaluate` (export-only) and `rankBySimilarity` (extract-only) spec tests are expected to PASS immediately (characterization) — PF-007 | — |

### Session 1.2: Green phase + wiring
**Tasks**:

| # | Task | File |
| - | ---- | ---- |
| 1.2.1 | Implement `scoreAnswer` in `12-evals.ts` to satisfy ST-16…20 | `src/agents/12-evals.ts` |
| 1.2.2 | Verify mock model export; write `wiring.spec.test.ts` (ST-21…22) | `src/agents/wiring.spec.test.ts` |
| 1.2.3 | Add impl tests (`tools.impl.test.ts`, `evals.impl.test.ts`) | `src/*.impl.test.ts` |
| 1.2.4 | `yarn test` green | — |

---

## Phase 2: Part I — Foundations

### Session 2.1: Lessons 1–3
**Reference**: 04-curriculum-content.md
**Tasks**:

| # | Task | File |
| - | ---- | ---- |
| 2.1.1 | Add `#region` markers to `01-oneshot.ts` / `tools.ts` as needed | `src/agents/01-oneshot.ts`, `src/tools.ts` |
| 2.1.2 | Lesson 1 — What is an agent? (+agent-loop Mermaid) | `docs/part-1-foundations/01-what-is-an-agent.md` |
| 2.1.3 | Lesson 2 — Your first agent loop | `docs/part-1-foundations/02-first-agent-loop.md` |
| 2.1.4 | Lesson 3 — Anatomy of a tool | `docs/part-1-foundations/03-anatomy-of-a-tool.md` |
| 2.1.5 | Wire sidebar; `yarn docs:build` | `docs/.vitepress/config.ts` |

---

## Phase 3: Part II — Core Capabilities

### Session 3.1: Lessons 4–7
**Tasks**:

| # | Task | File |
| - | ---- | ---- |
| 3.1.1 | Lesson 4 — Streaming & memory | `docs/part-2-core/04-streaming-memory.md` |
| 3.1.2 | Lesson 5 — Structured output (`Output.object`) | `docs/part-2-core/05-structured-output.md` |
| 3.1.3 | Lesson 6 — `ToolLoopAgent` | `docs/part-2-core/06-toolloop-agent.md` |
| 3.1.4 | Lesson 7 — RAG (+RAG-flow Mermaid) | `docs/part-2-core/07-rag.md` |
| 3.1.5 | Wire sidebar; `yarn docs:build` | `docs/.vitepress/config.ts` |

---

## Phase 4: Part III — Production Hardening

### Session 4.1: New runnable code (spec-first where applicable)
**Tasks**:

| # | Task | File |
| - | ---- | ---- |
| 4.1.1 | Write `11-security.ts` (prompt-injection defense + sandboxed tool) | `src/agents/11-security.ts` |
| 4.1.2 | Wire `11`/`12` into `src/index.ts` menu; smoke-run | `src/index.ts` |
| 4.1.3 | `wiring`/structural tests cover `11-security.ts` | `src/agents/wiring.spec.test.ts` |

### Session 4.2: Lessons 8–12
**Tasks**:

| # | Task | File |
| - | ---- | ---- |
| 4.2.1 | Lesson 8 — Robust agents | `docs/part-3-hardening/08-robust-agents.md` |
| 4.2.2 | Lesson 9 — Human-in-the-loop | `docs/part-3-hardening/09-human-in-the-loop.md` |
| 4.2.3 | Lesson 10 — Security & safety | `docs/part-3-hardening/10-security.md` |
| 4.2.4 | Lesson 11 — Observability & cost | `docs/part-3-hardening/11-observability.md` |
| 4.2.5 | Lesson 12 — Testing & evaluating agents | `docs/part-3-hardening/12-testing-evals.md` |
| 4.2.6 | Wire sidebar; `yarn docs:build` | `docs/.vitepress/config.ts` |

---

## Phase 5: Part IV — Architecture & Scale

### Session 5.1: Build-your-own code
**Tasks**:

| # | Task | File |
| - | ---- | ---- |
| 5.1.1 | Write `13-byo-solution.ts` (Trip Planner) | `src/agents/13-byo-solution.ts` |
| 5.1.2 | Write `13-byo-starter.ts` (TODO scaffold) | `src/agents/13-byo-starter.ts` |
| 5.1.3 | Structural test for BYO solution wiring | `src/agents/wiring.spec.test.ts` |
| 5.1.4 | Smoke-run solution; `yarn test` green | — |

### Session 5.2: Lessons 13–16
**Tasks**:

| # | Task | File |
| - | ---- | ---- |
| 5.2.1 | Lesson 13 — Multi-agent (+topology Mermaid) | `docs/part-4-architecture/13-multi-agent.md` |
| 5.2.2 | Lesson 14 — Capstone walkthrough | `docs/part-4-architecture/14-capstone.md` |
| 5.2.3 | Lesson 15 — Build your own agent | `docs/part-4-architecture/15-build-your-own.md` |
| 5.2.4 | Lesson 16 — Deploying & running in production | `docs/part-4-architecture/16-deployment.md` |
| 5.2.5 | Wire sidebar; `yarn docs:build` | `docs/.vitepress/config.ts` |

---

## Phase 6: Ship

### Session 6.1: Appendix, final verify & deploy
**Tasks**:

| # | Task | File |
| - | ---- | ---- |
| 6.1.1 | Appendix — SDK cheat-sheet (from `.clinerules/ai-sdk.md`) | `docs/appendix/sdk-cheatsheet.md` |
| 6.1.2 | Appendix — glossary | `docs/appendix/glossary.md` |
| 6.1.3 | Final `yarn test` + `yarn docs:build`; fix any broken imports/links | — |
| 6.1.4 | Push `main`; confirm Actions deploy; verify live URL | — |
| 6.1.5 | Post-completion: re-run `analyze_project` to refresh `project.md` | `.clinerules/project.md` |

---

## 🚨 Master Progress Checklist (All Phases) — MANDATORY

> **⚠️ EXECUTION RULE — APPLIES TO EVERY AGENT EXECUTING THIS PLAN:**
>
> 1. After completing each task: mark it `[x]` with a timestamp.
> 2. After each phase: confirm all its tasks are marked.
> 3. Update the Progress header after every update.
> 4. If this checklist is missing/incomplete, reconstruct it before executing tasks.
> 5. Never batch updates — update immediately after each task.

### Phase 0: Foundation
- [x] 0.1.1 Generate `.clinerules/project.md`
- [x] 0.1.2 VitePress + Mermaid deps + `docs:*` scripts
- [x] 0.1.3 Vitest deps + `test*` scripts
- [x] 0.1.4 Update `.gitignore`
- [x] 0.2.1 VitePress `config.ts`
- [x] 0.2.2 Theme entry + `.nojekyll`
- [x] 0.2.3 Landing page
- [x] 0.2.4 getting-started + prerequisites
- [x] 0.2.5 Verify `docs:build`
- [x] 0.3.1 Git remote + rename to `main`
- [x] 0.3.2 Deploy workflow
- [x] 0.3.3 `DEPLOYMENT.md`


### Phase 1: Testing infra
- [x] 1.1.1 `vitest.config.ts` ✅ (completed: 2026-06-07)
- [x] 1.1.2 Export `safeEvaluate` + spec tests (ST-1…10) ✅ (completed: 2026-06-07)
- [x] 1.1.3 Extract `rankBySimilarity` + spec tests (ST-11…15) ✅ (completed: 2026-06-07)
- [x] 1.1.4 `evals.spec.test.ts` (ST-16…20) ✅ (completed: 2026-06-07)
- [x] 1.1.5 Verify red phase ✅ (completed: 2026-06-07)
- [x] 1.2.1 Implement `scoreAnswer` ✅ (completed: 2026-06-07)
- [x] 1.2.2 Mock model + wiring spec tests (ST-21…22) ✅ (completed: 2026-06-07)
- [x] 1.2.3 Impl tests ✅ (completed: 2026-06-07)
- [x] 1.2.4 `yarn test` green ✅ (completed: 2026-06-07 — 44 tests pass; docs:build OK)

### Phase 2: Part I
- [x] 2.1.1 Region markers ✅ (completed: 2026-06-07 20:22)
- [x] 2.1.2 Lesson 1 ✅ (completed: 2026-06-07 20:26)
- [x] 2.1.3 Lesson 2 ✅ (completed: 2026-06-07 20:26)
- [x] 2.1.4 Lesson 3 ✅ (completed: 2026-06-07 20:26)
- [x] 2.1.5 Sidebar + build ✅ (completed: 2026-06-07 20:26 — docs:build OK, 44 tests green)


### Phase 3: Part II
- [ ] 3.1.1 Lesson 4
- [ ] 3.1.2 Lesson 5
- [ ] 3.1.3 Lesson 6
- [ ] 3.1.4 Lesson 7
- [ ] 3.1.5 Sidebar + build

### Phase 4: Part III
- [ ] 4.1.1 `11-security.ts`
- [ ] 4.1.2 Wire menu + smoke
- [ ] 4.1.3 Structural tests for security
- [ ] 4.2.1 Lesson 8
- [ ] 4.2.2 Lesson 9
- [ ] 4.2.3 Lesson 10
- [ ] 4.2.4 Lesson 11
- [ ] 4.2.5 Lesson 12
- [ ] 4.2.6 Sidebar + build

### Phase 5: Part IV
- [ ] 5.1.1 `13-byo-solution.ts`
- [ ] 5.1.2 `13-byo-starter.ts`
- [ ] 5.1.3 BYO structural test
- [ ] 5.1.4 Smoke + `yarn test`
- [ ] 5.2.1 Lesson 13
- [ ] 5.2.2 Lesson 14
- [ ] 5.2.3 Lesson 15
- [ ] 5.2.4 Lesson 16
- [ ] 5.2.5 Sidebar + build

### Phase 6: Ship
- [ ] 6.1.1 SDK cheat-sheet
- [ ] 6.1.2 Glossary
- [ ] 6.1.3 Final test + build
- [ ] 6.1.4 Deploy + verify live
- [ ] 6.1.5 Refresh `project.md`

---

## Session Protocol

### Starting a Session
Reference this plan: "Implement Phase X, Session X.X per `plans/agent-masterclass-docs/99-execution-plan.md`".

### Ending a Session
1. Run `yarn test` and `yarn docs:build` (verify).
2. Handle commit per active commit mode.
3. `/compact`.

---

## Dependencies

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
```

---

## Success Criteria

**Feature is complete when:**

1. ✅ All phases completed
2. ✅ `yarn test` and `yarn docs:build` passing
3. ✅ No warnings/errors; no broken snippet imports
4. ✅ No dead code (per `code.md` rule 4)
5. ✅ Security lesson + no-`eval`/sandboxing demonstrated; no secrets committed (per `code.md` rules 32-34)
6. ✅ Site deployed to Pages; live URL verified
7. ✅ Docs (README/landing) consistent
8. ✅ **Post-completion:** re-analyze project and update `.clinerules/project.md`
