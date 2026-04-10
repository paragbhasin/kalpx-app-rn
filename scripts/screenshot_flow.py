#!/usr/bin/env python3
"""
screenshot_flow.py — RN screenshot driver for KalpX scenarios.

Captures screenshots from a running Android emulator (Pixel_7_API_34) via adb,
walks through pre-defined scenarios, and writes PNGs + an HTML gallery to
~/kalpx-app-rn/screenshots/.

Modes
-----
1.  capture <label>       — Single screenshot of whatever is on screen.
2.  flow                  — Interactive walkthrough; pauses between captures
                            so you can navigate the app manually.
3.  scenario <name>       — Replay a named scenario (auto-screenshot at each
                            step). Limited automation — for fully automated
                            flows you must seed the backend first via the
                            seed_test_journey command (see SCENARIOS table).
4.  gallery               — Just regenerate the index.html from existing PNGs.
5.  set-test-now <iso>    — Push X-Test-Now date into the app's AsyncStorage
                            (uses adb run-as; only works on debuggable builds).

Setup
-----
Pre-reqs (assumed to be running before invoking this script):
  - Pixel_7_API_34 emulator booted
      $ANDROID_HOME/emulator/emulator -avd Pixel_7_API_34 -no-snapshot-load &
  - Metro dev server
      cd ~/kalpx-app-rn && nohup npx expo start --dev-client --port 8081 &
  - KalpX app installed and launched (com.kalpx.app)

Backend test users (run on dev box, or locally if DEBUG=True):
  python manage.py seed_test_journey --email test+day3@kalpx.com    --day 3
  python manage.py seed_test_journey --email test+day7@kalpx.com    --day 7
  python manage.py seed_test_journey --email test+day14@kalpx.com   --day 14
  python manage.py seed_test_journey --email test+welcomeback@kalpx.com \
      --day 14 --ended-days-ago 35

Login the app manually as each test user before running the matching scenario.
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent.parent
SCREENSHOT_DIR = REPO_ROOT / "screenshots"
APP_PACKAGE = "com.kalpx.app"
ADB = "adb"

# Predefined scenario walks. Each scenario is a list of (label, prompt) pairs.
# The driver pauses for user input at each step and then captures a screenshot.
SCENARIOS = {
    "welcome_back": [
        ("01_home_welcomeback",
         "Login as test+welcomeback@kalpx.com. Wait for Welcome Back screen."),
        ("02_welcomeback_continue_tap",
         "Press 'Continue with <focus>' button. Wait for dashboard or onboarding."),
        ("03_after_continue", "Capture the result screen after continue."),
    ],
    "day_7_checkpoint": [
        ("01_login_day7",
         "Login as test+day7@kalpx.com. Tap 'Begin with KalpX Mitra' on home."),
        ("02_dashboard_loading",
         "Wait for journey check. Should auto-route to weekly_checkpoint."),
        ("03_weekly_checkpoint",
         "Day 7 reflection screen — metrics + 4 feeling options visible."),
        ("04_select_feeling_strong",
         "Tap 'I feel more steady'. Continue button activates."),
        ("05_submit_continue",
         "Tap Continue. Should navigate to checkpoint_results."),
        ("06_results_screen",
         "Results screen with feeling-based message + action buttons."),
        ("07_continue_path",
         "Tap 'Continue My Path'. Should land on day_active dashboard."),
    ],
    "day_14_checkpoint": [
        ("01_login_day14", "Login as test+day14@kalpx.com."),
        ("02_dashboard_loading", "Wait for auto-route to daily_insight_14."),
        ("03_daily_insight_14",
         "14-day milestone screen — activity_stats, trend_chart visible."),
        ("04_scroll_for_reflection",
         "Scroll down to see cycle reflection block."),
        ("05_select_strong",
         "Tap 'I feel more steady'. Reflection textarea visible."),
        ("06_submit", "Tap Continue. Wait for results."),
        ("07_results", "Day 14 results screen with deepen / change focus options."),
        ("08_choose_new_focus",
         "Tap 'Choose New Focus'. Should land on discipline_select."),
    ],
    "trigger_flow": [
        ("01_dashboard", "Login as test+day3@kalpx.com. Show day_active dashboard."),
        ("02_tap_triggered",
         "Tap 'I Feel Triggered'. Should navigate to free_mantra_chanting."),
        ("03_om_chanting", "OM screen — verify audio plays (Bug 1 fix)."),
        ("04_try_another_way", "Tap 'Try Another Way'. Wait for practice screen."),
        ("05_practice_screen",
         "support_practice variant — instructions + 2 buttons + collapsibles."),
        ("06_try_another_again",
         "Tap 'Try Another Way'. Wait for mantra screen. (Verify NO duplicate audio — Bug 2 fix.)"),
        ("07_post_trigger_mantra", "Mantra runner with bead counter."),
        ("08_calmer_now",
         "Tap 'I feel calmer now'. Should land on dashboard with toast."),
    ],
    "checkin_flow": [
        ("01_dashboard", "Login as test+day3. Dashboard visible."),
        ("02_quick_checkin", "Tap Quick Check-In. Show 4 prana options."),
        ("03_select_balanced", "Tap Balanced. Premium lotus ack screen."),
        ("04_back_to_dashboard", "Back to dashboard."),
        ("05_quick_checkin_2", "Tap Quick Check-In again."),
        ("06_select_agitated", "Tap Agitated. checkin_breath_reset screen."),
        ("07_resolve_or_back", "Either complete or back to dashboard."),
    ],
    "onboarding": [
        ("01_home_logged_out", "Logout. Home screen with Begin CTA."),
        ("02_begin_pressed", "Tap Begin with KalpX Mitra. discipline_select."),
        ("03_pick_focus", "Tap any focus card. Sub-focus screen."),
        ("04_pick_subfocus", "Tap any sub-focus. Depth selection."),
        ("05_pick_depth", "Tap any depth. Lock ritual."),
        ("06_lock", "Hold to lock. Path reveal."),
        ("07_path_reveal", "Path reveal screen with mantra + sankalp."),
        ("08_dashboard_first", "Continue to dashboard."),
    ],
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def run(cmd: list[str], capture: bool = False, check: bool = True) -> subprocess.CompletedProcess:
    """Run a shell command, surface failures."""
    return subprocess.run(
        cmd, capture_output=capture, check=check, text=True
    )


def adb_devices() -> list[str]:
    out = subprocess.run(
        [ADB, "devices"], capture_output=True, text=True, check=True
    ).stdout
    devices = []
    for line in out.splitlines()[1:]:
        line = line.strip()
        if line and "device" in line.split("\t")[-1]:
            devices.append(line.split("\t")[0])
    return devices


def ensure_emulator() -> None:
    devices = adb_devices()
    if not devices:
        sys.exit(
            "No adb device detected. Boot the emulator first:\n"
            "  $ANDROID_HOME/emulator/emulator -avd Pixel_7_API_34 -no-snapshot-load &"
        )
    print(f"adb device(s): {', '.join(devices)}")


def ensure_dir() -> None:
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)


def slugify(label: str) -> str:
    safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in label.lower())
    return safe.strip("_")


def capture(label: str, scenario: str = "ad_hoc") -> Path:
    ensure_dir()
    scenario_dir = SCREENSHOT_DIR / slugify(scenario)
    scenario_dir.mkdir(parents=True, exist_ok=True)
    ts = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
    fname = f"{slugify(label)}_{ts}.png"
    out_path = scenario_dir / fname

    proc = subprocess.run(
        [ADB, "exec-out", "screencap", "-p"],
        capture_output=True,
        check=True,
    )
    out_path.write_bytes(proc.stdout)
    print(f"  ✓ saved {out_path.relative_to(REPO_ROOT)}")
    return out_path


def _exec_sql(sql: str) -> None:
    """Execute a SQL statement against the app's RKStorage db via adb run-as.
    Pipes SQL to sqlite3 stdin (avoids adb shell quoting issues)."""
    proc = subprocess.run(
        [ADB, "shell", f"run-as {APP_PACKAGE} sqlite3 databases/RKStorage"],
        input=sql,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"sqlite3 exec failed: {proc.stderr}")


def _async_storage_set(key: str, raw_value: str) -> None:
    """Set an AsyncStorage key. raw_value should already be JSON-encoded."""
    # Escape single quotes for SQL literal
    escaped = raw_value.replace("'", "''")
    _exec_sql(
        f"INSERT OR REPLACE INTO catalystLocalStorage (key, value) "
        f"VALUES ('{key}', '{escaped}');"
    )


def _async_storage_delete(key: str) -> None:
    _exec_sql(f"DELETE FROM catalystLocalStorage WHERE key = '{key}';")


def push_test_now(iso_date: str) -> None:
    """Inject @kalpx_test_now into AsyncStorage. Force-stop after."""
    print(f"Pushing X-Test-Now={iso_date} to AsyncStorage…")
    _async_storage_set("@kalpx_test_now", f'"{iso_date}"')
    print("  ✓ pushed. Force-stopping app…")
    subprocess.run([ADB, "shell", "am", "force-stop", APP_PACKAGE], check=True)


def inject_jwt(email: str) -> None:
    """Inject access_token + refresh_token + user_id from tests/api/jwts_full.json.

    AsyncStorage on Android (RKStorage) stores values as raw strings, not JSON.
    The login flow writes `AsyncStorage.setItem("access_token", token)` which
    persists the raw string. We must mirror that — no JSON quoting.
    """
    full_path = REPO_ROOT / "tests/api/jwts_full.json"
    if not full_path.exists():
        sys.exit(
            f"Missing {full_path}. Run mint_test_jwts.py first to populate refresh tokens."
        )
    tokens = json.loads(full_path.read_text())
    if email not in tokens:
        sys.exit(f"No tokens for {email}. Available: {list(tokens.keys())}")
    entry = tokens[email]
    print(f"Injecting tokens for {email}…")
    _async_storage_set("access_token", entry["access"])
    _async_storage_set("refresh_token", entry["refresh"])
    _async_storage_set("user_id", str(entry["user_id"]))
    print("  ✓ injected. Force-stopping app + relaunching…")
    subprocess.run([ADB, "shell", "am", "force-stop", APP_PACKAGE], check=True)
    deep_link = "exp+kalpx://expo-development-client/?url=http%3A%2F%2F10.0.2.2%3A8081"
    subprocess.run(
        [ADB, "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", deep_link],
        check=True,
        capture_output=True,
    )
    print("  ✓ app launched")


def logout() -> None:
    """Clear access_token + refresh_token to log out the test user."""
    print("Logging out (clearing tokens)…")
    _async_storage_delete("access_token")
    _async_storage_delete("refresh_token")
    subprocess.run([ADB, "shell", "am", "force-stop", APP_PACKAGE], check=True)
    print("  ✓ logged out")


def regenerate_gallery() -> None:
    ensure_dir()
    rows: list[str] = []
    for scenario_dir in sorted(SCREENSHOT_DIR.iterdir()):
        if not scenario_dir.is_dir():
            continue
        rows.append(
            f'<h2 id="{html.escape(scenario_dir.name)}">{html.escape(scenario_dir.name)}</h2>'
        )
        rows.append('<div class="row">')
        for png in sorted(scenario_dir.glob("*.png")):
            rel = png.relative_to(SCREENSHOT_DIR).as_posix()
            label = png.stem
            rows.append(
                f'<figure><img src="{html.escape(rel)}" loading="lazy" '
                f'alt="{html.escape(label)}"><figcaption>{html.escape(label)}</figcaption></figure>'
            )
        rows.append("</div>")

    body = "\n".join(rows) if rows else "<p>No screenshots yet.</p>"
    html_doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>KalpX RN Screenshots</title>
<style>
  body {{ font-family: -apple-system, sans-serif; padding: 24px; max-width: 1400px; margin: 0 auto; background: #faf7f2; }}
  h1 {{ font-size: 28px; color: #432104; }}
  h2 {{ font-size: 20px; color: #432104; margin-top: 36px; border-bottom: 1px solid #e8c587; padding-bottom: 6px; }}
  .row {{ display: flex; flex-wrap: wrap; gap: 16px; margin: 12px 0; }}
  figure {{ margin: 0; max-width: 240px; background: #fff; border-radius: 12px; padding: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }}
  img {{ width: 100%; border-radius: 8px; }}
  figcaption {{ font-size: 11px; color: #666; padding-top: 6px; word-break: break-all; }}
</style>
</head>
<body>
<h1>KalpX RN Screenshot Gallery</h1>
<p>Generated {dt.datetime.now().isoformat(timespec="seconds")}</p>
{body}
</body>
</html>
"""
    (SCREENSHOT_DIR / "index.html").write_text(html_doc)
    print(f"Gallery: {SCREENSHOT_DIR / 'index.html'}")


