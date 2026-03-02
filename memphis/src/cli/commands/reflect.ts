import chalk, { type ChalkInstance } from "chalk";
import { reflectOnDecisions, type ReflectionResult } from "../../decision/reflection.js";
import type { DecisionV1 } from "../../decision/decision-v1.js";
import { createWorkspaceStore } from "../utils/workspace-store.js";

interface ReflectCommandOptions {
  json?: boolean;
  staleDays?: number;
}

function decisionLabel(decision: DecisionV1): string {
  const createdDate = new Date(decision.createdAt);
  const created = Number.isNaN(createdDate.getTime()) ? decision.createdAt : createdDate.toISOString().slice(0, 10);
  const id = decision.recordId?.slice(0, 6) ?? decision.decisionId.slice(0, 6);
  const scope = decision.scope ? chalk.gray(` [${decision.scope}]`) : "";
  const mode = decision.mode === "inferred" ? chalk.magenta(" inferred") : "";
  return `${chalk.cyan(id)} ${chalk.bold(decision.title)}${scope}${mode} ${chalk.gray(`@ ${created}`)}`;
}

function printSection(label: string, items: DecisionV1[], color: ChalkInstance, extra?: (decision: DecisionV1) => string) {
  if (items.length === 0) {
    console.log(color.dim(`${label}: none`));
    return;
  }

  console.log(color.bold(`\n${label} (${items.length})`));
  for (const decision of items) {
    let line = `  • ${decisionLabel(decision)}`;
    if (extra) {
      const appendix = extra(decision);
      if (appendix) line += chalk.gray(` — ${appendix}`);
    }
    console.log(line);
  }
}

export function reflectCommand(options: ReflectCommandOptions) {
  const { guard } = createWorkspaceStore();
  const result = reflectOnDecisions(guard, { staleDays: options.staleDays });

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  printReport(result, options.staleDays);
}

function printReport(result: ReflectionResult, staleDays?: number) {
  const total = result.stale.length + result.unresolved.length + result.contradicted.length;
  const header = chalk.bold(`\n🪞 Decision reflection${staleDays ? ` (stale>${staleDays}d)` : ""}`);
  console.log(header);

  if (total === 0) {
    console.log(chalk.green("All clear — no stale, unresolved, or contradicted decisions found."));
    return;
  }

  printSection("Stale active decisions", result.stale, chalk.yellow);
  printSection(
    "Unresolved inferred decisions",
    result.unresolved,
    chalk.blue,
    (d) => `confidence ${(d.confidence ?? 1).toFixed(2)}`
  );
  printSection("Contradicted decisions", result.contradicted, chalk.red);
}
