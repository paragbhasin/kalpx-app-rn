# Room × Life-Context Ship Recommendation

**Generated:** 2026-04-21 (post-fix — migrations 0146 + 0147 applied and verified)  
**Based on:** Live render verification post-migration, pool analysis, content quality review

---

## What Is Honest to Ship Now (Updated)

### Ship as fully context-responsive (claim it, surface differentiation in UX)

- **room_clarity × all 6 contexts** — All contexts now have pool matches. Work_career/relationships/money_security pass at high quality (pre-existing). Health_energy, purpose_direction, daily_life all pass with new content. Teaching chip differentiation is real.
- **room_growth × all 6 contexts** — All contexts have pool matches. The health_energy gap (previously failing) is now closed with two new Āyurveda/Yoga items in the growth register.
- **room_release × {relationships, work_career, health_energy}** — All 3 tested contexts pass. No regression from 0146/0147.

### Ship as lightly context-tinted (context varies item, same room register)

- **room_connection × {work_career, relationships, health_energy, purpose_direction, daily_life}** — 5/6 contexts now have pool matches. Work_career is fully fixed. Bhakti items now surface for purpose_direction and daily_life. Relationships and health_energy remain on ayur_eat_before_hard_conversation (correct context match, expected item).
- **room_connection × money_security** — No pool item tagged. Alphabetical fallback. See deferred section below.

### Ship as universal (do not claim context-responsiveness in UX)

- **room_joy** — Universal by design. Bhakti gratitude register is correct. Do not add context differentiation.
- **room_stillness** — Universal by design. Correct as-is. No change needed.

### Do not ship / require fix first

None. All previously failing contexts are now addressed or honestly documented as deferred.

---

## What Still Needs Work (Deferred)

### Deferred — room_connection / money_security

No pool item has money_security bias in the connection banner pool. Alphabetical fallback returns `ayur_eat_before_hard_conversation`. This was not in the fix scope for this sprint. A money_security connection item would address something like: the loneliness of financial stress, navigating conversations about money in relationships, the belonging cost of financial insecurity. Nīti / Dharma traditions have relevant content. Deferred to Wave 3 pool authoring.

### Known behavior — rotation within new contexts

For all newly added contexts, 20 renders with fresh UUIDs return the same item (the alphabetically-first context-matched item). This is architecturally correct: rotation within a context requires render history (Rule 1: +3 if not shown in last 3 renders). On repeat visits with the same user, items will rotate. The pool has 2 items per new clarity context, 2 items for growth/health_energy, and 3 items for connection/work_career.

### Observation — Gītā concentration in clarity teaching pool

Clarity teaching pool now has 4/12 items from Gītā (33%). The BG hard cap is enforced on the `principle` WisdomPrinciple pool, not on the `wisdom_teaching` WisdomAsset pool. No runtime guard fires. Curator should review whether a 33% Gītā concentration on the teaching surface is acceptable or whether one of the two Gītā teaching items (clr_pd_svadharma_vs_paradharma_clarity or clr_dl_nishkama_karma_as_daily_clarity) should be swapped for a non-Gītā tradition teaching.

---

## Seven Direct Questions (Updated)

### 1. Which rooms are truly context-responsive today?

All four tinted rooms are now context-responsive:
- **room_clarity** — for all 6 tested contexts
- **room_growth** — for all 6 tested contexts  
- **room_release** — for all 3 tested contexts
- **room_connection** — for 5/6 tested contexts (money_security deferred)

### 2. Which rooms are only weakly context-shaped?

- **room_joy** — Light tinting for relationships/daily_life. No match for work_career. Universal by design.
- **room_connection × money_security** — Alphabetical fallback. No context shaping.

### 3. Which rooms should remain universal?

- **room_stillness** — Universal by design and correctly so.
- **room_joy** — Register-led by design. Light tinting acceptable.

### 4. Are we differentiating on the correct surfaces?

Yes for all rooms. Teaching chip (clarity), wisdom banner (growth, connection, release) — correct surfaces. Mantra and practice remain universal. No surfaces were changed.

### 5. Is the current output spiritually coherent across contexts?

Yes, with one minor flag: the money_security context in connection still returns an Ayurveda body-preparation tip. This is not spiritually incoherent but is a context miss. All other room × context pairings are spiritually sound and tradition-appropriate.

### 6. Are users likely to actually feel the difference?

**For clarity (health_energy, purpose_direction, daily_life):** Yes — pre-fix, all three returned "Feeling broken is real..." (existential collapse framing). Post-fix, they receive viveka-applied-to-body, ātma-vichāra-before-direction, and vritti-in-ordinary-moments respectively. A user who enters clarity from a health concern now receives a teaching about the intellect's error in reading body signals — not a teaching about despair.

**For growth (health_energy):** Yes — pre-fix returned a duty/discernment item. Post-fix returns ojas as the ground of cultivation. Meaningfully different framing.

**For connection (work_career):** Yes — pre-fix returned "eat before pressure." Post-fix returns "you can be very busy and completely alone." The difference is obvious.

### 7. What remains as the highest-leverage open item?

**room_connection / money_security** — Single deferred gap. One new item with money_security bias in the connection banner pool would complete coverage for this context.

---

## Summary Shipping Decision (Post-Fix)

| Room | Ship As | Conditions |
|------|---------|-----------|
| room_clarity | Context-responsive (all 6 contexts) | Curator to review Gītā concentration (33%) in teaching pool |
| room_growth | Context-responsive (all 6 contexts) | No conditions |
| room_connection | Context-responsive (5/6 contexts) | money_security returns unrelated item — document in UX or add pool item in Wave 3 |
| room_release | Lightly context-tinted (3 contexts) | No changes needed |
| room_joy | Universal | No changes needed |
| room_stillness | Universal | No changes needed |

---

## Migration Manifest (What Was Applied)

| Migration | Applied | Effect |
|-----------|---------|--------|
| 0146_fix_connection_anchor_and_add_work_career_bias | 2026-04-21 | 3 new WisdomAsset rows (conn_wc_*), work_career bias added to dina/sankhya items, ayur constrained to relationships/health_energy, pool to 15 refs |
| 0147_seed_context_coverage_gaps | 2026-04-21 | 8 new WisdomAsset rows (6 clarity, 2 growth), 6 new clarity teaching pool refs, 2 new growth banner pool refs |
