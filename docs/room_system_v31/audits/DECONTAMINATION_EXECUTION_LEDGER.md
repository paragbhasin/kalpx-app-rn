# Decontamination Execution Ledger

**Author:** Agent 2 — Wave 1 execution-ready consolidation
**Date:** 2026-04-21
**Status:** FOUNDER-REVIEW-PENDING (2-sig curator+founder approval required per OVERRIDE_LEDGER_V2)
**Locale scope:** English (en) only.

**Scope:** Row-level decisions for every row flagged for movement, removal, or dual-use-override in Wave 1 of the Room System v3.1.1 pool operationalization.

**Doctrine sources cited in this ledger:**
- `docs/room_system_v31/ROOM_SYSTEM_STRATEGY_V1.md` — §3 Surface-isolation, §5 Tagging v2, §5.7.5 Dual-use, §8 Selection rules
- `docs/room_system_v31/audits/SURFACE_ISOLATION_AUDIT_V2.md` — §C Contamination list (3 cross-room + 15 cross-surface)
- `docs/room_system_v31/audits/ROOM_TRADITION_ASSIGNMENT_V2.md` — Room × tradition lock
- `docs/room_system_v31/audits/OVERRIDE_LEDGER_V2.yaml` — 2-sig policy (founder + 1 curator)
- Migrations: `core/migrations/0132–0135_*.py`

---

## Summary Table

| op | count | status |
|---|---:|---|
| REMOVE | 3 | locked_by_doctrine (2-sig required for migration apply) |
| MOVE | 0 | — |
| DUAL-USE-OVERRIDE (cross-room, different surface) | 7 | proceed_with_2sig |
| DUAL-USE-OVERRIDE (cross-room, same surface) | 2 | founder_call_needed (G-7) |
| DUAL-USE (within-room) | 13 | locked_by_doctrine (§5.7.5 intentional) |
| GROUP-CALL-NEEDED (rooms ↔ additionals) | 15 | founder_call_needed |
| **Total rows with ledger entry** | **40** | — |

---

## Part A — Cross-room REMOVE operations (3 rows, locked by doctrine)

Referenced in `SURFACE_ISOLATION_AUDIT_V2.md` §C as cross-room contamination (Critical + Medium severity). All three are executed by `core/migrations/0133_decontaminate_cross_room_rows.py`.

### A.1 `mantra.soham`

| Field | Value |
|---|---|
| row_id | `mantra.soham` |
| current_rooms | `[room_stillness (ANCHOR), room_connection (rotation)]` |
| target_rooms | `[room_stillness (ANCHOR — unchanged)]` |
| operation | **REMOVE** from `room_connection` |
| rationale | Soham is the stillness ANCHOR (pre-cognitive dhyāna per ROOM_TRADITION_ASSIGNMENT_V2 §Stillness "dominant Yoga-Sūtras + Vedanta-witness"). Connection is mantra-primary in Bhakti-register (Nārada / Bhāgavata; deities Kṛṣṇa / Rāma / Viṣṇu per ROOM_TRADITION_V2 §Connection). Soham does not carry bhakti-rasa. Cross-room same-anchor violates sovereignty per SURFACE_ISOLATION_V2 §C critical. |
| replacement | No replacement needed in connection. Remaining connection mantra pool: anchor `mantra.om_namo_bhagavate_vasudevaya` + rotation `[hare_krishna, krishna_hare_krishna, emotional_healing.vasudevaya]` (4 total rows) still meets §Connection mantra-primary dominance. |
| approval_status | `locked_by_doctrine` (2-sig required to apply migration 0133 but doctrinal decision locked). |
| migration_binding | `core/migrations/0133_decontaminate_cross_room_rows.py` DECONTAMINATION_ACTIONS[0] |

### A.2 `practice.hand_on_heart`

