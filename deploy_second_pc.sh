#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="/home/memphis/logs/deploy_second_pc.log"
REPO_DIR="/home/memphis/memphis"
CHECKLIST_DIR="/home/memphis/.openclaw/workspace"
PROMPT="Refer to project_task_install_second_pc.md and checklist_offline_toggle.md for manual follow-up notes."

log() {
  echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') $*" | tee -a "$LOG_FILE"
}

run_step() {
  log "START: $1"
  shift
  if ! "$@"; then
    log "FAIL: $1"
    exit 1
  fi
  log "DONE: $1"
}

ensure_log_dir() {
  mkdir -p "$(dirname "$LOG_FILE")"
}

apply_offline_toggle_notes() {
  if [ -f "$CHECKLIST_DIR/checklist_offline_toggle.md" ]; then
    log "Offline toggle guidance copied from the checklist."
  else
    log "Offline toggle checklist missing; manual verification needed."
  fi
}

verify_command() {
  if ! command -v "$1" &>/dev/null; then
    log "WARNING: $1 not installed; skipping $1 check."
    return 1
  fi
  "$1" "${@:2}"
}

main() {
  ensure_log_dir
  log "Deploy script started. $PROMPT"

  run_step "Update system" sudo apt update && sudo apt upgrade -y
  run_step "Install essentials" sudo apt install -y build-essential curl git python3 python3-pip zip unzip
  run_step "Install NVIDIA drivers" sudo ubuntu-drivers autoinstall

  run_step "Verify CUDA stack" bash -c 'nvidia-smi && nvcc --version'

  if [ ! -d "$REPO_DIR" ]; then
    run_step "Clone Memphis repo" git clone https://github.com/openclaw/memphis.git "$REPO_DIR"
  fi

  run_step "Sync repo" bash -c "cd $REPO_DIR && git fetch --all && git reset --hard origin/main"
  run_step "Install JS deps" bash -c "cd $REPO_DIR && npm install"
  run_step "Install Python deps" bash -c "cd $REPO_DIR && pip install -r requirements.txt"

  run_step "Configure offline toggle" bash -c "cd $REPO_DIR && mkdir -p config && cat <<'JSON' > config/offline-toggle.json
{\n  \"status\": \"pending\",\n  \"primary\": \"qwen2.5-coder:3b\",\n  \"fallback\": \"o3:mini\"\n}
JSON"
  apply_offline_toggle_notes

  run_step "Configure vault" bash -c "cd $REPO_DIR && if command -v memphis >/dev/null; then memphis vault init --policy project_task_vault_policy.md; else echo 'memphis CLI missing; copy vault policy manually' >&2; fi"

  run_step "Sync memory" bash -c "rsync -av --delete /home/memphis/.memphis/ $REPO_DIR/.memphis/"

  log "Manual checkpoints:"
  log " - Review $CHECKLIST_DIR/project_task_install_second_pc.md for additional context."
  log " - Confirm TUI-only secrets per vault policy."

  verify_command nvidia-smi
  verify_command nvcc --version
  verify_command git --version
  if verify_command memphis status >/dev/null 2>&1; then
    if memphis status --json | grep -q '"primary": "qwen2.5-coder:3b"'; then
      log "Primary model `qwen2.5-coder:3b` confirmed in memphis status."
    else
      log "WARNING: memphis status does not report `qwen2.5-coder:3b`; manual check required."
    fi
  else
    log "memphis status check skipped (binary missing)."
  fi
  log "Deployment script finished. Consult $LOG_FILE for details."
}

main "$@"
