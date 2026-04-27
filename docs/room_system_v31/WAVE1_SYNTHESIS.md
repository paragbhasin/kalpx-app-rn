# Wave 1 Synthesis — Room System v3.1.1

**Status:** FOUNDER-REVIEW-PENDING
**Date:** 2026-04-21
**Locale scope:** English (en) only — no multi-locale counting
**Authors:** Synthesis of Agents D / E / F / G outputs (uncommitted)
**Upstream doctrine:** `ROOM_SYSTEM_STRATEGY_V1.md` §1 §5 §5.7.5 §8

This document is the missing integrated operating layer. It answers the seven
founder questions, consolidates the per-room operational views, verifies the BG
cap in actual code, and calls out what is still deferred to Wave 1b and Wave 2/3.

---

## Executive summary

**Top 3 rooms most improved by Wave 1**

1. **Growth.** First time the room has a sankalp slot (9 rows, co-primary with
   principle) + first time Yamas/Niyamas become the primary ethical substrate
   (18 principle rows) + Dinacharya daily-life scaffold (10 rows). This is a
   soul change, not a volume change.
2. **Clarity.** Principle pool 5 → 64 rows; Sankhya viveka + YS kleśa-analysis
   + Niti discernment now operational. Gita kept to 7/64 = 10.9% — disciplined
   secondary, not dominant. Life_context variation becomes real for the first
   time.
3. **Release.** Body-wisdom surfaces (Ayurveda vāta/pitta pacifying, 5 banners)
   for the first time. Yamas-aparigraha covers money_security-grief properly.
   Ch 2.14 "endure like seasons" banner seeded (sparse, correct).

**2 rooms still most underpowered after Wave 1**

1. **Stillness.** Structurally intentional — pre-cognitive room, no
   life_context, no sankalp/principle. Risk is *repetitive* not thin: 4 mantra
   + 5 practice + 4 banner. Acceptable only if it still feels sacredly spare,
   not rote.
2. **Connection.** Wave 1 lands 7 Bhakti banners (minimum met) but practice
   pool remains 3 rows across 5 life_contexts. Connection × purpose_direction
   has zero practice rows; × health_energy has one. Without Bhakti breadth in
   practice/mantra, the room risks feeling like "soft support text" rather
   than devotional contact.

**Top 5 highest-value authoring needs still open after Wave 1**

1. **Joy × work_career karma-yoga-craft sankalps** — currently 0 authored.
   Without this, work_career grief routes to release cleanly, but celebration
   of the craft itself has no seat. +5-8 rows.
2. **Niti depth for clarity × relationships + purpose_direction** — Agent F
   authored 50 rows but concentrated in clarity × work/money/daily + growth.
   Relationships (6 rows) is the minimum floor; purpose_direction was not
   specifically authored. +15-20 rows targeted to those contexts.
3. **Ayurveda joy-register body-vitality** — 10 Ayurveda orphan rows remain
   but in release/clarity/growth register. Joy × health_energy cannot be
   served by "cool the pitta" language. +8-12 joy-rasa authoring rows needed.
4. **Bhakti breadth for connection rotation** — 7 banner rows hit the minimum
   but leave no rotation variety. +5-10 new Nārada/Bhāgavata rows to carry
   3-month repeat-tolerance.
5. **Release banner BG 2.14-family** — 2 Gita pooled rows in release banner;
   sparse-by-design but thin for rotation. +3-5 death/grief-endurance verses
   without crossing into cognitive-teaching territory.

**BG cap verification:** **CODED IN MIGRATION ONLY.** See §5.

**Path A (this synthesis) deliverables:** complete. No new BE/FE
implementation initiated per brief.

---

## Section 1 — The 7 questions, directly answered

### 1.1 What exactly changes in each room after Wave 1?

| Room | Before (rows pooled) | After (rows pooled) | Net structural change |
|---|---:|---:|---|
| Stillness | 11 | 10 | practice.hand_on_heart decontaminated → becomes stillness-home-only; 2 wisdom banners added (Ayurveda vāta + Vedanta-witness) |
| Connection | 12 | 17 | mantra.soham removed (stillness home); hand_on_heart removed; +7 Bhakti banners + 2 Dinacharya + 1 Ayurveda |
| Release | 8 | 18 | +1 BG 2.14-style banner + 5 Ayurveda × health + 2 Yamas × money_security + 1 Vedanta-witness |
| Clarity | 26 | 98 | principle pool 5 → 64 (Sankhya 15 + YS 18 + Niti 11 + Dharma 3 + Yamas 4 + Ayurveda 3 + Dinacharya 5 + BG 7 held to 10.9%); decontamination of YS-one-anchor → stillness |
| Growth | 26 | 92 | **sankalp slot added for the first time (9 rows)**; principle pool 6 → 56 (Yamas 18 + BG 11 + YS 7 + Dharma 8 + Dinacharya 10 + Ayurveda 4); 4 new banners |
| Joy | 23 | 27 | +4 Bhakti banners (total 5 Bhakti); sankalp subslots unchanged; no principle; no practice (intentional) |

