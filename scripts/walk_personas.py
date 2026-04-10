#!/usr/bin/env python3
"""
walk_personas.py — drive the full checkpoint flow for each seeded persona.

For each persona:
  1. Inject JWT (logout + access_token/refresh_token/user_id into AsyncStorage)
  2. Relaunch app
  3. Capture home (should show ContinueJourney)
  4. Tap "Return to Your Practice"
  5. Capture intro stage (CycleReflectionBlock stage="intro")
  6. Tap "Reflect on My Journey"
  7. Capture mirror stage (stage="mirror" with engagement bars + chips)
  8. Tap "Continue" / "Continue to Choices"
  9. Capture decision stage (stage="decision" with action buttons)

Screenshots saved to screenshots/persona_<name>/. Each step prints the
resolved button bounds via maestro hierarchy — no hardcoded coordinates.

Usage:
    python3 scripts/walk_personas.py [persona_name ...]
    python3 scripts/walk_personas.py           # runs all
    python3 scripts/walk_personas.py day7_high day14_mastered
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SCRIPT = REPO / "scripts" / "screenshot_flow.py"
ADB = "adb"
MAESTRO = os.path.expanduser("~/.maestro/bin/maestro")
APP_PACKAGE = "com.kalpx.app"

PERSONAS = [
    "day7_high",
    "day7_medium",
    "day7_low",
    "day7_nearzero",
    "day14_mastered",
    "day14_medium",
    "day14_low",
    "welcomeback",
]


def email_for(persona: str) -> str:
    if persona == "welcomeback":
        return "test+welcomeback@kalpx.com"
    return f"test+{persona}@kalpx.com"


def sh(cmd: str, check: bool = True) -> str:
    proc = subprocess.run(
        cmd, shell=True, capture_output=True, text=True, cwd=REPO
    )
    if check and proc.returncode != 0:
        print(f"   ERR: {proc.stderr.strip()}")
    return proc.stdout.strip()


def adb(*args) -> str:
    return sh(f"{ADB} " + " ".join(args))


def wait_seconds(s: float) -> None:
    time.sleep(s)


def capture(label: str, scenario: str) -> None:
    sh(f'python3 "{SCRIPT}" capture {label} --scenario {scenario}', check=False)


def inject_jwt(email: str) -> None:
    sh(f'python3 "{SCRIPT}" inject-jwt {email}')


def wake() -> None:
    adb("shell", "input", "keyevent", "KEYCODE_WAKEUP")


def find_bounds(text: str) -> tuple[int, int] | None:
    """Return (center_x, center_y) of the first UI element matching `text`."""
    wake()
    hier = sh(f'"{MAESTRO}" --device emulator-5554 hierarchy')
    try:
        data = json.loads(hier)
    except json.JSONDecodeError:
        return None

    def walk(node: dict) -> list[dict]:
        out = [node]
        for c in node.get("children", []):
            out.extend(walk(c))
        return out

    for node in walk(data):
        attrs = node.get("attributes", {})
        t = attrs.get("text", "")
        if text.lower() in t.lower():
            bounds = attrs.get("bounds", "")
            # Parse "[x1,y1][x2,y2]"
            import re
            m = re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", bounds)
            if m:
                x1, y1, x2, y2 = map(int, m.groups())
                return ((x1 + x2) // 2, (y1 + y2) // 2)
    return None


def tap_text(text: str, fallback_xy: tuple[int, int] | None = None) -> bool:
    xy = find_bounds(text)
    if xy is None:
        if fallback_xy is None:
            print(f"   ⚠ Could not find '{text}' in hierarchy")
            return False
        xy = fallback_xy
        print(f"   → Using fallback tap at {xy}")
    adb("shell", "input", "touchscreen", "tap", str(xy[0]), str(xy[1]))
    return True


def walk_persona(persona: str) -> None:
    email = email_for(persona)
    print(f"\n=== Walking {persona} ({email}) ===")

    inject_jwt(email)
    wait_seconds(15)  # cold boot + bundle download + hydration
    wake()
    capture("01_home", f"persona_{persona}")

    if persona == "welcomeback":
        # Welcome back has its own 2-button screen, not the checkpoint flow
        wait_seconds(2)
        capture("02_welcome_back_screen", f"persona_{persona}")
        return

    # Step 1: tap "Return to Your Practice"
    if not tap_text("Return to Your"):
        print("   ✗ Home screen missing Return button")
        return
    wait_seconds(6)
    capture("02_intro", f"persona_{persona}")

    # Step 2: tap "Reflect on My Journey"
    if not tap_text("Reflect on My"):
        print("   ✗ Intro stage missing Reflect button")
        return
    wait_seconds(4)
    capture("03_mirror", f"persona_{persona}")

    # Step 3: tap "Continue" (or "Continue to Choices" for day 14)
    if not tap_text("Continue"):
        print("   ✗ Mirror stage missing Continue button")
        return
    wait_seconds(3)
    capture("04_decision", f"persona_{persona}")


def main() -> None:
    targets = sys.argv[1:] if len(sys.argv) > 1 else PERSONAS
    for persona in targets:
        if persona not in PERSONAS:
            print(f"Unknown persona '{persona}'. Available: {PERSONAS}")
            continue
        walk_persona(persona)


if __name__ == "__main__":
    main()
