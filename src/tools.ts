/**
 * tools.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL: What is a "tool"?
 *
 * An LLM on its own can only produce text. A *tool* is a function you give the
 * model so it can take real actions — fetch data, do math, call an API, etc.
 *
 * In the Vercel AI SDK you define a tool with the `tool()` helper. Each tool has:
 *   - description: plain-English explanation. The model reads this to decide
 *                  WHEN to call the tool, so write it clearly.
 *   - inputSchema: a Zod schema describing the arguments. The SDK validates the
 *                  model's output against this before your code runs, and it
 *                  tells the model exactly what shape of data to produce.
 *   - execute:     the async function that actually runs. Whatever you return
 *                  is fed back into the model as the "tool result", and the
 *                  agent loop continues.
 *
 * We export these tools and reuse them in BOTH tutorial agents.
 * ----------------------------------------------------------------------------
 */

import { tool } from "ai";
import { z } from "zod";

/**
 * A fake "weather" tool. In a real app you'd call a weather API here; we return
 * mock data so the tutorial runs without extra API keys. The point is to show
 * how the model passes structured input (a city) and receives structured output.
 */
export const getWeather = tool({
  description:
    "Get the current weather for a given city. Use this whenever the user asks about weather.",
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather for, e.g. 'Paris'"),
  }),
  execute: async ({ city }) => {
    // Deterministic pseudo-random data so the same city gives the same result.
    const conditions = ["sunny", "cloudy", "rainy", "snowy", "windy"];
    const seed = [...city.toLowerCase()].reduce((a, c) => a + c.charCodeAt(0), 0);
    const condition = conditions[seed % conditions.length];
    const temperatureC = (seed % 30) - 2; // range: -2°C .. 27°C

    return { city, condition, temperatureC, unit: "°C" };
  },
});

/**
 * A small, SAFE calculator tool.
 *
 * IMPORTANT: never use eval() on model output. Here we accept only a tiny
 * arithmetic grammar (numbers, + - * / ( ) and decimals) and parse it ourselves.
 * This demonstrates the model deciding to "compute" rather than guess at math.
 */
export const calculator = tool({
  description:
    "Evaluate a basic arithmetic expression (supports + - * / parentheses and decimals). " +
    "Use this for any math instead of doing it yourself.",
  inputSchema: z.object({
    expression: z
      .string()
      .describe("A math expression, e.g. '23 * 19' or '(2 + 3) / 4'"),
  }),
  execute: async ({ expression }) => {
    const result = safeEvaluate(expression);
    return { expression, result };
  },
});

/**
 * A minimal recursive-descent parser/evaluator for arithmetic.
 * Only digits, '.', whitespace, + - * / and parentheses are allowed.
 */
function safeEvaluate(input: string): number {
  if (!/^[\d.\s+\-*/()]+$/.test(input)) {
    throw new Error("Expression contains invalid characters.");
  }

  let pos = 0;

  const peek = () => input[pos];
  const skipSpaces = () => {
    while (pos < input.length && input[pos] === " ") pos++;
  };

  // expr := term (('+' | '-') term)*
  function parseExpr(): number {
    let value = parseTerm();
    skipSpaces();
    while (peek() === "+" || peek() === "-") {
      const op = input[pos++];
      const rhs = parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
      skipSpaces();
    }
    return value;
  }

  // term := factor (('*' | '/') factor)*
  function parseTerm(): number {
    let value = parseFactor();
    skipSpaces();
    while (peek() === "*" || peek() === "/") {
      const op = input[pos++];
      const rhs = parseFactor();
      value = op === "*" ? value * rhs : value / rhs;
      skipSpaces();
    }
    return value;
  }

  // factor := number | '(' expr ')'
  function parseFactor(): number {
    skipSpaces();
    if (peek() === "(") {
      pos++; // consume '('
      const value = parseExpr();
      skipSpaces();
      if (peek() !== ")") throw new Error("Missing closing parenthesis.");
      pos++; // consume ')'
      return value;
    }

    const start = pos;
    while (pos < input.length && /[\d.]/.test(input[pos]!)) pos++;
    const numStr = input.slice(start, pos);
    if (numStr === "") throw new Error("Expected a number.");
    return Number(numStr);
  }

  const result = parseExpr();
  skipSpaces();
  if (pos !== input.length) throw new Error("Unexpected trailing characters.");
  return result;
}

/**
 * Bundle the tools into a single object. The keys ("getWeather", "calculator")
 * are the names the model uses when it decides to call a tool.
 */
export const tools = {
  getWeather,
  calculator,
};
