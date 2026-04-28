#!/usr/bin/env python3
"""
build_audit_matrix.py — Full-Flow RN Verification: master audit matrix builder.

Reads runtime artifacts produced by the Silk Integrity flow suite:
  * Maestro results (JUnit XML or --format json output)
  * Backend API access log (combined nginx/uvicorn)
  * FLOW_STATUS.md (markdown table of flow -> status -> notes)
  * FALLBACK_DENY_LIST.txt (strings that must not render)
  * Persona probe output (JSON emitted by persona_probe.py)

Emits a master audit matrix with one row per flow:
  flow | status | backend_content_source | endpoint | fe_files |
  component_surface | failed_layer | exact_gap | severity |
  root_cause | recommended_fix | sprint_classification

Stdlib-only; deterministic; CI-consumable.
"""
from __future__ import annotations

import argparse
import dataclasses
import datetime as _dt
import json
import logging
import os
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

SCHEMA_FIELDS: Tuple[str, ...] = (
    "flow",
    "status",
    "backend_content_source",
    "endpoint",
    "fe_files",
    "component_surface",
    "failed_layer",
    "exact_gap",
    "severity",
    "root_cause",
    "recommended_fix",
    "sprint_classification",
)

# layer -> DoD step name (see README §2).
LAYER_NAMES = {
    1: "content_authored",
    2: "resolver_selects",
    3: "endpoint_returns",
    4: "fe_reads_canonical",
    5: "component_renders",
    6: "no_fallback_override",
    7: "telemetry_logged",
}

SPRINT1_P0_FLOW_SLUGS = {
    "triad_reveal",
    "joy_room",
    "growth_room",
    "grief_room",
    "loneliness_room",
    "completion_core_mantra",
    "completion_support_matrix",
}

# Mapping flow slug -> canonical metadata. Keeps surface/file info next to
# the flow definition instead of being rediscovered per-run.
FLOW_META: Dict[str, Dict[str, str]] = {
    "recognition": {
        "backend_content_source": "ContentPack: M07_turn7_recognition",
        "endpoint": "POST /api/mitra/onboarding/complete/",
        "fe_files": "src/extensions/onboarding/RecognitionBlock.tsx",
        "component_surface": "RecognitionBlock",
    },
    "triad_reveal": {
        "backend_content_source": "WisdomAsset + triad orchestrator",
        "endpoint": "POST /api/mitra/journey/start/",
        "fe_files": "src/containers/companion/TriadRevealBlock.tsx",
        "component_surface": "TriadRevealBlock",
    },
    "home_contextual": {
        "backend_content_source": "ContentPack: M08_dashboard_day_active",
        "endpoint": "GET /api/mitra/journey/home/",
        "fe_files": "src/containers/companion_dashboard/*.tsx",
        "component_surface": "CompanionDashboard",
    },
    "grief_room": {
        "backend_content_source": "ContentPack: M46_grief_room",
        "endpoint": "POST /api/mitra/content/moments/M46_grief_room/resolve/",
        "fe_files": "src/containers/grief_room/index.tsx",
        "component_surface": "GriefRoomContainer",
    },
    "loneliness_room": {
        "backend_content_source": "ContentPack: M47_loneliness_room",
        "endpoint": "POST /api/mitra/content/moments/M47_loneliness_room/resolve/",
        "fe_files": "src/containers/loneliness_room/index.tsx",
        "component_surface": "LonelinessRoomContainer",
    },
    "joy_room": {
        "backend_content_source": "ContentPack: M48_joy_room",
        "endpoint": "POST /api/mitra/content/moments/M48_joy_room/resolve/",
        "fe_files": "src/containers/joy_room/JoyRoomContainer.tsx",
        "component_surface": "JoyRoomContainer",
    },
    "growth_room": {
        "backend_content_source": "ContentPack: M49_growth_room + M49_inquiry_seeds",
        "endpoint": "POST /api/mitra/content/moments/M49_growth_room/resolve/",
        "fe_files": "src/containers/growth_room/GrowthRoomContainer.tsx",
        "component_surface": "GrowthRoomContainer",
    },
    "day7_checkpoint": {
        "backend_content_source": "ContentPack: M24_checkpoint_day_7",
        "endpoint": "GET /api/mitra/journey/checkpoint/day7/",
        "fe_files": "src/containers/checkpoint/CheckpointDay7Block.tsx",
        "component_surface": "CheckpointDay7Block",
    },
    "day14_checkpoint": {
        "backend_content_source": "ContentPack: M25_checkpoint_day_14 + spine seed",
        "endpoint": "GET /api/mitra/journey/checkpoint/day14/",
        "fe_files": "src/containers/checkpoint/CheckpointDay14Block.tsx",
        "component_surface": "CheckpointDay14Block",
    },
    "completion_core_mantra": {
        "backend_content_source": "ContentPack: M_completion_return_core_mantra",
        "endpoint": "POST /api/mitra/journey/completion_return/",
        "fe_files": "src/containers/completion/CompletionReturnTransient.tsx",
        "component_surface": "CompletionReturnTransient",
    },
    "completion_support_matrix": {
        "backend_content_source": "ContentPack: M_completion_return (support × source)",
        "endpoint": "POST /api/mitra/journey/completion_return/",
        "fe_files": "src/containers/completion/CompletionReturnTransient.tsx",
        "component_surface": "CompletionReturnTransient",
    },
}


