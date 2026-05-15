# Room × Life-Context Human Review Pack

**Generated:** 2026-04-21 (post-fix — migrations 0146 + 0147 applied)  
**Purpose:** Blinded side-by-side review of actual rendered content per context, with fit scoring and written judgment.  
**Item text sourced from:** WisdomAsset (core_teaching + plain_english) fields queried live from dev DB.

---

## How to Read This Pack

Each section presents renders from different contexts (blinded), then reveals context and scores fit.  
Scores are 1–5 on two dimensions:
- **Context fit (1–5):** Does this feel right for someone in that life situation?
- **Room fit (1–5):** Does this feel like it belongs in this room's register and purpose?

---

## SECTION 1: room_clarity — Teaching Chip (Post-Fix)

### Pair A (blinded)

**Sample 1:**  
> "Before arguing with the mind, notice what it is doing. Is it spinning, projecting, rehearsing, fearing, grasping?"

**Sample 2:**  
> "When you are heated, your conclusions are usually too sharp. Delay the big interpretation until the fire comes down."

**Reveal: Sample 1 = work_career | Sample 2 = relationships**  
Context fit: 4/5 (work), 5/5 (rel) | Room fit: 5/5, 5/5

---

### Pair B — NEW: health_energy (post-fix)

**Sample 1:**  
> "Āyurveda names prajñāparādha: the intellect's error when it overrides the body's clear signal. Health clarity is distinguishing what the body actually signals from what the mind narrates about it."

**Sample 2:**  
> "The body is the first discrimination field. What builds versus what depletes, what nourishes versus what numbs — viveka applied here is the root of health clarity."

**Reveal: Sample 1 = `clr_he_body_clarity_prajna_aparadha` | Sample 2 = `clr_he_body_as_discrimination_field`**  
Context fit: 5/5, 5/5 | Room fit: 5/5, 5/5  
**Assessment:** Both items are properly in the clarity register — they are about discrimination (viveka) applied to a domain, not support or regulation. The prajñāparādha framing is sharp and tradition-accurate. The viveka/discrimination-field framing is canonical YS. Both pass the clarity quality bar.

---

### Pair C — NEW: purpose_direction (post-fix)

**Sample 1:**  
> "The Gītā's sharpest directional teaching: better to do your own dharma imperfectly than another's perfectly. Most directional confusion is not lack of information — it is not yet knowing whose voice is guiding you."

**Sample 2:**  
> "You cannot see your direction clearly when you are looking through someone else's eyes. The Upanishadic inquiry tradition: prior to choosing, clarify who is choosing."

**Reveal: Sample 1 = `clr_pd_svadharma_vs_paradharma_clarity` | Sample 2 = `clr_pd_inquiry_before_direction`**  
Context fit: 5/5, 5/5 | Room fit: 5/5, 5/5  
**Assessment:** Both address the correct question for the purpose_direction context. "Whose voice is guiding you?" is exactly the clarity-room question when direction is the domain. Not growth (not about cultivation), not release (not somatic). Sharp discriminative clarity in the tradition's strongest directional teaching.

---

### Pair D — NEW: daily_life (post-fix)

**Sample 1:**  
> "Most distortion happens in ordinary moments. Clarity practice is noticing the vritti — the mental movement — as it arises in the texture of the day, not only in crisis."

**Sample 2:**  
> "'Your right is to action alone, never to its fruits.' Applied daily: do the action clearly, release the fruit, return to the present action. Most daily confusion is attachment of meaning to outcomes."

**Reveal: Sample 1 = `clr_dl_vritti_in_ordinary_moments` | Sample 2 = `clr_dl_nishkama_karma_as_daily_clarity`**  
Context fit: 5/5, 5/5 | Room fit: 5/5, 5/5  
**Assessment:** Both correctly locate clarity in the daily-life register. The vritti framing is perfect — it demystifies YS by pointing at daily texture. The nishkāma karma framing is an excellent clarity teaching (not a motivation teaching) — it identifies attachment to outcomes as the source of daily confusion. Neither is generic support.

---

## SECTION 2: room_growth — Wisdom Banner (Post-Fix)

### Pair A — work_career vs health_energy (pre/post comparison)

**Pre-fix health_energy (FAIL):**  
> "Carry only the duty that is yours." *(relationships/work_career item returned as fallback)*

