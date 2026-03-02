#!/usr/bin/env node
// Terminal hard reset (combines both cleanups into one)
function cleanupTerminalHard() {
  if (!process.stdin.isTTY) return;
  try { process.stdout.write("\x1b[?1049l\x1b[0m\x1b[?25h"); } catch {}
  try { process.stdin.setRawMode(false); } catch {}
  try { process.stdin.pause(); } catch {}
}

// Debug: dump active handles
function dumpActiveHandles(label = "final") {
  try {
    const handles = (process as any)._getActiveHandles?.() ?? [];
    const requests = (process as any)._getActiveRequests?.() ?? [];
    const hNames = handles.map((h: any) => h?.constructor?.name ?? "Unknown");
    const rNames = requests.map((r: any) => r?.constructor?.name ?? "Unknown");
    console.error("[DEBUG] Active handles (" + label + "):", hNames.slice(0,5));
    console.error("[DEBUG] Active requests (" + label + "):", rNames.slice(0,5));
    console.error("[DEBUG] stdin: isTTY=" + process.stdin.isTTY + " readable=" + (process.stdin as any).readable);
  } catch(e) { console.error("[DEBUG] Error:", e); }
}

// Register cleanup handlers
process.on("exit", cleanupTerminalHard);
process.on("SIGINT", () => { cleanupTerminalHard(); process.exit(130); });
process.on("SIGTERM", () => { cleanupTerminalHard(); process.exit(143); });

import { Command } from "commander";
import { journalCommand } from "./commands/journal.js";
import { askCommand } from "./commands/ask.js";
import { embedCommand } from "./commands/embed.js";
import { recallCommand } from "./commands/recall.js";
import { statusCommand } from "./commands/status.js";
import { initCommand } from "./commands/init.js";
import { vaultCommand } from "./commands/vault.js";
import { verifyCommand } from "./commands/verify.js";
import { repairCommand } from "./commands/repair.js";
import { reviseCommand } from "./commands/revise.js";
import { reflectCommand } from "./commands/reflect.js";
import { agentCommand } from "./commands/agent.js";
import { decideCommand } from "./commands/decide.js";
import { showCommand } from "./commands/show.js";
import { botCommand } from "./commands/bot.js";
import { sharePlanCommand } from "./commands/share-plan.js";
import { runOpenClawCommands } from "../bridges/openclaw.js";
import { MemphisTUI } from "../tui/index.js";
import { createWorkspaceStore } from "./utils/workspace-store.js";
import chalk from "chalk";
import { writeWorkspaceSelection, getWorkspaceSelectionFilePath } from "../security/workspace.js";

const program = new Command();

program
  .name("memphis")
  .description("Local-first AI brain with persistent memory")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize Memphis in ~/.memphis")
  .action(initCommand);

program
  .command("journal <message>")
  .description("Add a journal entry to memory")
  .option("-t, --tags <tags>", "Comma-separated tags")
  .option("-c, --chain <chain>", "Target chain (default: journal)")
  .action((message, options) => journalCommand(message, options));