| Field | Value |
|---|---|
| row_id | `practice.hand_on_heart` |
| current_rooms | `[room_stillness (rotation), room_connection (rotation)]` |
| target_rooms | `[room_stillness (rotation — unchanged)]` |
| operation | **REMOVE** from `room_connection` |
| rationale | Stillness is home room (self-soothing/grounding practice). Connection's practice pool is doctrinally anāhata-family (heart-centered bhakti practice) per ROOM_TRADITION_V2 §Connection. Connection practice rotation already holds `anahata_humming` (anchor) + `anahata_meditation` + `heart_softening` — complete without hand_on_heart. SURFACE_ISOLATION_V2 §C cross-room medium. |
| replacement | None needed. Connection practice pool reduces from 4 → 3 rows — acceptable per ROOM_CLASS_DOMINANCE §Connection (practice is SECONDARY, not primary). |
| approval_status | `locked_by_doctrine` |
| migration_binding | `core/migrations/0133_decontaminate_cross_room_rows.py` DECONTAMINATION_ACTIONS[2] |

### A.3 `yoga_sutras_one_anchor_when_scattered`

| Field | Value |
|---|---|
| row_id | `yoga_sutras_one_anchor_when_scattered` |
| current_rooms | `[room_stillness (wisdom_banner ANCHOR), room_clarity (wisdom_banner rotation)]` |
| target_rooms | `[room_stillness (wisdom_banner ANCHOR — unchanged)]` |
| operation | **REMOVE** from `room_clarity/wisdom_banner` |
| rationale | Stillness is home room (anchor-only teaching for pre-cognitive use; "still the vṛttis" = YS 1.2 register). Clarity uses cognitive-discernment register (viveka), not anchor-to-return. ROOM_CLASS_DOMINANCE §Clarity separately notes "principle-led discernment." SURFACE_ISOLATION_V2 §C cross-room critical. |
| replacement | `yoga_use_one_truthful_anchor` added to `room_clarity/wisdom_banner` via migration 0134 (YS-1.32 equivalent — satya-tempered version that reads as discrimination rather than pre-cognitive anchor). |
| approval_status | `locked_by_doctrine` |
| migration_binding | `core/migrations/0133_decontaminate_cross_room_rows.py` DECONTAMINATION_ACTIONS[1]; replacement via `core/migrations/0134_expand_clarity_principle_pool.py` BANNER_ADDITIONS[0] |

---

## Part B — Intentional cross-room DUAL-USE (7 rows with different surface)

Rows introduced or retained by Wave 1 migrations that appear in 2 rooms but on **different surfaces** (banner vs principle vs teaching). Per STRATEGY §5.7.5, dual-use is permitted within a room across surfaces; cross-room dual-use requires 2-sig sign-off per OVERRIDE_LEDGER_V2.

### B.1 `sankhya_witness_before_interpretation`

| Field | Value |
|---|---|
| row_id | `sankhya_witness_before_interpretation` |
| current_rooms | N/A (new via Wave 1) |
| target_rooms | `[room_clarity (principle), room_release (wisdom_banner)]` |
| operation | **DUAL-USE-OVERRIDE** (different surface + different emotional function) |
| rationale | Clarity use = L1/L2/L3 viveka-principle (discern seer from seen — analytical). Release use = banner light-support for witness-to-contraction (somatic-adjacent). ROOM_TRADITION_V2 §Release lists "Vedanta-witness" as LIGHT SUPPORT for witness-to-contraction; ROOM_TRADITION_V2 §Clarity lists Sankhya as DOMINANT for viveka. Different primary register. SURFACE_ISOLATION_V2 §A permits surface-differentiated dual-use. |
| replacement | None |
| approval_status | `proceed_with_2sig` (founder + curator sign-off); see ROOM_POOL_PLAN_V3 §G-6 |
| migration_binding | `core/migrations/0134_expand_clarity_principle_pool.py` PRINCIPLE_ADDITIONS; `core/migrations/0135_seed_dark_tradition_principles.py` ADDITIONS[(room_release, wisdom_banner)] |

### B.2 `bhakti_gratitude_keeps_the_heart_open`

