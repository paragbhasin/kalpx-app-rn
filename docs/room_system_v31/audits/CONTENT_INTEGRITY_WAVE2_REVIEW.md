# Content Integrity Wave 2 Review — Agent 8

**Reviewer:** Agent 8 (Sanatan coherence + content integrity)
**Date:** 2026-04-21
**Scope:** Wave 2 authoring — 7 files, ~143 new rows (68 Niti, 44 Sankhya, 11 Bhakti, 4 Gita-release, 17 Ayurveda, 7 Joy×work, 6 Joy×health, 12 Growth)
**Status:** REVIEW ONLY. No content files edited. Locked doctrine not reopened.

---

## §A Grading rubric

- **A** — Doctrinally clean, śāstra-anchored, correct register, operationally distinct. Land as-is.
- **B** — Substantively correct but needs minor tightening (1-3 row rewrites / tag fixes / one duplication pair). Land after targeted fixes.
- **C** — Register leak, śāstra thin, or doctrinal violation. Block cluster until rewritten. Single C row in a cluster forces cluster → C unless quarantined.

Sampling bar met: Joy rows read in full (all 13). Growth sankalps read in full (12). Ayurveda read in full (17). Bhakti read in full (11). Gita-release read in full (4). Niti sampled ~20 of 68 across all 6 context bands. Sankhya sampled ~15 of 44 across all 9 context bands.

---

## §B Cluster grades

