import { join } from "node:path";
import { homedir } from "node:os";

export const WORKSPACE_TAG_PREFIX = "workspace:";
export const WORKSPACE_SELECTION_FILE = "workspace";
export function getWorkspaceSelectionPath(): string {
  if (process.env.MEMPHIS_WORKSPACE_FILE) {
    return process.env.MEMPHIS_WORKSPACE_FILE;
  }
  return join(homedir(), ".memphis", WORKSPACE_SELECTION_FILE);
}
export const DEFAULT_WORKSPACE_ID = "default";
export const DEFAULT_WORKSPACE_LABEL = "Default";
export const ALL_CHAINS_TOKEN = "*";
export const DEFAULT_ALLOWED_CHAINS = [
  "journal",
  "ask",
  "decision",
  "summary",
  "thoughts",
  "vault",
  "credential",
  "security",
  "build",
  "ops",
  "adr",
  "project_task",
  "break_task",
];
