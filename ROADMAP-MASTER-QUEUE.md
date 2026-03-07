# ROADMAP-MASTER-QUEUE.md — Full Execution Queue

Status: ACTIVE
Mode: strict sequential (heartbeat-driven)
Updated: 2026-03-05 21:52 CET

## Rules of execution
- Na heartbeat: max 1 chunk (20-30 min).
- Zawsze realizuj **pierwszy odblokowany** task `[ ]`.
- Nie przeskakuj zależności.
- Po zakończeniu: oznacz `[x]` + dopisz 1-3 linie do Progress Log.
- Jeśli blocker: oznacz `BLOCKED` i wpisz konkretny powód.

---

## Milestone M0 (DONE)
- ✅ Faza 1: LOGS ON CHAIN
- ✅ Faza 2: EXEC CHAIN
- ✅ Faza 3: SYSTEM MANAGEMENT
- ✅ Faza 4: BOT INTEGRATION
- ✅ Faza 7: ACCESS CONTROL

---

## Milestone M1 — Sprint 4 (Faza 9: Integration Automation)

### 9.1 Autorecall + Auto-Journaling
- [x] **RM-001** Spec hooka autorecall (wejście/wyjście, fallback)
- [x] **RM-002** Implementacja MVP autorecall before-response
- [x] **RM-003** Testy timeout/fail-open (odpowiedź nie może wisieć)
- [x] **RM-004** Reguły auto-journaling (co logować / czego nie)
- [x] **RM-005** Trigger auto-journaling + tag policy

### 9.2 Share-Sync Automation
- [x] **RM-006** Projekt cron/systemd + ścieżki logów
- [x] **RM-007** Wdrożenie harmonogramu co 30 min
- [x] **RM-008** Retry + anti-spam alert policy

### 9.3 Backup & Recovery
- [x] **RM-009** Podpięcie backup do night heartbeat
- [x] **RM-010** Restore checklist + test restore (dry-run + real test)

### 9.4 Custom Chain Helper
- [x] **RM-011** Spec `memphis chain add <name>` + walidacje
- [x] **RM-012** Implementacja helpera + smoke test

### 9.5 Embedding Coverage Monitor
- [x] **RM-013** Liczenie coverage embeddings per chain
- [x] **RM-014** Raport + threshold alert

### Sprint closure
- [x] **RM-015** Zamknięcie Sprint 4 (ROADMAP + MEMORY + changelog)

---

## Milestone M2 — Faza 5 (Dashboard Lite, opcjonalny ale gotowy do realizacji)
- [x] **RM-016** Decyzja stacku (Fastify/Express + prosty frontend)
- [x] **RM-017** Backend: `/status` + `/health`
- [x] **RM-018** Backend: `/logs` (tail + filter)
- [x] **RM-019** Backend: `/exec` (read-only history)
- [x] **RM-020** Frontend Lite: status + log stream
- [x] **RM-021** Auth: gateway token + owner-only access
- [x] **RM-022** Smoke tests + docs uruchomienia

---

## Milestone M3 — Faza 6 (Notifications)
- [x] **RM-023** Bot notifications service (critical/error)
- [x] **RM-024** Dedupe/rate limit (anti-spam)
- [x] **RM-025** Szablony wiadomości + severity levels
- [x] **RM-026** Email notifications (opcjonalny skeleton)
- [x] **RM-027** Daily digest + test end-to-end

---

## Milestone M4 — Faza 8 (Advanced Features)
- [x] **RM-028** Advanced logs: search
- [x] **RM-029** Advanced logs: export JSON/CSV + stats
- [x] **RM-030** Advanced exec: PTY support
- [x] **RM-031** Advanced exec: process tree + resource limits
- [x] **RM-032** Automation: cron job management commands
- [x] **RM-033** Monitoring: container integration
- [x] **RM-034** Monitoring: service control safeguards
- [x] **RM-035** Final hardening + full docs + release checklist

---

## Milestone M5 — Codex Cost Ops (new)
- [x] **RM-036** Ujednolicenie ścieżek codex-cost-ops (docs + workflow + README links)
- [x] **RM-037** Integracja wyboru modelu z lokalnym runbookiem (`dashboard-lite` / ops scripts)
- [x] **RM-038** Telemetria kosztowa (log: model/tokeny/minuty kontenera) + weekly retro template
- [x] **RM-039** Guardrails budżetowe (progi 80/90% + automatyczny fallback 5.1 + chunk policy)
- [x] **RM-040** Smoke test dla codex-usage pipeline (local + CI dry-run)

