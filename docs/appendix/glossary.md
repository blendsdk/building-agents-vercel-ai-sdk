# Appendix — Glossary

Key terms used throughout the course, in plain language. Lesson references point
to where each concept is introduced.

### Agent
An LLM running **in a loop** that can call tools to take actions, not just produce
text. Enabled with `stopWhen: stepCountIs(N)`. (Lesson 1)

### Agent loop
The repeated cycle of: model thinks → optionally calls a tool → reads the result →
continues, until it produces a final answer or hits the step budget. (Lesson 2)

### Tool
A function you give the model so it can *do* things. Has three parts:
`description` (when to call), `inputSchema` (Zod, validated args), and `execute`
(your code). (Lesson 3)

### Schema
A machine-readable description of a data shape, written with **Zod**. Used to
validate tool inputs and to constrain structured output. (Lesson 3)

### Token
The unit models read and generate text in (word fragments). Usage and cost are
measured in tokens. (Lessons 4, 11)

### Streaming
Emitting the response token-by-token as it's generated (`textStream`) instead of
waiting for the whole answer. (Lesson 4)

### Conversation memory
A growing `ModelMessage[]` array passed on every turn so the agent remembers prior
messages. (Lesson 4)

### Structured output
Forcing the model's final answer to match a Zod schema, returned typed and
validated via `Output.object`. (Lesson 5)

### `Output`
The SDK helper for output settings: `.object`, `.array`, `.text`, `.choice`,
`.json`. Replaces the deprecated `generateObject`/`streamObject`. (Lesson 5)

### `ToolLoopAgent`
A reusable, configured agent class (`model` + `instructions` + `tools` + `stopWhen`
+ optional `output`). Call `.generate()` / `.stream()`. (Lesson 6)

### Embedding
A vector (list of numbers) representing the *meaning* of text. Similar meanings →
similar vectors. Built with `embed` / `embedMany`. (Lesson 7)

### Cosine similarity
A measure of how aligned two vectors are (1 = identical direction, 0 = unrelated).
Used to rank documents against a query. (Lesson 7)

### RAG (Retrieval-Augmented Generation)
Grounding an agent in your own documents by retrieving the most relevant snippets
and feeding them to the model. (Lesson 7)

### Structured error
A tool returning `{ ok: false, error, message }` instead of throwing, so the model
can read the failure and recover inside the loop. (Lesson 8)

### Tool repair
Fixing a malformed tool call via the `experimental_repairToolCall` hook — return a
corrected call or `null`. (Lesson 8)

### Human-in-the-loop
Pausing for human approval before a sensitive action runs, gated inside the tool's
`execute`. (Lesson 9)

### Prompt injection
An attack where untrusted text tries to override your instructions ("ignore
previous instructions…"). Defended by quarantining untrusted text as data. (Lesson 10)

### Sandboxing
Restricting a tool to a tiny, well-defined grammar (allow-list) so model-controlled
input can't execute arbitrary code. (Lesson 10)

### `finishReason`
Why a step ended: `"tool-calls"` (the loop continues) or `"stop"` (final answer
produced). (Lesson 11)

### Observability
Tracing what an agent did (steps, tools, tokens, cost) via `onStepFinish`,
`result.steps`, and `result.usage`. (Lesson 11)

### Eval
Grading a (nondeterministic) agent answer against **criteria** (`mustInclude` /
`mustNotInclude`) rather than exact strings. (Lesson 12)

### Mock model
A scripted `MockLanguageModelV3` (from `ai/test`) used to test agent wiring
deterministically without a network. (Lesson 12)

### Supervisor / specialist
A multi-agent pattern: a supervisor delegates sub-tasks to focused specialist
agents, each **wrapped as a tool**. (Lesson 13)

### Step
One iteration of the agent loop, exposing `toolCalls`, `toolResults`,
`finishReason`, and `usage`. (Lessons 1, 11)

### `system` vs `instructions`
The persona/rules of an agent. With `generateText`/`streamText` it's the **`system`**
option; with `ToolLoopAgent` it's the **`instructions`** field. (Lessons 4, 6)
