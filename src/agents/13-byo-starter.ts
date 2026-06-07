/**
 * agents/13-byo-starter.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL 13 (Build Your Own) — STARTER SCAFFOLD
 *
 * This is YOUR canvas. Build a Trip Planner agent by filling in the TODOs,
 * re-applying everything from Parts I–III. Work through the checkpoints in order;
 * each maps to a concept you've already learned. When you're stuck, peek at
 * `13-byo-solution.ts` — but try first!
 *
 * ⚠️ This file is intentionally INCOMPLETE but MUST still typecheck and run.
 *    The stubs below throw `new Error("TODO")` so `yarn build` stays green while
 *    you implement each piece. Replace the throws as you go.
 *
 * Run your work-in-progress with `yarn dev 13` (it runs the SOLUTION by default;
 * wire this starter in yourself if you want to run it instead).
 * ----------------------------------------------------------------------------
 */

import { ToolLoopAgent, stepCountIs, tool, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// ── CHECKPOINT 1 (Part I — tools & safe logic) ───────────────────────────────
// Implement a PURE budget function: total = dailyCost*nights + flightCost,
// rounded. Reject negative inputs. Keep it pure so you can unit-test it.
export function estimateBudget(
  dailyCost: number,
  nights: number,
  flightCost: number,
): number {
  // TODO: validate inputs are non-negative, then return the rounded total.
  void dailyCost;
  void nights;
  void flightCost;
  throw new Error("TODO: implement estimateBudget");
}

// ── CHECKPOINT 2 (Part I — define your tools) ────────────────────────────────
// Give the agent at least two tools: a destination search and a budget
// estimator that wraps `estimateBudget`. Each needs a tight Zod inputSchema.
const estimateTripBudget = tool({
  description:
    "Estimate the total trip budget from daily cost, nights, and flight cost.",
  inputSchema: z.object({
    dailyCost: z.number().nonnegative(),
    nights: z.number().int().nonnegative(),
    flightCost: z.number().nonnegative(),
  }),
  execute: async ({ dailyCost, nights, flightCost }) => {
    // TODO: call estimateBudget and return a structured result
    //       ({ ok: true, total, currency }) — return errors, don't throw.
    //       Placeholder return keeps the file type-correct until you implement it.
    void dailyCost;
    void nights;
    void flightCost;
    return { ok: false as const, error: "NOT_IMPLEMENTED" };
  },
});


// TODO: add a `searchDestinations` tool (and optionally a weather tool).

export const tripPlannerTools = {
  estimateTripBudget,
  // TODO: add your other tools here.
};

// ── CHECKPOINT 3 (Part II — structured output) ───────────────────────────────
// Describe the itinerary you want the agent to return as a Zod schema.
const itinerarySchema = z.object({

  destination: z.string(),
  nights: z.number().int().positive(),
  estimatedBudgetEUR: z.number(),
  // TODO: add fields like weatherSummary and highlights.
});

// ── CHECKPOINT 4 (Part II — the reusable agent) ──────────────────────────────
// Configure ONE ToolLoopAgent: model + instructions + tools + stopWhen + output.
const tripPlanner = new ToolLoopAgent({

  model: openai("gpt-4o-mini"),
  instructions:
    // TODO: tell the agent to use your tools (and to use the budget tool for
    //       ALL math instead of computing it itself), then return an itinerary.
    "You are a trip-planning assistant.",
  tools: tripPlannerTools,
  stopWhen: stepCountIs(10),
  output: Output.object({ schema: itinerarySchema }),
});

// ── CHECKPOINT 5 (run it) ────────────────────────────────────────────────────
export async function runTripPlannerStarter() {
  console.log("\n🤖 TUTORIAL 13 — Build Your Own: Trip Planner (starter)\n");
  // TODO: craft a request, call `tripPlanner.generate({ prompt })`, and print
  //       result.output. Until you implement the tools above, this will throw —
  //       that's expected while you're building.
  throw new Error("TODO: implement runTripPlannerStarter");
}

/*
 * ✅ You can build an agent if you can:
 *   - define tools with tight Zod schemas and safe `execute` bodies,
 *   - keep risky logic in a pure, testable function (no `eval`),
 *   - configure a reusable ToolLoopAgent with the agent loop (`stopWhen`),
 *   - and shape the final answer with structured `Output.object`.
 */
