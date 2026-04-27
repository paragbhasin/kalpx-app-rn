# Audit Matrix Tooling (Silk Integrity / Full-Flow RN Verification)

Tooling that turns runtime artifacts from the Silk Integrity test pack
(Maestro results + API access logs + persona probes) into a single
master audit matrix. The matrix is the canonical artifact the Sprint 1
review consumes before flipping `MITRA_V3_*` flags.

All tools are pure-Python stdlib so CI does not pick up new deps. They
live in the RN repo (`kalpx-app-rn/scripts/`) alongside the Maestro
flows — keeping the verification harness co-located with the surface it
audits.

## Scripts

- `scripts/build_audit_matrix.py` — merges evidence into
  `audit_matrix.json` + `audit_matrix.md` (one row per flow, schema
  below).
- `scripts/persona_probe.py` — probes
  `/api/mitra/journey/companion/` per persona and emits JSON in the
  shape `build_audit_matrix.py --persona-probe` expects.

## Schema (matches Full-Flow RN Verification Mode standard)

```
flow | status | backend_content_source | endpoint | fe_files |
component_surface | failed_layer | exact_gap | severity |
root_cause | recommended_fix | sprint_classification
```

- `status`: `PASS` / `FAIL` / `PARTIAL`
- `failed_layer`: integer 1..7 from the Delivery-of-Done chain:
  1. content_authored
  2. resolver_selects
  3. endpoint_returns
  4. fe_reads_canonical
  5. component_renders
  6. no_fallback_override
  7. telemetry_logged
- `root_cause`: `data` | `resolver` | `endpoint` | `fe_mapping` |
  `render` | `fallback_masking` | `navigation` | `telemetry`
- `severity`: `P0` | `P1` | `P2`
- `sprint_classification`: `now` | `later`

## Layer-to-root-cause mapping

| signal | layer | root_cause |
|---|---|---|
| persona probe: missing Master rows | 1 | data |
| persona probe: empty `companion.*.ui.card_title` with `has_locked_triad=true` | 2 | resolver |
| API log: 4xx/5xx on flow endpoint during flow window | 3 | endpoint |
| Maestro: missing testID | 4 | fe_mapping |
| Maestro: asserted-visible string in `FALLBACK_DENY_LIST.txt` | 6 | fallback_masking |
| Maestro: generic assertion failure | 5 | render |
| Maestro: flaky tag | 5 | render (stabilise) |
| persona probe: telemetry.expected && !observed | 7 | telemetry |

Precedence is data > resolver > endpoint > fe_mapping > render >
fallback_masking > telemetry. This keeps P0 content-plane faults
surfaced even if Maestro flaked past them.

## Severity rules

- `P0`: layer 1-3 failure AND flow in Sprint 1 critical set (triad,
  joy, growth, grief, loneliness, completion_core_mantra,
  completion_support_matrix).
- `P1`: any fallback-masking hit (layer 6), or layer 4-5 failure in a
  Sprint-1 critical flow.
- `P2`: everything else non-PASS.

Sprint classification derives from severity:
`sprint_classification = "now"` if severity in {P0, P1}, else `later`.

## End-to-end usage

```bash
# 1. Run Maestro with JSON output (or JUnit; both accepted).
cd ~/kalpx-app-rn
mkdir -p .maestro/silk-integrity/.results/
npx maestro test .maestro/silk-integrity/ \
  --format json \
  --output .maestro/silk-integrity/.results/silk.xml

# 2. Pull dev API access log covering the Maestro run window.
scp -i ~/KalpXKeyPairName.pem ubuntu@18.223.217.113:/var/log/nginx/access.log \
  /tmp/dev_api_access.log

# 3. Probe personas (reads passwords from env).
python3 scripts/persona_probe.py \
  --base-url https://dev.kalpx.dev \
  --out /tmp/persona_probe_output.json

# 4. Build matrix.
python3 scripts/build_audit_matrix.py \
  --maestro-results-dir .maestro/silk-integrity/.results/ \
  --api-log /tmp/dev_api_access.log \
  --flow-map .maestro/silk-integrity/FLOW_STATUS.md \
  --deny-list .maestro/silk-integrity/FALLBACK_DENY_LIST.txt \
  --persona-probe /tmp/persona_probe_output.json \
  --out-json audit_matrix.json \
  --out-md audit_matrix.md
```

