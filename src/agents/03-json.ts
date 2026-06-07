/**
 * agents/03-json.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL 3: Agents + JSON (structured output)
 *
 * Tutorials 1 & 2 returned free-form TEXT. Often you instead want typed,
 * validated JSON you can use directly in code — no fragile string parsing.
 *
 * ⚠️  API NOTE (AI SDK v6): the older `generateObject` / `streamObject`
 *     functions are now DEPRECATED. The current way to get structured output
 *     is to call the SAME functions you already know — `generateText` and
 *     `streamText` — but pass an `output` setting built with the `Output`
 *     helper. You then read the typed result from `result.output`.
 *
 *     Why this is nicer: one consistent API for text, tools, AND JSON. An agent
 *     can call tools in a loop (Tutorials 1 & 2) and still return structured
 *     JSON as its final answer — all in a single `generateText` call.
 *
 * The key idea stays the same: you describe the shape you want with a Zod
 * schema (via `Output.object({ schema })`), and the SDK forces the model's
 * output to match it AND parses it into a fully-typed object for you.
 *
 * This file has FOUR small demos. Run them all with `yarn dev 3`.
 * ----------------------------------------------------------------------------
 */

import { generateText, streamText, stepCountIs, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { tools } from "../tools.js";

const model = openai("gpt-4o-mini");

/**
 * DEMO 1 — Structured extraction
 * Turn an unstructured blob of text into clean, typed JSON.
 */
async function demoExtraction() {
  console.log("\n📦 DEMO 1 — Structured extraction (generateText + Output.object)\n");

  const text =
    "Hey team! Our launch party is on March 14th at the Rooftop Bar. " +
    "Sam, Priya, and Diego have confirmed, and probably Lena too. " +
    "Bring your laptops — we'll demo the new dashboard.";

  // Describe EXACTLY the JSON shape we want. The .describe() hints guide the model.
  const schema = z.object({
    eventName: z.string().describe("A short name for the event"),
    date: z.string().describe("The date mentioned, as written"),
    location: z.string(),
    confirmedAttendees: z.array(z.string()).describe("People who confirmed"),
    tentativeAttendees: z.array(z.string()).describe("People who might come"),
  });

  // `output: Output.object({ schema })` asks for structured JSON. The result is
  // available on `result.output`, already validated AND typed as the schema.
  const { output } = await generateText({
    model,
    prompt: `Extract structured event details from this message:\n\n${text}`,
    output: Output.object({ schema }),
  });

  console.log("Input text:\n  " + text + "\n");
  console.log("Extracted object (typed!):");
  console.log(JSON.stringify(output, null, 2));
  // e.g. output.confirmedAttendees is typed as string[] — full autocomplete.
}

/**
 * DEMO 2 — Classification with an enum
 * Use z.enum([...]) to constrain the model to a fixed set of choices.
 */
async function demoClassification() {
  console.log("\n🏷  DEMO 2 — Classification with z.enum\n");

  const ticket =
    "I was charged twice for my subscription this month and need a refund.";

  const schema = z.object({
    category: z
      .enum(["bug", "billing", "feature_request", "general"])
      .describe("Which bucket the ticket belongs to"),
    priority: z.enum(["low", "medium", "high"]),
    summary: z.string().describe("One-sentence summary"),
  });

  const { output } = await generateText({
    model,
    prompt: `Classify this support ticket:\n\n"${ticket}"`,
    output: Output.object({ schema }),
  });

  console.log("Ticket: " + ticket + "\n");
  console.log("Classification:");
  console.log(JSON.stringify(output, null, 2));
}

/**
 * DEMO 3 — Streaming a JSON object
 * Use `streamText` + an `output` setting. `partialOutputStream` emits partial
 * versions of the object as it's generated; `result.output` resolves to the
 * final, fully-validated object.
 */
async function demoStreaming() {
  console.log("\n🌊 DEMO 3 — Streaming JSON (streamText + Output.object)\n");

  const schema = z.object({
    title: z.string(),
    servings: z.number(),
    ingredients: z.array(z.string()),
    steps: z.array(z.string()),
  });

  const result = streamText({
    model,
    prompt: "Create a simple recipe for a vegan banana smoothie.",
    output: Output.object({ schema }),
  });

  // Each partial is the object-so-far. We log how many fields/items exist yet.
  console.log("Watching the object build up:");
  for await (const partial of result.partialOutputStream) {
    const ingredients = partial.ingredients?.length ?? 0;
    const steps = partial.steps?.length ?? 0;
    process.stdout.write(
      `\r  title=${partial.title ? "✓" : "…"} ` +
        `ingredients=${ingredients} steps=${steps}   `,
    );
  }

  // `result.output` is a promise that resolves to the final validated object.
  const final = await result.output;
  console.log("\n\nFinal recipe object:");
  console.log(JSON.stringify(final, null, 2));
}

/**
 * DEMO 4 — Tools + structured final answer (the full combo)
 * A real agent: it calls TOOLS (like Tutorials 1 & 2) AND returns its final
 * answer as structured JSON — all in one `generateText` call.
 */
async function demoToolsPlusJson() {
  console.log("\n🤝 DEMO 4 — Tools + structured JSON final answer\n");

  const { output } = await generateText({
    model,
    tools,
    stopWhen: stepCountIs(10),
    prompt:
      "Get the weather for Oslo and Cairo, then tell me which is warmer.",
    // The agent is free to call tools along the way, but its FINAL answer is
    // forced to match this schema.
    output: Output.object({
      schema: z.object({
        oslo: z.object({ condition: z.string(), temperatureC: z.number() }),
        cairo: z.object({ condition: z.string(), temperatureC: z.number() }),
        warmerCity: z.enum(["Oslo", "Cairo"]),
      }),
    }),
  });

  console.log("Structured agent result:");
  console.log(JSON.stringify(output, null, 2));
}

export async function runJsonAgent() {
  console.log("\n🤖 TUTORIAL 3 — Agents + JSON (structured output)");

  await demoExtraction();
  await demoClassification();
  await demoStreaming();
  await demoToolsPlusJson();

  console.log("\n✅ Tutorial 3 complete.\n");
}
