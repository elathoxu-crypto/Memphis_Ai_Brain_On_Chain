import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { MemphisConfig } from "../config/loader.js";
import {
  ALL_CHAINS_TOKEN,
  DEFAULT_ALLOWED_CHAINS,
  DEFAULT_WORKSPACE_ID,
  getWorkspaceSelectionPath,
  WORKSPACE_TAG_PREFIX,
} from "./constants.js";

export interface WorkspaceDefinitionInput {
  id: string;
  label?: string;
  allowedChains?: string[];
  includeDefault?: boolean;
  tags?: string[];
}

export interface WorkspaceDefinition extends WorkspaceDefinitionInput {
  tags: string[];
}

export interface WorkspacePolicy {
  id: string;
  tags: string[];
  workspaceTag: string;
  allowedChains: string[] | null;
  includeDefault: boolean;
}

export interface ResolvedWorkspace {
  id: string;
  policy: WorkspacePolicy;
}

export interface SecurityConfig {
  defaultWorkspace: string;
  workspaces: WorkspaceDefinition[];
  workspaceMap: Record<string, WorkspaceDefinition>;
 }

export function workspaceTag(id: string): string {
  return `${WORKSPACE_TAG_PREFIX}${id}`;
}

export function normalizeWorkspaceDefinition(definition: WorkspaceDefinitionInput): WorkspaceDefinition {
  const tags = Array.isArray(definition.tags) ? [...definition.tags] : [];
  const tag = workspaceTag(definition.id);
  if (!tags.includes(tag)) {
    tags.push(tag);
  }

  return {
    ...definition,
    tags,
    allowedChains: definition.allowedChains ? [...definition.allowedChains] : undefined,
    includeDefault: definition.includeDefault ?? true,
  };
}

export function getWorkspaceSelectionFilePath(): string {
  return getWorkspaceSelectionPath();
}

export function readWorkspaceSelection(): string | undefined {
  const path = getWorkspaceSelectionPath();
  if (!existsSync(path)) {
    return undefined;
  }

  try {
    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.id === "string" && parsed.id.trim().length > 0) {
      return parsed.id.trim();
    }
  } catch {
    // Ignore malformed file
  }

  return undefined;
}

export function writeWorkspaceSelection(id: string): void {
  const path = getWorkspaceSelectionPath();
  const dir = dirname(path);
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  writeFileSync(path, JSON.stringify({ id }), { encoding: "utf-8", mode: 0o600 });
}

function buildPolicy(definition: WorkspaceDefinition): WorkspacePolicy {
  let allowedChains: string[] | null;

  if (definition.allowedChains && definition.allowedChains.includes(ALL_CHAINS_TOKEN)) {
    allowedChains = null;
  } else if (definition.allowedChains && definition.allowedChains.length > 0) {
    allowedChains = [...definition.allowedChains];
  } else {
    allowedChains = [...DEFAULT_ALLOWED_CHAINS];
  }

  const workspaceTagValue = workspaceTag(definition.id);

  return {
    id: definition.id,
    tags: [...definition.tags],
    workspaceTag: workspaceTagValue,
    allowedChains,
    includeDefault: definition.includeDefault ?? true,
  };
}

function validWorkspaceId(config: MemphisConfig, candidate?: string): string | undefined {
  if (!candidate) return undefined;
  const trimmed = candidate.trim();
  if (!trimmed) return undefined;
  if (config.security.workspaceMap[trimmed]) {
    return trimmed;
  }
  return undefined;
}

export function resolveWorkspace(config: MemphisConfig): ResolvedWorkspace {
  const envCandidate = validWorkspaceId(config, process.env.MEMPHIS_WORKSPACE_ID);
  const fileCandidate = validWorkspaceId(config, readWorkspaceSelection());
  const defaultId = config.security.defaultWorkspace || DEFAULT_WORKSPACE_ID;
  const defaultCandidate = validWorkspaceId(config, defaultId);

  const workspaceId = envCandidate ?? fileCandidate ?? defaultCandidate ?? Object.keys(config.security.workspaceMap)[0];
  const definition = config.security.workspaceMap[workspaceId];
  if (!definition) {
    throw new Error(`Workspace "${workspaceId}" is not defined`);
  }

  return {
    id: workspaceId,
    policy: buildPolicy(definition),
  };
}
