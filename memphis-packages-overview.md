# Memphis Packages Overview — 2026-02-26

## Snapshot Summary
- **memphis-showcase-20260226.zip** → source repo `~/memphis` + `.openclaw/workspace` helpers; docs include README, MEMPHIS_OPENCLAW_FIXES, decision schema draft, offline roadmap.
- **memphis-fullstate-20260226.zip** → raw `~/.memphis` chains (journal/ask/decision/summary/vault/immortals/thoughts/skills/logs-efemerald) + `.openclaw/logs` (config-audit, commands).

## Evolution Notes
1. **Origins**: personal AI brain (journal + ask) with append-only SHA256 chains, offline-first philosophy.
2. **Core Layers**: Ask v2.2, Decision Detector, Autosummarizer, TUI; provider fallback chain (OpenClaw → Codex → Ollama → OpenAI/OpenRouter).
3. **Agent Bridge**: Feb 17 fixes add OpenClaw multi-agent support (OpenClaw, CodeMaster, DataSage, ResearchBot), sliding context, offline detector, new CLI (`memphis agent openclaw ...`).
4. **Decision Ontology**: `docs/DECISION_SCHEMA.md` defines conscious/inferred decisions, lifecycle, evidence linking, CLI plan (`memphis decide`).
5. **Offline Roadmap**: `docs/OFFLINE.md` describes auto detection, fallback models (llama3.2:1b/3b, gemma3:4b), context cache, TUI indicator, CLI `memphis offline` commands. Implementation pending (phases 1-6).
6. **Fullstate Config**: `.memphis/config.yaml` pins provider to local Ollama (qwen2.5-coder:3b), disables auto_git, custom storage path. `vault` present (AES-256-GCM). `logs-efemerald` and `immortals` indicate experimental chains.
7. **Logs**: `config-audit.jsonl` records onboarding + config edits (25 Feb). `commands.log` minimal (session reset).

## Narrative ("How Memphis Formed / What It Became")
- Started as lightweight journaling + recall CLI, aimed at augmenting human memory.
- Added deterministic summaries and decision tracking to create a cognitive loop.
- Built TUI and multi-provider stack for usability and resilience.
- Integrated with OpenClaw for multi-agent workflows, enabling Memphis-driven automation.
- Currently investing in formal schemas (decisions) and offline autonomy (local LLM fallback), pushing toward a fully self-contained personal brain with verifiable memory chains.

_Use this file as reference when briefing external models (e.g., Sonnet 4.6) about the Memphis snapshot._