program
  .command("ask <question>")
  .description("Ask Memphis (uses recall context + LLM)")
  .option("-v, --use-vault", "Use API keys from vault (requires VAULT_PASSWORD env var)")
  .option("-p, --vault-password <password>", "Vault password (or use VAULT_PASSWORD env)")
  .option("-m, --model <model>", "Model to use (forces Ollama)")
  .option("--provider <provider>", "Provider: ollama, openai, openrouter, codex, openclaw")
  .option("-t, --top <n>", "Number of context hits (default: 8)", "8")
  .option("--since <date>", "Only recall blocks newer than date (YYYY-MM-DD)")
  .option("--include-vault", "Include vault blocks in recall search")
  .option("--no-save", "Don't save the answer to chain")
  .option("--skip-save", "Alias for --no-save")
  .option("-j, --json", "Output JSON with answer + context")
  .option("--prefer-summaries", "Prefer summary context (for overview questions)")
  .option("--no-summaries", "Disable summary context")
  .option("--summaries <n>", "Max summaries to include (default: 2)", "2")
  .option("--explain-context", "Show why context was built this way")
  .option("--semantic-weight <weight>", "Semantic vs keyword blend (0-1)", "0.5")
  .option("--semantic-only", "Use semantic search only")
  .option("--no-semantic", "Disable semantic search")
  .action((question, options) => {
    const parsedTop = parseInt(options.top, 10);
    const parsedSummaries = parseInt(options.summaries, 10);
    const parsedSemanticWeight = options.semanticWeight !== undefined
      ? parseFloat(options.semanticWeight)
      : undefined;
    const topValue = Number.isFinite(parsedTop) ? parsedTop : 8;
    const summariesValue = Number.isFinite(parsedSummaries) ? parsedSummaries : 2;
    const semanticWeight = Number.isFinite(parsedSemanticWeight) ? parsedSemanticWeight : 0.5;
    const noSaveFlag = options.save === false || options.noSave === true || options.skipSave === true;

    askCommand(question, {
      useVault: options.useVault,
      vaultPassword: options.vaultPassword || process.env.VAULT_PASSWORD,
      model: options.model,
      provider: options.provider,
      top: topValue,
      since: options.since,
      includeVault: options.includeVault,
      noSave: noSaveFlag,
      json: options.json,
      preferSummaries: options.preferSummaries,
      noSummaries: options.noSummaries,
      summariesMax: summariesValue,
      explainContext: options.explainContext,
      semanticWeight,
      semanticOnly: options.semanticOnly,
      noSemantic: options.noSemantic,
    });
  });

program
  .command("embed")
  .description("Generate semantic embeddings for memory chains")
  .option("-c, --chain <chains>", "Comma-separated list of chains")
  .option("--since <date>", "Only process blocks newer than date (YYYY-MM-DD)")
  .option("--limit <n>", "Max blocks per chain")
  .option("--force", "Rebuild embeddings even if cached")
  .option("--dry-run", "Show actions without writing artifacts")
  .option("--report", "Show coverage report and exit")
  .action(async (opts) => {
    await embedCommand({
      chain: opts.chain,
      since: opts.since,
      limit: opts.limit,
      force: opts.force,
      dryRun: opts.dryRun,
      report: opts.report,
    });
  });

program
  .command("recall <scopeOrKeyword> [query]")
  .description("Recall memory (keyword search) or decisions")
  .option("-c, --chain <chain>", "Search specific chain")
  .option("-t, --type <type>", "Filter by type (journal/ask/decision/system)")
  .option("-l, --limit <n>", "Max results")
  .option("--tag <tag>", "Filter by tag")
  .option("--since <time>", "Time window, e.g. 14d, 2w, 2026-01-01")
  .option("--until <time>", "Until date")
  .option("--project", "Current project only (for decisions)")
  .option("--all", "All projects (for decisions)")
  .option("-j, --json", "Output JSON")
  .option("--include-vault", "Include vault in search")
  .action((scopeOrKeyword: string, query: string | undefined, options: any) => {
    recallCommand(scopeOrKeyword, query, options);
  });

program
  .command("status")
  .description("Show Memphis status")
  .option("-j, --json", "Output JSON")
  .option("-v, --verbose", "Show detailed info")
  .action((opts) => {
    statusCommand({ json: opts.json, verbose: opts.verbose });
  });

const workspaceProgram = program
  .command("workspace")
  .description("Manage workspaces");

workspaceProgram
  .command("list")
  .description("List configured workspaces")
  .action(() => {
    const { config, workspace } = createWorkspaceStore();
    console.log();
    console.log(chalk.bold("  Workspaces:"));
    console.log(chalk.dim("    * marks the active workspace"));

    for (const def of config.security.workspaces) {
      const marker = def.id === workspace.id ? chalk.green("  *") : "   ";
      const label = def.label ?? "";
      const allowed = def.allowedChains?.includes("*")
        ? "all"
        : def.allowedChains?.join(", ") || "(defaults)";
      const includeDefault = def.includeDefault ? "yes" : "no";
      console.log(`${marker} ${chalk.cyan(def.id)} ${chalk.gray(label)} — allowed: ${allowed} — includeDefault: ${includeDefault}`);
    }
    console.log();
  });

