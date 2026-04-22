# Room Balance and Integrity — Final
**Status:** Current as of 2026-04-21  
**Source:** WAVE2_POST_APPLY_REPORT §C, P1_FINAL_SYNTHESIS §Q2–Q5, locked architecture

---

## 1. Tradition spread by room

Based on runtime pool post-Wave 2 (migrations 0132–0143 applied):

| Room | Traditions present | Dominant family | Pool size (approx) |
|---|---|---|---|
| **Clarity** | Nīti, Sankhya, Yoga-Sūtras, BG, Dharma, Yamas, Ayurveda, Dinacharya | Nīti (~60%) | ~121 principle rows |
| **Growth** | Yamas, BG, Dharma, Yoga-Sūtras, Dinacharya, Ayurveda | Yamas (~32%), BG (~20%) | ~56 principle rows |
| **Connection** | Bhakti (undiff Vaiṣṇava + Gauḍīya/Ālvār/Sant pending), Yoga-Sūtras 1.33 (maitrī-karuṇā) | Bhakti | ~18 banner rows; small practice pool |
| **Release** | Ayurveda (practices), Shiva (mantra), Yamas (aparigraha), Vedanta-witness | Ayurveda | Small; 17 Ayurveda practices new |
| **Joy** | Bhakti (Vaiṣṇava base + Gauḍīya/Ālvār/Sant P1-B), Bhāgavata | Bhakti | 9 banner rows (post-P1-B) |
| **Stillness** | Vedanta-sākṣin, Yoga (om), sparse | Vedanta/om | 2 mantra entries (thin) |

---

## 2. Clarity — Nīti concentration

**Current Nīti share: ~60% of clarity principle pool (~72/121 rows).**

