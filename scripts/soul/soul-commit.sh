#!/usr/bin/env bash
set -euo pipefail

SOUL_PATH="${SOUL_PATH:-$HOME/.memphis/SOUL.md}"
SNAP_PATH="${SOUL_SNAPSHOT_PATH:-$HOME/.memphis/SOUL.snapshot.md}"
CHAIN="${SOUL_CHAIN:-soul}"
TAGS="${SOUL_TAGS:-soul,audit}"

if [[ ! -f "$SOUL_PATH" ]]; then
  echo "[soul-commit] Missing SOUL file at $SOUL_PATH" >&2
  exit 1
fi

if [[ ! -f "$SNAP_PATH" ]]; then
  mkdir -p "$(dirname "$SNAP_PATH")"
  touch "$SNAP_PATH"
  echo "[soul-commit] Initialized snapshot at $SNAP_PATH"
fi

DIFF_OUTPUT="$(diff -u "$SNAP_PATH" "$SOUL_PATH" || true)"

if [[ -z "$DIFF_OUTPUT" ]]; then
  echo "[soul-commit] No changes detected"
  exit 0
fi

TEMP_FILE="$(mktemp)"
{
  echo "SOUL update $(date -Is)"
  echo
  echo '```diff'
  echo "$DIFF_OUTPUT"
  echo '```'
} > "$TEMP_FILE"

memphis journal --chain "$CHAIN" --tags "$TAGS" "$(cat "$TEMP_FILE")"

cp "$SOUL_PATH" "$SNAP_PATH"
rm "$TEMP_FILE"

echo "[soul-commit] Logged SOUL diff to chain '$CHAIN' and updated snapshot"
