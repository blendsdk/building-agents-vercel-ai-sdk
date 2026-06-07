/**
 * agents/05-rag.ts
 * ----------------------------------------------------------------------------
 * TUTORIAL 5: RAG — give your agent knowledge (embeddings + retrieval)
 *
 * Our agents so far only know what's in the model's training data + the prompt.
 * RAG ("Retrieval-Augmented Generation") lets an agent answer from YOUR OWN
 * documents by *retrieving* the most relevant snippets and feeding them in.
 *
 * The pieces (all from the AI SDK — no vector database needed for this demo):
 *
 *   1. EMBEDDINGS — turn text into a vector (a list of numbers) that captures
 *      its meaning. Similar meaning → vectors that point the same way.
 *        - `embedMany` : embed a batch of documents (build the knowledge base).
 *        - `embed`     : embed a single query at search time.
 *      We use OpenAI's `text-embedding-3-small` model via `openai.embedding(...)`.
 *
 *   2. SIMILARITY SEARCH — compare the query vector to every document vector
 *      with `cosineSimilarity` and keep the top matches. This is a tiny
 *      in-memory "vector store"; a real app would use a vector DB.
 *
 *   3. THE AGENT — we expose retrieval as a `searchKnowledge` TOOL. The agent
 *      decides when to search, reads the snippets, and grounds its answer in
 *      them (and we ask it to say so when the answer isn't in the docs).
 *
 * Run it with `yarn dev 5`.
 * ----------------------------------------------------------------------------
 */

import { embed, embedMany, cosineSimilarity, generateText, stepCountIs, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// A small, made-up knowledge base. These facts are NOT in the model's training
// data, which is exactly what makes RAG necessary to answer questions about them.
const KNOWLEDGE_BASE = [
  "Acme Corp's flagship product, the Zephyr 3000, is a cordless robotic window cleaner released in 2024.",
  "The Zephyr 3000 has a battery life of 90 minutes and recharges fully in 45 minutes.",
  "Acme Corp offers a 2-year warranty on all Zephyr products, extendable to 4 years for $49.",
  "Acme Corp's headquarters are in Rotterdam, and customer support is available 24/7 via chat.",
  "The Zephyr 3000 is compatible with windows up to 3 meters high and supports glass thickness from 5mm to 30mm.",
  "Returns are accepted within 30 days of purchase, provided the device is in its original packaging.",
];

// The embedding model. `openai.embedding(...)` is the current API
// (`textEmbedding(...)` is deprecated).
const embeddingModel = openai.embedding("text-embedding-3-small");

// Our in-memory vector store: each document paired with its embedding vector.
type StoredDoc = { text: string; embedding: number[] };

/**
 * Rank documents by cosine similarity to a query vector, descending, and return
 * the top-`k`. A scored copy of each doc is returned (`{ text, score }`).
 *
 * Extracted as a PURE helper so it can be unit-tested with fixed vectors and no
 * embeddings/network (see `rag-ranking.spec.test.ts`). `Array.prototype.sort` is
 * stable in modern engines, so equal scores preserve input order (ST-14).
 */
// #region rank
export function rankBySimilarity(
  queryVec: number[],
  docs: StoredDoc[],
  k = 3,
): { text: string; score: number }[] {
  return docs
    .map((doc) => ({ text: doc.text, score: cosineSimilarity(queryVec, doc.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
// #endregion rank



/**
 * Build the vector store once: embed every document in a single batch call.
 */
async function buildVectorStore(): Promise<StoredDoc[]> {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: KNOWLEDGE_BASE,
  });
  // Pair each source document with its embedding (same order as input).
  return KNOWLEDGE_BASE.map((text, i) => ({ text, embedding: embeddings[i]! }));
}

/**
 * Retrieve the top-K documents most similar to a query.
 */
async function retrieve(store: StoredDoc[], query: string, k = 3) {
  // Embed the query with the SAME model used for the documents.
  const { embedding: queryVec } = await embed({
    model: embeddingModel,
    value: query,
  });

  // Score every document by cosine similarity, then take the best K.
  return rankBySimilarity(queryVec, store, k);
}


export async function runRagAgent() {
  console.log("\n🤖 TUTORIAL 5 — RAG (embeddings + retrieval)\n");

  console.log("📚 Building the vector store (embedding the knowledge base)…");
  const store = await buildVectorStore();
  console.log(`   Embedded ${store.length} documents.\n`);

  // PART 1 — show raw retrieval so you can SEE what similarity search returns.
  const sampleQuery = "How long does the battery last?";
  console.log(`🔍 Raw retrieval for: "${sampleQuery}"`);
  const hits = await retrieve(store, sampleQuery);
  hits.forEach((h, i) =>
    console.log(`   ${i + 1}. (score ${h.score.toFixed(3)}) ${h.text}`),
  );
  console.log();

  // PART 2 — wrap retrieval as a TOOL the agent can call on demand.
  // #region search-tool
  const searchKnowledge = tool({
    description:
      "Search Acme Corp's internal knowledge base for facts about products, " +
      "warranty, returns, and support. Always use this before answering.",
    inputSchema: z.object({
      query: z.string().describe("The search query to look up"),
    }),
    execute: async ({ query }) => {
      const results = await retrieve(store, query);
      return { results };
    },
  });
  // #endregion search-tool


  // PART 3 — ask the agent some questions. It retrieves, then answers grounded
  // in the docs. The last question is intentionally NOT in the knowledge base.
  const questions = [
    "How long does the Zephyr 3000's battery last, and how long to recharge?",
    "Can I return a product after 45 days?",
    "What is the price of Acme Corp stock?", // not in the docs on purpose
  ];

  for (const question of questions) {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are Acme Corp's support assistant. Answer ONLY using facts from " +
        "the searchKnowledge tool. If the answer isn't in the knowledge base, " +
        "say you don't have that information.",
      prompt: question,
      tools: { searchKnowledge },
      stopWhen: stepCountIs(5),
    });

    console.log(`🧑 ${question}`);
    console.log(`🤖 ${text}\n`);
  }

  console.log(
    "✅ Tutorial 5 complete. The agent answered from your documents — and " +
      "correctly declined the question that wasn't in them.\n",
  );
}
