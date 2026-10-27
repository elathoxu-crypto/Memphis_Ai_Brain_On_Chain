# Cockpit Core (ADR-011) — findings from the Ratatui/Tauri investigation

**Date:** 2026-10-27
**Where the code lives:** `Memphis-Chains/memphis` (upstream), PR #698 + PR #699
**Canonical ADR:** `docs/adr/011-cockpit-core-and-tauri-shell.md` in that repo (371 lines)
**Status:** design merged, Layer 1 (cockpit ergonomics) merged and measured

This repo does not hold the code. This file records **what was discovered**, so the
next session does not have to rediscover it — and so the reasoning survives even if
the upstream repo moves on.

---

## The headline

The Ratatui cockpit's *brain* is already renderer-agnostic. That is the fact that
makes a second surface cheap, and it was not obvious from the outside.

```
crates/memphis-tui/src/app.rs      7 125 LOC   brain: state, keys, routing, workers, streaming
crates/memphis-tui/src/client.rs   1 152 LOC   runtime client + extension-host manager
crates/memphis-tui/src/ui.rs         448 LOC   renderer
crates/memphis-tui/src/widgets/*   ~1 180 LOC   renderer
```

`grep -n "ratatui" crates/memphis-tui/src/app.rs` returns **nothing**. The same for
`client.rs`. Only the renderer imports Ratatui.

The model is semantic too: `LineTone` (`Plain | Title | Header | Section | Info |
Success | Warning | Error | Dim | Accent | Prompt`) is mapped to styles only in
`widgets/mod.rs::tone_to_style`.

**Consequence:** a second surface needs a second **renderer**, not a second brain.
A second implementation of the brain would be the expensive mistake.

---

## The seven findings

| # | Finding | Evidence |
|---|---|---|
| F1 | The brain has zero Ratatui imports | `grep -n ratatui crates/memphis-tui/src/{app,client}.rs` → empty |
| F2 | Two complete chat stacks; only one streams | Rust: `ChatStreamEvent::Text` (token-level). TS: `src/providers/index.ts:284` → `stream: false`. A GUI on the TS path would have **no streaming**. |
| F2b | Both stacks write the same table with complementary columns | `operator_chat_messages`: Rust fills `tool_calls_json`, TS fills `provider`/`model`. Live DB: 7 649 rows / 26 sessions; `provider` null on 4 423 rows. |
| F3 | The input caret was **never rendered** | `Hide` on enter (`main.rs:98,105`), `Show` only on exit; `grep -rn set_cursor_position crates/ src/` → no match. The prompt was `Constraint::Length(1)` — one row, so long prompts were silently truncated. |
| F4 | Scrollback was unsearchable | `OUTPUT_BUFFER_LIMIT = 1200` (`app.rs:25`); live sessions hold 1 447 / 782 / 737 messages. The longest sessions were the least navigable. |
| F5 | The host protocol serialises everything | `src/infra/tui-host/index.ts:80-85` rejects a second request while one is in flight — a GUI cannot poll status during a chat. |
| F6 | **ADR-010's "missing system libraries" diagnosis was wrong for this host** | All five Tauri-v2 deps present: webkit2gtk-4.1 2.54.1, javascriptcoregtk-4.1 2.54.1, libsoup-3.0 3.8.0, gtk+-3.0 3.24.52, ayatana-appindicator3-0.1 0.6.1. The old finding came from Debian `apt` package names applied to an Arch box (`libayatana-appindicator3-dev` vs the pkg-config name `ayatana-appindicator3-0.1`). |
| F7 | The frontend-framework question was never answered | `review.md:13`, open since 2026-05-12. Recommendation: no framework — the renderer is ~400 LOC and the GUI is optional. |

### The seam that already existed

`src/infra/tui-host/` is a versioned NDJSON RPC over stdio — protocol version 1, 37
capabilities, `ready` handshake, `execute`/`cancel`, and a contract test
(`tests/unit/tui-host.test.ts`). The comment at
`src/infra/cli/commands/interaction.ts:98` says it outright:

> `tui host` is the stdio-json protocol mode used by GUI consumers

A Tauri GUI is therefore **a second client of a protocol that was written for it** —
not a project from scratch. That is the cheapest possible starting point, and it had
been sitting there unused.

---

## What was built (Layer 1 — the cockpit ergonomics)

Three defects in the cockpit the operator uses daily, all fixed:

- **A real caret.** Ratatui 0.30 shows the cursor when a frame requests a position
  and hides it otherwise — so the fix was to compute the caret exactly and place it.
  The caret is a byte offset that always sits on a char boundary.
- **An editable, multi-line prompt.** It wraps, grows to as much as 8 rows, and
  scrolls to keep the caret visible. `Alt+Enter` inserts a newline, `Enter` still
  submits, `Left`/`Right`/`Delete`/`Ctrl+A`/`Ctrl+E` work. The input used to be
  strictly append-only (`Backspace` called `String::pop()`), so a typo in the middle
  could not be fixed at all.
- **`Ctrl+F` searches the scrollback**, with a live match counter, reverse-video
  hits and the current one on a yellow background. The scroll-to-match is anchored,
  so an open search does not drag the view back on every frame.
- **`Ctrl+Y` copies the last answer** over OSC 52 — the only clipboard path a
  raw-mode terminal process has. Mouse capture is off by default precisely because
  text selection is the dominant use, so this is the keyboard route to the same thing.
- **`F5` refreshes.** The main loop's comment had promised "F5 / Ctrl-R" while only
  wiring up the Ctrl half — which is what freed `Ctrl+F` for the search.

167 unit tests, the whole Rust workspace green, zero clippy warnings in the touched
files.

---

## The four layers, in order of "value if we stop here"

1. **Ergonomics** — done, merged. Worth more than any GUI and needs no refactor.
2. **Extract the brain** into a Ratatui-free `memphis-cockpit` crate — 8 277 LOC to
   move, no behaviour change. Only pays off once a second surface exists.
3. **Tauri as a second shell** over that core, frontend in vanilla TypeScript,
   reaching the 37 non-chat capabilities through the existing protocol.
4. **Protocol v2** — `chat.turn` + streaming + per-capability concurrency.

## Open decisions (not decided here)

- **Is a graphical surface wanted at all?** Layers 1–2 stand alone.
- **Tauri vs a lighter Quickshell client.** Protocol-first makes this a *choice*,
  not a rewrite: both speak the same NDJSON, but Quickshell does not carry a ~300 MB
  webview and integrates with the desktop the operator already runs.
- **Unifying the Rust/TS chat stacks** — deliberately a separate ADR. It is the
  largest remaining behavioural difference between surfaces.