**Post-fix health_energy (PASS):**  
> "Āyurveda: ojas is the vital essence underlying all other capacities. Building ojas is building the capacity to grow in every domain. Physical vitality is not a reward for growth — it is its precondition."

**Assessment:** Pre-fix item (`dharma_carry_only_the_duty_that_is_yours`) is a duty/discernment item from the relationships/work_career register — wrong context. Post-fix item (`grw_he_ojas_as_growth_foundation`) is correctly in the growth register: cultivation, becoming, building capacity. The distinction is clear. The ojas teaching connects physical vitality to all other growth — it does not feel like Ayurveda's clinical register, it feels like growth room's growth register.

---

## SECTION 3: room_connection — Wisdom Banner (Post-Fix)

### Pair A — work_career (pre/post comparison)

**Pre-fix work_career (FAIL):**  
> "Eat before pressure." *(Ayurveda body prep tip)*

**Post-fix work_career (PASS):**  
> "You can be very busy and completely alone. High performance is not the same as belonging. One act of genuine recognition — not efficiency, not output — is the entry point."

**Assessment:** Pre-fix item was a body preparation tip — not spiritually wrong but a category miss for someone entering the connection room from a work context. Post-fix item (`conn_wc_busyness_is_not_belonging`) is directly about professional loneliness and belonging at work — exactly the connection room's register applied to the work context. Dharma/sambandha framing (relational duty) gives it tradition grounding.

### Pair B — relationships vs work_career (post-fix)

**relationships:**  
> "Eat before pressure." *(ayur_eat_before_hard_conversation)*

**work_career:**  
> "You can be very busy and completely alone." *(conn_wc_busyness_is_not_belonging)*

**Assessment:** Items are now meaningfully different across contexts. The relationships item (body preparation before a difficult personal conversation) is appropriate and tradition-grounded. The work_career item addresses professional belonging. The room now surfaces different teaching registers for these two contexts.

---

## SECTION 4: room_release — Regression Verification

### work_career / relationships / health_energy (verified no regression)

| Context | Item | Fit Score |
|---------|------|-----------|
| work_career | `ayur_pause_before_decision_when_agitated` | 5/5 context, 5/5 room |
| relationships | `ayur_cool_after_conflict` | 5/5 context, 5/5 room |
| health_energy | `ayur_abhyanga_for_overwhelm` | 5/5 context, 4/5 room |

Room_release passes all regression checks. No impact from 0146/0147.

---

## Content Quality Summary

| Room | Context | Item | Quality Assessment |
|------|---------|------|-------------------|
| clarity | health_energy | `clr_he_body_as_discrimination_field` | Authentic YS viveka teaching applied to body — passes clarity quality bar |
| clarity | health_energy | `clr_he_body_clarity_prajna_aparadha` | Āyurveda prajñāparādha — sharp, accurate, not generic |
| clarity | purpose_direction | `clr_pd_inquiry_before_direction` | Upanishadic ātma-vichāra — prior inquiry before direction — correct register |
| clarity | purpose_direction | `clr_pd_svadharma_vs_paradharma_clarity` | Gītā 3.35 — canonical directional teaching, not motivational |
| clarity | daily_life | `clr_dl_vritti_in_ordinary_moments` | YS vritti applied to daily texture — practical, accurate |
| clarity | daily_life | `clr_dl_nishkama_karma_as_daily_clarity` | BG 2.47 as clarity teaching (outcome attachment → confusion) — correct framing |
| growth | health_energy | `grw_he_ojas_as_growth_foundation` | Āyurveda ojas as cultivation ground — growth register, not clinical |
| growth | health_energy | `grw_he_prana_as_cultivation_ground` | Yoga prāṇa as discipline ground — growth register, not regulation |
| connection | work_career | `conn_wc_busyness_is_not_belonging` | Dharma/sambandha on professional loneliness — connection register, not clarity |
| connection | work_career | `conn_wc_trust_built_in_small_acts` | Nīti on trust accrual — practically grounded, connection-appropriate |
| connection | work_career | `conn_wc_seva_as_professional_presence` | Bhakti seva as full presence — authentic register extension |

**No item authored to pad numbers.** All new items have specific tradition sourcing, specific context address, and are distinguishable from adjacent room registers (clarity, growth, release).