### 1.2 Which content classes become more visible in each room?

| Room | Class growing | Class flat | Class absent (doctrinal) |
|---|---|---|---|
| Stillness | wisdom_banner (2 → 4) | mantra, practice | sankalp, principle |
| Connection | wisdom_banner (2 → 10) | mantra (loses soham; 4 rotation), practice (loses hand_on_heart; 3 rotation) | sankalp, principle |
| Release | wisdom_banner (2 → 11) | mantra (4), practice (3) | sankalp, principle |
| Clarity | principle (5 → 64); wisdom_teaching (5 → 7) | mantra (5), practice (4) | sankalp |
| Growth | **sankalp (0 → 9) — NEW SLOT**; principle (6 → 56); wisdom_banner (6 → 11); wisdom_teaching (6 → 7) | mantra (4), practice (4) | — |
| Joy | wisdom_banner (4 → 8) | mantra (6), sankalp (16 in 3 subslots) | practice, principle |

### 1.3 Which traditions become newly visible in each room?

Traditions that go from **0 rows in pool** → **≥1 row** in the named room after
Wave 1:

| Room | Newly visible traditions |
|---|---|
| Stillness | Ayurveda (1 — vāta-grounding light support) |
| Connection | Bhakti-principle-layer (6 → 7 total; was mantra-only bhakti before); Dinacharya (2); Ayurveda (1) |
| Release | Ayurveda (5 — first body-wisdom content); Yamas (2 — aparigraha); Vedanta-witness (1) |
| Clarity | Yamas (4); Ayurveda (3); Dinacharya (5); Sankhya expansion (1 → 15); YS expansion (1 → 18) |
| Growth | Yamas/Niyamas (0 → 18 — primary substrate); Dinacharya (0 → 10); Ayurveda (0 → 4); Sankalp class (0 → 9 — structural); Dharma Tier-2 (5) |
| Joy | Bhakti-principle-layer (1 → 5; was mostly existing Gita + 1 Bhakti banner) |

### 1.4 Which rooms still remain thin after Wave 1?

Thin means *authored floor inadequate for life_context rotation*, not just
"small pool."

| Room | Thin contexts | Thin class(es) | Type of remaining gap |
|---|---|---|---|
| Stillness | N/A (context-free) | wisdom_banner at 4 | Authoring — Vedanta-sākṣin teachings are dark-orphan territory; 2-3 more would harden rotation |
| Connection | purpose_direction, health_energy | practice, mantra | Authoring — Dhanvantari/body-bhakti genuinely absent; purpose_direction has no guru-bhakti authored rows |
| Release | work_career, daily_life | all classes | Doctrine + authoring — release × work_career has no pooled rows across any class. Doctrinal call needed first: does work_grief route through release or clarity? |
| Clarity | money_security, health_energy | mantra, practice | Authoring (light) — 0 mantra/practice rows for money_security; Ayurveda × clarity × money_security has no authored match |
| Growth | relationships, health_energy, money_security | sankalp, practice | Authoring — growth sankalps skew purpose/self/work; no relationships/health/money variants authored |
| Joy | work_career, health_energy | sankalp, mantra | Authoring — karma-yoga-craft (work_career) = 0 authored; joy-rasa body-vitality (health_energy) = rasa-register mostly absent |

### 1.5 Which gaps are solved by tagging/pooling (no authoring)?

Of Wave 1's 200-row patch + migrations 0132-0135, these gaps are **fully
closed by tag-and-pool alone** (no authoring needed):

- Clarity principle pool depth — 5 → 64, purely via tagging orphans (Sankhya 14 + YS 18 + Niti 10 + BG 4 + Dharma 3 = 49 tag-and-pool ops)
- Growth sankalp slot population — 9 rows selected from existing authored
  `master_sankalps.json` (no new authoring; just pool allocation via 0132)
- Decontamination (3 rows) — pure pool removal (mantra.soham, hand_on_heart,
  yoga_sutras_one_anchor_when_scattered)
- Yamas rooms-touched ≥ 3 — satisfied by tagging 24 of the 27 authored Yamas
  orphans across growth/release/clarity
- Ayurveda rooms-touched ≥ 4 — satisfied by tagging 14 of the 24 authored
  Ayurveda orphans across still/conn/rel/clar/growth
- Dinacharya rooms-touched ≥ 3 — satisfied by tagging 17 of the 24 authored
  Dinacharya orphans across conn/clar/growth
- Bhakti connection banner minimum — 6-8 satisfied at 7 via pure tagging
- Bhakti joy banner minimum — 3-4 satisfied at 5 (slight over; acceptable)
- Joy subslot expansion 8 → 15+ — pure tagging of existing subslot rows

### 1.6 Which gaps still require genuine authoring?

Gaps that cannot be closed by tag-and-pool because the source rows do not
exist in authored inventory:

