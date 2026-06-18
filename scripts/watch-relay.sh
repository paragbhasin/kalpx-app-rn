#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# KalpX Watch Relay — emulator phone↔watch live sync
#
# Wear OS emulator pairing is unavailable (new companion app won't pair emulators),
# so this relay carries the SAME payload the Wearable Data Layer would: it tails the
# phone app's JS logs for the watch payload and broadcasts it to the watch emulator,
# which injects it through the exact production sync code path (WearConnectivityManager).
#
# Usage:  ./scripts/watch-relay.sh <phone-serial> <watch-serial>
#   e.g.  ./scripts/watch-relay.sh emulator-5556 emulator-5554
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ADB="${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb"
PHONE="${1:?phone serial required, e.g. emulator-5556}"
WATCH="${2:?watch serial required, e.g. emulator-5554}"
ACTION="com.kalpx.wear.RELAY_SYNC"
COMPONENT="com.kalpx.app.wear/com.kalpx.wear.sync.RelaySyncReceiver"

echo "▶ KalpX Watch Relay"
echo "  phone: $PHONE   watch: $WATCH"
echo "  Listening for [WATCH_RELAY_*] payloads from the phone…"
echo "  (change something on the phone — the watch updates within ~1s)"
echo ""

WPKG="com.kalpx.app.wear"

# Writes JSON to the watch app's files dir, then triggers the receiver to apply it.
# (Real payloads are ~4 KB — too large for a broadcast string extra.)
push_and_apply() {
  local json="$1" fname="$2" label="$3" tmp
  tmp="$(mktemp)"
  printf '%s' "$json" > "$tmp"
  "$ADB" -s "$WATCH" push "$tmp" "/data/local/tmp/$fname" >/dev/null 2>&1
  "$ADB" -s "$WATCH" shell "run-as $WPKG cp /data/local/tmp/$fname files/$fname" >/dev/null 2>&1
  "$ADB" -s "$WATCH" shell am broadcast -a "$ACTION" -n "$COMPONENT" >/dev/null 2>&1 \
    && echo "  ✓ $label → watch ($(printf '%s' "$json" | wc -c | tr -d ' ') bytes)"
  rm -f "$tmp"
}

# Clear old logs so we only react to fresh pushes
"$ADB" -s "$PHONE" logcat -c 2>/dev/null || true

"$ADB" -s "$PHONE" logcat ReactNativeJS:* ReactNnative:* '*:S' 2>/dev/null \
| while IFS= read -r line; do
    case "$line" in
      *"[WATCH_RELAY_PATH]"*)
        # RN logs as: '[WATCH_RELAY_PATH]', '{json}'  — extract first { … last }
        json=$(printf '%s' "$line" | sed -E 's/^[^{]*//; s/[^}]*$//')
        [ -n "$json" ] && push_and_apply "$json" "relay_path.json" "path_data"
        ;;
      *"[WATCH_RELAY_MANTRAS]"*)
        # mantras is a JSON array; skip the tag's own brackets, then first [ … last ]
        rest="${line#*WATCH_RELAY_MANTRAS}"
        json=$(printf '%s' "$rest" | sed -E 's/^[^[]*//; s/[^]]*$//')
        [ -n "$json" ] && push_and_apply "$json" "relay_mantras.json" "mantras"
        ;;
    esac
  done
