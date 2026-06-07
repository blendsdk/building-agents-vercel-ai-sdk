/**
 * agents/12-evals.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL 12: Testing & evaluating agents — a deterministic scorer
 *
 * LLM output is nondeterministic, so you can't snapshot-test it. Instead you
 * *evaluate* it against criteria: does the answer contain the facts it must,
 * and does it avoid phrases it must not? `scoreAnswer` is a tiny, deterministic
 * "eval" you can run in CI with no network — the foundation of an eval suite.
 *
 * Run it with `yarn dev 12`.
 * ----------------------------------------------------------------------------
 */

/**
 * Criteria for grading a single answer.
 * - `mustInclude`    — substrings the answer is required to contain.
 * - `mustNotInclude` — substrings the answer must avoid (optional).
 * Matching is case-insensitive.
 */
export interface ScoreCriteria {
  mustInclude: string[];
  mustNotInclude?: string[];
}

/** Result of grading an answer. */
export interface ScoreResult {
  /** Fraction (0..1) of `mustInclude` substrings present. */
  score: number;
  /** True iff score === 1 AND no `mustNotInclude` substring is present. */
  passed: boolean;
}

/**
 * Deterministically grade `output` against `criteria` (case-insensitive).
 *
 * `score`  = fraction of `mustInclude` substrings present.
 * `passed` = `score === 1` AND none of `mustNotInclude` present.
 *
 * An empty `mustInclude` list scores 1 (nothing required is trivially satisfied).
 */
// #region score-answer
export function scoreAnswer(output: string, criteria: ScoreCriteria): ScoreResult {
  const haystack = output.toLowerCase();
  const required = criteria.mustInclude;
  const banned = criteria.mustNotInclude ?? [];

  const presentCount = required.filter((needle) =>
    haystack.includes(needle.toLowerCase()),
  ).length;

  const score = required.length === 0 ? 1 : presentCount / required.length;

  const hasBanned = banned.some((needle) => haystack.includes(needle.toLowerCase()));
  const passed = score === 1 && !hasBanned;

  return { score, passed };
}
// #endregion score-answer


/**
 * A tiny demo eval suite: score a few canned answers and print a report.
 * (No network — this is exactly what you'd run in CI to guard agent quality.)
 */
export async function runEvalsDemo() {
  console.log("\n🤖 TUTORIAL 12 — Evaluating agents (deterministic scorer)\n");

  const cases: { name: string; output: string; criteria: ScoreCriteria }[] = [
    {
      name: "Warranty answer (good)",
      output: "Our warranty is 2 years, extendable to 4.",
      criteria: { mustInclude: ["2 years"] },
    },
    {
      name: "Warranty answer (incomplete)",
      output: "We offer a warranty.",
      criteria: { mustInclude: ["warranty", "2 years"] },
    },
    {
      name: "Answer with a banned upsell",
      output: "It's 2 years — but call now to upgrade!",
      criteria: { mustInclude: ["2 years"], mustNotInclude: ["call now"] },
    },
  ];

  for (const c of cases) {
    const { score, passed } = scoreAnswer(c.output, c.criteria);
    const mark = passed ? "✅" : "❌";
    console.log(`${mark} ${c.name} — score ${score.toFixed(2)}, passed: ${passed}`);
    console.log(`   output: "${c.output}"\n`);
  }

  console.log(
    "✅ Tutorial 12 complete. Deterministic scoring lets you gate agent quality " +
      "in CI without flaky, network-dependent snapshot tests.\n",
  );
}
