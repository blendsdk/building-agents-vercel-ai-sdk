/**
 * agents/01-oneshot.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL 1: A "one-shot" agent
 *
 * Goal: understand the core *agent loop* in its simplest form.
 *
 * What makes an LLM call an "agent"? The ability to call tools in a LOOP:
 *   1. We send the model a task + the list of tools it may use.
 *   2. The model may respond with a "tool call" instead of a final answer.
 *   3. The SDK runs our tool's `execute()` and feeds the result back.
 *   4. The model sees the result and either calls another tool or answers.
 *   5. Repeat until the model gives a final text answer (or we hit a step limit).
 *
 * The single line that turns one request into this loop is:
 *     stopWhen: stepCountIs(10)
 * It lets the model take up to 10 steps. Without it, the SDK stops after the
 * first tool call and won't continue to a final answer.
 * ----------------------------------------------------------------------------
 */

import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { tools } from "../tools.js";
import { marked } from "../markdown.js";

export async function runOneShotAgent(
  task = "What's the weather in Paris right now, and what is 23 * 19? " +
    "Summarize both in one short paragraph.",
) {
  console.log("\n🤖 TUTORIAL 1 — One-shot agent\n");
  console.log(`📋 Task: ${task}\n`);

  // #region loop
  const result = await generateText({
    // 1) Pick the model. `openai(...)` reads OPENAI_API_KEY from the env.
    model: openai("gpt-4o-mini"),

    // 2) A system prompt shapes the agent's behavior/persona.
    system:
      "You are a concise, helpful assistant. " +
      "Always use the provided tools for weather and math instead of guessing.",

    // 3) The task we want done.
    prompt: task,

    // 4) The tools the model is allowed to call (defined in tools.ts).
    tools,

    // 5) THE KEY LINE: allow multiple steps so tool calls + the final answer
    //    can all happen in one `generateText` call. This is the agent loop.
    stopWhen: stepCountIs(10),
  });
  // #endregion loop

  // ---- Observe the loop --------------------------------------------------
  // `result.steps` lets us SEE what the agent did at each step: which tools it
  // called, with what arguments, and what came back. Great for learning/debug.
  console.log("🔎 Agent steps (the loop in action):\n");
  result.steps.forEach((step, i) => {
    for (const call of step.toolCalls) {
      console.log(`  Step ${i + 1}: 🛠  called \`${call.toolName}\``);
      console.log(`            input: ${JSON.stringify(call.input)}`);
    }
    for (const toolResult of step.toolResults) {
      console.log(`            result: ${JSON.stringify(toolResult.output)}`);
    }
  });

  // ---- Final answer ------------------------------------------------------
  // `result.text` is the model's final text answer after the loop finished.
  // We render it through the terminal markdown renderer for nice formatting.
  console.log("\n💬 Final answer:\n");
  console.log(await marked.parse(result.text));

  // `result.usage` reports token counts — handy for cost awareness.
  console.log(
    `\n📊 Tokens — input: ${result.usage.inputTokens}, output: ${result.usage.outputTokens}\n`,
  );

  return result.text;
}
