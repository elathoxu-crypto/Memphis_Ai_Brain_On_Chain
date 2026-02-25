# Backup & Notes Inventory (2026-02-24)

## A. Core notes for deployment package
1. `memphis_brain_memory_chains.md` – architecture of chains, metadata/tag strategy, instructions for using journal/decisions/vault/ops for project contexts. Stored in workspace root and in the desktop package folder.
2. `memphis_offline_project_roadmap.md` – offline workflow roadmap, role definitions, checklist for offline toggle, watchdog and logging requirements.
3. `project_task_vault_policy.md` – security policy (TUI-only secrets) with project task steps for documentation and alerts.
4. `deployment_package_plan.md` – current plan (structure, sections, checklist references).
5. `checklist_deployment_package.md` – actionable list to follow when assembling the package.
6. Daily memory `memory/2026-02-24.md` – contains summary, installation plan bullet, security policy, Style on second PC notes, and project/task mentions.

## B. Backups & archives (available locally)
1. `/home/memphis/Desktop/Memphis_brain_memory_chains.zip` – packaged notes + daily memory (updated after Roadmap). Contains `memphis_brain_memory_chains.md` + `memory/2026-02-24.md` copy.
2. `/home/memphis/Pulpit/memphis-backup-20260220-1440/` – snapshot directory (mirror of `.memphis` or repo?).
3. `/home/memphis/Pulpit/memphis-backup-20260220-0824/` – older snapshot.
4. `/home/memphis/pamiec-backup/` – unspecified memory backup (check contents when needed).
5. `/home/memphis/memory-backup/chain.json` – backup of chain index (single file). Aligns with `memory/` or `chains` snapshots.
6. `/home/memphis/pulpit/test-decisions-backup/` – additional backup candidate (likely decisions chain).
7. `.memphis/chains/` – live chains including `ask`, `decision`, `decisions`, `immortal`, `journal`, `summary`, `vault`, plus others. Source-of-truth data.

## C. Notes about backup readiness
- The desktop zip is ready as core payload for packaging; we can update it after we finalize README/instructions.
- Additional backup directories carry full chain state; we can compress or include critical files if needed.
- Chain data lives in `~/.memphis/chains`; consider exporting specific block ranges if we only need certain entries for the package.
- Make sure to capture `project_task` entries (like Vault policy) into both `journal` and the files before finalizing backups.
