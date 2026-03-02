import { Block, BlockData } from "../memory/chain.js";
import { Store } from "../memory/store.js";
import { WORKSPACE_TAG_PREFIX } from "./constants.js";
import type { WorkspacePolicy } from "./workspace.js";

export class WorkspaceGuard {
  private allowedChains: Set<string> | null;

  constructor(private readonly store: Store, public readonly policy: WorkspacePolicy) {
    if (policy.allowedChains === null) {
      this.allowedChains = null;
    } else {
      this.allowedChains = new Set(policy.allowedChains);
    }
  }

  static wrap(store: Store, policy: WorkspacePolicy): WorkspaceGuard {
    return new WorkspaceGuard(store, policy);
  }

  getBasePath(): string {
    return this.store.getBasePath();
  }

  getLastBlock(chain: string): Block | undefined {
    return this.store.getLastBlock(chain);
  }

  async appendBlock(chain: string, data: BlockData): Promise<Block> {
    const normalizedTags = this.ensureWorkspaceTag(data.tags);
    data.tags = normalizedTags;

    if (chain === "security") {
      return this.store.appendBlock(chain, data);
    }

    if (!this.isChainAllowed(chain)) {
      await this.emitSecurityLog(chain, "workspace policy violation");
      throw new Error(`Chain \"${chain}\" is not permitted for workspace \"${this.policy.id}\"`);
    }

    return this.store.appendBlock(chain, data);
  }

  addBlock(chain: string, data: BlockData): Block {
    let result: Block;
    this.appendBlock(chain, data)
      .then(block => {
        result = block;
      })
      .catch(err => {
        throw err;
      });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return result!;
  }

  readChain(chain: string): Block[] {
    if (!this.isChainAllowed(chain)) return [];
    const blocks = this.store.readChain(chain);
    return blocks.filter(block => this.isBlockVisible(block));
  }

  listChains(): string[] {
    const chains = this.store.listChains();
    return chains.filter(chain => this.isChainAllowed(chain));
  }

  getChainStats(chain: string): { blocks: number; first?: string; last?: string } {
    if (!this.isChainAllowed(chain)) {
      return { blocks: 0 };
    }

    const blocks = this.readChain(chain);
    return {
      blocks: blocks.length,
      first: blocks[0]?.timestamp,
      last: blocks[blocks.length - 1]?.timestamp,
    };
  }

  private isChainAllowed(chain: string): boolean {
    if (this.allowedChains === null) return true;
    return this.allowedChains.has(chain);
  }

  private isBlockVisible(block: Block): boolean {
    const tags = block.data.tags || [];
    if (tags.includes(this.policy.workspaceTag)) {
      return true;
    }

    const hasWorkspaceTag = tags.some(tag => tag.startsWith(WORKSPACE_TAG_PREFIX));
    if (!hasWorkspaceTag && this.policy.includeDefault) {
      return true;
    }

    return false;
  }

  private ensureWorkspaceTag(existing: string[]): string[] {
    const tags = [...existing];
    if (!tags.includes(this.policy.workspaceTag)) {
      tags.push(this.policy.workspaceTag);
    }
    return tags;
  }

  private async emitSecurityLog(chain: string, reason: string): Promise<void> {
    try {
      const tags = [...this.policy.tags, this.policy.workspaceTag, "security", "workspace-guard", `denied:${chain}`];
      await this.store.appendBlock("security", {
        type: "system",
        content: `Workspace ${this.policy.id} blocked ${chain}: ${reason}`,
        tags,
        agent: "workspace-guard",
      });
    } catch {
      // swallow to avoid masking original error
    }
  }
}
