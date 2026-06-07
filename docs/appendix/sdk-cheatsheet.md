# Appendix — Vercel AI SDK cheat-sheet

A distilled quick-reference for the `ai` package (v6) as used in this course.
Provider: OpenAI (`@ai-sdk/openai`). See the per-lesson pages for full context.

## ⚠️ Deprecations — what NOT to use

| Deprecated | Use instead |
| ---------- | ----------- |
| `generateObject` | `generateText` + `output: Output.object({ schema })` |
| `streamObject` | `streamText` + `output: Output.object({ schema })` |
| `experimental_output` | `output` |
| `openai.textEmbedding(...)` | `openai.embedding(...)` |

> Verify any SDK function before using it:
> ```bash
> grep -nE "@deprecated|declare function <name>" node_modules/ai/dist/index.d.ts
> ```

## The agent loop

```ts
import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";

const result = await generateText({
  model: openai("gpt-4o-mini"),
  tools,
  stopWhen: stepCountIs(10), // ← enables the multi-step tool loop
  prompt: "…",
});
// Inspect: result.text, result.steps, result.usage
```

Without `stopWhen`, the call stops after the first tool call and never produces a
final answer. (Lessons 1–2)

## Tools

```ts
import { tool } from "ai";
import { z } from "zod";

const getWeather = tool({
  description: "When the model should call this.", // drives tool selection
  inputSchema: z.object({ city: z.string().describe("e.g. 'Paris'") }),
  execute: async ({ city }) => ({ city, condition: "sunny" }), // your safe code
});

const tools = { getWeather }; // keys = the names the model uses
```

Never run model output as code (no `eval`). Use a bounded grammar/allow-list.
(Lessons 3, 10)

## Structured output

```ts
import { generateText, streamText, Output } from "ai";

// One-shot:
const { output } = await generateText({ model, prompt, output: Output.object({ schema }) });

// Streaming (object builds up field-by-field):
const result = streamText({ model, prompt, output: Output.object({ schema }) });
for await (const partial of result.partialOutputStream) { /* … */ }
const final = await result.output;
```

`Output` helpers: `.object({ schema })`, `.array({ element })`, `.text()`,
`.choice({ options })`, `.json()`. (Lesson 5)

## Streaming & memory

```ts
import { streamText, type ModelMessage } from "ai";

const messages: ModelMessage[] = [];
messages.push({ role: "user", content: userInput });
const result = streamText({ model, system, messages, tools, stopWhen: stepCountIs(10) });
for await (const chunk of result.textStream) process.stdout.write(chunk);
messages.push(...(await result.response).messages); // keep memory
```

Pass the persona via `system`, not a `{ role: "system" }` message. (Lesson 4)

## Reusable agent: `ToolLoopAgent`

```ts
import { ToolLoopAgent, stepCountIs, Output } from "ai";

const assistant = new ToolLoopAgent({
  model: openai("gpt-4o-mini"),
  instructions: "…",            // ⚠️ NOT `system`
  tools,
  stopWhen: stepCountIs(10),
  output: Output.object({ schema }), // optional
});
await assistant.generate({ prompt: "…" }); // generateText-shaped result
await assistant.stream({ prompt: "…" });   // streamText-shaped result
```

(Lesson 6)

## RAG: embeddings + retrieval

```ts
import { embed, embedMany, cosineSimilarity } from "ai";

const embeddingModel = openai.embedding("text-embedding-3-small");
const { embeddings } = await embedMany({ model: embeddingModel, values: docs });
const { embedding: q } = await embed({ model: embeddingModel, value: query });
const ranked = store
  .map((d) => ({ ...d, score: cosineSimilarity(q, d.embedding) }))
  .sort((a, b) => b.score - a.score);
```

Embed the query with the **same** model as the documents. (Lesson 7)

## Robustness: errors & tool repair

```ts
import { generateText, stepCountIs, NoSuchToolError, type ToolCallRepairFunction } from "ai";

// Tools RETURN structured errors, never throw:
execute: async ({ amount }) =>
  amount > available ? { ok: false, error: "INSUFFICIENT_FUNDS" } : { ok: true };

// Repair malformed tool calls:
const repair: ToolCallRepairFunction<typeof tools> = async ({ toolCall, error }) => {
  if (NoSuchToolError.isInstance(error)) return null;       // can't fix a hallucinated tool
  const m = (toolCall.input ?? "").match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { JSON.parse(m[0]); return { ...toolCall, input: m[0] }; } catch { return null; }
};
await generateText({ model, tools, stopWhen: stepCountIs(6), experimental_repairToolCall: repair });
```

(Lesson 8)

## Human-in-the-loop

Gate sensitive tools inside `execute`; default to **deny** on EOF/empty input;
return a structured "denied" result instead of throwing. (Lesson 9)

## Observability

```ts
await generateText({
  model, tools, stopWhen: stepCountIs(10), prompt,
  onStepFinish: ({ toolCalls, usage }) => { /* live log */ },
});
// Post-run: result.steps[].{toolCalls, toolResults, finishReason, usage}
// Totals:   result.usage.{inputTokens, outputTokens, totalTokens}  // guard ?? 0
// Cost = (inputTokens/1e6)*inPrice + (outputTokens/1e6)*outPrice
```

For spans: `experimental_telemetry: { isEnabled: true }`. (Lesson 11)

## Testing without a network

```ts
import { MockLanguageModelV3 } from "ai/test";
// Script a model: step 1 emits a tool-call, step 2 emits final text → assert wiring.
```

Keep pure logic (parsers, rankers, scorers) in exported functions and unit-test
them directly. (Lesson 12)

## Multi-agent

Wrap each specialist `ToolLoopAgent` as a `tool()` the supervisor calls; tell the
supervisor to **always delegate**. (Lesson 13)
