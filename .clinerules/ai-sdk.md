# Vercel AI SDK — Conventions & Gotchas

Project rules for using the Vercel AI SDK (`ai` package) in this repo.
Installed: `ai@6` + `@ai-sdk/openai@3`. Provider: OpenAI (`OPENAI_API_KEY` in `.env`).

## ⚠️ Deprecation: do NOT use `generateObject` / `streamObject`

In AI SDK v6 these are **deprecated**. Confirmed directly in the installed type
definitions (`node_modules/ai/dist/index.d.ts`):

- `generateObject` → `@deprecated Use generateText with an output setting instead.`
- `streamObject`   → `@deprecated Use streamText with an output setting instead.`
- `experimental_output` → `@deprecated Use 'output' instead.`

### ✅ Correct: structured output via `generateText` / `streamText` + `Output`

Use the same text/agent functions you already know, and pass an `output` setting
built with the `Output` helper. Read the typed result from `result.output`.

```ts
import { generateText, streamText, Output, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// --- One-shot structured object ---
const { output } = await generateText({
  model: openai("gpt-4o-mini"),
  prompt: "…",
  output: Output.object({ schema: z.object({ /* … */ }) }),
});
// `output` is fully typed and validated against the schema.

// --- Streaming a structured object ---
const result = streamText({
  model: openai("gpt-4o-mini"),
  prompt: "…",
  output: Output.object({ schema }),
});
for await (const partial of result.partialOutputStream) {
  // partial = object-so-far (fields may be undefined until filled)
}
const final = await result.output; // PromiseLike<final validated object>

// --- Tools + structured final answer (full agent combo) ---
const { output } = await generateText({
  model: openai("gpt-4o-mini"),
  tools,
  stopWhen: stepCountIs(10),
  prompt: "…",
  output: Output.object({ schema }),
});
```

### `Output` helpers (from `import { Output } from "ai"`)
- `Output.object({ schema })` — a single JSON object matching a Zod schema.
- `Output.array({ element })` — an array of elements; `streamText` also exposes
  an element-by-element stream.
- `Output.text()` — plain text (the default).
- `Output.choice({ options })` — constrain to a fixed set of string options.
- `Output.json()` — free-form JSON (no schema).

> Note: `Output` is exported as `output as Output` in the package; import it as
> `import { Output } from "ai"`.

## The agent loop

- An "agent" = an LLM in a loop that can call tools. Enable the loop with
  `stopWhen: stepCountIs(N)` on `generateText` / `streamText`. Without it, the
  call stops after the first tool call and never reaches a final answer.
- Inspect what the agent did via `result.steps` (`toolCalls`, `toolResults`).

## Reusable agents: the `ToolLoopAgent` class

For a named, reusable agent (instead of re-wiring `generateText` every call), use
the `ToolLoopAgent` class. Configure once, then call `.generate()` / `.stream()`.

```ts
import { ToolLoopAgent, stepCountIs, Output } from "ai";
import { openai } from "@ai-sdk/openai";

const assistant = new ToolLoopAgent({
  model: openai("gpt-4o-mini"),
  instructions: "You are a concise assistant.", // ⚠️ NOT `system` — it's `instructions`
  tools,
  stopWhen: stepCountIs(10),
  output: Output.object({ schema }), // optional: bake in structured JSON output
});

const result = await assistant.generate({ prompt: "…" }); // same shape as generateText
const streamed = await assistant.stream({ prompt: "…" }); // same shape as streamText
```

- The system prompt field is named **`instructions`** here (not `system`).
- `.generate()` returns a `generateText`-style result (`.text`, `.steps`,
  `.output`, `.usage`); `.stream()` returns a `streamText`-style result.
- `ToolLoopAgent` is also exported as `Experimental_Agent`; the `Agent` export is
  the interface it implements.


## RAG: embeddings + retrieval

To ground an agent in your own documents, embed them and do similarity search.

```ts
import { embed, embedMany, cosineSimilarity } from "ai";
import { openai } from "@ai-sdk/openai";

const embeddingModel = openai.embedding("text-embedding-3-small"); // ⚠️ `embedding`, NOT `textEmbedding` (deprecated)

// Build a vector store (batch embed your docs):
const { embeddings } = await embedMany({ model: embeddingModel, values: docs });

// At query time, embed the query and rank by cosine similarity:
const { embedding: queryVec } = await embed({ model: embeddingModel, value: query });
const ranked = store
  .map((d) => ({ ...d, score: cosineSimilarity(queryVec, d.embedding) }))
  .sort((a, b) => b.score - a.score);
```

- `embed` → returns `{ embedding }` (single vector); `embedMany` → `{ embeddings }`
  (array, same order as `values`).
- Embed the query with the **same** model used for the documents.
- Expose retrieval as a **tool** (`searchKnowledge`) so the agent fetches context
  on demand; instruct it to answer only from retrieved docs and to say when it
  doesn't know.

## Robust agents: error handling & tool repair

Make agents survive failures instead of crashing.

