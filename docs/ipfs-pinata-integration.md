# Integracja Memphis z IPFS (Pinata)

Dokument opisuje kompletny projekt integracji pamięci Memphis z IPFS przy użyciu platformy Pinata. Zakres obejmuje konfigurację API, strukturę danych, wrapper w TypeScripcie, zasady automatycznego czyszczenia, konfigurację w `config.yaml` oraz przykład użycia.

---

## 1. Pinata API Setup

1. Wejdź na [https://pinata.cloud](https://pinata.cloud) i utwórz konto (plan Free w pełni wystarcza dla wymagań: maks. 100 pinów).
2. Po zalogowaniu przejdź do **API Keys** → **New Key**.
3. Zaznacz uprawnienia:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
   - `unpin`
   - `pinList`
4. Zanotuj `API Key`, `API Secret` oraz `JWT`. W integracji rekomendujemy użycie JWT (Bearer token) – Pinata generuje je automatycznie na podstawie API Key/Secret.
5. Dane uwierzytelniające przechowuj w bezpiecznym menedżerze lub w `.env` (np. `PINATA_JWT`).

---

## 2. Struktura kontenera JSON dla bloków

Każdy blok Memphis, który trafia na IPFS, powinien mieć lekką i jednoznaczną strukturę. Maksymalny rozmiar JSON-a to **1 KB** (limity darmowego konta + wymagania projektu).

```jsonc
{
  "id": "uuid-v4",
  "timestamp": "2026-02-25T18:20:00.000Z",
  "ttl": 2592000,              // 30 dni w sekundach
  "type": "journal" | "vault" | "memory",
  "content": {
    // właściwe dane bloku, np. tekst, referencje, metadane
  },
  "hashPrev": "Qm...",        // opcjonalny łańcuch bloków
  "tags": ["memphis", "ipfs", "pinata"]
}
```

**Reguły walidacji:**
- Zasymiluj długość pola `content` tak, by cały dokument nie przekraczał 1024 bajtów. W razie potrzeby dziel dane na wiele bloków lub kompresuj w aplikacji źródłowej.
- `ttl = 30 dni (2592000 s)` – wartość trafia do `cleanupOldPins()`.
- `tags` pomagają filtrować wyniki w Pinacie (np. po `metadata[name]`).

---

## 3. Wrapper `src/integrations/pinata.ts`

Plik eksportuje cztery główne funkcje: `pinJSON`, `unpin`, `getPinned`, `cleanupOldPins`. Wszystkie korzystają z axios/fetch oraz JWT w nagłówku `Authorization: Bearer <token>`.

```ts
// src/integrations/pinata.ts
import fetch from "node-fetch";

const PINATA_BASE = "https://api.pinata.cloud";
const MAX_PINS = 100;
const TTL_SECONDS = 30 * 24 * 60 * 60; // 30 dni

interface PinJSONPayload {
  id: string;
  timestamp: string;
  ttl: number; // 30 dni
  type: string;
  content: Record<string, unknown>;
  hashPrev?: string;
  tags?: string[];
}

interface PinataConfig {
  jwt: string;             // Bearer token
  gateway?: string;        // np. https://gateway.pinata.cloud/ipfs/
  metadataName?: string;   // default: "memphis-block"
}

const headers = (jwt: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${jwt}`,
});

