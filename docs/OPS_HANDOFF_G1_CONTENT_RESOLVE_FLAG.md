# Ops Handoff — G1: `MITRA_V3_CONTENT_RESOLVE_ENABLED` on staging + prod

**Date:** 2026-04-18 (immediately after CP-1 disposition).
**Status:** OPEN — **blocks S1-17 production flag flip.**
**Founder decision reference:** `docs/CP1_DECISIONS_LOG.md` G1.

## What we need

Explicitly set `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` on both **staging** and **prod** environments, then verify each with the 7-moment resolve probe matrix.

Code default (`core/content/views.py:60`) is `"0"` (OFF). If the env key is absent, every Track 1 content resolve returns null and users see blank Joy/Growth/grief/loneliness/completion/checkpoint surfaces.

## Current state evidence

- **Dev:** `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` set in `/opt/kalpx-dev/app/KalpX/.env.dev` AND verified in container env (`docker exec kalpx-dev-web env`). 7-moment probe PASSES 7/7.
- **Staging:** state not verified from this session.
- **Prod:** partial probe in earlier turn showed `/home/ubuntu/KalpX/.env` contains **zero** `MITRA_V3_*` flags. Parked per founder instruction. Must be remedied before Phase 5 flag flip.

## Steps (prod — 18.188.152.130)

```bash
ssh -i ~/KalpXKeyPairName.pem ubuntu@18.188.152.130
cd /home/ubuntu/KalpX
# Backup current env first
cp .env .env.bak-$(date +%Y%m%d%H%M)
# Append the flag (check it's not already there in case it moved)
grep -q '^MITRA_V3_CONTENT_RESOLVE_ENABLED=' .env || \
  printf '\n# MDR-S1-07 (2026-04-18): required for Track 1 content resolution.\nMITRA_V3_CONTENT_RESOLVE_ENABLED=1\n' >> .env
# Recreate the web + celery containers to pick up the new env var
docker compose up -d --force-recreate web celery 2>&1 | tail -5
# Verify the env var is now live in the container
sleep 5
docker exec kalpx-container env | grep MITRA_V3_CONTENT_RESOLVE_ENABLED
```

Expected result: `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` in the container env output.

**Backup note:** `.env.bak-<timestamp>` lets you roll back in <1 min if anything else regresses.

## Steps (staging)

Same shape as prod. Staging host, path, and container name need confirmation from ops — they are not in this session's memory. Apply the same backup + append + recreate pattern once you have them.

## Resolve probe (run on each env — dev has a reference script)

Copy this script to the target host, adjust the container name (`kalpx-container` on prod, `kalpx-dev-web` on dev, staging TBD), and run:

```python
# /tmp/g1_resolve_probe.py
from core.content.registry import load_registry, get_declaration
from core.content.orchestrator import resolve, MomentContentContext, TriadReadonlyView
load_registry()

def mk(mid, mode, uas, src=None, var=None):
    sig = {}
    if src: sig["runner_source"] = src
    if var: sig["runner_variant"] = var
    return MomentContentContext(
        moment_id=mid, path="support", stage_signals=sig,
        life_layer=TriadReadonlyView(cycle_id="t", life_kosha="manomaya", scan_focus="s"),
        today_layer={}, cycle_day=1, entered_via="g1-probe",
        guidance_mode=mode, locale="en", user_attention_state=uas,
        emotional_weight="light",
    )

cases = []
for mid, src, var in [
    ("M46_grief_room", None, None),
    ("M47_loneliness_room", None, None),
    ("M48_joy_room", None, None),
    ("M49_growth_room", None, None),
    ("M_completion_return", "core", "mantra"),
    ("M24_checkpoint_day_7", None, None),
    ("M25_checkpoint_day_14", None, None),
]:
    decl = get_declaration(mid)
    cases.append((mid, decl.presentation.user_attention_state, src, var))

all_ok = True
for mid, uas, src, var in cases:
    p = resolve(mid, mk(mid, "universal", uas, src, var))
    fb = bool(p.meta.fallback_used)
    n = len([v for v in (p.slots or {}).values() if v])
    ok = not fb and n >= 3
    if not ok: all_ok = False
    print(f"  {mid:28s} uas={uas:22s} fallback={fb!s:5s} slots={n} {'PASS' if ok else 'FAIL'}")

print(f"\nOVERALL: {'PASS' if all_ok else 'FAIL'}")
```

Run:
```bash
# prod
docker cp /tmp/g1_resolve_probe.py kalpx-container:/tmp/
docker exec -i kalpx-container python manage.py shell < /tmp/g1_resolve_probe.py
# staging (adjust container name)
```

**PASS criteria:** all 7 moments return `fallback=False` AND `slots >= 3`. `OVERALL: PASS` at the end.

## Deliverable back to Delivery Restoration

A short comment on this ticket (or a commit updating `S1_07_CONTENT_RESOLVE_GATE_REPORT.md`) with:

- Staging: PASS / FAIL with probe output.
- Prod: PASS / FAIL with probe output.

Once both PASS, the blocker on S1-17 clears and Phase 2 (preview build) can start.

## Rollback plan

- If the env append breaks something unexpected: `mv .env.bak-<timestamp> .env && docker compose up -d --force-recreate web celery`. Restores prior state.
- If the resolve probe fails on a specific moment: that's a content / deploy-state issue (not env flag), and ops should loop in engineering — don't proceed with flag flip.

## Why this matters

The failure mode is not a visible crash — it is a **silent blank-surface state** on prod users' dashboards. That is the worst failure class for a sovereignty-governed content product: everything "works" from a technical standpoint, but the user experience is empty. Resolve probe catches this before users do.