# ---------------------------------------------------------------------------
# Data shapes
# ---------------------------------------------------------------------------


@dataclasses.dataclass
class MaestroResult:
    """Normalized Maestro result for one flow."""

    flow: str
    passed: bool
    failure_message: Optional[str] = None
    failed_assertion: Optional[str] = None
    duration_s: Optional[float] = None
    started_at: Optional[_dt.datetime] = None
    finished_at: Optional[_dt.datetime] = None
    captured_strings: List[str] = dataclasses.field(default_factory=list)
    flaky: bool = False


@dataclasses.dataclass
class ApiLogHit:
    timestamp: _dt.datetime
    method: str
    path: str
    status: int


@dataclasses.dataclass
class FlowMapRow:
    slug: str
    number: Optional[str]
    status: Optional[str]
    notes: Optional[str]


@dataclasses.dataclass
class AuditRow:
    """Populated from all evidence sources; serialised 1:1 to schema."""

    flow: str
    status: str = "PARTIAL"
    backend_content_source: str = "unknown"
    endpoint: str = "unknown"
    fe_files: str = "unknown"
    component_surface: str = "unknown"
    failed_layer: Optional[int] = None
    exact_gap: str = ""
    severity: str = "P2"
    root_cause: str = ""
    recommended_fix: str = ""
    sprint_classification: str = "later"

    def to_dict(self) -> Dict[str, Any]:
        d = dataclasses.asdict(self)
        # keep schema column ordering
        return {k: d[k] for k in SCHEMA_FIELDS}


# ---------------------------------------------------------------------------
# Parsers
# ---------------------------------------------------------------------------


_NUM_PREFIX = re.compile(r"^\d+_")


def _flow_slug_from_name(name: str) -> str:
    """
    Normalise a flow file or flow id to its canonical slug.
    `01_recognition.yaml` / `silk_01_recognition` / `01_recognition` ->
    `recognition`.
    """
    base = Path(name).stem
    base = base.replace("silk_", "")
    base = _NUM_PREFIX.sub("", base)
    return base


