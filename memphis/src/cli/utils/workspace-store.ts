import { Store } from "../../memory/store.js";
import { loadConfig } from "../../config/loader.js";
import { resolveWorkspace, type ResolvedWorkspace } from "../../security/workspace.js";
import { WorkspaceGuard } from "../../security/workspace-guard.js";
import type { MemphisConfig } from "../../config/loader.js";

export interface WorkspaceContext {
  config: MemphisConfig;
  store: Store;
  guard: WorkspaceGuard;
  workspace: ResolvedWorkspace;
}

export function createWorkspaceStore(): WorkspaceContext {
  const config = loadConfig();
  const store = new Store(config.memory.path);
  const workspace = resolveWorkspace(config);
  const guard = WorkspaceGuard.wrap(store, workspace.policy);
  return { config, store, guard, workspace };
}
