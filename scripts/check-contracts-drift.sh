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

# sankalps.ts — pure data array; contracts copy has @ts-nocheck header but data is identical
echo "Checking sankalps.ts (data content check — ignoring @ts-nocheck header)..."
RN_SANKALPS="$MOBILE/src/data/sankalps.ts"
CT_SANKALPS="$CONTRACTS/data/sankalps.ts"

# Strip @ts-nocheck line from contracts before comparing
RN_CONTENT=$(grep -v '@ts-nocheck' "$RN_SANKALPS")
CT_CONTENT=$(grep -v '@ts-nocheck' "$CT_SANKALPS")
if [ "$RN_CONTENT" != "$CT_CONTENT" ]; then
  echo "DRIFT: sankalps.ts — data content differs"
  diff <(echo "$RN_CONTENT") <(echo "$CT_CONTENT") | head -20 || true
  DRIFT=1
else
  echo "OK: sankalps.ts"
fi

# mantras.ts — contracts copy has updated locale import paths and no AsyncStorage rotation
# Check that the type definitions and core exports are present in contracts
echo "Checking mantras.ts (type + export check)..."
CT_MANTRAS="$CONTRACTS/data/mantras.ts"
for symbol in "MantraItem" "MantraSource" "PickMantraOptions" "CATALOGS" "pickMantra" "getCatalog"; do
  if ! grep -q "$symbol" "$CT_MANTRAS"; then
    echo "DRIFT: mantras.ts — missing export: $symbol"
    DRIFT=1
  fi
done
if ! grep -q "DRIFT: mantras" <<< "$(echo "")"; then
  # Check each locale key exists in CATALOGS (keys are unquoted: `en: EN`)
  for locale in en hi mr bn ta te kn ml gu or; do
    if ! grep -q "  $locale:" "$CT_MANTRAS"; then
      echo "DRIFT: mantras.ts — missing locale: $locale"
      DRIFT=1
    fi
  done
  echo "OK: mantras.ts"
fi

# Practice.ts — contracts copy exports pure utility functions (Zustand store stays in mobile)
echo "Checking Practice.ts (utility function check)..."
CT_PRACTICE="$CONTRACTS/data/Practice.ts"
for symbol in "getDeityForWeekday" "getWeekday" "getTodayDateString" "seededRandom" "WEEKDAY_DEITY"; do
  if ! grep -q "$symbol" "$CT_PRACTICE"; then
    echo "DRIFT: Practice.ts — missing export: $symbol"
    DRIFT=1
  fi
done
# Verify Zustand/AsyncStorage did NOT leak into contracts copy (skip comment lines)
if grep -v '^\s*//' "$CT_PRACTICE" | grep -q "import AsyncStorage\|from 'zustand'\|from \"zustand\""; then
  echo "DRIFT: Practice.ts — contracts copy contains platform-specific imports"
  DRIFT=1
else
  echo "OK: Practice.ts"
fi

echo ""
if [ "$DRIFT" -eq 1 ]; then
  echo "FAIL: contracts drift detected. Update packages/contracts/src/ to match."
  exit 1
else
  echo "PASS: contracts is in sync with apps/mobile source."
fi
