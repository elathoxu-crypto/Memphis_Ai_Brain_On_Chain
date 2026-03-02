# Memphis Roadmap — Path to Autonomy (2026)

## Phase 0 — Foundation Check (Now → March 2026)
- **Semantic Recall MVP**
  - Implement local embeddings (e.g., GGUF models) + vector index per chain.
  - Add `memphis embed` pipeline for incremental updates.
  - Extend `core/recall` to combine keyword + embedding hits.
- **Decision Engine Hardening**
  - Wire `decision/schema.ts` into CLI (`memphis decide`, `memphis decision list/show/revise`).
  - Enforce lifecycle fields (status, supersedes, links) during writes.
  - Add `decision/reflection.ts` to surface unresolved decisions.
- **Share-Sync 1.1**
  - Define `share` tag policy + TTL enforcement.
  - Provide CLI `memphis share plan` (dry-run with diff of outgoing/incoming blocks).
- **Security Hygiene**
  - Vault recovery spec (seed phrase or Shamir split). Publish recovery playbook.
  - Document threat model + key rotation cadence in `docs/SECURITY.md`.

## Phase 1 — Meaning Layer (April → June 2026)
- **Knowledge Graph Overlay**
  - Introduce lightweight graph store (`chains/graph`) capturing nodes (decision, project, person) + edges.
  - CLI: `memphis graph show decision:<id>` to explain relationships.
- **Reflection Engine v1**
  - Weekly job (`memphis reflect --weekly`) producing insights: repeated frictions, stalled decisions, contradictory outcomes.
  - Store reflections in new `chains/reflection` with summaries consumable by Ask/TUI.
- **Chunking & Ingestion Service**
  - Adapt Synjar strategies (LLM-smart, hierarchical, fixed split) into `ingestion/chunking.ts`.
  - Parser pipeline for PDF/DOCX/TXT → new chain `ingest` with metadata.
- **Storage Abstraction**
  - Implement `IStorageService` (local FS, Pinata/IPFS, S3-compatible backend) with pluggable drivers.

## Phase 2 — Inter-AI Exchange (July → September 2026)
- **RLS Blueprint for Chains**
  - Map Synjar SPEC-001 concept to Memphis: per-workspace policies, `current_workspace_id` session variable, `forWorkspace()` helper.
  - Ensure share-sync + remote imports obey RLS boundaries.
- **Agent Negotiation Protocol**
  - Extend OpenClaw bridge with `memphis trade` command: choose blocks to export, negotiate TTL/usage rights, log agreements in `chains/trade`.
  - DID-signed manifests for each transfer.
- **MCP/Tooling Exposure**
  - Offer Memphis as MCP server (`memphis.search`, `memphis.decision.create`, `memphis.share.plan`).
  - Allows other AI to consume Memphis data without manual copy/paste.

## Phase 3 — Offline Sovereignty (October → December 2026)
- **Offline Mode Implementation**
  - Finish `OFFLINE.md` plan: detector, fallback chain, context cache, TUI indicator, `memphis offline on|auto|model` commands.
  - Validate workflows with qwen 1B/3B models.
- **Resilient Vault**
  - Ship `vault recover` command with multi-factor options (seed, recovery partner).
  - Add audit logs for vault operations in `chains/vault-audit`.
- **Autonomous Reflection Loop**
  - Schedule background agent: capture → summarize → reflect → suggest next decision review.
  - Integrate with heartbeat/cron so Memphis nudges the user without prompt.

## Phase 4 — Memphis Nexus Release (Q1 2027)
- **Version 1.5 “Memphis Nexus”**
  - Merge all branches into `memphis-nexus` on both `elathoxu-crypto/memphis` and `memphis-chains/memphis`.
  - Include changelog: semantic recall, decision lifecycle, graph, trade protocol, offline mode.
- **Public Showcase + Docs**
  - Publish `docs/NEXUS.md` explaining how agents barter memory blocks safely.
  - Release tutorial: “Build a personal cognitive market with Memphis Nexus”.
- **Community Integration**
  - Provide default RLS+share configs for partner agents (Watra, Synjar, others).
  - Launch sample workflows: Memphis ↔ OpenClaw ↔ Synjar triangle.

---
*File maintained by Style (Memphis workspace). Update whenever milestones shift.*
