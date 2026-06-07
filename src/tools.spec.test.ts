/**
 * tools.spec.test.ts
 * ----------------------------------------------------------------------------
 * SPECIFICATION tests for the calculator parser (`safeEvaluate`).
 *
 * These are CHARACTERIZATION tests (PF-010): they codify the behavior of the
 * existing recursive-descent grammar in `src/tools.ts`, so they pass immediately
 * and guard against regressions during the export refactor.
 *
 * Cases ST-1 … ST-10 from `plans/agent-masterclass-docs/07-testing-strategy.md`.
 * ----------------------------------------------------------------------------
 */

import { describe, expect, it } from "vitest";
import { safeEvaluate } from "./tools.js";

describe("safeEvaluate — calculator parser (ST-1…ST-10)", () => {
  it("ST-1: multiplies — '23 * 19' → 437", () => {
    expect(safeEvaluate("23 * 19")).toBe(437);
  });

  it("ST-2: precedence — '2 + 3 * 4' → 14 (* before +)", () => {
    expect(safeEvaluate("2 + 3 * 4")).toBe(14);
  });

  it("ST-3: parentheses override — '(2 + 3) * 4' → 20", () => {
    expect(safeEvaluate("(2 + 3) * 4")).toBe(20);
  });

  it("ST-4: decimal division — '10 / 4' → 2.5", () => {
    expect(safeEvaluate("10 / 4")).toBe(2.5);
  });

  it("ST-5: whitespace tolerated — '  7  -  2  ' → 5", () => {
    expect(safeEvaluate("  7  -  2  ")).toBe(5);
  });

  it("ST-6: invalid character — '2 ^ 3' throws", () => {
    expect(() => safeEvaluate("2 ^ 3")).toThrow("Expression contains invalid characters.");
  });

  it("ST-7: missing closing parenthesis — '(2 + 3' throws", () => {
    expect(() => safeEvaluate("(2 + 3")).toThrow("Missing closing parenthesis.");
  });

  it("ST-8: dangling operator — '2 +' throws (expected a number)", () => {
    expect(() => safeEvaluate("2 +")).toThrow("Expected a number.");
  });

  it("ST-9: trailing characters — '2 2' throws", () => {
    expect(() => safeEvaluate("2 2")).toThrow("Unexpected trailing characters.");
  });

  it("ST-10: decimal addition — '1.5 + 2.5' → 4", () => {
    expect(safeEvaluate("1.5 + 2.5")).toBe(4);
  });
});
