# Moment: Checkpoint Results (Content Refresh)

## What this is
This is NOT a code change — it is a content pack. The scaffold contains a `contentpack.json` with refreshed copy for the day-7 / day-14 checkpoint results screens. Apply via backend template, no RN wiring.

## Backend fields this moment needs

Reads from:
- Backend-returned `checkpoint_results_copy` for the day 7 / day 14 checkpoint

Backend content source:
- yaml stub: `core/data_seed/mitra_v3/checkpoint_results_copy.yaml` (TO BE CREATED — not yet present on `mitra-v3-sadhana-yatra`)

## Where the design + exact copy comes from
WARNING: No dedicated spec file — see route_checkpoint_day_7.md / route_checkpoint_day_14.md.

The actual copy you will apply lives in this folder:
`src/extensions/moments/checkpoint_results_refresh/contentpack.json`

---

## This is NOT a code change

There is no RN wiring here — no `allContainers.js` edit, no BlockRenderer change, no action. The scaffold ships a `contentpack.json` that you copy into the backend content template.

## How to ship this content pack

### Option A — via backend YAML (preferred)
1. Copy the key/value pairs from `contentpack.json` into `kalpx/core/data_seed/mitra_v3/checkpoint_results_copy.yaml` (create if it doesn't exist).
2. Run the content ingest: `docker exec kalpx-dev-web python manage.py ingest_mitra_v3_content --file=checkpoint_results_copy.yaml`
3. Restart Django: `docker compose -f docker-compose.dev.yml -p kalpxdev restart kalpx-dev-web`
4. Test: fire `kalpx://mitra/checkpoint/day_7` (or day_14) — new copy renders.

### Option B — via FE fallback (fastest)
1. Copy the key/value pairs into `src/engine/allContainers.js` under the checkpoint state(s).
2. Rebuild RN bundle.
3. Test in sim.

Time estimate: ~30-60 min.

Expected: Checkpoint result screen shows new copy.

---

## When done

- ONE commit per pack. Commit message: `content(moment): refresh checkpoint_results_refresh`
- Do NOT push without review.

## Must-not-do

- Do not hand-edit production YAML directly — use the ingest command (see ~/.claude rules: `feedback_db_verify_library.md`, `feedback_yaml_db_sync.md`).
- Do not modify the contentpack JSON schema — keys are shared with the backend template.