| Authoring gap | Authored today | Required | Wave |
|---|---:|---:|---|
| Joy × work_career karma-yoga-craft sankalps (BG 2.47 framing) | 0 | +5-8 | 2 |
| Niti clarity × relationships + purpose_direction depth | 6 (Wave 2 F) / 0 | +15-20 | 2 |
| Ayurveda joy-register body-vitality | 0 | +8-12 | 2 |
| Bhakti connection rotation breadth | 7 banners pooled | +5-10 new | 2 |
| Release banner BG 2.14-family | 2 | +3-5 | 2 |
| Release × work_career (all classes) | 0 | +5-8 | 3 (doctrine first) |
| Growth sankalp × relationships/health/money | 0 | +6-9 | 3 |
| Clarity × money_security mantra/practice | 0 | +4-6 | 3 |
| Stillness Vedanta-sākṣin banner breadth | 4 | +2-3 | 3 |

Wave 2 authoring already delivered this session (uncommitted):
- **Agent F — principles_niti_wave2.yaml: 50 new rows**, distributed:
  clarity × work_career (14 = 12 + 2 applied), clarity × money_security (12),
  clarity × daily_life (10), clarity × relationships (6), growth × work_career
  (5), growth × money_security (3). **See §6 — governance fields empty.**
- **Agent G — principles_sankhya_wave2.yaml: 32 new rows**, distributed:
  clarity × self (7), clarity × relationships (5), clarity × work_career (5),
  clarity × health_energy (3), clarity × money_security (3), clarity ×
  purpose_direction (3), clarity × daily_life (3), stillness × self (2),
  growth × self (1). **See §6 — governance fields empty.**

### 1.7 What will the user noticeably feel differently?

See §8 (room-by-room feel prediction). Summary one-liner per room:

- **Stillness:** same sacred spareness; risk is whether 4-row banner rotation
  feels honored or rote.
- **Connection:** warmer. Bhakti is now felt as *taught*, not just chanted.
  Risk: still thin on practice, so the room's body-feel hasn't deepened.
- **Release:** *embodied* for the first time. Ayurveda body-wisdom meets the
  user where they are contracted. Aparigraha gives money-grief a real home.
- **Clarity:** *context-shaped* for the first time. Work_career pulls Niti;
  health_energy pulls Ayurveda; self pulls Sankhya viveka. Different
  discriminations, not wrapped wisdom.
- **Growth:** *soul-changed*. The user can now resolve alongside study. "I
  honor my skill" beside gita_svadharma_is_what_you_have is a new genre of
  interaction. Dinacharya gives rhythm-wisdom.
- **Joy:** slightly deeper Bhakti register in banners. Structurally unchanged.
  Risk: work_career joy remains a hollow option unless karma-yoga-craft rows
  land in Wave 2.

---

## Section 2 — Table A: Per-room operational summary (5 classes × 6 status slots)

Legend: **P** primary · **S** secondary · **L** light · **X** excluded · **W1** added in Wave 1 · **W2/3** deferred

### 2.1 Stillness

| Class | Status | W1 added | W2/3 deferred |
|---|---|---|---|
| mantra | S | — (rotation stable) | — |
| practice | **P** | — (hand_on_heart kept as home anchor) | — |
| sankalp | X | — | — (doctrinally excluded) |
| principle | X | — | — (doctrinally excluded) |
| wisdom_banner | L | +2 (ayur_vata_ground_evening, yoga_rest_in_the_seer) | Vedanta-sākṣin breadth (+2-3) |

### 2.2 Connection

| Class | Status | W1 added | W2/3 deferred |
|---|---|---|---|
| mantra | **P** | −1 (soham decontaminated) | Dhanvantari × health_energy (+3-4 rows) |
| practice | S | −1 (hand_on_heart decontaminated) | anahata-family × purpose_direction + health_energy (+4-6) |
| sankalp | X | — | — (doctrinally excluded) |
| principle | X | — | — (doctrinally excluded except BG 18.66 banner) |
| wisdom_banner | L | +7 Bhakti + 2 Dinacharya + 1 Ayurveda (total 10) | rotation breadth (+5-10 Nārada/Bhāgavata) |
| wisdom_teaching | — | gated v1.1 — not seeded | v1.1 doctrinal unlock |

### 2.3 Release

| Class | Status | W1 added | W2/3 deferred |
|---|---|---|---|
| mantra | S | — | Shaiva × money_security aparigraha (+2-3) |
| practice | **P (somatic)** | — | Ayurveda vāta/pitta practices (+3-5) |
| sankalp | X | — | — (doctrinally excluded — release is pre-sankalpic) |
| principle | X | — (banner use only, not slot) | — |
| wisdom_banner | L (very sparse) | +9 (1 BG + 5 Ayurveda + 2 Yamas + 1 Vedanta) | BG 2.14-family breadth (+3-5); work_career release register |

### 2.4 Clarity

