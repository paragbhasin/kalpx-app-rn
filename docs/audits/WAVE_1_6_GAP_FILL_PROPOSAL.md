# Wave 1.6 — path_intent gap-fill proposal

**Status:** DRAFT proposal (read-only audit). No code / CSV edits made.
**Scope:** retag existing items + identify new-content needs to close the
three zero-coverage path_intent cells (`hold`, `return`, `steady`) across
550 auto-tagged library items.
**Baseline coverage (pre-fill):** hold = 0 / 0 / 1, return = 0 / 3 / 0, steady = 0 / 0 / 0
(mantras / sankalps / practices).
**Reference:** `/Users/paragbhasin/kalpx/core/content/triad/path_intent.py`
(deny-list `_INTENT_DENY_LIST`, derivation tables, rupture override).

---

## 1. Policy matrix (allowed / discouraged / blocked per intent)

### 1.1 `return` — stabilize_and_return (rupture / asmita)

| Layer | Content profile |
|---|---|
| **Allowed** | grounding, breath-anchor, self-return, pause, non-reactivity, witness, sovereign steadiness, containment, slowing |
| **Discouraged** | heavy analysis, problem-solving, externally-directed action, outcome-framing |
| **Blocked** (deny-list) | `bhakti`, `offering`, `anahata`, `forgiveness`, `heart_opening`, `reflective_journaling`, `analysis_heavy`, `energizing`, `forgiveness_first` ; id prefixes `forgive_*`, `compassion_*`, `anahata_*`, `journal_*` |

Rationale: a user in fresh rupture must stabilize BEFORE the heart can safely
open. Heart-opening / forgiveness / bhakti tones risk premature catharsis.

### 1.2 `hold` — hold_and_soften (grief / abhinivesha / fear-clinging)

| Layer | Content profile |
|---|---|
| **Allowed** | gentle presence, containment, compassion without pressure, low burden, soothing, honoring, slow-tempo, witness |
| **Discouraged** | productivity, decision-heavy content, target-setting, rhythm-demand |
| **Blocked** (deny-list) | `performance`, `decision_pressure`, `energizing` ; id prefixes `decide_*`, `push_*` |

Rationale: a user in grief / fear-of-loss must be held, not moved. Any
"decide / push / do" framing destabilizes the hold.

### 1.3 `steady` — orient_and_steady (default / orientation-seeking)

| Layer | Content profile |
|---|---|
| **Allowed** | rhythm, consistency, repeatable cadence, moderate burden, dhriti (perseverance), daily anchoring, sustainable pace |
| **Discouraged** | dramatic emotional shifts, single-dose novelty, crisis framing |
| **Blocked** (deny-list) | *(empty — `steady` is intentionally permissive as the default fallback)* |

Rationale: `steady` is the orientation intent — it should succeed broadly.
Deny-list kept empty per founder design. Tagging selectivity comes from
`allowed` candidates being repeatable / low-drama.

---

## 2. Retag candidates — `return`

Deny-list vetted (energizing / heart_opening / reflective_journaling /
bhakti / anahata / forgiveness / forgiveness_first / id prefix `forgive_|compassion_|anahata_|journal_`).

### 2.1 Practices (primary return bucket)

