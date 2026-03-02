# Veiled Nexus Operational Guide

Updated: 2026-02-25

This guide covers the day-to-day operations for the Memphis + Veiled Nexus stack: installing Memphis on a second machine, running the enhanced TUI, handling USB deployments, and serving the local status dashboard safely.

---

## 1. Pre-flight checklist (all machines)

1. Ensure you have the latest `Memphis_Ai_Brain_On_Chain` repo (`git pull`).
2. Review:
   - `project_task_install_second_pc.md`
   - `project_task_vault_policy.md`
   - `checklist_offline_toggle.md`
3. Confirm backups exist (`memory-backup`, `.memphis` zip, etc.).
4. Export any required API keys into a secure vault (Memphis TUI → Vault screen). Keys should **not** land in OpenClaw notes.

---

## 2. Running the safer deploy script

Script: `deploy_second_pc.sh`

### Highlights of the new version
- Uses `set -euo pipefail` and logs to `/home/memphis/logs/deploy_second_pc.log`.
- Prompts before destructive operations (apt upgrade, driver install, rsync). Set `AUTO_CONFIRM=true` to skip prompts when you know what you’re doing.
- Skips NVIDIA driver steps automatically if no NVIDIA hardware is detected.
- Guards `rsync ~/.memphis` with a prompt so you don’t accidentally sync onto a machine you’re auditing.
- Vault init runs only if the `memphis` CLI is available, otherwise it leaves a log reminder.

### Example run
```bash
cd ~/.openclaw/workspace
chmod +x deploy_second_pc.sh
./deploy_second_pc.sh          # interactive
AUTO_CONFIRM=true ./deploy_second_pc.sh   # fully automatic
```

Monitor progress in `tail -f /home/memphis/logs/deploy_second_pc.log`.

After the script:
1. Open `project_task_install_second_pc.md` and check off manual steps.
2. Confirm Memphis TUI launches (`cd ~/memphis && npm run memphis -- tui`).
3. Update Memphis journal with the deploy outcome.

---

## 3. Memphis TUI quick actions (new hotkeys)

| Key | Action | Notes |
|-----|--------|-------|
| `n` | Nexus Echo | Prompts for text → journal entry with tags `nexus,echo`.
| `r` | Role Switcher | Cycle between `operator / ingester / advisor`. Header + ops log update.
| `s` | Sync Chains | Appends `[Sync]` entry to `ops`, updates dashboard timestamp.
| `b` | Backup log | Appends `[Backup]` entry to `ops`, updates dashboard timestamp.
| `g` | Guarded Terminal | Toggles `locked → armed → open`, logs to `ops` and shows instructions.
| `h` | Help Viewer | Renders snippets from `README.md` + `deployment_package_manifest.md`.
| `u` | USB Mode | Detects `/mnt/usb` or `/media/$USER/*`, logs `[USB]` entry.

The header now shows active role, LLM model, offline state, guarded mode, USB status, and timestamps for the last sync/backup.

---

## 4. USB deployment workflow

1. Plug the drive and mount it (`/mnt/usb` preferred; fallback `/media/<user>/<label>`).
2. In TUI press `u` → confirms detection and creates an `[USB] Verified device …` entry in `ops`.
3. Copy artifacts:
   - `Memphis_deployment_package.zip`
   - `veiled-nexus-pack-v0.1.zip`
4. Verify checksums if needed (`sha256sum <file>` stored in the journal).
5. Safely unmount (`sudo umount /mnt/usb`).

If the TUI says “USB not detected”, mount manually and re-run `u`.

---

## 5. Local status server (hardened)

File: `server.js`

Updates:
- Port configurable via `MEMPHIS_STATUS_PORT` (default 8080).
- Token protection via `MEMPHIS_STATUS_TOKEN`. Requests must include `X-Memphis-Token: <token>` header or `?token=<token>` in the URL.
- API responses return 401 when unauthorized.

### Running securely
```bash
export MEMPHIS_STATUS_TOKEN="set-a-long-random-token"
node server.js
# or
MEMPHIS_STATUS_PORT=8787 MEMPHIS_STATUS_TOKEN=supersecret node server.js
```
Visit `http://localhost:8787/memphis-status.html?token=supersecret` or set the header in curl.

**Do not expose this port to the public internet without additional protections (reverse proxy, firewall).**

---

## 6. Reporting + journal

After any significant action (deploy, USB sync, guard toggle), record it in Memphis via:
```bash
memphis journal --tags project,veiled-nexus "<what happened>"
```

This keeps the chain hash-consistent and ties real-world work to the AI memory.

---

Need help or spot a gap? Add notes to `session-report.md` and drop a journal entry tagged `docs` so future iterations stay aligned.
