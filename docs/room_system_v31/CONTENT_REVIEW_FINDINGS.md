# Room System v3.1.1-wisdom — Content Review Findings (Agent D polish pass)

**Date:** 2026-04-20
**Reviewer:** Agent D (content authoring lead)
**Scope:** `docs/room_system_v31/pools/v31_pool_drafts.yaml` — every `wisdom_*` pool entry, every rotation_ref, every anchor_ref. Audited per §5.1–§5.6 room identity no-go rules + tradition bias + Chip Contract v1.1 tone directives.
**Method:**
1. Every wisdom asset_id in the drafts YAML was looked up in `core/data_seed/wisdom/passc_2026_04_18.csv`. **All referenced asset_ids resolve — zero missing rows.**
2. Hard CSV-field checks (tradition in AVOID list, `drill_down_only=yes`, `emotional_weight=heavy`, `standalone_safe=no`, `misuse_risk=high`) — **zero violations detected**.
3. Manual tonal read of every row's `short_label` + `direct_line_candidate` + `plain_english` against the room's "must NOT become" tone guardrail.

**Summary:** 1 MEDIUM drift, 4 LOW drift / spot-check items, 0 HIGH. All MEDIUM-severity items have real WisdomAsset.asset_id substitutes from passc; recommendations below.

---

## Severity scale

| Severity | Meaning | Action |
|---|---|---|
| **HIGH** | Row violates a §5.X forbidden rule or Chip Contract v1.1 "must NOT become" guardrail; will leak wrong tone into the room | Replace before any flip |
| **MEDIUM** | Row is tonally borderline for its room; reads subtly wrong (release/contain adjacent in a fullness room; witnessing-heavy in a companioned room) | Replace or demote to spot-check bucket before Phase 5 flip |
| **LOW** | Tradition metadata is outside room's bias list but row is tonally acceptable, OR row is already curator-flagged for spot-check | Keep with curator note; re-review at Phase 7 observability |

---

## Findings

### Finding 1 — MEDIUM — `room_joy.wisdom_banner` rotation: `sankhya_witness_joy_without_clinging`

**Drift detected.** Chip Contract v1.1 §Joy + §5.6 require "grounded fullness, not performative happiness" but the room must NOT become shallow positivity OR drift into release/containment. The row's short_label is "Witness the joy" and plain_english reads: *"Good feelings pass through. Watching them come and go keeps them from turning into something you have to defend."*

The framing is witness-consciousness applied to joy — which is **subtly release/non-clinging-adjacent**, not fullness-forward. A user entering room_joy in a "positive → expand" state being banner-fed "watch the good feeling pass" creates the exact collapse into release that §5.6 forbids (*no-go: contain · release*). This is a mood-management framing, not a celebration-grounded one.