| item_id | current path_intent_tags | proposed | conf | reason |
|---|---|---|---|---|
| practice.four_four_six | restore\|soften\|settle | **+return** (secondary) | high | 4-4-6 breath is a textbook return-to-self anchor; no deny-list tone |
| practice.sakshi_breath | deepen\|abide\|settle | **+return** (primary) | high | witness breath — exact "return to self" archetype; intervention_tags include `witness` |
| practice.soham_breath | deepen\|abide\|settle | **+return** (primary) | high | So-Ham anchors identity back to witness; `witness` intervention |
| practice.shanti_breath_cycle | settle\|soften | **+return** (secondary) | high | calm\|quiet_presence, slowing breath — non-reactive anchor |
| practice.slow_sipping_breath | settle\|soften | **+return** (secondary) | high | sip breath is classic self-regulation return |
| practice.belly_breathing | settle\|soften | **+return** (secondary) | high | diaphragmatic return anchor, peacecalm |
| practice.grounding_palm_press | settle\|soften | **+return** (primary) | high | grounding body anchor — direct "come back to body" |
| practice.bhramari | restore\|settle | **+return** (secondary) | high | humming breath — vagal-settling return |
| practice.abdominal_breathing | restore\|settle | **+return** (secondary) | high | same family as belly breathing |
| practice.chandrabhedana | restore\|settle | **+return** (secondary) | medium | cooling breath — return via nervous-system down-shift |
| practice.prithvi_mudra | restore\|settle | **+return** (secondary) | high | grounding mudra, body-anchor; tone_tag includes `grounding` |
| practice.atma_smaran | deepen\|abide\|settle\|clarify | **+return** (primary) | high | literally "self-remembrance" — canonical return moment |
| practice.self_acceptance_pause | restore\|soften | **+return** (primary) | high | pause + self — asmita recovery archetype |
| practice.vighna_vinash_pause | clarify\|deepen | **+return** (secondary) | medium | pause + containment; safe for rupture |
| practice.focus.breath_20 | clarify\|deepen\|settle | **+return** (secondary) | medium | 20-count breath; `energizing` tone is concerning but paired with `steady\|grounding` — flag for founder review |
| practice.focus.prana_lift | clarify\|deepen\|settle | *reject* | — | `energizing` tone dominant; not return-safe |
| practice.focus.ten_second_pause | clarify\|deepen\|settle | *reject* | — | contains `energizing` tone → deny-list hit |
| practice.focus.agni_breath | clarify\|deepen\|settle | *reject* | — | Agni/energizing → wrong valence for return |
| practice.heart_breath_release | restore\|soften\|settle | *reject* | — | `heart_opening` tone → deny-list hit (explicit) |
| practice.morning_breath | abide\|settle | *reject* | — | `devotional` tone + gratitude framing; not rupture-appropriate |
| practice.prithvi_walk | abide\|settle | *reject* | — | walking + `offering`/`bhakti` interventions → deny-list hit |

**Practices return total:** 14 retags (11 high-conf, 3 medium-conf).

### 2.2 Sankalps (currently 3 — boost to 8-10)

| item_id | current | proposed | conf | reason |
|---|---|---|---|---|
| sankalp.health_breath_healing | restore\|settle | **+return** (secondary) | high | "healing breath" today — return-to-breath framing; no deny tone |
| pause_before_react | deepen\|abide | **+return** (primary) | high | literal non-reactivity pause — exact return archetype |
| sankalp.safety_from_within | restore\|soften | **+return** (primary) | high | "create safety within myself" — sovereign self-return |
| accept_self | deepen\|abide | **+return** (secondary) | medium | self-acceptance; asmita recovery |
| sankalp.choose_self_worth | restore\|soften | *reject* | — | `decision_pressure` tone — too active for rupture |
| sankalp.gentleness_self | settle\|soften | *reject* | — | `decision_pressure` tone → not return-safe |
| sankalp.give_grace | restore\|soften | *reject* | — | grace-to-others reads as forgiveness-adjacent; out per policy |
| sankalp.health_slow_down | restore\|settle | **+return** (secondary) | medium | slowing is return-adjacent; flag for tone review |

**Sankalps return total:** 5 retags. (Existing 3 + 5 = **8**; meets ≥3-per-cell with margin.)

### 2.3 Mantras (currently 0 — critical gap)

All high-signal title/id matches are either devotional mantras (tone=`devotional`,
intervention=`bhakti`/`offering`) or prosperity mantras (wrong valence). **Mantra axis
has NO retag-safe candidates** for `return`. See §6 for new-content proposal.

