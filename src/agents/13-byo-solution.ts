/**
 * agents/13-byo-solution.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL 13 (Build Your Own) — REFERENCE SOLUTION: a Trip Planner agent
 *
 * This is the complete, working solution for the "build your own agent" lesson.
 * It's a NEW domain (travel, not the support bot) that re-applies everything
 * from Parts I–III:
 *
 *   • Tools (Part I)              → searchDestinations, getWeatherForecast,
 *                                   estimateBudget — each a `tool()` with a tight
 *                                   Zod schema.
 *   • Safe deterministic logic    → `estimateBudget` is a pure exported function
 *                                   (no `eval`, no network) so it's unit-testable.
 *   • Reusable Agent (Part II)    → a single ToolLoopAgent configured once.
 *   • Structured output (Part II) → the final answer is a validated JSON itinerary.
 *   • The agent loop              → stopWhen: stepCountIs(...) drives tool calls.
 *
 * Compare this against `13-byo-starter.ts` (the scaffold with TODOs) to see the
 * shape you're aiming for.
 *
 * Run it with `yarn dev 13`.
 * ----------------------------------------------------------------------------
 */

import { ToolLoopAgent, stepCountIs, tool, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// ── A tiny "destinations" database (stand-in for a real search API) ──────────
const DESTINATIONS = [
  { city: "Lisbon", country: "Portugal", vibe: "sunny coastal city", dailyCost: 90 },
  { city: "Reykjavik", country: "Iceland", vibe: "dramatic nature", dailyCost: 160 },
  { city: "Kyoto", country: "Japan", vibe: "temples and gardens", dailyCost: 120 },
  { city: "Marrakesh", country: "Morocco", vibe: "vibrant markets", dailyCost: 70 },
];

/**
 * Deterministically estimate a trip budget. PURE function (no network, no
 * randomness) so it can be unit-tested directly — the same testability principle
 * as `safeEvaluate` and `rankBySimilarity` earlier in the course.
 *
 * total = (dailyCost * nights) + flightCost, rounded to whole currency units.
 */
// #region estimate-budget
export function estimateBudget(
  dailyCost: number,
  nights: number,
  flightCost: number,
): number {
  if (nights < 0 || dailyCost < 0 || flightCost < 0) {
    throw new Error("Budget inputs must be non-negative.");
  }
  return Math.round(dailyCost * nights + flightCost);
}
// #endregion estimate-budget

// ── Tool 1: search destinations by a free-text vibe/keyword ──────────────────
// #region tools
const searchDestinations = tool({
  description:
    "Search candidate travel destinations by a keyword or vibe (e.g. 'beach', " +
    "'nature', 'culture'). Returns matching cities with a daily cost estimate.",
  inputSchema: z.object({
    query: z.string().describe("A keyword or vibe to match against destinations"),
  }),
  execute: async ({ query }) => {
    const q = query.toLowerCase();
    const matches = DESTINATIONS.filter(
      (d) =>
        d.vibe.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q),
    );
    return { results: matches.length ? matches : DESTINATIONS };
  },
});

// ── Tool 2: a MOCK weather forecast (deterministic, no API key needed) ───────
const getWeatherForecast = tool({
  description: "Get a short mock weather forecast for a city.",
  inputSchema: z.object({
    city: z.string().describe("The destination city"),
  }),
  execute: async ({ city }) => {
    const conditions = ["sunny", "mild", "rainy", "crisp", "warm"];
    const seed = [...city.toLowerCase()].reduce((a, c) => a + c.charCodeAt(0), 0);
    return { city, forecast: conditions[seed % conditions.length], highC: (seed % 15) + 12 };
  },
});

// ── Tool 3: a SAFE, deterministic budget estimator (wraps the pure function) ─
const estimateTripBudget = tool({
  description:
    "Estimate the total trip budget from a daily cost, number of nights, and " +
    "flight cost. Use this for any budget math instead of computing it yourself.",
  inputSchema: z.object({
    dailyCost: z.number().nonnegative().describe("Estimated cost per day"),
    nights: z.number().int().nonnegative().describe("Number of nights"),
    flightCost: z.number().nonnegative().describe("Round-trip flight cost"),
  }),
  execute: async ({ dailyCost, nights, flightCost }) => {
    try {
      const total = estimateBudget(dailyCost, nights, flightCost);
      return { ok: true as const, total, currency: "EUR" };
    } catch (err) {
      return {
        ok: false as const,
        error: "INVALID_BUDGET_INPUT",
        message: err instanceof Error ? err.message : "Invalid input.",
      };
    }
  },
});

export const tripPlannerTools = {
  searchDestinations,
  getWeatherForecast,
  estimateTripBudget,
};
// #endregion tools

// ── The final structured itinerary the agent must produce ────────────────────
// #region itinerary-schema
const itinerarySchema = z.object({

  destination: z.string().describe("Chosen city, e.g. 'Lisbon, Portugal'"),
  nights: z.number().int().positive(),
  weatherSummary: z.string().describe("Short forecast from the weather tool"),
  estimatedBudgetEUR: z.number().describe("Total budget from the budget tool"),
  highlights: z.array(z.string()).describe("2–3 suggested activities"),
});
// #endregion itinerary-schema

// ── The Trip Planner agent: configured once, returns structured JSON ─────────
// #region agent
const tripPlanner = new ToolLoopAgent({

  model: openai("gpt-4o-mini"),
  instructions:
    "You are a trip-planning assistant. Use searchDestinations to pick a city " +
    "matching the user's vibe, getWeatherForecast for its weather, and " +
    "estimateTripBudget for ALL budget math (never compute it yourself). Then " +
    "return a single structured itinerary.",
  tools: tripPlannerTools,
  stopWhen: stepCountIs(10),
  output: Output.object({ schema: itinerarySchema }),
});
// #endregion agent

export async function runTripPlanner() {
  console.log("\n🤖 TUTORIAL 13 — Build Your Own: Trip Planner (solution)\n");

  const request =
    "Plan a 4-night sunny coastal trip. Assume a €150 round-trip flight. " +
    "Pick a destination, check the weather, and estimate the total budget.";
  console.log(`🧑 ${request}\n`);

  const result = await tripPlanner.generate({ prompt: request });

  // Show the tools the agent used (observability, Part III).
  const used = result.steps.flatMap((s) => s.toolCalls.map((c) => c.toolName));
  console.log(`🔎 Tools used: [${used.join(", ") || "none"}]\n`);

  console.log("🧳 Structured itinerary:");
  console.log(JSON.stringify(result.output, null, 2));

  console.log(
    "\n✅ Tutorial 13 complete. A brand-new domain, built from the same parts: " +
      "tools, safe deterministic logic, the agent loop, and structured output.\n",
  );
}