| Field | Value |
|---|---|
| row_id | `bhakti_gratitude_keeps_the_heart_open` |
| current_rooms | N/A (new via Wave 1) |
| target_rooms | `[room_connection (wisdom_banner), room_joy (wisdom_banner)]` |
| operation | **DUAL-USE-OVERRIDE** (same surface class but different room tone: connection = reaching-toward; joy = celebrating-what-is) |
| rationale | ROOM_TRADITION_V2 §"Connection ≠ Joy" rule: "Both use Bhakti but connection is *reaching toward* (relational-japa); joy is *celebrating what is* (offering). Mantras/banners with deity = Viṣṇu/Kṛṣṇa/Rāma can serve both but must be tagged with different emotional_function (`deepen` vs `offer`)." Same row permitted; different emotional_function tag per row-in-room. Row-level tagging must record both emotional_function states. |
| replacement | None |
| approval_status | `proceed_with_2sig` (§G-4 clarifies bhakti joy banner count at 5 vs 3-4 which is a separate founder question) |
| migration_binding | `core/migrations/0135_seed_dark_tradition_principles.py` ADDITIONS[(room_connection, wisdom_banner)] + ADDITIONS[(room_joy, wisdom_banner)] |

### B.3 `bhakti_offer_the_moment_not_only_the_ritual`

| Field | Value |
|---|---|
| row_id | `bhakti_offer_the_moment_not_only_the_ritual` |
| current_rooms | N/A (new via Wave 1) |
| target_rooms | `[room_connection (wisdom_banner), room_joy (wisdom_banner)]` |
| operation | **DUAL-USE-OVERRIDE** (tone differentiation per §Connection-Joy rule) |
| rationale | Same as B.2 — Nārada Bhakti Sūtra-adjacent row with two emotional_function registers per room: connection = relational-devotion; joy = offering-register. |
| replacement | None |
| approval_status | `proceed_with_2sig` |
| migration_binding | `core/migrations/0135_seed_dark_tradition_principles.py` ADDITIONS[(room_connection, wisdom_banner)] + ADDITIONS[(room_joy, wisdom_banner)] |

### B.4 `dina_pre_meeting_arrive_before_you_speak`

| Field | Value |
|---|---|
| row_id | `dina_pre_meeting_arrive_before_you_speak` |
| current_rooms | N/A (new via Wave 1) |
| target_rooms | `[room_connection (wisdom_banner), room_clarity (principle)]` |
| operation | **DUAL-USE-OVERRIDE** (different surface + different tradition emphasis) |
| rationale | Connection use = devotional-daily banner (Dinacharya as devotional companion to relational life). Clarity use = principle L1/L2/L3 (Dinacharya as rhythm-before-decision per §Clarity light support). Different surfaces (banner vs principle); STRATEGY §5.7.5 permits surface-differentiated dual-use. |
| replacement | None |
| approval_status | `proceed_with_2sig`; see ROOM_POOL_PLAN_V3 §G-5 |
| migration_binding | `core/migrations/0135_seed_dark_tradition_principles.py` ADDITIONS[(room_connection, wisdom_banner)] + ADDITIONS[(room_clarity, principle)] |

### B.5 `dina_sunday_reset_restore_the_weekly_rhythm`

| Field | Value |
|---|---|
| row_id | `dina_sunday_reset_restore_the_weekly_rhythm` |
| current_rooms | N/A (new via Wave 1) |
| target_rooms | `[room_connection (wisdom_banner), room_clarity (principle)]` |
| operation | **DUAL-USE-OVERRIDE** |
| rationale | Same pattern as B.4 — weekly-reset Dinacharya teaching surfaces as devotional-daily in connection (banner) and as rhythm-before-decision principle in clarity (L1/L2/L3). §5.7.5 permits. |
| replacement | None |
| approval_status | `proceed_with_2sig`; see §G-5 |
| migration_binding | `core/migrations/0135_seed_dark_tradition_principles.py` ADDITIONS[(room_connection, wisdom_banner)] + ADDITIONS[(room_clarity, principle)] |

### B.6 `yamas_tapas_warmth_not_punishment`

| Field | Value |
|---|---|
| row_id | `yamas_tapas_warmth_not_punishment` |
| current_rooms | N/A (new via Wave 1) |
| target_rooms | `[room_growth (principle), room_growth (wisdom_banner)]` |
| operation | **DUAL-USE-WITHIN-ROOM** (not cross-room) |
| rationale | Within-room dual-use across surfaces (principle slot + banner surface in growth). STRATEGY §5.7.5 explicitly permits and documents this pattern. Not a violation. Included here for audit trail. |
| replacement | None |
| approval_status | `locked_by_doctrine` (§5.7.5 intentional) |
| migration_binding | `core/migrations/0135_seed_dark_tradition_principles.py` ADDITIONS[(room_growth, principle)] + ADDITIONS[(room_growth, wisdom_banner)] |

