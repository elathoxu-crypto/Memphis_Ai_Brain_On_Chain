
# Share Replicator MVP – Spec

## 1. Replicator Scope (MVP)
- CLI command: `memphis share replicator`
- Modes:
  - `--plan`: read share-manifest chain, show pending sync actions
  - `--push`: publish local manifest entries (write to share chain + manifest file)
  - `--pull`: fetch remote manifests (via network-chain or provided file), queue downloads (no auto download yet)
- MVP only generates manifests + plan; actual block copy is stubbed.

## 2. Share-manifest Chain Schema
Chain name: `share-manifest`
Block data:
```
type: "share_manifest"
content: short human summary (e.g., "share thoughts#120-150 to Style")
tags: ["share", "manifest"]
manifest: {
  cid: string,
  chain: string,
  from: number,
  to: number,
  ttl_days: number,
  created_at: ISO string,
  publisher: string (agent id),
  signature?: string (optional)
}
```
Artefact: duplicate JSON lines file `~/.memphis/share-manifest/index.jsonl` for quick parsing.

## 3. Integration with Existing Flow
- Uses share chain metadata + network-chain.jsonl for remote discovery.
- Replicator reads chain `share` to know which blocks are eligible.
- Manifest entries reference CIDs produced by existing share-sync (Pinata uploads).
- No direct embed/recall integration yet, just metadata for sync.

## 4. Definition of Done
- CLI command `memphis share manifest` or `share replicator` with --plan/--push/--pull implemented.
- Writing new manifest block updates chain + JSONL mirror.
- Plan mode prints table of upcoming/expired manifests.
- Documentation added under `docs/plans/share-replicator.md` describing usage.