class MaestroResultsParser:
    """Reads a directory of Maestro result files (XML JUnit + JSON)."""

    def __init__(self, results_dir: Path):
        self.results_dir = results_dir

    def parse(self) -> Dict[str, MaestroResult]:
        out: Dict[str, MaestroResult] = {}
        if not self.results_dir.exists():
            logging.warning("maestro results dir missing: %s", self.results_dir)
            return out
        for p in sorted(self.results_dir.iterdir()):
            if p.is_dir():
                continue
            if p.suffix == ".xml":
                out.update(self._parse_xml(p))
            elif p.suffix == ".json":
                res = self._parse_json(p)
                if res:
                    out[res.flow] = res
        return out

    # ------------------------------------------------------------------
    # JUnit XML — Maestro default
    # ------------------------------------------------------------------
    def _parse_xml(self, path: Path) -> Dict[str, MaestroResult]:
        try:
            tree = ET.parse(path)
        except ET.ParseError as exc:
            logging.error("xml parse error: %s %s", path, exc)
            return {}
        root = tree.getroot()
        results: Dict[str, MaestroResult] = {}
        # Maestro exports either a single <testsuite> or a <testsuites> wrapper.
        suites = root.findall("testsuite") if root.tag == "testsuites" else [root]
        for suite in suites:
            for case in suite.findall("testcase"):
                flow_raw = case.get("name") or case.get("classname") or ""
                flow = _flow_slug_from_name(flow_raw)
                failure = case.find("failure")
                passed = failure is None
                msg = failure.get("message") if failure is not None else None
                dur = case.get("time")
                results[flow] = MaestroResult(
                    flow=flow,
                    passed=passed,
                    failure_message=msg,
                    failed_assertion=(
                        (failure.text or "").strip() if failure is not None else None
                    ),
                    duration_s=float(dur) if dur else None,
                )
        return results

    # ------------------------------------------------------------------
    # JSON — Maestro --format json (newer)
    # ------------------------------------------------------------------
    def _parse_json(self, path: Path) -> Optional[MaestroResult]:
        try:
            data = json.loads(path.read_text())
        except (OSError, json.JSONDecodeError) as exc:
            logging.error("json parse error: %s %s", path, exc)
            return None
        flow = _flow_slug_from_name(data.get("flow") or data.get("name") or path.stem)
        passed = bool(data.get("passed", data.get("status") == "PASS"))
        failure = data.get("failure") or data.get("error") or {}
        assertion = None
        if isinstance(failure, dict):
            assertion = failure.get("assertion") or failure.get("message")
            msg = failure.get("message")
        else:
            msg = str(failure) if failure else None
            assertion = msg
        return MaestroResult(
            flow=flow,
            passed=passed,
            failure_message=msg,
            failed_assertion=assertion,
            duration_s=data.get("duration_s") or data.get("durationSeconds"),
            started_at=_parse_iso(data.get("started_at") or data.get("startedAt")),
            finished_at=_parse_iso(data.get("finished_at") or data.get("finishedAt")),
            captured_strings=list(data.get("captured_strings") or []),
            flaky=bool(data.get("flaky", False)),
        )


def _parse_iso(value: Optional[str]) -> Optional[_dt.datetime]:
    if not value:
        return None
    try:
        return _dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


# ---------------------------------------------------------------------------
# API access log
# ---------------------------------------------------------------------------

_COMBINED_LOG_RE = re.compile(
    r"^(?P<host>\S+) \S+ \S+ "
    r"\[(?P<time>[^\]]+)\] "
    r'"(?P<method>[A-Z]+) (?P<path>[^ ]+) [^"]+" '
    r"(?P<status>\d{3}) "
)


class ApiLogParser:
    """Parse combined-log-format access log for /api/mitra/* traffic."""

    def __init__(self, path: Optional[Path]):
        self.path = path

    def parse(self) -> List[ApiLogHit]:
        if not self.path or not self.path.exists():
            if self.path:
                logging.warning("api log missing: %s", self.path)
            return []
        hits: List[ApiLogHit] = []
        with self.path.open("r", errors="replace") as fh:
            for line in fh:
                m = _COMBINED_LOG_RE.match(line)
                if not m:
                    continue
                path = m.group("path")
                if "/api/mitra/" not in path:
                    continue
                try:
                    ts = _dt.datetime.strptime(
                        m.group("time"), "%d/%b/%Y:%H:%M:%S %z"
                    )
                except ValueError:
                    continue
                hits.append(
                    ApiLogHit(
                        timestamp=ts,
                        method=m.group("method"),
                        path=path,
                        status=int(m.group("status")),
                    )
                )
        return hits


