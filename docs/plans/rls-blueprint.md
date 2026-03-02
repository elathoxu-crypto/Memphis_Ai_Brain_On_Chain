# RLS Blueprint — Phase 2 Kickoff (2026-02-28)

## 1. Problem & Context
- Phase 2 targets "Inter-AI Exchange". Daemon already mirrors git/shell/share blocks, and ShareCollector can now autopush CIDs.
- Without guardrails, any new collector (watch, trade, MCP) could leak private chains or tags.
- Synjar SPEC-001 introduced **Resource Labeling System (RLS)** per workspace. Memphis needs an equivalent to decide **who may read/write/export** each block.
- RLS must cover both **runtime actions** (daemon, share-sync, watch) and **manual commands** (memphis trade, future MCP server).

## 2. Terminology
| Term | Meaning |
|------|---------|
| Workspace | Logical context (e.g., `watra`, `style`, `guest`). Each Memphis process has `currentWorkspaceId`.
| Policy | YAML/JSON doc describing allowed chains/tags per workspace and per operation (read/write/export/import).
| Operation | `journal.append`, `share.push`, `share.pull`, `trade.export`, `trade.import`, `mcp.expose`, `collector.git`, `collector.shell`, etc.
| Guard | Runtime helper enforcing policy before an action executes.

## 3. File Layout
```
.memphis/
  config.yaml                # existing
  rls/
    policies.yaml            # main policy set
    cache.json               # compiled map (generated)
```
- CLI flag `--workspace <id>` overrides default (stored in `~/.memphis/rls/state.json`).
- Daemon reads workspace from state; collectors inherit unless overridden.

## 4. Policy Schema (YAML)
```yaml
version: 1
workspaces:
  - id: watra
    description: "Personal dev node"
    default: true
    allow:
      chains:
        journal:
          write: true
          export: false
          tags:
            include: ["share", "public"]
            exclude: ["vault", "secret"]
        share:
          write: true
          export: true
        vault:
          write: true
          export: false
      operations:
        share.push: { enabled: true, maxBlocks: 25 }
        share.pull: { enabled: true }
        collector.shell: { enabled: true, redactPatterns: ["password", "token"] }
        collector.share: { enabled: true, push: true }
  - id: guest
    description: "External agent"
    allow:
      chains:
        journal: { read: true, write: false, export: false }
      operations:
        share.push: { enabled: false }
```
- `chains.<name>` supports booleans for read/write, optional tag filters, size caps.
- `operations` lists fine-grained overrides.

## 5. Runtime Helpers
1. `src/security/rls.ts`
   - Load + validate policy (zod schema).
   - Expose `RlsPolicy`, `WorkspacePolicy`, `OperationGuard`.
   - Provide `getCurrentWorkspaceId()`, `setWorkspaceId(id)`.
   - Provide `assertChainAccess(chain, action, ctx)` and `assertOperation(op, ctx)`.
2. Cache compiled policy in `~/.memphis/rls/cache.json` with hash of source (avoid parsing on every call).
3. Provide `forWorkspace(workspaceId)` helper to temporarily switch inside CLI commands.

## 6. Enforcement Points
| Area | What to enforce |
|------|----------------|
| `Store.appendBlock` | Before writing, call `assertChainAccess(chain, "write", { tags, type, agent })`.
| `Store.readChain` / `ask`, `recall`, `graph` | Wrap with `assertChainAccess(chain, "read", ctx)`.
| `share-sync` export | Filter candidates through `assertOperation("share.push")` and per-chain `export` rules.
| `share-sync` import | Ensure destination `share` chain allows `write` + tags.
| `daemon collectors` | Each collector registers `operationId` (e.g., `collector.git`). `ShareCollector` additionally checks `share.push`.
| `memphis watch` | Only monitor paths/chains allowed for current workspace.
| `future memphis trade/MCP` | Provide `assertOperation("trade.export")`, `assertOperation("mcp.expose")`.

## 7. CLI Surface
1. `memphis rls status` → show current workspace, policy hash, allowed operations snapshot.
2. `memphis rls switch <workspaceId>` → update `state.json` + confirm.
3. `memphis rls audit` → scan recent blocks/logs for violations (optional if time permits).
4. `memphis share plan --workspace guest` → uses `forWorkspace` helper.

## 8. Implementation Steps
1. **Schema + Loader**
   - Create `src/security/rls.ts` with zod schema (cover version/workspaces/chains/operations).
   - Provide caching + helpful errors.
2. **State Manager**
   - `RlsStateStore` in `src/security/rls-state.ts` storing `currentWorkspaceId`, `lastHash`.
3. **Store Hooks**
   - Extend `Store` to accept optional `securityAdapter` or call static guard before read/write.
   - Unit tests covering allow/deny scenarios.
4. **CLI Commands**
   - Add `src/cli/commands/rls.ts` (status, switch, plan preview).
5. **Share-sync / Daemon Integration**
   - Update `share-sync` to pass candidate blocks through `assertChainAccess(..., "export")` + `assertOperation("share.push")`.
   - `ShareCollector` ensures workspace allows share collector operation.
6. **Docs + Samples**
   - Update `docs/plans/share-sync-automation.md` referencing RLS.
   - Add `docs/examples/rls.sample.yaml` + README snippet.
7. **Tests**
   - `tests/security/rls-loader.test.ts` (schema validation).
   - `tests/security/rls-guard.test.ts` (allow/deny matrix).

## 9. Rollout Strategy
- Start with permissive default policy (mirrors current behavior) to avoid regressions.
- Provide migration script: `memphis rls init --template base`.
- Log guard violations (warn) before hard-failing. After soak period, switch to hard enforcement.
- Document troubleshooting: how to temporarily disable (`MEMPHIS_RLS_BYPASS=1`?), but keep flagged in logs.

## 10. Open Questions
- Do we need multi-policy stacking (e.g., global + workspace)? (Probably later.)
- Should share-sync respect remote workspace IDs embedded in network entries? (Future when trading with other agents.)
- How to represent DID/key references inside policy for trade negotiation? (To be addressed when implementing `memphis trade`.)

---
Ready for review. Next action once approved: start coding RLS loader + guard (Steps 1–3). Let me know if coś dorzucić zanim wejdę w implementację.
