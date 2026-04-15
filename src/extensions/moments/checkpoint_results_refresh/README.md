# Moment: Checkpoint Results (Content Refresh)

## What this is
This is NOT a code change — it is a content pack. The scaffold contains a `contentpack.json` with refreshed copy for the day-7 / day-14 checkpoint results screens. Apply via backend template, no RN wiring.

## Where the design + exact copy comes from
WARNING: No dedicated spec file — see route_checkpoint_day_7.md / route_checkpoint_day_14.md.

The actual copy you will apply lives in this folder:
`src/extensions/moments/checkpoint_results_refresh/contentpack.json`

---

## This is NOT a code change

There is no RN wiring here — no `allContainers.js` edit, no BlockRenderer change, no action. The scaffold ships a `contentpack.json` that you copy into the backend content template.

## How to apply

1. Open `contentpack.json` in this folder.
2. Copy the fields into the backend Checkpoint template (kalpx repo, content YAML).
3. Run backend content-ingest.
4. Verify on dev that checkpoint screens show the new copy.

Expected: Checkpoint result screen shows new copy.

---

## When done

- ONE commit per pack. Commit message: `content(moment): refresh checkpoint_results_refresh`
- Do NOT push without review.

## Must-not-do

- Do not hand-edit production YAML directly — use the ingest command (see ~/.claude rules: `feedback_db_verify_library.md`, `feedback_yaml_db_sync.md`).
- Do not modify the contentpack JSON schema — keys are shared with the backend template.
