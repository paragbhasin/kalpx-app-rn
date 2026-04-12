#!/usr/bin/env bash
#
# capture-screenshots.sh
#
# Runs the Mitra v3 screenshot Maestro flows and copies the resulting PNGs into
# a single organized directory ready for Figma import.
#
# Usage:
#   ./scripts/capture-screenshots.sh              # all flows
#   ./scripts/capture-screenshots.sh onboarding   # just onboarding
#   ./scripts/capture-screenshots.sh dashboard    # just dashboard + runners
#   ./scripts/capture-screenshots.sh support      # support + reflection + rooms
#   ./scripts/capture-screenshots.sh flag_gated   # week 6/7 cards (needs flags)
#
# Output: screenshots/mitra-v3/*.png

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

OUT_DIR="$REPO_ROOT/screenshots/mitra-v3"
mkdir -p "$OUT_DIR"

# Map CLI arg → flow file
declare -A FLOWS=(
  [onboarding]=".maestro/screenshots/10_onboarding_turns.yaml"
  [dashboard]=".maestro/screenshots/20_dashboard_and_runners.yaml"
  [support]=".maestro/screenshots/30_support_reflection_rooms.yaml"
  [flag_gated]=".maestro/screenshots/40_companion_intelligence_flag_gated.yaml"
)

FILTER="${1:-all}"

run_flow() {
  local flow="$1"
  local name
  name=$(basename "$flow" .yaml)
  echo ""
  echo "▶️  Running $name"
  echo "   $flow"

  # Maestro writes debug output including PNGs to ~/.maestro/tests/<timestamp>/
  # We capture the timestamp and copy PNGs out.
  local before
  before=$(ls -1 "$HOME/.maestro/tests/" 2>/dev/null | sort | tail -1 || echo "")

  maestro test "$flow" || {
    echo "⚠️  flow $name had failures (continuing; takeScreenshot runs even on failed assertions)"
  }

  local after
  after=$(ls -1 "$HOME/.maestro/tests/" | sort | tail -1)

  if [[ -z "$after" || "$before" == "$after" ]]; then
    echo "❌ no new Maestro test directory found — skipping copy"
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
  echo "✅ copied $copied PNG(s) to $OUT_DIR/"
}

if [[ "$FILTER" == "all" ]]; then
  run_flow "${FLOWS[onboarding]}"
  run_flow "${FLOWS[dashboard]}"
  run_flow "${FLOWS[support]}"
  echo ""
  echo "ℹ️  Skipped flag_gated (Week 6/7 cards). Run ./scripts/capture-screenshots.sh flag_gated"
  echo "    AFTER backend enables MITRA_V3_POST_CONFLICT, _JOY_SIGNAL, _RESILIENCE_NARRATIVE."
elif [[ -v FLOWS[$FILTER] ]]; then
  run_flow "${FLOWS[$FILTER]}"
else
  echo "Unknown filter: $FILTER"
  echo "Use: onboarding | dashboard | support | flag_gated | all"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📸 Screenshots in:  $OUT_DIR/"
echo "   Count:           $(ls -1 "$OUT_DIR"/*.png 2>/dev/null | wc -l | tr -d ' ')"
echo ""
echo "Next: open Figma → File → Place Image → select all PNGs from:"
echo "   $OUT_DIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
