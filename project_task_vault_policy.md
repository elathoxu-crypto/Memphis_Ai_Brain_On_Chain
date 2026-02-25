# Project Task: Vault Access Policy

## Cel
Utrzymać rozdział odpowiedzialności: wszystkie sekretne dane (API keys, SSI credentials, osobiste klucze) mogą być edytowane/zarządzane wyłącznie przez Memphis TUI, a OpenClaw TUI służy jedynie koordynacji i monitorowaniu.

## Krok po kroku
1. Zaznaczyć w `decisions` lub `journal`, że policy została przyjęta, dodać tagi `security`, `vault`, `workflow`.
2. Zapisać do `project_task` z checklistą: 
   - [ ] Wdrożyć przypomnienie/procedurę w dokumentacji TUI (np. `Vault -> Notes`).
   - [ ] Upewnić się, że Style nie zapisuje sekretów w OpenClaw chainach (tylko w `vault`).
   - [ ] Dodać alert w `ops`/`journal` jeśli ktoś próbuje wprowadzić sekret przez OpenClaw.
3. W razie potrzeby - utworzyć `memo` w chainie `journal` z odniesieniem do policy.

## Tagi
- `role:assistant` (Style), `role:user` (Memphis), `security`, `vault`, `workflow`, `policy`.

## Success
- Każda zmiana sekretów przechodzi przez Memphis TUI, zapisana w `vault` chainie.
- OpenClaw TUI pozostaje narzędziem do narracji, notatek i planowania; nie trzyma API keys.
- Recall potrafi przypomnieć o tej polityce dzięki tagom w `project_task` i `journal`.
