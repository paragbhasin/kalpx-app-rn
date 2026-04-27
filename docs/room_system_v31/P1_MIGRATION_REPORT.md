# P1 Migration Report — Pool Format Migration (0144)

**Migration file:** `kalpx/core/migrations/0144_pool_format_migration.py`
**Dependency:** `("core", "0143_fix_stillness_mantra_surface_eligibility")`
**Date authored:** 2026-04-21
**Status:** WRITTEN — pending dev apply + smoke

---

## 1. Problem Statement

Rule 5 of the room scoring contract (`room_selection.py`, `_score_candidate`):

```python
if life_context and life_context in (row_life_context_bias or []):
    score += 1
```

This rule adds +1 to items whose `life_context_bias` matches the user's active
life context (work_career, money_security, relationships, etc.).

**Why Rule 5 never fires:** The selector builds `refs_with_role` (line ~1183) in
`select_room_actions`. For every bare-string ref it explicitly assigns `[]` bias:

```python
elif isinstance(r, str) and r:
    refs_with_role.append((r, "rotation", []))  # always empty bias
```

Only dict-format refs are read for their bias:

```python
if isinstance(r, dict):
    bias = r.get("life_context_bias") or []
    refs_with_role.append((rid, "rotation", bias))
```

Since all `RoomContentPool.rotation_refs` store bare strings (`["mantra.soham",
"niti_dharma_x"]`), Rule 5 has been a dead branch since the room system launched.

---

## 2. Design Decisions

### 2.1 Item-ID to Model Mapping

The pool stores two fundamentally different ID namespaces:

**Runner slots** (`mantra`, `practice`, `sankalp`, `sankalp_gratitude`,
`sankalp_blessings`, `sankalp_seva`) — look up `life_context_bias` from:

| item_id prefix | Model | Lookup field |
|---|---|---|
| `sankalp.*` | MasterSankalp | `item_id` |
| `practice.*` | MasterPractice | `item_id` |
| `mantra.*`, `peace_calm.*`, `om_*`, anything else | MasterMantra | `item_id` |

**Wisdom/principle slots** (`principle`, `wisdom_banner`, `wisdom_teaching`,
`wisdom_reflection`) — refs are `WisdomPrinciple.principle_id` values (not
`item_id`), look up using `principle_id` field.

**Non-converted slots** (`step`, `inquiry`, `carry`):
- `step` and `inquiry` store template/moment IDs, not content item_ids — these
  are used by `_emit_step()` and `_emit_inquiry()` and are never passed through
  `_resolve_runner_candidate`, so Rule 5 cannot apply to them.
- `carry` pool refs were authored as full dicts in migration 0125 with keys
  `{item_id, label, writes_event, category_slug}`. The migration's dict-check
  guard (`isinstance(ref, dict)`) preserves these untouched.

### 2.2 Locale Handling

The migration does NOT filter by locale (it uses `.first()` on the model query).
This is intentional: `life_context_bias` is locale-agnostic content metadata
that does not vary by locale. The en-locale row carries the authoritative value.

### 2.3 Miss Handling

If a ref's item_id does not exist in any model (legacy refs, deleted rows,
typos): `bias = []`. This is correct behavior — the item fails hard-filter
anyway if the row doesn't exist, so Rule 5 not firing is the safe default.

### 2.4 Idempotency

Every ref is guarded by `isinstance(ref, dict)` before conversion. If the
migration is re-run after partial success, already-converted refs are skipped.
This also means carry pool refs (which are already dicts with extra keys)
are preserved without touching their existing structure.

---

## 3. Per-Room × Per-Slot Coverage Analysis

The following table reflects the pool plan documented in `ROOM_POOL_PLAN_V2.yaml`
plus the additions from migrations 0132–0143. Actual counts depend on DB state at
apply time; the migration logs exact numbers per pool row.

### Room: stillness

| Slot | Total refs in rotation | Rule 5 applicable? | Notes |
|---|---|---|---|
| mantra | ~3 | NO | Stillness is pre-cognitive; no life_context room |
| practice | ~4 | NO | No life_context exclusion for stillness |
| wisdom_banner | ~4 | n/a | Wisdom slots not on Rule 5 path |

**Expectation:** All stillness refs will convert to `life_context_bias: []`.
This is correct per doctrine — stillness is a pre-cognitive room with no
life_context dimension. Rule 5 cannot and should not fire in room_stillness.

### Room: connection

| Slot | Total refs | Expected bias hits | Notes |
|---|---|---|---|
| mantra | ~3 | 0–2 | Bhakti mantras; bias depends on 0136 tagging |
| practice | ~2 | 1–2 | anahata family; relationships-biased expected |
| wisdom_banner | ~13 | n/a | Wisdom slots |

