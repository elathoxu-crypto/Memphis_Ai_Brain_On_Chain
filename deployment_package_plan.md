# Deployment Package Plan

## Cel
Skomponować paczkę do wysłania (z backupami, roadmapami, projektami, policy i plikami pamięci), którą po zoptymalizowaniu projektu i struktur danych można łatwo przesłać lub zbackupować. Paczka ma być zorganizowana według wytycznych: role, bezpieczeństwo, offline, dokumentacja oraz sprawdzone chainy.

## Struktura paczki
1. **Dokumentacja projektowa**
   - `memphis_brain_memory_chains.md` – architektura chainów + metadata/tag strategy.
   - `memphis_offline_project_roadmap.md` – roadmapa offline + role.
   - `project_task_vault_policy.md` – security policy dla vaulta.
   - `memphis_offline_project_roadmap.md` (duplikat?) – redundantne? only once.
   - `deployment_package_plan.md` – obecna rozpiska struktur.

2. **Pamięć / chain notes**
   - `memory/2026-02-24.md` (aktualizowany).
   - Wyciągi chainów (np. `memphis_brain_memory_chains.md` referencje).
   - Backup `chain.json` z `memory-backup` i ewentualne logi.

3. **Backupy binarne / archiwa**
   - `Memphis_brain_memory_chains.zip` (zawiera notatki + memory)
   - Kopie z pulpitu `memphis-backup-*`, `pamiec-backup`, `test-decisions-backup` (opis w README).
   - `memory-backup/chain.json`.

4. **Instrukcje instalacji/drugi PC**
   - notatka skrócona + `project_task` entry (np. `project_task_install_second_pc`)
   - plan roli Style na drugim systemie (o3:mini). (Można w `memory` bullet). 

5. **Instrukcje bezpieczeństwa**
   - Szczegółowe wskazówki obsługi tajnych danych – w `project_task_vault_policy` i `memory/2026-02-24.md`.
   - Informacja o TUI-only secrets.

6. **Checklisty do weryfikacji**
   - `checklist_deployment_package.md` (z krokami). 
   - `checklist_install_second_pc.md` (kroki system/cuda/clone/config). 
   - `checklist_offline_toggle.md` (tui option). 

## Checklisty (przykłady)
- [ ] Zaktualizować notatki + pamięć (tak jak już.
- [ ] Załączyć latest zip + README.
- [ ] Spisać summary key points (security policy, offline mode, multi-agent).
- [ ] Upewnić się, że doc o instalacji drugiego PC zawiera linki do backupów i wskazania modelu o3:mini.
- [ ] Przygotować tabele/README w paczce z opisem, co zawiera i jak odtworzyć chainy.

## Uwagi
- Wszystkie zebrane pliki powinny mieć metadane (tagi, references). 
- Pakiet można później przepakować (kompresja) i przenieść na drugi komputer lub przesłać. 
