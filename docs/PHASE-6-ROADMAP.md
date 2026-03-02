# PHASE 6 — Intelligence (Q3 2026)

**Start Date:** 2026-03-01
**Target:** Make Memphis SMARTER — auto-categorize, suggest, detect conflicts, summarize better

---

## 🎯 GOAL

Transform Memphis from **passive storage** → **active intelligence**

**Before Phase 6:**
- User tags manually: `--tags learning,code`
- No reminders if user forgets
- Decisions can contradict without warning
- Summaries are basic (top-N blocks)

**After Phase 6:**
- Auto-tagging based on content ML
- Proactive nudges ("You haven't journaled in 3 days")
- Conflict alerts when decisions contradict
- Smart summaries (key insights extracted)

---

## 📋 WORK ITEMS

### 1. **Auto-Categorization** (3-4 days)
**Problem:** Manual tagging is tedious, inconsistent

**Solution:** ML-based auto-tagging
- Analyze block content (NLP)
- Suggest tags based on patterns
- Learn from user corrections
- Configurable confidence threshold

**Implementation:**
- New file: `src/categorization/classifier.ts`
- Use local Ollama for classification (no API calls)
- Tags: code, learning, decision, question, idea, reflection, personal
- Confidence threshold: 0.7 (configurable)
- Fallback to manual tags if low confidence

**CLI:**
```bash
memphis journal "Fixed bug in auth" --auto-tag
# → Auto-tags: code, bugfix, auth

memphis classify journal:0-100  # Retrospective tagging
```

**Config:**
```yaml
categorization:
  enabled: true
  provider: ollama  # or openai
  model: qwen2.5-coder:3b
  confidence: 0.7
  autoApply: true  # If false, just suggest
```

**Tests:**
- Unit: classifier logic
- Integration: journal → auto-tag → verify
- E2E: 10 blocks, check accuracy

---

### 2. **Proactive Suggestions** (2-3 days)
**Problem:** User forgets to journal, no reminders

**Solution:** Nudge system via daemon
- Check last journal timestamp
- Suggest based on patterns ("You usually journal on Sundays")
- Integration with existing cron jobs

**Implementation:**
- Extend `src/daemon/checks/` with `JournalStalenessCheck`
- Threshold: 24h (warning), 72h (alert)
- Notification: Write to dedicated `suggestions` chain
- TUI: New screen showing active suggestions

**CLI:**
```bash
memphis suggest list      # Show current suggestions
memphis suggest dismiss <id>
memphis suggest settings  # Configure thresholds
```

**Config:**
```yaml
suggestions:
  enabled: true
  journalWarningHours: 24
  journalAlertHours: 72
  channels: [cli, tui]  # Future: discord, email
```

**Checks:**
- Journal staleness (24h/72h)
- Stale decisions (30 days without review)
- Unanswered questions (blocks with tag `question`)
- Vault backup reminder (7 days)

**Tests:**
- Unit: staleness detection
- Integration: daemon → suggest → verify chain
- E2E: skip journaling for 3 days, check alert

---

### 3. **Conflict Detection** (2-3 days)
**Problem:** Decisions can contradict without warning

**Solution:** Semantic conflict detection
- Compare new decision with existing ones
- Flag contradictions (same topic, different choice)
- Suggest review/revoke

**Implementation:**
- New file: `src/decisions/conflict-detector.ts`
- Use embeddings to find similar decisions
- Check if choices conflict (semantic similarity + manual rules)
- Severity: low (similar topic), medium (partial overlap), high (direct contradiction)

**CLI:**
```bash
memphis decide "Use MiniMax" "Faster" --check-conflicts
# → ALERT: Conflicts with decision#5 "Use Ollama" (reason: offline-first)

memphis conflicts list
memphis conflicts resolve <id> --revoke <decision-id>
```

**Config:**
```yaml
decisions:
  conflictDetection: true
  similarityThreshold: 0.75  # Embedding similarity
  autoAlert: true  # Write to suggestions chain
```

**Tests:**
- Unit: conflict detection logic
- Integration: decide → conflict → verify alert
- E2E: make 2 contradictory decisions, check conflict appears

---

### 4. **Smart Summarization** (3-4 days)
**Problem:** Current summaries are basic (just top-N blocks)

**Solution:** Extract KEY INSIGHTS
- Identify themes (clustering)
- Extract key phrases (TF-IDF or LLM)
- Generate narrative summary (LLM)
- Highlight changes/trends

**Implementation:**
- Extend `src/summarization/` with smart mode
- Phase 1: Clustering (k-means on embeddings)
- Phase 2: LLM narrative (Ollama/OpenAI)
- Output: JSON + markdown

**CLI:**
```bash
memphis summarize --smart --range "2026-02-01:2026-02-28"
# → Themes: [coding, memphis, decisions]
# → Key insights: "Built Memphis v1.5.0, focused on UX"
# → Narrative: "February was dominated by..."

memphis summarize --weekly --smart
```

**Config:**
```yaml
summarization:
  smart: true
  provider: ollama
  model: qwen2.5-coder:3b
  maxInsights: 5
  maxThemes: 3
```

**Tests:**
- Unit: clustering logic
- Integration: summarize → verify themes
- E2E: 100 blocks, check narrative quality

---

## 📊 SUCCESS METRICS

| Metric | Target |
|--------|--------|
| Auto-tag accuracy | >80% (manual review) |
| Suggestion relevance | >70% (user feedback) |
| Conflict detection precision | >90% (no false positives) |
| Summary usefulness | >4/5 rating (user survey) |

---

## 🗓️ TIMELINE

| Week | Items |
|------|-------|
| 1 (Mar 1-7) | Auto-categorization (classifier + CLI) |
| 2 (Mar 8-14) | Proactive suggestions (daemon + TUI) |
| 3 (Mar 15-21) | Conflict detection + Smart summarization |
| 4 (Mar 22-31) | Polish + testing + docs |

---

## 🧪 TESTING STRATEGY

1. **Unit tests** — Each component isolated
2. **Integration tests** — End-to-end flows
3. **E2E tests** — Real workflows (journal → suggest → resolve)
4. **Manual QA** — Elathoxu testing daily
5. **Dogfooding** — Watra uses all features actively

---

## 📚 DOCUMENTATION UPDATES

- [ ] Update NEXUS.md with Phase 6 features
- [ ] Add `docs/AUTO-TAGGING.md`
- [ ] Add `docs/PROACTIVE-SUGGESTIONS.md`
- [ ] Add `docs/CONFLICT-DETECTION.md`
- [ ] Add `docs/SMART-SUMMARIZATION.md`
- [ ] Update QUICKSTART.md with new commands

---

## 🚀 START HERE

**First item:** Auto-Categorization

**Why:**
- Highest impact (tags power everything: search, graph, summary)
- Self-contained (no dependencies on other Phase 6 items)
- Visible immediately (user sees auto-tags)

**First step:** Create `src/categorization/classifier.ts`

---

**Created:** 2026-03-01 16:53 CET
**Status:** READY TO START