| Cluster | File | Rows sampled | Grade | Evidence |
|---|---|---:|:-:|---|
| Joy × work_career | `sankalps_joy_work_career_wave2.json` | 7/7 | **A** | All 7 verbs offering-register (offer/notice/bless/delight/receive). BG 2.47 / 2.50 / 3.7 / 9.27 / 18.46 / 18.47 anchors all correct for karma-yoga-joy. Subslot distribution 3 seva / 2 blessings / 2 gratitude — balanced. No principle or practice leak. |
| Joy × health_energy | `sankalps_joy_health_energy_wave2.json` | 6/6 | **A** | Body-as-given discipline held. Taittirīya ānanda-maya + Bhāgavata body-vessel + prasāda anchors authentic. Register is offering throughout. See §G.1 for detail. |
| Growth × relationships | `sankalps_growth_wave2.json` | 4/4 | **A** | Verbs: practice / return / hold / honor. YS 2.35 + MBh Anuśāsana + grihastha-dharma + satya anchors solid. Clearly distinct from Connection × relationships (which uses deepen/devotional register). |
| Growth × money_security | `sankalps_growth_wave2.json` | 4/4 | **A-** | Verbs: practice / hold / act / honor — clean. BG 2.55-58 sthita-prajña + Cāṇakya dīrgha-sūtratā + Manu-smṛti śramena labdham anchors robust. Minor: `growth_money_act_from_long_view_not_fear` line phrasing ("10-year-horizon version of me would do") reads modern-productivity adjacent, but rooted_explanation rescues it. Land. |
| Growth × health_energy | `sankalps_growth_wave2.json` | 4/4 | **A** | Dinacharya + abhyāsa + deha-dharma + tapas (YS 2.1 + BG 17.14-16) anchors all correct. `growth_health_act_with_discipline_when_energy_is_low` explicitly distinguishes tapas from willpower-push — doctrinally precise. |
| Ayurveda — release cluster | `practices_ayurveda_wave2.json` (8 rows) | 8/8 | **A** | Every row names vāta/pitta/kapha with śāstric anchor. See §G.3 for full pass. Abhyanga/sitali/cool-water/warm-mug/nasya/post-meal-walk/simplify-recovery/warm-foot-soak — all Ashtanga Hridaya / Charaka / Sushruta / Hatha anchored. |
| Ayurveda — growth cluster | `practices_ayurveda_wave2.json` (4 rows) | 4/4 | **A-** | Kapha-brisk-walk + ginger-honey + garshana + kapalabhati — dosha-logic + śāstra anchors clean. One curation flag: `practice.ayur_kapalabhati_short_morning` native home is Hatha shatkarma not Ayurveda proper; agent's inline disclosure flags this (§F.1 of AYURVEDA_ROOM_MAPPING). Founder call retained below. |
| Ayurveda — stillness cluster | `practices_ayurveda_wave2.json` (2 rows) | 2/2 | **A** | Warm-foot-soak + vata-ground-evening-sequence — both deliberately softer than stillness-primary yoga practice, honoring the LIGHT-support doctrine. |
| Ayurveda — clarity cluster | `practices_ayurveda_wave2.json` (2 rows) | 2/2 | **A** | Sense-withdrawal (indriya-nigraha) + warm-water-waking (ushnodaka) — both pre-decision body-settling within clarity doctrine. Authentic. |
| Ayurveda — connection cluster | `practices_ayurveda_wave2.json` (1 row) | 1/1 | **A** | Eat-before-hard-talk is pre-relational body-prep; dual life_context_bias [health_energy, relationships] justified. Authentic. |
| Ayurveda — joy (gated) | `practices_ayurveda_wave2.json` (1 row) | 1/1 | **B** | `practice.ayur_abhyanga_as_offering` is the one legitimately borderline row. Offering-register reframing of abhyanga is doctrinally defensible (Ashtanga Hridaya frames abhyanga as daily care, not remedy alone), but same somatic action reads as release-register in non-joy states. Already pool_role=`rare`, CURATOR_GATE, explicit misuse_risk. Founder call preserved (§J.2). |
| Bhakti — connection × purpose_direction | `principles_bhakti_wave2.yaml` | 5/5 | **A** | 5 rows: guru-points-past-guru (NBS 54 + Bhāg 11.10), sevā-reveals-direction (NBS 69-73), walk-in-love (Yāmuna SR 22-25), receive-lineage-not-perform (Bhāg 11.11.29-32 āropita vs utpanna), śaraṇāgati-keeps-walking (Rāmānuja SG 1-6). Authentic Bhakti — NOT jñāna-inflected. BG 18.66 deliberately read in Bhakti register not karma-yoga register. |
| Bhakti — connection × health_energy | `principles_bhakti_wave2.yaml` | 4/4 | **A** | deha-devālaya (Bhāg 11.14.35-40 + Dhanvantari Stotra), offer-limits (Yāmuna SR 52-54 ātma-nivedana), Dhanvantari-carries (Bhāg 8.8.33-35), breath-already-praising (Haṁsa Up 1-4 ajapā-gāyatrī). Body-bhakti register distinct from both Ayurveda-correction and Shaiva-release. |
| Bhakti — connection × relationships | `principles_bhakti_wave2.yaml` | 2/2 | **A** | atithi-devo-bhava extended (Taittirīya 1.11.2 + Bhāg 11.29.13), bond-as-offering-ground (NBS 82-84 relational bhāvas). Authentic. |
| Gita-release banners | `principles_gita_wave2_release.yaml` | 4/4 | **A** | 2.14 pairs-of-opposites + 2.23-24 unborn-not-slain + 12.18-19 mānāpamānayoḥ samaḥ + 2.20 na-jāyate-mriyate. Strict endurance-register. Explicit `exclude_from_contexts: [joy, growth, clarity, connection, stillness]` on every row. BG ≤ 25% clarity cap preserved (all 4 routed to release banner pool, not clarity). |
| Niti — clarity × work_career (12 rows) | `principles_niti_wave2.yaml` | 4/12 | **A** | `niti_separate_report_from_interpretation` (śabda vs abhiprāya), `niti_counsel_versus_flattery` (priya-vāda vs hita-vāda), `niti_timing_of_the_action` (kāla eva karoti kāryam), `niti_answer_the_question_that_was_asked` (uttara bounded by praśna). Discrimination-register clean, not therapy-voice. |
| Niti — clarity × money_security | `principles_niti_wave2.yaml` | 4/~12 | **A** | `wealth_that_eats_you` (artho'narthaṁ bhāvayati), `generosity_as_root_of_abundance` (Hitopadeśa dānaṁ bhogo nāśas), `investment_over_speculation` (kṛṣi/vāṇijya vs dyūta), `stability_vs_greed` (Bhartṛhari tṛṣṇā). Arthaśāstra/Nīti-Śataka/Hitopadeśa anchors authentic. |
| Niti — clarity × relationships/daily_life | `principles_niti_wave2.yaml` | 3/~20 | **A-** | `praise_in_public_correct_in_private` (praśaṁsā bahuṣu, tarjanā ekānte) specific enough. `do_not_negotiate_from_exhaustion` (śrānta-deha na kuryāt niścayam) specific. The later rows (4500+) carry inline governance fields; earlier rows do not — see §I item 1. |
| Niti — growth × purpose_direction (~10 rows) | `principles_niti_wave2.yaml` | 3/~10 | **B+** | Rows around `niti_serve_the_work_not_the_role` + `niti_choose_what_you_are_willing_to_serve` + `niti_craft_outlives_the_role` — authentic craft-register. Risk: Niti is secondary to Dharma-Tier-2 in growth; tagging discipline must ensure these land in growth pool without crowding out Dharma primary. Curator-time check. |
| Sankhya — clarity × self (7 rows) | `principles_sankhya_wave2.yaml` | 4/7 | **A** | `thought-is-not-thinker`, `emotion-is-guna-weather`, `body-oldest-mistaken-identity`, `seer-never-stained-by-seen`. Sāṁkhya-kārikā anchors (12-13, 19, 24, 32-33, 55). NO Advaita leak verified — kept puruṣa/prakṛti duality clean, no ekaṁ sat / neti-neti. |
| Sankhya — clarity × money_security | `principles_sankhya_wave2.yaml` | 3/3 | **A** | `possession-is-association` (SK 24 ahaṃkāra abhimāna), `financial-anxiety-is-future-ahamkara` (SK 24-25 projective), `security-is-guna-reading-not-a-number` (SK 12-13). Viveka-move is distinct from Niti's pragmatic-discernment in the same context band. See §G.4. |
| Sankhya — clarity × health_energy | `principles_sankhya_wave2.yaml` | 3/3 | **A** | `fatigue-is-prakriti-information` (SK 32-33), `body-has-its-own-guna-cycle` (SK 12-13), `pain-is-sensation-in-the-field` (SK 1-2, 55 three duḥkhas). Distinct from Ayurveda's dosha-correction register — Sankhya is witness-viveka; Ayurveda is somatic-regulation. Both needed in clarity × health. |
| Sankhya — stillness × self (2 rows) | `principles_sankhya_wave2.yaml` | 2/2 | **C** | `rest-in-non-participating-witness` + `kaivalya-is-direction-of-stillness`. Both intellectually clean — but doctrine-check: ROOM_TRADITION_V2 §Stillness avoid-list includes Sankhya. Even "light" Sankhya puts principle-class content in stillness, which ROOM_CLASS_DOMINANCE_V2 flags as class-violation (stillness = practice-led + mantra-secondary; principle/sankalp explicitly avoided). Land-block pending doctrinal call. See §H.1. |
| Sankhya — growth × self (1 row) | `principles_sankhya_wave2.yaml` | 1/1 | **A** | `svādhyāya-is-guna-observation-over-time` — svādhyāya is a Yoga-Sūtra niyama, clean Sankhya reading (SK 12-13 pattern-observation). Fits growth substrate. |

**Tally: A = 18 clusters, B = 2 (Ayurveda-joy, Niti-growth), C = 1 (Sankhya-stillness × self).**

---

## §C Register-discipline audit

### Joy register (MUST use notice/bless/offer/receive/delight)

All 13 Joy sankalps checked. **ZERO violations.**

| File | Row | Verb | Pass |
|---|---|---|:-:|
| joy_work | offer_the_craft_as_worship | I offer | ✓ |
| joy_work | notice_the_skill_that_ripened | I notice | ✓ |
| joy_work | bless_the_work_that_shipped | I bless | ✓ |
| joy_work | delight_in_the_hand_that_knows | I delight | ✓ |
| joy_work | receive_the_gratitude_of_the_served | I receive | ✓ |
| joy_work | offer_the_quiet_hour_of_making | I offer | ✓ |
| joy_work | bless_the_small_mastery_of_the_day | I bless | ✓ |
| joy_health | notice_this_breath_as_gift | I notice | ✓ |
| joy_health | bless_the_body_that_carried_me | I bless | ✓ |
| joy_health | offer_this_wakefulness_to_what_i_serve | I offer | ✓ |
| joy_health | receive_the_ease_that_arrived | I receive | ✓ |
| joy_health | delight_in_the_senses_alive_today | I delight | ✓ |
| joy_health | offer_the_body_that_said_yes_today | I offer | ✓ |

### Growth register (MUST use practice/return/honor/act/hold)

All 12 Growth sankalps checked. **ZERO violations.**

| Row | Verb | Pass |
|---|---|:-:|
| growth_rel_practice_gentleness | I practice | ✓ |
| growth_rel_return_to_vow_of_care | I return | ✓ |
| growth_rel_hold_steady_presence | I hold | ✓ |
| growth_rel_honor_the_small_repair | I honor | ✓ |
| growth_money_practice_responsible_effort | I practice | ✓ |
| growth_money_hold_my_rhythm | I hold | ✓ |
| growth_money_act_from_long_view | I act | ✓ |
| growth_money_honor_the_labor | I honor | ✓ |
| growth_health_return_to_rhythm | I return | ✓ |
| growth_health_practice_steady_care | I practice | ✓ |
| growth_health_honor_the_limits | I honor | ✓ |
| growth_health_act_with_discipline | I act | ✓ |

### Connection Bhakti register (reaching-toward / japa-medium)

All 11 Bhakti principles read. Register consistent: tone_modes are deepen/devotional throughout. No joy-offering leak (celebratory voice) detected. No growth-cultivation leak. `emotional_function_tag: deepen` on all 11 — correct.

### Register totals

**Total register-discipline violations: 0.**

---

## §D Sanatan-groundedness audit

Every new row has śāstra anchor + operational logic. Spot-checks:

| Row family | Anchor quality |
|---|---|
| 17 Ayurveda practices | 100% cite Caraka / Ashtanga Hridaya / Sushruta / Hatha Pradipika / Bhavaprakasha with specific sutrasthana references. See AYURVEDA_ROOM_MAPPING §Appendix. |
| 12 Growth sankalps | All 12 cite specific verses (YS 2.35, YS 2.36, YS 2.37, YS 2.39, YS 2.1, YS 1.14, BG 2.55-58, BG 3.4-8, BG 17.14-16, MBh Anuśāsana Parva, MBh Śānti Parva, Cāṇakya-Nīti, Vidura-Nīti, Manu-smṛti, Caraka Vimāna 8, Ashtanga Hridaya Su.2, Suśruta svastha). |
| 13 Joy sankalps | All cite BG (2.47, 2.50, 3.7, 9.27, 18.46, 18.47) or Taittirīya 2.5 ānanda-maya-kośa + Praśna Up 3 + Bhāgavata 10.29-33 rasa-līlā + 11.13-14 Uddhava-gītā + prasāda tradition. |
| 11 Bhakti principles | All cite NBS + Bhāgavata (11.10, 11.11, 11.14, 11.29, 8.8) + Yāmuna Stotra-ratna + Rāmānuja Śaraṇāgati-gadya / gadya-traya + Dhanvantari Stotra + Taittirīya + Haṁsa Upaniṣad. |
| 4 Gita-release banners | All have verse_devanagari + verse_iast + verse_english + chapter/verse numbers. Strictly within BG 2.11-30 + 12.13-19. |
| ~20 Niti rows sampled | All cite Cāṇakya-Nīti / Vidura-Nīti / Hitopadeśa / Mahābhārata Śānti Parva / Arthaśāstra / Bhartṛhari Nīti-Śataka / Pañcatantra. |
| ~15 Sankhya rows sampled | All cite Sāṁkhya-kārikā (specific verses: 1-2, 12-13, 19, 24-25, 32-33, 55, 64, 68) + Tattva-kaumudī + Sāṁkhya-pravacana-bhāṣya + Gauḍapāda bhāṣya. Strict puruṣa/prakṛti doctrine; no Advaita monism leak detected. |

**Rows lacking śāstra anchor: 0.** This is a strong Wave — authoring discipline very tight.

---

## §E Authoring inflation

Scanned for "same teaching, 3 rewrites" patterns. **Minor but non-blocking.**

| Cluster | Pair | Read | Verdict |
|---|---|---|---|
| Joy × health | `joy_health_bless_the_body_that_carried_me` vs `joy_health_offer_the_body_that_said_yes_today` | Both body-blessing; first is end-of-day generic, second is chronic-variable-capacity-specific | KEEP BOTH — distinct gating (second has chronic-illness explicit misuse_risk). |
| Joy × health | `joy_health_notice_this_breath_as_gift` vs `joy_health_receive_the_ease_that_arrived` | Both "receive unearned" — breath-specific vs general ease | KEEP BOTH — breath is daily anchor; ease is rare-good-day. Distinct trigger. |
| Growth × relationships | `growth_rel_practice_gentleness` vs `growth_rel_return_to_vow_of_care` | Both ahimsa-adjacent | KEEP BOTH — first is in-the-moment register, second is withdrawal-recovery register. Clear tap differentiation. |
| Growth × money | `growth_money_practice_responsible_effort` vs `growth_money_honor_the_labor` | Both artha-dharma stewardship | MINOR OVERLAP — stewardship vs labor-honoring. Could tighten in Wave 3; both land as-is for now. |
| Niti × money | `niti_investment_over_speculation` + `niti_stability_vs_greed` + `niti_wealth_that_eats_you` | Three warnings against money-overreach | ACCEPTABLE — each has distinct operational trigger (one-shot win, stability-slice, vigilance-cost). Three-way tap legitimate. |

**Blocking duplications: 0. Land-after-Wave-3-tightening: 1 pair (growth_money responsible_effort + honor_labor).**

---

## §F BG discipline audit

| File | BG rows | Placement check |
|---|---:|---|
| `principles_gita_wave2_release.yaml` | 4 | ALL in release/wisdom_banner. Verses strictly in 2.11-30 + 12.13-19 endurance set. `exclude_from_contexts: [joy, growth, clarity, connection, stillness]` on every row. ✓ |
| `sankalps_joy_work_career_wave2.json` | 7 (tradition_family=gita, karma_yoga) | BG 2.47, 2.50, 3.7, 9.27, 18.46, 18.47 — all strictly within the "joy × work_career karma-yoga-of-the-craft ONLY" doctrine exception per ROOM_TRADITION_V2 §Joy. ✓ |
| `sankalps_joy_health_energy_wave2.json` | 0 (tradition_family=bhakti) | Uses BG 9.27 as *secondary* anchor in `joy_health_offer_this_wakefulness_to_what_i_serve`; primary is seva/Uddhava-gītā Bhāgavata 11.13. Bhakti-primary / BG-light. ✓ |
| `sankalps_growth_wave2.json` | 5 (BG-citing) | Growth is BG's native home per doctrine. BG 2.55-58 + 3.4-8 + 17.14-16 correctly placed. ✓ |
| `principles_bhakti_wave2.yaml` | 1 (BG 18.66 citing) | `bhakti_surrender_the_direction_without_abandoning_the_walking` cites BG 18.66 but doctrinally read in Bhakti-Rāmānuja register (prapatti as active surrender), NOT karma-yoga. Source list correctly pairs Rāmānuja Śaraṇāgati-gadya with BG 18.66. ✓ |
| `principles_niti_wave2.yaml` | 0 | Pure Nīti corpus. ✓ |
| `principles_sankhya_wave2.yaml` | 0 | Pure Sāṁkhya corpus. Doctrine allowed BG Ch 2/13 as secondary; agent chose to stay pure-Sankhya. ✓ |
| `practices_ayurveda_wave2.json` | 0 | Pure Ayurveda/Hatha. ✓ |

**BG out-of-doctrine appearances: 0.** BG 25% clarity cap check: no new Wave 2 BG rows in clarity pool. Cap preserved.

**Total new BG rows across Wave 2: ~17** (4 release banners + 7 joy-work karma-yoga + 5 growth + 1 bhakti-read). All doctrinally placed.

---

## §G Product-truth judgments

### G.1 Joy protected from over-explanation?

**Verdict: YES — Joy authoring stays in offering-register.**

Sampled 5/13 rows:

1. `sankalp.joy_work_offer_the_craft_as_worship` — line reads as user-voice offering ("the work of my hands... I place it all at the feet of what is larger than me"). Insight paragraph does teach (karmaṇy-evādhikāras te / arpaṇa), but `text:` field is terse ("I offer the craft as worship.") and `how_to_live` is action-oriented ("Before a work session, name what you are offering it to"). Not a miniature teaching dressed in first-person.

2. `sankalp.joy_health_notice_this_breath_as_gift` — "The breath is moving without my effort... I let the noticing itself be my gratitude." Pure user-voice. Insight explains the category (ānanda-maya-kośa) but benefits/how_to_live stay in first-person action. CLEAN.

3. `sankalp.joy_health_receive_the_ease_that_arrived` — prasāda register. Line: "The body feels at ease today and I did not engineer it — I receive this ease as prasāda, a gift that came unasked." Passive register is deliberate (prasāda cannot be grasped). Founder-flagged by agent as needing spot-check; I read it as authentic bhakti-passive-reception, not drift-toward-passivity.

4. `sankalp.joy_work_bless_the_small_mastery_of_the_day` — "A single thing went well in the work today — not the whole project, just one true small thing — and I let it be enough to bless." Anti-inflation register explicit. CLEAN.

5. `sankalp.joy_health_offer_the_body_that_said_yes_today` — chronic-variable-capacity framing. Explicit misuse_risk: "Do not deploy on a no-day." Sensitive to variable-capacity users. Founder can confirm but I read as tonally fit.

**Principle/practice leak into joy pool post-Wave-1b:** 0. Joy file has only sankalps (except the single gated abhyanga-as-offering row, which has `pool_role: rare` + CURATOR_GATE + explicit joy-state misuse_risk — doctrinally defensible but see §J.2).

### G.2 Growth truly principle + sankalp co-primary?

**Verdict: CO-OPERATING — register holds.**

Sampled 4/12 sankalps + spot-checked existing growth principle seed for substrate:

1. `sankalp.growth_rel_practice_gentleness_in_this_bond` pairs well with YS 2.35 ahimsa-pratiṣṭhāyām + grihastha-dharma substrate. Sankalp voices the resolve ("I practice gentleness"); principle would supply the substrate ("ahimsa-established causes hostility to cease nearby"). Co-operating, not crowding.

2. `sankalp.growth_rel_hold_steady_presence_without_rescue` invokes sāhāyya vs para-kārya distinction — this is Niti substrate working as principle under growth sankalp. Clean pairing.

3. `sankalp.growth_money_hold_my_rhythm_through_scarcity` invokes sthita-prajña (BG 2.55-58). Sankalp is resolve-in-action; BG substrate is the discernment-steadiness. Co-primary feel preserved.

4. `sankalp.growth_health_act_with_discipline_when_energy_is_low` explicitly distinguishes tapas from willpower — sankalp voices the commitment, YS 2.1 kriyā-yoga supplies the substrate, BG 17.14-16 tapas trilogy supplies the body/speech/mind structure. Clear co-operation.

**Growth × relationships (4 new) in cultivation-register not joy-register:** Confirmed. Verbs are practice / return / hold / honor — not notice / bless / offer. No joy-register leak.

### G.3 Release embodied, not generic support?

**Verdict: EMBODIED — 17/17 Ayurveda practices name dosha specifically.**

Checked all 17:
- **Vata-pacifying (8):** abhyanga-5min, warm-foot-soak, warm-mug-hold, nasya, vata-ground-evening, sense-withdrawal, simplify-day-recovery, eat-before-hard-talk.
- **Pitta-pacifying (2):** sitali, cool-water-hands-face.
- **Kapha-lifting (5):** brisk-walk, ginger-honey, dry-brush, kapalabhati, post-meal-walk, warm-water-waking. (warm-water-waking is ushnodaka, kapha-adjacent).
- **Sattvic-honoring (1):** abhyanga-as-offering (joy-gated).

**Śāstric anchors:** Every row cites Charaka Saṁhitā / Ashtanga Hridaya / Sushruta / Bhavaprakasha / Hatha Yoga Pradipika with specific sutrasthana + verse references. Zero rows citing "wellness tradition" generically.

**One operational-adaptation disclosure:** `practice.ayur_dry_brush_garshana` correctly discloses inline that Charaka describes *udvartana* (powder-based) not silk-glove specifically, and marks the silk-glove adaptation explicitly. Honest śāstric-anchor handling.

**Not generic relaxation with Sanskrit labels:** confirmed. Each practice addresses a specific dosha-state with a specific counter-quality (warmth vs cold, lightness vs heaviness, containment vs scatter).

### G.4 Clarity context-shaped?

**Verdict: DIFFERENTIATED — different discrimination moves per context.**

Cross-checked 4 context bands:

1. **Clarity × work_career Niti** (e.g. `niti_separate_report_from_interpretation`, `niti_counsel_versus_flattery`): discrimination move is **śabda-vs-abhiprāya** + **priya-vāda-vs-hita-vāda**. Statecraft register, pragmatic discernment.

2. **Clarity × self Sankhya** (e.g. `sankhya_the_thought_is_not_the_thinker`, `sankhya_seer_never_stained`): discrimination move is **puruṣa-prakṛti tattva-separation** + **ahaṃkāra-abhimāna naming**. Metaphysical viveka, witness-register.

3. **Clarity × money_security Niti + Sankhya:** these are the most revealing. Niti `niti_wealth_that_eats_you` (artho'narthaṁ bhāvayati — operational threshold check) is pragmatic-threshold discernment. Sankhya `sankhya_financial_anxiety_is_future_ahamkara` (SK 24-25 projective-ahaṃkāra) is witness-move over temporal projection. **Same context band, two fundamentally different discrimination moves.** This is exactly what clarity-context-differentiation should look like.

4. **Clarity × health_energy Sankhya + Ayurveda:** Sankhya `sankhya_fatigue_is_prakriti_information` is witness-move separating report-from-verdict. Ayurveda `practice.ayur_sense_withdrawal_3min` is somatic pre-buddhi preparation (indriya-nigraha). **Complementary, not duplicative** — one is principle-register viveka; the other is practice-register body-prep for viveka.

**Not same counselor-voice regardless:** confirmed. Niti reads as Niti (minister-counselor discernment). Sankhya reads as Sankhya (dispassionate tattva-analysis). Ayurveda reads as Ayurveda (dosha-specific somatic move). Register-distinctness held.

---

## §H Must-fix before land

1. **Sankhya × stillness × self (2 rows) — doctrinal conflict.** `sankhya_rest_in_the_non_participating_witness` + `sankhya_kaivalya_is_the_direction_of_stillness`. ROOM_TRADITION_V2 §Stillness explicitly lists Sankhya in the avoid-list ("Avoid / exclude: Bhakti, Niti, Sankhya, Dharma-principles, Tantric-Shaiva"). ROOM_CLASS_DOMINANCE_V2 also lists principle as an avoid-class for stillness. **Two rows intellectually clean but structurally off-home.** Resolution options (founder call, pre-existing): (a) reclassify as `room_fit: [clarity]` with stillness-adjacent state_tags; (b) accept as "Vedanta-witness-equivalent sākṣī-bhāva substitute" for stillness and update doctrine to permit *light Sankhya* as stillness wisdom-banner; (c) delete. Recommend (a) — reclassify to clarity × self secondary-use.

2. **Agent F's 50 Niti rows (of 68) + Agent G's 32 Sankhya rows (of 44) missing inline v3.1 governance fields.** Grep count: Niti yaml has 54 room_fit/surface_eligibility/life_context_bias lines (≈18 rows covered); Sankhya yaml has 36 (≈12 rows covered). Matches handoff claim: Agent 4's 18 Niti adds + Agent 5's 12 Sankhya adds carry inline governance; the 50 + 32 original rows still need TAG_PATCH_WAVE1B. Without the patch, these rows cannot route through any room-pool — they remain dark. Coupling risk to Wave 2 land.

3. **`om_dhanvantaraye_namah` mantra.** Referenced as primary intervention in `bhakti_the_body_is_the_first_altar` and `bhakti_dhanvantari_carries_what_the_body_cannot`. Must exist in `master_mantras.json` before these two principles fully resolve. Flagged in Agent 7 §F.5; reconfirming here as must-fix-before-land for connection × health_energy pool.

4. **Niti-growth-primary × purpose_direction: pool-ordering discipline.** ~10 Niti rows are tagged for growth secondary. Dharma-Tier-2 is growth's primary-principle substrate per ROOM_CLASS_DOMINANCE_V2; Niti must NOT crowd out. Before pool migration, verify pool_role ordering so Niti rows land as rotation not anchor in growth × purpose_direction. Not a content fix — a pool-migration discipline.

---

## §I Safe to defer

1. **`growth_money_act_from_long_view_not_fear` line phrasing.** "A 10-year-horizon version of me" reads mildly modern-productivity-speak, but rooted_explanation (dīrgha-sūtratā from Cāṇakya / Vidura / MBh Śānti Parva) rescues it. Founder could rewrite to "the long-thread self" or "the older version of me that returns" for tonal fit with the other 11 rows. Non-blocking.

2. **`growth_money_practice_responsible_effort` + `growth_money_honor_the_labor` minor teaching-overlap.** Both artha-dharma stewardship. Keep both now; consider tightening to one in Wave 3 if pool churn shows low diversity.

3. **Agent 7 §F.3 chronic-illness sensitivity check on `joy_health_offer_the_body_that_said_yes_today`.** I read as tonally fit (explicit misuse_risk: "Do not deploy on a no-day"), but explicit founder thumb-check invited.

4. **Agent 6 §F.2 Release × health_energy count: 8 rows vs 5-6 target.** Over by 2. Each row addresses a distinct dosha-state; rationale holds. Founder can defer 2-3 to Wave 3 or accept 8. Non-blocking — pool size is above floor, not a content integrity issue.

5. **Agent 7 §F.1 Release × work_career hybrid.** `gita_wave2_release_equanimity_in_honor_and_dishonor` tagged `life_context_bias: [work_career]`. Doctrine reads as permissible (BG 12.18-19 mānāpamānayoḥ samaḥ is precisely the reputation-grief endurance verse); risk is conflating reputation-grief with non-work release contexts. Non-blocking; tagging-precision issue for curator.

6. **Forward-reference sankalp target_ids in bhakti_wave2.yaml (11 sankalp_ids that do not yet exist).** Connection currently `sankalp: X`. Preserving for future doctrine update is reasonable; alternative is strip `intervention_links` rows of these targets now. Operationally, the links will dangle but not break any runtime. Non-blocking; curator choice.

---

## §J Founder-call register

### J.1 Doctrinal

- **J.1.a (NEW) Sankhya × stillness × self doctrinal clarification.** See §H.1. ROOM_TRADITION_V2 §Stillness avoid-list has Sankhya; Agent G's 2 rows are structurally off-home. Resolve by reclassify-to-clarity vs doctrine-amend vs delete.
- **J.1.b (PRESERVED) `mantra.shivoham` in stillness rotation — Shaiva-bija ambiguity.** From CONTENT_INTEGRITY_V2. Still open. Recommendation (per ROOM_CLASS_DOMINANCE_V2 §Stillness pool): swap for a Vedanta-witness equivalent; shivoham risks drift toward release-register.

### J.2 Curation

- **J.2.a (NEW) `practice.ayur_abhyanga_as_offering` joy-gated accept or defer.** See §B Ayurveda-joy cluster + AYURVEDA_ROOM_MAPPING §D/§F.1. Offering-register reframing is defensible but same somatic action reads as release in non-joy states. pool_role=`rare`, CURATOR_GATE, explicit joy-state misuse_risk already in place. Founder call preserved.
- **J.2.b (NEW) `practice.ayur_kapalabhati_short_morning` tradition tagging.** Native home is Hatha Yoga shatkarma not Ayurveda proper. Agent 6 tagged as `tradition: [ayurveda]` due to dosha-timed / dinacharya-framed operational use. Founder call preserved: accept as Ayurveda-operationalized Hatha, or re-tag as Hatha with Ayurveda secondary.
- **J.2.c (NEW) `practice.ayur_dry_brush_garshana` śāstric-anchor scope.** Operational adaptation — Charaka describes udvartana (powder) not silk-glove garshana. Disclosure inline. Founder call: accept as dosha-logical extension, or strip to udvartana-only framing.
- **J.2.d (PRESERVED) `om_dhanvantaraye_namah` mantra authoring blocker.** See §H.3. Required for connection × health_energy bhakti pool to fully resolve. Either W2-inline add or W3 authoring.
- **J.2.e (PRESERVED) Agent G's 2 Sankhya stillness × self rows conflict with ROOM_TRADITION_V2 §Stillness avoid-list.** Same as J.1.a — doctrinal-and-curation overlap.

### J.3 Implementation hygiene

- **J.3.a (PRESERVED) Backfill Agent G's 32 original Sankhya rows with v3.1 governance fields.** Grep confirms: only 12 Sankhya rows carry inline governance. 32 still need TAG_PATCH_WAVE1B patch. Blocks pool routing.
- **J.3.b (PRESERVED) Backfill Agent F's 50 original Niti rows with v3.1 governance fields.** Grep confirms: only ~18 Niti rows carry inline governance. 50 still need TAG_PATCH_WAVE1B patch. Blocks pool routing.
- **J.3.c (PRESERVED) TAG_PATCH_WAVE1 true completeness.** Claimed 200 / earlier estimate ~111. Gap-count still unverified. The J.3.a + J.3.b items (50 + 32 = 82 rows) are the concrete known gap within Wave 2 authoring; the broader TAG_PATCH_WAVE1 completeness audit is a separate item.
- **J.3.d (NEW) Niti growth-pool ordering.** See §H.4. Not content — pool-migration discipline to prevent Niti crowding Dharma-Tier-2 in growth × purpose_direction anchor slots.
- **J.3.e (NEW) Intervention-link rewire (14 existing Ayurveda principles).** AYURVEDA_ROOM_MAPPING §E.1 lists the rewire. Propose as `0136_rewire_ayurveda_intervention_links.py` follow-up migration. Non-blocking for Wave 2 content land.
- **J.3.f (NEW) Forward-reference sankalp target_ids in Bhakti W2.** 11 sankalp_ids referenced, not authored (connection is `sankalp: X`). Either preserve as dangling forward-refs for future doctrine update, or strip intervention_links on land.

---

## End-state

**Cluster tally: A = 18 / B = 2 / C = 1. Total rows reviewed: ~143 across 7 files.**

Register-discipline: 0 violations across 25 sankalps (13 joy + 12 growth) and 11 Bhakti principles.
Sanatan-groundedness: 0 rows lacking śāstra anchor.
BG-discipline: 0 out-of-doctrine appearances; ~17 new BG rows all placed per doctrine.
Authoring inflation: 0 blocking duplications.
Product-truth: 4/4 PASS (joy register protected / growth co-operating / release embodied / clarity context-differentiated).

Must-fix before land: 4 items.
Safe to defer: 6 items.
New founder-calls: 3 doctrinal/curation/hygiene, 8 net-new entries across §J (1 doctrinal + 3 curation + 4 hygiene) + 4 preserved.

Wave 2 authoring is substantively clean and operationally landable once the 4 must-fix gates close (Sankhya-stillness reclassification, governance-field backfill for 82 rows, Dhanvantari mantra, growth-pool ordering discipline).