workspaceProgram
  .command("set <id>")
  .description("Set the active workspace")
  .action((id: string) => {
    const { config } = createWorkspaceStore();
    if (!config.security.workspaceMap[id]) {
      console.log(chalk.red(`Workspace '${id}' is not defined in config.`));
      process.exit(1);
    }
    writeWorkspaceSelection(id);
    console.log(chalk.green(`Workspace set to '${id}'.`));
    console.log(chalk.gray(`Persisted at ${getWorkspaceSelectionFilePath()}`));
  });

program
  .command("verify")
  .description("Verify chain integrity")
  .option("-c, --chain <chain>", "Verify specific chain only")
  .option("-j, --json", "Output JSON")
  .option("-v, --verbose", "Show detailed errors")
  .action((opts) => {
    verifyCommand({
      chain: opts.chain,
      json: opts.json,
      verbose: opts.verbose,
    });
  });

program
  .command("repair")
  .description("Repair chain integrity (safe mode - quarantine damaged blocks)")
  .option("-c, --chain <chain>", "Repair specific chain only")
  .option("-d, --dry-run", "Show what would be done without making changes")
  .option("-j, --json", "Output JSON")
  .action((opts) => {
    repairCommand({
      chain: opts.chain,
      dryRun: opts.dryRun,
      json: opts.json,
    });
  });

program
  .command("decide")
  .description("Record a decision (conscious or inferred)")
  .argument("<title>", "Decision title (what did you decide?)")
  .argument("<chosen>", "What did you choose?")
  .option("-o, --options <options>", "Options considered (pipe-separated, e.g. A|B|C)", "")
  .option("-r, --reasoning <reasoning>", "Why did you choose this?", "")
  .option("-s, --scope <scope>", "Impact scope: personal|project|life", "project")
  .option("-m, --mode <mode>", "Mode: conscious|inferred", "conscious")
  .option("-c, --confidence <n>", "Confidence 0-1", "1")
  .option("-l, --links <links>", "Related decision IDs (pipe-separated)", "")
  .option("-e, --evidence <evidence>", "Evidence refs for inferred (pipe-separated)", "")
  .action((title: string, chosen: string, opts: any) => {
    decideCommand(title, {
      options: opts.options,
      chosen,
      why: opts.reasoning,
      scope: opts.scope,
      mode: opts.mode,
      confidence: opts.confidence,
      links: opts.links,
      evidenceRefs: opts.evidence,
    });
  });

program
  .command("show")
  .description("Show a decision by ID")
  .argument("<kind>", "decision")
  .argument("<id>", "Decision ID or record ID")
  .action((kind, id) => {
    showCommand(kind, id);
  });

program
  .command("revise")
  .description("Revise a decision (creates new block)")
  .argument("<decisionId>", "Decision ID to revise")
  .option("-r, --reasoning <reasoning>", "New reasoning")
  .action((decisionId, opts) => {
    reviseCommand(decisionId, { reason: opts.reasoning || "" });
  });

program
  .command("reflect")
  .description("Surface unresolved and stale decisions")
  .option("-j, --json", "Output JSON")
  .option("--stale-days <n>", "Days before decision is considered stale", "30")
  .action((opts) => {
    const parsed = parseInt(opts.staleDays, 10);
    reflectCommand({
      json: opts.json,
      staleDays: Number.isFinite(parsed) ? parsed : undefined,
    });
  });

program
  .command("vault")
  .description("Manage encrypted secrets (SSI Vault)")
  .argument("<action>", "init | add | list | get | delete | export")
  .argument("[key]", "Secret key name")
  .argument("[value]", "Secret value")
  .option("--password-env <var>", "Read vault password from environment variable (recommended for scripts)")
  .option("--password-stdin", "Read vault password from stdin (recommended for scripts)")
  .option("-j, --json", "Output JSON metadata (export only)")
  .action(async (action, key, value, opts) => {
    await vaultCommand({
      action,
      key,
      value,
      passwordEnv: opts.passwordEnv,
      passwordStdin: opts.passwordStdin,
      json: opts.json,
    });
  });

