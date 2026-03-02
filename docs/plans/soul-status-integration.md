# SOUL Status Integration – Spec

_Last updated: 2026-02-28 09:15 CET_

## 1. Goal
Provide a first-class "SOUL status" surface that answers two questions at a glance:
1. **Am I acting in line with SOUL.md?** (Core Truths, Boundaries, Autonomy rules)
2. **Is the autonomy loop healthy?** (heartbeat cadence, share-sync, autosummaries, replicator, semantic recall)

The status must be consumable both programmatically (heartbeat responses, CLI) and visually (Memphis TUI).

## 2. Scope
### 2.1 CLI command
- `memphis soul status`
- Outputs structured JSON (default) + pretty table option (`--pretty`).
- Sections:
  - **Identity snapshot:** timestamp, active agent (Style/Watra), SOUL version hash.
  - **Core loops:** last updates of HEARTBEAT.md, SOUL.md, USER.md.
  - **Autonomy signals:** timestamps from `logs/heartbeat-state.json` (share-sync, autosummary, semanticRecall, etc.).
  - **Tasks queue:** first 5 entries from `tasks/QUEUE.md` with status.
  - **Alerts:** derived from rules (e.g., if memphisShareSync > 18h → alert, if HEARTBEAT.md missing tasks → warn).
- Exit code non-zero when alerts exist (useful for CI/heartbeat fallback scripts).

### 2.2 TUI integration
- New sidebar entry `10 SOUL` (hotkey e.g. `s` or `10`).
- Screen renders the same data as CLI but condensed:
  - header with SOUL core truths
  - table of autonomy signals (share-sync, autosummary, semantic recall, replicator)
  - task queue preview
  - alerts highlighted in red
- Dashboard widget (top-right) showing emoji indicator: `{green}SOUL OK{/green}` or `{red}SOUL needs attention{/red}` based on alerts.

### 2.3 Heartbeat hook
- Heartbeat script imports `soulStatus()` from shared module.
- If alerts exist, heartbeat response summarises top 2 alerts instead of HEARTBEAT_OK.
- Optionally append `soulStatus.summary` into `memory/<date>.md` for audit.
- **Implementation note:** use `scripts/memphis-soul-status.sh` to trigger the hook from the OpenClaw workspace. It proxies to the Memphis CLI (via `$MEMPHIS_CLI_DIR`, default `~/memphis`), stores raw JSON in `logs/soul-status/`, copies `latest.json`, updates `logs/heartbeat-state.json.soulStatus`, and appends alert summaries to `memory/YYYY-MM-DD.md`.

## 3. Data sources
| Signal | Source | Notes |
|--------|--------|-------|
| SOUL version | `git hash SOUL.md` or checksum | detect drift |
| Tasks queue | `tasks/QUEUE.md` | parse `[ ]` vs `[x]` |
| Heartbeat state | `logs/heartbeat-state.json` | fields: `memphisShareSync`, `memphisAutosummary`, (add) `semanticRecall`, `soulStatus` |
| Recent share manifests | `~/.memphis/share-manifest/index.jsonl` | count local vs remote entries |
| Semantic embeddings | `~/.memphis/embeddings` metadata | optional flag once embed job runs |
| Config freshness | mtime of `SOUL.md`, `HEARTBEAT.md`, `USER.md` |

## 4. Implementation plan
1. **Shared module** `src/soul/status.ts`
   - Functions: `collectSoulStatus({ workspaceRoot })` → `{ ok, alerts[], signals, queue }`
   - Handles file IO + heuristics.
2. **CLI command** `src/cli/commands/soul-status.ts`
   - Imports module, prints JSON/pretty.
3. **TUI screen** `src/tui/screens/soul.ts`
   - Reuses `collectSoulStatus` (no duplicated parsing).
   - Register in `SCREEN_NAMES`, KEY map, router.
4. **Dashboard widget**
   - Update `renderDashboard` to call `collectSoulStatus` once and display summary.
5. **Heartbeat integration**
   - Extend `scripts/heartbeat.sh` (or equivalent) to call `memphis soul status --json`.
   - If `ok === false`, include alerts in heartbeat reply + log to `memory/YYYY-MM-DD.md`.
6. **State tracking**
   - On every `collectSoulStatus` call, update `logs/heartbeat-state.json.soulStatus`.

## 5. Alert rules (initial)
- `memphisShareSync` older than 18h → "Share-sync stale".
- `memphisAutosummary` older than 12h → "Autosummary stale".
- `semanticRecall` missing or >12h since last embed run → "Semantic recall not refreshed".
- Tasks queue empty → warn (no work queued).
- HEARTBEAT.md empty → warn (no heartbeat instructions).
- SOUL.md older than 7 days → remind to revisit.

## 6. Definition of Done
- CLI + TUI surfaces functional.
- Alerts trigger correctly (verified by manipulating timestamps).
- Heartbeat loop uses new module and reduces manual checks.
- Docs updated: `docs/plans/soul-status-integration.md` (this file) + section in `README`/`memphis-heart-plan` describing usage.
- Added unit tests for parser (e.g., `tests/soul-status.spec.ts`).

## 7. Open Questions
- Should we enforce authentication/obfuscation before printing SOUL content? (For now assume local trust.)
- Do we need a REST/gRPC endpoint for other agents? (Out of scope MVP.)
- How to persist additional metrics (maybe reuse `share-manifest` chain?). TBD after MVP.

## 8. Heartbeat Script Usage
- Run `./scripts/memphis-soul-status.sh` from the OpenClaw workspace (or wire it into cron/heartbeat automation).
- Environment overrides:
  - `MEMPHIS_CLI_DIR` – path to the Memphis CLI checkout/binary (defaults to `./memphis-code`).
  - `MEMPHIS_CLI_BIN` – command used to invoke the CLI (defaults to `node dist/cli/index.js`).
- Outputs:
  - JSON snapshot saved to `logs/soul-status/<date>.log` and `logs/soul-status/latest.json`.
  - `logs/heartbeat-state.json` receives an updated `soulStatus` timestamp (handled by the CLI collector).
  - If alerts are present, a short entry is appended to `memory/YYYY-MM-DD.md` for audit.
- Script exit code mirrors the CLI: non-zero when alerts elevate exit status or when the command fails.