**Expectation:** Low signal; connection excludes work_career + money_security by
doctrine. Relationships-tagged mantras and practices may carry bias after
Wave 2 tagging.

### Room: release

| Slot | Total refs | Expected bias hits | Notes |
|---|---|---|---|
| mantra | ~3 | 0–2 | Shiva mantras; health_energy + relationships |
| practice | ~2 | 1–2 | health_energy biased (bhramari etc.) |
| wisdom_banner | ~11 | n/a | Wisdom slots |

**Expectation:** Moderate signal from Ayurveda-tagged practices and Shiva mantras
tagged health_energy. Release excludes purpose_direction by doctrine.

### Room: clarity

| Slot | Total refs | Expected bias hits | Notes |
|---|---|---|---|
| mantra | ~5 | 2–4 | Saraswati/Hanuman/Ganesha — work_career, purpose_direction |
| practice | ~4 | 1–3 | centering/drishti — work_career, daily_life |
| principle | ~107 | 40–70 | Niti corpus (0142) is heavily tagged: work_career, money_security, relationships, daily_life |
| wisdom_teaching | ~7 | 2–4 | Teaching-eligible principles with bias |
| wisdom_banner | ~6 | n/a | Banner uses principle_id values |

**Expectation:** HIGHEST Rule 5 signal in the system post-migration. The 50 Niti
principles added by 0142 carry explicit life_context_bias from TAG_PATCH_WAVE1B.
clarity × work_career and clarity × money_security will both have meaningful
rotation sets with non-empty bias.

### Room: growth

| Slot | Total refs | Expected bias hits | Notes |
|---|---|---|---|
| mantra | ~4 | 1–3 | Gayatri + Mahalakshmi — purpose_direction, money_security |
| practice | ~4 | 1–3 | walking/journaling — daily_life, purpose_direction |
| sankalp | ~8 | 2–4 | Growth sankalp pool — purpose_direction, work_career |
| principle | ~56+ | 25–40 | Yamas/Dinacharya heavy; all 8 Niti additions from 0142 |
| wisdom_teaching | ~7 | 2–4 | Growth teaching refs |

**Expectation:** HIGH signal. The Yamas + Dinacharya corpus in the growth
principle pool carries broad life_context_bias coverage across daily_life,
purpose_direction, work_career, and self_devotion.

### Room: joy

| Slot | Total refs | Expected bias hits | Notes |
|---|---|---|---|
| mantra | ~5 | 1–3 | Bhakti/Lakshmi — self_devotion, relationships |
| sankalp_gratitude | ~5 | 1–2 | Gratitude sankalp — self_devotion, daily_life |
| sankalp_blessings | ~5 | 1–2 | Blessings sankalp — self_devotion, relationships |
| sankalp_seva | ~6 | 0–1 | Seva sankalp — daily_life |
| carry | ~N | n/a | Already dict format; skipped |
| wisdom_banner | ~8 | n/a | Wisdom slots |

**Expectation:** Moderate signal. Joy excludes money_security by doctrine.
Bhakti mantras and gratitude sankalps will carry self_devotion and
relationships bias from tagging waves.

---

## 4. Items Grandfathered with Empty Bias

The following categories of items are expected to receive `life_context_bias: []`:

1. **All stillness mantras and practices** — pre-cognitive room with no
   life_context axis. Correct per doctrine.

2. **Bhakti mantras in connection/joy** — Bhakti tradition targets devotional
   register, not life-context specificity. These are expected to remain at `[]`
   unless Wave 3 tagging adds bias to them.

3. **Shiva mantras in release** — Healing-register mantras (Maha Mrityunjaya
   etc.) don't carry work/money/relationship specificity.

4. **Untagged wisdom principles** — Any WisdomPrinciple row that wasn't
   touched by TAG_PATCH_WAVE1 / TAG_PATCH_WAVE1B will have `life_context_bias: []`.
   This is correct — these rows' Rule 5 eligibility is gated on curator tagging.

5. **step / inquiry / carry refs** — Not converted (step/inquiry are non-runner
   slots; carry refs were already dicts).

---

## 5. Validation Approach

### 5.1 Migration-time assertion (hard)

After the forward function runs, the migration performs a post-conversion
assertion:

```python
for pool in RoomContentPool.objects.filter(status="active"):
    for ref in (pool.rotation_refs or []):
        if isinstance(ref, str):
            bare_found.append(...)
if bare_found:
    raise RuntimeError(...)
```

