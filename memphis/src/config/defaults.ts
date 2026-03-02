import { join } from "node:path";
import { homedir } from "node:os";
import {
  DEFAULT_ALLOWED_CHAINS,
  DEFAULT_WORKSPACE_ID,
  DEFAULT_WORKSPACE_LABEL,
  WORKSPACE_TAG_PREFIX,
} from "../security/constants.js";

export const MEMPHIS_HOME = join(homedir(), ".memphis");
export const CHAINS_PATH = join(MEMPHIS_HOME, "chains");
export const CONFIG_PATH = join(MEMPHIS_HOME, "config.yaml");

const defaultWorkspaceTag = `${WORKSPACE_TAG_PREFIX}${DEFAULT_WORKSPACE_ID}`;

export const DEFAULT_CONFIG = {
  providers: {},
  memory: {
    path: CHAINS_PATH,
    auto_git: false,
    auto_git_push: false,
  },
  agents: {
    journal: { chain: "journal", context_window: 20 },
    builder: { chain: "build", context_window: 30 },
    architect: { chain: "adr", context_window: 15 },
    ops: { chain: "ops", context_window: 10 },
  },
  security: {
    defaultWorkspace: DEFAULT_WORKSPACE_ID,
    workspaces: [
      {
        id: DEFAULT_WORKSPACE_ID,
        label: DEFAULT_WORKSPACE_LABEL,
        allowedChains: [...DEFAULT_ALLOWED_CHAINS],
        includeDefault: true,
        tags: [defaultWorkspaceTag],
      },
    ],
  },
};
