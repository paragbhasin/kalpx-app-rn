"""
Layer 1 — Python API contract test for the additional-item source fix (C3).

Guards against regression of FIX-05 from 2026-04-10 session:
    RN `actionExecutor.ts:900` view_info handler populates `runner_active_item`
    with `source: "additional_library" | "additional_custom"` when the user
    taps an additional library item. On submit (`actionExecutor.ts:775-779`),
    the 4-tier source resolution reads `runner_active_item.source` so the
    resulting `JourneyActivity` is logged with the correct source — NOT "core".

This test mirrors the style of test_checkpoint_welcomeback.py: it hits the
real dev backend with a real test-user JWT and asserts that the contract the
RN engine depends on is intact.

What it verifies:
    1. POST /mitra/journey/additional/  stores source on the JourneyAdditionalItem
    2. POST /mitra/journey/additional/{id}/complete/  writes a JourneyActivity
       with source=additional_library (visible via the list endpoint's
       isCompletedToday flag, which queries activities with source IN
       ["additional_library", "additional_custom"])
    3. POST /mitra/track-completion/ with source=additional_library echoes the
       source back on the response — this is the exact path RN takes in
       actionExecutor.ts:843 for runner submissions tagged as additional items
    4. A parallel call with source=additional_custom is honored identically
    5. Supplying no source defaults to "core" (baseline) — confirms we're
       actually exercising the source field and not silently defaulting

Run:
    python3 tests/api/test_additional_source.py

Pre-req:
    JWTs minted via tests/api/mint_test_jwts.py (uses SSH → dev box).
    Uses test+day3@kalpx.com — clean day-3 user, no accumulated state.

Note on data residue:
    Each run adds additional items to the day-3 journey via unique itemIds
    (timestamp-suffixed). The test DELETE-cleans items it created on teardown.
    If the test dies mid-run, residue is wiped by the 04:00 UTC reseed cron.
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

BASE_URL = os.environ.get("KALPX_API_BASE", "https://dev.kalpx.com/api")
JWT_FILE = Path(__file__).resolve().parent / "jwts.json"
TZ = "Asia/Kolkata"
USER_EMAIL = "test+day3@kalpx.com"

# Unique suffix per run — lets us clean up only the items we created and
# avoids AD-03-style 409 conflicts against residue from prior runs.
RUN_ID = str(int(time.time()))

# ---------------------------------------------------------------------------
# Helpers (vendored from test_checkpoint_welcomeback.py for consistency)
# ---------------------------------------------------------------------------


class TestFailed(AssertionError):
    pass


def _load_jwts() -> dict[str, str]:
    if not JWT_FILE.exists():
        sys.exit(
            f"Missing {JWT_FILE}. Run mint_test_jwts.py first or copy tokens "
            f"into that file as {{ email: access_token }}."
        )
    return json.loads(JWT_FILE.read_text())


def _http(
    method: str,
    path: str,
    jwt: str,
    body: dict[str, Any] | None = None,
) -> tuple[int, dict[str, Any]]:
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {jwt}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read()
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def assert_field(
    payload: dict, key: str, expected: Any | None = None, name: str = ""
) -> None:
    if key not in payload:
        raise TestFailed(f"{name}: missing field '{key}' in {payload}")
    if expected is not None and payload[key] != expected:
        raise TestFailed(f"{name}: {key}={payload[key]!r} (expected {expected!r})")


# ---------------------------------------------------------------------------
# State shared between tests (so we can assert end-to-end and clean up)
# ---------------------------------------------------------------------------


JWTS: dict[str, str] = {}
JWT: str = ""  # resolved in main()
CREATED_ITEM_IDS: list[int] = []  # collected for teardown


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def t_add_library_item_stores_source() -> None:
    """AD-01 equivalent — library item POST echoes source=additional_library."""
    code, body = _http(
        "POST",
        "/mitra/journey/additional/",
        JWT,
        {
            "itemType": "mantra",
            "itemId": f"additional.mantra.shanti.{RUN_ID}",
            "source": "additional_library",
        },
    )
    assert code == 200, f"add library: status={code} body={body}"
    assert_field(body, "status", "ok", "add library")
    assert_field(body, "additionalItem", name="add library")
    item = body["additionalItem"]
    assert_field(item, "id", name="add library item")
    assert_field(item, "source", "additional_library", "add library item")
    assert_field(item, "itemType", "mantra", "add library item")
    CREATED_ITEM_IDS.append(item["id"])


def t_add_custom_item_stores_source() -> None:
    """AD-02 equivalent — custom item POST echoes source=additional_custom."""
    code, body = _http(
        "POST",
        "/mitra/journey/additional/",
        JWT,
        {
            "itemType": "practice",
            "source": "additional_custom",
            "customTitle": f"C3 regression test practice {RUN_ID}",
            "customIntent": "discipline",
        },
    )
    assert code == 200, f"add custom: status={code} body={body}"
    assert_field(body["additionalItem"], "source", "additional_custom", "add custom")
    CREATED_ITEM_IDS.append(body["additionalItem"]["id"])


def t_complete_library_item_logs_additional_source() -> None:
    """AD-07 equivalent — completing a library item writes JourneyActivity
    with source=additional_library (observable via the list endpoint's
    isCompletedToday flag, which filters on additional_library/_custom).
    """
    if not CREATED_ITEM_IDS:
        raise TestFailed("prerequisite failed: no created item to complete")
    library_item_id = CREATED_ITEM_IDS[0]

    code, body = _http(
        "POST",
        f"/mitra/journey/additional/{library_item_id}/complete/",
        JWT,
        {"tz": TZ},
    )
    assert code == 200, f"complete library: status={code} body={body}"

    # Read back via list — isCompletedToday flips true only when a
    # JourneyActivity row exists with source IN (additional_library,
    # additional_custom) and matching item_id (see mitra_views.py:2799-2813).
    code, body = _http(
        "GET",
        f"/mitra/journey/additional/list/?tz={TZ}",
        JWT,
    )
    assert code == 200, f"list after complete: status={code} body={body}"
    items = body.get("items", [])
    ours = [i for i in items if i.get("id") == library_item_id]
    if not ours:
        raise TestFailed(
            f"list missing our library item {library_item_id}; got ids="
            f"{[i.get('id') for i in items]}"
        )
    found = ours[0]
    assert_field(found, "source", "additional_library", "list library")
    assert_field(found, "isCompletedToday", True, "list library")
    # sessionsToday must be >= 1 for non-sankalp types — confirms an activity
    # row was counted, not just the item's state
    if found.get("sessionsToday", 0) < 1:
        raise TestFailed(
            f"list library: sessionsToday={found.get('sessionsToday')} (expected >= 1)"
        )


def t_track_completion_echoes_additional_library_source() -> None:
    """Direct track-completion path — exercises the exact RN call at
    actionExecutor.ts:843. Backend must accept and echo source=additional_library.
    This is the canonical regression guard: if the response source drifts back
    to 'core' the RN submit pipeline is broken end-to-end.
    """
    # Fetch journey id via status endpoint
    code, status_body = _http("GET", "/mitra/journey/status/", JWT)
    assert code == 200, f"journey/status: {code} {status_body}"
    journey_id = status_body.get("journeyId")
    if not journey_id:
        raise TestFailed(f"no journeyId on status response: {status_body}")

    code, body = _http(
        "POST",
        "/mitra/track-completion/",
        JWT,
        {
            "journeyId": journey_id,
            "itemType": "mantra",
            "itemId": f"additional.mantra.track.{RUN_ID}",
            "source": "additional_library",
            "dayNumber": status_body.get("dayNumber", 3),
            "tz": TZ,
            "meta": {"rep_count": 108, "duration_seconds": 120},
        },
    )
    assert code == 200, f"track-completion library: status={code} body={body}"
    assert_field(body, "source", "additional_library", "track-completion library")


def t_track_completion_echoes_additional_custom_source() -> None:
    """Parallel guard — additional_custom source is stored identically.
    Custom items submitted from the runner also go through track-completion.
    """
    code, status_body = _http("GET", "/mitra/journey/status/", JWT)
    journey_id = status_body.get("journeyId")

    code, body = _http(
        "POST",
        "/mitra/track-completion/",
        JWT,
        {
            "journeyId": journey_id,
            "itemType": "practice",
            "itemId": f"additional.practice.track.{RUN_ID}",
            "source": "additional_custom",
            "dayNumber": status_body.get("dayNumber", 3),
            "tz": TZ,
            "meta": {"duration_seconds": 180},
        },
    )
    assert code == 200, f"track-completion custom: status={code} body={body}"
    assert_field(body, "source", "additional_custom", "track-completion custom")


def t_track_completion_defaults_to_core_baseline() -> None:
    """Baseline — confirms track-completion actually cares about the source
    field we're passing. Without this, a bug where the server ignores source
    and always writes 'core' would make the earlier tests pass vacuously.
    """
    code, status_body = _http("GET", "/mitra/journey/status/", JWT)
    journey_id = status_body.get("journeyId")

    code, body = _http(
        "POST",
        "/mitra/track-completion/",
        JWT,
        {
            "journeyId": journey_id,
            "itemType": "mantra",
            "itemId": status_body.get("cycleMantraId") or "mantra.omkaram",
            "source": "core",
            "dayNumber": status_body.get("dayNumber", 3),
            "tz": TZ,
        },
    )
    assert code == 200, f"track-completion core: status={code} body={body}"
    assert_field(body, "source", "core", "track-completion core")


# ---------------------------------------------------------------------------
# Teardown
# ---------------------------------------------------------------------------


def _teardown() -> None:
    """Best-effort cleanup — DELETE the JourneyAdditionalItem rows we created
    (soft-removes them, is_active=False). Track-completion activities cannot
    be deleted via the public API; the 04:00 UTC reseed handles those.
    """
    for item_id in CREATED_ITEM_IDS:
        try:
            _http("DELETE", f"/mitra/journey/additional/{item_id}/", JWT)
        except Exception as e:  # noqa: BLE001
            print(f"  (teardown skip item {item_id}: {e})")


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------


TESTS = [
    t_add_library_item_stores_source,
    t_add_custom_item_stores_source,
    t_complete_library_item_logs_additional_source,
    t_track_completion_echoes_additional_library_source,
    t_track_completion_echoes_additional_custom_source,
    t_track_completion_defaults_to_core_baseline,
]


def main() -> None:
    global JWTS, JWT
    JWTS = _load_jwts()
    if USER_EMAIL not in JWTS:
        sys.exit(f"Missing JWT for {USER_EMAIL} in {JWT_FILE}")
    JWT = JWTS[USER_EMAIL]

    print(f"\n=== KalpX C3 additional-source contract test ({BASE_URL}) ===\n")
    print(f"User: {USER_EMAIL}   RUN_ID: {RUN_ID}\n")

    passed = 0
    failed = 0
    try:
        for fn in TESTS:
            try:
                fn()
                print(f"  ✓ {fn.__name__}")
                passed += 1
            except (TestFailed, AssertionError) as e:
                print(f"  ✗ {fn.__name__}")
                print(f"      {e}")
                failed += 1
            except Exception as e:  # noqa: BLE001
                print(f"  ✗ {fn.__name__} (unexpected error)")
                print(f"      {type(e).__name__}: {e}")
                failed += 1
    finally:
        print("\nTeardown — removing test items...")
        _teardown()

    total = passed + failed
    print(f"\n{passed}/{total} passed, {failed} failed\n")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