If any bare string survives in any active pool row, the migration aborts with
`RuntimeError` and the transaction rolls back. Apply will report failure; the
DB is left clean.

### 5.2 Runtime observability (soft)

After apply, the `RoomRenderLog.life_context_applied` column (already wired in
the selector) will start recording `True` for renders where Rule 5 fired.
Query:

```sql
SELECT
    room_id,
    life_context,
    COUNT(*) FILTER (WHERE life_context_applied) AS rule5_fired,
    COUNT(*) AS total
FROM core_roomrenderlog
WHERE life_context IS NOT NULL
GROUP BY room_id, life_context
ORDER BY room_id, life_context;
```

Expectation post-migration: clarity × work_career and growth × purpose_direction
should show the highest `rule5_fired` rates (most tagged rotation refs in those
cells).

### 5.3 Dev smoke check

```bash
# Apply
python manage.py migrate core 0144

# Verify: no bare strings in active pools
python manage.py shell -c "
from core.models import RoomContentPool
bare = []
for p in RoomContentPool.objects.filter(status='active'):
    for r in (p.rotation_refs or []):
        if isinstance(r, str):
            bare.append((p.room_id, p.action_slot, r))
print('Bare strings found:', len(bare))
for b in bare[:10]:
    print(b)
"

# Verify: Rule 5 signal in a test render (use life_context=work_career)
# Check RoomRenderLog.life_context_applied after a clarity render
```

---

## 6. Forward / Reverse Summary

### Forward: `convert_pool_refs_to_dict`

1. Fetch all `RoomContentPool` rows with `status="active"`.
2. For each pool row with non-empty `rotation_refs`:
   a. Iterate each ref.
   b. If already a dict — skip (idempotent guard).
   c. If bare string — determine model from slot type and item_id prefix.
   d. Look up `life_context_bias` from the appropriate model.
   e. Replace bare string with `{"item_id": <id>, "life_context_bias": <bias>}`.
3. Save with `update_fields=["rotation_refs"]`.
4. Log per-pool conversion counts.
5. Assert no bare strings remain — raise RuntimeError on failure.

### Reverse: `reverse_pool_refs_to_strings`

1. Fetch all active pool rows.
2. For each dict ref with keys exactly `{item_id, life_context_bias}` (or a
   subset) — this was produced by 0144 — extract `item_id` as bare string.
3. Dict refs with extra keys (carry pool entries: `{item_id, label,
   writes_event, category_slug}`) — preserved as-is.
4. Save with `update_fields=["rotation_refs"]`.

---

## 7. Key Risks and Mitigations

| Risk | Mitigation |
|---|---|
| WisdomPrinciple lookup misses (refs stored in principle/wisdom slots are not always principle_id — some older refs may use asset_id or slug variants) | `.first()` miss → `bias=[]`; safe fallback; log at DEBUG for post-apply audit |
| Carry pool refs overwritten | Dict guard (`isinstance(ref, dict)`) skips them unconditionally |
| Partial failure leaves mixed state | Idempotency guard means re-run converts only remaining bare strings; no double-wrap |
| Migration applied before Wave 2 tagging (`life_context_bias` still `[]` on most rows) | Correct behavior — `bias=[]` means Rule 5 still doesn't fire, same as before. Only newly-tagged rows (0136/0140 wave) gain signal |
| Production apply order | Must run 0143 first (dependency declared in Migration.dependencies) |

---

## 8. Rooms/Slots with Meaningful Rule 5 Signal Post-Migration

Based on TAG_PATCH_WAVE1 + WAVE1B tagging (0136 + 0140 + 0142):

| Room | Slot | Life contexts with signal |
|---|---|---|
| room_clarity | principle | work_career, money_security, relationships, daily_life, purpose_direction |
| room_clarity | mantra | work_career, purpose_direction |
| room_growth | principle | daily_life, purpose_direction, work_career, self_devotion, relationships |
| room_growth | sankalp | purpose_direction, work_career, daily_life |
| room_growth | mantra | purpose_direction, money_security |
| room_release | mantra | health_energy, relationships, self_devotion |
| room_release | practice | health_energy, self_devotion |
| room_connection | mantra | relationships, self_devotion |
| room_joy | mantra | self_devotion, relationships |
| room_stillness | (all) | none — pre-cognitive room, no life_context axis |

Rooms where Rule 5 SHOULD NOT fire by doctrine:
- `room_stillness` — no life_context dimension
- `room_joy` sankalp × money_security — context excluded by doctrine
- `room_connection` mantra × work_career + money_security — excluded by doctrine
- `room_release` principle × purpose_direction — excluded by doctrine
