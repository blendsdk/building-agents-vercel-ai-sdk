/**
 * rag-ranking.spec.test.ts
 * ----------------------------------------------------------------------------
 * SPECIFICATION tests for the pure RAG ranking helper (`rankBySimilarity`).
 *
 * CHARACTERIZATION tests (PF-010): they pin the cosine-similarity ordering
 * behavior extracted from `05-rag.ts`, using fixed orthogonal/aligned vectors so
 * the expected order is exact and no embeddings/network are involved.
 *
 * Cases ST-11 … ST-15 from `plans/agent-masterclass-docs/07-testing-strategy.md`.
 * ----------------------------------------------------------------------------
 */

import { describe, expect, it } from "vitest";
import { rankBySimilarity } from "./05-rag.js";

type Doc = { text: string; embedding: number[] };

describe("rankBySimilarity — RAG ranking (ST-11…ST-15)", () => {
  it("ST-11: ranks by cosine similarity descending — [A, B, C]", () => {
    const docs: Doc[] = [
      { text: "A", embedding: [1, 0] },
      { text: "B", embedding: [0, 1] },
      { text: "C", embedding: [-1, 0] },
    ];
    const ranked = rankBySimilarity([1, 0], docs, 3);
    expect(ranked.map((d) => d.text)).toEqual(["A", "B", "C"]);
    expect(ranked.map((d) => d.score)).toEqual([1, 0, -1]);
  });

  it("ST-12: returns only top-k items — k=2 → [A, B]", () => {
    const docs: Doc[] = [
      { text: "A", embedding: [1, 0] },
      { text: "B", embedding: [0, 1] },
      { text: "C", embedding: [-1, 0] },
    ];
    const ranked = rankBySimilarity([1, 0], docs, 2);
    expect(ranked).toHaveLength(2);
    expect(ranked.map((d) => d.text)).toEqual(["A", "B"]);
  });

  it("ST-13: more-aligned doc ranks first — query [1,1] → [B, A]", () => {
    const docs: Doc[] = [
      { text: "A", embedding: [1, 0] },
      { text: "B", embedding: [1, 1] },
    ];
    const ranked = rankBySimilarity([1, 1], docs, 2);
    expect(ranked.map((d) => d.text)).toEqual(["B", "A"]);
  });

  it("ST-14: tied scores — both returned, stable order, no crash", () => {
    const docs: Doc[] = [
      { text: "A", embedding: [1, 0] },
      { text: "B", embedding: [1, 0] },
    ];
    const ranked = rankBySimilarity([1, 0], docs, 2);
    expect(ranked.map((d) => d.text)).toEqual(["A", "B"]);
    expect(ranked.map((d) => d.score)).toEqual([1, 1]);
  });

  it("ST-15: empty docs list → []", () => {
    expect(rankBySimilarity([1, 0], [], 3)).toEqual([]);
  });
});