| Class | Status | W1 added | W2/3 deferred |
|---|---|---|---|
| mantra | S | — | money_security + health_energy contexts (+2-3) |
| practice | S | — | relationships + health_energy contexts (+2-3) |
| sankalp | X | — | — (Gita 2.63 "resolve-before-clarity" trap) |
| principle | **P** | +60 (Sankhya 14 + YS 18 + Niti 11 + Dharma 3 + BG 4 + Yamas 4 + Ayurveda 3 + Dinacharya 5 — with BG held at 10.9%) | money_security mantra/practice; Ayurveda × health × clarity authoring |
| wisdom_banner | — | +1 (yoga_use_one_truthful_anchor replaces decontaminated row) | — |
| wisdom_teaching | L | +2 YS (kleshas_distort_seeing, name_the_vritti) | rotation breadth |

### 2.5 Growth

| Class | Status | W1 added | W2/3 deferred |
|---|---|---|---|
| mantra | L | — | relationships + health_energy contexts (+3-4) |
| practice | S | — | money_security + health_energy (+2-3) |
| sankalp | **P co-primary (STRUCTURAL NEW)** | +9 (honor_my_skill anchor + 8 rotation; svadharma/abhyasa verb-register) | relationships/health/money × sankalp (+6-9) |
| principle | **P co-primary** | +51 (Yamas 18 + BG 8 + Dharma 5 + YS 6 + Dinacharya 10 + Ayurveda 4) | — |
| wisdom_banner | L | +4 (Yamas tapas + Niyamas santosha + Dinacharya + BG no_effort_lost) | — |
| wisdom_teaching | — | +1 (gita_lift_by_abhyasa_and_detachment) | rotation breadth |
| wisdom_reflection | L | — | — |

### 2.6 Joy

| Class | Status | W1 added | W2/3 deferred |
|---|---|---|---|
| mantra | S | — | work_career karma-yoga mantras (+2-3) |
| practice | X | — | — (doctrinally: joy does not need procedure) |
| sankalp | **P** (3 subslots: gratitude/blessings/seva) | — (existing 16 rows retained) | work_career × sankalp (karma-yoga-craft, +5-8) |
| principle | X | — | — (principle desiccates joy, per §5) |
| wisdom_banner | L | +4 Bhakti (total 5) | — |
| wisdom_teaching | — | gated v1.1 | v1.1 doctrinal unlock |

---

## Section 3 — Table B: Principle-family activation register

All counts English-locale only, sourced from `CONTENT_CLASS_AUDIT_V2` +
`LIBRARY_UTILIZATION_AUDIT_V2` + migrations 0134/0135 + Agents F/G wave2 files.

| Family | Authored (pre-W1) | Pooled (pre-W1) | W1 newly activated | Still dark after W1 | New authoring in W1 (F/G) | Requires more authoring? | Primary room home | Secondary room home(s) |
|---|---:|---:|---:|---:|---:|---|---|---|
| **Bhagavad Gita (BG)** | 32 | 7 | +12 (clarity 4 + growth 8; BG held to 10.9% in clarity) | 13 | 0 | W2 for release Ch 2.14 breadth (+3-5); not growth-limited | Growth (primary, native home) | Clarity (tight verse set), Release (sparse banner), Joy (work_career only) |
| **Yoga Sūtras (YS)** | 25 | 1 | +24 (clarity 18 + growth 6) | 0 | 0 | No (saturated post-W1) | Clarity (kleśa-analysis), Stillness (dhyāna) | Growth (abhyāsa), Stillness (anchor) |
| **Sankhya** | 15 | 1 | +14 (clarity all viveka corpus) | 0 authored pre-W1 | **+32 (Agent G)** | W2 doctrine — dual-use saturation risk without fresh rows | Clarity (viveka, primary native) | Stillness (sākṣī), Growth (svādhyāya, 1 row) |
| **Bhakti** | 26 | 1 principle + many mantras | +11 principle/banner (connection 7 + joy 4) | 14 principle | 0 | **Yes W2 (+5-10)** — connection rotation breadth | Connection (primary) | Joy (light) |
| **Dharma** | 24 | 5 | +8 (growth Tier-2) + 3 (clarity dual-tagged) | 8 | 0 | No — saturated for growth + clarity | Growth (Tier-2 substrate) | Clarity (dual-use), Stillness (—) |
| **Nīti** | 16 | 2 | +11 (clarity, satya/ahimsa/asteya/pragmatic discernment) | 3 | **+50 (Agent F)** | W2 — relationships + purpose_direction contexts thin even with F (+15-20) | Clarity (discernment, primary) | Growth (work_career, secondary) |
| **Dinacharya** | 24 | 0 | +17 (growth 10 + clarity 5 + connection 2) | 7 | 0 | W2 for joy-register rhythm (+3-5) if desired | Growth (daily_life primary) | Clarity (daily_life), Connection (devotional-daily) |
| **Ayurveda** | 24 | 0 | +14 (release 5 + growth 4 + clarity 3 + connection 1 + stillness 1) | 10 | 0 | **Yes W2 (+15-25)** — joy-register body-vitality 0 authored; release × work_career; connection × health breadth | Release (health_energy primary), Growth (health_energy primary) | Clarity (health, light), Stillness (vāta-grounding light), Connection (health, light) |
| **Yamas/Niyamas** | 27 | 0 | +24 (growth 18 + release 2 + clarity 4) | 3 | 0 | W2 (+10) — clarity × money_security aparigraha variants | Growth (primary ethical substrate) | Release (aparigraha × money_security), Clarity (satya/ahimsa × relationships; asteya × work_career) |

