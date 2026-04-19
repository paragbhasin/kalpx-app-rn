# Silk Integrity — Metro Operator Pack

**Owner model (2026-04-19):** Claude owns all code/content fixes, test authoring, and diagnosis. A human operator (or Claude in a session with Bash access) runs Metro + Maestro. This document is the exact hand-off contract — everything the operator needs to execute a run and everything Claude needs back to iterate.

---

## 1. Pre-run state (must all be true)

| Check | Expected | How to verify |
|---|---|---|
| Metro bundler running | HTTP 200 on `http://localhost:8081/status` | `curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:8081/status` |
| iOS sim booted | iPhone 15 Pro (iOS 17.5) shows `Booted` | `xcrun simctl list devices booted` |
| Dev backend healthy | HTTP 200 on `https://dev.kalpx.com/api/healthz` | `curl -sS -o /dev/null -w "%{http_code}\n" https://dev.kalpx.com/api/healthz` |
| Maestro installed | Maestro CLI prints `2.4.0` | `maestro --version` |
| RN app installed on sim | Bundle id `com.kalpx.app` present | `xcrun simctl listapps <sim-uuid> \| grep com.kalpx.app` |
| Canonical personas seeded | `soft_verified=True` for all 7 | see §5 |
| Backend env flag | `MITRA_V3_DISABLE_LATE_NIGHT_GATE=1` set on dev | ssh + `docker exec kalpx-dev-web printenv MITRA_V3_DISABLE_LATE_NIGHT_GATE` |

---

## 2. Launch commands (in order)

### Start Metro (if not already running)

```bash
cd ~/kalpx-app-rn
npx expo start --dev-client --clear
# Wait for "Metro waiting on exp+kalpx://..." then leave this terminal open.
```

### Boot / verify sim

```bash
xcrun simctl boot 221EDFB1-254E-4694-9B58-8BABEF2EBADD 2>/dev/null || true
open -a Simulator
```

---

## 3. Maestro commands

### Canary (proves the whole pipeline — expect green)

```bash
cd ~/kalpx-app-rn
maestro test .maestro/silk-integrity/05_dashboard_load.yaml \
  --format junit \
  --output .maestro/silk-integrity/.results/05_dashboard_load.xml
```

**Pass criteria:** `1/1 Flow Passed` in the Maestro output + `.results/05_dashboard_load.xml` contains `status="PASSED"`.

### Batch A — dashboard + support rooms (9 flows, ~36 min)

```bash
cd ~/kalpx-app-rn
for f in 05_dashboard_load 06_triad_visibility 07_quick_checkin_balanced 08_quick_checkin_agitated 09_triggered_flow 10_grief_room 11_loneliness_room 12_joy_room 13_growth_room; do
  echo "=== $f $(date +%H:%M:%S) ==="
  maestro test ".maestro/silk-integrity/${f}.yaml" \
    --format junit \
    --output ".maestro/silk-integrity/.results/${f}.xml" 2>&1 | tail -3
done
```

### Batch B — checkpoints + completion (13 flows, ~52 min)

```bash
for f in 14_day7_checkpoint 15_day14_checkpoint \
         16_completion_core_mantra 17_completion_core_sankalp 18_completion_core_practice \
         19_completion_grief_mantra 20_completion_loneliness_mantra \
         21_completion_joy_mantra 22_completion_growth_mantra 23_completion_growth_practice \
         24_completion_additional_library 25_completion_additional_custom 26_completion_additional_recommended; do
  echo "=== $f $(date +%H:%M:%S) ==="
  maestro test ".maestro/silk-integrity/${f}.yaml" --format junit \
    --output ".maestro/silk-integrity/.results/${f}.xml" 2>&1 | tail -3
done
```

### Batch C — parity surfaces (5 flows, ~20 min)

```bash
for f in 27_additional_items_surface 28_continuity 29_path_milestone 30_resilience_narrative 31_entity_card; do
  echo "=== $f $(date +%H:%M:%S) ==="
  maestro test ".maestro/silk-integrity/${f}.yaml" --format junit \
    --output ".maestro/silk-integrity/.results/${f}.xml" 2>&1 | tail -3
done
```

### Batch D — onboarding (4 flows, ~16 min) — requires `common/guest_enter.yaml` working

```bash
for f in 01_onboarding_start 02_recognition 03_triad_reveal 04_first_dashboard; do
  echo "=== $f $(date +%H:%M:%S) ==="
  maestro test ".maestro/silk-integrity/${f}.yaml" --format junit \
    --output ".maestro/silk-integrity/.results/${f}.xml" 2>&1 | tail -3
done
```

### Whole pack in one shot (~2 hours)

```bash
cd ~/kalpx-app-rn
mkdir -p .maestro/silk-integrity/.results
for f in .maestro/silk-integrity/[0-9]*.yaml; do
  base=$(basename "$f" .yaml)
  maestro test "$f" --format junit \
    --output ".maestro/silk-integrity/.results/${base}.xml" 2>&1 | tail -3
done
```

---

## 4. Artifacts to capture after each run

For Claude to diagnose failures, send back:

