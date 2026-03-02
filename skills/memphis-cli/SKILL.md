---
name: memphis-cli
description: "Operate the Memphis local-first brain: init/status checks, journaling, recall/ask, embeddings, vault, share-sync, graphs, reflections, ingestion, and troubleshooting. Use whenever you need to capture or query memory chains, manage providers, or keep the Watra/Style brain in sync."
---

# Memphis CLI Skill

Use this when you need to drive the Memphis local-first brain from the terminal. It covers everything from first-time setup through advanced workflows (graphs, reflections, share-sync) and day-to-day hygiene.

---

## 1. Quick Start Checklist

1. **Set workspace**: all commands run from `/home/memphis/.openclaw/workspace` (or any project dir once Memphis is initialized).
2. **Memphis files** live in `~/.memphis/` (`chains/`, `config.yaml`, `embeddings/`, `vault.enc`).
3. **Primary commands**: `memphis init`, `memphis status`, `memphis journal`, `memphis ask`, `memphis embed`, `memphis share-sync`, `memphis reflect`, `memphis graph`, `memphis ingest`.
4. **Providers** default to local Ollama. Configure others via `~/.memphis/config.yaml` + Vault secrets when needed.

---

## 2. Setup & Configuration

### 2.1 Initialize / Inspect
- `memphis init` → creates `~/.memphis` if missing (safe to re-run: it will refuse when config exists).
- `memphis status` → health report (chains, providers, embeddings, vault, recent activity). Use after every major change.

### 2.2 Providers
`~/.memphis/config.yaml` example:
```yaml
providers:
  ollama:
    url: http://localhost:11434/v1
    model: qwen2.5:3b-instruct-q4_K_M
    role: primary
# optional fallbacks
  codex:
    model: gpt-5.1-codex-mini
    role: fallback
    api_key: codex-cli
```
- Edit with `nano`/`vim` + rerun `memphis status`.
- Ollama model list → `ollama list`. Pull new ones via `ollama pull <model>`.

### 2.3 Vault
Keep secrets out of env/files.
```bash
read -rsp "Vault password: " MEMPHIS_VAULT_PASSWORD
export MEMPHIS_VAULT_PASSWORD
memphis vault init --password-env MEMPHIS_VAULT_PASSWORD
memphis vault add openai-api-key sk-xxx --password-env MEMPHIS_VAULT_PASSWORD
unset MEMPHIS_VAULT_PASSWORD
```
Use `memphis vault list|get|delete` similarly.

---

## 3. Core Workflows

### 3.1 Journaling / Decisions / Summaries
- `memphis journal "text" --tags tag1,tag2` → appends immutable JSON block under `chains/journal/`.
- Force autosummary after entry: `--force`.
- Decisions: `memphis decide "Title" "Choice" --options A|B --reasoning "..."`.
- Show decision: `memphis show decision 42`.

### 3.2 Asking Memphis (recall + LLM)
```bash
memphis ask "Question" \
  --provider ollama \
  --top 8 \
  --graph \
  --prefer-summaries \
  --no-save   # when testing; note current bug requires manual cleanup
```
Flags:
- `--use-vault` / `--vault-password` to unlock cloud keys.
- `--since 2026-02-28`, `--include-vault`, `--semantic-only`, `--no-semantic`, `--summaries N`.
- `--json` for machine-readable output.

### 3.3 Embeddings
Keep recall sharp by embedding chains after edits/imports.
```bash
memphis embed --chain journal
memphis embed --chain ask
memphis embed --chain decision
# embed all chains
memphis embed
```
Backend (default): Ollama `nomic-embed-text`. Configure under `embeddings:` in config.

### 3.4 Ingestion
Import external docs; auto-creates chains when specified.
```bash
memphis ingest ./docs --recursive --chain research --embed
```
Supported formats: `.md`, `.txt`, `.json`, `.jsonl`, `.pdf`. Automatically chunks + deduplicates.

### 3.5 Knowledge Graph & Reflection
- Build/update graph: `memphis graph build` (generates JSONL nodes/edges from chains).
- Inspect: `memphis graph show --chain journal --limit 10`.
- Reflection: `memphis reflect --daily` / `--weekly` / `--deep --save`.

### 3.6 Share-Sync (IPFS/Pinata)
Use when syncing shareable blocks between agents (Watra ↔ Style).
```bash
memphis share-sync --pull
memphis share-sync --push
memphis share plan   # dry-run diff
```
Configure Pinata creds in `~/.memphis/config.yaml` under `integrations.pinata` or env vars.

### 3.7 Daemon / Watchers
- `memphis watch <path> --chain journal --no-embed` → auto-ingest file changes.
- `memphis daemon start` (collector-based background tasks: journaling git diffs, shell history, etc.).

---

## 4. Advanced Patterns

### 4.1 Chain Management
- Chains live at `~/.memphis/chains/<name>/<index>.json`.
- Create new chain implicitly via `memphis ingest --chain foo` or custom scripts calling `appendBlock("foo", data)`.
- Integrity:
  - `memphis verify --chain journal`
  - `memphis repair --chain journal --dry-run`

### 4.2 Autosummaries & Heartbeats
- Heartbeat process uses `HEARTBEAT.md` + `tasks/QUEUE.md`. Keep them synced (update queue as work completes).
- Daily log: `memphis journal "Session summary" --tags session,summary` or run provided script `./save-session.sh`.

### 4.3 Provider Swaps On-The-Fly
- Local only: edit config to point `providers.ollama.model` to desired quant/model. `memphis status` confirms.
- Cloud fallback: add provider block + store API key in Vault, e.g. `providers.openai.model`, `vault add openai-api-key ...`.

### 4.4 Troubleshooting
| Symptom | Fix |
| --- | --- |
| `memphis status` shows `no_key` | Initialize Vault + add relevant key, or remove unused provider block. |
| `Provider error: Gateway 405` | Disable OpenClaw provider (`--provider ollama`), ensure gateway not in config. |
| `ask` saves blocks despite `--no-save` | Known bug — manually delete `~/.memphis/chains/ask/00000X.json` until patch applied. |
| Missing context in ask | Run `memphis embed --chain <name>`, ensure `memphis graph build` recently executed, consider recency filters (`--since`, `--top`). |
| Vault not initialized | `memphis vault init` with `--password-env`, check `~/.memphis/chains/vault`. |

---

## 5. Example Session
```bash
# 1. Health check
memphis status

# 2. Capture insight
memphis journal "Qwen2.5 instruct offline = primary, Codex disabled." --tags memphis,status

# 3. Embed new context
memphis embed --chain journal

# 4. Ask question with graph context
memphis ask "Jakie są kolejne kroki Phase 2?" --provider ollama --graph --prefer-summaries

# 5. Run reflection
memphis reflect --daily --save

# 6. Plan share sync
memphis share plan
```

---

## 6. Packaging / Maintenance Tips
- After major updates, document state in `journal` + optionally `memory/YYYY-MM-DD.md`.
- Run `memphis status` before/after large automation runs.
- Keep Ollama models + embeddings up-to-date (re-embed after big ingests).
- When scripting around Memphis, use the JSONL structure (immutable blocks) and hashing rules if writing custom tooling.

Memphis thrives when its chains stay fresh, summaries are updated, and providers are healthy. Use this skill whenever you need to capture work, query context, or extend the Watra/Style brain autonomously.