**Consolidated sub-view — dark traditions (0% pre-W1):**

| Tradition | Pre-W1 pooled | Post-W1 pooled | Rooms touched post-W1 |
|---|---:|---:|---|
| Yamas | 0 | 24 | Growth, Release, Clarity (3 rooms ✓ doctrinal floor) |
| Ayurveda | 0 | 14 | Release, Growth, Clarity, Connection, Stillness (5 rooms ✓) |
| Dinacharya | 0 | 17 | Growth, Clarity, Connection (3 rooms ✓) |

All three 0%-pooled dark traditions now operational. No dark tradition remains
entirely hidden post-W1.

---

## Section 4 — Table C: Room thinness register

| Room | Materially stronger in Wave 1 | Still thin in | Gap type |
|---|---|---|---|
| **Stillness** | 2 banner rows added (Ayurveda vāta + Vedanta rest_in_seer) | wisdom_banner rotation (4 rows) | **Authoring** (Vedanta-sākṣin corpus is dark-orphan territory) |
| **Connection** | Bhakti principle/banner layer now present (0 → 7); Dinacharya devotional-daily seeded | practice rotation; mantra × purpose_direction + health_energy | **Authoring** (Dhanvantari/body-bhakti; guru-bhakti principles); **Doctrine** (wisdom_teaching v1.1 unlock timing) |
| **Release** | Body-wisdom operational (Ayurveda × health 5); aparigraha for money-grief; BG 2.14 sparse banner seeded | work_career register (0 rows any class); banner rotation breadth | **Doctrine + authoring** (work-grief home-room call); **Authoring** (BG 2.14-family breadth) |
| **Clarity** | Principle pool 5 → 64; context variation real (Niti=work/money, Ayurveda=health, Sankhya=self); BG disciplined at 10.9% | mantra/practice × money_security + health_energy; rotation breadth in light-context cells | **Authoring** (clarity × money_security mantra/practice); **Tagging** (mantra life_context_bias fields empty across 200 rows) |
| **Growth** | Sankalp slot exists (0 → 9 — structural); Yamas primary substrate (0 → 18); Dinacharya rhythm (0 → 10) | sankalp × relationships/health/money; mantra breadth | **Authoring** (growth sankalps for 3 underserved contexts); **Tagging** (mantra tags) |
| **Joy** | Bhakti banner depth (1 → 5 minimum met) | work_career sankalp (0); health_energy rasa-register | **Authoring** (karma-yoga-craft + joy-rasa body-vitality) |

---

## Section 5 — BG cap verification

**Verification label: CODED IN MIGRATION ONLY**

The clarity BG ≤ 25% cap is enforced as a `RuntimeError` assertion inside both
migration files, at apply time. It is NOT enforced by the runtime selector or
the render endpoint. A future migration that tags a new Gita row into
`room_clarity/principle` without repeating the same assertion block could slip
through.

**Evidence:**

1. `core/migrations/0134_expand_clarity_principle_pool.py` — function
   `expand_clarity_pool` (line 169-215). Lines 194-215 re-compute
   `bg_count / total` after additions and raise `RuntimeError` if > 25%.
   Last-line log at success: `logger.info("BG-cap check OK — %d/%d = %.1f%%", ...)`.

2. `core/migrations/0135_seed_dark_tradition_principles.py` — function
   `seed_dark_traditions` (line 223-276). Lines 258-276 re-verify the cap
   after dark-tradition additions. Raises `RuntimeError` on violation.

3. Additional doctrinal assertions co-located in 0135:
   - Bhakti connection banner ≥ 6 (line 230-242)
   - Bhakti joy banner ≥ 3 (line 244-256)

4. **NOT found:** runtime assertion in `core/rooms/room_selection.py` or
   the render endpoint. Grep for `gita_` cap check in rooms code returns none.

**Computed result at apply time:** 7/64 = **10.9%** (well under 25% cap).
Headroom: 17 BG rows could still be added before the cap trips.

**Recommendation (not in Path A scope):** add a runtime guard in
`core/rooms/room_selection.py` that asserts the cap on every render so any
future seed/tag operation that bypasses migrations cannot violate the
doctrine. Flag as Wave 1b carryover.

---

## Section 6 — Agent F / G output review

### 6.1 Agent F (Niti Wave 2) — `principles_niti_wave2.yaml`

**Grouping status: PROPERLY GROUPED.** File has explicit per-room ×
life_context section headers (`# CLARITY × WORK_CAREER (12 principles)` etc.)
organizing all 50 rows into 7 groups:

