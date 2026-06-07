# Testing Strategy: Agent Masterclass Docs

> **Document**: 07-testing-strategy.md
> **Parent**: [Index](00-index.md)

## Testing Overview

### Coverage Goals
- Unit tests: high coverage of deterministic logic (calculator parser, RAG ranking, eval scorer).
- Structural tests: agent wiring with a mocked model (tools registered, structured errors, loop terminates).
- E2E: VitePress `docs:build` succeeds (static-site smoke).
- **No live network in CI.** *(AR #13)*

## 🚨 Specification Test Cases (MANDATORY — NON-NEGOTIABLE)

> Derived exclusively from requirements (`01-requirements.md`), component specs (`03`/`04`/`05`),
> the existing source behavior in `src/tools.ts` / `src/agents/05-rag.ts`, and the Ambiguity Register.
> **IMMUTABLE ORACLE RULE:** if implementation disagrees with a spec test, the implementation is wrong.

> **Note (PF-010) — characterization vs. spec-first.** ST-1…15 are **characterization tests**: they
> codify the behavior of code that already exists (`safeEvaluate`, `cosineSimilarity` ranking), so they
> pass immediately and act as a regression guard during the export/extract refactors. Only ST-16…20
> (the new `scoreAnswer` eval scorer) are **true spec-first** cases written before their implementation
> and verified to fail first (red phase). This distinction is intentional, not a contradiction.

### Component 1 — Calculator parser (`safeEvaluate`, `src/tools.ts`)

The expected behavior is fully determined by the existing recursive-descent grammar
(`expr := term (('+'|'-') term)*`, `term := factor (('*'|'/') factor)*`, `factor := number | '(' expr ')'`).

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-1 | `"23 * 19"` | `437` | `src/tools.ts` grammar |
| ST-2 | `"2 + 3 * 4"` | `14` (precedence: `*` before `+`) | `src/tools.ts` grammar |
| ST-3 | `"(2 + 3) * 4"` | `20` (parentheses override) | `src/tools.ts` grammar |
| ST-4 | `"10 / 4"` | `2.5` (decimal division) | `src/tools.ts` grammar |
| ST-5 | `"  7  -  2  "` | `5` (whitespace tolerated) | `src/tools.ts` `skipSpaces` |
| ST-6 | `"2 ^ 3"` | throws Error (invalid character `^`) | `src/tools.ts` char guard |
| ST-7 | `"(2 + 3"` | throws Error ("Missing closing parenthesis.") | `src/tools.ts` `parseFactor` |
| ST-8 | `"2 +"` | throws Error ("Expected a number.") | `src/tools.ts` `parseFactor` |
| ST-9 | `"2 2"` | throws Error ("Unexpected trailing characters.") | `src/tools.ts` `parseExpr` tail check |
| ST-10 | `"1.5 + 2.5"` | `4` | `src/tools.ts` number parsing |

### Component 2 — RAG ranking (`rankBySimilarity`, extracted from `src/agents/05-rag.ts`)

A pure helper `rankBySimilarity(queryVec, docs, k)` ranks docs by `cosineSimilarity` descending and returns top-`k`.
Using simple orthogonal/aligned vectors makes expectations exact.

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-11 | query `[1,0]`; docs A`[1,0]`, B`[0,1]`, C`[-1,0]` ; k=3 | order `[A, B, C]` (scores 1, 0, -1) | `05-rag.ts` retrieve() |
| ST-12 | query `[1,0]`; docs as ST-11 ; k=2 | returns 2 items `[A, B]` | `05-rag.ts` slice(0,k) |
| ST-13 | query `[1,1]`; docs A`[1,0]`, B`[1,1]` ; k=2 | order `[B, A]` (B more aligned) | cosine similarity |
| ST-14 | scores tie (two identical vectors) | both returned; stable, no crash | sort stability |
| ST-15 | empty docs list | returns `[]` | defensive behavior |

### Component 3 — Eval scorer (`scoreAnswer`, new `src/agents/12-evals.ts`)

A deterministic scorer (spec defined here BEFORE implementation): `scoreAnswer(output, criteria)` returns
`{ score, passed }` where `score` = fraction of `criteria.mustInclude` substrings present (case-insensitive),
and `passed` = `score === 1 && none of criteria.mustNotInclude present`.

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-16 | output `"Warranty is 2 years"`, mustInclude `["2 years"]` | `{ score: 1, passed: true }` | This doc (spec) |
| ST-17 | output `"no idea"`, mustInclude `["2 years","warranty"]` | `{ score: 0, passed: false }` | This doc (spec) |
| ST-18 | output `"warranty info"`, mustInclude `["warranty","2 years"]` | `{ score: 0.5, passed: false }` | This doc (spec) |
| ST-19 | output `"2 years but call now"`, mustInclude `["2 years"]`, mustNotInclude `["call now"]` | `{ score: 1, passed: false }` (banned phrase present) | This doc (spec) |
| ST-20 | case-insensitive: output `"TWO YEARS"`, mustInclude `["two years"]` | `{ score: 1, passed: true }` | This doc (spec) |

### Component 4 — Agent wiring (mocked model)

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-21 | Run an agent with a mock model that emits one tool call then a final answer | tool's `execute` invoked once; final text returned; loop ends | `01-requirements.md`, AR #13 |
| ST-22 | Structured-error tool invoked with failing condition | returns `{ ok: false, ... }`; does NOT throw | AR #13, `06-robust.ts` pattern |

> **AUTHORING RULE:** ST-16..20 define NEW behavior — implementation MUST match these, not vice versa.

## Test Categories

### Specification Tests (from ST-cases above)
| Test File | ST Cases Covered | Component |
| --------- | ---------------- | --------- |
| `src/tools.spec.test.ts` | ST-1 … ST-10 | Calculator parser |
| `src/agents/rag-ranking.spec.test.ts` | ST-11 … ST-15 | RAG ranking |
| `src/agents/evals.spec.test.ts` | ST-16 … ST-20 | Eval scorer (new) |
| `src/agents/wiring.spec.test.ts` | ST-21 … ST-22 | Agent wiring (mock model) |

### Implementation Tests (edge cases, internals)
| Test File | Description | Priority |
| --------- | ----------- | -------- |
| `src/tools.impl.test.ts` | Deep nesting, negative results, large numbers | Med |
| `src/agents/evals.impl.test.ts` | Empty criteria, duplicate substrings | Low |

### Integration Tests
| Test | Components | Description |
| ---- | ---------- | ----------- |
| docs build | VitePress | `yarn docs:build` resolves all `<<<` imports + renders Mermaid |

### End-to-End Tests
| Scenario | Steps | Expected Result |
| -------- | ----- | --------------- |
| Site builds | `yarn docs:build` | Exit 0; `dist/` produced |

## Test Data
### Fixtures Needed
- Fixed embedding vectors for RAG ranking (defined inline in tests).
- A mock language model emitting scripted tool-calls/answers.

### Mock Requirements
- Mock language model (SDK `ai/test` export if available, else minimal fake). Verify via grep before authoring.

## Verification Checklist
- [ ] All ST-cases defined with concrete input/output pairs
- [ ] Every ST case traces to a source
- [ ] Spec tests written BEFORE implementation (for new code: evals)
- [ ] Spec tests verified to FAIL before implementation (red phase) for new code
- [ ] All spec tests pass after implementation (green phase)
- [ ] Implementation tests written for edge cases
- [ ] `yarn test` passes; no network
- [ ] `yarn docs:build` passes
- [ ] No regressions in existing behavior (`yarn dev <n>` still runs)
