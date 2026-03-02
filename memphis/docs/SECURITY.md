# Security Hygiene

Memphis is intentionally local-first: your memory chains, vault, and share blocks live on disk and never go to a hosted backend. That keeps the blast radius small, but it also means you own the security story end to end. This guide documents the current threat model, operational expectations, and the places where extra care is required.

## Threat Model

### Core assumptions
- **No cloud dependency.** Everything runs on the same machine (or LAN) you control. Physical compromise of that device is equivalent to compromise of the entire brain.
- **Append-only chains.** Once a block is committed it cannot be edited without detection; this protects integrity but not confidentiality.
- **Human in the loop.** Password entry, key rotation, and recovery all require the operator.

### Attack surfaces
1. **Vault chain** – encrypted secrets (API keys, credentials). Exposure of the vault password or master key reveals everything stored there.
2. **Memory chains** – plain text journal/ask/decision blocks. Malware on the host can exfiltrate these files directly.
3. **Share/IPFS sync** – exported blocks pinned to IPFS or shared with peers. Misconfigured TTLs or trusting unknown peers can leak data meant for collaborators only.
4. **Chain tooling** – CLI commands (`memphis ask`, `memphis share plan`, etc.) that read secrets into process memory; treat shell history and logs accordingly.

## Key Rotation Cadence
- **Vault master password / seed:** rotate every **90 days**. Re-encrypt sensitive entries with the new password, then revoke the old password. Document the rotation in the `vault` chain for auditability.
- **Peer-to-peer share tokens / DID keys:** rotate anytime a collaborator leaves or a device is lost.
- **Local OS account:** follow your platform’s recommended cadence; Memphis relies on OS-level permissions (chmod 600/700) for many guarantees.

## Vault Recovery Options
- **Seed phrase backup:** export your vault seed/DID and store it offline (paper, hardware token, or encrypted note in a separate password manager).
- **Shamir split (planned):** Memphis documents the concept now, but the implementation is not live yet. Track this in the roadmap before relying on it.
- **Password manager integration:** store the vault password in a dedicated entry, not re-used anywhere else.

See [`docs/VAULT_RECOVERY.md`](./VAULT_RECOVERY.md) for a step-by-step playbook.

## Chain Integrity Verification
- Use `memphis verify` for lightweight validation (hash + SOUL rules).
- Run `memphis repair` anytime you suspect corruption. It can quarantine broken blocks, recompute hashes, and reconnect healthy portions of a chain. Document every repair in your ops journal.
- Version-control your `~/.memphis/chains` directory or take periodic snapshots so you can diff unexpected changes.

## Share-Sync Security
- **TTL enforcement:** Share blocks include a default 7-day TTL. Expired blocks should be pruned before syncing to IPFS.
- **CID pinning:** Pin only the CIDs you intend to share. Treat pinned content as public unless you fully control every pinning node.
- **Trusted peers:** Exchange CIDs only with devices or humans you explicitly trust. Consider maintaining an allow-list, even in informal setups.
- **Outbound review:** Before running `memphis share plan`, review the diff to ensure no vault or private chains are referenced.

## Reporting Vulnerabilities
- **Responsible disclosure:** Email or DM the Memphis maintainers privately first; allow a reasonable remediation window before any public disclosure.
- **GitHub issues:** Once repro steps and mitigations exist, open an issue at <https://github.com/elathoxu-crypto/memphis>. Use the "security" label and avoid posting secrets or raw vault dumps.
- **Coordinated fixes:** When possible, note affected versions, suggested patches, and required operator actions (e.g., rotate passwords, rerun `memphis repair`).

## Workspace Row-Level Security (RLS)

Add workspace-specific filtering under the `security` block in `~/.memphis/config.yaml`. Each workspace defines an `id`, optional `label`, allowed chains, and whether it can read legacy/default blocks. Memphis enforces a single default workspace, prevents duplicate IDs, and injects a `workspace:<id>` tag into every write.

- `memphis workspace list` shows the configured workspaces (the active one is marked with `*`).
- `memphis workspace set <id>` persists your choice in `~/.memphis/workspace` (honored in precedence: `MEMPHIS_WORKSPACE_ID` env var → workspace file → config default).
- Store operations are wrapped: unauthorized chains are denied, read/list/stats skip chains outside the allowed set, and violations are logged to the `security` chain with workspace context.

Tip: keep `allowed_chains` narrow for sensitive areas (e.g., `vault`, `share`) and avoid enabling `includeDefault` unless you explicitly need the legacy context. The guard operates on your local storage and does not sync workspaces externally.

Security is a practice, not a checkbox. Review this document periodically and update it as your deployment model, collaborators, or threat environment changes.
