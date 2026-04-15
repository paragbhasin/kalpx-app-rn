# Moment: Cycle Reflection (Content Refresh)

## What this is
This is NOT a code change — it is a content pack. The scaffold contains a `contentpack.json` with refreshed copy for the end-of-cycle reflection. Pavani edits the backend CycleReflection template to use this new copy; no RN engine wiring is needed.

## Where the design + exact copy comes from
WARNING: No dedicated spec file — see route_reflection_weekly.md or route_checkpoint_day_14.md for reflection context.

The actual copy you will apply lives in this folder:
`src/extensions/moments/cycle_reflection_refresh/contentpack.json`

---

## This is NOT a code change

There is no RN wiring here — no `allContainers.js` edit, no BlockRenderer change, no action. The scaffold ships a `contentpack.json` that you copy into the backend content template.

## How to ship this content pack

### Option A — via backend YAML (preferred)
1. Copy the key/value pairs from `contentpack.json` into `kalpx/core/data_seed/mitra_v3/cycle_reflection_copy.yaml` (create if it doesn't exist).
2. Run the content ingest: `docker exec kalpx-dev-web python manage.py ingest_mitra_v3_content --file=cycle_reflection_copy.yaml`
3. Restart Django: `docker compose -f docker-compose.dev.yml -p kalpxdev restart kalpx-dev-web`
4. Test: fire `kalpx://mitra/cycle_transitions/cycle_reflection` in sim — new copy should render.

### Option B — via FE fallback (fastest)
1. Copy the key/value pairs into `src/engine/allContainers.js` under the `cycle_reflection` state.
2. Rebuild RN bundle.
3. Test in sim.

Time estimate: ~30-60 min (honest revision; Option A requires a short deploy).

Expected: Cycle reflection screen shows new copy lines.

---

## When done

- ONE commit per pack. Commit message: `content(moment): refresh cycle_reflection_refresh`
- Do NOT push without review.

## Must-not-do

- Do not hand-edit production YAML directly — use the ingest command (see ~/.claude rules: `feedback_db_verify_library.md`, `feedback_yaml_db_sync.md`).
- Do not modify the contentpack JSON schema — keys are shared with the backend template.