export async function pinJSON(payload: PinJSONPayload, cfg: PinataConfig) {
  const res = await fetch(`${PINATA_BASE}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: headers(cfg.jwt),
    body: JSON.stringify({
      pinataMetadata: {
        name: cfg.metadataName ?? "memphis-block",
        keyvalues: {
          id: payload.id,
          type: payload.type,
        },
      },
      pinataOptions: {
        cidVersion: 1,
      },
      pinataContent: payload,
    }),
  });

  if (!res.ok) {
    throw new Error(`Pinata pinJSON failed: ${res.status} ${await res.text()}`);
  }

  return res.json(); // zawiera IpfsHash, PinSize, Timestamp
}

export async function unpin(cid: string, cfg: PinataConfig) {
  const res = await fetch(`${PINATA_BASE}/pinning/unpin/${cid}`, {
    method: "DELETE",
    headers: headers(cfg.jwt),
  });

  if (!res.ok) {
    throw new Error(`Pinata unpin failed: ${res.status} ${await res.text()}`);
  }
}

export interface PinItem {
  ipfs_pin_hash: string;
  date_pinned: string;
  metadata?: { keyvalues?: Record<string, string> };
}

export async function getPinned(cfg: PinataConfig): Promise<PinItem[]> {
  const res = await fetch(`${PINATA_BASE}/data/pinList?status=pinned&metadata[name]=${cfg.metadataName ?? "memphis-block"}`, {
    headers: headers(cfg.jwt),
  });

  if (!res.ok) {
    throw new Error(`Pinata getPinned failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.rows ?? [];
}

export async function cleanupOldPins(cfg: PinataConfig) {
  const pins = await getPinned(cfg);
  const now = Date.now();

  // Sortuj malejąco po dacie – najnowsze pierwsze
  pins.sort((a, b) => new Date(b.date_pinned).getTime() - new Date(a.date_pinned).getTime());

  const pinsToDelete: PinItem[] = [];

  pins.forEach((pin, idx) => {
    const pinnedAt = new Date(pin.date_pinned).getTime();
    const ageSeconds = (now - pinnedAt) / 1000;

    const overLimit = idx >= MAX_PINS;
    const expired = ageSeconds > TTL_SECONDS;

    if (overLimit || expired) {
      pinsToDelete.push(pin);
    }
  });

  for (const pin of pinsToDelete) {
    await unpin(pin.ipfs_pin_hash, cfg);
  }

  return { removed: pinsToDelete.length, total: pins.length };
}
```

**Ważne uwagi:**
- `pinJSON` powinien być wywoływany tylko po weryfikacji rozmiaru payloadu (`Buffer.byteLength(JSON.stringify(payload)) <= 1024`).
- `cleanupOldPins` usuwa wszystko ponad 100 najnowszych wpisów oraz wszystkie piny starsze niż 30 dni (TTL).
- Obsługę błędów loguj w Memphis (np. `logger.warn`, `logger.error`).

---

## 4. Automatyczne czyszczenie

- **Limit pinów:** darmowe konto Pinata umożliwia do 100 pinów – integracja utrzymuje ten limit, usuwając najstarsze wpisy.
- **TTL 30 dni:** każdy blok ma żywotność 30 dni. Proces cleanup sprawdza datę przypięcia vs. `TTL_SECONDS`.
- **Harmonogram:** uruchamiaj `cleanupOldPins()`:
  - przy starcie aplikacji,
  - cyklicznie co 6 godzin (cron/worker),
  - po każdej operacji pinowania (opcjonalnie – przyspiesza reakcję na limit).

---

## 5. Konfiguracja `config.yaml`

Przykładowa sekcja:

```yaml
ipfs:
  provider: pinata
  enabled: true
  jwt: ${PINATA_JWT}
  metadataName: memphis-block
  gateway: https://gateway.pinata.cloud/ipfs/
  limits:
    maxPins: 100
    maxBlockSizeBytes: 1024
    ttlDays: 30
  cleanup:
    schedule: "0 */6 * * *"   # co 6h
    runOnStartup: true
```

**Uwagi konfiguracji:**
- `jwt` może pochodzić z `.env`/secret store.
- `limits.maxPins`, `maxBlockSizeBytes`, `ttlDays` są przekazywane do wrappera (możesz je podać przez DI/konfigurację runtime).
- `cleanup.schedule` – integracja z istniejącym schedulerem Memphis (np. node-cron).

---

## 6. Przykład użycia

```ts
import { pinJSON, cleanupOldPins } from "../src/integrations/pinata";
import { v4 as uuid } from "uuid";

async function syncBlockToIPFS(blockContent: Record<string, unknown>) {
  const cfg = {
    jwt: process.env.PINATA_JWT!,
    metadataName: "memphis-block",
  };

  const payload = {
    id: uuid(),
    timestamp: new Date().toISOString(),
    ttl: 30 * 24 * 60 * 60,
    type: "journal",
    content: blockContent,
  };

  const size = Buffer.byteLength(JSON.stringify(payload));
  if (size > 1024) {
    throw new Error(`Blok przekracza 1KB (ma ${size} B). Podziel dane przed wysłaniem.`);
  }

  const result = await pinJSON(payload, cfg);
  console.log("Pinned block", result.IpfsHash);

  await cleanupOldPins(cfg); // utrzymuj limit i TTL
}
```

---

## 7. Podsumowanie wymagań

- **Maks. rozmiar bloku:** 1 KB – wymuszaj po stronie aplikacji.
- **TTL:** 30 dni → `cleanupOldPins` usuwa starsze wpisy.
- **Max pins:** 100 – zachowaj najnowsze, resztę odpinaj.
- **Bezpieczeństwo:** używaj JWT, przechowuj je w secret store.
- **Monitorowanie:** loguj sukcesy/błędy pinowania i cleanup, aby łatwo śledzić stan integracji.

Dokument ten stanowi kompletny projekt integracji Memphis ↔ IPFS (Pinata) i może zostać bezpośrednio zaimplementowany w kodzie źródłowym systemu.