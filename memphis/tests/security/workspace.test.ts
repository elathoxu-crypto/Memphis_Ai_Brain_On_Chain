import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { resolveWorkspace, writeWorkspaceSelection, normalizeWorkspaceDefinition } from "../../src/security/workspace.js";
import type { MemphisConfig } from "../../src/config/loader.js";
import { DEFAULT_CONFIG } from "../../src/config/defaults.js";

let workspaceConfig: MemphisConfig;

function buildConfig(): MemphisConfig {
  const definitions = [
    { id: "default", label: "Default", includeDefault: true },
    { id: "project", label: "Project", includeDefault: false, allowedChains: ["journal"] },
  ];
  const normalized = definitions.map(normalizeWorkspaceDefinition);
  const map = Object.fromEntries(normalized.map((def) => [def.id, def]));

  return {
    providers: { ...DEFAULT_CONFIG.providers },
    memory: { ...DEFAULT_CONFIG.memory },
    agents: { ...DEFAULT_CONFIG.agents },
    security: {
      defaultWorkspace: "default",
      workspaces: normalized,
      workspaceMap: map,
    },
  } as MemphisConfig;
}

describe("Workspace resolution", () => {
  let selectionDir: string;

  beforeEach(() => {
    workspaceConfig = buildConfig();
    selectionDir = mkdtempSync(join(tmpdir(), "memphis-ws-"));
    process.env.MEMPHIS_WORKSPACE_FILE = join(selectionDir, "workspace.json");
    delete process.env.MEMPHIS_WORKSPACE_ID;
  });

  afterEach(() => {
    delete process.env.MEMPHIS_WORKSPACE_ID;
    delete process.env.MEMPHIS_WORKSPACE_FILE;
    rmSync(selectionDir, { recursive: true, force: true });
  });

  it("respects MEMPHIS_WORKSPACE_ID over file selection", () => {
    process.env.MEMPHIS_WORKSPACE_ID = "project";
    writeWorkspaceSelection("default");

    const resolved = resolveWorkspace(workspaceConfig);
    expect(resolved.id).toBe("project");
  });

  it("falls back to workspace file when env is unset", () => {
    writeWorkspaceSelection("project");

    const resolved = resolveWorkspace(workspaceConfig);
    expect(resolved.id).toBe("project");
  });

  it("uses default workspace when no env or file is present", () => {
    rmSync(process.env.MEMPHIS_WORKSPACE_FILE || "", { force: true });

    const resolved = resolveWorkspace(workspaceConfig);
    expect(resolved.id).toBe("default");
  });
});
