/**
 * index.ts — entry point
 * ----------------------------------------------------------------------------
 * This is a tiny launcher that lets you pick which tutorial agent to run.
 *
 *   Tutorial 1 (one-shot):     learn the core agent loop + tool calling.
 *   Tutorial 2 (interactive):  learn streaming + conversation memory.
 *   Tutorial 3 (JSON):         learn structured output (generateText + Output).
 *   Tutorial 4 (Agent class):  learn the reusable ToolLoopAgent abstraction.
 *   Tutorial 5 (RAG):          learn retrieval with embeddings + a search tool.
 *   Tutorial 6 (Robust):       learn error handling, recovery & tool repair.
 *   Tutorial 7 (Human-loop):   learn approval gates for sensitive tools.
 *   Tutorial 8 (Multi-agent):  learn orchestration — agents that delegate.
 *   Tutorial 9 (Observability):learn tracing steps, token usage & cost.
 *   Tutorial 10 (Capstone):    a real support agent combining everything.
 *
 * Run it with `yarn dev`. You can also skip the menu:
 *   yarn dev 1   → run the one-shot agent
 *   yarn dev 2   → run the interactive chat agent
 *   yarn dev 3   → run the JSON / structured-output lesson
 *   yarn dev 4   → run the reusable Agent class lesson
 *   yarn dev 5   → run the RAG (embeddings + retrieval) lesson
 *   yarn dev 6   → run the robust-agents (error handling) lesson
 *   yarn dev 7   → run the human-in-the-loop (approval) lesson
 *   yarn dev 8   → run the multi-agent orchestration lesson
 *   yarn dev 9   → run the observability (steps/usage/cost) lesson
 *   yarn dev 10  → run the capstone support agent
 * ----------------------------------------------------------------------------
 */

import "dotenv/config";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { runOneShotAgent } from "./agents/01-oneshot.js";
import { runInteractiveAgent } from "./agents/02-interactive.js";
import { runJsonAgent } from "./agents/03-json.js";
import { runAgentClass } from "./agents/04-agent-class.js";
import { runRagAgent } from "./agents/05-rag.js";
import { runRobustAgent } from "./agents/06-robust.js";
import { runHumanInLoopAgent } from "./agents/07-human-in-the-loop.js";
import { runMultiAgent } from "./agents/08-multi-agent.js";
import { runObservabilityAgent } from "./agents/09-observability.js";
import { runCapstoneAgent } from "./agents/10-capstone.js";

async function main() {
  // Fail early with a friendly message if the API key is missing.
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is not set. Add it to your .env file.");
    process.exit(1);
  }

  // Allow choosing via CLI arg (e.g. `yarn dev 1`), otherwise show a menu.
  let choice = process.argv[2];

  const valid = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  if (!valid.includes(choice ?? "")) {
    console.log("Which tutorial agent would you like to run?");
    console.log("  1) One-shot agent       (agent loop + tools)");
    console.log("  2) Interactive chat     (streaming + memory)");
    console.log("  3) JSON / structured    (generateText + Output)");
    console.log("  4) Agent class          (reusable ToolLoopAgent)");
    console.log("  5) RAG                  (embeddings + retrieval tool)");
    console.log("  6) Robust agents        (error handling + tool repair)");
    console.log("  7) Human-in-the-loop    (approval gates for sensitive tools)");
    console.log("  8) Multi-agent          (supervisor delegates to specialists)");
    console.log("  9) Observability        (trace steps, token usage & cost)");
    console.log(" 10) Capstone             (support agent combining everything)\n");

    const rl = readline.createInterface({ input, output });
    choice = (await rl.question("Enter 1–10: ")).trim();
    rl.close();
  }

  switch (choice) {
    case "1":
      await runOneShotAgent();
      break;
    case "2":
      await runInteractiveAgent();
      break;
    case "3":
      await runJsonAgent();
      break;
    case "4":
      await runAgentClass();
      break;
    case "5":
      await runRagAgent();
      break;
    case "6":
      await runRobustAgent();
      break;
    case "7":
      await runHumanInLoopAgent();
      break;
    case "8":
      await runMultiAgent();
      break;
    case "9":
      await runObservabilityAgent();
      break;
    case "10":
      await runCapstoneAgent();
      break;
    default:
      console.log("No valid choice made. Exiting.");
  }
}

main().catch((err) => console.error(err));