## Milestone M6 — Distributed Gateway MVP (OpenClaw + Memphis)
- [x] **RM-041** Kontrakty eventów v1 (`cmd.*`, `evt.*`, `sys.*`) + payload schema
- [x] **RM-042** Minimalny state machine (`job/task/run/lease`) + lifecycle rules
- [x] **RM-043** Node registry + heartbeat (`evt.node.heartbeat`) + capability model
- [x] **RM-044** Lease timeout/retry/dead-letter policy (MVP)
- [x] **RM-045** File lock MVP (path-level) + conflict strategy
- [x] **RM-046** E2E flow MVP: `issue -> plan -> execute -> review -> repair -> done`
- [x] **RM-047** Routing matrix ról→providerów (Claude/Codex/MiniMax) + fallback rules
- [x] **RM-048** Smoke test distributed (2-node simulation + failure case)

## Milestone M7 — Distributed Runtime Implementation (from M6 specs)
- [x] **RM-049** Runtime skeleton gateway (`gateway-runtime/`) + module boundaries (api/orchestrator/state/events/scheduler/registry)
- [x] **RM-050** Event envelope validator + subject router (`cmd/evt/sys`) wired to M6 contracts
- [x] **RM-051** In-memory state store MVP (`job/task/run/lease`) with lifecycle guards
- [x] **RM-052** Node registry service + heartbeat monitor with online/degraded/offline transitions
- [x] **RM-053** Lease manager + retry engine + dead-letter sink
- [x] **RM-054** Path-level lock manager + blocked-task handling
- [x] **RM-055** E2E simulation runner (`issue->plan->execute->review->repair->done`) using mock nodes
- [x] **RM-056** Runtime smoke (`npm run smoke:distributed-runtime`) + quickstart docs

## Milestone M8 — Single-Node Degraded Mode (PC2 offline)
- [x] **RM-057** Degraded scheduling mode (`executor` missing => `deferred` queue, no hard fail)
- [x] **RM-058** Local fallback executor lane on PC1 (small-task policy)
- [x] **RM-059** Rejoin script for node-b (`register + heartbeat + sanity`)
- [x] **RM-060** Backlog replay on node-b return (deferred -> queued)
- [x] **RM-061** Offline/Online smoke flow (`offline defer -> online resume`)

