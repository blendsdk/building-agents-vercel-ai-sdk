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