**Recommended substitute:** `bhakti_sacred_in_the_ordinary`
- Short: "Sacred in the ordinary"
- Line: *"You do not need a special place to meet what is sacred. The morning tea, the walk, the ordinary face across the room — these are not lesser moments."*
- Tradition: `bhakti` (in joy's bias per §5.6)
- `emotional_weight=light`; `state_fit=devotional|reflective|grateful|balanced|remembering`
- Chip Contract v1.1 tone match: grounded fullness, non-performative.

**Rationale:** already in the `room_joy.wisdom_teaching` pool (currently deferred_v2). Promoting it to the active `wisdom_banner` rotation aligns the banner surface with joy's grounded-fullness posture and removes the witness-consciousness drift. `sankhya_witness_joy_without_clinging` stays authored in the row library (Bucket A cleanup) but rotates OUT of joy banners in v1.

**Agent B action:** update `0120_seed_room_pools_v1.py` room_joy.wisdom_banner `rotation_refs` — drop `sankhya_witness_joy_without_clinging`, add `bhakti_sacred_in_the_ordinary`. (Can land in this same branch or a follow-up.)

---

### Finding 2 — LOW — `room_connection.wisdom_banner` rotation: `sankhya_witness_as_friend`

**Drift note.** §5.2 connection AVOID includes `inquiry`. Row plain_english begins: *"Loneliness is a feeling you are having. The part of you noticing it is not lonely."* This is a witness-consciousness frame applied to loneliness — tonally very close to interpretive discernment, which §5.2 explicitly wants connection to NOT become ("companioned, not interpretive"). The `short_label` "The witness is with you" is safer than the plain_english, and the banner surface only reads the short line — so actual leak risk is low.

**Recommendation:** KEEP but add curator spot-check. If observational sampling during Phase 7 shows users report the banner as analytical/detached, substitute with another Bucket A connection-native row (e.g. a second bhakti row once curator authors one).

**Severity:** LOW. Banner surface shows short_label only; long-tail drift risk only if L3 enables (connection has NO L3 in v1, so no propagation risk).

---

### Finding 3 — LOW — `room_stillness.wisdom_banner` rotation: `gita_endure_the_passing_contacts`

**Drift note.** §5.1 tradition bias is `yoga_sutra | ayurveda | vedic`. This row is `tradition=gita`, which is outside the bias list but NOT in the AVOID list (`dharma_shastra | niti` are AVOID). Line reads: *"This is hard, but it is not forever."* — tonally regulate-compatible, non-prescriptive, witnessing stance, `emotional_weight=moderate`, `drill_down_only=no`.

**Recommendation:** KEEP. Tradition bias is a ranking signal, not a hard filter (per §5.1 no-go lists, only `dharma_shastra | niti | active-prescriptive | inquiry | teaching` are forbidden). The row is tonally fit. Marked MOVE-to-stillness in the cleanup YAML (Bucket A), consistent with this classification.

---

### Finding 4 — LOW — `room_connection.wisdom_banner` rotation: `dharma_community_as_seva`

**Tradition-metadata note.** Row's `tradition` field is `dharma`, not `seva_dana`. §5.2 allows light `seva_dana`; `dharma` is not in the bias list. The row's actual content is seva-framed (*"Do one small thing for one person today"*) — so the tone fits the small-relational-outward allowance. This is a tradition-classification inconsistency in the source library, not a pool-authoring error.

**Recommendation:** KEEP. Flag on the curator library side: the row should likely carry `tradition=seva_dana` or dual-tradition `[dharma, seva_dana]`. Does not block room_connection pool activation. Flag added here for the next WisdomAsset classification pass.

---

### Finding 5 — LOW — `room_clarity.wisdom_banner` rotation: `niti_prefer_stability_over_dramatic_reversal`

**Spot-check per cleanup.** §5.4 clarity tradition bias DOES include `niti`. The row's line is discernment-forward (*"Do not confuse dramatic response with effective change. Choose the correction you can actually sustain."*) and aligns with clarity's stance. However — the drafts YAML already flags this as Bucket B multi-room (release+clarity) and spot-check; note that niti rows in clarity must stay discernment-mode, not prescriptive-boundary (boundary-setting niti belongs in release).

**Recommendation:** KEEP. Matches §5.4 bias and is tonally discernment-forward, not boundary-prescriptive. Already enrolled in spot-check per cleanup §5.7.8 Bucket B. No action needed beyond continued sampling.

---

## Cross-cutting notes

### Dual-membership (sanctioned per §5.7.5 + §8)

- `yoga_sutras_one_anchor_when_scattered` → stillness.wisdom_banner + clarity.wisdom_banner. Curator note already present. State_fit `scattered/direction_confused` canonically spans regulate + align. **OK.**
- `practice.hand_on_heart` → stillness.practice + connection.practice. Curator note already present. §Contract 4 rule 4 doesn't apply (only joy/growth exclusion). **OK.**

### Cross-room exclusion (§Contract 4 rule 4) — joy/growth mantra+practice disjoint

Re-verified at this review:
- joy mantras ∩ growth mantras = ∅ **PASS**
- joy practice slot is vacuously disjoint (joy uses sankalp_* slots, not practice) **PASS**

### Rows explicitly filtered out during pool drafting (§`contamination_audit.rejected_rows`)

Spot-re-audit of the 30+ rejected rows confirms all are correctly excluded:
- 7 `wis.kindness_is_*` rows (uplift aphorisms + empty state_fit_tags) — §5.7.9 non_room_eligible.
- 25 ayurveda body-care rows — §5.7.9 non_room_eligible + founder D-2 decision.
- `vedanta_alone_is_not_lonely`, `yoga_loneliness_as_signal`, `atma_smaran_self_as_company` — drill_down_only=yes filtered from connection banner (§5.2 no-inquiry).
- `niyamas_kritajnata_as_perception` — drill_down_only=yes filtered from joy banner (§5.7.3 joy forbids drill_down).
- `gita_seva_as_final_limb` — mature/experienced state_fit filtered from default growth banner.
- `gita_no_effort_is_lost` — Bucket C dedup, blocked on founder D-1 rename decision.

No reclassifications recommended.

---

## Pool activation recommendations

| Room | Pool | Status in v1 | Notes |
|---|---|---|---|
| room_stillness | mantra, practice, wisdom_banner, step | Activate | Clean |
| room_connection | mantra, practice, wisdom_banner, step | Activate | Finding 2 spot-check; wisdom_teaching already deferred_v2 per Chip v1.1 |
| room_release | mantra, practice, wisdom_banner, step | Activate | Clean; 2-row banner per §5.7.3 sparse |
| room_clarity | mantra, practice, principle, wisdom_banner, wisdom_teaching, step | Activate | Finding 5 spot-check |
| room_growth | mantra, practice, principle, wisdom_banner, wisdom_teaching, wisdom_reflection, step | Activate | Clean |
| room_joy | mantra, sankalp_gratitude, sankalp_blessings, sankalp_seva, wisdom_banner, step | Activate **after Finding 1 swap** | wisdom_teaching already deferred_v2 per Chip v1.1 |

---

## Verification trail

- All 28 wisdom asset_ids cited in pools are present in `core/data_seed/wisdom/passc_2026_04_18.csv`.
- All 13 new step template_ids cited in the updated step-pool drafts match the migration 0121 seed.
- Chip Contract v1.1 §Signature chip rule: 6/6 rooms carry their signature chip via either a mantra anchor label or a step template (all verified in migration 0120 + 0121).

---

**End of content review — Agent D 2026-04-20**
