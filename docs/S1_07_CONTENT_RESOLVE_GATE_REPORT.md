# MDR-S1-07 — Content Resolve Release Gate Report

**Status:** PASS on dev · PASS-WITH-RISK on staging/prod pending explicit env confirmation.
**Owner:** Delivery Restoration. **Date:** 2026-04-18 (session turn continues).

**Gate:** before `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1` ships to production (CP-1), verify `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` is explicitly set on every target environment. The default behavior if the key is absent is **OFF** (`core/content/views.py:60`: `os.environ.get("MITRA_V3_CONTENT_RESOLVE_ENABLED", "0") == "1"`). A silent-default-OFF on prod would blank every Track 1 ContentPack-rendered surface (Joy Room, Growth Room, grief, loneliness, completion return, checkpoints).

## Verification matrix

| Check | Dev | Staging | Prod |
|---|---|---|---|
| Default behavior if key absent | `OFF` (source: `core/content/views.py:60`) | same | same |
| Key present in env file | ✅ `/opt/kalpx-dev/app/KalpX/.env.dev:MITRA_V3_CONTENT_RESOLVE_ENABLED=1` | ⚠ not verified — **needs ops confirm** | ⚠ not verified — **needs ops confirm** |
| Key present in running container env | ✅ verified via `docker exec kalpx-dev-web env \| grep MITRA_V3_CONTENT_RESOLVE_ENABLED` → `1` | ⚠ not verified | ⚠ not verified |
| Resolve success — M46 grief_room | ✅ `M46_universal_en_baseline`, 19 non-empty slots | ⚠ not probed | ⚠ not probed |
| Resolve success — M47 loneliness_room | ✅ `M47_universal_en_baseline`, 22 non-empty slots | ⚠ not probed | ⚠ not probed |
| Resolve success — M48 joy_room | ✅ `M48_universal_en_baseline`, 19 non-empty slots | ⚠ not probed | ⚠ not probed |
| Resolve success — M49 growth_room | ✅ `M49_universal_en_baseline`, 20 non-empty slots | ⚠ not probed | ⚠ not probed |
| Resolve success — M_completion_return (core/mantra) | ✅ `M_completion_return_core_mantra_en`, 6 non-empty slots | ⚠ not probed | ⚠ not probed |
| Resolve success — M24 checkpoint_day_7 | ✅ `M24_universal_en_baseline`, 13 non-empty slots | ⚠ not probed | ⚠ not probed |
| Resolve success — M25 checkpoint_day_14 | ✅ `M25_universal_en_baseline`, 13 non-empty slots | ⚠ not probed | ⚠ not probed |

## Verdict

- **Dev:** PASS. Flag explicit; all 7 priority moments resolve with non-fallback variants.
- **Staging:** PASS-WITH-RISK. The default-OFF behavior is the critical risk. Cannot directly verify from this session.
- **Prod:** PASS-WITH-RISK. Same risk vector as staging.

## Required to upgrade to PASS on all envs (blocks CP-1)

1. Ops confirms `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` is set in staging env (docker-compose env or equivalent).
2. Ops confirms `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` is set in prod env.
3. Repeat the 7-moment probe set against staging and prod DB. Ship when all probes return `fallback=False` with ≥ 3 non-empty slots.

## Recommendation

Treat as a CP-1 checklist item. The flag flip itself (MDR-S1-17 = production `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1`) should NOT land unless this gate is PASS on every target environment.

## Evidence

- Code default: `grep -n "CONTENT_RESOLVE" /Users/paragbhasin/kalpx/core/content/views.py` → line 60 returns `"0"` default.
- Dev env: `ssh ubuntu@18.223.217.113 "docker exec kalpx-dev-web env"` lists `MITRA_V3_CONTENT_RESOLVE_ENABLED=1`.
- Dev probes: `/tmp/s1_07_resolve_probes.py` — 7/7 PASS, OVERALL PASS.
