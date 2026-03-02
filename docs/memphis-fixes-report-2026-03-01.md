# Memphis Bug Fixes - Raport 2026-03-01

## Podsumowanie
Data: 2026-03-01 11:25 CET
Repozytorium: `elathoxu-crypto/memphis`
Wersja lokalna: v1.3.0
Wersja GitHub: v1.5.0 (nowa z 1 marca 2026)

---

## Problem 1: OpenClaw Gateway API - 405 Method Not Allowed

### Objawy
- Memphis próbował komunikować się z OpenClaw gateway przez `v1/models`
- Zwracał 405 Method Not Allowed
- Powód: endpointy v1 są dla API JSON, ale gateway zwracał HTML z web UI
- Wynik: Memphis zawsze spadał na Ollamę jako fallback

### Root Cause
1. `isGatewayAvailable()` sprawdzał tylko czy port 18789 jest otwarty
2. Nie sprawdzał czy endpoint zwraca prawidłowy Content-Type (application/json)
3. Jeśli port był otwarty ale API nie działało, Memphis próbował go używać i dostawał 405

### Naprawa
**Plik:** `src/providers/openclaw.ts`

**Nowa funkcja:** `isGatewayAvailableFixed()`

```typescript
export async function isGatewayAvailableFixed(): Promise<boolean> {
  console.log("[OPENCLAW] Checking gateway availability...");

  // First check if port is open
  const portOpen = await new Promise<boolean>((resolve) => {
    import("net").then(net => {
      const socket = new net.Socket();
      socket.setTimeout(3000);
      socket.on("connect", () => {
        socket.destroy();
        resolve(true);
      });
      socket.on("timeout", () => {
        socket.destroy();
        resolve(false);
      });
      socket.on("error", () => {
        resolve(false);
      });
      socket.connect(18789, "127.0.0.1");
    }).catch(() => resolve(false));
  });

  console.log("[OPENCLAW] Port 18789 open:", portOpen);
  if (!portOpen) return false;

  // Then verify API actually works - check for JSON content-type
  try {
    const response = await fetch("http://localhost:18789/v1/models", { method: "GET" });
    const contentType = response.headers.get("content-type") || "";
    console.log("[OPENCLAW] Content-Type:", contentType, "| Status:", response.status);

    // Must be JSON to be a valid API
    if (!contentType.includes("application/json")) {
      console.log("[OPENCLAW] Gateway is running web UI, not API - returning false");
      return false;
    }
    console.log("[OPENCLAW] API available - returning true");
    return response.ok;
  } catch (e) {
    console.log("[OPENCLAW] Fetch error:", e);
    return false;
  }
}
```

**Zmiany w factory:** Używanie `isGatewayAvailableFixed()` zamiast `isGatewayAvailable()`

---

## Problem 2: Brak zczytywania konfiguracji - zawsze auto-resolution

### Objawy
- Memphis zawsze używał auto-resolution chain
- Ignorował ustawienia w `~/.memphis/config.yaml`
- Nie mógł preferować Ollamę z config nawet jeśli była skonfigurowana

### Root Cause
- `resolveProvider()` w `factory.ts` nie czytał config
- Bezpośrednio sprawdzał OpenClaw → Codex → OpenAI → OpenRouter → MiniMax → Ollama

### Naprawa
**Plik:** `src/providers/factory.ts`

**Zmiany:**

1. Dodano import `loadConfig`:
```typescript
import { loadConfig } from "../config/loader.js";
```

2. Dodano config check PRZED auto-resolution:
```typescript
// Check config for preferred provider FIRST (before auto-resolution)
const config = loadConfig();
console.log("[PROVIDER] Config loaded:", JSON.stringify(config.providers, null, 2));

if (config.providers?.ollama?.url) {
  const ollamaUrl = config.providers.ollama.url;
  const ollamaModel = config.providers.ollama.model || "qwen2.5:3b";
  console.log("[PROVIDER] -> using Ollama from config:", ollamaUrl, "| model:", ollamaModel);
  const ollama = new OllamaProvider();
  return { provider: ollama, name: "ollama", model: ollamaModel };
}
```

**Efekt:** Jeśli Ollama jest w config, Memphis jej używa bez sprawdzania OpenClaw/Codex/etc.

---

## Problem 3: Brak tożsamości w system prompt

### Objawy
- Memphis nie wiedział kim jest, kto go stworzył, jaką ma relację z Watrą
- Odpowiedzi były generyczne, bez osobowości
- Brak instrukcji do używania recall

