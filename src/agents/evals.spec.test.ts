/**
 * evals.spec.test.ts
 * ----------------------------------------------------------------------------
 * SPECIFICATION tests for the eval scorer (`scoreAnswer`).
 *
 * TRUE SPEC-FIRST tests (PF-010): `scoreAnswer` does NOT exist yet. These cases
 * define NEW behavior and are written BEFORE implementation — they MUST FAIL on
 * first run (red phase), then pass once `12-evals.ts` is implemented (green).
 *
 * Spec (from `07-testing-strategy.md`): `scoreAnswer(output, criteria)` returns
 * `{ score, passed }` where:
 *   - score  = fraction of `criteria.mustInclude` substrings present
 *              (case-insensitive)
 *   - passed = score === 1 AND none of `criteria.mustNotInclude` present
 *
 * Cases ST-16 … ST-20.
 * ----------------------------------------------------------------------------
 */

import { describe, expect, it } from "vitest";
import { scoreAnswer } from "./12-evals.js";

describe("scoreAnswer — eval scorer (ST-16…ST-20)", () => {
  it("ST-16: all required substrings present → { score: 1, passed: true }", () => {
    expect(scoreAnswer("Warranty is 2 years", { mustInclude: ["2 years"] })).toEqual({
      score: 1,
      passed: true,
    });
  });

  it("ST-17: none present → { score: 0, passed: false }", () => {
    expect(
      scoreAnswer("no idea", { mustInclude: ["2 years", "warranty"] }),
    ).toEqual({ score: 0, passed: false });
  });

  it("ST-18: half present → { score: 0.5, passed: false }", () => {
    expect(
      scoreAnswer("warranty info", { mustInclude: ["warranty", "2 years"] }),
    ).toEqual({ score: 0.5, passed: false });
  });

  it("ST-19: required present but banned phrase present → { score: 1, passed: false }", () => {
    expect(
      scoreAnswer("2 years but call now", {
        mustInclude: ["2 years"],
        mustNotInclude: ["call now"],
      }),
    ).toEqual({ score: 1, passed: false });
  });

  it("ST-20: case-insensitive match → { score: 1, passed: true }", () => {
    expect(scoreAnswer("TWO YEARS", { mustInclude: ["two years"] })).toEqual({
      score: 1,
      passed: true,
    });
  });
});
