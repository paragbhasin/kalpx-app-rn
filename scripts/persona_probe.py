#!/usr/bin/env python3
"""
persona_probe.py — probe the Mitra journey/companion endpoint for a list
of canonical smoke personas and emit JSON compatible with
`build_audit_matrix.py --persona-probe`.

Output shape (stable — consumed by AuditMatrixBuilder):

    {
      "generated_at": ISO-8601 string,
      "base_url": "...",
      "personas": {
        "<persona_id>": {
          "email": "...",
          "has_locked_triad": bool,
          "missing_master_rows": [str, ...],   # mantra/sankalp/practice
          "empty_card_titles": [str, ...],     # companion.*.ui.card_title
          "notes": str
        }
      },
      "flows": {
        "<flow_slug>": {
          "persona": "<persona_id>",
          "has_locked_triad": bool,
          "missing_master_rows": [str, ...],
          "empty_card_titles": [str, ...]
        }
      },
      "telemetry": {
        "<flow_slug>": {
          "expected": bool,
          "observed": bool,
          "moment_id": str
        }
      }
    }

Stdlib only. Auth via JWT obtained from
POST {base_url}/api/auth/login/ using persona email + password.
For local/dev shortcuts, `--auth-mode django-shell` reads a signed token
from `manage.py shell` on the target EC2 via ssh (optional).

Designed to exit 0 even when some personas fail to auth — the PARTIAL
rows it emits feed the audit matrix without masking failures.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import logging
import os
import ssl
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional

# Canonical smoke personas. Keep in sync with the memory entries describing
# test+day3 / smoke+triad etc. `expects_master` controls whether the triad
# card_title gate applies to this persona.
DEFAULT_PERSONAS: List[Dict[str, Any]] = [
    {
        "id": "test_day3",
        "email": "test+day3@kalpx.dev",
        "password_env": "PERSONA_TEST_DAY3_PASSWORD",
        "expects_master": True,
        "flows": ["triad_reveal", "home_contextual", "completion_core_mantra"],
    },
    {
        "id": "smoke_triad",
        "email": "smoke+triad@kalpx.dev",
        "password_env": "PERSONA_SMOKE_TRIAD_PASSWORD",
        "expects_master": True,
        "flows": ["triad_reveal"],
    },
    {
        "id": "test_day7",
        "email": "test+day7@kalpx.dev",
        "password_env": "PERSONA_TEST_DAY7_PASSWORD",
        "expects_master": True,
        "flows": ["day7_checkpoint"],
    },
    {
        "id": "test_day14",
        "email": "test+day14@kalpx.dev",
        "password_env": "PERSONA_TEST_DAY14_PASSWORD",
        "expects_master": True,
        "flows": ["day14_checkpoint"],
    },
    {
        "id": "test_welcomeback",
        "email": "test+welcomeback@kalpx.dev",
        "password_env": "PERSONA_TEST_WELCOMEBACK_PASSWORD",
        "expects_master": False,
        "flows": ["home_contextual"],
    },
    {
        "id": "smoke_joy",
        "email": "smoke+joy@kalpx.dev",
        "password_env": "PERSONA_SMOKE_JOY_PASSWORD",
        "expects_master": False,
        "flows": ["joy_room"],
    },
    {
        "id": "smoke_growth",
        "email": "smoke+growth@kalpx.dev",
        "password_env": "PERSONA_SMOKE_GROWTH_PASSWORD",
        "expects_master": False,
        "flows": ["growth_room"],
    },
]

TRIAD_MASTER_KEYS = ("mantra", "sankalp", "practice")


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------


class _HttpError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(f"HTTP {status}: {message}")
        self.status = status


def _http_json(
    method: str,
    url: str,
    body: Optional[Dict[str, Any]] = None,
    token: Optional[str] = None,
    timeout: float = 15.0,
    verify_tls: bool = True,
) -> Dict[str, Any]:
    data = None
    headers = {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    ctx = None
    if not verify_tls:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            raw = resp.read().decode("utf-8") or "{}"
            return json.loads(raw)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace") if exc.fp else ""
        raise _HttpError(exc.code, raw[:500]) from exc
    except urllib.error.URLError as exc:
        raise _HttpError(0, str(exc.reason)) from exc


# ---------------------------------------------------------------------------
# Probe logic
# ---------------------------------------------------------------------------


class PersonaProbe:
    def __init__(
        self,
        base_url: str,
        personas: List[Dict[str, Any]],
        verify_tls: bool = True,
    ):
        self.base_url = base_url.rstrip("/")
        self.personas = personas
        self.verify_tls = verify_tls

    # ------------------------------------------------------------------
    # Public entry
    # ------------------------------------------------------------------

    def probe(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {
            "generated_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
            "base_url": self.base_url,
            "personas": {},
            "flows": {},
            "telemetry": {},
        }
        for persona in self.personas:
            result = self._probe_persona(persona)
            out["personas"][persona["id"]] = result
            for flow in persona.get("flows", []):
                out["flows"][flow] = {
                    "persona": persona["id"],
                    "has_locked_triad": result["has_locked_triad"],
                    "missing_master_rows": result["missing_master_rows"],
                    "empty_card_titles": result["empty_card_titles"],
                }
                # Telemetry expectation: every Sprint-1 critical flow is
                # expected to write a MitraDecisionLog row. Real presence is
                # determined elsewhere (the builder consumes this only when
                # populated by a capture harness).
                out["telemetry"].setdefault(
                    flow,
                    {
                        "expected": True,
                        "observed": None,
                        "moment_id": _moment_for_flow(flow),
                    },
                )
        return out

    # ------------------------------------------------------------------
    # Per-persona
    # ------------------------------------------------------------------

    def _probe_persona(self, persona: Dict[str, Any]) -> Dict[str, Any]:
        password = os.environ.get(persona.get("password_env", ""), "")
        if not password:
            return {
                "email": persona["email"],
                "has_locked_triad": False,
                "missing_master_rows": list(TRIAD_MASTER_KEYS),
                "empty_card_titles": [],
                "notes": "no password env; persona skipped (partial)",
            }

        try:
            login = _http_json(
                "POST",
                f"{self.base_url}/api/auth/login/",
                body={"email": persona["email"], "password": password},
                verify_tls=self.verify_tls,
            )
        except _HttpError as exc:
            return {
                "email": persona["email"],
                "has_locked_triad": False,
                "missing_master_rows": list(TRIAD_MASTER_KEYS),
                "empty_card_titles": [],
                "notes": f"login_failed: {exc}",
            }

        token = login.get("access") or login.get("token")
        if not token:
            return {
                "email": persona["email"],
                "has_locked_triad": False,
                "missing_master_rows": list(TRIAD_MASTER_KEYS),
                "empty_card_titles": [],
                "notes": "login_missing_token",
            }

        try:
            payload = _http_json(
                "GET",
                f"{self.base_url}/api/mitra/journey/companion/",
                token=token,
                verify_tls=self.verify_tls,
            )
        except _HttpError as exc:
            return {
                "email": persona["email"],
                "has_locked_triad": False,
                "missing_master_rows": list(TRIAD_MASTER_KEYS),
                "empty_card_titles": [],
                "notes": f"companion_fetch_failed: {exc}",
            }

        return self._analyse_companion(persona, payload)

    def _analyse_companion(
        self, persona: Dict[str, Any], payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        companion = payload.get("companion") or {}
        triad = payload.get("triad") or companion.get("triad") or {}
        locked = bool(triad.get("locked") or payload.get("has_locked_triad"))
        missing_master: List[str] = []
        empty_titles: List[str] = []

        # Master-row check: per-session locked triad should carry Master
        # metadata for each of mantra/sankalp/practice. Missing any row
        # triggers L1 (data) classification on downstream flows.
        master = triad.get("master") or {}
        if persona.get("expects_master", False):
            for key in TRIAD_MASTER_KEYS:
                row = master.get(key) or {}
                if not row or not row.get("id"):
                    missing_master.append(key)

        # Empty card_title sweep — any companion.*.ui.card_title empty while
        # has_locked_triad=True = L2 resolver failure.
        for name, block in companion.items():
            if not isinstance(block, dict):
                continue
            ui = block.get("ui") or {}
            title = ui.get("card_title")
            if title is None or (isinstance(title, str) and not title.strip()):
                empty_titles.append(name)

        return {
            "email": persona["email"],
            "has_locked_triad": locked,
            "missing_master_rows": missing_master,
            "empty_card_titles": empty_titles,
            "notes": "ok",
        }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


_FLOW_TO_MOMENT = {
    "recognition": "M07_turn7_recognition",
    "triad_reveal": "M08_triad_reveal",
    "home_contextual": "M08_dashboard_day_active",
    "grief_room": "M46_grief_room",
    "loneliness_room": "M47_loneliness_room",
    "joy_room": "M48_joy_room",
    "growth_room": "M49_growth_room",
    "day7_checkpoint": "M24_checkpoint_day_7",
    "day14_checkpoint": "M25_checkpoint_day_14",
    "completion_core_mantra": "M_completion_return_core_mantra",
    "completion_support_matrix": "M_completion_return",
}


def _moment_for_flow(flow: str) -> str:
    return _FLOW_TO_MOMENT.get(flow, "")


def _load_personas_file(path: Optional[Path]) -> List[Dict[str, Any]]:
    if not path:
        return DEFAULT_PERSONAS
    if not path.exists():
        logging.warning("personas file missing, using defaults: %s", path)
        return DEFAULT_PERSONAS
    data = json.loads(path.read_text())
    if isinstance(data, dict):
        data = data.get("personas", [])
    if not isinstance(data, list):
        raise ValueError("personas file must be list or {personas: [...]}")
    return data


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-url",
        default=os.environ.get("KALPX_API_BASE", "https://dev.kalpx.dev"),
    )
    parser.add_argument("--personas-file", type=Path, default=None)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--insecure", action="store_true", help="skip TLS verify")
    parser.add_argument("--log-level", default=os.environ.get("LOG_LEVEL", "INFO"))
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=getattr(logging, args.log_level.upper(), logging.INFO),
        format="persona_probe %(levelname)s %(message)s",
    )

    personas = _load_personas_file(args.personas_file)
    probe = PersonaProbe(
        base_url=args.base_url,
        personas=personas,
        verify_tls=not args.insecure,
    )
    result = probe.probe()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, indent=2, sort_keys=False) + "\n")
    logging.info(
        "wrote persona probe: %s (%d personas, %d flows)",
        args.out,
        len(result["personas"]),
        len(result["flows"]),
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
