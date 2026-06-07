/**
 * agents/09-observability.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL 9: Observability — see what your agent does, and what it costs
 *
 * Before you ship an agent you need to ANSWER three questions:
 *   1. What did it actually do? (which tools, in what order, why it stopped)
 *   2. How many tokens did it use? (per step and in total)
 *   3. What did that cost?
 *
 * The SDK gives you everything for this:
 *   - `result.steps`      — every step of the loop: toolCalls, toolResults,
 *                           finishReason, and per-step `usage`.
 *   - `result.usage`      — total token usage for the whole run
 *                           (inputTokens / outputTokens / totalTokens; each may
 *                            be `undefined` if the provider didn't report it).
 *   - `onStepFinish`      — a callback fired after each step, great for live
 *                           logging/telemetry as the agent runs.
 *
 * This tutorial runs a small multi-step task and produces a readable report.
 *
 * Run it with `yarn dev 9`.
 * ----------------------------------------------------------------------------
 */

import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { tools } from "../tools.js";

// Rough public price for gpt-4o-mini (USD per 1M tokens) — for ESTIMATION only.
const PRICE_PER_1M = { input: 0.15, output: 0.6 };

function estimateCost(inputTokens = 0, outputTokens = 0): number {
  return (
    (inputTokens / 1_000_000) * PRICE_PER_1M.input +
    (outputTokens / 1_000_000) * PRICE_PER_1M.output
  );
}

export async function runObservabilityAgent() {
  console.log("\n🤖 TUTORIAL 9 — Observability (steps, usage & cost)\n");

  const task =
    "What's the weather in Oslo and in Cairo, and what is 1234 * 9? " +
    "Summarize all three results.";
  console.log(`📋 Task: ${task}\n`);

  const result = await generateText({
    model: openai("gpt-4o-mini"),
    system: "Use the tools for weather and math. Be concise.",
    prompt: task,
    tools,
    stopWhen: stepCountIs(10),

    // 1) LIVE telemetry: this fires after every step as the agent runs.
    // #region on-step-finish
    onStepFinish: ({ toolCalls, usage }) => {
      const names = toolCalls.map((c) => c.toolName).join(", ") || "(final answer)";
      console.log(
        `   ⏱  step finished — tools: ${names}; ` +
          `step tokens: ${usage.totalTokens ?? "?"}`,
      );
    },
    // #endregion on-step-finish
  });


  // 2) POST-RUN report: walk result.steps for a detailed trace.
  console.log("\n📊 Step-by-step trace:\n");
  result.steps.forEach((step, i) => {
    console.log(`  Step ${i + 1}  [finishReason: ${step.finishReason}]`);
    for (const call of step.toolCalls) {
      console.log(`    🛠  call   ${call.toolName}(${JSON.stringify(call.input)})`);
    }
    for (const r of step.toolResults) {
      console.log(`    ↩  result ${JSON.stringify(r.output)}`);
    }
    console.log(
      `    🔢 tokens: in=${step.usage.inputTokens ?? "?"} ` +
        `out=${step.usage.outputTokens ?? "?"} total=${step.usage.totalTokens ?? "?"}`,
    );
  });

  // 3) Totals + cost estimate for the whole run.
  const { inputTokens, outputTokens, totalTokens } = result.usage;
  const cost = estimateCost(inputTokens, outputTokens);

  console.log("\n💰 Run summary:");
  console.log(`   steps:         ${result.steps.length}`);
  console.log(`   input tokens:  ${inputTokens ?? "?"}`);
  console.log(`   output tokens: ${outputTokens ?? "?"}`);
  console.log(`   total tokens:  ${totalTokens ?? "?"}`);
  console.log(`   est. cost:     $${cost.toFixed(6)} (gpt-4o-mini pricing)`);

  console.log(`\n💬 Final answer:\n${result.text}\n`);

  console.log(
    "✅ Tutorial 9 complete. You can now trace every step, count tokens, and " +
      "estimate cost — the foundation for monitoring agents in production.\n",
  );
}
