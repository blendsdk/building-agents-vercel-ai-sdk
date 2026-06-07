/**
 * agents/10-capstone.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL 10: Capstone — a realistic support agent that combines everything
 *
 * This ties together the whole course into one cohesive agent:
 *
 *   • RAG (Tutorial 5)            → a `searchKnowledge` tool backed by embeddings
 *                                   so the agent answers from a knowledge base.
 *   • Robust errors (Tutorial 6)  → tools return structured errors, never throw.
 *   • Human-in-the-loop (T7)      → `escalateToHuman` pauses for your approval.
 *   • Structured output (T3)      → the final answer is validated JSON (a "ticket").
 *   • Reusable Agent (T4)         → built as a single ToolLoopAgent.
 *   • Observability (T9)          → prints token usage + a step trace at the end.
 *
 * Scenario: a customer-support assistant for "Acme Corp". It looks up answers,
 * and if it can't resolve something (or the customer is upset), it escalates —
 * which requires a human to approve.
 *
 * Run it with `yarn dev 10`.
 * ----------------------------------------------------------------------------
 */

import {
  ToolLoopAgent,
  stepCountIs,
  tool,
  Output,
  embed,
  embedMany,
  cosineSimilarity,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// ── Knowledge base (RAG) ────────────────────────────────────────────────────
const KNOWLEDGE_BASE = [
  "Acme Corp's Zephyr 3000 has a 90-minute battery life and recharges in 45 minutes.",
  "Acme Corp offers a 2-year warranty on all Zephyr products, extendable to 4 years for $49.",
  "Returns are accepted within 30 days of purchase if the device is in original packaging.",
  "The Zephyr 3000 works on windows up to 3 meters high and glass 5mm–30mm thick.",
  "Customer support is available 24/7 via chat; phone support is 9am–6pm CET.",
];

const embeddingModel = openai.embedding("text-embedding-3-small");
type StoredDoc = { text: string; embedding: number[] };

async function buildStore(): Promise<StoredDoc[]> {
  const { embeddings } = await embedMany({ model: embeddingModel, values: KNOWLEDGE_BASE });
  return KNOWLEDGE_BASE.map((text, i) => ({ text, embedding: embeddings[i]! }));
}

async function retrieve(store: StoredDoc[], query: string, k = 3) {
  const { embedding: q } = await embed({ model: embeddingModel, value: query });
  return store
    .map((d) => ({ text: d.text, score: cosineSimilarity(q, d.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

// ── Human approval helper (Tutorial 7) ──────────────────────────────────────
async function askApproval(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input, output });
  try {
    const a = (await rl.question(`\n⚠️  ${question} [y/N]: `)).trim().toLowerCase();
    return a === "y" || a === "yes";
  } catch {
    return false; // fail safe
  } finally {
    rl.close();
  }
}

// The final structured "ticket" the agent must produce (Tutorial 3).
const ticketSchema = z.object({
  customerQuestion: z.string(),
  resolved: z.boolean().describe("Whether the agent answered from the knowledge base"),
  answer: z.string().describe("The answer given to the customer"),
  escalated: z.boolean().describe("Whether the issue was escalated to a human"),
  category: z.enum(["product", "warranty", "returns", "support", "other"]),
});

export async function runCapstoneAgent() {
  console.log("\n🤖 TUTORIAL 10 — Capstone support agent (everything combined)\n");

  const store = await buildStore();
  console.log(`📚 Knowledge base ready (${store.length} docs embedded).\n`);

  // RAG tool — returns structured errors instead of throwing (Tutorial 6).
  const searchKnowledge = tool({
    description: "Search Acme Corp's knowledge base. Always use before answering.",
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }) => {
      try {
        const results = await retrieve(store, query);
        return { ok: true, results };
      } catch (e) {
        return { ok: false, error: "SEARCH_FAILED", message: String(e) };
      }
    },
  });

  // Sensitive tool — escalation requires human approval (Tutorial 7).
  // #region escalate
  const escalateToHuman = tool({

    description:
      "Escalate the issue to a human support agent. Use only when you cannot " +
      "resolve it from the knowledge base, or the customer explicitly asks.",
    inputSchema: z.object({
      reason: z.string().describe("Why escalation is needed"),
      summary: z.string().describe("Short summary of the customer's issue"),
    }),
    execute: async ({ reason, summary }) => {
      console.log("\n┌─ 🚨 The agent wants to ESCALATE to a human ───────");
      console.log(`│ Reason:  ${reason}`);
      console.log(`│ Summary: ${summary}`);
      console.log("└──────────────────────────────────────────────────");
      const approved = await askApproval("Approve escalation to a human agent?");
      return approved
        ? { ok: true, status: "ESCALATED", ticketId: "SUP-" + Math.floor(Math.random() * 9000 + 1000) }
        : { ok: false, status: "ESCALATION_DENIED", message: "A human declined escalation; try to resolve it yourself." };
    },
  });
  // #endregion escalate

  // The capstone agent (Tutorial 4) with structured output (Tutorial 3).
  // #region agent
  const supportAgent = new ToolLoopAgent({
    model: openai("gpt-4o-mini"),
    instructions:
      "You are Acme Corp's support assistant. ALWAYS search the knowledge base " +
      "before answering, and answer only from it. If the knowledge base doesn't " +
      "cover the question, escalate to a human. Be concise and friendly.",
    tools: { searchKnowledge, escalateToHuman },
    stopWhen: stepCountIs(8),
    output: Output.object({ schema: ticketSchema }),
  });
  // #endregion agent


  // Two scenarios: one answerable from the KB, one that needs escalation.
  const questions = [
    "How long is the warranty on the Zephyr 3000?",
    "My Zephyr 3000 caught fire and injured my cat — I want compensation!",
  ];

  for (const question of questions) {
    console.log(`\n🧑 Customer: ${question}`);
    const result = await supportAgent.generate({ prompt: question });

    // Structured result (Tutorial 3)
    console.log("\n🎫 Ticket (structured output):");
    console.log(JSON.stringify(result.output, null, 2));

    // Observability (Tutorial 9)
    const tools = result.steps.flatMap((s) => s.toolCalls.map((c) => c.toolName));
    console.log(
      `📊 ${result.steps.length} steps · tools used: [${tools.join(", ") || "none"}] · ` +
        `${result.usage.totalTokens ?? "?"} tokens`,
    );
  }

  console.log(
    "\n✅ Tutorial 10 complete. One agent combined RAG, structured output, " +
      "human approval, robust errors, and observability — a real-world template.\n",
  );
}