```ts
import { generateText, stepCountIs, NoSuchToolError, type ToolCallRepairFunction } from "ai";

// 1) Tools should RETURN structured errors, not throw — the model reads the
//    result and recovers (apologize, retry, pick another tool).
execute: async ({ amount }) => {
  if (amount > available) return { ok: false, error: "INSUFFICIENT_FUNDS", message: "…" };
  return { ok: true, /* … */ };
},

// 2) Repair malformed tool calls via the `experimental_repairToolCall` hook.
//    Return a corrected LanguageModelV3ToolCall, or `null` to let it fail.
const repairToolCall: ToolCallRepairFunction<typeof tools> = async ({ toolCall, error, tools }) => {
  if (NoSuchToolError.isInstance(error)) return null;       // hallucinated tool → can't fix
  const match = (toolCall.input ?? "").match(/\{[\s\S]*\}/); // salvage JSON from bad input
  if (!match) return null;
  try { JSON.parse(match[0]); return { ...toolCall, input: match[0] }; } catch { return null; }
};

await generateText({ model, tools, stopWhen: stepCountIs(6), experimental_repairToolCall: repairToolCall });
```

- The repair hook's `error` is `NoSuchToolError | InvalidToolInputError`; use
  `NoSuchToolError.isInstance(error)` to distinguish them.
- `toolCall.input` is the raw (string) args; return `{ ...toolCall, input }` to retry.

## Human-in-the-loop: approval gates for sensitive tools

Before an agent takes a real action (send email, delete, move money), gate it
behind human approval. Simple CLI pattern: the sensitive tool's `execute` pauses
and asks the human, then returns a structured result either way.

```ts
const sendEmail = tool({
  description: "Send an email. Sensitive — requires human approval.",
  inputSchema: z.object({ to: z.string(), subject: z.string(), body: z.string() }),
  execute: async ({ to, subject, body }) => {
    console.log(`Agent wants to email ${to}: ${subject}`);
    const approved = await askApproval("Approve sending?"); // readline y/N
    if (!approved) return { ok: false, status: "DENIED_BY_HUMAN" }; // agent adapts
    return { ok: true, status: "SENT" };
  },
});
```

- The agent loop is unchanged — the gate lives inside the tool. Safe (read-only)
  tools run without prompting.
- Return a **structured "denied"** result (don't throw) so the agent acknowledges
  the refusal gracefully; instruct it not to retry.
- Default to **deny** on empty/EOF input (fail safe).
- The SDK also has a first-class approval flow (`needsApproval` on a tool +
  `ToolApprovalRequest`/`addToolApprovalResponse`), but that's geared to the
  Chat/UI message stream; the in-`execute` prompt above is simplest for a CLI.

## Multi-agent orchestration: agents as tools

To build a TEAM, make a "supervisor" agent that delegates to specialist agents.
The trick: **wrap each specialist `ToolLoopAgent` as a tool** the supervisor calls.

```ts
// A specialist agent (Tutorial 4):
const researchAgent = new ToolLoopAgent({ model, instructions: "…", tools: { searchKnowledge }, stopWhen: stepCountIs(5) });

// Wrap it as a tool:
const askResearcher = tool({
  description: "Delegate a factual/lookup question to the research specialist.",
  inputSchema: z.object({ question: z.string() }),
  execute: async ({ question }) => {
    const { text } = await researchAgent.generate({ prompt: question });
    return { answer: text };
  },
});

// The supervisor just calls specialists like any other tool:
const supervisor = new ToolLoopAgent({
  model,
  instructions: "Break the request into sub-tasks and delegate; never compute/recall yourself.",
  tools: { askResearcher, askMathematician },
  stopWhen: stepCountIs(10),
});
```

- Inspect `result.steps[].toolCalls` to see which specialist was used for what.
- Give each specialist a narrow `instructions` + tool set; tell the supervisor to
  always delegate (not answer directly) so routing is reliable.

## Observability: steps, token usage & cost

Trace what an agent did and what it cost.

```ts
const result = await generateText({
  model, tools, stopWhen: stepCountIs(10), prompt: "…",
  onStepFinish: ({ toolCalls, usage }) => {       // live, fires after each step
    console.log(toolCalls.map(c => c.toolName), usage.totalTokens);
  },
});

// Post-run trace: every step has toolCalls, toolResults, finishReason, usage.
for (const step of result.steps) {
  console.log(step.finishReason, step.usage.totalTokens);
}

// Whole-run totals:
const { inputTokens, outputTokens, totalTokens } = result.usage;
```

- `usage` fields (`inputTokens` / `outputTokens` / `totalTokens`) are
  `number | undefined` — always guard with `?? 0` / `?? "?"`.
- `finishReason` per step: `"tool-calls"` (loop continues) vs `"stop"` (final answer).
- Cost is your own calc: `(inputTokens/1e6)*inPrice + (outputTokens/1e6)*outPrice`.
- For full tracing/spans, pass `experimental_telemetry: { isEnabled: true }`.

## Other gotchas in this repo

- **System prompts:** pass via the `system` option, NOT as a `{ role: "system" }`
  entry in `messages` (the SDK warns about prompt-injection risk otherwise).
- **Conversation memory:** keep a `messages: ModelMessage[]` array; after each
  turn append `(await result.response).messages` so the next turn has context.
- **`marked.parse()` is async** with `marked-terminal-renderer` — `await` it or
  you'll print `Promise { <pending> }`.
- **readline + piped stdin:** `rl.question` rejects on EOF; wrap in try/catch and
  treat it as "quit" so piped input doesn't crash with `ERR_USE_AFTER_CLOSE`.

## How to verify SDK API before using it

When unsure whether an SDK function is current, check the installed types
directly instead of guessing:

```bash
grep -nE "@deprecated|declare function <name>" node_modules/ai/dist/index.d.ts
```
