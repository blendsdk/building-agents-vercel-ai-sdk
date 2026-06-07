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
        {
          text: "GitHub",
          link: "https://github.com/blendsdk/building-agents-vercel-ai-sdk",
        },
      ],
      sidebar: [
        {
          text: "Getting Started",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Prerequisites", link: "/guide/prerequisites" },
          ],
        },
        {
          text: "Part I — Foundations",
          items: [
            {
              text: "1 · What is an agent?",
              link: "/part-1-foundations/01-what-is-an-agent",
            },
            {
              text: "2 · Your first agent loop",
              link: "/part-1-foundations/02-first-agent-loop",
            },
            {
              text: "3 · Anatomy of a tool",
              link: "/part-1-foundations/03-anatomy-of-a-tool",
            },
          ],
        },
        {
          text: "Part II — Core Capabilities",
          items: [
            {
              text: "4 · Streaming & memory",
              link: "/part-2-core/04-streaming-memory",
            },
            {
              text: "5 · Structured output",
              link: "/part-2-core/05-structured-output",
            },
            {
              text: "6 · The ToolLoopAgent",
              link: "/part-2-core/06-toolloop-agent",
            },
            {
              text: "7 · RAG — embeddings & retrieval",
              link: "/part-2-core/07-rag",
            },
          ],
        },
        {
          text: "Part III — Production Hardening",
          items: [
            {
              text: "8 · Robust agents",
              link: "/part-3-hardening/08-robust-agents",
            },
            {
              text: "9 · Human-in-the-loop",
              link: "/part-3-hardening/09-human-in-the-loop",
            },
            {
              text: "10 · Security & safety",
              link: "/part-3-hardening/10-security",
            },
            {
              text: "11 · Observability & cost",
              link: "/part-3-hardening/11-observability",
            },
            {
              text: "12 · Testing & evaluating",
              link: "/part-3-hardening/12-testing-evals",
            },
          ],
        },
        {
          text: "Part IV — Architecture & Scale",
          items: [
            {
              text: "13 · Multi-agent orchestration",
              link: "/part-4-architecture/13-multi-agent",
            },
            {
              text: "14 · Capstone walkthrough",
              link: "/part-4-architecture/14-capstone",
            },
            {
              text: "15 · Build your own agent",
              link: "/part-4-architecture/15-build-your-own",
            },
            {
              text: "16 · Deploying in production",
              link: "/part-4-architecture/16-deployment",
            },
          ],
        },
        {
          text: "Appendix",
          items: [
            {
              text: "SDK cheat-sheet",
              link: "/appendix/sdk-cheatsheet",
            },
            {
              text: "Glossary",
              link: "/appendix/glossary",
            },
          ],
        },
      ],





      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/blendsdk/building-agents-vercel-ai-sdk",
        },
      ],
      search: { provider: "local" },
    },
  }),
);
