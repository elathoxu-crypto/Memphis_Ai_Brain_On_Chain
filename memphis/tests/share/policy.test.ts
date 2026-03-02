import { describe, it, expect, vi, afterEach } from "vitest";
import type { Block } from "../../src/memory/chain.js";
import { SHARE_TAG, SHARE_TTL_DAYS, isShareBlock, isExpired, filterShareBlocks } from "../../src/share/policy.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function createBlock(overrides: Partial<Block> & { data?: Partial<Block["data"]> } = {}): Block {
  return {
    index: overrides.index ?? 0,
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    chain: overrides.chain ?? "journal",
    data: {
      type: "journal",
      content: "test",
      tags: [],
      ...(overrides.data || {}),
    } as Block["data"],
    prev_hash: overrides.prev_hash ?? "0".repeat(64),
    hash: overrides.hash ?? "f".repeat(64),
  };
}

describe("share policy", () => {
  describe("isShareBlock", () => {
    it("returns true when the share tag is present", () => {
      const block = createBlock({ data: { tags: [SHARE_TAG, "other"] } });
      expect(isShareBlock(block)).toBe(true);
    });

    it("returns false when tags are missing or different", () => {
      const withoutTags = createBlock({ data: { tags: [] } });
      const undefinedTags = createBlock({ data: { tags: undefined } as any });
      expect(isShareBlock(withoutTags)).toBe(false);
      expect(isShareBlock(undefinedTags)).toBe(false);
    });
  });

  describe("isExpired", () => {
    const now = new Date("2026-02-28T12:00:00Z");

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns true for blocks older than the TTL", () => {
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const ttlMs = SHARE_TTL_DAYS * DAY_MS;
      const oldBlock = createBlock({
        timestamp: new Date(now.getTime() - ttlMs - DAY_MS).toISOString(),
      });

      expect(isExpired(oldBlock)).toBe(true);
    });

    it("returns false for fresh share blocks", () => {
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const freshBlock = createBlock({
        timestamp: new Date(now.getTime() - (SHARE_TTL_DAYS - 1) * DAY_MS).toISOString(),
      });

      expect(isExpired(freshBlock)).toBe(false);
    });
  });

  describe("filterShareBlocks", () => {
    it("removes expired share blocks when excludeExpired is true", () => {
      vi.useFakeTimers();
      const now = new Date("2026-02-28T12:00:00Z");
      vi.setSystemTime(now);

      const fresh = createBlock({
        index: 1,
        data: { tags: [SHARE_TAG] },
        timestamp: new Date(now.getTime() - DAY_MS).toISOString(),
      });
      const stale = createBlock({
        index: 2,
        data: { tags: [SHARE_TAG] },
        timestamp: new Date(now.getTime() - (SHARE_TTL_DAYS + 2) * DAY_MS).toISOString(),
      });
      const other = createBlock({ index: 3, data: { tags: ["other"] } });

      const result = filterShareBlocks([fresh, stale, other], { excludeExpired: true });
      expect(result).toEqual([fresh]);

      vi.useRealTimers();
    });
  });
});
