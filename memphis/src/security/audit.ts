import type { Block } from "../memory/chain.js";
import { Store } from "../memory/store.js";
import { isExpired, isShareBlock } from "../share/policy.js";

export interface AuditResult {
  vaultInitialized: boolean;
  chainCount: number;
  hasShareBlocks: boolean;
  expiredShareBlocks: number;
  lastVaultAccess?: string;
}

function safeReadChain(store: Store, chain: string): Block[] {
  try {
    return store.readChain(chain);
  } catch {
    return [];
  }
}

export function runSecurityAudit(store: Store): AuditResult {
  const chains = store.listChains();
  const chainCount = chains.length;

  const vaultBlocks = safeReadChain(store, "vault");
  const vaultInitialized = vaultBlocks.length > 0;
  const lastVaultAccess = vaultInitialized ? vaultBlocks[vaultBlocks.length - 1].timestamp : undefined;

  const shareBlocks: Block[] = [];

  for (const chainName of chains) {
    const blocks = chainName === "vault" ? vaultBlocks : safeReadChain(store, chainName);
    for (const block of blocks) {
      if (isShareBlock(block)) {
        shareBlocks.push(block);
      }
    }
  }

  const hasShareBlocks = shareBlocks.length > 0;
  const expiredShareBlocks = shareBlocks.filter(block => isExpired(block)).length;

  return {
    vaultInitialized,
    chainCount,
    hasShareBlocks,
    expiredShareBlocks,
    lastVaultAccess,
  };
}