program
  .command("agent")
  .description("Manage agents (autosave, openclaw)")
  .argument("<action>", "start | stop | status | openclaw | collab")
  .argument("[subaction...]", "Optional subcommand and arguments")
  .option("-i, --interval <time>", "Interval for autosave (e.g., 5m)")
  .action(async (action, subactionArgs, opts) => {
    if (action === "openclaw" || action === "collab") {
      // subactionArgs is now an array of strings
      runOpenClawCommands(subactionArgs || []);
    } else {
      await agentCommand(action, { interval: opts.interval });
    }
  });

program
  .command("bot")
  .description("Run Telegram bot for Memphis")
  .argument("[action]", "start | webhook", "start")
  .action(botCommand);

const shareProgram = program
  .command("share")
  .description("Share and sync Memphis blocks");

shareProgram
  .command("plan")
  .description("Dry-run diff of outgoing/incoming share blocks")
  .option("-j, --json", "Output JSON")
  .option("-c, --chain <chain>", "Filter by chain")
  .action(async (opts) => {
    await sharePlanCommand({
      json: opts.json,
      chain: opts.chain,
    });
  });

program
  .command("tui")
  .description("Launch the terminal UI")
  .option("-s, --screen <screen>", "Open specific screen (dashboard, journal, vault, recall, ask, openclaw, settings)")
  .action((opts) => {
    const tui = new MemphisTUI();
    // If screen specified, navigate to it after a brief delay
    if (opts.screen) {
      setTimeout(() => {
        const screenMap: Record<string, number> = {
          dashboard: 1,
          journal: 2,
          vault: 3,
          recall: 4,
          ask: 5,
          openclaw: 6,
          settings: 7,
        };
        const screenNum = screenMap[opts.screen.toLowerCase()];
        if (screenNum) {
          // Access the navigateToMenu method via the instance
          (tui as any).navigateToMenu(screenNum);
        }
      }, 500);
    }
    tui.run();
  });

// Summarize command
import { autosummarize, shouldTriggerAutosummary } from "../core/autosummarizer.js";

program
  .command("summarize")
  .description("Create or check autosummary")
  .option("--dry-run", "Show what would be summarized without saving")
  .option("--force", "Force summary creation regardless of block count")
  .option("--llm", "Use LLM for narrative summary (requires Ollama)")
  .option("--blocks <n>", "Trigger after N new blocks (default: 50)")
  .action(async (opts) => {
    const { guard } = createWorkspaceStore();
    const threshold = parseInt(opts.blocks) || 50;
    
    if (!opts.force && !shouldTriggerAutosummary(guard, threshold)) {
      console.log(`Not enough new blocks (need ${threshold})`);
      console.log(`Use --force to create anyway`);
      return;
    }
    
    try {
      const result = await autosummarize(guard, {
        useLLM: opts.llm,
        dryRun: opts.dryRun,
      });
      
      if (opts.dryRun) {
        console.log("=== DRY RUN - Summary that would be created ===");
        console.log(result.summary);
      } else if (result.block) {
        console.log(`✓ Summary created: summary#${String(result.block.index).padStart(6, "0")}`);
        console.log(`  Range: ${result.summary.range.from} → ${result.summary.range.to}`);
        console.log(`  Stats: ${result.summary.stats.journal} journal, ${result.summary.stats.ask} ask, ${result.summary.stats.decisions} decisions`);
      }
    } catch (err) {
      console.error("Summary failed:", err);
    }
  });

program.parse();

process.on("exit", () => dumpActiveHandles("exit"));
process.on("SIGINT", () => { dumpActiveHandles("SIGINT"); process.exit(130); });
process.on("SIGTERM", () => { dumpActiveHandles("SIGTERM"); process.exit(143); });
