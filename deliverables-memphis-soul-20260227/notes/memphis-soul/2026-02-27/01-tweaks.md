Memphis SOUL – ostatnie poprawki (27.02.2026)

1. Chain "soul"
   - Utwórz dedykowany łańcuch w Memphisie (np. `memphis journal --chain soul ...`).
   - Przy każdej zmianie SOUL.md wrzucaj nowy block z diffem + komentarzem.
   - Dzięki temu `memphis recall soul` pokaże historię ewolucji zasad.

2. Vault (opcjonalny wariant)
   - Jeśli jakieś sekcje SOUL mają być prywatne, zapisz zaszyfrowany wariant w Vault: `memphis vault add soul-secret "..."`.
   - Rozszerz CLI o flagę `--use-vault`, żeby przy `memphis ask` doklejał decrypt z Vaulta (np. guard rails).

3. Health-check
   - Dodaj w `memphis status` / `memphis verify` test: czy plik `~/.memphis/SOUL.md` istnieje i zgadza się wersja.
   - Alert przy brakującym pliku → łatwiej utrzymać spójność między agentami.

4. Share / replication
   - Wystaw SOUL przez `memphis share` albo push do Style’a (@memphisek_bot), żeby nowe instancje automatycznie łapały zasady.

5. TUI / heartbeat przypomnienia
   - Panel w TUI („SOUL status”) albo wpis w HEARTBEAT, który wymusza okresową rewizję.

Plan działania: zacznij od pkt 1 (łańcuch i audyt zmian), potem health-check + share. Variant Vault tylko jeśli potrzebna prywatna część SOUL.