## Progress Log
- 2026-03-05 21:52 CET — Full roadmap queue initialized.
- 2026-03-05 21:56 CET — RM-001 DONE: przygotowano spec hooka autorecall (`RM-001-AUTORECALL-SPEC.md`) z I/O, timeoutem i fail-open.
- 2026-03-05 21:59 CET — RM-002 DONE: wdrożono MVP autorecall w `bot-group.ts` (hook przed każdym `ask` dla /ask + wiadomości bez komendy).
- 2026-03-05 22:00 CET — RM-003 DONE: dodano testy timeout/fail-open (`RM-003-AUTORECALL-TEST.ts`) i uruchomiono `npx tsx RM-003-AUTORECALL-TEST.ts` (PASS).
- 2026-03-05 22:28 CET — RM-004 DONE: zdefiniowano reguły auto-journaling (`RM-004-AUTO-JOURNALING-RULES.md`) z ALLOW/DENY, tag policy i dedup/safety guard.
- 2026-03-05 22:36 CET — RM-005 DONE: wdrożono trigger auto-journaling w `bot-group.ts` (heurystyki ALLOW/DENY, tag policy, dedup 60 min, redakcja danych wrażliwych).
- 2026-03-05 22:58 CET — RM-006 DONE: przygotowano projekt schedulera share-sync (`RM-006-SHARE-SYNC-SCHEDULER-DESIGN.md`) z systemd timer + fallback cron, log paths i lock strategy.
- 2026-03-05 23:28 CET — RM-007 BLOCKED: wdrożenie timera wykonane technicznie, ale wyłączone (disabled) po błędzie Memphis CLI `ERR_MODULE_NOT_FOUND` (`src/cli/chains/log.js`); harmonogram nie może działać stabilnie do fixu CLI.
- 2026-03-05 23:34 CET — RM-007 DONE: naprawiono importy CLI (`cli/commands/log` + `chains/log`) i wdrożono aktywny timer `memphis-share-sync.timer` co 30 min (service non-fatal, logi w `~/.memphis/logs/`).
- 2026-03-05 23:38 CET — RM-008 DONE: wdrożono retry + anti-spam policy w `memphis/scripts/share-sync-runner.sh` (3 próby, backoff 10/20s, semantic-failure detection, alert cooldown 2h + state file).
- 2026-03-05 23:56 CET — RM-009 DONE: backup podpięty do night heartbeat (`memphis/scripts/night-backup-heartbeat.sh`, stateful once-per-night, lock + logs) i przetestowany (backup utworzony).
- 2026-03-06 00:27 CET — RM-010 DONE: wykonano restore checklist + test restore (`RM-010-RESTORE-CHECKLIST.md`), dry-run OK i real restore test do `/tmp/memphis-restore-test-1772753162`.
- 2026-03-06 00:57 CET — RM-011 DONE: przygotowano spec custom chain helper (`RM-011-CHAIN-ADD-SPEC.md`) z walidacją nazw, reserved names i metadata schema.
- 2026-03-06 01:26 CET — RM-012 DONE: zaimplementowano `memphis chain add <name>` w `src/cli/index.ts` + smoke test (create/idempotent/invalid) dla `projekt_x_hb`.
- 2026-03-06 01:56 CET — RM-013 DONE: wdrożono licznik coverage embeddings per-chain (`memphis/scripts/embedding-coverage-report.sh`) + raporty `~/.memphis/logs/embedding-coverage.{json,txt}`.
- 2026-03-06 02:26 CET — RM-014 DONE: wdrożono threshold alert (`memphis/scripts/embedding-coverage-alert.sh`) z cooldown state + integrację z heartbeat (Priority 4).
- 2026-03-06 02:58 CET — RM-015 DONE: Sprint 4 formally closed (ROADMAP+MEMORY+CHANGELOG), changelog saved as `SPRINT-4-CHANGELOG.md`.
- 2026-03-06 03:27 CET — RM-016 DONE: podjęto decyzję stacku Dashboard Lite (`RM-016-DASHBOARD-STACK-DECISION.md`): Fastify + Vanilla HTML/HTMX.
- 2026-03-06 03:56 CET — RM-017 DONE: utworzono backend Fastify (`dashboard-lite/server.mjs`) z endpointami `/health` i `/status`, zweryfikowane lokalnie curl.
- 2026-03-06 11:25 CET — RM-018 DONE: dodano endpoint `/logs` (tail + filter: `file`, `level`, `contains`, limit `tail<=500`) z odczytem z `~/.memphis/logs/*.log`, zweryfikowane curl na porcie testowym 8788.
- 2026-03-06 11:58 CET — RM-019 DONE: dodano endpoint `GET /exec` (read-only history z `~/.memphis/logs/dashboard-exec-history.jsonl`) z filtrami `tail/status/contains`.
- 2026-03-06 12:00 CET — RM-020 DONE: dodano Frontend Lite na `/` (auto-refresh status + stream logów co 5s, token z `localStorage`).
- 2026-03-06 12:02 CET — RM-021 DONE: wdrożono auth (`DASHBOARD_TOKEN`) + owner-only guard localhost (`DASHBOARD_OWNER_ONLY=1`) dla endpointów poza `/health`.
- 2026-03-06 12:05 CET — RM-022 DONE: przygotowano smoke test `dashboard-lite/smoke-test.mjs` + docs uruchomienia (`dashboard-lite/README.md`), test PASS (`SMOKE_OK`).
- 2026-03-06 12:08 CET — RM-023 DONE: uruchomiono notification service (`POST /notify`, log `dashboard-alerts.log`, opcjonalny webhook `MEMPHIS_BOT_WEBHOOK`).
- 2026-03-06 12:09 CET — RM-024 DONE: dodano dedupe/rate-limit dla alertów (state `~/.memphis/state/dashboard-notify-dedupe.json`, cooldown konfigurowalny env).
- 2026-03-06 12:11 CET — RM-025 DONE: wdrożono szablony wiadomości + severity (`info/error/critical`) z ustandaryzowanym tytułem `[SEVERITY] CODE`.
- 2026-03-06 12:12 CET — RM-026 DONE: dodano email notifications skeleton (bridge logujący do `dashboard-email-skeleton.log` przy ustawionym `DASHBOARD_NOTIFY_EMAIL_TO`).
- 2026-03-06 12:14 CET — RM-027 DONE: wdrożono daily digest (`POST /digest/daily`) z agregacją logów + powiadomieniem, stan digestu w `~/.memphis/state/dashboard-digest-state.json`.
- 2026-03-06 12:17 CET — RM-028 DONE: advanced logs search przez `GET /logs/search` (substring/regex, limit, file filter, truncation flag).
- 2026-03-06 12:19 CET — RM-029 DONE: advanced logs export/statystyki przez `GET /logs/export?format=json|csv` (stats: files/lines/generatedAt).
- 2026-03-06 12:22 CET — RM-030 DONE: advanced exec z flagą PTY (`POST /exec/run` + `pty=true`, `TERM=xterm-256color`, timeout i cap output).
- 2026-03-06 12:25 CET — RM-031 DONE: dodano process visibility + limity zasobów (`/exec/processes`, max running procs, timeout, process tree snapshot w historii).
- 2026-03-06 12:28 CET — RM-032 DONE: wdrożono automatyzację cron (`/cron/list`, `/cron/add`, `/cron/remove`) z podstawową walidacją.
- 2026-03-06 12:31 CET — RM-033 DONE: monitoring kontenerów przez `GET /monitor/containers` (integracja z `docker ps`, graceful fallback).
- 2026-03-06 12:34 CET — RM-034 DONE: service control safeguards (`POST /service/control`: allowlist usług, dry-run default, required confirmation dla mutacji).
- 2026-03-06 12:36 CET — RM-035 DONE: final hardening + docs/release checklist w `dashboard-lite/README.md`, pełny smoke test całej ścieżki PASS.
- 2026-03-06 13:12 CET — RM-036 DONE: dodano aktywny workflow `.github/workflows/codex-usage.yml` (ścieżka `docs/codex-cost-ops/scripts/...`) + ujednolicono README codex-cost-ops względem lokalizacji docs/template.
- 2026-03-06 13:18 CET — RM-037 DONE: dodano `dashboard-lite/codex-preflight.sh` (wrapper do `docs/codex-cost-ops/scripts/select-codex-model.sh`, output pod `eval`, log do `~/.memphis/logs/codex-usage.log`) + uzupełniono `dashboard-lite/README.md` o lokalny runbook.
- 2026-03-06 13:24 CET — RM-038 DONE: dodano `dashboard-lite/codex-log-usage.sh` (telemetria model/tokeny/minuty/task do `~/.memphis/logs/codex-usage.log`) + template retrospektywy `docs/codex-cost-ops/WEEKLY_RETRO_TEMPLATE.md` + aktualizacje README.
- 2026-03-06 15:31 CET — RM-039 DONE: dodano guardrails budżetowe 80/90 w `select-codex-model.sh` (`BUDGET_PCT_USED`, `CODEX_CHUNK_POLICY`, `CODEX_BUDGET_GUARDRAIL`) + integrację wejścia/wyjść w `.github/workflows/codex-usage.yml` + update docs/prompts; testy selectora i YAML PASS.
- 2026-03-06 15:35 CET — RM-040 DONE: dodano `docs/codex-cost-ops/scripts/smoke-codex-usage.sh` (local+CI dry-run checks: selector baseline/80/90 + workflow bindings) i wykonano test `SMOKE_CODEX_USAGE_OK`; README codex-cost-ops uzupełniony o procedurę smoke.
- 2026-03-06 15:47 CET — RM-041 DONE: przygotowano spec kontraktów eventów v1 (`RM-041-EVENT-CONTRACTS-V1.md`) z subject taxonomy (`cmd/evt/sys`), wspólną kopertą eventu, payload schemas i zasadami walidacji/versioningu.
- 2026-03-06 16:06 CET — RM-042 DONE: przygotowano spec minimalnego state machine (`RM-042-STATE-MACHINE-MVP.md`) dla encji `job/task/run/lease`, z transition rules, invariantami, retry/backoff i mapowaniem eventów.
- 2026-03-06 17:46 CET — RM-043..RM-047 DONE: przygotowano komplet specyfikacji Distributed Gateway MVP (`RM-043..RM-047`) obejmujący node registry+heartbeat, lease/retry/dead-letter, file lock MVP, E2E workflow i routing matrix ról→providerów.
- 2026-03-06 17:47 CET — RM-048 DONE: dodano smoke test `docs/codex-cost-ops/scripts/smoke-distributed-mvp.sh` i wykonano `SMOKE_DISTRIBUTED_MVP_OK`.
- 2026-03-06 17:57 CET — RM-049 DONE: utworzono skeleton `gateway-runtime/` z modułami `api/orchestrator/state/events/scheduler/registry` + smoke `gateway-runtime/scripts/smoke-runtime.mjs` (`SMOKE_GATEWAY_RUNTIME_OK`).
- 2026-03-06 20:30 CET — RM-050 DONE: wdrożono walidację koperty eventu + subject router (`gateway-runtime/src/events/contracts.mjs`, `router.mjs`, integracja w `bus.mjs`) oraz smoke `scripts/smoke-rm050.mjs` (`SMOKE_RM050_OK`).
- 2026-03-06 20:44 CET — RM-051 DONE: rozbudowano `state/store.mjs` o encje `job/task/run/lease` i lifecycle guards (`state/lifecycle.mjs`) + smoke `scripts/smoke-rm051.mjs` (`SMOKE_RM051_OK`).
- 2026-03-06 20:31 CET — RM-052 DONE: wdrożono node registry z `ingestHeartbeat`/status transitions (`registry/index.mjs`, `registry/heartbeat.mjs`) oraz smoke `scripts/smoke-rm052.mjs` (`SMOKE_RM052_OK`).
- 2026-03-06 20:35 CET — RM-053 DONE: wdrożono `scheduler/lease-manager.mjs` (lease expiry sweep, retry backoff, dead-letter sink) + integrację w `scheduler/index.mjs` i smoke `scripts/smoke-rm053.mjs` (`SMOKE_RM053_OK`).
- 2026-03-06 21:42 CET — RM-054 DONE: wdrożono `scheduler/lock-manager.mjs` (acquire/release/sweep path-locks, owner checks, blocked conflict response) + integrację w scheduler tick i smoke `scripts/smoke-rm054.mjs` (`SMOKE_RM054_OK`).
- 2026-03-06 23:49 CET — RM-055 DONE: dodano `gateway-runtime/scripts/simulate-e2e.mjs` (mock nodes, pełny flow `issue->plan->execute->review->repair->done`) i zweryfikowano `npm run simulate:e2e`.
- 2026-03-06 23:49 CET — RM-056 DONE: dodano runtime smoke `scripts/smoke-distributed-runtime.mjs`, skrypt npm `smoke:distributed-runtime` i `gateway-runtime/README.md` (quickstart); wynik `SMOKE_DISTRIBUTED_RUNTIME_OK`.
- 2026-03-07 00:45 CET — RM-057 DONE: dodano degraded scheduling w `scheduler/index.mjs` (`queueExecution`, deferred queue, replay po recovery) + smoke `scripts/smoke-rm057.mjs` (`SMOKE_RM057_OK`).
- 2026-03-07 00:45 CET — RM-059 DONE: dodano `gateway-runtime/scripts/node-rejoin.sh` (register+heartbeat sanity payload + log do `~/.memphis/logs/node-rejoin.log`).
- 2026-03-07 03:59 CET — RM-058 DONE: dodano fallback executor lane na PC1 (`scheduler/fallback-executor.mjs`, integracja w `scheduler/index.mjs`), polityka small-task (`complexity<=3`) + smoke `scripts/smoke-rm058.mjs` (`SMOKE_RM058_OK`).
- 2026-03-07 05:08 CET — RM-060 DONE: wdrożono backlog replay po recovery (`state.replayDeferredToQueued`, integracja `scheduler.replayDeferredIfRecovered`), sortowanie po `deferred_at`, deduplikacja po `task_id/idempotency_key` + smoke `scripts/smoke-rm060.mjs` (`SMOKE_RM060_OK`).
- 2026-03-07 05:09 CET — RM-061 DONE: dodano full smoke offline/online resume (`scripts/smoke-rm061.mjs`) i rozszerzono `smoke:distributed-runtime` o RM-057/058/060/061; wynik końcowy `SMOKE_DISTRIBUTED_RUNTIME_OK`.