| Section header | Rows |
|---|---:|
| Clarity × work_career | 12 |
| Clarity × money_security | 12 |
| Clarity × daily_life | 10 |
| Clarity × relationships | 6 |
| Growth × work_career | 5 |
| Growth × money_security | 3 |
| Clarity × work_career (applied specific-case) | 2 |
| **Total** | **50** |

**Distribution hit vs target:** Target was "+40-60 Niti rows"; landed 50. ✓

**Authoring quality:** Each row carries: `core_teaching`, `plain_english`,
`universal_explanation`, `rooted_explanation` with Vidura-Nīti /
Cāṇakya-Nīti / Mahābhārata chapter citations, `state_tags`, `relevances`
(guna/klesha/kosha/upaya), `tone_modes` (universal/hybrid/rooted),
`intervention_links`, `contraindications`, `why_this_levels`. Sources verified
against authentic corpus: Cāṇakya-Nīti, Vidura-Nīti (Udyoga Parva 33-40),
Mahābhārata Śānti Parva, Hitopadeśa, Pañcatantra, Bhartṛhari's Nīti-Śataka,
Subhāṣita corpus.

**Doctrine compliance:** Niti routing matches ROOM_TRADITION_ASSIGNMENT_V2 §Clarity
(primary) + §Growth (secondary work_career). No Niti surfaces to rooms where
doctrine excludes it (connection, release, stillness, joy).

**Known coverage gaps (for Wave 2 follow-up):**
- Clarity × purpose_direction — 0 rows in F's set; relies on tagging orphan
  rows from existing `principles_niti.yaml`
- Clarity × relationships — 6 rows (minimum floor); breadth could warrant
  +4-6 more

**⚠ Flag for Wave 1b:** Agent F rows do NOT populate v3.1 governance fields
(`room_fit`, `life_context_bias`, `surface_eligibility`, `pool_role`,
`emotional_function_tag`, `intensity`, `action_family`, `standalone_safe_flag`,
`repeat_tolerance_level`). Room × life_context is encoded in YAML comment
headers only. These 50 rows will not be selected by Rule 5 until tagged in a
Wave 1b TAG_PATCH companion.

**Recommendation:** No regeneration. Add 50-row entry to Wave 1b tag-patch
derived from comment-header grouping. Addendum file NOT created because
grouping is already in the YAML.

### 6.2 Agent G (Sankhya Wave 2) — `principles_sankhya_wave2.yaml`

**Grouping status: EXEMPLARY.** File header contains explicit distribution
table at lines 19-28:

| Section header | Rows |
|---|---:|
| Clarity × self | 7 |
| Clarity × relationships | 5 |
| Clarity × work_career | 5 |
| Clarity × health_energy | 3 |
| Clarity × money_security | 3 |
| Clarity × purpose_direction | 3 |
| Clarity × daily_life | 3 |
| Stillness × self | 2 |
| Growth × self | 1 |
| **Total** | **32** |

**Distribution hit vs target:** Target was "+30-40"; landed 32. ✓ (bottom of band)

**Authoring quality:** Each row has Sāṁkhya-kārikā / Sāṁkhya-sūtra / Tattva-kaumudī
citations. Doctrinal discipline explicit in header (lines 8-18): pure
Sāṁkhya register, NO Advaita-Vedanta monism, NO Yoga-Sūtra kleśa-analysis
(which lives in YS file), NO Bhakti warmth. Voice: "analytical, clean,
dispassionate, precise."

**Doctrine compliance:** Clarity = primary native home (per
ROOM_TRADITION_V2 §Clarity); stillness × self as sākṣī-bhāva secondary;
growth × self as svādhyāya-as-guṇa-observation secondary. Matches spec.

**⚠ Same flag as F:** v3.1 governance fields empty on all 32 rows. Must be
tag-patched in Wave 1b before Rule 5 can discriminate.

### 6.3 Wave 1b carryover task

A single companion tag-patch (call it `TAG_PATCH_WAVE1B.yaml`) must be
authored BEFORE applying migrations 0132-0135 and before ingesting the 82
new principle rows to the DB, populating for each of the 50 + 32 = 82 rows:

- `room_fit` — from comment-header grouping
- `life_context_bias` — from same
- `surface_eligibility` — by class + context (typical: `[wisdom_teaching,
  wisdom_reflection]` for clarity principles; `[wisdom_reflection]` for growth)
- `tradition_family` + `tradition` — already implicit from file (niti / sankhya)
- `pool_role` — anchor/rotation decision (default: rotation unless curator elevates)
- `emotional_function_tag` — clarity principles → `discriminate`; growth → `hold`
- `intensity`, `action_family`, `standalone_safe_flag`, `repeat_tolerance_level`
- `exclude_from_contexts` — per row as judged

Estimated effort: Agent-D-class tagging sweep, ~82 rows, single pass. Not
authoring — just field population from known group membership.

---

## Section 7 — Wave 1b carryover checklist

