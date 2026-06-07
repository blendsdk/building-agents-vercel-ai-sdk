# Ambiguity Register: Agent Masterclass Docs

> **Status**: ✅ GATE PASSED — all 22 items resolved
> **Last Updated**: 2026-06-07
> **Feature**: VitePress-published masterclass course teaching how to build AI agents with the Vercel AI SDK, deployed to GitHub Pages.

Every decision in the plan documents traces back to a row in this register.

| # | Category | Ambiguity / Gap | Options Presented | User Decision | Status |
|---|----------|-----------------|-------------------|---------------|--------|
| 1 | Scope/Audience | Reader profile | (a) new to LLMs / (b) knows LLM basics / (c) light LLM exposure + callout refreshers | (c) Mid-level TS dev, light LLM exposure; refreshers in callouts | ✅ Resolved |
| 2 | Scope | Curriculum breadth | (a) existing 10 only / (b) full masterclass + new theory/security/testing/deploy / (c) in-between | (b) Full masterclass | ✅ Resolved |
| 3 | Scope | New topics get code | (a) new runnable+tested code in `src/` / (b) prose + inline snippets only | (a) New runnable, tested code in `src/` | ✅ Resolved |
| 4 | Structure | Lesson grouping | (a) 4 parts / (b) flat 1–10+extras / (c) custom | (a) 4 parts: Foundations → Core → Hardening → Architecture & Scale | ✅ Resolved |
| 5 | Content | Build-your-own capstone | (a) yes, guided new-domain agent w/ starter+solution / (b) no | (a) Yes | ✅ Resolved |
| 6 | Content | Exercises per lesson | (a) 2–3 w/ collapsible solutions / (b) takeaways only | (a) 2–3 exercises with collapsible solutions | ✅ Resolved |
| 7 | Tooling | Site location | `docs/` at root; config in `docs/.vitepress/` | Confirmed | ✅ Resolved |
| 8 | UX | Theme | Default VitePress theme + custom landing page | Confirmed | ✅ Resolved |
| 9 | Tooling | Diagrams | `vitepress-plugin-mermaid` + `mermaid` | Confirmed | ✅ Resolved |
| 10 | UX | Syntax highlighting | Built-in Shiki, dual `github-light`/`github-dark`, line-highlight + filename tabs | Confirmed | ✅ Resolved |
| 11 | Quality | Code in docs | Imported from real `src/` files via snippet/region imports (no drift) | Confirmed | ✅ Resolved |
| 12 | Testing | Test runner | Add Vitest; replace placeholder `test` script | Confirmed | ✅ Resolved |
| 13 | Testing | Test scope | Spec-first unit tests for deterministic logic; structural tests w/ mocked model for agent wiring; no live OpenAI/network in CI | Confirmed | ✅ Resolved |
| 14 | Deployment | Repo name / base | `building-agents-vercel-ai-sdk` → base `/building-agents-vercel-ai-sdk/` (project Pages site) | Confirmed | ✅ Resolved |
| 15 | Deployment | CI/CD | GitHub Actions → build VitePress → deploy to Pages on push to default branch | Confirmed | ✅ Resolved |
| 16 | Content | Tone | Conversational/teaching, analogies + "why it matters" callouts | Confirmed | ✅ Resolved |
| 17 | Process | Build order | Part-by-part (each part = a plan phase) for early review | Confirmed | ✅ Resolved |
| 18 | Config | project.md | Generate `.clinerules/project.md` via `analyze_project` as first task | Confirmed | ✅ Resolved |
| 19 | Deployment | Default branch | (a) rename `master`→`main` / (b) keep `master` | (a) Rename to `main`; workflow triggers on `main` | ✅ Resolved |
| 20 | UX | Landing page | In scope: VitePress `layout: home` hero + feature cards + curriculum overview + agent-loop Mermaid teaser | Confirmed | ✅ Resolved |
| 21 | Deployment | Git remote | Add `origin = git@github.com:blendsdk/building-agents-vercel-ai-sdk.git` | Confirmed | ✅ Resolved |
| 22 | Deployment | Live URL/base | `blendsdk.github.io/building-agents-vercel-ai-sdk/`, base `/building-agents-vercel-ai-sdk/` | Confirmed | ✅ Resolved |

## Resolution Notes

- **AR-1..6** define the pedagogy: a true masterclass for a TS developer with only light LLM exposure, structured in 4 parts, with new runnable/tested code, a build-your-own capstone, and exercises.
- **AR-7..11** define the VitePress stack: `docs/` site, default theme + custom landing, Mermaid diagrams, Shiki highlighting, and **code imported from real `src/` files** so docs never drift.
- **AR-12..13** define testing: Vitest, spec-first for deterministic logic (calculator parser, RAG ranking), mocked-model structural tests for agent wiring, **no live network in CI**.
- **AR-14, 19, 21, 22** define deployment identity: org `blendsdk`, repo `building-agents-vercel-ai-sdk`, branch `main`, base `/building-agents-vercel-ai-sdk/`, URL `https://blendsdk.github.io/building-agents-vercel-ai-sdk/`.
- **AR-15** GitHub Actions deploy via official Pages actions (Source = "GitHub Actions").
- **AR-18** `.clinerules/project.md` generated first because the toolchain changes (Vitest, VitePress).
- **AR-20** Landing page is explicitly in scope with the described hero/feature-cards/curriculum/Mermaid layout.