# ---------------------------------------------------------------------------
# FLOW_STATUS.md
# ---------------------------------------------------------------------------


class FlowMapParser:
    """Pulls a flow_number/slug/status/notes table out of FLOW_STATUS.md."""

    def __init__(self, path: Optional[Path]):
        self.path = path

    def parse(self) -> Dict[str, FlowMapRow]:
        rows: Dict[str, FlowMapRow] = {}
        if not self.path or not self.path.exists():
            if self.path:
                logging.warning("flow map missing: %s", self.path)
            return rows
        text = self.path.read_text()
        for line in text.splitlines():
            if not line.strip().startswith("|"):
                continue
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) < 3:
                continue
            if cells[0].lower() in {"#", "flow", "---", ""}:
                continue
            if set(cells[0]) <= {"-", ":"}:
                continue
            number = cells[0]
            flow_label = cells[1]
            status = cells[2] if len(cells) > 2 else None
            notes = cells[-1] if len(cells) > 3 else None
            slug = _flow_slug_from_name(flow_label)
            rows[slug] = FlowMapRow(
                slug=slug, number=number, status=status, notes=notes
            )
        return rows


# ---------------------------------------------------------------------------
# Deny-list
# ---------------------------------------------------------------------------


def load_deny_list(path: Optional[Path]) -> List[str]:
    if not path or not path.exists():
        if path:
            logging.warning("deny-list missing: %s", path)
        return []
    entries: List[str] = []
    for line in path.read_text().splitlines():
        line = line.rstrip()
        if not line or line.lstrip().startswith("#"):
            continue
        entries.append(line)
    return entries


# ---------------------------------------------------------------------------
# Persona probe
# ---------------------------------------------------------------------------


def load_persona_probe(path: Optional[Path]) -> Dict[str, Any]:
    if not path or not path.exists():
        if path:
            logging.warning("persona probe missing: %s", path)
        return {}
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as exc:
        logging.error("persona probe parse error: %s", exc)
        return {}


# ---------------------------------------------------------------------------
# Audit matrix builder
# ---------------------------------------------------------------------------


