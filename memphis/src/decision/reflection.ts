import { Store } from "../memory/store.js";
import { safeParseDecisionV1, type DecisionV1 } from "./decision-v1.js";

export interface ReflectionResult {
  stale: DecisionV1[];
  unresolved: DecisionV1[];
  contradicted: DecisionV1[];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function normalizeStaleDays(value?: number): number {
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) {
    return Math.floor(n);
  }
  return 30;
}

function isOlderThan(dateIso: string | undefined, thresholdMs: number): boolean {
  if (!dateIso) return false;
  const timestamp = Date.parse(dateIso);
  if (Number.isNaN(timestamp)) return false;
  return timestamp <= thresholdMs;
}

function confidenceValue(decision: DecisionV1): number {
  return typeof decision.confidence === "number" ? decision.confidence : 1;
}

export function reflectOnDecisions(store: Store, opts?: { staleDays?: number }): ReflectionResult {
  const staleDays = normalizeStaleDays(opts?.staleDays);
  const staleThreshold = Date.now() - staleDays * MS_PER_DAY;

  const reflection: ReflectionResult = {
    stale: [],
    unresolved: [],
    contradicted: [],
  };

  const blocks = store.readChain("decisions");

  for (const block of blocks) {
    const data = block?.data;
    if (!data || data.type !== "decision" || typeof data.content !== "string") continue;

    const parsed = safeParseDecisionV1(data.content);
    if (!parsed.ok) continue;

    const decision = parsed.value;

    if ((decision.status ?? "active") === "active" && isOlderThan(decision.createdAt, staleThreshold)) {
      reflection.stale.push(decision);
    }

    if ((decision.mode ?? "conscious") === "inferred" && confidenceValue(decision) < 0.5) {
      reflection.unresolved.push(decision);
    }

    if ((decision.status ?? "active") === "contradicted") {
      reflection.contradicted.push(decision);
    }
  }

  return reflection;
}
