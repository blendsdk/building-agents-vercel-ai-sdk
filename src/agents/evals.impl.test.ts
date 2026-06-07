/**
 * evals.impl.test.ts
 * ----------------------------------------------------------------------------
 * IMPLEMENTATION tests for the eval scorer (`scoreAnswer`).
 *
 * The spec tests (`evals.spec.test.ts`, ST-16…20) pin the core contract. These
 * implementation tests cover edge cases and internals not enumerated as
 * ST-cases: empty criteria, duplicate `mustInclude` substrings, empty output,
 * and the `mustNotInclude` boundary when nothing is required.
 *
 * Source: `src/agents/12-evals.ts` (`scoreAnswer`) — edge cases per the
 * testing strategy (`07-testing-strategy.md`, Implementation Tests table).
 * ----------------------------------------------------------------------------
 */

import { describe, expect, it } from "vitest";
import { scoreAnswer } from "./12-evals.js";

describe("scoreAnswer — implementation edge cases", () => {
  describe("empty criteria", () => {
    it("scores 1 and passes when mustInclude is empty (nothing required)", () => {
      // An empty requirement list is trivially satisfied (documented behavior).
      expect(scoreAnswer("anything at all", { mustInclude: [] })).toEqual({
        score: 1,
        passed: true,
      });
    });

    it("scores 1 but FAILS when nothing is required yet a banned phrase appears", () => {
      // score === 1 (no requirements) but mustNotInclude is violated → passed:false.
      expect(
        scoreAnswer("contains secret", {
          mustInclude: [],
          mustNotInclude: ["secret"],
        }),
      ).toEqual({ score: 1, passed: false });
    });
  });

  describe("duplicate substrings", () => {
    it("counts duplicate mustInclude entries independently (fraction reflects list length)", () => {
      // Both entries are the same substring and both are present → 2/2 = 1.
      expect(
        scoreAnswer("2 years warranty", {
          mustInclude: ["2 years", "2 years"],
        }),
      ).toEqual({ score: 1, passed: true });
    });

    it("scores duplicates as a fraction of the full list when present once", () => {
      // The substring "x" appears, so each of the 3 identical entries counts →
      // 3/3 = 1. This documents that scoring is per-entry, not per-unique-value.
      expect(scoreAnswer("x marks", { mustInclude: ["x", "x", "x"] })).toEqual({
        score: 1,
        passed: true,
      });
    });
  });

  describe("output & matching boundaries", () => {
    it("scores 0 when output is an empty string but substrings are required", () => {
      expect(scoreAnswer("", { mustInclude: ["hello"] })).toEqual({
        score: 0,
        passed: false,
      });
    });

    it("matches a substring that appears in the middle of a word", () => {
      // `includes` is plain substring matching, not word-boundary matching.
      expect(scoreAnswer("warrantied", { mustInclude: ["warrant"] })).toEqual({
        score: 1,
        passed: true,
      });
    });

    it("computes a partial fraction (1/3) correctly", () => {
      const result = scoreAnswer("only alpha here", {
        mustInclude: ["alpha", "beta", "gamma"],
      });
      expect(result.score).toBeCloseTo(1 / 3, 10);
      expect(result.passed).toBe(false);
    });

    it("ignores mustNotInclude when it is an empty list", () => {
      expect(
        scoreAnswer("clean answer", {
          mustInclude: ["clean"],
          mustNotInclude: [],
        }),
      ).toEqual({ score: 1, passed: true });
    });
  });
});
