import { describe, it, expect, vi } from "vitest";
import {
  buildCard,
  listEnglishItems,
  addEnglishCards,
  addEnglishSentences,
  addEnglishText,
  deleteEnglishItem,
} from "./english.js";

const fixedNow = new Date(2026, 9, 30, 9, 0, 0);
const deps = { uuid: () => "uuid-1", now: () => fixedNow };

describe("buildCard", () => {
  it("makes a new card due now", () => {
    expect(buildCard({ front: "resilient" }, deps)).toEqual({
      id: "uuid-1",
      createdAt: fixedNow.getTime(),
      front: "resilient",
      back: "",
      example: "",
      interval: 0,
      ease: 2.5,
      due: fixedNow.getTime(),
    });
  });
});

describe("listEnglishItems", () => {
  const all = {
    cards: [{ id: "c1", front: "resilient" }, { id: "c2", front: "trade-off" }],
    sentences: [{ id: "s1", en: "We're on the same page." }],
    texts: [],
    writings: [],
  };

  it("filters one kind by keyword", async () => {
    const api = vi.fn().mockResolvedValue(all);
    expect(await listEnglishItems(api, { kind: "cards", query: "TRADE" })).toEqual({ cards: [all.cards[1]] });
  });

  it("returns every kind by default", async () => {
    const api = vi.fn().mockResolvedValue(all);
    expect(Object.keys(await listEnglishItems(api, {}))).toEqual(["cards", "sentences", "texts", "writings"]);
  });
});

describe("adding items", () => {
  it("sends cards in one bulk call", async () => {
    const api = vi.fn().mockResolvedValue({ saved: 2 });
    await addEnglishCards(api, { cards: [{ front: "a" }, { front: "b" }] }, deps);
    expect(api.mock.calls[0][2].cards.map((card) => card.front)).toEqual(["a", "b"]);
  });

  it("reports how many sentences were saved", async () => {
    const api = vi.fn().mockResolvedValue({ saved: 1 });
    expect((await addEnglishSentences(api, { sentences: [{ en: "Hi." }] }, deps)).saved).toBe(1);
  });

  it("puts a text at its own id", async () => {
    const api = vi.fn().mockResolvedValue({});
    await addEnglishText(api, { title: "T", body: "B" }, deps);
    expect(api.mock.calls[0].slice(0, 2)).toEqual(["PUT", "/api/English/items/texts/uuid-1"]);
  });
});

describe("deleteEnglishItem", () => {
  it("deletes by kind and id", async () => {
    const api = vi.fn().mockResolvedValue(null);
    await deleteEnglishItem(api, { kind: "cards", id: "c 1" });
    expect(api).toHaveBeenCalledWith("DELETE", "/api/English/items/cards/c%201");
  });
});