class AuditMatrixBuilder:
    """Combine evidence sources into one AuditRow per flow."""

    def __init__(
        self,
        maestro_results: Dict[str, MaestroResult],
        api_hits: List[ApiLogHit],
        flow_map: Dict[str, FlowMapRow],
        deny_list: List[str],
        persona_probe: Dict[str, Any],
    ) -> None:
        self.maestro = maestro_results
        self.api_hits = api_hits
        self.flow_map = flow_map
        self.deny_list = deny_list
        self.probe = persona_probe

    # ------------------------------------------------------------------
    # Public entry
    # ------------------------------------------------------------------

    def build(self) -> List[AuditRow]:
        all_slugs = set(self.maestro) | set(self.flow_map) | set(FLOW_META)
        rows: List[AuditRow] = []
        for slug in sorted(all_slugs, key=self._sort_key):
            rows.append(self._build_row(slug))
        return rows

    # ------------------------------------------------------------------
    # Row assembly
    # ------------------------------------------------------------------

    def _sort_key(self, slug: str) -> Tuple[int, str]:
        row = self.flow_map.get(slug)
        if row and row.number:
            try:
                return (int(re.sub(r"\D", "", row.number) or "9999"), slug)
            except ValueError:
                pass
        return (9999, slug)

    def _build_row(self, slug: str) -> AuditRow:
        meta = FLOW_META.get(slug, {})
        row = AuditRow(
            flow=slug,
            backend_content_source=meta.get("backend_content_source", "unknown"),
            endpoint=meta.get("endpoint", "unknown"),
            fe_files=meta.get("fe_files", "unknown"),
            component_surface=meta.get("component_surface", "unknown"),
        )

        mres = self.maestro.get(slug)
        probe_fail = self._probe_layer_failure(slug)
        api_fail = self._api_layer_failure(row.endpoint, mres)
        deny_hit = self._deny_list_hit(mres)

        # Inference precedence: data > resolver > endpoint > fe_mapping >
        # render > fallback_masking > telemetry. P0 data/resolver faults must
        # win even if maestro flaked past them.
        if probe_fail is not None:
            layer, root_cause, gap, fix = probe_fail
            row.failed_layer = layer
            row.root_cause = root_cause
            row.exact_gap = gap
            row.recommended_fix = fix
            row.status = "FAIL"
        elif api_fail is not None:
            layer, root_cause, gap, fix = api_fail
            row.failed_layer = layer
            row.root_cause = root_cause
            row.exact_gap = gap
            row.recommended_fix = fix
            row.status = "FAIL"
        elif mres is None:
            row.status = "PARTIAL"
            row.exact_gap = "no maestro result for flow"
            row.recommended_fix = "run maestro; re-run audit matrix"
        elif not mres.passed:
            if deny_hit is not None:
                row.failed_layer = 6
                row.root_cause = "fallback_masking"
                row.exact_gap = f"deny-list string rendered: {deny_hit!r}"
                row.recommended_fix = (
                    "remove hardcoded fallback; bind component to ContentPack slot"
                )
            else:
                layer, root_cause, gap, fix = self._classify_assertion_failure(mres)
                row.failed_layer = layer
                row.root_cause = root_cause
                row.exact_gap = gap
                row.recommended_fix = fix
            row.status = "FAIL"
        else:
            # Maestro passed. Still check telemetry expectations.
            tel = self._telemetry_layer_failure(slug, mres)
            if tel is not None:
                layer, root_cause, gap, fix = tel
                row.failed_layer = layer
                row.root_cause = root_cause
                row.exact_gap = gap
                row.recommended_fix = fix
                row.status = "PARTIAL"
            else:
                row.status = "PASS"

        self._apply_severity(slug, row)
        self._apply_sprint_classification(row)
        self._overlay_flow_map_notes(slug, row)
        return row

    # ------------------------------------------------------------------
    # Failure classifiers
    # ------------------------------------------------------------------

    def _probe_layer_failure(
        self, slug: str
    ) -> Optional[Tuple[int, str, str, str]]:
        """Inspect persona probe output for L1/L2 hits on this flow."""
        if not self.probe:
            return None
        per_flow = self.probe.get("flows") or {}
        entry = per_flow.get(slug)
        if not entry:
            # Triad flow also reads `triad` key by convention.
            if slug == "triad_reveal":
                entry = self.probe.get("triad")
        if not entry:
            return None

        missing_master = entry.get("missing_master_rows") or []
        if missing_master:
            gap = (
                "Master rows missing for persona "
                f"{entry.get('persona', '?')}: "
                f"{', '.join(missing_master)}"
            )
            fix = (
                "seed WisdomAsset/ContentPack rows for the persona OR "
                "gate the persona off Sprint 1 smoke"
            )
            return 1, "data", gap, fix

        empty_titles = entry.get("empty_card_titles") or []
        if empty_titles and entry.get("has_locked_triad"):
            gap = (
                "resolver returned locked_triad but "
                f"companion.{','.join(empty_titles)}.ui.card_title empty"
            )
            fix = (
                "fix orchestrator mode/locale downgrade so card_title always "
                "resolves for locked personas"
            )
            return 2, "resolver", gap, fix
        return None

    def _api_layer_failure(
        self, endpoint: str, mres: Optional[MaestroResult]
    ) -> Optional[Tuple[int, str, str, str]]:
        if endpoint == "unknown" or not self.api_hits:
            return None
        # Extract just the path portion from "GET /api/..." style endpoint.
        path_match = re.search(r"/api/\S+", endpoint)
        if not path_match:
            return None
        target = path_match.group(0).rstrip("/")
        window = self._flow_window(mres)
        bad: List[ApiLogHit] = []
        for hit in self.api_hits:
            if not hit.path.startswith(target):
                continue
            if window and not (window[0] <= hit.timestamp <= window[1]):
                continue
            if hit.status >= 400:
                bad.append(hit)
        if not bad:
            return None
        first = bad[0]
        gap = f"{first.method} {first.path} -> {first.status}"
        fix = (
            "inspect backend handler + ContentPack resolver for this endpoint; "
            "ensure 2xx with populated slots"
        )
        return 3, "endpoint", gap, fix

    def _classify_assertion_failure(
        self, mres: MaestroResult
    ) -> Tuple[int, str, str, str]:
        msg = (mres.failure_message or "") + " " + (mres.failed_assertion or "")
        msg_low = msg.lower()
        if "testid" in msg_low or "could not find element with id" in msg_low:
            return (
                4,
                "fe_mapping",
                f"missing testID per assertion: {msg.strip()[:200]}",
                "add testID on the corresponding component OR fix canonical FE path",
            )
        if mres.flaky:
            return (
                5,
                "render",
                f"flaky render: {msg.strip()[:200]}",
                "stabilise wait/animation; retry under longer timeout",
            )
        return (
            5,
            "render",
            f"assertion failed: {msg.strip()[:200]}",
            "inspect component render; confirm slot-driven content reaches DOM",
        )

    def _deny_list_hit(self, mres: Optional[MaestroResult]) -> Optional[str]:
        if not mres or not self.deny_list:
            return None
        haystacks: List[str] = list(mres.captured_strings)
        haystacks.append(mres.failure_message or "")
        haystacks.append(mres.failed_assertion or "")
        for entry in self.deny_list:
            for hay in haystacks:
                if entry and entry in hay:
                    return entry
        return None

    def _telemetry_layer_failure(
        self, slug: str, mres: MaestroResult
    ) -> Optional[Tuple[int, str, str, str]]:
        if not self.probe:
            return None
        tel = self.probe.get("telemetry") or {}
        flow_tel = tel.get(slug)
        if not flow_tel:
            return None
        if flow_tel.get("expected") and not flow_tel.get("observed"):
            return (
                7,
                "telemetry",
                (
                    f"expected MitraDecisionLog row for moment_id="
                    f"{flow_tel.get('moment_id', '?')} not observed"
                ),
                "add/repair decision log writer; verify celery queue",
            )
        return None

    # ------------------------------------------------------------------
    # Severity + sprint classification
    # ------------------------------------------------------------------

    def _apply_severity(self, slug: str, row: AuditRow) -> None:
        if row.status == "PASS":
            row.severity = "P2"
            return
        if row.failed_layer in (1, 2, 3) and slug in SPRINT1_P0_FLOW_SLUGS:
            row.severity = "P0"
            return
        if row.failed_layer == 6 or row.root_cause == "fallback_masking":
            row.severity = "P1"
            return
        if row.failed_layer in (4, 5) and slug in SPRINT1_P0_FLOW_SLUGS:
            row.severity = "P1"
            return
        row.severity = "P2"

    def _apply_sprint_classification(self, row: AuditRow) -> None:
        if row.status == "PASS":
            row.sprint_classification = "later"
            return
        row.sprint_classification = (
            "now" if row.severity in {"P0", "P1"} else "later"
        )

    def _overlay_flow_map_notes(self, slug: str, row: AuditRow) -> None:
        fm = self.flow_map.get(slug)
        if not fm or not fm.notes:
            return
        # Do not clobber a concrete gap; append for context instead.
        if row.exact_gap:
            row.exact_gap = f"{row.exact_gap} | notes: {fm.notes}"
        else:
            row.exact_gap = f"notes: {fm.notes}"

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _flow_window(
        self, mres: Optional[MaestroResult]
    ) -> Optional[Tuple[_dt.datetime, _dt.datetime]]:
        if not mres or not mres.started_at or not mres.finished_at:
            return None
        return mres.started_at, mres.finished_at