1. **`.maestro/silk-integrity/.results/*.xml`** — Maestro JUnit output (pass/fail + error text per flow)
2. **`~/.maestro/tests/<latest-timestamp>/`** — Maestro's own debug dir (contains `screenshot-❌-*.png` on fail, `maestro.log`, `commands-*.json`)
3. **`silk_*.png` / `bridge_*.png`** — flow-level screenshots the flows emit
4. **UI hierarchy dump** (only if flow failed and screenshot is ambiguous):
   ```bash
   maestro hierarchy > /tmp/hier_<flowname>.txt
   ```
5. **Backend log tail** for any 5xx / unexpected response:
   ```bash
   ssh -i ~/KalpXKeyPairName.pem ubuntu@18.223.217.113 \
     "docker logs --tail 200 kalpx-dev-web 2>&1 | tail -100"
   ```

The quickest relay back is a single tarball:

```bash
cd ~/kalpx-app-rn
tar czf /tmp/silk_run_$(date +%Y%m%d_%H%M).tgz \
  .maestro/silk-integrity/.results/ \
  silk_*.png bridge_*.png 2>/dev/null
```

---

## 5. Canonical personas on dev (all `soft_verified=True`)

Password for all: `smoke-dev-only-do-not-use-in-prod`

| Email | Day | Notes | Used by flows |
|---|---|---|---|
| `smoke+triad@kalpx.com` | 3/14 | Base canonical, triad locked. Momentum layout pre-practice. | 05–13, 16–23, 27, 31 |
| `persona_day7@kalpx.com` | 7/14 | Day-7 checkpoint firing. | 14, 29 |
| `persona_day14@kalpx.com` | 14/14 | Day-14 checkpoint firing. | 15, 30 |
| `persona_welcomeback@kalpx.com` | 14/14 + 35d gap | M12 long-absence welcome-back. | 28 |
| `persona_additional_library@kalpx.com` | 3/14 | Pre-seeded additional-library item. | 24, 27 |
| `persona_additional_custom@kalpx.com` | 3/14 | Pre-seeded additional-custom item. | 25 |
| `persona_additional_recommended@kalpx.com` | 3/14 | Pre-seeded additional-recommended item. | 26 |

To re-seed everything (wipes + re-creates journeys; users preserved):

```bash
ssh -i ~/KalpXKeyPairName.pem ubuntu@18.223.217.113 "docker exec kalpx-dev-web bash -lc '\
cd /app && \
python -c \"from core.models import *; JourneyActivity.objects.all().delete(); JourneyDay.objects.all().delete(); Journey.objects.all().delete()\" && \
python manage.py seed_canonical_persona_set --recreate && \
python -c \"from django.contrib.auth import get_user_model; U=get_user_model(); n=U.objects.filter(email__in=[\\\"smoke+triad@kalpx.com\\\",\\\"persona_day7@kalpx.com\\\",\\\"persona_day14@kalpx.com\\\",\\\"persona_welcomeback@kalpx.com\\\",\\\"persona_additional_library@kalpx.com\\\",\\\"persona_additional_custom@kalpx.com\\\",\\\"persona_additional_recommended@kalpx.com\\\"]).update(soft_verified=True); print(\\\"soft_verified=True on \\\", n)\"'"
```

---

## 6. Pass/fail decision tree

For each flow after a run:

1. **`Flow Passed`** in Maestro output + XML `status="PASSED"` → green, done.
2. **`Flow Failed (... is visible)` on a chip/text assertion:**
   - Capture `maestro hierarchy` at the fail point
   - If the expected text IS in the hierarchy but with an icon prefix → wrap the matcher in `.*…..*`
   - If the text is NOT in the hierarchy → persona state mismatch or backend content missing → check `journey/companion/` response for that persona
3. **`Element not found` on a `tapOn` by `id`:**
   - testID wasn't added to the component → add it to the source file; Metro reload; re-run
4. **`Cannot read property … of undefined` in red-box overlay:**
   - RN runtime crash. Fix in code. This is NOT a test bug.
5. **Flow times out at bridge step (`Begin your journey`, Dev Menu, Login):**
   - `common/connect_dev_client.yaml` or `common/login_as_persona.yaml` needs attention. Capture screenshot + hierarchy right after the hang.

---

## 7. Re-run loop (claude-owned)

```
Prep (Claude):
  - Apply code/content/selector fix
  - Commit + push (so operator can pull)
  - Indicate which flows to re-run

Metro run (operator):
  - git pull  (both repos if backend touched)
  - Metro auto-reloads local JS bundle
  - Run the flow(s) Claude named
  - Send back the tarball from §4

Diagnose (Claude):
  - Read XML + screenshot + hierarchy
  - Classify fail per §6 decision tree
  - Prepare next fix

Repeat until all flows reach PASSED.
```

---

## 8. Regression check before closing any flow

When a flow flips to green, re-run the canary flow (05) to confirm no upstream regression:

```bash
maestro test .maestro/silk-integrity/05_dashboard_load.yaml --format junit \
  --output .maestro/silk-integrity/.results/05_dashboard_load.xml
```

If 05 goes red after a previously-green state, revert the last change and diagnose.
