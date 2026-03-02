import type { Block } from "../memory/chain.js";

export const SHARE_TAG = "share";
export const SHARE_TTL_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export function isShareBlock(block: Block): boolean {
  const tags = block?.data?.tags;
  return Array.isArray(tags) && tags.includes(SHARE_TAG);
}

export function isExpired(block: Block, ttlDays: number = SHARE_TTL_DAYS): boolean {
  const timestamp = new Date(block.timestamp).getTime();
  if (Number.isNaN(timestamp)) return true;
  const ttlMs = Math.max(ttlDays, 0) * DAY_MS;
  if (ttlMs === 0) return false;
  return Date.now() - timestamp > ttlMs;
}

export function filterShareBlocks(blocks: Block[], opts?: { excludeExpired?: boolean }): Block[] {
  const shareBlocks = blocks.filter(isShareBlock);
  if (opts?.excludeExpired) {
    return shareBlocks.filter((block) => !isExpired(block));
  }
  return shareBlocks;
}
