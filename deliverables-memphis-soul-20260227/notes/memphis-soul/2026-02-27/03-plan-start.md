Plan startowy – chain "soul" + helper (przygotowanie)

Kroki przed startem:
1. Upewnić się, że aktualny SOUL.md jest w ~/.memphis/SOUL.md (OK – kopiowane dziś).
2. Przygotować nazwę chaina: "soul" (sprawdzić, czy nie istnieje – `ls ~/.memphis/chains`).
3. Zaplanować strukturę blocka:
   - type: journal
   - tags: ["soul", "audit"]
   - content: blok z diffem (np. `git diff --no-index ~/.memphis/SOUL.md ~/.memphis/SOUL.md.prev`).
4. Skrypt helpera (`scripts/soul-commit.sh`):
   - Tworzy kopię SOUL (prev vs current),
   - Generuje diff + timestamp,
   - `memphis journal --chain soul "..."`.
5. Po testach – dodać do README/TASKS instrukcję jak logować zmiany.

Czekam na znak „start”, żeby odpalić chain i helper.