### B.7 `niyamas_santosha_rest_in_enough`

| Field | Value |
|---|---|
| row_id | `niyamas_santosha_rest_in_enough` |
| current_rooms | N/A (new via Wave 1) |
| target_rooms | `[room_growth (principle), room_growth (wisdom_banner)]` |
| operation | **DUAL-USE-WITHIN-ROOM** |
| rationale | Same as B.6 — within-room dual-use per §5.7.5. Santosha principle surfaces both as cultivation substrate (principle) and as encouragement banner. |
| replacement | None |
| approval_status | `locked_by_doctrine` (§5.7.5 intentional) |
| migration_binding | `core/migrations/0135_seed_dark_tradition_principles.py` ADDITIONS[(room_growth, principle)] + ADDITIONS[(room_growth, wisdom_banner)] |

Note: `gita_no_effort_is_lost` and `gita_lift_by_abhyasa_and_detachment` follow the same within-room dual-use pattern in growth (principle + banner; principle + teaching respectively). Bundled into Part D below.

---

## Part C — Cross-room SAME-SURFACE dual-use (2 rows, founder_call_needed)

These are the doctrinally ambiguous cases: same row, same surface class (principle), different rooms. POOL_GAP_REPORT_V2 §D risk register flagged MEDIUM. §5.7.5 is silent on whether cross-room same-surface dual-use is allowed.

### C.1 `yoga_abhyasa_steady_return`

| Field | Value |
|---|---|
| row_id | `yoga_abhyasa_steady_return` |
| current_rooms | N/A (new via Wave 1) |
| target_rooms | `[room_clarity (principle), room_growth (principle)]` — SAME surface class in both rooms |
| operation | **DUAL-USE-OVERRIDE** — cross-room same-surface |
| rationale | Clarity use = YS kleśa-analysis / citta-vritti discernment context (viveka register). Growth use = abhyāsa substrate for svadharma-practice (cultivation register). Same text, different life_context biasing at render time. POOL_GAP_REPORT §D: "breaks §SURFACE_ISOLATION_V2 if strict interpretation." |
| replacement | If founder strict-interprets §5.7.5 as within-room only, must REMOVE from one. Suggest removing from clarity (growth is YS native home for abhyāsa per §Growth "light support: Yoga-Sūtras (abhyāsa, tapas, svādhyāya)"). |
| approval_status | `founder_call_needed` — see ROOM_POOL_PLAN_V3 §G-7 |
| migration_binding | `core/migrations/0134_expand_clarity_principle_pool.py` PRINCIPLE_ADDITIONS; `core/migrations/0135_seed_dark_tradition_principles.py` ADDITIONS[(room_growth, principle)] |

### C.2 `yamas_satya_clean_truth`

| Field | Value |
|---|---|
| row_id | `yamas_satya_clean_truth` |
| current_rooms | N/A (new via Wave 1) |
| target_rooms | `[room_clarity (principle), room_growth (principle)]` — SAME surface class in both rooms |
| operation | **DUAL-USE-OVERRIDE** — cross-room same-surface |
| rationale | Clarity use = satya × relationships (truthful timing per §Clarity relationships-context authoring). Growth use = Yamas primary substrate (ethical cultivation per §Growth). Same text, different life_context bias at render time. Less aggravating than C.1 because §Clarity explicitly lists "Yamas satya/ahimsa × relationships" as light support and §Growth lists Yamas as primary — doctrine authorizes the same row in both rooms but §5.7.5 strict reading forbids. |
| replacement | If strict: remove from clarity (growth is primary home per §Growth). Clarity retains `yamas_satya_with_timing` (not in growth). |
| approval_status | `founder_call_needed` — see §G-7 (bundled with C.1) |
| migration_binding | `core/migrations/0135_seed_dark_tradition_principles.py` ADDITIONS[(room_clarity, principle)] + ADDITIONS[(room_growth, principle)] |

---

## Part D — Intentional within-room DUAL-USE (13 rows, locked by doctrine §5.7.5)

