import { randomUUID } from "node:crypto";
import { z } from "zod";

// English practice data of the /english page: cards (spaced repetition),
// sentences, reading texts and writings.

const defaultDeps = { uuid: randomUUID, now: () => new Date() };
const KINDS = ["cards", "sentences", "texts", "writings"];

// A new card is due right away; the page schedules it after the first review.
export function buildCard(input, deps = defaultDeps) {
  const now = deps.now().getTime();
  return {
    id: deps.uuid(),
    createdAt: now,
    front: input.front,
    back: input.back || "",
    example: input.example || "",
    interval: 0,
    ease: 2.5,
    due: now,
  };
}

export function buildSentence(input, deps = defaultDeps) {
  return { id: deps.uuid(), createdAt: deps.now().getTime(), en: input.en, vi: input.vi || "", tag: input.tag || "" };
}

export function buildText(input, deps = defaultDeps) {
  return { id: deps.uuid(), createdAt: deps.now().getTime(), title: input.title || "", body: input.body };
}

const matches = (item, query) =>
  Object.values(item).some((value) => typeof value === "string" && value.toLowerCase().includes(query));

export async function listEnglishItems(api, { kind, query, limit = 50 }) {
  const all = (await api("GET", "/api/English/items")) || {};
  const kinds = kind ? [kind] : KINDS;
  const q = (query || "").toLowerCase();
  return Object.fromEntries(
    kinds.map((k) => [k, (all[k] || []).filter((item) => !q || matches(item, q)).slice(0, limit)])
  );
}

async function saveBulkAsync(api, kind, items) {
  const result = await api("POST", "/api/English/items/bulk", { [kind]: items });
  return { saved: result?.saved ?? items.length, [kind]: items };
}

export async function addEnglishCards(api, { cards }, deps = defaultDeps) {
  return saveBulkAsync(api, "cards", cards.map((card) => buildCard(card, deps)));
}

export async function addEnglishSentences(api, { sentences }, deps = defaultDeps) {
  return saveBulkAsync(api, "sentences", sentences.map((sentence) => buildSentence(sentence, deps)));
}

export async function addEnglishText(api, input, deps = defaultDeps) {
  const text = buildText(input, deps);
  await api("PUT", `/api/English/items/texts/${encodeURIComponent(text.id)}`, text);
  return text;
}

export async function deleteEnglishItem(api, { kind, id }) {
  await api("DELETE", `/api/English/items/${kind}/${encodeURIComponent(id)}`);
  return { kind, id, deleted: true };
}

export const schemas = {
  list_english_items: {
    kind: z.enum(KINDS).optional().describe("only this kind; default all kinds"),
    query: z.string().optional().describe("keyword matched against any text field"),
    limit: z.number().int().positive().optional().describe("max items per kind, default 50"),
  },
  add_english_cards: {
    cards: z
      .array(
        z.object({
          front: z.string().min(1).describe("English word or phrase"),
          back: z.string().optional().describe("meaning (usually Vietnamese)"),
          example: z.string().optional().describe("an English example sentence"),
        })
      )
      .min(1)
      .max(200)
      .describe("flashcards to add; they are due for review immediately"),
  },
  add_english_sentences: {
    sentences: z
      .array(
        z.object({
          en: z.string().min(1).describe("the English sentence"),
          vi: z.string().optional().describe("meaning (usually Vietnamese)"),
          tag: z.string().optional().describe("short tag, e.g. work, daily, idiom"),
        })
      )
      .min(1)
      .max(200),
  },
  add_english_text: {
    title: z.string().optional().describe("short title"),
    body: z.string().min(1).describe("the reading text; paragraphs separated by newlines"),
  },
  delete_english_item: {
    kind: z.enum(KINDS),
    id: z.string().describe("item id"),
  },
};
