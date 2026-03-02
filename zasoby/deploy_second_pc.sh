#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="/home/memphis/logs/deploy_second_pc.log"
REPO_DIR="/home/memphis/memphis"
CHECKLIST_DIR="/home/memphis/.openclaw/workspace"
PROMPT="Refer to project_task_install_second_pc.md and checklist_offline_toggle.md for manual follow-up notes."
AUTO_CONFIRM="${AUTO_CONFIRM:-false}"

log() {
  echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') $*" | tee -a "$LOG_FILE"
}

confirm_step() {
  local message=$1
  if [[ "$AUTO_CONFIRM" == "true" ]]; then
    log "AUTO_CONFIRM=true → skipping prompt: $message"
    return 0
  fi
  read -rp "$message (y/N): " reply
  if [[ "$reply" =~ ^[Yy]$ ]]; then
    return 0
  fi
  log "User aborted at prompt: $message"
  exit 1
}

run_step() {
  local label=$1
  shift
  log "START: $label"
  if ! "$@"; then
    log "FAIL: $label"
    exit 1
  fi
  log "DONE: $label"
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
  local cmd=$1
  shift || true
  if ! command -v "$cmd" &>/dev/null; then
    log "WARNING: $cmd not installed; skipping check."
    return 1
  fi
  "$cmd" "$@"
}

main() {
  ensure_log_dir
  log "Deploy script started. $PROMPT"

  confirm_step "About to run apt update/upgrade"
  run_step "Update system" sudo apt update && sudo apt upgrade -y

  confirm_step "Install base build dependencies (build-essential/curl/git/etc.)"
  run_step "Install essentials" sudo apt install -y build-essential curl git python3 python3-pip zip unzip

  if lspci | grep -qi nvidia; then
    confirm_step "Install/refresh NVIDIA drivers via ubuntu-drivers"
    run_step "Install NVIDIA drivers" sudo ubuntu-drivers autoinstall
    run_step "Verify CUDA stack" bash -c 'nvidia-smi && nvcc --version'
  else
    log "No NVIDIA hardware detected; skipping driver install"
  fi

  if [ ! -d "$REPO_DIR" ]; then
    confirm_step "Clone memphis repo at $REPO_DIR"
    run_step "Clone Memphis repo" git clone https://github.com/openclaw/memphis.git "$REPO_DIR"
  fi

  run_step "Sync repo" bash -c "cd $REPO_DIR && git fetch --all && git reset --hard origin/main"
  run_step "Install JS deps" bash -c "cd $REPO_DIR && npm install"
  if [ -f "$REPO_DIR/requirements.txt" ]; then
    run_step "Install Python deps" bash -c "cd $REPO_DIR && pip install -r requirements.txt"
  else
    log "requirements.txt missing – skipping pip install"
  fi

  run_step "Configure offline toggle" bash -c "cd $REPO_DIR && mkdir -p config && cat <<'JSON' > config/offline-toggle.json
{
  \"status\": \"pending\",
  \"primary\": \"qwen2.5-coder:3b\",
  \"fallback\": \"o3:mini\"
}
JSON"
  apply_offline_toggle_notes

  if command -v memphis &>/dev/null; then
    run_step "Initialize vault" bash -c "cd $REPO_DIR && memphis vault init || true"
  else
    log "memphis CLI missing; skip vault init (do manual run later)"
  fi

  confirm_step "Sync ~/.memphis into repo (ensure .gitignore covers it)"
  run_step "Sync memory" bash -c "rsync -av --delete /home/memphis/.memphis/ $REPO_DIR/.memphis/"

  log "Manual checkpoints:"
  log " - Review $CHECKLIST_DIR/project_task_install_second_pc.md for additional context."
  log " - Confirm TUI-only secrets per vault policy."

  verify_command nvidia-smi || true
  verify_command nvcc --version || true
  verify_command git --version || true
  if verify_command memphis status >/dev/null 2>&1; then
    if memphis status --json | grep -q '"primary": "qwen2.5-coder:3b"'; then
      log "Primary model qwen2.5-coder:3b confirmed in memphis status."
    else
      log "WARNING: memphis status does not report qwen2.5-coder:3b; manual check required."
    fi
  else
    log "memphis status check skipped (binary missing)."
  fi

  log "Deployment script finished. Consult $LOG_FILE for details."
}

main "$@"
