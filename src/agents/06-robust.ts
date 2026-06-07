/**
 * agents/06-robust.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL 6: Robust agents — error handling, recovery & tool repair
 *
 * Everything so far assumed the happy path. Real agents must survive:
 *   - tools that THROW (bad data, network failure, business-rule violations)
 *   - the model producing a MALFORMED tool call (wrong/invalid arguments)
 *
 * A robust agent should *recover inside the loop* instead of crashing. This
 * tutorial shows the two key techniques:
 *
 *   1. RETURN ERRORS, DON'T THROW — when a tool can't complete, return a
 *      structured `{ error: ... }` value. The model sees it as a tool result
 *      and can apologize, try different arguments, or pick another tool.
 *      (If a tool *does* throw, the SDK still feeds the error back to the model
 *      rather than killing your program — but explicit errors are clearer.)
 *
 *   2. REPAIR MALFORMED TOOL CALLS — the `experimental_repairToolCall` hook is
 *      called when the model's tool call doesn't match the schema. You get a
 *      chance to fix the arguments and return a corrected call, instead of the
 *      whole run failing with an InvalidToolInputError.
 *
 * Run it with `yarn dev 6`.
 * ----------------------------------------------------------------------------
 */

import {
  generateText,
  stepCountIs,
  tool,
  NoSuchToolError,
  type ToolCallRepairFunction,
  type ToolSet,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

/**
 * A flaky "bank transfer" tool. It returns STRUCTURED ERRORS instead of
 * throwing, so the agent can read the problem and respond gracefully.
 */
// #region structured-error
const transferMoney = tool({
  description:
    "Transfer money between two accounts. Returns an error object if the " +
    "transfer cannot be completed (e.g. insufficient funds).",
  inputSchema: z.object({
    fromAccount: z.string().describe("Source account id"),
    toAccount: z.string().describe("Destination account id"),
    amount: z.number().positive().describe("Amount in euros, must be positive"),
  }),
  execute: async ({ fromAccount, toAccount, amount }) => {
    // Pretend "ACC-001" only has 100 euros available.
    const balances: Record<string, number> = { "ACC-001": 100 };
    const available = balances[fromAccount] ?? 0;

    if (amount > available) {
      // Return a structured error — the model will read this and recover.
      return {
        ok: false,
        error: "INSUFFICIENT_FUNDS",
        message: `Account ${fromAccount} has only €${available} available, cannot transfer €${amount}.`,
      };
    }

    return { ok: true, fromAccount, toAccount, amount, confirmation: "TXN-12345" };
  },
});
// #endregion structured-error


const tools = { transferMoney } satisfies ToolSet;

/**
 * The repair hook. If the model calls a tool that doesn't exist, or passes
 * arguments that fail the schema, this runs. Returning a corrected tool call
 * lets the agent continue; returning `null` lets the error propagate.
 *
 * Here we demonstrate a simple, safe repair: if the model invents a tool name
 * close to a real one, we don't guess — we return null. But if the JSON input
 * is malformed, we try to re-extract valid JSON from it.
 */
// #region repair
const repairToolCall: ToolCallRepairFunction<typeof tools> = async ({
  toolCall,
  error,
  tools,
}) => {
  console.log(
    `   🛠  repair invoked: ${error.constructor.name} for tool "${toolCall.toolName}"`,
  );

  // If the model hallucinated a tool that doesn't exist, we can't fix it safely.
  if (NoSuchToolError.isInstance(error)) {
    console.log("      → unknown tool, cannot repair (returning null)");
    return null;
  }

  // Otherwise the arguments failed validation. Try to salvage valid JSON from
  // the model's (possibly markdown-wrapped) input string.
  if (!(toolCall.toolName in tools)) return null;

  const raw = toolCall.input ?? "";
  const match = raw.match(/\{[\s\S]*\}/); // grab the first {...} block
  if (!match) {
    console.log("      → no JSON object found in input (returning null)");
    return null;
  }

  try {
    JSON.parse(match[0]); // validate it parses
    console.log("      → re-extracted valid JSON, retrying the call");
    return { ...toolCall, input: match[0] };
  } catch {
    console.log("      → could not repair input (returning null)");
    return null;
  }
};
// #endregion repair


export async function runRobustAgent() {
  console.log("\n🤖 TUTORIAL 6 — Robust agents (error handling + repair)\n");

  // DEMO 1 — graceful recovery from a structured tool error.
  console.log("💸 DEMO 1 — Tool returns a structured error; agent recovers\n");
  const { text: text1, steps: steps1 } = await generateText({
    model: openai("gpt-4o-mini"),
    system:
      "You are a banking assistant. If a transfer fails, explain why in plain " +
      "language and suggest a valid alternative amount.",
    prompt:
      "Please transfer €500 from account ACC-001 to ACC-999.",
    tools,
    stopWhen: stepCountIs(6),
    experimental_repairToolCall: repairToolCall,
  });

  // Show that the tool reported an error mid-loop.
  for (const step of steps1) {
    for (const r of step.toolResults) {
      console.log(`   tool result: ${JSON.stringify(r.output)}`);
    }
  }
  console.log(`\n🤖 ${text1}\n`);

  // DEMO 2 — a successful path, for contrast.
  console.log("✅ DEMO 2 — A valid transfer succeeds\n");
  const { text: text2 } = await generateText({
    model: openai("gpt-4o-mini"),
    system: "You are a banking assistant. Confirm transfers concisely.",
    prompt: "Transfer €50 from ACC-001 to ACC-999.",
    tools,
    stopWhen: stepCountIs(6),
    experimental_repairToolCall: repairToolCall,
  });
  console.log(`🤖 ${text2}\n`);

  console.log(
    "✅ Tutorial 6 complete. The agent handled a failed transfer without " +
      "crashing, and the repair hook stands ready for malformed tool calls.\n",
  );
}
