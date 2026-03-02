import chalk from "chalk";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Block } from "../../memory/chain.js";
import { SHARE_TAG, SHARE_TTL_DAYS, filterShareBlocks, isExpired } from "../../share/policy.js";
import { createWorkspaceStore } from "../utils/workspace-store.js";

const NETWORK_CHAIN_PATH = join(homedir(), ".memphis", "network-chain.jsonl");
const DAY_MS = 24 * 60 * 60 * 1000;

type SharePlanOptions = { json?: boolean; chain?: string };

interface NetworkChainEntry {
  cid?: string;
  chain?: string;
  direction?: string;
  source?: string;
  timestamp?: string;
  hash?: string;
  ipfs?: string;
  [key: string]: unknown;
}

interface SharePlanOutgoing {
  chain: string;
  index: number;
  cid: string;
  timestamp: string;
  ageDays: number;
  preview: string;
}

interface SharePlanIncoming {
  cid: string;
  chain?: string;
  source?: string;
  timestamp?: string;
  ageDays?: number;
}

interface SharePlanReport {
  shareTag: string;
  ttlDays: number;
  scannedChains: string[];
  networkFile: string;
  stats: {
    totalShareBlocks: number;
    activeShareBlocks: number;
    expiredShareBlocks: number;
    networkEntries: number;
    syncedCids: number;
    pendingOutgoing: number;
    pendingIncoming: number;
  };
  pendingOutgoing: SharePlanOutgoing[];
  pendingIncoming: SharePlanIncoming[];
  expiredBlocks: Array<{ chain: string; index: number; timestamp: string; ageDays: number }>;
}

export async function sharePlanCommand(opts: SharePlanOptions): Promise<void> {
  const { guard } = createWorkspaceStore();

  const availableChains = guard.listChains().sort();
  const { selectedChains, missingChains } = resolveChains(opts.chain, availableChains);

  if (selectedChains.length === 0) {
    if (missingChains.length > 0 && !opts.json) {
      console.log(chalk.yellow(`No matching chains. Unknown: ${missingChains.join(", ")}`));
    } else {
      console.log(chalk.yellow("No chains available to scan."));
    }
    return;
  }

  const allShareBlocks = selectedChains.flatMap((chain) => {
    const blocks = guard.readChain(chain);
    return filterShareBlocks(blocks);
  });

  const activeShareBlocks = allShareBlocks.filter((block) => !isExpired(block));
  const expiredShareBlocks = allShareBlocks.filter((block) => isExpired(block));

  const networkEntries = readNetworkChainEntries(NETWORK_CHAIN_PATH);
  const networkEntriesWithCid = networkEntries
    .map((entry) => ({ ...entry, cid: getEntryCid(entry) }))
    .filter((entry): entry is NetworkChainEntry & { cid: string } => Boolean(entry.cid));

  const networkCidSet = new Set(networkEntriesWithCid.map((entry) => entry.cid));
  const localCidSet = new Set(allShareBlocks.map((block) => getBlockCid(block)));

  const pendingOutgoing = activeShareBlocks
    .filter((block) => !networkCidSet.has(getBlockCid(block)))
    .map((block) => blockToOutgoing(block));

  const pendingIncoming = networkEntriesWithCid
    .filter((entry) => !localCidSet.has(entry.cid))
    .map((entry) => entryToIncoming(entry));

  const report: SharePlanReport = {
    shareTag: SHARE_TAG,
    ttlDays: SHARE_TTL_DAYS,
    scannedChains: selectedChains,
    networkFile: NETWORK_CHAIN_PATH,
    stats: {
      totalShareBlocks: allShareBlocks.length,
      activeShareBlocks: activeShareBlocks.length,
      expiredShareBlocks: expiredShareBlocks.length,
      networkEntries: networkEntries.length,
      syncedCids: networkCidSet.size,
      pendingOutgoing: pendingOutgoing.length,
      pendingIncoming: pendingIncoming.length,
    },
    pendingOutgoing,
    pendingIncoming,
    expiredBlocks: expiredShareBlocks.map((block) => ({
      chain: block.chain,
      index: block.index,
      timestamp: block.timestamp,
      ageDays: toAgeDays(block.timestamp) ?? 0,
    })),
  };

  if (opts.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  printReport(report, {
    networkFileExists: existsSync(NETWORK_CHAIN_PATH),
    missingChains,
  });
}

function resolveChains(filter: string | undefined, available: string[]): { selectedChains: string[]; missingChains: string[] } {
  if (!filter) {
    return { selectedChains: available, missingChains: [] };
  }

  const requested = filter
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const selectedChains = requested.filter((chain) => available.includes(chain));
  const missingChains = requested.filter((chain) => !available.includes(chain));

  return { selectedChains, missingChains };
}

function readNetworkChainEntries(path: string): NetworkChainEntry[] {
  if (!existsSync(path)) return [];

  const raw = readFileSync(path, "utf-8");
  const lines = raw.split(/\r?\n/);
  const entries: NetworkChainEntry[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
        entries.push(parsed as NetworkChainEntry);
      }
    } catch (error) {
      console.warn(chalk.yellow(`[share-plan] Skipping malformed network entry: ${error}`));
    }
  }

  return entries;
}

