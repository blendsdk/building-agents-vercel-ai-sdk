/**
 * agents/04-agent-class.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL 4: The reusable Agent class
 *
 * In Tutorials 1–3 we wired up `model + tools + system + stopWhen` BY HAND on
 * every `generateText` / `streamText` call. That's fine for one-offs, but in a
 * real app you usually want a named, reusable agent you can call many times.
 *
 * The SDK ships exactly that: the `ToolLoopAgent` class (the concrete
 * implementation of the `Agent` interface). You configure it ONCE in the
 * constructor, then call `.generate(...)` or `.stream(...)` as often as you like.
 *
 * Think of it as "packaging" everything from Tutorial 1 into an object:
 *   - model        → which LLM to use
 *   - instructions → the system prompt / persona (note: it's called
 *                    `instructions` here, NOT `system`)
 *   - tools        → the tools it may call
 *   - stopWhen     → enables the multi-step agent loop (same as before)
 *   - output       → (optional) structured JSON output, just like Tutorial 3
 *
 * `.generate()` returns the same result shape as `generateText`
 * (`.text`, `.steps`, `.output`, `.usage`), and `.stream()` matches `streamText`.
 *
 * Run it with `yarn dev 4`.
 * ----------------------------------------------------------------------------
 */

import { ToolLoopAgent, stepCountIs, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { tools } from "../tools.js";
import { marked } from "../markdown.js";

/**
 * Define the agent ONCE. Everything it needs is captured here, so callers don't
 * have to repeat the model/tools/persona on every request.
 */
// #region construct
const assistant = new ToolLoopAgent({
  model: openai("gpt-4o-mini"),
  instructions:
    "You are a concise travel assistant. Use the weather and calculator " +
    "tools when relevant instead of guessing.",
  tools,
  stopWhen: stepCountIs(10), // the agent loop, just like Tutorials 1 & 2
});
// #endregion construct


/**
 * DEMO 1 — Reuse the SAME agent for multiple, unrelated requests.
 * No re-wiring: we just call `.generate()` with a new prompt each time.
 */
async function demoReuse() {
  console.log("\n♻️  DEMO 1 — One agent, many calls (.generate)\n");

  const questions = [
    "What's the weather in Lisbon?",
    "If a hotel costs 89 euros per night, how much for 4 nights?",
  ];

  for (const q of questions) {
    const result = await assistant.generate({ prompt: q });
    console.log(`🧑 ${q}`);
    console.log(`🤖 ${result.text}\n`);
  }
}

/**
 * DEMO 2 — Streaming from an agent (.stream)
 * Same agent object; this time we stream the tokens as they arrive.
 */
async function demoStream() {
  console.log("🌊 DEMO 2 — Streaming from the agent (.stream)\n");

  const result = await assistant.stream({
    prompt: "Plan a one-line itinerary for a sunny day in Barcelona.",
  });

  process.stdout.write("🤖 ");
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
  process.stdout.write("\n\n");
}

/**
 * DEMO 3 — A specialized agent with structured (JSON) output.
 * Agents can bake in an `output` setting too, combining Tutorial 3 + 4: every
 * call to this agent returns typed JSON instead of free-form text.
 */
async function demoStructuredAgent() {
  console.log("📦 DEMO 3 — A specialized agent that returns JSON\n");

  // #region structured
  const tripPlanner = new ToolLoopAgent({
    model: openai("gpt-4o-mini"),
    instructions:
      "You plan day trips. Check the weather with the tool before deciding.",
    tools,
    stopWhen: stepCountIs(10),
    output: Output.object({
      schema: z.object({
        city: z.string(),
        weather: z.string().describe("Short weather summary from the tool"),
        recommendation: z
          .enum(["beach", "museum", "hike", "cafe"])
          .describe("Best activity given the weather"),
        reason: z.string(),
      }),
    }),
  });
  // #endregion structured


  const result = await tripPlanner.generate({
    prompt: "Plan an activity for Amsterdam today.",
  });

  console.log("Structured plan:");
  console.log(JSON.stringify(result.output, null, 2));
  console.log();
}

export async function runAgentClass() {
  console.log("\n🤖 TUTORIAL 4 — The reusable Agent class");

  await demoReuse();
  await demoStream();
  await demoStructuredAgent();

  console.log(await marked.parse(
    "**Takeaway:** configure an `Agent` once, then call `.generate()` / " +
      "`.stream()` anywhere — it bundles model, persona, tools, the loop, and " +
      "optional structured output into one reusable object.",
  ));
}
