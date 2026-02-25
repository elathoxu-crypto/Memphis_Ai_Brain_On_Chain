# Memphis Deployment Package

## Cel
Zebrać kluczową dokumentację, polityki, checklisty i backupy potrzebne do przeniesienia lub odtworzenia Memphis na nowym sprzęcie. Paczka ma służyć jako referencja dla instalacji drugiego PC, wdrożenia offline toggle i utrzymania polityki tajnych danych.

## Zawartość
1. **Strategie i roadmapy**
   - `memphis_brain_memory_chains.md`
   - `memphis_offline_project_roadmap.md`
   - `deployment_package_plan.md`
2. **Project tasks**
   - `project_task_vault_policy.md`
   - `project_task_install_second_pc.md`
3. **Checklists**
   - `checklist_deployment_package.md`
   - `checklist_offline_toggle.md`
   - `checklist_security_policy.md`
4. **Daily memory / policy notes**
   - `memory/2026-02-24.md`
   - `backup_and_notes_inventory.md`
5. **Backup references** (do ręcznego kopiowania)
   - `/home/memphis/Desktop/Memphis_brain_memory_chains.zip`
   - `/home/memphis/Pulpit/memphis-backup-20260220-1440/`
   - `/home/memphis/Pulpit/memphis-backup-20260220-0824/`
   - `/home/memphis/pamiec-backup/`
   - `/home/memphis/memory-backup/chain.json`
   - `/home/memphis/pulpit/test-decisions-backup/`
6. **Instrukcje**
   - Projekt instalacji drugiego PC + offline toggle + vault policy.

## Jak używać
1. Rozpakuj archiwum "Memphis_deployment_package.zip" na docelowym komputerze.
2. Skopiuj backupy chainów (`.memphis/chains`, `memory/`) według wskazówek w inventory.
3. Wdroż policy vaulta i offline mode według project tasków, ustawiając lokalny model `qwen2.5-coder:3b` jako primary i dokumentując fallback `o3:mini`.
4. Zaktualizuj `memory/2026-02-24.md` lub dodaj nowy `journal` block, gdy wykonasz kroki.
