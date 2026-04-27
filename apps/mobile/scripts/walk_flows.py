#!/usr/bin/env python3
"""
walk_flows.py — drive core / additional / checkin / trigger flows on RN
and capture screenshots for comparison against web references.

Unlike walk_personas.py (which drives the checkpoint flow), this walker
taps through the dashboard cards and captures the runner screens for
each of the 4 user-visible feature flows:

    core_mantra      dashboard → "Chant" card → mantra_rep_selection →
                     mantra_prep → mantra_runner
    core_sankalp     dashboard → "Embody" → sankalp_embody → sankalp_confirm
    core_practice    dashboard → "Act" → practice_step_runner
    additional       dashboard → Additional Items → Launch → runner
    checkin          dashboard → Quick Check-In → quick_checkin →
                     4 prana options → each ack path
    trigger          dashboard → I Feel Triggered → free_mantra_chanting →
                     Try another way → practice → Try another way → mantra

Uses adb taps + maestro hierarchy to resolve button bounds dynamically.

Usage:
    python3 scripts/walk_flows.py [flow_name]
    python3 scripts/walk_flows.py                # runs all flows
    python3 scripts/walk_flows.py core_mantra    # single flow
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SCRIPT = REPO / "scripts" / "screenshot_flow.py"
ADB = "adb"
MAESTRO = os.path.expanduser("~/.maestro/bin/maestro")
APP_PACKAGE = "com.kalpx.app"
# day3 persona does NOT auto-route to a checkpoint, so it lands on the
# ContinueJourney home → Resume tap → day_active dashboard. day7_high/day14_*
# would hijack the Resume tap with the weekly_checkpoint auto-route.
TEST_USER = "test+day3@kalpx.com"


def sh(cmd: str, check: bool = False) -> str:
    proc = subprocess.run(
        cmd, shell=True, capture_output=True, text=True, cwd=REPO
    )
    return proc.stdout.strip()


def adb(*args: str) -> str:
    return sh(f"{ADB} " + " ".join(args))


def wait(s: float) -> None:
    time.sleep(s)


def wake() -> None:
    adb("shell", "input", "keyevent", "KEYCODE_WAKEUP")


def capture(label: str, scenario: str) -> None:
    sh(f'python3 "{SCRIPT}" capture {label} --scenario {scenario}', check=False)


def inject_jwt(email: str) -> None:
    sh(f'python3 "{SCRIPT}" inject-jwt {email}')


def hierarchy() -> dict | None:
    wake()
    raw = sh(f'"{MAESTRO}" --device emulator-5554 hierarchy')
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def find_text(text: str, contains: bool = True) -> tuple[int, int] | None:
    """Return center (x, y) of the first element containing text."""
    data = hierarchy()
    if not data:
        return None

    stack = [data]
    while stack:
        node = stack.pop()
        attrs = node.get("attributes", {})
        t = attrs.get("text", "")
        bounds = attrs.get("bounds", "")
        match = (text.lower() in t.lower()) if contains else (text == t)
        if t and match and bounds:
            m = re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", bounds)
            if m:
                x1, y1, x2, y2 = map(int, m.groups())
                return ((x1 + x2) // 2, (y1 + y2) // 2)
        for c in node.get("children", []):
            stack.append(c)
    return None


def tap(x: int, y: int) -> None:
    adb("shell", "input", "touchscreen", "tap", str(x), str(y))


def tap_text(text: str, fallback: tuple[int, int] | None = None) -> bool:
    xy = find_text(text)
    if xy is None:
        if fallback is None:
            print(f"   ⚠ Could not find '{text}'")
            return False
        xy = fallback
        print(f"   → fallback tap {xy}")
    tap(*xy)
    return True


def scroll_down(px: int = 600) -> None:
    adb("shell", "input", "swipe", "540", "1800", "540", str(1800 - px), "300")


def scroll_up(px: int = 600) -> None:
    adb("shell", "input", "swipe", "540", "800", "540", str(800 + px), "300")


def back_to_dashboard() -> None:
    # Force-navigate to dashboard via a back arrow or direct deep link
    # best effort: multiple back presses
    for _ in range(4):
        adb("shell", "input", "keyevent", "KEYCODE_BACK")
        wait(0.3)


def reset_to_dashboard() -> None:
    """Force-stop + relaunch to get a clean dashboard state."""
    adb("shell", "am", "force-stop", APP_PACKAGE)
    wait(2)
    adb(
        "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d",
        '"exp+kalpx://expo-development-client/?url=http%3A%2F%2F10.0.2.2%3A8081"',
    )
    # Longer wait — Metro cold bundle + Redux hydration + journey/status API
    # can take 18-22s on the emulator. Poll for the Return button instead of
    # a fixed sleep so faster boots don't waste time.
    for _ in range(24):
        wait(1)
        wake()
        if find_text("Return to Your"):
            return
    # Fall through after ~24s
    wake()


# ---------------------------------------------------------------------------
# Flows
# ---------------------------------------------------------------------------


def walk_core_mantra() -> None:
    print("\n=== CORE MANTRA ===")
    reset_to_dashboard()
    capture("01_dashboard", "flow_core_mantra")

    # From dashboard, tap Resume to enter the engine
    if not tap_text("Return to Your"):
        return
    wait(5)
    capture("02_day_active", "flow_core_mantra")

    # Tap mantra card — look for "Chant" label or card_mantra text
    if not tap_text("Chant"):
        if not tap_text("mantra"):
            return
    wait(3)
    capture("03_info_reveal_mantra", "flow_core_mantra")

    # Tap Begin Chanting button
    if not tap_text("Begin Chanting"):
        return
    wait(3)
    capture("04_rep_selection", "flow_core_mantra")

    # Pick 27 reps and tap begin
    if not tap_text("27"):
        pass
    wait(1)
    if not tap_text("Begin Chanting"):
        return
    wait(5)
    capture("05_mantra_prep_or_runner", "flow_core_mantra")

    # After prep, the runner should be visible
    wait(5)
    capture("06_mantra_runner", "flow_core_mantra")


def walk_core_sankalp() -> None:
    print("\n=== CORE SANKALP ===")
    reset_to_dashboard()

    if not tap_text("Return to Your"):
        return
    wait(5)
    capture("01_day_active", "flow_core_sankalp")

    if not tap_text("Embody"):
        if not tap_text("Sankalp"):
            return
    wait(3)
    capture("02_info_reveal_sankalp", "flow_core_sankalp")

    if not tap_text("Embody"):
        if not tap_text("I Will"):
            return
    wait(3)
    capture("03_sankalp_embody", "flow_core_sankalp")


def walk_core_practice() -> None:
    """Core practice flow: dashboard → Act card → info_reveal → step runner.

    Fixes H2 audit gap: previously captured `02_info_reveal_practice` was
    actually the dashboard practice selector (wrong screen). The fix is to
    scroll to the Act/Practice CARD first, tap its body (not an accordion
    toggle), then tap the "Practice" CTA inside the card to route to the
    info_reveal state. After info_reveal we tap "Begin Practice" to enter
    the step_runner (RUN.P.02 equivalent).
    """
    print("\n=== CORE PRACTICE ===")
    reset_to_dashboard()

    if not tap_text("Return to Your"):
        return
    wait(5)
    capture("01_day_active", "flow_core_practice")

    # Scroll so the Act card is in view (dashboards are long)
    scroll_down(400)
    wait(0.5)

    # Tap the Act card to expand/enter practice info
    if not tap_text("Act"):
        if not tap_text("Practice"):
            return
    wait(3)
    capture("02_card_expanded_or_info", "flow_core_practice")

    # From the Act card, tap "Begin Practice" to enter info_reveal state
    if not tap_text("Begin Practice"):
        if not tap_text("I Will Do This"):
            if not tap_text("I Will"):
                print("   ⚠ Could not find Begin Practice / I Will CTA")
                return
    wait(3)
    capture("03_info_reveal_practice", "flow_core_practice")

    # Now enter the step_runner (RUN.P.02)
    if not tap_text("Begin Practice"):
        if not tap_text("Continue"):
            if not tap_text("Start"):
                print("   ⚠ Could not enter step runner")
                return
    wait(4)
    capture("04_practice_step_runner", "flow_core_practice")

    # Wait for timer to progress so we capture mid-practice state
    wait(6)
    capture("05_practice_mid_timer", "flow_core_practice")


def walk_additional() -> None:
    print("\n=== ADDITIONAL PRACTICE ===")
    reset_to_dashboard()

    if not tap_text("Return to Your"):
        return
    wait(5)
    capture("01_day_active", "flow_additional")

    # Scroll down to additional items section
    scroll_down(800)
    wait(1)
    capture("02_additional_section", "flow_additional")

    # Try tapping the first additional item or "Add from Library"
    if tap_text("Add from Library"):
        wait(3)
        capture("03_library_search", "flow_additional")


def walk_checkin() -> None:
    """Quick Check-In: dashboard → Quick Check-In btn → prana select → ack path.

    Fixes H1 audit gap: previously only captured day_active. Now walks all
    4 prana states' ack paths so REG-020 isolation + checkin_mantra_text
    seeding + pranaType field (not `feeling`) are verifiable:

      balanced   → ack_only (no support)
      energized  → ack_only
      agitated   → breath_reset (OM) → support mantra → resolved
      drained    → breath_reset (OM) → support mantra → resolved

    For this walker run we capture balanced (ack_only fast path) and
    agitated (full breath_reset + mantra support path) since they cover
    both ack branches.
    """
    print("\n=== QUICK CHECK-IN ===")
    reset_to_dashboard()

    if not tap_text("Return to Your"):
        return
    wait(5)
    capture("01_day_active", "flow_checkin")

    # Open Quick Check-In overlay
    if not tap_text("Quick Check"):
        if not tap_text("Check-In"):
            print("   ⚠ Could not find Quick Check-In button")
            return
    wait(3)
    capture("02_prana_select", "flow_checkin")

    # Path A: balanced → ack only (no support flow)
    if tap_text("balanced"):
        wait(3)
        capture("03a_ack_balanced", "flow_checkin")
        # Return to dashboard to start Path B
        if tap_text("Return to"):
            wait(3)
        else:
            reset_to_dashboard()

    # Path B: agitated → breath_reset → support mantra → resolved
    if not tap_text("Return to Your"):
        reset_to_dashboard()
        if not tap_text("Return to Your"):
            return
    wait(3)
    if not tap_text("Quick Check"):
        if not tap_text("Check-In"):
            return
    wait(3)
    if not tap_text("agitated"):
        if not tap_text("drained"):
            print("   ⚠ No agitated/drained chip")
            return
    wait(4)
    capture("03b_breath_reset_om", "flow_checkin")

    # OM breath screen — let a few beads land, then continue to support
    wait(6)
    capture("04_breath_reset_mid", "flow_checkin")

    # Tap "I feel better" / "Continue" to move into support mantra
    if tap_text("feel better"):
        wait(4)
    elif tap_text("Continue"):
        wait(4)
    else:
        # Some flows route directly — give it time
        wait(4)
    capture("05_support_mantra_or_ack", "flow_checkin")

    # If a support mantra is shown, tap the calmer CTA
    if tap_text("feel calmer"):
        wait(3)
        capture("06_resolved", "flow_checkin")
    elif tap_text("Return to"):
        wait(3)
        capture("06_resolved", "flow_checkin")


def walk_trigger() -> None:
    print("\n=== I AM TRIGGERED ===")
    reset_to_dashboard()

    if not tap_text("Return to Your"):
        return
    wait(5)
    capture("01_day_active", "flow_trigger")

    if not tap_text("Triggered"):
        if not tap_text("Feel Triggered"):
            return
    wait(3)
    capture("02_free_mantra_chanting", "flow_trigger")

    if not tap_text("Try another"):
        return
    wait(4)
    capture("03_trigger_practice_runner", "flow_trigger")

    if not tap_text("Try another"):
        return
    wait(4)
    capture("04_post_trigger_mantra", "flow_trigger")

    if not tap_text("calmer"):
        return
    wait(3)
    capture("05_resolved_dashboard", "flow_trigger")


FLOWS: dict[str, callable] = {
    "core_mantra": walk_core_mantra,
    "core_sankalp": walk_core_sankalp,
    "core_practice": walk_core_practice,
    "additional": walk_additional,
    "checkin": walk_checkin,
    "trigger": walk_trigger,
}


def main() -> None:
    # Pre: inject test user once
    print(f"Injecting JWT for {TEST_USER}…")
    inject_jwt(TEST_USER)
    wait(3)

    targets = sys.argv[1:] if len(sys.argv) > 1 else list(FLOWS.keys())
    for flow in targets:
        if flow not in FLOWS:
            print(f"Unknown flow '{flow}'. Available: {list(FLOWS)}")
            continue
        try:
            FLOWS[flow]()
        except Exception as e:
            print(f"   ✗ {flow} raised: {e}")


if __name__ == "__main__":
    main()
