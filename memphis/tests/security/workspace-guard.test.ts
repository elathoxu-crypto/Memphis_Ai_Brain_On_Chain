import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Store } from "../../src/memory/store.js";
import { WorkspaceGuard } from "../../src/security/workspace-guard.js";
import type { WorkspacePolicy } from "../../src/security/workspace.js";

function createPolicy(overrides: Partial<WorkspacePolicy> = {}): WorkspacePolicy {
  return {
    id: "project",
    tags: ["workspace:project"],
    workspaceTag: "workspace:project",
    allowedChains: ["journal", "security"],
    includeDefault: false,
    ...overrides,
  };
}

describe("WorkspaceGuard", () => {
  let tempDir: string;
  let store: Store;
  let guard: WorkspaceGuard;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "memphis-guard-"));
    store = new Store(tempDir);
    guard = WorkspaceGuard.wrap(store, createPolicy());
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("injects the workspace tag when appending", async () => {
    const block = await guard.appendBlock("journal", {
      type: "journal",
      content: "workspace guard test",
      tags: ["note"],
    });

    expect(block.data.tags).toContain("workspace:project");
  });

  it("filters readChain by workspace tag and includeDefault flag", async () => {
    await guard.appendBlock("journal", {
      type: "journal",
      content: "tagged",
      tags: ["tagged"],
    });

    await store.appendBlock("journal", {
      type: "journal",
      content: "legacy",
      tags: ["legacy"],
    });

    const flagsOff = guard.readChain("journal");
    expect(flagsOff.some(b => b.data.content === "legacy")).toBe(false);

    const includePolicy = createPolicy({ includeDefault: true });
    const includeGuard = WorkspaceGuard.wrap(store, includePolicy);
    const includeResult = includeGuard.readChain("journal");
    expect(includeResult.some(b => b.data.content === "legacy")).toBe(true);
  });

  it("logs security chain when denied and rejects append", async () => {
    await expect(guard.appendBlock("vault", {
      type: "vault",
      content: "secret",
      tags: ["secret"],
    })).rejects.toThrow(/not permitted/);

    const audit = guard.readChain("security");
    expect(audit.length).toBeGreaterThan(0);
    expect(audit[0].data.tags).toEqual(expect.arrayContaining(["workspace:project"]));
  });
});