# ---------------------------------------------------------------------------
# Renderers
# ---------------------------------------------------------------------------


def render_json(rows: List[AuditRow]) -> str:
    return json.dumps([r.to_dict() for r in rows], indent=2, sort_keys=False) + "\n"


def render_markdown(rows: List[AuditRow]) -> str:
    header = "| " + " | ".join(SCHEMA_FIELDS) + " |"
    sep = "| " + " | ".join(["---"] * len(SCHEMA_FIELDS)) + " |"
    lines = [
        "# Silk Integrity — Master Audit Matrix",
        "",
        f"_Generated {_dt.datetime.now(_dt.timezone.utc).isoformat()} _",
        "",
        header,
        sep,
    ]
    for row in rows:
        d = row.to_dict()
        cells = []
        for field in SCHEMA_FIELDS:
            value = d.get(field)
            if value is None:
                value = ""
            value = str(value).replace("|", "\\|").replace("\n", " ")
            cells.append(value)
        lines.append("| " + " | ".join(cells) + " |")
    lines.append("")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main(argv: Optional[Iterable[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--maestro-results-dir", type=Path, required=True)
    parser.add_argument("--api-log", type=Path, default=None)
    parser.add_argument("--flow-map", type=Path, default=None)
    parser.add_argument("--deny-list", type=Path, default=None)
    parser.add_argument("--persona-probe", type=Path, default=None)
    parser.add_argument("--out-json", type=Path, required=True)
    parser.add_argument("--out-md", type=Path, required=True)
    parser.add_argument("--log-level", default=os.environ.get("LOG_LEVEL", "INFO"))
    args = parser.parse_args(list(argv) if argv is not None else None)

    logging.basicConfig(
        level=getattr(logging, args.log_level.upper(), logging.INFO),
        format="build_audit_matrix %(levelname)s %(message)s",
    )

    logging.info("reading maestro results: %s", args.maestro_results_dir)
    maestro = MaestroResultsParser(args.maestro_results_dir).parse()
    logging.info("maestro flows parsed: %d", len(maestro))

    logging.info("reading api log: %s", args.api_log)
    api_hits = ApiLogParser(args.api_log).parse()
    logging.info("api log hits: %d", len(api_hits))

    logging.info("reading flow map: %s", args.flow_map)
    flow_map = FlowMapParser(args.flow_map).parse()
    logging.info("flow map rows: %d", len(flow_map))

    logging.info("reading deny-list: %s", args.deny_list)
    deny_list = load_deny_list(args.deny_list)
    logging.info("deny-list entries: %d", len(deny_list))

    logging.info("reading persona probe: %s", args.persona_probe)
    probe = load_persona_probe(args.persona_probe)

    builder = AuditMatrixBuilder(
        maestro_results=maestro,
        api_hits=api_hits,
        flow_map=flow_map,
        deny_list=deny_list,
        persona_probe=probe,
    )
    rows = builder.build()
    logging.info("audit rows produced: %d", len(rows))

    args.out_json.parent.mkdir(parents=True, exist_ok=True)
    args.out_md.parent.mkdir(parents=True, exist_ok=True)
    args.out_json.write_text(render_json(rows))
    args.out_md.write_text(render_markdown(rows))

    # Structured summary line — easy for CI to grep.
    counts: Dict[str, int] = {}
    for r in rows:
        counts[r.status] = counts.get(r.status, 0) + 1
    summary = {
        "total": len(rows),
        "PASS": counts.get("PASS", 0),
        "FAIL": counts.get("FAIL", 0),
        "PARTIAL": counts.get("PARTIAL", 0),
        "P0": sum(1 for r in rows if r.severity == "P0"),
        "P1": sum(1 for r in rows if r.severity == "P1"),
        "now": sum(1 for r in rows if r.sprint_classification == "now"),
    }
    logging.info("audit_summary %s", json.dumps(summary, sort_keys=True))
    print(json.dumps({"audit_summary": summary}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
