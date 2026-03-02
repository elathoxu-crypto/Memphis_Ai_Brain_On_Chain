#!/usr/bin/env bash
set -euo pipefail

REPORT_ROOT="reports/security"
TIMESTAMP="$(date +%Y-%m-%dT%H:%M:%S%z)"
REPORT_FILE="$REPORT_ROOT/security-check-$(date +%Y%m%d-%H%M).md"
WORKSPACE_ROOT="/home/memphis/.openclaw/workspace"
MEMPHIS_HOME="${MEMPHIS_HOME:-/home/memphis/.memphis}"

mkdir -p "$REPORT_ROOT"

pretty_json() {
  if command -v jq >/dev/null 2>&1; then
    jq '.'
  else
    python3 -m json.tool
  fi
}

append_heading() {
  echo "## $1" >> "$REPORT_FILE"
}

cat > "$REPORT_FILE" <<EOF
# Security Checklist Report
- Generated: $TIMESTAMP
- Workspace: $WORKSPACE_ROOT

EOF

append_heading "Memphis status"
if command -v memphis >/dev/null 2>&1; then
  if STATUS_JSON=$(memphis status --json 2>/dev/null); then
    echo '\```json' >> "$REPORT_FILE"
    echo "$STATUS_JSON" | pretty_json >> "$REPORT_FILE"
    echo '\```' >> "$REPORT_FILE"
  else
    echo "memphis status failed" >> "$REPORT_FILE"
  fi
else
  echo "memphis CLI not found" >> "$REPORT_FILE"
fi

append_heading "Vault chain summary"
if [ -d "$MEMPHIS_HOME/chains/vault" ]; then
  VAULT_BLOCKS=$(ls -1 "$MEMPHIS_HOME/chains/vault" | wc -l)
  echo "- Vault blocks: $VAULT_BLOCKS" >> "$REPORT_FILE"
  echo "- Latest files:" >> "$REPORT_FILE"
  ls -1 "$MEMPHIS_HOME/chains/vault" | tail -n 5 | sed 's/^/  - /' >> "$REPORT_FILE"
else
  echo "Vault chain directory missing at $MEMPHIS_HOME/chains/vault" >> "$REPORT_FILE"
fi

append_heading "Git ignore safeguards"
GITIGNORE_FILE="$WORKSPACE_ROOT/.gitignore"
if grep -q 'memphis/.memphis/' "$GITIGNORE_FILE" 2>/dev/null; then
  echo "- .gitignore includes memphis/.memphis/ ✅" >> "$REPORT_FILE"
else
  echo "- WARNING: memphis/.memphis/ missing from .gitignore" >> "$REPORT_FILE"
fi
if grep -q '^memory/' "$GITIGNORE_FILE" 2>/dev/null; then
  echo "- memory/ ignored ✅" >> "$REPORT_FILE"
else
  echo "- WARNING: memory/ not ignored" >> "$REPORT_FILE"
fi

append_heading "Status server token"
if [ -n "${MEMPHIS_STATUS_TOKEN:-}" ]; then
  echo "- MEMPHIS_STATUS_TOKEN present in env ✅" >> "$REPORT_FILE"
else
  echo "- WARNING: MEMPHIS_STATUS_TOKEN not set (server.js would be public)" >> "$REPORT_FILE"
fi

append_heading "Ops chain (last 5 entries)"
if [ -d "$MEMPHIS_HOME/chains/ops" ]; then
  echo '\```' >> "$REPORT_FILE"
  tail -n 5 "$MEMPHIS_HOME/chains/ops"/*.json 2>/dev/null | head -n 200 >> "$REPORT_FILE"
  echo '\```' >> "$REPORT_FILE"
else
  echo "ops chain not found" >> "$REPORT_FILE"
fi

append_heading "Next steps"
cat >> "$REPORT_FILE" <<'EOF'
- Review project_task_vault_policy.md and ensure rotations logged with tag `vault-rotation`.
- Confirm no secrets exist in OpenClaw workspace (grep for API signatures).
- Update Memphis journal with "security audit" summary.
EOF

if command -v memphis >/dev/null 2>&1; then
  memphis journal --tags security,autodoc "Security checklist auto-doc saved to $REPORT_FILE"
fi

echo "Security report written to $REPORT_FILE"
