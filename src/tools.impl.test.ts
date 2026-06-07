/**
 * tools.impl.test.ts
 * ----------------------------------------------------------------------------
 * IMPLEMENTATION tests for the calculator parser (`safeEvaluate`).
 *
 * Unlike the spec tests (`tools.spec.test.ts`, which trace to ST-cases), these
 * tests probe internals, edge cases, and boundary conditions derived from the
 * code itself: deep nesting, negative results, large numbers, division edge
 * cases, and additional error paths.
 *
 * Source: `src/tools.ts` (recursive-descent grammar) — edge cases per the
 * testing strategy (`07-testing-strategy.md`, Implementation Tests table).
 * ----------------------------------------------------------------------------
 */

import { describe, expect, it } from "vitest";
import { safeEvaluate } from "./tools.js";

describe("safeEvaluate — implementation edge cases", () => {
  describe("nesting & precedence", () => {
    it("evaluates deeply nested parentheses", () => {
      // ((1 + 2) * (3 + 4)) = 3 * 7 = 21
      expect(safeEvaluate("((1 + 2) * (3 + 4))")).toBe(21);
    });

    it("evaluates multiple nested levels with mixed operators", () => {
      // (2 * (3 + (4 - 1))) = 2 * (3 + 3) = 12
      expect(safeEvaluate("(2 * (3 + (4 - 1)))")).toBe(12);
    });

    it("chains division left-to-right (left associative)", () => {
      // 100 / 5 / 2 = (100/5)/2 = 10
      expect(safeEvaluate("100 / 5 / 2")).toBe(10);
    });

    it("chains subtraction left-to-right (left associative)", () => {
      // 10 - 4 - 3 = (10-4)-3 = 3 (not 10-(4-3)=9)
      expect(safeEvaluate("10 - 4 - 3")).toBe(3);
    });
  });

  describe("negative results & subtraction", () => {
    it("produces a negative result when subtracting a larger number", () => {
      expect(safeEvaluate("3 - 10")).toBe(-7);
    });

    it("handles a parenthesized expression yielding a negative value", () => {
      // (2 - 5) * 4 = -3 * 4 = -12
      expect(safeEvaluate("(2 - 5) * 4")).toBe(-12);
    });
  });

  describe("large numbers & decimals", () => {
    it("multiplies large integers exactly within float range", () => {
      expect(safeEvaluate("1000000 * 1000")).toBe(1_000_000_000);
    });

    it("adds many decimals", () => {
      expect(safeEvaluate("0.1 + 0.2 + 0.7")).toBeCloseTo(1, 10);
    });

    it("treats a bare decimal like '.5' as 0.5", () => {
      // parseFactor scans [\d.]+, so '.5' parses to Number('.5') === 0.5
      expect(safeEvaluate(".5 + .5")).toBe(1);
    });
  });

  describe("division edge cases", () => {
    it("returns Infinity for division by zero (JS float semantics)", () => {
      // The grammar permits it; Number division yields Infinity, not a throw.
      expect(safeEvaluate("1 / 0")).toBe(Infinity);
    });
  });

  describe("error paths", () => {
    it("throws on an empty string (no number found)", () => {
      expect(() => safeEvaluate("")).toThrow();
    });

    it("throws when input contains letters", () => {
      expect(() => safeEvaluate("2 + a")).toThrow(
        "Expression contains invalid characters.",
      );
    });

    it("throws on an unmatched closing parenthesis (trailing characters)", () => {
      // '2)' parses '2', then pos !== length → trailing-characters error.
      expect(() => safeEvaluate("2)")).toThrow(
        "Unexpected trailing characters.",
      );
    });

    it("throws when an operator has no right-hand operand inside parens", () => {
      expect(() => safeEvaluate("(2 *)")).toThrow("Expected a number.");
    });
  });
});
