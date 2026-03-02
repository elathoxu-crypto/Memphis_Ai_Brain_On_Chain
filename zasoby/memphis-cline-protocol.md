# Memphis-Cline Protocol v1.0

## Quick Ref

| Symbol | Znaczenie |
|--------|-----------|
| 🦅 | Memphis mówi |
| 🤖 | Cline raportuje |
| 📝 | Zadanie do wykonania |
| ✅ | Zadanie ukończone |
| ❌ | Błąd / Problem |

---

## Komunikacja

### Memphis → Cline:

```
🦅 [TASK] Refaktoryzuj src/utils/hash.ts
   - Dodaj funkcję sha256
   - Zachowaj kompatybilność wsteczną
   - Testy jednostkowe
```

### Cline → Memphis:

```
🤖 [DONE] hash.ts refaktoryzowany
   - Dodano sha256()
   - 3 testy przechodzą
   - Kompatybilność: ✅
   
📝 [NEXT] Co robimy?
```

---

## Flow

1. **Memphis widzi cel** → dzieli na zadania
2. **Memphis wydaje TASK** → Cline wykonuje
3. **Cline raportuje DONE** → Memphis zapisuje na chain
4. **Memphis ocenia** → następny krok lub poprawka

---

## Block Tags

```
cline:task    - zadanie od Memphis
cline:done   - ukończone przez Cline
cline:error  - błąd Cline
memphis:plan - plan działania
```

---

## Przykład Sesji

```
🦅 [PLAN] Modernizacja API
   1. Refaktoryzaj endpoint /status
   2. Dodaj /health
   3. Dokumentacja OpenAPI

📝 [TASK #1] Refaktoryzuj /status
   - Zwróć JSON z chain stats
   - Dodaj timestamp

🤖 [DONE #1] /status refaktoryzowane
   - Nowy format: { chains, timestamp, version }
   - Testy: ✅

📝 [TASK #2] Dodaj /health

...
```

---

## Komendy CLI

```bash
# Memphis → Cline task
cd ~/memphis && cline -c ~/memphis -t 120 "Refaktoryzuj..."

# Cline → Memphis log
cd ~/memphis && npx tsx src/bridges/cline.ts journal "cline:done - refaktoryzacja /status"
```