Candidates checked and rejected:
- `mantra.om_ham_shivaya` / `mantra.shiva_mahamrityunjaya` — devotional tone; `bhakti` intervention (deny-list hit)
- `mantra.kali_om_krim` — devotional/abide; `bhakti`-adjacent; founder said Kali = hold, not return
- Career-prosperity grounding mantras — wrong functional domain for rupture

**Mantras return total:** 0 retags.

---

## 3. Retag candidates — `hold`

Deny-list vetted (performance / decision_pressure / energizing / decide_ / push_).

### 3.1 Sankalps (currently 0)

| item_id | current | proposed | conf | reason |
|---|---|---|---|---|
| sankalp.devi_holds_my_heart | restore\|soften | **+hold** (primary) | high | "held by the Divine Mother" — exact hold archetype |
| sankalp.health_sacred_rest | restore\|settle | **+hold** (primary) | high | rest as honoring — grief-safe |
| sankalp.health_slow_down | restore\|settle | **+hold** (primary) | high | allowing slowness — non-forcing; no decision framing |
| sankalp.permission_to_rest | settle\|soften\|restore | **+hold** (primary) | high | permission without pressure — canonical hold |
| sankalp.release_what_i_cannot_hold | settle\|soften | **+hold** (secondary) | high | containment of what can't be held — grief bearing |
| sankalp.rest_in_present | settle\|soften\|restore | **+hold** (secondary) | high | resting mind in present — low-burden |
| sankalp.slow_down_heart | settle\|soften | **+hold** (primary) | high | letting heart slow — pure hold; `heart_opening` tone is fine (NOT in hold deny-list) |
| sankalp.honor_my_boundaries | restore\|soften | **+hold** (secondary) | medium | honoring framing; no deny tone |
| sankalp.health_body_temple | restore\|settle | **+hold** (secondary) | medium | honoring body — soft framing |
| sankalp.gentleness_self | settle\|soften | *reject* | — | `decision_pressure` tone → deny-list hit |
| sankalp.honor_my_skill | clarify\|deepen | *reject* | — | career skill framing; too active for grief |

**Sankalps hold total:** 9 retags (7 high-conf, 2 medium-conf).

### 3.2 Mantras (currently 0)

| item_id | current | proposed | conf | reason |
|---|---|---|---|---|
| mantra.narasimha_full | restore\|soften | **+hold** (primary) | high | Narasimha Karunamaya — "compassionate lion" — canonical fear-holder; `containment` intervention |
| mantra.kali_om_krim | deepen\|abide | **+hold** (primary) | high | founder-aligned: Maa Kali traditionally holds with difficulty; `containment` intervention |
| mantra.karpura_gauram | deepen\|abide | **+hold** (secondary) | high | karuna-avataram (compassion embodiment); `gentle\|honoring` tone |
| mantra.health_aditya_hridayam | restore\|settle | *reject* | — | `energizing` tone → deny-list hit |

**Mantras hold total:** 3 retags.

### 3.3 Practices (currently 1 — `santosha_reflection`)

| item_id | current | proposed | conf | reason |
|---|---|---|---|---|
| practice.head_bow_release | restore\|soften\|abide | **+hold** (primary) | high | slow head-bow — somatic hold with honoring |
| daya_practice | restore\|soften | **+hold** (primary) | high | daya/compassion practice — no pressure framing |
| practice.slow_sipping_breath | settle\|soften | **+hold** (secondary) | high | slow sip — bearing-with pace |
| practice.bhramari | restore\|settle | **+hold** (secondary) | medium | humming/vagal calm — can accompany grief |
| practice.self_acceptance_pause | restore\|soften | **+hold** (secondary) | medium | self-acceptance with pause |

**Practices hold total:** 5 retags. (Existing 1 + 5 = **6**.)

---

## 4. Retag candidates — `steady`

No deny-list; gate is quality (repeatable, low-drama, sustainable cadence).