Per STRATEGY §5.7.5 and SURFACE_ISOLATION_V2 §C "By-design wisdom dual-use within a single room", the same principle row surfaces across 4 slot types (principle / wisdom_banner / wisdom_teaching / wisdom_reflection) within ONE room. Not a violation.

Count confirmed at 13 in SURFACE_ISOLATION_V2 §C and OVERRIDE_LEDGER_V2. These exist today in room_clarity and room_growth; Wave 1 adds roughly 4 more (the within-room dual-use rows in growth via 0135 — `yamas_tapas_warmth_not_punishment`, `niyamas_santosha_rest_in_enough`, `gita_no_effort_is_lost`, `gita_lift_by_abhyasa_and_detachment`).

| Aggregate field | Value |
|---|---|
| count_pre_wave_1 | 13 |
| count_post_wave_1 | 17 (estimate; 13 + 4 new growth within-room dual-use rows) |
| operation | **DUAL-USE-WITHIN-ROOM** |
| rationale | STRATEGY §5.7.5: same principle serves 4 surfaces within one room; no override required; not a cross-room issue. SURFACE_ISOLATION_V2 §C explicitly documents: "13 wisdom assets reused within room_clarity or room_growth across principle / wisdom_banner / wisdom_teaching / wisdom_reflection slots. This is **intentional** per §5.7.5 dual-use design — not a violation. Keep." |
| approval_status | `locked_by_doctrine` — no approval needed, but documentation required in OVERRIDE_LEDGER_V2 `intentional_cross_surface_uses` section (already present; `requires_override_tagging: false`). |
| migration_binding | Pre-existing 0120 seed (13 rows) + 0135 additions (4 new rows) |
| action | Confirm the 13 (and projected 17) count is reflected in OVERRIDE_LEDGER_V2 and add a row-by-row enumeration in a Wave 1b audit pass. |

---

## Part E — Cross-surface (rooms ↔ additionals) overlap (15 rows, group_call_needed)

`SURFACE_ISOLATION_AUDIT_V2.md` §C references "15 rows appear in both room pools AND curated additional-items pools with empty `surface_eligibility`" from prior `CONTAMINATION_AUDIT_V1.md`. However, `CONTAMINATION_AUDIT_V1.md` is **not present on disk** (verified via `Glob` + `Grep` across `docs/room_system_v31/`). The 15 specific row IDs are not enumerated in any current artifact Agent 2 had access to.

**Conclusion:** Cannot call each of the 15 rows individually at this ledger's scope. Grouped as `group_call_needed` per the task brief rules.

| Aggregate field | Value |
|---|---|
| group_id | CROSS_SURFACE_ROOM_ADDITIONALS |
| count | 15 |
| current_rooms | Each row appears in 1+ room pool AND 1+ curated additional-items pool. |
| target_rooms | Founder-dependent; each row must be decided as sovereign-room-row OR sovereign-additionals-row (not both) per SURFACE_ISOLATION_V2 §C recommendation. |
| operation | **REMOVE** from one surface OR **DUAL-USE-OVERRIDE** with explicit `surface_override_*` metadata (2-sig required) per STRATEGY §3 override rule. |
| rationale | STRATEGY §3: "Core triad content and Additional content **must not** appear in room pools by default." These 15 rows are the opposite direction (room ↔ additional) but the isolation principle holds: rooms = state-responsive intervention; additionals = elective extension. Silent overlap bypasses §3. |
| replacement | N/A until rows are enumerated. |
| approval_status | `group_call_needed` — founder must authorize either (a) an audit pass to enumerate the 15 rows and issue per-row decisions, OR (b) a blanket cleanup strategy (e.g., "default to room sovereignty; remove from additionals unless overridden"). |
| migration_binding | No migration yet. Blocks Wave 1b per WAVE1_SYNTHESIS §7 carryover #5. |
| group_call_question | "Authorize a Wave 1b audit pass to enumerate the 15 cross-surface rows and issue per-row REMOVE or DUAL-USE-OVERRIDE decisions; OR authorize a blanket resolution rule (room-sovereign default)?" |
| doctrine_ref | STRATEGY §3; SURFACE_ISOLATION_V2 §C "15 rows appear in both room pools AND curated additional-items pools with empty `surface_eligibility`"; WAVE1_SYNTHESIS §7 carryover #5; POOL_GAP_REPORT_V2 §C.3 non-authoring tasks #4 |

