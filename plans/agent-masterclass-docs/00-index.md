# Agent Masterclass Docs Implementation Plan

> **Feature**: A VitePress-published masterclass that teaches developers how to build AI agents with the Vercel AI SDK, deployed to GitHub Pages.
> **Status**: Planning Complete
> **Created**: 2026-06-07
> **CodeOps Version**: codeops-mcp 1.13.0

## Overview

This project transforms the existing 10 runnable Vercel AI SDK tutorials (`src/agents/01..10`) into a polished, production-grade **masterclass** — covering both the *theory* of agents (mental models, tradeoffs, security, evaluation) and the *technical craft* (tools, structured output, RAG, multi-agent orchestration, deployment).

The course is published as a **VitePress** documentation site and deployed to **GitHub Pages** at `https://blendsdk.github.io/building-agents-vercel-ai-sdk/`. Lesson code blocks are imported from the real `src/` source files so the documentation can never drift from tested, runnable code. New topics (security, testing/evals, build-your-own capstone) add new runnable + tested code.

By the end of the course a reader with light LLM exposure should be able to design and build their own agent from scratch.

## Document Index

| #   | Document                                                   | Description                                  |
| --- | ---------------------------------------------------------- | -------------------------------------------- |
| AR  | [Ambiguity Register](00-ambiguity-register.md)             | Zero-Ambiguity Gate decisions (audit trail)  |
| 00  | [Index](00-index.md)                                       | This document — overview and navigation      |
| 01  | [Requirements](01-requirements.md)                         | Feature requirements and scope               |
| 02  | [Current State](02-current-state.md)                       | Analysis of current implementation           |
| 03  | [VitePress Setup](03-vitepress-setup.md)                   | Site structure, config, Mermaid, Shiki, imports |
| 04  | [Curriculum Content](04-curriculum-content.md)             | 4-part lesson outline + page template        |
| 05  | [Testing Infrastructure](05-testing-infra.md)              | Vitest setup, mocked-model strategy          |
| 06  | [Deployment & Pages](06-deployment-pages.md)               | Git remote, branch, Actions, Pages, landing  |
| 07  | [Testing Strategy](07-testing-strategy.md)                 | Spec-first ST-cases and verification         |
| 99  | [Execution Plan](99-execution-plan.md)                     | Phases, sessions, and task checklist         |

## Quick Reference

### Live URL

`https://blendsdk.github.io/building-agents-vercel-ai-sdk/`

### Repo

`git@github.com:blendsdk/building-agents-vercel-ai-sdk.git` (default branch `main`)

### Key Decisions

| Decision | Outcome | AR Ref |
| -------- | ------- | ------ |
| Curriculum breadth | Full masterclass (10 lessons + new theory/security/testing/deploy) | AR #2 |
| Structure | 4 parts | AR #4 |
| Docs site | VitePress in `docs/`, default theme + custom landing | AR #7, #8 |
| Diagrams | Mermaid via `vitepress-plugin-mermaid` | AR #9 |
| Highlighting | Built-in Shiki, dual theme | AR #10 |
| Code in docs | Imported from real `src/` files | AR #11 |
| Test runner | Vitest, no live network in CI | AR #12, #13 |
| Deploy | GitHub Actions → Pages on `main` | AR #15, #19 |

## Related Files

**New (created by this plan):**
- `docs/` (VitePress site: config, landing page, lesson pages)
- `.github/workflows/deploy.yml`
- `vitest.config.ts`, `*.spec.test.ts`, `*.impl.test.ts`
- `.clinerules/project.md`
- New runnable lesson code in `src/` (security, testing, build-your-own)

**Modified:**
- `package.json` (Vitest + VitePress deps and scripts)
- `.gitignore` (VitePress cache/dist, coverage)
