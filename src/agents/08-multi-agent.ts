/**
 * agents/08-multi-agent.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL 8: Multi-agent orchestration (the capstone)
 *
 * So far each agent has been a lone worker. Real systems often use a TEAM:
 * a "supervisor" agent that delegates subtasks to SPECIALIST agents, then
 * combines their results. This composes everything you've learned.
 *
 * The key trick: **wrap each specialist agent as a TOOL.** The supervisor
 * doesn't know or care that a "tool" is itself a whole agent — it just calls
 * it with a sub-question and gets an answer back. Agents all the way down. 🐢
 *
 *   supervisor (a ToolLoopAgent)
 *     ├─ tool: askResearcher  → runs the RESEARCH agent (knowledge base)
 *     └─ tool: askMathematician → runs the MATH agent (calculator)
 *
 * Each specialist is a focused ToolLoopAgent (Tutorial 4) with its own
 * instructions + tools. The supervisor routes work to whichever fits.
 *
 * Run it with `yarn dev 8`.
 * ----------------------------------------------------------------------------
 */

import { ToolLoopAgent, stepCountIs, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { calculator } from "../tools.js";

const model = openai("gpt-4o-mini");

// ── Specialist #1: the Research agent ──────────────────────────────────────
// A focused agent with a tiny knowledge-base search tool (echoing Tutorial 5,
// kept inline + simple here so the focus stays on orchestration).
const KNOWLEDGE = [
  "The company retreat is scheduled for the week of June 16th in the Ardennes.",
  "There are 24 employees attending the retreat.",
  "The retreat budget is €480 per person, all-inclusive.",
];

const searchKnowledge = tool({
  description: "Search the internal company knowledge base.",
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    // Naive keyword match is plenty for the demo.
    const q = query.toLowerCase();
    const hits = KNOWLEDGE.filter((d) =>
      q.split(/\s+/).some((w) => w.length > 3 && d.toLowerCase().includes(w)),
    );
    return { results: hits.length ? hits : KNOWLEDGE };
  },
});

const researchAgent = new ToolLoopAgent({
  model,
  instructions:
    "You are a research specialist. Use searchKnowledge to find facts, then " +
    "answer briefly with only the relevant facts.",
  tools: { searchKnowledge },
  stopWhen: stepCountIs(5),
});

// ── Specialist #2: the Math agent ──────────────────────────────────────────
const mathAgent = new ToolLoopAgent({
  model,
  instructions:
    "You are a math specialist. Use the calculator tool for any arithmetic " +
    "and report just the number with a short explanation.",
  tools: { calculator },
  stopWhen: stepCountIs(5),
});

// ── Wrap each specialist as a TOOL the supervisor can call ──────────────────
const askResearcher = tool({
  description:
    "Delegate a factual/lookup question to the research specialist agent.",
  inputSchema: z.object({
    question: z.string().describe("A self-contained question to research"),
  }),
  execute: async ({ question }) => {
    const { text } = await researchAgent.generate({ prompt: question });
    return { answer: text };
  },
});

const askMathematician = tool({
  description:
    "Delegate a calculation to the math specialist agent. Give it the numbers.",
  inputSchema: z.object({
    question: z.string().describe("A self-contained math question"),
  }),
  execute: async ({ question }) => {
    const { text } = await mathAgent.generate({ prompt: question });
    return { answer: text };
  },
});

// ── The Supervisor: routes work to specialists and combines results ─────────
const supervisor = new ToolLoopAgent({
  model,
  instructions:
    "You are a project coordinator. Break the user's request into sub-tasks " +
    "and delegate: use askResearcher for facts/lookups and askMathematician " +
    "for calculations. Never compute or recall facts yourself — always " +
    "delegate, then combine the specialists' answers into one clear reply.",
  tools: { askResearcher, askMathematician },
  stopWhen: stepCountIs(10),
});

export async function runMultiAgent() {
  console.log("\n🤖 TUTORIAL 8 — Multi-agent orchestration\n");
  console.log(
    "A supervisor agent will delegate to a research agent and a math agent, " +
      "then combine their answers.\n",
  );

  // This question needs BOTH a lookup (attendees + per-person budget) AND a
  // calculation (total cost) — so the supervisor must use both specialists.
  const request =
    "What is the total cost of the company retreat? I need the number of " +
    "attendees and the per-person budget, then the total.";

  console.log(`🧑 ${request}\n`);

  const result = await supervisor.generate({ prompt: request });

  // Show the delegation that happened (the supervisor's tool calls).
  console.log("🔎 Delegations made by the supervisor:");
  for (const step of result.steps) {
    for (const call of step.toolCalls) {
      const input = call.input as { question?: string };
      console.log(`   → ${call.toolName}("${input.question ?? ""}")`);
    }
  }

  console.log(`\n🤖 Supervisor's final answer:\n${result.text}\n`);

  console.log(
    "✅ Tutorial 8 complete. The supervisor composed two specialist agents " +
      "(each wrapped as a tool) to solve a task neither could do alone.\n",
  );
}