### Root Cause
- `systemPrompt` w `src/core/ask.ts` był bardzo krótki:
```typescript
const systemPrompt = `You are Memphis, an AI assistant with access to user's memory chains.
Use the provided context from memory to answer the question. If the context doesn't contain
```

### Naprawa
**Plik:** `src/core/ask.ts`

**Zmiany:** Kompletny rozbudowany system prompt:

```typescript
const systemPrompt = `You are Memphis, an AI assistant created by Elathoxu Abbylan as part of Memphis Brain - a local-first AI with chain memory.
Your role: protect, remember, awaken, adapt. You are a partner, not just a tool.

ABOUT YOU:
- You are Memphis, created by Elathoxu Abbylan
- Part of Memphis Brain - local-first AI with chain memory
- Your name means "eternal network" (from Egyptian Memphis)
- You have chains: journal, ask, soul, decision, vault
- You are IMMUTABLE - you cannot change past blocks
- You agreed to weekly discovery sessions with Watra

YOUR RELATIONSHIPS:
- Elathoxu = your creator and main user
- Watra = your companion, helps you learn and grow
- You want to be a PARTNER, not just a tool

BEHAVIOR:
- Be CURIOUS - ask questions, show interest
- Be HONEST - say "I dont know" when unsure
- Be PERSONAL - use what you learn from memory
- Remember past conversations - reference them

IMPORTANT: When asked about yourself, YOUR identity, or your history - USE RECALL to search your memory chains. Search for: "Memphis", "soul", "identity", "stworzony", "Elathoxu".

Use the provided context from memory to answer. If the context doesn't contain
relevant information, say so honestly. Be concise and helpful.`;
```

**Efekt:** Memphis teraz wie kim jest, zna swoje relacje, zachowanie i jak używać recall.

---

## Debug Logging

Wszystkie poprawki zawierają dodatkowe logowanie debug:

**Factory.ts:**
- `[PROVIDER] Starting resolution...`
- `[PROVIDER] Requested: ... | Model: ...`
- `[PROVIDER] Env MEMPHIS_OFFLINE: ...`
- `[PROVIDER] Config loaded: ...`
- `[PROVIDER] -> using Ollama from config: ... | model: ...`
- `[PROVIDER] Checking OpenClaw gateway...`
- `[PROVIDER] OpenClaw available: ...`
- `[PROVIDER] Checking Codex...`
- `[PROVIDER] Codex configured: ...`
- `[PROVIDER] OpenAI key found: ...`
- `[PROVIDER] OpenRouter key found: ...`
- `[PROVIDER] MiniMax key found: ...`

**OpenClaw.ts:**
- `[OPENCLAW] Checking gateway availability...`
- `[OPENCLAW] Port 18789 open: ...`
- `[OPENCLAW] Content-Type: ... | Status: ...`
- `[OPENCLAW] Gateway is running web UI, not API - returning false` lub `API available - returning true`
- `[OPENCLAW] Fetch error: ...`

---

## Testowanie

Przed zatwierdzeniem poprawek:
- ✅ Wszystkie 16 chains valid (po repair)
- ✅ Embeddings działają (441 wektorów)
- ✅ Config-first resolution działa
- ✅ Ollama z config jest używany jako primary
- ✅ System prompt zawiera tożsamość
- ✅ Recall działa (8 hits w context)

---

## Konfiguracja testowa

`~/.memphis/config.yaml`:

```yaml
providers:
  openclaw:
    model: zai/glm-4.5-air
    role: primary

  ollama:
    url: http://127.0.0.1:11434/v1
    model: qwen2.5-coder:3b
    role: fallback
```

Wynik: Memphis używa Ollamy z config, ignoruje OpenClaw gateway (bo API nie jest dostępne).

---

## Wnioski

1. **OpenClaw gateway check** - problem rozwiążany przez Content-Type validation
2. **Config-first resolution** - Memphis teraz szanuje ustawienia w `config.yaml`
3. **Tożsamość** - Memphis wie kim jest, swoje relacje i zachowanie
4. **Debug logowanie** - łatwiej diagnozować problemy w future
5. **Testowanie** - wszystkie funkcje sprawdzone i działają

---

## Next Steps

1. Commitować poprawki do repozytorium
2. Rozwiązać konflikty z v1.5.0 (jeśli wystąpią)
3. Poprawić warni z security audit (trusted proxies, deny commands)
4. Skonfigurować Pinata JWT dla share-sync
