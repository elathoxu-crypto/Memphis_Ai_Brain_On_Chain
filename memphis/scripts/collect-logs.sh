#!/usr/bin/env bash
set -euo pipefail
CHAIN_DIR="$HOME/.memphis/chains/logs-efemerald"
mkdir -p "$CHAIN_DIR"
SNAP_FILE=$(mktemp)
{
  echo "===== TIMESTAMP: $(date -Iseconds) ====="
  echo "# memphis status (summary)"
  memphis status | head -n 80 || true
  echo
  echo "# openclaw logs (last 40 lines)"
  openclaw logs | tail -n 40 || true
} > "$SNAP_FILE"
latest=$(ls "$CHAIN_DIR"/*.json 2>/dev/null | sort | tail -n1)
if [ -z "$latest" ]; then idx=1; prev=$(printf '0%.0s' {1..64}); else idx=$((10#$(basename "$latest" .json)+1)); prev=$(python3 -c 'import json,sys; print(json.load(sys.stdin)["hash"])' < "$latest"); fi
CONTENT=$(python3 -c 'import json,sys; import textwrap; data=sys.stdin.read();
print(json.dumps(data if len(data)<=6000 else data[-6000:]))' < "$SNAP_FILE")
cat > /tmp/block.json <<JSON
{
  "index": $idx,
  "timestamp": "$(date -Iseconds)",
  "chain": "logs-efemerald",
  "data": {
    "type": "logs",
    "content": $CONTENT,
    "tags": ["tui","diag"],
    "meta": {"origin":"collect-logs.sh"}
  },
  "prev_hash": "$prev"
}
JSON
python3 - <<'PY'
import json,hashlib
with open('/tmp/block.json') as f:
    block=json.load(f)
block['hash']=hashlib.sha256(json.dumps(block,ensure_ascii=False).encode()).hexdigest()
with open('/tmp/block.json','w') as f:
    json.dump(block,f,ensure_ascii=False,indent=2)
PY
mv /tmp/block.json "$CHAIN_DIR/$(printf "%06d" $idx).json"
rm "$SNAP_FILE"
