# Requirements: Agent Masterclass Docs

> **Document**: 01-requirements.md
> **Parent**: [Index](00-index.md)

## Feature Overview

Build a complete, production-grade **masterclass** that teaches developers how to build AI agents with the Vercel AI SDK. The course is authored in Markdown, rendered by **VitePress**, and published to **GitHub Pages**. It is structured in four parts that progress from the core agent loop to a build-your-own capstone, combining agent *theory* with hands-on, *tested* code.

## Functional Requirements

### Must Have

- [ ] A VitePress site under `docs/` with a custom, inviting landing page (`layout: home`). *(AR #7, #8, #20)*
- [ ] Four-part curriculum (Foundations → Core Capabilities → Production Hardening → Architecture & Scale) covering all 10 existing lessons plus new theory/security/testing/deployment lessons. *(AR #2, #4)*
- [ ] Every lesson page follows a consistent template: Concept → Mental model/diagram → Problem → Annotated code walkthrough → Run it → Production caveats → Exercises (2–3, collapsible solutions) → Key takeaways. *(AR #6, #16)*
- [ ] Lesson code blocks imported from the real `src/` files (snippet/region imports) so docs never drift. *(AR #11)*
- [ ] Mermaid diagrams for the agent loop, RAG flow, and multi-agent topology. *(AR #9)*
- [ ] Shiki syntax highlighting with a dual light/dark theme, line highlighting, and filename labels. *(AR #10)*
- [ ] New runnable + tested code for new topics (security, testing/evals, build-your-own agent). *(AR #3)*
- [ ] A guided "build-your-own agent" capstone lesson (new domain, starter + solution). *(AR #5)*
- [ ] Vitest test suite covering deterministic logic and agent wiring (mocked model). *(AR #12, #13)*
- [ ] GitHub Actions workflow that builds the site and deploys to Pages on push to `main`. *(AR #15, #19)*
- [ ] Git remote configured to `git@github.com:blendsdk/building-agents-vercel-ai-sdk.git`; default branch renamed to `main`. *(AR #19, #21)*
- [ ] A `docs/DEPLOYMENT.md` checklist describing the one-time GitHub Pages UI configuration. *(AR #15)*
- [ ] `.clinerules/project.md` generated as the first task. *(AR #18)*

### Should Have

- [ ] A landing-page Mermaid teaser of the agent loop. *(AR #20)*
- [ ] A glossary / SDK API cheat-sheet appendix derived from `.clinerules/ai-sdk.md`.
- [ ] "Who this is for" + prerequisites section on the landing page. *(AR #1)*

### Won't Have (Out of Scope)

- Live OpenAI/network calls in CI tests. *(AR #13)*
- A custom VitePress theme requiring bespoke CSS maintenance (default theme + light customization only). *(AR #8)*
- Video content, paid LMS integration, or authentication.
- Provider abstractions beyond what the existing lessons already demonstrate (no new multi-provider lesson unless covered by existing content).

## Technical Requirements

### Performance

- VitePress production build completes without errors and within normal CI time budgets.
- Test suite runs deterministically and quickly (no network).

### Compatibility

- TypeScript ESM (`nodenext`), Node via `tsx`, package manager **yarn** 1.22.22.
- VitePress base path `/building-agents-vercel-ai-sdk/` for project Pages. *(AR #14, #22)*
- Existing lesson runtime behavior (`yarn dev <n>`) must remain unbroken.

### Security

- No secrets committed; `.env` remains gitignored. The course teaches prompt-injection defense and tool sandboxing as a dedicated lesson.
- Deploy workflow uses official Pages actions with scoped permissions (`pages: write`, `id-token: write`).

## Scope Decisions

| Decision | Options Considered | Chosen | Rationale | AR Ref |
| -------- | ------------------ | ------ | --------- | ------ |
| Curriculum breadth | existing 10 / full masterclass / in-between | Full masterclass | Reader must be able to build solo | AR #2 |
| New topics code | runnable+tested / prose only | Runnable + tested | Consistency, real value | AR #3 |
| Code in docs | imported from src / hand-copied | Imported from src | Prevent drift | AR #11 |
| Test runner | Vitest / Jest / node:test | Vitest | ESM+TS native, fast | AR #12 |
| Default branch | main / master | main | Modern default | AR #19 |

## Acceptance Criteria

1. [ ] VitePress site builds cleanly with all lesson pages and the landing page.
2. [ ] All code snippets in docs resolve from real `src/` files (no broken imports).
3. [ ] Mermaid diagrams render; Shiki dual-theme highlighting works.
4. [ ] `yarn test` passes; deterministic logic + mocked-model wiring covered; no network in CI.
5. [ ] GitHub Actions workflow deploys to Pages on push to `main`.
6. [ ] Git remote + `main` branch configured; `docs/DEPLOYMENT.md` present.
7. [ ] `.clinerules/project.md` reflects the updated toolchain.
8. [ ] A reader can follow the build-your-own capstone to produce a working agent.
