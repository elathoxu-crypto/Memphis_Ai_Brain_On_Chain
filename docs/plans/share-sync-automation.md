# Memphis Share-sync Automation Plan

_Last updated: 2026-02-27 05:25 CET_

## 1. Cel
Zapewnić przewidywalne, bezpieczne synchronizacje łańcuchów „share” do/z Pinaty bez ręcznego odpalania poleceń. Plan obejmuje: harmonogram, komendy, logowanie, obsługę błędów oraz integrację z heartbeat loop.

## 2. Kontekst i zasoby
- **CLI:** `memphis share-sync` (push/pull/cleanup). Wrapper `scripts/memphis-share-sync.sh` ładuje PINATA env z `backup/pinata-creds.json`.
- **Aktualny rytm:** ostatni manualny run 2026-02-26 22:20 CET (`logs/heartbeat-state.json` → `memphisShareSync`). Target = `daily`.
- **Bezpieczeństwo:** sekrety nie trafiają do logów (wrapper używa env). Wszelkie logi zapisujemy lokalnie w `logs/share-sync/` bez tokenów.

## 3. Harmonogram (rekomendowany)
| Krok | Czas | Mechanizm | Komenda |
| --- | --- | --- | --- |
| 1 | 07:40 | Heartbeat pre-brief (manual check) | `./scripts/memphis-share-sync.sh --all --dry-run --limit 15 --since 36h` (raport co poleci) |
| 2 | 13:30 | **Cron główny (codziennie)** | `./scripts/memphis-share-sync.sh --all --limit 25 --since 36h > logs/share-sync/$(date +%F).log 2>&1` |
| 3 | 22:00 | Heartbeat fallback (jeśli `memphisShareSync` > 18h) | `./scripts/memphis-share-sync.sh --all --limit 25 --since 48h` |
| 4 | Niedziela 23:00 | Cron cleanup (tygodniowo) | `./scripts/memphis-share-sync.sh --cleanup --dry-run && ./scripts/memphis-share-sync.sh --cleanup` |

**Uwagi:**
- Parametr `--since` utrzymuje małe batch’e i ogranicza koszt Pinaty.
- `--limit 25` daje rezerwę kiedy backlog rośnie.
- Heartbeat fallback wyzwala się gdy `logs/heartbeat-state.json.memphisShareSync` jest starszy niż 18h.

## 4. Cron konfiguracja
Dodać wpisy do `crontab -e` (użytkownik `memphis_ai_brain_on_chain`):
```
# Memphis share-sync daily push/pull
30 13 * * * cd /home/memphis_ai_brain_on_chain/.openclaw/workspace && ./scripts/memphis-share-sync.sh --all --limit 25 --since 36h >> logs/share-sync/$(date +\%F).log 2>&1

# Weekly cleanup (Sunday 23:00)
0 23 * * 0 cd /home/memphis_ai_brain_on_chain/.openclaw/workspace && ./scripts/memphis-share-sync.sh --cleanup >> logs/share-sync/cleanup-$(date +\%F).log 2>&1
```
Przed dodaniem wpisów upewnij się, że katalog `logs/share-sync` istnieje (`mkdir -p logs/share-sync`).

## 5. Heartbeat integracja
1. Podczas każdego heartbeat-u sprawdź `logs/heartbeat-state.json.memphisShareSync`.
2. Jeśli timestamp >18h lub `null` → uruchom fallback (`--all --since 48h`).
3. Po udanym runie uaktualnij `memphisShareSync` w `logs/heartbeat-state.json` i dopisz notkę do `memory/<data>.md`.
4. W przypadku błędu: dodaj alert do heartbeat odpowiedzi + logi z `logs/share-sync/<data>.log`.

## 6. Monitoring i alerty
- **Log rotation:** raz w tygodniu skompresuj stare logi (`gzip logs/share-sync/2026-02-*.log`).
- **Pinata health:** `memphis-sync.sh status` (raz na tydzień w ramach maintenance). Jeżeli API zwróci błąd ≥400, w heartbeat zgłoś „Share-sync degraded”.
- **Success criteria:** log zawiera `Sync completed` (CLI output) oraz brak słowa „ERROR”. W fallback-u wymagany manualny potwierdzony timestamp w `logs/heartbeat-state.json`.

## 7. Procedura awaryjna
1. Jeśli cron nie odnotował runu (pusty log / brak wpisu) → ręcznie wywołaj `./scripts/memphis-share-sync.sh --all --limit 10 --since 12h --dry-run` dla diagnozy.
2. W razie błędów auth („Missing Pinata credentials”) → sprawdź `backup/pinata-creds.json` oraz zmienne env w shellu crona (`/etc/cron.d/env`).
3. Jeśli Pinata offline >6h → ustaw `--push-disabled` i wykonaj tylko pull, aby sczytać remote.

## 8. TODO przed wdrożeniem
- [ ] Utworzyć `logs/share-sync/` i dodać go do `.gitignore` (jeśli repo trackuje workspace).
- [ ] Potwierdzić, że `jq` i `curl` dostępne z crona.
- [ ] Jednorazowo odpalić cron komendę ręcznie i sprawdzić log.
- [ ] W `tasks/QUEUE.md` oznaczyć zadanie jako „zaplanowane” po wprowadzeniu wpisów cron.

Po wykonaniu powyższego planu share-sync będzie działać automatycznie z nadzorem heartbeatów i dodatkowymi zabezpieczeniami.