### 4.1 Mantras (currently 0)

| item_id | current | proposed | conf | reason |
|---|---|---|---|---|
| shloka_reflection_daily | abide\|deepen\|clarify | **+steady** (primary) | high | daily shloka — canonical steady cadence |

Few other mantras are well-framed for `steady` — most are event-specific
(festival / deity-specific) rather than daily-rhythm. See §6 for new items.

**Mantras steady total:** 1 retag.

### 4.2 Sankalps (currently 0)

| item_id | current | proposed | conf | reason |
|---|---|---|---|---|
| sankalp.move_with_dhriti | clarify\|deepen | **+steady** (primary) | high | dhriti = perseverance; exact steady archetype |
| sankalp.health_seasonal_rhythm | restore\|settle | **+steady** (primary) | high | seasonal rhythm awareness — cadence framing |
| learn_daily | deepen\|abide | **+steady** (secondary) | high | daily learning cadence — sustainable |
| sankalp.focus.mental_strength | clarify\|deepen | **+steady** (secondary) | medium | "grows daily" framing; `energizing` tone is OK (no steady deny-list) but confirm with founder |

**Sankalps steady total:** 4 retags.

### 4.3 Practices (currently 0)

| item_id | current | proposed | conf | reason |
|---|---|---|---|---|
| practice.dhriti_expansion | clarify\|deepen | **+steady** (primary) | high | explicit dhriti + `rhythm` intervention |
| practice.simple_yoga_flow | restore\|settle | **+steady** (primary) | high | "simple daily yoga flow" — core daily cadence |
| practice.brahmacharya_moderation | restore\|settle | **+steady** (primary) | high | daily moderation — steady discipline |
| karma_yoga_daily_life | abide\|deepen | **+steady** (primary) | high | daily karma yoga — most explicit steady framing |
| svadhyaya_daily | abide\|deepen | **+steady** (primary) | high | daily self-study cadence |
| ramayana_read | abide\|deepen | **+steady** (secondary) | high | daily verses — repeatable rhythm |
| daily_inspiring_quote | abide\|deepen | **+steady** (secondary) | high | daily quote — sustainable touchpoint |
| ganesha_puja_daily | abide\|deepen | **+steady** (secondary) | medium | daily puja; devotional but repeatable |
| nitya_agnihotram_simplified | abide\|deepen | **+steady** (secondary) | medium | "nitya" = daily homa — exact steady ritual |
| practice.sattvic_workspace_reset | clarify\|deepen | **+steady** (secondary) | medium | workspace reset pace — daily cadence |
| practice.inspiring_quote | abide\|clarify | **+steady** (secondary) | medium | daily inspiration pause |
| shloka_reflection_daily | clarify\|deepen | **+steady** (primary) | high | mirror of mantra version, practices axis |

**Practices steady total:** 12 retags.

---

## 5. Deny-list cross-check

Verified against `_INTENT_DENY_LIST` in
`/Users/paragbhasin/kalpx/core/content/triad/path_intent.py` (lines 329-363):

| Intent | Policy "blocked" column matches code? |
|---|---|
| return | MATCH — `bhakti\|offering\|anahata\|forgiveness\|heart_opening\|reflective_journaling\|analysis_heavy\|energizing\|forgiveness_first` + `forgive_\|compassion_\|anahata_\|journal_` |
| hold | MATCH — `performance\|decision_pressure\|energizing` + `decide_\|push_` (shared `_HOLD_SOFTEN_DENY`) |
| steady | MATCH — empty `tone_tags` + empty `id_prefixes` (intentionally permissive) |

**No misalignments flagged.** Proposed retags were all pre-filtered against
`item_violates_deny_list`-equivalent logic (tone_tags + intervention_tags +
item_id substring check).

Two explicit rejections caught by the cross-check:
- `practice.focus.ten_second_pause` → `energizing` tone blocks `return`.
- `sankalp.gentleness_self` → `decision_pressure` tone blocks `hold`.

