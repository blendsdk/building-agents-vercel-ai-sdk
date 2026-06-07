/**
 * agents/02-interactive.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL 2: An interactive chat agent (a terminal REPL)
 *
 * Builds on Tutorial 1 and adds the two things real chat agents need:
 *
 *   1. STREAMING — instead of waiting for the whole answer, we use
 *      `streamText` and print tokens as they arrive. Feels responsive.
 *
 *   2. MEMORY — we keep a `messages` array (the conversation history) and pass
 *      it back on every turn so the agent REMEMBERS what was said before.
 *      Without this, every message would be treated as a brand new chat.
 *
 * Tools still work exactly like Tutorial 1 — the agent can call them mid-turn,
 * and with `stopWhen: stepCountIs(...)` it loops until it produces a reply.
 *
 * Type `exit` (or `quit`) to leave.
 * ----------------------------------------------------------------------------
 */

import { streamText, stepCountIs, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { tools } from "../tools.js";

export async function runInteractiveAgent() {
  console.log("\n🤖 TUTORIAL 2 — Interactive chat agent");
  console.log("Type your message and press Enter. Type 'exit' to quit.\n");

  // The agent's persona/rules. We pass this via the `system` option (rather
  // than as a message) — it's the recommended, safer way to set instructions.
  const system =
    "You are a friendly assistant in a terminal. Keep replies short. " +
    "Use the weather and calculator tools when relevant instead of guessing.";

  // The conversation history: only user/assistant/tool turns get appended here.
  // Passing this whole array every turn is what gives the agent its memory.
  const messages: ModelMessage[] = [];

  // readline gives us an async prompt loop in the terminal.
  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      // `rl.question` rejects if stdin reaches EOF (e.g. piped input ends).
      // We treat that the same as the user choosing to quit.
      let userInput: string;
      try {
        userInput = (await rl.question("🧑 You: ")).trim();
      } catch {
        console.log("\n👋 Input closed. Goodbye!");
        break;
      }
      if (!userInput) continue;
      if (["exit", "quit"].includes(userInput.toLowerCase())) {
        console.log("👋 Goodbye!");
        break;
      }

      // 1) Add the user's message to the running history.
      messages.push({ role: "user", content: userInput });

      // 2) Stream a response. We pass the WHOLE `messages` array (not just the
      //    latest line) — that's what gives the agent memory of the chat.
      const result = streamText({
        model: openai("gpt-4o-mini"),
        system,
        messages,
        tools,
        stopWhen: stepCountIs(10), // allow the tool-calling loop, same as Tutorial 1
      });

      // 3) Print tokens as they stream in.
      output.write("🤖 Bot: ");
      for await (const chunk of result.textStream) {
        output.write(chunk);
      }
      output.write("\n\n");

      // 4) Append the assistant's full response (including any tool calls/results)
      //    back into history so the next turn has full context. `response.messages`
      //    contains everything the model produced this turn in the right format.
      const { messages: newMessages } = await result.response;
      messages.push(...newMessages);
    }
  } finally {
    rl.close();
  }
}
