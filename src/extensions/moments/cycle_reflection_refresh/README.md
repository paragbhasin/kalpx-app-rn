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

## How to apply

1. Open `contentpack.json` in this folder.
2. Copy the fields into the backend CycleReflection template (see kalpx repo, content YAML).
3. Run the backend content-ingest command per ~/.claude user-memory rules.
4. Verify on dev that cycle reflection screen now shows the new copy.

Expected: Cycle reflection screen shows new copy lines.

---

## When done

- ONE commit per pack. Commit message: `content(moment): refresh cycle_reflection_refresh`
- Do NOT push without review.

## Must-not-do

- Do not hand-edit production YAML directly — use the ingest command (see ~/.claude rules: `feedback_db_verify_library.md`, `feedback_yaml_db_sync.md`).
- Do not modify the contentpack JSON schema — keys are shared with the backend template.