---

## 6. New-content needs

After maximum retagging, per-cell coverage projected:

| Cell | Pre-fill | Retags added | Post-fill | ≥3 met? |
|---|---|---|---|---|
| return × mantra | 0 | 0 | **0** | NO |
| return × sankalp | 3 | 5 | 8 | YES |
| return × practice | 0 | 14 | 14 | YES |
| hold × mantra | 0 | 3 | 3 | YES (minimum) |
| hold × sankalp | 0 | 9 | 9 | YES |
| hold × practice | 1 | 5 | 6 | YES |
| steady × mantra | 0 | 1 | **1** | NO |
| steady × sankalp | 0 | 4 | 4 | YES |
| steady × practice | 0 | 12 | 12 | YES |

Two cells still short after retag: **return × mantra (0)**, **steady × mantra (1)**.

### 6.1 Cell: `return × mantra` (need ≥3 authored)

**Gap:** No existing mantra is tone-safe for `return` (all are devotional / bhakti /
festival / prosperity — deny-list hits). Founder directive: a ruptured user needs
*sonic grounding*, not devotion.

Proposed authored items:

1. **`mantra.bhur_bhuvah_svah_gayatri_anchor`** — *Bhūr Bhuvaḥ Svaḥ* (first three vyahritis of Gayatri)
   - Type: mantra (bija/utterance cycle)
   - Copy direction: "earth, atmosphere, heavens" triple-anchor — literally returns awareness to three planes of being; no deity-devotional framing, pure sound-as-ground.
   - Deity: Universal (Savitur implicit, not invoked-as-love)
   - Target duration: 3 min (9 cycles of 3)
   - tone_tags: `grounding\|steady\|quiet_presence`; intervention_tags: `sound\|containment`
   - path_intent_tags: `return\|settle`

2. **`mantra.so_ham_anchor`** — *So Ham* (ajapa / involuntary-breath mantra)
   - Type: mantra
   - Copy direction: the natural sound of the breath — "So" on in-breath, "Ham" on out-breath. Classic self-remembrance (atma-smaran) without bhakti framing.
   - Deity: none (self-identifying)
   - Target duration: 5 min
   - tone_tags: `quiet_presence\|grounding\|contemplative`; intervention_tags: `sound\|breath\|witness`
   - path_intent_tags: `return\|deepen`

3. **`mantra.hamsa_witness`** — *Haṁsa* (the reverse — outgoing-breath-first)
   - Type: mantra
   - Copy direction: the witness within the breath. Ruptured users often need the active voice ("I AM, observing") more than the receptive voice.
   - Deity: none
   - Target duration: 3 min
   - tone_tags: `quiet_presence\|steady`; intervention_tags: `sound\|witness`
   - path_intent_tags: `return\|abide`

### 6.2 Cell: `steady × mantra` (need ≥2 more authored)

**Gap:** Only `shloka_reflection_daily` fits a daily rhythm framing. Library
is heavy on event-specific mantras; needs generic daily-cadence entries.

Proposed authored items:

1. **`mantra.om_108_daily`** — *Om* × 108 (mala cycle)
   - Type: mantra
   - Copy direction: the most universal daily cadence — one mala of Om. Establishes rhythm without deity-specificity.
   - Deity: Universal
   - Target duration: 10-12 min (one full mala)
   - tone_tags: `steady\|grounding\|devotional`; intervention_tags: `sound\|rhythm`
   - path_intent_tags: `steady\|deepen`

2. **`mantra.gayatri_daily_short`** — *Gayatri* (one round, daily sandhya cadence)
   - Type: mantra
   - Copy direction: "each dawn / noon / dusk, one round." Anchors day to a three-beat rhythm. Sustainable for a beginner.
   - Deity: Savitur
   - Target duration: 2 min (one round)
   - tone_tags: `steady\|devotional`; intervention_tags: `sound\|rhythm`
   - path_intent_tags: `steady\|abide`

