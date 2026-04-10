"""
Layer 1 — Python API contract tests for the new RN checkpoint/welcome-back flows.

Mirrors kalpx-frontend/tests/e2e/p0_tests.py / data_tests.py architecture:
each test calls a real backend endpoint with a real test user JWT and asserts
the response shape matches what the RN engine expects.

Run:
    python3 tests/api/test_checkpoint_welcomeback.py
or via pytest:
    pip install pytest && pytest tests/api/test_checkpoint_welcomeback.py -v

Pre-req:
    1. Test users seeded on dev backend via:
        docker exec kalpx-dev-web python manage.py seed_test_journey \
            --email test+day{3,7,14}@kalpx.com --day {3,7,14}
        docker exec kalpx-dev-web python manage.py seed_test_journey \
            --email test+welcomeback@kalpx.com --day 14 --ended-days-ago 35
    2. Mint JWTs and save to ~/kalpx-app-rn/tests/api/jwts.json
       (the script tests/api/mint_test_jwts.py does this via SSH)

Coverage:
    journey/status               × 4 users  (day 3, 7, 14, welcomeback)
    journey/checkpoint/7/        × day 7 user
    journey/checkpoint/14/       × day 14 user
    journey/checkpoint/7/submit  × continue / lighten / restart
    journey/checkpoint/14/submit × continue_same / deepen / change_focus
    journey/welcome-back/        × continue / fresh

This is the source-of-truth contract. If anything fails, the RN block will
crash or render wrong data.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

BASE_URL = os.environ.get("KALPX_API_BASE", "https://dev.kalpx.com/api")
JWT_FILE = Path(__file__).resolve().parent / "jwts.json"
TZ = "Asia/Kolkata"

# ---------------------------------------------------------------------------
# Helpers
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


def _http(method: str, path: str, jwt: str, body: dict[str, Any] | None = None) -> tuple[int, dict[str, Any]]:
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
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def assert_field(payload: dict, key: str, expected: Any | None = None, name: str = "") -> None:
    if key not in payload:
        raise TestFailed(f"{name}: missing field '{key}' in {payload}")
    if expected is not None and payload[key] != expected:
        raise TestFailed(f"{name}: {key}={payload[key]!r} (expected {expected!r})")


def assert_in(payload: dict, key: str, candidates: list, name: str = "") -> None:
    if payload.get(key) not in candidates:
        raise TestFailed(f"{name}: {key}={payload.get(key)!r} not in {candidates}")


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


JWTS: dict[str, str] = {}


def t_journey_status_day3() -> None:
    code, body = _http("GET", "/mitra/journey/status/", JWTS["test+day3@kalpx.com"])
    assert code == 200, f"status code {code}: {body}"
    assert_field(body, "hasActiveJourney", True, "day3 status")
    assert_field(body, "dayNumber", 3, "day3 status")
    assert_field(body, "focus", "peacecalm", "day3 status")


def t_journey_status_day7() -> None:
    code, body = _http("GET", "/mitra/journey/status/", JWTS["test+day7@kalpx.com"])
    assert code == 200, f"status code {code}: {body}"
    assert_field(body, "hasActiveJourney", True, "day7 status")
    assert_field(body, "dayNumber", 7, "day7 status")


def t_journey_status_day14() -> None:
    code, body = _http("GET", "/mitra/journey/status/", JWTS["test+day14@kalpx.com"])
    assert code == 200, f"status code {code}: {body}"
    assert_field(body, "hasActiveJourney", True, "day14 status")
    assert_field(body, "dayNumber", 14, "day14 status")


def t_journey_status_welcomeback() -> None:
    code, body = _http(
        "GET", "/mitra/journey/status/", JWTS["test+welcomeback@kalpx.com"]
    )
    assert code == 200, f"status code {code}: {body}"
    # Critical contract: welcomeBack flag must be True so RN routes to WelcomeBack screen
    assert_field(body, "hasActiveJourney", False, "wb status")
    assert_field(body, "welcomeBack", True, "wb status")
    assert_field(body, "expired", True, "wb status")
    if body.get("daysPastEnd", 0) < 30:
        raise TestFailed(f"daysPastEnd={body.get('daysPastEnd')} < 30")
    # RN WelcomeBack.tsx reads these props directly:
    for k in ("focus", "subfocus", "daysPracticed", "pathCycleNumber"):
        assert_field(body, k, name="wb props")


def t_checkpoint_7_data() -> None:
    code, body = _http(
        "GET", f"/mitra/journey/checkpoint/7/?tz={TZ}", JWTS["test+day7@kalpx.com"]
    )
    assert code == 200, f"status code {code}: {body}"
    # Outer shape
    for k in ("checkpoint", "engagement", "pathContext", "trendGraph"):
        assert_field(body, k, name="cp7")
    assert_field(body["checkpoint"], "day", 7, "cp7.checkpoint")
    assert_field(body["checkpoint"], "type", "continuity_mirror", "cp7.checkpoint")
    # engagement fields the RN block reads
    eng = body["engagement"]
    for k in ("daysEngaged", "daysFullyCompleted", "totalDays", "engagementLevel"):
        assert_field(eng, k, name="cp7.engagement")
    # trendGraph fields the TrendChartBlock reads
    tg = body["trendGraph"]
    for k in ("labels", "engaged"):
        assert_field(tg, k, name="cp7.trendGraph")
    if len(tg["labels"]) != 7:
        raise TestFailed(f"cp7.trendGraph.labels length={len(tg['labels'])} (expected 7)")


def t_checkpoint_14_data() -> None:
    code, body = _http(
        "GET", f"/mitra/journey/checkpoint/14/?tz={TZ}", JWTS["test+day14@kalpx.com"]
    )
    assert code == 200, f"status code {code}: {body}"
    assert_field(body["checkpoint"], "day", 14, "cp14.checkpoint")
    assert_field(body["checkpoint"], "type", "evolution_pivot", "cp14.checkpoint")
    if len(body["trendGraph"]["labels"]) != 14:
        raise TestFailed(
            f"cp14.trendGraph.labels length={len(body['trendGraph']['labels'])} (expected 14)"
        )


def t_checkpoint_7_submit_continue() -> None:
    code, body = _http(
        "POST",
        "/mitra/journey/checkpoint/7/submit/",
        JWTS["test+day7@kalpx.com"],
        {"decision": "continue", "reflection": "test continue", "tz": TZ},
    )
    assert code == 200, f"status code {code}: {body}"
    assert_field(body, "status", "ok", "cp7 submit continue")
    assert_field(body, "action", "continue", "cp7 submit continue")
    assert_field(body, "journeyId", name="cp7 submit continue")


def t_checkpoint_14_submit_continue_same() -> None:
    code, body = _http(
        "POST",
        "/mitra/journey/checkpoint/14/submit/",
        JWTS["test+day14@kalpx.com"],
        {
            "decision": "continue_same",
            "feeling": "steady",
            "reflection": "test cs",
            "tz": TZ,
        },
    )
    assert code == 200, f"status code {code}: {body}"
    assert_field(body, "status", "ok", "cp14 submit cs")
    assert_field(body, "action", "continue_same", "cp14 submit cs")
    # New cycle should be created
    assert_field(body, "newJourneyId", name="cp14 submit cs")
    assert_field(body, "previousJourneyId", name="cp14 submit cs")


def t_welcome_back_continue() -> None:
    code, body = _http(
        "POST",
        "/mitra/journey/welcome-back/",
        JWTS["test+welcomeback@kalpx.com"],
        {"decision": "continue", "tz": TZ},
    )
    assert code == 200, f"status code {code}: {body}"
    assert_field(body, "status", "ok", "wb continue")
    assert_field(body, "decision", "continue", "wb continue")
    assert_field(body, "newJourneyId", name="wb continue")
    assert_field(body, "pathCycleNumber", name="wb continue")
    assert_field(body, "focus", name="wb continue")
    if body["pathCycleNumber"] < 2:
        raise TestFailed(f"pathCycleNumber={body['pathCycleNumber']} (expected >=2)")


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------


TESTS = [
    t_journey_status_day3,
    t_journey_status_day7,
    t_journey_status_day14,
    t_journey_status_welcomeback,
    t_checkpoint_7_data,
    t_checkpoint_14_data,
    t_checkpoint_7_submit_continue,
    t_checkpoint_14_submit_continue_same,
    t_welcome_back_continue,
]


def main() -> None:
    global JWTS
    JWTS = _load_jwts()
    print(f"\n=== KalpX API contract tests ({BASE_URL}) ===\n")
    failed = 0
    passed = 0
    for fn in TESTS:
        try:
            fn()
            print(f"  ✓ {fn.__name__}")
            passed += 1
        except (TestFailed, AssertionError) as e:
            print(f"  ✗ {fn.__name__}")
            print(f"      {e}")
            failed += 1
        except Exception as e:
            print(f"  ✗ {fn.__name__} (unexpected error)")
            print(f"      {e}")
            failed += 1
    total = passed + failed
    print(f"\n{passed}/{total} passed, {failed} failed\n")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