function getBlockCid(block: Block): string {
  return block.hash;
}

function getEntryCid(entry: NetworkChainEntry): string | undefined {
  if (entry.cid && typeof entry.cid === "string") return entry.cid;
  if (entry.hash && typeof entry.hash === "string") return entry.hash;
  if (entry.ipfs && typeof entry.ipfs === "string") return entry.ipfs;
  return undefined;
}

function blockToOutgoing(block: Block): SharePlanOutgoing {
  return {
    chain: block.chain,
    index: block.index,
    cid: getBlockCid(block),
    timestamp: block.timestamp,
    ageDays: toAgeDays(block.timestamp) ?? 0,
    preview: previewContent(block.data.content),
  };
}

function entryToIncoming(entry: NetworkChainEntry & { cid: string }): SharePlanIncoming {
  return {
    cid: entry.cid,
    chain: typeof entry.chain === "string" ? entry.chain : undefined,
    source: typeof entry.source === "string" ? entry.source : entry.direction,
    timestamp: typeof entry.timestamp === "string" ? entry.timestamp : undefined,
    ageDays: entry.timestamp ? toAgeDays(entry.timestamp) : undefined,
  };
}

function toAgeDays(timestamp?: string): number | undefined {
  if (!timestamp) return undefined;
  const value = new Date(timestamp).getTime();
  if (Number.isNaN(value)) return undefined;
  const diff = Math.max(0, Date.now() - value);
  return Number((diff / DAY_MS).toFixed(2));
}

function previewContent(content?: string): string {
  if (!content) return "";
  const singleLine = content.replace(/\s+/g, " ").trim();
  if (singleLine.length <= 80) return singleLine;
  return `${singleLine.slice(0, 77)}...`;
}

function printReport(report: SharePlanReport, opts: { networkFileExists: boolean; missingChains: string[] }): void {
  console.log();
  console.log(chalk.bold("Memphis Share Plan (dry run)"));
  console.log(`Share tag: ${SHARE_TAG} | TTL: ${SHARE_TTL_DAYS} days`);
  console.log(`Chains scanned: ${report.scannedChains.join(", ") || "(none)"}`);
  if (opts.missingChains.length > 0) {
    console.log(chalk.yellow(`Missing chains: ${opts.missingChains.join(", ")}`));
  }
  console.log(`Network log: ${opts.networkFileExists ? report.networkFile : `${report.networkFile} (not found)`}`);
  console.log(`Share blocks: ${report.stats.totalShareBlocks} (active: ${report.stats.activeShareBlocks}, expired: ${report.stats.expiredShareBlocks})`);
  console.log(`Network entries: ${report.stats.networkEntries} | Synced CIDs: ${report.stats.syncedCids}`);

  if (report.expiredBlocks.length > 0) {
    console.log(chalk.yellow(`⚠ ${report.expiredBlocks.length} share blocks exceeded TTL (${SHARE_TTL_DAYS}d) and were ignored.`));
  }

  console.log();
  console.log(chalk.bold(`Pending outgoing (${report.pendingOutgoing.length})`));
  if (report.pendingOutgoing.length === 0) {
    console.log(chalk.gray("  No local share blocks waiting for pinning."));
  } else {
    for (const block of report.pendingOutgoing) {
      const id = `${block.chain}#${String(block.index).padStart(6, "0")}`;
      console.log(`  ${chalk.cyan(id)} ${chalk.gray(`${block.ageDays}d ago`)} ${block.preview ? "— " + block.preview : ""}`);
    }
  }

  console.log();
  console.log(chalk.bold(`Pending incoming (${report.pendingIncoming.length})`));
  if (report.pendingIncoming.length === 0) {
    console.log(chalk.gray("  No remote entries awaiting import."));
  } else {
    for (const entry of report.pendingIncoming) {
      const source = entry.chain || entry.source || "unknown";
      const age = typeof entry.ageDays === "number" ? `${entry.ageDays}d ago` : "age n/a";
      console.log(`  ${chalk.magenta(source)} ${entry.cid} ${chalk.gray(age)}`);
    }
  }
  console.log();
}