3. *(stretch)* **`mantra.swasti_vachana_daily`** — *Swasti Vachanam* (daily well-being utterance)
   - Type: mantra
   - Copy direction: Vedic "let there be well-being" — short, repeatable, non-dramatic. Exact steady-state benediction.
   - Deity: Universal
   - Target duration: 2 min
   - tone_tags: `steady\|devotional\|gentle`; intervention_tags: `sound\|rhythm`
   - path_intent_tags: `steady\|restore`

---

## 7. Summary

- **Total retags proposed:** **53**
  - return: 14 practices + 5 sankalps + 0 mantras = 19
  - hold: 5 practices + 9 sankalps + 3 mantras = 17
  - steady: 12 practices + 4 sankalps + 1 mantra = 17
- **Candidates explicitly rejected (deny-list or tone mismatch):** 8
- **New content items needed:** **5-6**
  - 3 new `return × mantra` (bhur-bhuvah, so-ham, hamsa)
  - 2-3 new `steady × mantra` (om-108-daily, gayatri-daily-short, optional swasti-vachana)
- **Intents that can be fully satisfied via retag only:** `hold` (all 3 types reach ≥3), `steady` sankalps + practices
- **Intents requiring new content:** `return × mantra`, `steady × mantra`
- **Deny-list alignment:** confirmed match with `_INTENT_DENY_LIST`; no code changes required.

**Post-fill projected coverage:**

| Cell | mantras | sankalps | practices |
|---|---|---|---|
| return | 0 → 3 (new) | 3 → 8 | 0 → 14 |
| hold | 0 → 3 | 0 → 9 | 1 → 6 |
| steady | 0 → 3-4 (1 retag + 2-3 new) | 0 → 4 | 0 → 12 |

All nine (intent × type) cells reach ≥3 post-fill → triad scorer can award
the +2 path_intent match bonus to every future triad without falling back
to intent-contradictory picks.

---

## Appendix A — Candidates considered but rejected

| item_id | intent tested | reject reason |
|---|---|---|
| practice.focus.ten_second_pause | return | `energizing` tone_tag → return deny-list hit |
| practice.focus.agni_breath | return | `energizing` tone + Agni framing — wrong valence |
| practice.focus.prana_lift | return | `energizing` tone — activation, not return |
| practice.heart_breath_release | return | `heart_opening` tone → explicit return deny-list hit |
| practice.morning_breath | return | `devotional` + gratitude — not rupture-appropriate |
| practice.prithvi_walk | return | `offering\|bhakti` interventions → return deny-list hit |
| sankalp.choose_self_worth | return | `decision_pressure` tone — too active for rupture |
| sankalp.gentleness_self | return, hold | `decision_pressure` tone — hold deny-list hit; also too decisive for return |
| sankalp.give_grace | return | forgiveness-adjacent framing → return policy block |
| sankalp.honor_my_skill | hold | career-skill framing — too active for grief |
| mantra.health_aditya_hridayam | hold | `energizing` tone → hold deny-list hit |

---

## Appendix B — Items the main agent must verify before applying

1. Mantra axis of `return`: confirm the 3 new-content items are approved by
   founder before any placeholder retag of existing devotional mantras. The
   audit refuses to cross the bhakti deny-line.
2. `sankalp.focus.mental_strength` (+steady candidate, medium conf): has
   `energizing\|activating` tones. `steady` has no deny-list, but founder may
   prefer to reserve `steady` for low-activation content.
3. `sankalp.health_body_temple` + `sankalp.honor_my_boundaries` (+hold,
   medium conf): both are "honor"-framed rather than explicit grief-holding.
   Verify they're not better suited to `restore` only.
4. `practice.focus.breath_20` (+return, medium conf): `energizing` appears in
   its tone string but paired with `steady\|grounding`. Audit classed it as
   "flag for founder review" rather than reject.