Strictly **tagging / verification / documentation** — no new authoring, no
new doctrine. Must clear before Wave 2 authoring begins.

1. **Tag 82 new principle rows** (Agent F 50 Niti + Agent G 32 Sankhya) with
   v3.1 governance fields per §6.3 above. Deliverable: `TAG_PATCH_WAVE1B.yaml`.
2. **Tag 554 master mantra/sankalp/practice rows** (`surface_eligibility`
   field empty per `CONTENT_CLASS_AUDIT_V2` §A.3) — without this Rule 5
   cannot discriminate by class surface. Deliverable: field backfill migration.
3. **Tag mantra/sankalp/practice rows with `life_context_bias`, `room_fit`,
   `emotional_function_tag`** (0% populated per §A.3). Enables chip surface
   filtering.
4. **Add runtime BG cap guard in `core/rooms/room_selection.py`** so the
   ≤ 25% invariant survives future non-migration pool changes (§5 recommendation).
5. **Resolve 15-row cross-surface (rooms ↔ additionals) overlap** from
   `SURFACE_ISOLATION_AUDIT_V2` §C — decontamination audit open.
6. **Resolve smoke-state conflict** (1/12 vs 12/12 on tip `b1ae635c` per
   `mitra_session_handoff_2026_04_20_end.md`) via dev EC2 SSH + fresh
   `smoke_room_render --salt=...` call. Blocks any migration apply.
7. **Founder ACK gate on 4 items** called out by Agent E (POOL_GAP_REPORT §E):
   - Growth sankalp 9-row selection (confirm vs Agent D Group 1 intent)
   - Clarity BG verse-set (2.47/3.35/18.47-adjacent picks)
   - Decontamination direction for 3 cross-room rows
   - Bhakti joy banner at 5 vs 3-4 target (acceptable?)

---

## Section 8 — What the user will noticeably feel (room-by-room)

The founder's substantive guidance (preserved verbatim for scope):

> Growth is still likely the most important room to watch, because adding
> sankalp there changes the room's soul, not just its variety. Clarity is
> next, because it carries the heaviest life-context burden and will expose
> whether the system truly feels context-shaped. Release will probably
> improve, but may still remain thinner than it should unless Ayurveda/
> body-wisdom and release-specific practices deepen properly. Stillness being
> thin is not automatically bad; it is only a problem if it feels repetitive
> rather than sacredly spare. Joy should be protected from becoming
> over-explained. Connection should be watched carefully so it feels
> devotional and relational, not just "soft wording over generic support."

### 8.1 Stillness — *no change, test for repetitive-vs-spare*

User arrives at `mantra.soham` anchor + belly_breathing practice as before.
Banner rotation now includes vāta-grounding and rest_in_the_seer — both
light-touch, non-cognitive. **Risk signal to watch:** if user returns to
stillness 3+ times in a week and the banner rotates through the same 4 rows,
does it feel like being welcomed into the same silence, or like running out
of material? If the latter: Vedanta-sākṣin authoring (+2-3) is warranted.

### 8.2 Connection — *warmer in theory, still thin in practice*

First major change: Bhakti enters the room as *taught wisdom*, not just
sound. "Remember the beloved in the middle of life", "Offer the moment not
only the ritual" — Nārada-register rendered in contemporary voice. **Risk
signal to watch:** does connection × purpose_direction (user seeking their
calling) feel like it has body? Right now the practice pool has 0 rows for
that context. If user taps connection during a purpose-seeking moment, the
room may still return support text with no somatic substrate. Guru-bhakti
authoring is the fix.

### 8.3 Release — *embodied for the first time*

The single highest-feel delta in Wave 1. User arriving in release ×
health_energy now gets `ayur_cool_after_conflict`, `ayur_abhyanga_for_overwhelm`,
`ayur_pause_before_decision_when_agitated`. This is body-wisdom meeting the
contracted body at the level it exists. Equally strong delta: release ×
money_security now routes to `yamas_aparigraha` banners — aparigraha-as-release
is doctrinally exact and emotionally true. **Risk signal:** release ×
work_career has 0 rows across all classes. Users who grieve professional
failure (layoff, project collapse) have no room home at all — they currently
have to route through clarity. Doctrinal call needed before Wave 2 authoring.

### 8.4 Clarity — *context-shaped for the first time*

Biggest cognitive-feel change. Until Wave 1, clarity returned the same 5
principle rotation regardless of whether the user was confused about work,
money, or self. Post-Wave 1:
- work_career user sees Niti ("separate the report from the interpretation",
  "prefer stability over dramatic reversal")
