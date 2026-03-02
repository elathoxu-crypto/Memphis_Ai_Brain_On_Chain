# Memphis Heart Plan — Phase 0 Blueprint (Semantic Recall + Decision Engine)

_Last updated: 2026-02-27_

## 1. Semantic Recall MVP

### 1.1 Goals
- Bring semantic understanding to Memphis Ask/Recall without depending on cloud APIs.
- Maintain per-chain vector indexes so every chain (journal, decision, summary, etc.) can be queried semantically.
- Provide a manageable CLI workflow (`memphis embed ...`) for refreshing embeddings.

### 1.2 Components
| Component | Description | Notes |
|-----------|-------------|-------|
| Embedding Model | Local GGUF model (e.g., `text-embedding-nomic-embed-text-v1` via llama.cpp/ollama) | fallback to remote if configured |
| Store Layout | `~/.memphis/embeddings/<chain>/index.bin` + metadata JSON | 1 index per chain |
| CLI | `memphis embed --chain journal --since 2026-02-01` | incremental updates |
| Recall Integration | `core/recall.ts` merges keyword + semantic hits | weighting sliders |
| Config | `config.yaml` section `embeddings` (model, backend, topK, threshold) | defaults safe |

### 1.3 Steps
1. **Embedding Service**
   - New module `src/embeddings/service.ts` with pluggable backends:
     - Local: call `ollama embedding` or `llama.cpp` (via CLI wrapper).
     - Remote: OpenAI embeddings (only if configured).
   - Cache embeddings per block (hash-based dedupe).
2. **Index Manager**
   - Use `faiss` via `node-addon`? (heavy) → Instead adopt `scann`-style simple HNSW via wasm? For MVP, start with `lancedb` or `annoy` via CLI (but to avoid native deps, use simple cosine search with in-memory vectors stored in JSON). Trade-off: manageable for <5k blocks.
   - Structure: `embeddings/<chain>/<block_index>.json` storing vector + metadata. Later, swap for real ANN.
3. **CLI Command**
   - `src/cli/commands/embed.ts`: options `--chain`, `--since`, `--force`, `--dry-run`.
   - Walk chain, compute missing embeddings, write to store.
4. **Recall Merge**
   - `core/recall.ts`:
     - Keyword hits (existing).
     - Semantic hits (topK by cosine similarity).
     - Merge, dedupe by block index, allow weighting (default 50/50).
   - CLI flags for Ask: `--semantic-only`, `--semantic-weight 0.7`, `--no-semantic`.
5. **Diagnostics**
   - `memphis status` displays embedding status (last run, #vectors per chain).
   - Add `memphis embed report` to show coverage.

## 2. Decision Engine Hardening

### 2.1 Goals
- Fully adopt `decision/schema.ts` v1 for all new decision blocks.
- Provide human-friendly CLI to create, list, show, revise, and resolve decisions.
- Add reflection job to surface unresolved or contradictory decisions.

### 2.2 Components
| Component | Description |
|-----------|-------------|
| CLI Commands | `memphis decide`, `memphis decisions list`, `memphis decisions show <id>`, `memphis decisions revise <id>`, `memphis decisions resolve <id> --status deprecated` |
| Schema Enforcement | `Store.appendBlock` path ensures decision blocks carry schema payload |
| Detector Integration | Update `detector_v0.ts` to emit schema objects |
| Reflection | `memphis decisions reflect` → report pending/inferred decisions |

### 2.3 Steps
1. **CLI Refactor**
   - `src/cli/commands/decide.ts`: use `createDecisionV1`, prompt for options/reasoning.
   - New command `decisions.ts` (subcommands list/show/revise/resolve).
2. **Store Hook**
   - In `Store.appendBlock`, if `type === "decision"`, ensure payload matches schema. Save JSON string in `data.content` (stable).
3. **Detector Update**
   - `detector_v0.ts` outputs `DecisionV1` objects; CLI `memphis decisions infer --since 7d` writes proposals to `chains/decision` with `status: pending_review`.
4. **Reflection Command**
   - `memphis decisions reflect`: groups decisions by `status`, highlights ones older than X days without resolution, surfaces contradictions (same `decisionId` with alternating `chosen`).
   - Output summary block into `chains/thoughts` or dedicated `chains/decision-reflection`.
5. **TUI Update (optional later)**
   - Add Decision panel showing lifecycle, statuses, badges (pending, active, superseded).

## 3. Share-Sync 1.1 + Security Hygiene

### 3.1 Goals
- Make share-sync predictable (dry-run plan, TTL enforcement, tag whitelist).
- Draft vault recovery strategy (seed/shamir) and document threat model.

### 3.2 Steps
1. **Share Plan Command**
   - `memphis share plan [--push|--pull]`: shows which blocks qualify under `tags.includes("share")` and TTL < 7 days.
   - Add config entry for TTL + allowed chains.
2. **TTL Enforcement**
   - On `share-sync --cleanup`, remove expired entries automatically.
3. **Vault Recovery Spec**
   - Document approach (seed phrase stored offline, optional buddy recovery) in `docs/SECURITY.md`.
   - Outline CLI scaffolding (no implementation yet).
4. **Threat Model Doc**
   - Short write-up covering local/offline, share-sync, vault, OpenClaw bridge.

## 4. Execution Notes
- **Token Budgeting**
  - Planning/doc phase (this file) created with minimal tokens.
  - Coding phase will require Codex Mini/5.1; budget per subtask to be confirmed before execution.
- **Review Flow**
  - Present this plan to Watra for review/feedback before coding.
  - Adjust tasks based on review, then proceed in order: Semantic Recall → Decision Engine → Share-sync/Security.

## 5. Next Steps Checklist
- [x] Draft plan (this document)
- [ ] Review with Watra / Memphis owner
- [ ] Approve budgets per subtask
- [ ] Implement Semantic Recall MVP
- [ ] Implement Decision Engine Hardening
- [ ] Ship Share-Sync 1.1 + Security hygiene
