# Vault Recovery Playbook

Use this checklist when you need to restore the Memphis vault onto a fresh machine or after accidental deletion. Everything assumes you already have local filesystem access; there is no hosted fallback.

## Pre-requisites
- **Backup location:** Know exactly where your encrypted vault export or `vault/` chain snapshot lives (external SSD, offline NAS, etc.).
- **Password manager entry:** Store the vault password (or derived seed phrase) in a dedicated entry with MFA enabled.
- **Clean target directory:** Ensure `~/.memphis/chains/vault` does not contain partial data before you restore.
- **Integrity hashes (optional but recommended):** SHA-256 digests of your backup files so you can verify tamper-free recovery.

## Recovery Steps
1. **Locate the latest backup.** Prefer the most recent export or filesystem snapshot that you trust.
2. **Verify integrity.** Compare the stored hash/signature against your backup. If the hash mismatches, stop—assume tampering.
3. **Restore files.** Copy the `vault/` chain directory (or the exported metadata + encrypted payloads) back into `~/.memphis/chains/vault`, preserving file permissions (0600 for blocks).
4. **Re-key if needed.** If you rotated the master password since the backup, immediately re-encrypt each secret with the current password (`memphis vault add <key> <value>` after decrypting with the old one).
5. **Smoke test.** Run `memphis vault list` to confirm key names, then `memphis vault get <key>` to ensure decryption succeeds.
6. **Document the recovery.** Add a journal or ops block summarizing what happened, which backup was used, and whether anything failed.

## If the Master Key/Password Is Lost
- **Data is unrecoverable.** Memphis uses AES-256-GCM with PBKDF2-derived keys and an append-only chain. Without the master password (or seed phrase), you cannot decrypt historical blocks.
- **Why:** The vault encryption key never leaves your head/password manager. There is no key escrow, no "forgot password" endpoint, and each block is bound to the encrypted payload produced with that key. Append-only design prevents retroactive edits that could re-encrypt data without the original password.
- **Next steps:** Initialize a new vault (`memphis vault init`), generate fresh secrets, rotate any dependent infrastructure credentials, and treat the old vault as permanently sealed.

## Recommended Backup Strategy
1. **Export metadata:** Use `memphis vault export --json > vault-metadata.json` to capture key names and timestamps without plaintext values.
2. **Snapshot encrypted blocks:** Periodically copy `~/.memphis/chains/vault/*.json` to an offline location.
3. **Encrypt at rest:** Wrap backups with an additional layer (e.g., `age`, `gpg`, or your password manager's secure file vault).
4. **Store offsite:** Keep at least one copy on a physically separate medium (bank box, trusted relative, offsite safe) to survive device loss or fire.
5. **Test restores quarterly:** Pick a non-critical secret, restore it on a spare machine, and verify the process works end to end.

## Roadmap: Shamir Secret Sharing
Shamir Secret Sharing (SSS) support is planned to split the vault master key into multiple shards (e.g., 3-of-5). This will allow:
- Distributed trust across devices or humans
- Safer recovery if one shard is lost
- Optional emergency break-glass workflows

Until SSS lands, rely on the single master password/seed workflow described above and treat the backup process as mission-critical.
