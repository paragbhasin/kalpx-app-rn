# Surface Isolation Audit V2

**Audit Date:** 2026-04-21
**Scope:** English locale; room-pool contamination, surface leakage, override discipline
**Based on:** Agent B investigation of migrations 0117–0131, `core/rooms/room_selection.py`, `core/models.py`, master seed JSONs.

---

## Overall Health: CONCERNING

Three structural gaps and 16+15 confirmed contamination cases. Not blocking for v1 rooms today, but blocks clean Rule 5 activation and life_context governance.

---

## Part A — Isolation Verification (per room)

| Room | Pool-only draw? | Triad leakage? | Dashboard-chip leakage? | Additionals leakage? | Clean? |
|---|---|---|---|---|---|
| Stillness | Yes (explicit room_pool) | `practice.hand_on_heart` reused | No | No | ⚠ Minor |
| Connection | Yes | `mantra.soham` reused from stillness; `practice.hand_on_heart` shared | No | No | ⚠ Cross-room |
| Release | Yes | No | No | No | ✓ Clean |
| Clarity | Yes | `yoga_sutras_one_anchor_when_scattered` reused from stillness; 7 wisdom-assets reused across principle/banner/teaching/reflection slots within clarity (by dual-use design §5.7.5) | No | No | ⚠ By-design |
| Growth | Yes | 6 wisdom-assets reused across slots within growth (by dual-use design) | No | Sankalps reused from other pools | ⚠ Cross-surface |
| Joy | Yes | No | No | Potential sankalp overlap with additionals | ⚠ Cross-surface |

---

## Part C — Confirmed Contamination

### Cross-room contamination (16 cases)

Rows appearing in 2+ room pools:

- **`mantra.soham`** — room_stillness (ANCHOR) + room_connection. Violates sovereignty: stillness anchor reused as connection rotation.
- **`practice.hand_on_heart`** — room_stillness + room_connection
- **`yoga_sutras_one_anchor_when_scattered`** — room_stillness + room_clarity (ANCHOR in stillness)
- **13 wisdom assets** reused within room_clarity or room_growth across principle / wisdom_banner / wisdom_teaching / wisdom_reflection slots. This is **intentional** per §5.7.5 dual-use design (same canonical principle serves 4 surfaces within one room) — not a violation. Keep.

**Severity assessment:**
- Critical: 2 (`mantra.soham` stillness/connection; `yoga_sutras_one_anchor_when_scattered` stillness/clarity)
- Medium: 1 (`practice.hand_on_heart` stillness/connection)
- By-design: 13 (wisdom dual-use within single room — not a cross-room issue)

### Cross-surface contamination (15 cases)

From prior CONTAMINATION_AUDIT_V1.md: 15 rows appear in both room pools AND curated additional-items pools with empty `surface_eligibility`. These are accidental shared rows, not intentional overrides.

### Field-governance gap (CRITICAL)

The `surface_eligibility` field (added in migration 0117) is **empty (`[]`) on ALL master mantra/sankalp/practice rows**. `core/rooms/room_selection.py:144` includes a hard filter requiring `"support_room"` in `surface_eligibility`. Either:
- The live DB was backfilled externally (unverified), OR
- The filter is effectively bypassed in current rendering (behavior is observed-working on dev 12/12 green).

**Action:** Verify field-population state on dev DB; reconcile between seed JSON (empty) and live DB (presumably backfilled at migration time).

---

## Part D — What's working

- **Release pool** is the cleanest: no cross-room reuse, no cross-surface leakage.
- **Joy sankalp sub-slots** (gratitude/blessings/seva) are sovereign — no overlap with other rooms.
- **Per-room deity alignment** (Shiva stillness/release; Krishna connection/joy; Hanuman/Saraswati clarity; Vedanta growth) is maintained.
- **Dual-use within a room** (one principle → 4 surfaces in clarity+growth) is architecturally sound and should stay.

---

## Recommendations (must not be acted on without founder review)

1. **Decontaminate `mantra.soham`**: remove from room_connection; source a connection-native equivalent (Vasudeva/anahata-bija).
2. **Decontaminate `yoga_sutras_one_anchor_when_scattered`**: pick one home room (clarity preferred — it's a viveka teaching). Find a Vedanta-witness or YS 1.2 principle for stillness.
3. **Decontaminate `practice.hand_on_heart`**: remove from connection; connection should use `practice.anahata_humming` + `practice.anahata_meditation` (already there).
4. **Populate `surface_eligibility`** on all 554 master-JSON rows as part of Wave 1 tagging. Without this, Rule 5 cannot safely activate.
5. **Decontaminate room × additionals overlap** (15 rows): decide per-row whether the row is a sovereign room row OR an additionals row; do not allow silent shared use.

## Citations

- `core/rooms/room_selection.py:144` (hard filter on surface_eligibility)
- `core/migrations/0117_add_surface_eligibility.py`
- `core/migrations/0120_seed_room_pools_v1.py` (initial pool seed)
- `core/migrations/0130_add_surface_override_fields.py` (override fields added, not populated)
- `core/migrations/0131` — future slot for growth sankalp addition
- `docs/room_system_v31/audits/CONTAMINATION_AUDIT_V1.md` (prior Wave 1 finding)
