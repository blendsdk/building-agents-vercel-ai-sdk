# VitePress Setup: Agent Masterclass Docs

> **Document**: 03-vitepress-setup.md
> **Parent**: [Index](00-index.md)

## Overview

Defines the VitePress site: directory layout, configuration (base path, Mermaid, Shiki), the custom landing page, navigation/sidebar, and the mechanism for importing code from real `src/` files so docs never drift. *(AR #7–#11, #20)*

## Architecture

### Directory layout

```
docs/
  .vitepress/
    config.ts            # VitePress + Mermaid + Shiki + nav/sidebar
    theme/
      index.ts           # extends default theme (optional light customization)
  public/
    .nojekyll            # ensure GitHub Pages serves _-prefixed assets
  index.md               # landing page (layout: home)
  guide/
    getting-started.md
    prerequisites.md
  part-1-foundations/
    ...
  part-2-core/
    ...
  part-3-hardening/
    ...
  part-4-architecture/
    ...
  appendix/
    sdk-cheatsheet.md
    glossary.md
  DEPLOYMENT.md          # one-time GitHub Pages UI checklist (AR #15)
```

### Proposed config (`docs/.vitepress/config.ts`)

```ts
import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    title: "Building AI Agents with the Vercel AI SDK",
    description:
      "A hands-on masterclass: build production-grade AI agents in TypeScript.",
    base: "/building-agents-vercel-ai-sdk/", // AR #14, #22
    lastUpdated: true,
    markdown: {
      theme: { light: "github-light", dark: "github-dark" }, // Shiki dual theme (AR #10)
      lineNumbers: true,
    },
    themeConfig: {
      nav: [
        { text: "Home", link: "/" },
        { text: "Start the Course", link: "/guide/getting-started" },
        { text: "GitHub", link: "https://github.com/blendsdk/building-agents-vercel-ai-sdk" },
      ],
      sidebar: [
        { text: "Getting Started", items: [/* getting-started, prerequisites */] },
        { text: "Part I — Foundations", items: [/* ... */] },
        { text: "Part II — Core Capabilities", items: [/* ... */] },
        { text: "Part III — Production Hardening", items: [/* ... */] },
        { text: "Part IV — Architecture & Scale", items: [/* ... */] },
        { text: "Appendix", items: [/* cheat-sheet, glossary */] },
      ],
      socialLinks: [
        { icon: "github", link: "https://github.com/blendsdk/building-agents-vercel-ai-sdk" },
      ],
      search: { provider: "local" },
    },
  }),
);
```

## Implementation Details

### Mermaid (AR #9)
- Add dev deps: `vitepress-plugin-mermaid`, `mermaid`.
- Wrap config with `withMermaid(...)`.
- Usage in pages: fenced ```` ```mermaid ```` blocks (agent loop, RAG flow, multi-agent topology).

### Shiki highlighting (AR #10)
- Built into VitePress; configure dual theme via `markdown.theme`.
- Use line-highlight syntax (`{1,3-5}`) and filename via code-group / `// [!code]` markers where helpful.

### Code imports from `src/` (AR #11)
VitePress supports importing code via:
```md
<<< @/../src/tools.ts{ts}
```
or region snippets:
```md
<<< @/../src/agents/01-oneshot.ts#loop{ts}
```
- Add `// #region loop` / `// #endregion loop` markers in `src/` where a lesson needs a focused slice.
- Region markers are comments — they do **not** change runtime behavior.
- A failing/missing region must break the build (default VitePress behavior surfaces broken includes).

> **PF-012 — verify the `@/../src` alias during Phase 0.2.** The `<<<` snippet path above assumes
> VitePress resolves `@` to the `docs/` source root, so `@/../src/...` reaches the repo's `src/`.
> Confirm this against the **installed** VitePress version when scaffolding (task 0.2.1/0.2.5): author
> one real import and run `yarn docs:build`. A wrong alias fails the build loudly. If `@` does not
> resolve as expected, set an explicit `srcDir`/alias in `config.ts` or use a relative `<<< ../src/...`
> path instead.

### Landing page (`docs/index.md`, AR #8, #20)

```md
---
layout: home
hero:
  name: Building AI Agents
  text: with the Vercel AI SDK
  tagline: From the agent loop to a production-grade, multi-agent system — in TypeScript.
  actions:
    - theme: brand
      text: Start the Course →
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/blendsdk/building-agents-vercel-ai-sdk
features:
  - icon: 🔁
    title: The Agent Loop
    details: Understand what turns an LLM call into an autonomous, tool-using agent.
  - icon: 🛠
    title: Tools & Structured Output
    details: Give agents real capabilities and typed, validated results with Zod.
  - icon: 📚
    title: RAG
    details: Ground answers in your own documents with embeddings + retrieval.
  - icon: 🛡
    title: Production Hardening
    details: Robust errors, human approval gates, security, observability & cost.
  - icon: 🤝
    title: Multi-Agent
    details: Orchestrate specialist agents behind a supervisor.
  - icon: 🚀
    title: Ship It
    details: Test, deploy, and run agents with confidence.
---
```
- Below the hero/features, include a Markdown section: "What you'll build", a 4-part curriculum overview with links, "Who this is for" + prerequisites, and an **agent-loop Mermaid teaser**.

### `.nojekyll` + base path
- `docs/public/.nojekyll` ensures GitHub Pages does not strip `_`-prefixed VitePress asset folders.
- `base` must match the repo name exactly.

## Integration Points
- `package.json` scripts: `docs:dev`, `docs:build`, `docs:preview`.
- Deploy workflow (doc 06) runs `docs:build` and uploads `docs/.vitepress/dist`.

## Error Handling

| Error Case | Handling Strategy | AR Ref |
| ---------- | ----------------- | ------ |
| Broken code import path/region | Build fails loudly; fix path/region marker | AR #11 |
| Wrong base path on Pages | Verify built asset URLs include `/building-agents-vercel-ai-sdk/` | AR #14 |
| Mermaid not rendering | Confirm `withMermaid` wrap + dev deps installed | AR #9 |

## Testing Requirements
- `docs:build` must succeed in CI (covered by deploy workflow + a build check).
- A link/snippet sanity pass: build fails on missing includes (no separate unit test needed for static site).