- money_security user sees Niti ("income before the lifestyle", "protect the
  emergency reserve") + Yamas aparigraha banner
- health_energy user sees Ayurveda ("sleep before wisdom", "don't decide from
  agitation")
- self user sees Sankhya viveka ("seer is not the seen",
  "misidentification creates bondage")
- relationships user sees Yamas satya + Niti ("soften when the bond can
  hold", "firm boundary when delay worsens harm")

These are **different discriminations**, not wrapped wisdom. BG kept to
10.9% means the user doesn't see Gita 2.47 four times in a week.

**Risk signal to watch:** does the user feel the life_context chose the
principle, or does it feel like the system guessed and sometimes hits? The
`surface_eligibility` field is empty on all 554 master rows, so Rule 5 can't
fully discriminate yet — §7 carryover #2.

### 8.5 Growth — *soul-changed*

Highest structural delta. For the first time the room offers a user-authored
resolve alongside the scripture. Tapping growth today returns the existing 5
principles + nothing user-voiced. Tapping growth post-Wave-1 returns:
- *Principle:* "Svadharma is what you have" + 55 others (Yamas, BG karma-yoga,
  Dharma Tier-2, Dinacharya, Ayurveda)
- *Sankalp (NEW):* "I honor my skill" / "I walk the dharma path" / "I move
  with dhriti" / "Effort over outcome" — 9 resolves in cultivation register

This is the room's posture changing from "receive the teaching" to "receive
the teaching AND take a stance." That is the Gītā's own pairing of *jñāna*
and *abhyāsa*.

**Risk signal to watch:** growth × relationships / health / money have 0
sankalps — if a user navigates to growth from a relationship-stuck moment,
the sankalp anchor (`honor_my_skill`) may misalign. Context-steered sankalp
selection requires both (a) governance fields on the 9 pooled sankalps and
(b) authoring in the underserved contexts.

### 8.6 Joy — *slightly deeper, structurally stable*

Minimal surface change. Bhakti banner rotation grows from 1 to 5, which
deepens the offering-register but doesn't restructure. **Risk signal to
watch:** joy × work_career still has 0 sankalp rows. If a user taps joy
during a work-satisfaction moment ("my project shipped"), the sankalp subslots
route through gratitude/blessings/seva — none of which are karma-yoga-craft.
The user may feel joy is "about the sacred but not about the work." Wave 2
authoring of BG 2.47 karma-yoga-joy-of-the-craft sankalps (5-8 rows) closes
this precisely.

Strongly protect joy against over-explanation. No principle slot here.
Bhakti-rasa supplies all the teaching joy needs.

---

## Appendix — References

| Artifact | Location | Role |
|---|---|---|
| Canonical strategy | `docs/room_system_v31/ROOM_SYSTEM_STRATEGY_V1.md` | Source of truth §1 §5 §5.7.5 §8 |
| Agent D row patch | `docs/room_system_v31/audits/TAG_PATCH_WAVE1.yaml` | 200 rows, curator-gated |
| Agent E pool plan | `docs/room_system_v31/audits/ROOM_POOL_PLAN_V2.yaml` | Per-room before/after |
| Agent E gap report | `docs/room_system_v31/audits/POOL_GAP_REPORT_V2.md` | Wave 2 authoring targets |
| Tradition doctrine | `docs/room_system_v31/audits/ROOM_TRADITION_ASSIGNMENT_V2.md` | Room × tradition lock |
| Dominance doctrine | `docs/room_system_v31/audits/ROOM_CLASS_DOMINANCE_V2.md` | Class × room primary/secondary |
| Isolation audit | `docs/room_system_v31/audits/SURFACE_ISOLATION_AUDIT_V2.md` | Contamination + field-gov gaps |
| Override ledger | `docs/room_system_v31/audits/OVERRIDE_LEDGER_V2.yaml` | Empty — 2-sig policy locked |
| Content class audit | `docs/room_system_v31/audits/CONTENT_CLASS_AUDIT_V2.md` | English-only utilization baseline |
| Library audit | `docs/room_system_v31/audits/LIBRARY_UTILIZATION_AUDIT_V2.md` | Tradition × class cross-tab |
| Agent F authoring | `kalpx/core/data_seed/mitra_v3/principles_niti_wave2.yaml` | 50 Niti, uncommitted |
| Agent G authoring | `kalpx/core/data_seed/mitra_v3/principles_sankhya_wave2.yaml` | 32 Sankhya, uncommitted |
| Migration 0132 | `kalpx/core/migrations/0132_add_growth_sankalp_slot.py` | Growth sankalp slot |
| Migration 0133 | `kalpx/core/migrations/0133_decontaminate_cross_room_rows.py` | 3-row decontamination |
| Migration 0134 | `kalpx/core/migrations/0134_expand_clarity_principle_pool.py` | Clarity principle 5 → 55; BG cap assert |
| Migration 0135 | `kalpx/core/migrations/0135_seed_dark_tradition_principles.py` | Dark-tradition seed; Bhakti + BG asserts |

---

## End-state signal for this synthesis

Path A is complete. No agent respawn initiated. Next decision gate: founder
curator review of these four artifacts together:

1. `WAVE1_SYNTHESIS.md` (this doc)
2. `TAG_PATCH_WAVE1.yaml`
3. `ROOM_POOL_PLAN_V2.yaml`
4. `POOL_GAP_REPORT_V2.md`

Then the Wave 1b carryover checklist (§7) before any migration applies.
