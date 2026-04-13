#!/usr/bin/env bash
#
# capture-screenshots.sh
#
# Runs the Mitra v3 screenshot Maestro flows and copies the resulting PNGs into
# a single organized directory ready for Figma import.
#
# Usage:
#   ./scripts/capture-screenshots.sh              # all flag-independent flows
#   ./scripts/capture-screenshots.sh onboarding   # just onboarding (moments 1-7)
#   ./scripts/capture-screenshots.sh dashboard    # dashboard + runners
#   ./scripts/capture-screenshots.sh support      # support + reflection + rooms
#   ./scripts/capture-screenshots.sh flag_gated   # week 6/7 cards (needs backend flags)
#
# Output: screenshots/mitra-v3/*.png

set -eu

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

OUT_DIR="$REPO_ROOT/screenshots/mitra-v3"
mkdir -p "$OUT_DIR"

FILTER="${1:-all}"

flow_for() {
  case "$1" in
    onboarding) echo ".maestro/screenshots/10_onboarding_turns.yaml" ;;
    dashboard)  echo ".maestro/screenshots/20_dashboard_and_runners.yaml" ;;
    support)    echo ".maestro/screenshots/30_support_reflection_rooms.yaml" ;;
    flag_gated) echo ".maestro/screenshots/40_companion_intelligence_flag_gated.yaml" ;;
    *) echo "" ;;
  esac
}

run_flow() {
  local flow="$1"
  local name
  name=$(basename "$flow" .yaml)
  echo ""
  echo ">> Running $name"
  echo "   $flow"

  local before
  before=$(ls -1 "$HOME/.maestro/tests/" 2>/dev/null | sort | tail -1 || true)

  # Prefer explicit device if set; otherwise pick booted iOS sim (where our
  # local Xcode build just installed).
  local MAESTRO_UDID_ARG=""
  if [ -n "${MAESTRO_UDID:-}" ]; then
    MAESTRO_UDID_ARG="--udid $MAESTRO_UDID"
  else
    local ios_udid
    ios_udid=$(xcrun simctl list devices booted 2>/dev/null | grep -E '\(Booted\)' | head -1 | grep -oE '[0-9A-F-]{36}' || true)
    if [ -n "$ios_udid" ]; then
      MAESTRO_UDID_ARG="--udid $ios_udid"
      echo "   Using booted iOS sim: $ios_udid"
    fi
  fi

  maestro $MAESTRO_UDID_ARG test "$flow" || echo "   (flow had failures — takeScreenshot still fires on optional:true taps)"

  local after
  after=$(ls -1 "$HOME/.maestro/tests/" 2>/dev/null | sort | tail -1 || true)

  if [ -z "${after:-}" ] || [ "${before:-}" = "$after" ]; then
    echo "   !! no new Maestro test dir found — skipping copy"
    return
  fi

  local src_dir="$HOME/.maestro/tests/$after"
  local copied=0
  if ls "$src_dir"/*.png > /dev/null 2>&1; then
    for png in "$src_dir"/*.png; do
      local base
      base=$(basename "$png")
      cp "$png" "$OUT_DIR/$base"
      copied=$((copied + 1))
    done
  fi
  echo "   OK: copied $copied PNG(s) to $OUT_DIR/"
}

if [ "$FILTER" = "all" ]; then
  run_flow "$(flow_for onboarding)"
  run_flow "$(flow_for dashboard)"
  run_flow "$(flow_for support)"
  echo ""
  echo "Skipped flag_gated (Week 6/7 cards)."
  echo "Run ./scripts/capture-screenshots.sh flag_gated AFTER backend enables"
  echo "MITRA_V3_POST_CONFLICT, _JOY_SIGNAL, _RESILIENCE_NARRATIVE."
else
  flow=$(flow_for "$FILTER")
  if [ -z "$flow" ]; then
    echo "Unknown filter: $FILTER"
    echo "Use: onboarding | dashboard | support | flag_gated | all"
    exit 1
  fi
  run_flow "$flow"
fi

echo ""
count=$(ls -1 "$OUT_DIR"/*.png 2>/dev/null | wc -l | tr -d ' ')
echo "--- Done. $count PNG(s) in $OUT_DIR/ ---"
echo "Next: Figma > File > Place Image > select all PNGs from that folder."
