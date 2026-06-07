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