**Is this a problem right now?** Functionally acceptable with context routing active. work_career users (who most benefit from Nīti's pragmatic-discernment register) will encounter it preferentially. The issue is for contexts without many Nīti bias tags:
- health_energy users: few Nīti rows carry health_energy bias → receive mostly universal (unbiased) selection
- relationships users: Yoga-Sūtras YS 1.33 / BG Ch 12 are the correct tradition but are a minority in the pool

**Sankhya and Yoga-Sūtras presence:** Both are designated dominant traditions for clarity. Their pool share is currently underweight relative to Nīti. Sankhya (puruṣa-prakṛti viveka) and YS (vritti discrimination) provide a different discrimination register than Nīti's strategic viveka — they are not interchangeable.

**Correction needed for P2:** Pool 20+ Sankhya rows + 15+ YS rows to bring Nīti below 45%. This is the smallest intervention that restores tradition balance without removing any existing Nīti content. Priority: P2.

**For now:** Do not claim clarity is "tradition-balanced." It is Nīti-heavy and work_career-weighted. This is disclosed in product truth rules.

---

## 3. Growth — distinctness from Clarity

**Is Growth structurally distinct from Clarity?**

Yes — the distinction is real and holds at multiple levels:

| Dimension | Clarity | Growth |
|---|---|---|
| Primary principle tradition | Nīti (tactical discernment), Sankhya (viveka) | Yamas (ethical cultivation), BG (svadharma/karma-yoga) |
| Room intent | Discrimination — naming what is true | Cultivation — practicing what is right |
| Sankalp slot | Absent | Present and co-primary |
| Teaching format | Teaching chip (clarifying principle) | Banner (resolve/commitment) + sankalp (daily cultivation) |

**Anchor alignment gap:** The growth sankalp anchor `honor_my_skill` (Saraswati/skill/mastery) is work-skewed. A relationships, health_energy, or money_security user receives a skill/mastery invitation on first visit. This is the one real distinctness failure — the anchor doesn't match the full range of growth contexts. Fix required: see §7.

**Banner pool:** Post-Wave 2, the growth banner pool carries Yamas (18 rows), BG (11 rows), Dharma (5 rows), YS (6 rows), Dinacharya (10 rows), Ayurveda (4 rows). The Yamas-heavy composition is appropriate for growth (cultivation register) and is distinct from clarity's Nīti-heavy teaching register.

---

## 4. Connection and Joy — devotional/emotional register

**Connection:**
- Bhakti principal: 18 existing Vaiṣṇava rows + 14 P1-B rows (Gauḍīya/Ālvār/Sant) pending ingestion
- Yoga-Sūtras 1.33 (maitrī-karuṇā-muditā-upekṣā) is structurally present
- Register holds: connection uses `deepen` emotional_function tag, distinct from joy's `offer` tag
- No Nīti rows in connection (register violation was explicitly blocked)
- No Shaiva/Tantric in connection (excluded)

**Joy:**
- Post-P1-B: 9 banner rows across 4 lineages (Vaiṣṇava base + Gauḍīya + Ālvār + Sant)
- All 4 P1-B additions carry `emotional_function: offer` — the ānanda/delight register holds
- G-3 (dual-tagged connection + joy, Gauḍīya viraha-ānanda) is the only exception — doctrinal basis confirmed, founder call F-3 pending
- Joy sankalp subslots (gratitude/blessings/seva) are unchanged and intact

**Verdict:** Both rooms preserve their devotional/emotional register. No register bleeding detected. Joy remains distinct from connection at the content level.

---

## 5. Release — holding room or tactical?

**Release register check:**

- 17 Ayurveda practices seeded (Caraka/Suśruta/Vāgbhaṭa anchors, vāta/pitta/kapha named) — embodied, not tactical
- Mantra: Shiva dissolution register (Om Namah Shivaya, Mahamrityunjaya) — correct
- Banner: aparigraha (Yamas), Vedanta-witness — burden/surrender/letting-go register
- F3 accepted: release × work_career banner uses release-phase-1-metabolizing + clarity-phase-2-discernment hybrid (not pure tactics)

**Verdict:** Release is a holding room. The Ayurveda-embodied practices are the room's primary body-feel contribution. Banners are in the correct register. The work_career banner (F3 hybrid) is the lightest contextual touch — it is release-framed, not tactical-planning-framed.

**Release × work_career and × daily_life are still thin** (1 and 0 banners respectively). This is a known gap — acceptable for current state; Wave 3 fill if Phase 1 proof justifies context shaping in release.

---

## 6. Stillness — untouched by context shaping

**F1 applied:** `mantra.shivoham` removed from stillness rotation (migration 0139). Confirmed in WAVE2_POST_APPLY_REPORT.

**Current stillness mantra pool:** 2 entries — `om` (peace_calm register) + `om_shanti_om`. Both carry `life_context_bias: []`. No context scoring fires.

**Chip floor:** 3 chips on cold_start (step + mantra + exit). Above the 3-chip minimum.

**Context shaping:** None. All stillness refs carry `life_context_bias: []` — confirmed on dev after 0144. Prod gate still open. This is permanent — not a gap.

**Known shortfall:** 2 mantra entries only — rotation depth thin; users see same mantra faster on repeat visits. Wave 3 commission (HY3): add 1–2 Vedanta-sākṣin mantras. This does not change context-universality — new mantras will also carry `life_context_bias: []`.

---

## 7. Corrections needed

Three corrections required before the system can be called fully balanced and clean.

**Correction 1 — Growth sankalp anchor swap (required before sankalp-slot claims)**

Current anchor `sankalp.honor_my_skill` is Saraswati/skill/mastery register, categorized under careerprosperity. All growth users receive this on cold_start regardless of context.

Smallest fix: migrate anchor from `honor_my_skill` to `sankalp.effort_over_outcome` (karma-yoga, BG 2.47 — "I offer my effort without gripping the fruit"). `effort_over_outcome` applies universally: relationships (effort in showing up without controlling outcomes), health (consistent practice without fixating on results), money (right action without attachment), work/purpose (karma-yoga directly). Move `honor_my_skill` to rotation where it serves work_career/purpose users appropriately.

Migration needed: write 0145 (or include in D-01–D-08 cleanup migration) to update `room_growth/sankalp` pool `anchor_ref`.

**Correction 2 — Nīti concentration in clarity (P2, not prod-blocking)**

Pool 20+ Sankhya + 15+ YS rows into clarity in P2. Target: Nīti below 45%. Does not require removing existing rows. Priority: P2.

**Correction 3 — Release × work_career and × daily_life thin cells (Wave 3 if justified)**

+3–5 rows each would close the gap. Only pursue if Phase 1 proves the pattern and release context shaping is justified. Not a current commitment.

**Everything else is within bounds.** BG cap in clarity: 10.6% (well below 15% ceiling). Cross-room contamination: 0. Register violations in Wave 2 authoring: 0. Joy register: clean. Connection Bhakti lineage breadth: fulfilled by P1-B.
