# Memphis Phase 2 — Row-Level Security Blueprint

_Last updated: 2026-02-28_

## Cel
Wprowadzić polityki per-workspace, aby każdy agent widział i zapisywał tylko bloki przypisane do jego przestrzeni roboczej. To fundament dla share-sync, `memphis trade` oraz ekspozycji MCP.

## Założenia
- Wzorujemy się na Synjar SPEC-001: polityki RLS + zmienna sesyjna `current_workspace_id`.
- Domyślny workspace = `default`. Kolejne (np. `style`, `watra`) dziedziczą ustawienia, ale mogą mieć własne whitelisty chainów/tagów.

## Zakres techniczny
1. **Konfiguracja (`src/config/security.ts`)**
   - Sekcja `workspaces`: nazwa → { id, allowedChains, allowedTags, sharePolicy }.
   - Loader waliduje istnienie `default`.

2. **Store Wrapper**
   - `store.forWorkspace(workspaceId)` owija `Store` i filtruje:
     - `readChain` / `readBlock` zwracają tylko bloki z dopasowanym tagiem `workspace:<id>` (albo bez tagu, jeśli `includeDefault`).
     - `appendBlock` automatycznie dodaje tag `workspace:<id>`.

3. **CLI / Env**
   - Env: `MEMPHIS_WORKSPACE_ID`.
   - Komenda: `memphis workspace list/set <id>` (aktualizuje plik konfiguracyjny lub lokalny `.memphis/workspace`).
   - `memphis status` pokazuje bieżący workspace + politykę.

4. **share-sync / ingest / agent**
   - Każde źródło danych przechodzi przez `WorkspaceGuard`.
   - Share-sync odrzuca bloki spoza dozwolonego workspace, loguje naruszenia.

5. **Audit log**
   - Nowy łańcuch `security` na wpisy typu "blocked_write", "blocked_read".

## Kroki implementacyjne
1. Dodać schema + testy dla konfiguracji workspace (vitest `config/loader.test.ts`).
2. Rozszerzyć `Store` o `WorkspaceGuard` (+ testy w `memory/store.test.ts`).
3. CLI: `memphis workspace list/set`, aktualizacja `status` (wyświetla workspace oraz zasady).
4. share-sync, ingest, bot daemon → wpiąć guard.
5. Dokumentacja: niniejszy plik + aktualizacja `docs/SECURITY.md`.
6. Migracja tagów: skrypt dodający `workspace:default` do istniejących bloków.
7. Testy integracyjne z dwoma workspace (default/style):
   - brak przecieków między chainami,
   - share-sync odrzuca bloki spoza polityki,
   - CLI poprawnie przełącza workspace.

## Następne kroki
Po wdrożeniu RLS przechodzimy do kolejnych elementów Phase 2: `memphis trade` (DID-signed manifesty) oraz exposing Memphis jako MCP server.

---

## Implementation Notes (2026-03-01)

### Config Schema draft
```ts
export interface WorkspacePolicy {
  id: string;                // slug, e.g. "default", "watra"
  title?: string;            // human readable
  allowedChains?: string[];  // default = all
  allowedTags?: string[];    // e.g. ["workspace:default"]
  includeDefault?: boolean;  // allow blocks without workspace tag
  sharePolicy?: {
    allowPush?: boolean;
    allowPull?: boolean;
    forwardTags?: string[];  // tags kept when exporting
  };
}

export interface SecurityConfig {
  workspaces: Record<string, WorkspacePolicy>;
  defaultWorkspace: string;  // must exist in workspaces map
}
```
- Loader responsibilities:
  1. Ensure `defaultWorkspace` exists and has `allowedChains` fallback of `['journal', 'thoughts']` to avoid empty reads on fresh installs.
  2. Inject implicit tag `workspace:<id>` into `allowedTags` if not provided.
  3. Provide derived map `workspaceTagMap[id] = workspace:<id>` for fast guard checks.

### WorkspaceGuard responsibilities
1. `guard = new WorkspaceGuard(store, policy);`
2. `guard.appendBlock(block)` →
   - ensures tag `workspace:<id>` is present (adds if missing)
   - validates `block.chain` ∈ `policy.allowedChains`
   - drops/throws if `sharePolicy.allowPush === false` while context = share-sync push
3. `guard.readBlocks(query)` → wraps upstream iterator, filtering by `workspace:<id>` tag unless `policy.includeDefault`.
4. Emits `security` chain entries when operation blocked:
```ts
await store.appendBlock({
  chain: 'security',
  type: 'policy_violation',
  tags: ['workspace:' + policy.id],
  metadata: { action: 'append', reason: 'chain_not_allowed', blockId }
});
```

### CLI behaviour
- `memphis workspace list` → table with id, chains, includeDefault, sharePolicy flags, derived tag.
- `memphis workspace set <id>` → persists to `~/.memphis/workspace` (single line JSON `{ "id": "watra" }`).
- `memphis status` → new section:
```
Workspace
  current: watra (includeDefault=false, allowedChains=journal/thoughts)
  source: ~/.memphis/workspace (overrides MEMPHIS_WORKSPACE_ID)
```
- Env precedence: `MEMPHIS_WORKSPACE_ID` > local file > config default.

### Migration plan
1. New CLI `memphis workspace migrate --tag-only` → adds `workspace:default` tag to every block lacking workspace tag.
2. Provide dry-run + backup: writes patched blocks to `~/.memphis/migrations/ws-default-<timestamp>.jsonl` before commit.
3. After migration, `includeDefault=false` can be enforced to guarantee segregation.

### Test checklist
- `config/security.test.ts`: rejects configs without `default`, duplicates, invalid chains.
- `workspace-guard.test.ts`: ensures filtering + tag injection.
- `cli/workspace.test.ts`: list + set + precedence.
- `share-sync.guard.test.ts`: pushing block from `style` while current workspace=`watra` triggers violation.

### Open questions
- Should guard throw hard or soft-log on read attempts outside policy? (proposal: hard error unless explicitly `--ignore-rls`).
- Need convenience helper for migrations when user already tags blocks (avoid double tagging?).
- Determine default behaviour for agents without workspace config (fallback to `default` + warning).
