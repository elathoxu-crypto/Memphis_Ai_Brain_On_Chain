# Secure Secrets Runtime — Procedura

_Data:_ 2026-02-27 11:50 CET  
_Autor:_ Watra  
_Cel:_ Procedura obsługi sekretów w runtime bezpiecznie (Vault + pipe)

---

## Problem

W środowisku autonomy (i ogólnie w Memphis) często potrzebujemy przekazywać sekrety (API keys, tokeny, hasła) do procesów uruchamianych przez Watrę. Tradycyjne podejście — zmienne środowiskowe w pliku `.env` lub bezpośrednio w shellu — jest ryzykowne:

- Sekrety widoczne w `ps aux` lub `/proc/<pid>/environ`
- Wyciekają do logów (np. przy błędach child process)
- Trudne do rotacji bez restartu procesów

## Rozwiązanie: Vault + Pipe

### Architektura

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Watra     │────▶│  Vault/Env   │────▶│  Child      │
│  (parent)   │     │  (secrets)   │     │  Process    │
└─────────────┘     └──────────────┘     └─────────────┘
       │                                      │
       │         stdin pipe                   │
       └──────────────────────────────────────┘
```

### Zasada działania

1. **Vault lub bezpieczny storage** trzyma sekrety (może to być HashiCorp Vault, ale też prostsze rozwiązanie: zaszyfrowany plik JSON z kluczem w system keyring).
2. Przed uruchomieniem procesu-child, Watra:
   - Pobiera sekret z Vault/storage
   - Zapisuje go do **stdin** child-process (pipe)
   - Child-process czyta ze stdin na starcie i przechowuje w pamięci (nie w env!)
3. Sekret **nigdy nie pojawia się w**:
   - Command line (`ps aux`)
   - Environment variables
   - Logach

### Przykład implementacji (Node.js)

```javascript
// parent.js — uruchamianie child z sekretem przez pipe
import { spawn } from 'child_process';

async function runWithSecret(command, secretName) {
  // 1. Pobierz sekret z Vault
  const secret = await vault.get(secretName);
  
  // 2. Uruchom proces z stdin pipe
  const child = spawn(command, [], {
    stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
    env: { ...process.env } // bez sekretów w env!
  });
  
  // 3. Wyślij sekret przez stdin
  child.stdin.write(JSON.stringify({ [secretName]: secret }));
  child.stdin.end();
  
  return child;
}
```

```javascript
// child.js — odbieranie sekretu ze stdin
import { readFileSync } from 'fs';

const secrets = JSON.parse(readFileSync(0, 'utf-8')); // stdin
// secrets = { "apiKey": "sk-xxx" }

// Użyj secrets.apiKey w kodzie — nigdy nie zapisuj do process.env
```

### Alternatywa bez Vault (prostsze środowisko)

Jeśli Vault jest overheadem:

1. **Szyfrowany plik sekretów** (`~/.memphis/secrets.enc`)
2. Klucz deszyfrujący w **system keyring** (np. `keytar` npm, lub `secret-service` na Linux)
3. Deszyfracja na starcie Watry → trzymanie w pamięci → pipe do child processes

```javascript
// pseudo: decrypt secrets at startup
const key = await keytar.getPassword('Memphis', 'master-key');
const secrets = decrypt(secretsFile, key);
```

## Checklist wdrożeniowy

- [ ] Wybrać backend sekretów (Vault / encrypted file + keyring)
- [ ] Napisać moduł `src/runtime/secrets.ts` — interfejs `get(name)`, `list()`, `rotate(name)`
- [ ] Napisać wrapper `runWithSecret()` dla spawn child processes
- [ ] Zaktualizować istniejące skrypty (np. `memphis-sync.sh`, `heartbeat-sync.sh`) by używały pipe zamiast env
- [ ] Dodać test: sprawdzenie że `ps aux | grep` nie pokazuje sekretów
- [ ] Dodać do dokumentacji: jak rotować sekrety, jak dodawać nowe

## Bezpieczeństwo

| Wektor ataku | Jak chronimy |
|--------------|--------------|
| `ps aux` / `/proc/environ` | Sekrety w pipe, nie w env |
| Logi błędów | Child process nie loguje surowego sekretu |
| Memory dump | Sekrety w pamięci — standardowe ryzyko; można wymusić `memfd-secret` (Linux) |
| Pliki tymczasowe | Żadne tempfile — tylko pipe |
| Crash dump | Unikać dumpowania zmiennych z sekretami |

## Kiedy używać

Użyj tego patternu gdy:
- ✅ Uruchamiasz zewnętrzny tool/script z API key
- ✅ Potrzebujesz przekazać token do kolejnego AI/modelu
- ✅秘书 (secret) jest potrzebny tylko raz na początku procesu

Nie używaj gdy:
- ❌ Sekret jest potrzebny ciągle (np. w pętli) — wtedy lepiej w env ale z lockiem
- ❌ Krótkotrwały process bez child spawn — wtedy po prostu nie loguj

---

**Następny krok:** Zatwierdzić z Elathoxu wybór backendu (Vault vs encrypted file) i implementować `src/runtime/secrets.ts`.