def run_scenario(name: str) -> None:
    if name not in SCENARIOS:
        sys.exit(f"Unknown scenario '{name}'. Available: {', '.join(SCENARIOS)}")
    ensure_emulator()
    ensure_dir()
    print(f"\n=== Scenario: {name} ===")
    print("Pre-step: ensure the test user is logged in and the app is on the right starting screen.\n")
    for step_idx, (label, prompt) in enumerate(SCENARIOS[name], start=1):
        print(f"[{step_idx}/{len(SCENARIOS[name])}] {label}")
        print(f"   → {prompt}")
        input("   Press ENTER to capture (or Ctrl+C to abort)…")
        capture(label, scenario=name)
    regenerate_gallery()


def run_flow() -> None:
    ensure_emulator()
    ensure_dir()
    print("\nFree-form capture mode. Type a label, ENTER to snap, blank line to quit.")
    while True:
        label = input("label> ").strip()
        if not label:
            break
        capture(label, scenario="ad_hoc")
    regenerate_gallery()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest="cmd", required=True)

    cap = sub.add_parser("capture", help="Single screenshot of current state")
    cap.add_argument("label")
    cap.add_argument("--scenario", default="ad_hoc")

    sub.add_parser("flow", help="Interactive free-form capture")

    sc = sub.add_parser("scenario", help="Run a named scenario walkthrough")
    sc.add_argument("name", choices=sorted(SCENARIOS.keys()))

    sub.add_parser("gallery", help="Regenerate index.html from existing PNGs")

    tn = sub.add_parser("set-test-now", help="Push X-Test-Now into AsyncStorage")
    tn.add_argument("iso", help="ISO 8601 datetime, e.g. 2026-05-15T10:00:00Z")

    inj = sub.add_parser("inject-jwt", help="Inject test user JWT into AsyncStorage")
    inj.add_argument("email", help="Test user email (must exist in tests/api/jwts.json)")

    sub.add_parser("logout", help="Clear access_token from AsyncStorage")

    sub.add_parser("scenarios", help="List available scenarios")

    args = p.parse_args()

    if args.cmd == "capture":
        ensure_emulator()
        capture(args.label, scenario=args.scenario)
        regenerate_gallery()
    elif args.cmd == "flow":
        run_flow()
    elif args.cmd == "scenario":
        run_scenario(args.name)
    elif args.cmd == "gallery":
        regenerate_gallery()
    elif args.cmd == "set-test-now":
        ensure_emulator()
        push_test_now(args.iso)
    elif args.cmd == "inject-jwt":
        ensure_emulator()
        inject_jwt(args.email)
    elif args.cmd == "logout":
        ensure_emulator()
        logout()
    elif args.cmd == "scenarios":
        for name, steps in SCENARIOS.items():
            print(f"  {name}  ({len(steps)} steps)")


if __name__ == "__main__":
    main()