The final stdout line is a one-line JSON summary (`audit_summary`)
intended for CI parsing.

## Sample run

The bundled samples at `.maestro/silk-integrity/samples/` round-trip
deterministically:

```bash
python3 scripts/build_audit_matrix.py \
  --maestro-results-dir .maestro/silk-integrity/samples/sample_maestro_results \
  --api-log .maestro/silk-integrity/samples/sample_api_log.log \
  --flow-map .maestro/silk-integrity/samples/sample_FLOW_STATUS.md \
  --deny-list .maestro/silk-integrity/FALLBACK_DENY_LIST.txt \
  --persona-probe .maestro/silk-integrity/samples/sample_persona_probe.json \
  --out-json .maestro/silk-integrity/samples/sample_audit_matrix.json \
  --out-md .maestro/silk-integrity/samples/sample_audit_matrix.md
```

Expected `audit_summary` (as of the 2026-04-18 session state):

- `triad_reveal` -> `FAIL`, layer 1, `data`, `P0`, `now` — persona probe
  shows `test+day3` missing Master rows for mantra/sankalp/practice.
- `completion_core_mantra` -> `FAIL`, layer 6, `fallback_masking`,
  `P1`, `now` — Maestro captured the deny-list string
  `"How did that feel?"`.
- all 9 other Sprint-1 flows -> `PASS`.

## Extending for a new flow

1. Add the flow YAML at `.maestro/silk-integrity/NN_<slug>.yaml`.
2. Append a `FLOW_META[<slug>]` entry in
   `scripts/build_audit_matrix.py` with
   `backend_content_source`, `endpoint`, `fe_files`,
   `component_surface`.
3. If the flow is Sprint-1 critical, add its slug to
   `SPRINT1_P0_FLOW_SLUGS` so severity classification picks it up.
4. Add a row to `FLOW_STATUS.md`.
5. If the flow has a persona dependency, add the flow slug under the
   persona's `flows` list in `DEFAULT_PERSONAS` (or the
   `--personas-file` override).
6. If the flow expects a new deny-listed fallback string, append it to
   `FALLBACK_DENY_LIST.txt`.

## CI gate (proposed — not required today)

The JSON output is designed for:

```bash
python3 scripts/build_audit_matrix.py ... --out-json audit_matrix.json --out-md audit_matrix.md
python3 -c "import json,sys; s=json.load(open('audit_matrix.json')); \
  bad=[r for r in s if r['severity']=='P0' and r['sprint_classification']=='now']; \
  sys.exit(1 if bad else 0)"
```

Any P0 + `now` row fails the pipeline; P1 rows post to a warning
channel without blocking. The stdout `audit_summary` is a one-line
JSON that CI dashboards can consume directly.

## Known limitations / assumed formats

- Maestro result shapes: both JUnit XML (Maestro's default — one
  `testsuite`/`testcase` per flow) and JSON (`--format json` output)
  are supported. The JSON parser looks for flow identifier under
  `flow` or `name`, passed-state under `passed` or `status`, and
  failure under `failure` / `error`. If your Maestro version lays out
  `--format json` differently, extend `MaestroResultsParser._parse_json`.
- API log: combined log format only. Gunicorn/uvicorn logs without
  host/user prefix fall through silently — normalise upstream.
- Persona probe: expects `/api/auth/login/` to return a `access` or
  `token` JSON field and `/api/mitra/journey/companion/` to return the
  v3 shape (`triad.master`, `companion.<name>.ui.card_title`). If
  either contract changes, update `_analyse_companion`.
- Telemetry observation is taken as-is from the persona probe's
  `telemetry` map; the probe itself does not read MitraDecisionLog
  today. A follow-up job (Celery/Redis tail) should populate the
  `observed` flag.
- Flow window correlation uses Maestro `started_at`/`finished_at`. If
  those fields are absent (JUnit XML typically lacks them), every API
  log hit for the matching path is considered — which can over-report
  endpoint failures during long-running runs. Preferred: use
  `--format json` and ensure Maestro emits ISO-8601 timestamps.
- The 31-flow full suite is partially authored (11 Sprint 1 flows as
  of 2026-04-18). Missing flow YAMLs produce `PARTIAL` rows by design.
