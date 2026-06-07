/**
 * agents/07-human-in-the-loop.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL 7: Human-in-the-loop — approval gates for sensitive tools
 *
 * Once an agent can take REAL actions (send email, delete data, move money),
 * you don't want it acting unsupervised. The fix: put a human "approval gate"
 * in front of sensitive tools — the agent proposes the action, a person
 * approves or denies, and only then does it run.
 *
 * Pattern used here (simple + robust for a CLI):
 *   - A normal tool, but its `execute` first PAUSES and asks the human in the
 *     terminal to confirm (showing exactly what the agent wants to do).
 *   - If approved → perform the action and return success.
 *   - If denied   → return a STRUCTURED "denied" result (like Tutorial 6).
 *     The agent reads that and responds gracefully instead of crashing.
 *
 * The agent loop (`stopWhen: stepCountIs`) is unchanged — the human check just
 * lives inside the tool. Safe tools (like `getWeather`) run without prompting.
 *
 * Run it with `yarn dev 7`. (Type y/n at the approval prompts.)
 * ----------------------------------------------------------------------------
 */

import { generateText, stepCountIs, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

/**
 * Ask the human a yes/no question in the terminal. Returns true for approval.
 * Defaults to "deny" on empty/EOF input — fail safe.
 */
// #region approval
async function askApproval(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input, output });
  try {
    const answer = (await rl.question(`\n⚠️  ${question} [y/N]: `)).trim().toLowerCase();
    return answer === "y" || answer === "yes";
  } catch {
    return false; // EOF / piped input → treat as "deny"
  } finally {
    rl.close();
  }
}
// #endregion approval


/**
 * A SENSITIVE tool: sending an email. Its execute() gates on human approval.
 */
// #region sensitive-tool
const sendEmail = tool({
  description:
    "Send an email to a recipient. This is a sensitive action that requires " +
    "human approval before sending.",
  inputSchema: z.object({
    to: z.string().describe("Recipient email address"),
    subject: z.string(),
    body: z.string(),
  }),
  execute: async ({ to, subject, body }) => {
    // Show the human exactly what the agent proposes to do.
    console.log("\n┌─ ✉️  The agent wants to SEND AN EMAIL ─────────────");
    console.log(`│ To:      ${to}`);
    console.log(`│ Subject: ${subject}`);
    console.log(`│ Body:    ${body}`);
    console.log("└────────────────────────────────────────────────");

    const approved = await askApproval("Approve sending this email?");
    if (!approved) {
      // Structured "denied" result — the agent will read this and adapt.
      return { ok: false, status: "DENIED_BY_HUMAN", message: "The user declined to send the email." };
    }

    // (Pretend to actually send it here.)
    return { ok: true, status: "SENT", to, subject };
  },
});
// #endregion sensitive-tool


/**
 * A SAFE tool: looking up a contact. No approval needed — it just reads data.
 */
const lookupContact = tool({
  description: "Look up a contact's email address by name.",
  inputSchema: z.object({ name: z.string() }),
  execute: async ({ name }) => {
    const book: Record<string, string> = {
      alice: "alice@example.com",
      bob: "bob@example.com",
    };
    const email = book[name.toLowerCase()];
    return email
      ? { found: true, name, email }
      : { found: false, name, message: "No contact with that name." };
  },
});

const tools = { sendEmail, lookupContact };

async function runTask(prompt: string) {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system:
      "You are an email assistant. Look up contacts as needed, then send email " +
      "using the sendEmail tool. If the user declines to send, acknowledge it " +
      "politely and do not retry.",
    prompt,
    tools,
    stopWhen: stepCountIs(8),
  });
  console.log(`\n🤖 ${text}\n`);
}

export async function runHumanInLoopAgent() {
  console.log("\n🤖 TUTORIAL 7 — Human-in-the-loop (approval gates)\n");
  console.log(
    "The agent will look up a contact (no approval needed) and then try to " +
      "send an email (requires YOUR approval). Try approving one and denying " +
      "the other to see both paths.\n",
  );

  // The agent will: lookupContact(alice) → propose sendEmail → wait for you.
  await runTask(
    "Send Alice a short, friendly email inviting her to lunch on Friday.",
  );

  await runTask(
    "Send Bob a one-line reminder that the report is due tomorrow.",
  );

  console.log(
    "✅ Tutorial 7 complete. Sensitive actions paused for human approval; " +
      "denials were handled gracefully, and safe tools ran freely.\n",
  );
}
