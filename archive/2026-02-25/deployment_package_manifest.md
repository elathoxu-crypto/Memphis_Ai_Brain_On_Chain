# Deployment Package Manifest

## Purpose
Dokumentacja ma pomóc odbiorcy paczki **Memphis deployment package** szybciej zrozumieć zawartość, odpowiedzialności i weryfikacje. Manifest łączy roadmapy, project taski, polityki i backupy z konkretnymi akcjami sprawdzającymi, aby instalujący drugą maszynę mógł odtworzyć środowisko bez odwoływania się do wiedzy ustnej.

## Package Contents
| Nazwa pliku / zasobu | Opis | Właściciel | Wersja / Timestamp | Weryfikacja | Lokalizacja |
| --- | --- | --- | --- | --- | --- |
| `memphis_brain_memory_chains.md` | Architektura chainów, metadata/tag strategy wraz z auditami `journal` i `decision`. | Style | 2026-02-24 | Sprawdź `memory/2026-02-24.md` tagi `chain`/`vault` | w paczce + `memory` backup |
| `memphis_offline_project_roadmap.md` | Roadmapa offline (Role, modele, backlog). | Style | 2026-02-24 | Porównaj z `memphis-5h-roadmap.md` i tagiem `offline` | paczka/cache |
| `project_task_install_second_pc.md` | Szczegółowy task dla drugiej maszyny (Ubuntu + GTX 1060). | Style | 2026-02-24 | Każdy krok potwierdzony w `checklist_deployment_package.md` | paczka/project_task |
| `project_task_vault_policy.md` | Polityka vaulta: kto trzyma tajne dane i jak rejestruje żądania. | Style | 2026-02-24 | Weryfikuj zgodność `vault` z `checklist_security_policy.md` | paczka/policy |
| `checklist_deployment_package.md` | Lista punktów finalnych (backup, README, tagi). | Style | 2026-02-24 | Zaznacz każdy krok w dokumencie przed wysyłką | paczka/checklists |
| `checklist_offline_toggle.md` | Instrukcje dla TUI offline toggle i tagowania. | Style | 2026-02-24 | Upewnij się, że `offline` toggle emitowane w `journal` i `ops` | paczka/checklists |
| Backupy `Memphis_brain_memory_chains.zip`, `memphis-backup-*`, `memory-backup/chain.json` | Skondensowana pamięć + chainy + logi (wszystkie podpisane). | Style / backup system | ostatni backup w README | Porównaj checksums z `deployment_package_README.md` | Desktop/`Memphis_deployment_package.zip` + backup foldery |
| `deployment_package_README.md` | Podsumowanie zawartości, instrukcje rozpakowania, lokalne uwagi. | Style | 2026-02-24 | Zgodność listy plików z obecnym ZIPem | paczka README |
| `deployment_package_plan.md` | Strategia pakowania: role, bezpieczeństwo, offline, tagowanie. | Style | 2026-02-24 | Sprawdź, czy plan uwzględnia wszystkie tagowane chainy (journal, ops, vault). | paczka/plan |
| `project_task_install_second_pc.md` + `checklist_offline_toggle.md` cross references | Dokumenty tworzą powiązany workflow: system, CUDA, offline toggle, vault oraz lokalny model `qwen2.5-coder:3b`. | Style / o3:mini + qwen | 2026-02-24 | Tag `deployment` + `style-role` + `offline-toggle`; sprawdź, że `memphis status` pokazuje `primary=qwen2.5-coder:3b`. | paczka/project_task |

## Deployment Readiness Checklist
1. [ ] **Backup validation** – porównaj checksums plików ZIP z `deployment_package_README.md`, upewnij się, że `memory-backup/chain.json` jest aktualny i zarchiwizowany w `Memphis_deployment_package.zip`.
2. [ ] **Tag audit** – wszystkie nowe wpisy (journal, ops, memory) dotyczące paczki mają tagi `project_task`, `security`, `deployment`, `vault` i `offline-toggle` (sprawdź `memory/2026-02-24.md`).
3. [ ] **Policy acceptance** – `project_task_vault_policy.md` musi być potwierdzony przez Style (o3:mini) i odnotowany w `journal` z tagiem `vault-policy`. Tajne dane przechowuj wyłącznie w TUI.
4. [ ] **Vault/key handling** – przywróć klucze z backupu (TUI-only), sprawdź `vault status` i dokumentuj wyniki w `ops/vault` oraz `journal`.
5. [ ] **Offline toggle confirmation** – potwierdź, że `checklist_offline_toggle.md` wdrożono na drugiej maszynie, że `memphis status` raportuje `primary=qwen2.5-coder:3b` (oraz `fallback=o3:mini`), i że stan toggle zapisano w `journal` z tagiem `offline-toggle`. Upewnij się, że `offline-toggle.json` odzwierciedla konfigurację modeli.
6. [ ] **Communications** – prześlij manifest z opisem zawartości, punktami kontaktowymi (Style / o3:mini) i instrukcjami weryfikacji backupów. Dołącz informację, że `Memphis_deployment_package.zip` trafia na pulpit `/home/memphis/Desktop/`.

## Local Model Requirements
- Drugi PC używa lokalnego **primary modelu `qwen2.5-coder:3b`** (Ollama/`memphis` provider). Upewnij się, że w `memphis config` lub `offline-toggle.json` jest ustawiony `primary=qwen2.5-coder:3b`, a tag `offline-toggle` opisuje przełączenie.
- `o3:mini` nadal pozostaje modelem pomocniczym (Style OpenClaw) — zaznacz w tagach `agent:style`, `model:o3-mini`. Jeśli potrzebujesz zestawienia modeli, dodaj wpis w `memory/2026-02-24.md` z tagami `deployment` i `model-change`.

## Notes
- Wersjonowanie manifestu odbywa się przez datowanie wpisu (`2026-02-24`) i tagowanie `deployment-package`. Jeśli planujesz kolejne paczki, kopiuj ten manifest i aktualizuj sekcje „Wersja” oraz „Weryfikacja”.
- Komunikacja z odbiorcą paczki powinna zawierać przypomnienie o TUI-only secrets oraz offline toggle (link do `checklist_offline_toggle.md`).
