# Second PC Test Roadmap — Real User Experience

**Started:** 2026-03-02 18:35 CET
**Environment:** `memphis_ai_brain_on_chain@memphis` (second PC)
**Goal:** Test fresh install experience + collect real user feedback

---

## Phase 1: Fresh Install Experience (30-45 min)

### 1.1 Clean State ✅ DONE
- [x] Remove OpenClaw + old Memphis
- [x] Clean crontab
- [x] Fresh Ubuntu environment

### 1.2 Installation Flow Test ⏳ TODO
**Test Steps:**
1. Clone Memphis from GitHub
   ```bash
   git clone https://github.com/elathoxu-crypto/memphis.git
   cd memphis
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Build project
   ```bash
   npm run build
   ```

4. **CRITICAL TEST:** Try `memphis init`
   ```bash
   node dist/cli/index.js init
   ```
   
   **Expected behavior:**
   - ✅ Interactive prompts (password, workspace config)
   - ✅ Creates `~/.memphis/config.yaml`
   - ✅ Sets up directory structure
   
   **Actual behavior (v1.7.1):**
   - ❌ Launches TUI instead of init flow
   - ❌ No interactive prompts
   - ❌ Config must be created manually

**User Experience Feedback:**
- **Pain Point #1:** `init` command broken (launches TUI, not init)
- **Pain Point #2:** No guided setup (must manually create config)
- **Pain Point #3:** TUI crashes on first input (editor.clear bug)

**Fix Required:**
- `init` should show interactive prompts, not TUI
- Add fallback: if TTY not available, create default config

---

### 1.3 First Run Experience ⏳ TODO
**Test Steps:**
1. Manual config creation (workaround for broken init)
   ```bash
   mkdir -p ~/.memphis/chains
   cat > ~/.memphis/config.yaml << 'EOF'
   memory:
     path: ~/.memphis/chains
   providers:
     ollama:
       type: ollama
       url: http://127.0.0.1:11434/v1
       model: qwen2.5-coder:3b
       enabled: true
   embeddings:
     enabled: true
     backend: local-ollama
     model: nomic-embed-text
   EOF
   ```

2. Check status
   ```bash
   node dist/cli/index.js status
   ```

3. Create first memory
   ```bash
   node dist/cli/index.js journal "First memory on fresh install" --tags test,first
   ```

4. Query Memphis
   ```bash
   node dist/cli/index.js ask "Co to Memphis?"
   ```

5. Test recall
   ```bash
   node dist/cli/index.js recall "first"
   ```

**Expected behavior:**
- ✅ Status shows chains + provider
- ✅ Journal saves memory
- ✅ Ask returns response
- ✅ Recall finds memory

**Actual behavior (v1.7.1):**
- ✅ All CLI commands work (stable)
- ⚠️ Status sometimes launches TUI (bug)
- ❌ TUI crashes on input

**User Experience Feedback:**
- **Pain Point #4:** Config creation not intuitive
- **Pain Point #5:** No `memphis init --guided` option
- **Pain Point #6:** Status command inconsistent (sometimes launches TUI)

---

## Phase 2: Core Functionality Tests (30-45 min)

### 2.1 Journal System ⏳ TODO
**Tests:**
1. Basic journal entry
   ```bash
   memphis journal "Test basic entry" --tags test,basic
   ```

2. Multi-tag entry
   ```bash
   memphis journal "Complex entry with many tags" --tags test,complex,multi,tag,names
   ```

3. Long entry (paragraph)
   ```bash
   memphis journal "This is a longer entry with multiple sentences. It should test how Memphis handles longer text. We want to see if embeddings work correctly for longer content." --tags test,long
   ```

4. Special characters
   ```bash
   memphis journal "Test with special chars: @#$%^&*()_+-=[]{}|;':\",./<>?" --tags test,special
   ```

5. Unicode/Polish characters
   ```bash
   memphis journal "Test polskich znaków: ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ" --tags test,polish
   ```

**Expected:** All entries saved correctly, searchable

---

### 2.2 Semantic Search (Recall) ⏳ TODO
**Tests:**
1. Exact match
   ```bash
   memphis recall "basic entry"
   ```

2. Semantic match (related concept)
   ```bash
   memphis recall "memory storage"
   ```

3. Polish language query
   ```bash
   memphis recall "polskie znaki"
   ```

4. Multi-word query
   ```bash
   memphis recall "longer text embeddings"
   ```

**Expected:** Top 3-5 results with relevance scores

**Metrics to track:**
- Relevance scores (0.0-1.0)
- Query time (should be <500ms with cache)
- Result accuracy (manual evaluation)

---

### 2.3 Ask Command ⏳ TODO
**Tests:**
1. Factual question
   ```bash
   memphis ask "Kim stworzył Memphis?"
   ```

2. Contextual question (should use recall)
   ```bash
   memphis ask "O czym pisałem w test entries?"
   ```

3. Creative question
   ```bash
   memphis ask "Opowiedz mi historię o Memphis"
   ```

4. Polish language
   ```bash
   memphis ask "Jak działa pamięć semantyczna w Memphis?"
   ```

**Expected:** 
- Response <5s (local Ollama)
- Context-aware (uses recall internally)
- Polish language support

---

### 2.4 Provider Tests ⏳ TODO
**Tests:**
1. Ollama connectivity
   ```bash
   curl http://127.0.0.1:11434/v1/models
   ```

2. Model availability
   ```bash
   ollama list
   ```

3. Embedding model
   ```bash
   ollama pull nomic-embed-text
   ```

4. Switch models (config test)
   ```yaml
   # Test different models
   providers:
     ollama:
       model: bielik-1.5b-v3.0  # Polish model
   ```

**Expected:** All providers work, embeddings functional

---

## Phase 3: Edge Cases & Error Handling (30 min)

### 3.1 Error Scenarios ⏳ TODO
**Tests:**
1. No config file
   ```bash
   rm ~/.memphis/config.yaml
   memphis status
   ```
   **Expected:** Clear error message with fix instructions

2. Invalid config
   ```yaml
   # Corrupt config
   providers:
     ollama:
       url: "not-a-url"
   ```
   **Expected:** Validation error with suggestions

3. Missing provider
   ```bash
   # Ollama not running
   sudo systemctl stop ollama
   memphis ask "test"
   ```
   **Expected:** Graceful degradation or clear error

4. Empty chain
   ```bash
   memphis recall "nothing"  # No blocks exist
   ```
   **Expected:** "No results found" message

5. Network timeout
   ```bash
   # Simulate slow network
   memphis ask "test" --timeout 1
   ```
   **Expected:** Timeout error, not crash

---

### 3.2 Performance Tests ⏳ TODO
**Tests:**
1. Large batch insert
   ```bash
   for i in {1..100}; do
     memphis journal "Batch test entry $i" --tags batch,test,$i
   done
   ```
   **Expected:** All saved, <5s total

2. Recall performance
   ```bash
   time memphis recall "batch test"
   ```
   **Expected:** <500ms with cache

3. Concurrent operations
   ```bash
   # Open 3 terminals, run simultaneously:
   # Terminal 1: memphis journal "test1"
   # Terminal 2: memphis ask "test2"
   # Terminal 3: memphis recall "test3"
   ```
   **Expected:** No race conditions, all succeed

---

## Phase 4: TUI Testing (After Fix) ⏳ TODO

### 4.1 TUI Functionality (requires fix)
**Tests:**
1. Launch TUI
   ```bash
   memphis tui
   ```
   
2. Navigation
   - [ ] Exit TUI (Ctrl+C)
   - [ ] Check for crash bugs

3. **BLOCKED:** Input handling (crashes on Enter in v1.7.1)

**Required Fix:**
- Remove `this.editor.clear()` bug
- Load real chain data (not hardcoded demo)
- Fix auto-launch from status command

---

## Phase 5: User Experience Feedback Form ⏳ TODO

### 5.1 Install Experience Rating
- **Ease of installation:** ⭐⭐⭐⭐⭐ (1-5)
- **Time to first success:** ___ minutes
- **Biggest friction point:** ___
- **Missing documentation:** ___

### 5.2 CLI Experience Rating
- **Command clarity:** ⭐⭐⭐⭐⭐
- **Error messages:** ⭐⭐⭐⭐⭐
- **Performance:** ⭐⭐⭐⭐⭐
- **Best feature:** ___
- **Most confusing:** ___

### 5.3 Functionality Rating
- **Journal:** ⭐⭐⭐⭐⭐
- **Ask:** ⭐⭐⭐⭐⭐
- **Recall:** ⭐⭐⭐⭐⭐
- **Semantic search accuracy:** ___%

### 5.4 Overall Impression
- **Would recommend:** Yes/No
- **Missing features:** ___
- **Bugs encountered:** ___
- **Suggestions:** ___

---

## Test Schedule

**Today (2026-03-02):**
- ⏳ Phase 1: Fresh Install (30-45 min)
- ⏳ Phase 2: Core Functionality (30-45 min)
- ⏳ Phase 3: Edge Cases (30 min)
- ⏳ Phase 5: Feedback Form (15 min)

**After TUI Fix (v1.7.2):**
- ⏳ Phase 4: TUI Testing (30 min)

**Total estimated time:** 2-3 hours

---

## Known Issues (v1.7.1)

### Critical Bugs
1. ❌ **TUI crash on input** (`editor.clear()` doesn't exist)
2. ❌ **`init` command broken** (launches TUI instead of init flow)
3. ⚠️ **Status auto-launches TUI** (inconsistent behavior)

### UX Issues
1. ⚠️ **No guided setup** (must manually create config)
2. ⚠️ **Hardcoded demo data in TUI** (doesn't read real chains)
3. ⚠️ **No first-run wizard** (new users lost)

### Missing Features
1. ⚠️ **No config validation** (accepts invalid YAML)
2. ⚠️ **No provider health check** (doesn't verify Ollama running)
3. ⚠️ **No graceful degradation** (crashes if provider missing)

---

## Success Criteria

**Minimum Viable:**
- ✅ CLI commands work (journal, ask, recall, status)
- ✅ Semantic search functional
- ✅ Local provider (Ollama) works
- ✅ Embeddings cached

**Target:**
- ✅ First success <5 minutes
- ✅ All core commands documented
- ✅ Error messages helpful
- ✅ Performance <500ms for most operations

**Stretch:**
- ✅ TUI functional (no crashes)
- ✅ Guided init flow
- ✅ Auto-detect provider
- ✅ Config validation

---

## Next Actions

**Immediate (before tests):**
1. ⏳ Clear second PC environment (if needed)
2. ⏳ Document current state
3. ⏳ Prepare test checklist

**During tests:**
1. ⏳ Follow Phase 1-3 sequentially
2. ⏳ Record all errors/friction points
3. ⏳ Time each operation
4. ⏳ Take notes on UX

**After tests:**
1. ⏳ Fill feedback form
2. ⏳ Prioritize bugs by severity
3. ⏳ Create GitHub issues
4. ⏳ Plan v1.7.2 fixes

---

**Status:** Ready to begin Phase 1
**Next:** Start fresh install test on second PC