---

## Part F — Intentional dual-use confirmation (§5.7.5 baseline)

Per task brief: "The 13 intentional dual-use rows (wisdom assets within clarity/growth) — confirm they are documented as intentional per §5.7.5; no action needed."

**Confirmed:**
- STRATEGY `ROOM_SYSTEM_STRATEGY_V1.md` §5 governance model names "same principle serves 4 surfaces within one room" as an explicit pattern.
- SURFACE_ISOLATION_AUDIT_V2.md §C documents the 13-row count as "intentional per §5.7.5 dual-use design — not a violation. Keep."
- OVERRIDE_LEDGER_V2.yaml `intentional_cross_surface_uses` section records `count: 13`, `requires_override_tagging: false`, and the note "Document this as 'intentional dual-use within room' in the canonical strategy doc so future audits don't flag it."

**No action** required on the 13 pre-existing within-room dual-use rows. Wave 1 adds ~4 more within-room dual-use rows in growth (see Part D); the aggregate count should be refreshed in OVERRIDE_LEDGER_V2 after 0135 applies.

---

## Appendix — Operations summary by migration

| Migration | Ops | Rows affected | Type |
|---|---:|---:|---|
| 0132_add_growth_sankalp_slot.py | 1 (seed new pool row with 9 refs) | 9 sankalp refs | structural addition |
| 0133_decontaminate_cross_room_rows.py | 3 (rotation_refs mutations) | 3 rows (A.1, A.2, A.3) | REMOVE |
| 0134_expand_clarity_principle_pool.py | ~52 rows appended to clarity pools | 52 refs (principle 49 + banner 1 + teaching 2) | structural additions + 1 dual-use-override candidate (`yoga_abhyasa_steady_return` C.1) + 1 banner replacement for A.3 |
| 0135_seed_dark_tradition_principles.py | ~75 rows appended across 8 (room, slot) targets | 75 refs total | structural additions + 7 dual-use-override candidates (B.1-B.5, C.1, C.2) + 4 within-room dual-use (Part D) |

---

## Founder sign-off blocks

Cannot proceed to migration apply without:

1. Ledger review and 2-sig on all Part A removals (locked-by-doctrine but procedural 2-sig per OVERRIDE_LEDGER_V2).
2. Ledger review and 2-sig on all Part B dual-use-overrides (7 rows).
3. Founder decision on Part C (2 rows) — see ROOM_POOL_PLAN_V3 §G-7.
4. Founder decision on Part E group call — authorize Wave 1b enumeration pass OR blanket rule.
5. Update OVERRIDE_LEDGER_V2.yaml post-apply to:
   - Remove `rows_requiring_override_if_they_stay` (all 3 resolved)
   - Add 7 entries for Part B intentional cross-room dual-use with required metadata (`surface_override_approved_by`, `surface_override_reason`, `surface_override_date`, `surface_override_scope`, `surface_override_expiry_optional` per STRATEGY §3)
   - Update `intentional_cross_surface_uses.count` from 13 → 17

## References

- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/ROOM_SYSTEM_STRATEGY_V1.md` §3 §5 §5.7.5 §8
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/SURFACE_ISOLATION_AUDIT_V2.md` §C
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/ROOM_TRADITION_ASSIGNMENT_V2.md`
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/OVERRIDE_LEDGER_V2.yaml`
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/POOL_GAP_REPORT_V2.md` §D risk register
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/ROOM_POOL_PLAN_V3.yaml` §founder_calls_needed
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/WAVE1_SYNTHESIS.md` §7 carryover checklist
- `/Users/paragbhasin/kalpx/core/migrations/0132_add_growth_sankalp_slot.py`
- `/Users/paragbhasin/kalpx/core/migrations/0133_decontaminate_cross_room_rows.py`
- `/Users/paragbhasin/kalpx/core/migrations/0134_expand_clarity_principle_pool.py`
- `/Users/paragbhasin/kalpx/core/migrations/0135_seed_dark_tradition_principles.py`
