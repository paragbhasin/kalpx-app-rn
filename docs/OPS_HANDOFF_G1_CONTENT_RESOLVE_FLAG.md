# Ops Handoff — G1: `MITRA_V3_CONTENT_RESOLVE_ENABLED` on **staging only**

**Date:** 2026-04-18 (mid-CP-1 revision).
**Status:** OPEN — **staging only.** Production explicitly PARKED.
**Founder decision reference:** `docs/CP1_DECISIONS_LOG.md` G1 (revised).

## Scope constraint (hard)

- **No production env changes this sprint.** Do not touch `/home/ubuntu/KalpX/.env`.
- **No production flag flip.** `eas.json` production profile stays at `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=0`.
- **No production smoke path.** Preview build targets staging backend only.
- Prod rollout is parked until founder explicitly reopens via a separate ticket. When reopened, a new ops handoff will be written covering prod-specific steps (env, rollback drill, staged release).

## What we need

Explicitly set `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` on **staging** only, then verify with the 7-moment resolve probe matrix. Prod is out of scope this sprint.

Code default (`core/content/views.py:60`) is `"0"` (OFF). If the env key is absent, every Track 1 content resolve returns null and users see blank Joy/Growth/grief/loneliness/completion/checkpoint surfaces.

## Current state evidence

- **Dev:** `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` set in `/opt/kalpx-dev/app/KalpX/.env.dev` AND verified in container env (`docker exec kalpx-dev-web env`). 7-moment probe PASSES 7/7.
- **Staging:** state not verified from this session. **This is what ops must verify + fix.**
- **Prod:** **parked.** Do not touch this sprint.

## Steps (STAGING only)

Ops owns this work. Staging host, path, and container name need confirmation from ops — they are not in this session's memory. Pattern to apply:

```bash
# 1. SSH to staging host (ask ops for IP + user if unknown)
ssh -i <key> <user>@<staging-host>

# 2. cd to the staging KalpX checkout (ask ops for path)
cd <staging-KalpX-path>

# 3. Backup current env
cp .env.staging .env.staging.bak-$(date +%Y%m%d%H%M)   # or whatever staging uses

# 4. Append the flag if not present
grep -q '^MITRA_V3_CONTENT_RESOLVE_ENABLED=' .env.staging || \
  printf '\n# MDR-S1-07 (2026-04-18): required for Track 1 content resolution.\nMITRA_V3_CONTENT_RESOLVE_ENABLED=1\n' >> .env.staging

# 5. Recreate the staging web + celery containers
docker compose -f docker-compose.staging.yml up -d --force-recreate web celery 2>&1 | tail -5

# 6. Verify the env var is live
sleep 5
docker exec <staging-web-container-name> env | grep MITRA_V3_CONTENT_RESOLVE_ENABLED
```

Expected result: `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` appears in the container env output.

**Backup note:** `.env.staging.bak-<timestamp>` lets you roll back in <1 min if anything else regresses.

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
# staging (adjust container name)
docker cp /tmp/g1_resolve_probe.py <staging-web-container>:/tmp/
docker exec -i <staging-web-container> python manage.py shell < /tmp/g1_resolve_probe.py
```

**PASS criteria:** all 7 moments return `fallback=False` AND `slots >= 3`. `OVERALL: PASS` at the end.

## Deliverable back to Delivery Restoration

A short comment on this ticket (or a commit updating `S1_07_CONTENT_RESOLVE_GATE_REPORT.md`) with:

- Staging: PASS / FAIL with probe output.

Once staging PASSes, Phase 2 (preview build targeting staging backend) can start. Prod rollout stays parked and is not part of this handoff.

## Rollback plan

- If the env append breaks something unexpected: `mv .env.bak-<timestamp> .env && docker compose up -d --force-recreate web celery`. Restores prior state.
- If the resolve probe fails on a specific moment: that's a content / deploy-state issue (not env flag), and ops should loop in engineering — don't proceed with flag flip.

## Why this matters

The failure mode is not a visible crash — it is a **silent blank-surface state** on users' dashboards. That is the worst failure class for a sovereignty-governed content product: everything "works" from a technical standpoint, but the user experience is empty. Resolve probe catches this before it hits staging testers.

This is especially important now because prod is parked — staging is the only end-to-end validation environment for Sprint 1. If staging resolve fails silently, Sprint 1 cannot close.
