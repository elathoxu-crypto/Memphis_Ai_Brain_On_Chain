Progress – chain "soul" i helper (27.02.2026)

1. CLI
   - `memphis journal` ma flagę `--chain`, można logować do innych łańcuchów.
   - Budowanie `npm run build` → OK.

2. Skrypt `scripts/soul-commit.sh`
   - Szuka SOUL w `~/.memphis/SOUL.md`, trzyma snapshot `SOUL.snapshot.md`.
   - `diff -u` → wrap w ```diff```, log do `memphis journal --chain soul --tags soul,audit`.
   - Po zapisie aktualizuje snapshot, wypisuje log.

3. Chain `soul`
   - Pierwszy wpis `soul#000000` zawiera pełny diff SOUL.md.
   - `memphis recall soul -l 5` pokazuje historię (na razie diff + wcześniejsze pytania).

Pure code zmiany (wysłane do repo ~/memphis):
- `src/cli/commands/journal.ts` (obsługa chain, logging)
- `src/cli/index.ts` (flaga `--chain`)
- `scripts/soul-commit.sh` (nowy plik + chmod)

Następne kroki: dodać opis do README / TASKS, ewentualnie alias w package.json.
