import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { Store } from "../../src/memory/store.js";
import { reflectOnDecisions } from "../../src/decision/reflection.js";
import type { DecisionV1 } from "../../src/decision/decision-v1.js";

const GENESIS_HASH = "0".repeat(64);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function makeTempStore() {
  const dir = mkdtempSync(join(tmpdir(), "memphis-reflect-"));
  const store = new Store(dir);
  return {
    dir,
    store,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

function buildDecision(overrides: Partial<DecisionV1> = {}): DecisionV1 {
  return {
    schema: "decision:v1",
    decisionId: overrides.decisionId ?? "dec-" + Math.random().toString(36).slice(2, 8),
    recordId: overrides.recordId ?? "rec-" + Math.random().toString(36).slice(2, 8),
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    title: overrides.title ?? "Test decision",
    reasoning: overrides.reasoning ?? "",
    mode: overrides.mode ?? "conscious",
    status: overrides.status ?? "active",
    scope: overrides.scope ?? "project",
    options: overrides.options ?? ["keep"],
    chosen: overrides.chosen ?? "keep",
    confidence: overrides.confidence ?? 0.8,
    links: overrides.links ?? [],
    metadata: overrides.metadata,
    supersedes: overrides.supersedes,
  } as DecisionV1;
}

function writeDecisionBlock(dir: string, index: number, decision: DecisionV1) {
  const chainDir = join(dir, "decisions");
  mkdirSync(chainDir, { recursive: true });
  const block = {
    index,
    timestamp: decision.createdAt,
    chain: "decisions",
    data: {
      type: "decision" as const,
      content: JSON.stringify(decision),
      tags: ["decision"],
    },
    prev_hash: index === 0 ? GENESIS_HASH : GENESIS_HASH,
    hash: GENESIS_HASH,
  };
  writeFileSync(join(chainDir, `${String(index).padStart(6, "0")}.json`), JSON.stringify(block, null, 2));
}

describe("reflectOnDecisions", () => {
  let ctx: ReturnType<typeof makeTempStore>;

  beforeEach(() => {
    if (ctx) ctx.cleanup();
    ctx = makeTempStore();
  });

  afterEach(() => {
    ctx?.cleanup();
  });

  it("returns empty buckets for empty store", () => {
    const result = reflectOnDecisions(ctx.store);
    expect(result).toEqual({ stale: [], unresolved: [], contradicted: [] });
  });

  it("flags active decisions older than threshold as stale", () => {
    const oldDecision = buildDecision({
      decisionId: "stale-1",
      createdAt: new Date(Date.now() - 90 * MS_PER_DAY).toISOString(),
    });
    writeDecisionBlock(ctx.dir, 0, oldDecision);

    const result = reflectOnDecisions(ctx.store, { staleDays: 30 });
    expect(result.stale.map((d) => d.decisionId)).toContain("stale-1");
  });

  it("collects low-confidence inferred decisions as unresolved", () => {
    const inferred = buildDecision({
      decisionId: "inf-1",
      mode: "inferred",
      confidence: 0.4,
      createdAt: new Date().toISOString(),
    });
    writeDecisionBlock(ctx.dir, 0, inferred);

    const result = reflectOnDecisions(ctx.store);
    expect(result.unresolved.map((d) => d.decisionId)).toContain("inf-1");
  });
});
