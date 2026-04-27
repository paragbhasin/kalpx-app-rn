#!/usr/bin/env bash
# Drift CI: verify packages/contracts is in sync with apps/mobile source.
# Any PR that modifies apps/mobile/allContainers.js or cleanupFields.ts must
# also update the corresponding file in packages/contracts/src/. This script
# fails with a non-zero exit code if they have drifted.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE="$REPO_ROOT/apps/mobile"
CONTRACTS="$REPO_ROOT/packages/contracts/src"

DRIFT=0

check_file() {
  local src="$1"
  local dst="$2"
  local label="$3"

  if ! diff -q "$src" "$dst" > /dev/null 2>&1; then
    echo "DRIFT: $label"
    echo "  mobile:    $src"
    echo "  contracts: $dst"
    diff "$src" "$dst" | head -20 || true
    echo ""
    DRIFT=1
  else
    echo "OK: $label"
  fi
}

echo "=== Contracts drift check ==="
echo ""

# allContainers.js — core container definitions
check_file \
  "$MOBILE/allContainers.js" \
  "$CONTRACTS/allContainers.js" \
  "allContainers.js"

# cleanupFields.ts — NOTE: contracts version intentionally has 6 extra Vue
# parity fields in the checkin section. We compare only the RN-owned fields.
# A full diff would false-positive on those 6 lines, so we check that the
# contracts file is a superset (every line in the RN source exists in contracts).
echo "Checking cleanupFields.ts (superset check — contracts adds 6 Vue fields)..."
RN_CLEANUP="$MOBILE/src/engine/cleanupFields.ts"
CT_CLEANUP="$CONTRACTS/cleanupFields.ts"

# Verify every non-comment, non-blank line from RN source exists in contracts
MISSING=$(grep -v '^\s*//' "$RN_CLEANUP" | grep -v '^\s*$' | while read -r line; do
  if ! grep -qF "$line" "$CT_CLEANUP"; then
    echo "  MISSING: $line"
  fi
done)

if [ -n "$MISSING" ]; then
  echo "DRIFT: cleanupFields.ts — RN lines missing from contracts:"
  echo "$MISSING"
  DRIFT=1
else
  echo "OK: cleanupFields.ts"
fi

echo ""
if [ "$DRIFT" -eq 1 ]; then
  echo "FAIL: contracts drift detected. Update packages/contracts/src/ to match."
  exit 1
else
  echo "PASS: contracts is in sync with apps/mobile source."
fi
