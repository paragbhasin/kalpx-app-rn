# Path Intent Exclusion Matrix — v2.0 (Path-Sensitive)

**Status:** LOCKED 2026-04-16. Founder-approved.
**Version:** 2.0 (supersedes v1 single-tier deny-list)
**Source of truth:** `core/content/triad/path_intent.py::_INTENT_EXCLUSIONS`
**Test lock:** `core/content/tests/test_path_sensitive_deny.py` (22 tests)

---

## Design

v1 applied identical hard blocks to both support and growth lanes.
v2 splits them: support gets strong defensive filtering; growth gets
lighter coherence guidance. Protect support users from emotionally
wrong content without suffocating growth users into bland triads.

Three tiers per intent:

| Tier | Effect | Where applied |
|---|---|---|
| **blocked (support)** | Hard reject — item never served | triad selector coherence walk + mitra_selection safety gate |
| **blocked (growth)** | Hard reject — smaller set, only clear contradictions | triad selector coherence walk only |
| **discouraged** | Score penalty (not rejection); de-ranks but strong signal match can override | triad scorer (DISCOURAGED_PENALTY=2) + support scorer (DISCOURAGED_PENALTY_SUPPORT=0.15) |

Default lane is `"support"` for safety. Growth lane requires explicit `lane="growth"` from the caller.

---

## The Matrix

### return (stabilize_and_return)

| Tier | Tags | ID patterns |
|---|---|---|
| **blocked_support** | bhakti, offering, anahata, forgiveness, heart_opening, reflective_journaling, analysis_heavy, energizing, forgiveness_first | forgive_, compassion_, anahata_, journal_ |
| **blocked_growth** | energizing, performance | *(none)* |
| **discouraged** | heart_opening, forgiveness_first, bhakti, analysis_heavy | — |

**Spot-check:** growth-return top-5 mantras are grounding/containment (Ganesha, Durga Moola). No heart_opening slipped through. Energizing correctly blocked even on growth.

### settle (settle_and_steady)

| Tier | Tags | ID patterns |
|---|---|---|
| **blocked_support** | energizing, activating, performance, analysis_heavy | power_, activate_ |
| **blocked_growth** | activating | *(none)* |
| **discouraged** | energizing, performance | — |

### clarify (clarify_and_discern)

| Tier | Tags | ID patterns |
|---|---|---|
| **blocked_support** | sedating_only, pure_soothing_only, heart_melting_only | sleep_, soothe_ |
| **blocked_growth** | *(nothing)* — growth clarify should not fear soothing | *(none)* |
| **discouraged** | sedating_only | — |

**Spot-check:** growth-clarify top-5 are contemplative/discernment-heavy (Gayatri, Brihaspati, Dattatreya, Durga Suktam). No sleepy/passive content in top-5.

### restore (restore_and_ground)

| Tier | Tags | ID patterns |
|---|---|---|
| **blocked_support** | energizing, intellect_heavy, forgiveness_first | analyze_, debate_ |
| **blocked_growth** | energizing | *(none)* |
| **discouraged** | intellect_heavy, performance | — |

### hold (hold_and_soften)

| Tier | Tags | ID patterns |
|---|---|---|
| **blocked_support** | performance, decision_pressure, energizing, activating, resolution_pushing, urgent_action | decide_, push_ |
| **blocked_growth** | activating, urgent_action | *(none)* |
| **discouraged** | performance, decision_pressure | — |

**Spot-check:** support-hold top-5 mantras are devotional/contemplative (Kali Om Krim, Maha Mrityunjaya). All energizing items blocked. No resolution-pushing leaked.

### soften (hold_and_soften)

Same as hold (composite rule — shared exclusion set).

### deepen (abide_and_deepen)

| Tier | Tags | ID patterns |
|---|---|---|
| **blocked_support** | problem_solving, urgent_action, performance | fix_, solve_, hustle_ |
| **blocked_growth** | *(nothing)* — devotional, reflective, heart-opening are CORE to deepening | *(none)* |
| **discouraged** | urgent_action | — |

### abide (abide_and_deepen)

Same as deepen (composite rule). Stillness / bhakti / gentle heart-opening are explicitly allowed on both lanes.

### steady (orient_and_steady)

| Tier | Tags | ID patterns |
|---|---|---|
| **blocked_support** | *(empty)* | *(empty)* |
| **blocked_growth** | *(empty)* | *(empty)* |
| **discouraged** | *(empty)* | — |

Most lenient intent on both lanes. Orientation default.

---

## Spot-check results (2026-04-16, against 550-item catalog)

| Scenario | Lane | Type | Top-5 quality | Risks |
|---|---|---|---|---|
| growth clarify | growth | mantra | contemplative + discernment | ✅ none |
| growth clarify | growth | practice | contemplative + discernment | ✅ none |
| growth return | growth | mantra | grounding + containment | ✅ none |
| growth return | growth | sankalp | steady + grounding | ✅ one `decision_pressure` item but semantically grounding |
| support hold | support | mantra | devotional + contemplative | ✅ all energizing blocked |
| support soften | support | sankalp | releasing + softening | ✅ all decision_pressure blocked |

---

## Change protocol

Any change to this matrix requires:

1. Update `_INTENT_EXCLUSIONS` in `core/content/triad/path_intent.py`
2. Update `test_path_sensitive_deny.py` with new assertions
3. Run spot-check script (the one that produced the results above) to verify no over-filtering or leakage
4. Update this document with the new matrix + spot-check results
5. Founder sign-off before merging

The `_INTENT_DENY_LIST` back-compat alias auto-derives from `_INTENT_EXCLUSIONS` — no separate maintenance.

---

## Version history

| Version | Date | Change |
|---|---|---|
| v1.0 | 2026-04-16 | Single-tier deny-list (same blocks for support + growth) |
| v2.0 | 2026-04-16 | Path-sensitive: support strong / growth light. Added discouraged tier. |

---

**Contract end.** Frozen by 22 tests + 6 spot-check scenarios + founder approval.
