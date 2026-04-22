#!/bin/bash
set -euo pipefail

HISTORY_FILE=".deploy-history"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "$HISTORY_FILE" ]; then
    echo "ERROR: No deploy history found at $HISTORY_FILE"
    exit 1
fi

TOTAL_DEPLOYS=$(wc -l < "$HISTORY_FILE")

if [ "$TOTAL_DEPLOYS" -lt 2 ]; then
    echo "ERROR: Not enough deploy history to rollback (need at least 2 entries)"
    echo "Current history:"
    cat "$HISTORY_FILE"
    exit 1
fi

CURRENT_TAG=$(tail -1 "$HISTORY_FILE" | awk '{print $2}')
PREVIOUS_TAG=$(tail -2 "$HISTORY_FILE" | head -1 | awk '{print $2}')

echo "==> Rolling back from $CURRENT_TAG to $PREVIOUS_TAG"
"$SCRIPT_DIR/deploy.sh" "$PREVIOUS_TAG"
