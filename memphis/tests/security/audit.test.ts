import { describe, expect, it } from "vitest";
import type { Block, BlockData } from "../../src/memory/chain.js";
import type { Store } from "../../src/memory/store.js";
import { runSecurityAudit } from "../../src/security/audit.js";

const ZERO_HASH = "0".repeat(64);

function makeBlock(overrides: Partial<Block> & { data: BlockData }): Block {
  return {
    index: overrides.index ?? 0,
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    chain: overrides.chain ?? "journal",
    data: overrides.data,
    prev_hash: overrides.prev_hash ?? ZERO_HASH,
    hash: overrides.hash ?? ZERO_HASH,
  };
}

function makeStoreMock(chains: Record<string, Block[]>): Store {
  return {
    listChains: () => Object.keys(chains),
    readChain: (chain: string) => chains[chain] ?? [],
  } as unknown as Store;
}

describe("runSecurityAudit", () => {
  it("reports vault status and share statistics", () => {
    const now = new Date();
    const old = new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000);

    const vaultBlocks = [
      makeBlock({
        chain: "vault",
        timestamp: now.toISOString(),
        data: { type: "vault", content: "api-key", tags: ["secret"], encrypted: "x" },
      }),
    ];

    const shareBlocks = [
      makeBlock({
        chain: "journal",
        timestamp: now.toISOString(),
        data: { type: "journal", content: "Shared context", tags: ["share", "context"] },
      }),
      makeBlock({
        chain: "journal",
        timestamp: old.toISOString(),
        data: { type: "journal", content: "Expired share", tags: ["share"] },
      }),
    ];

    const store = makeStoreMock({ vault: vaultBlocks, journal: shareBlocks });

    const result = runSecurityAudit(store);

    expect(result.vaultInitialized).toBe(true);
    expect(result.lastVaultAccess).toBe(vaultBlocks[vaultBlocks.length - 1].timestamp);
    expect(result.chainCount).toBe(2);
    expect(result.hasShareBlocks).toBe(true);
    expect(result.expiredShareBlocks).toBe(1);
  });

  it("handles empty stores without crashing", () => {
    const store = makeStoreMock({});
    const result = runSecurityAudit(store);

    expect(result.vaultInitialized).toBe(false);
    expect(result.lastVaultAccess).toBeUndefined();
    expect(result.chainCount).toBe(0);
    expect(result.hasShareBlocks).toBe(false);
    expect(result.expiredShareBlocks).toBe(0);
  });
});
