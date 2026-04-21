# Content Integrity Audit V1 — 2026-04-20
Agent: Sovereignty / Content Integrity Agent
Scope source: ROOM_SYSTEM_STRATEGY_V1.md §11.4

## Scope

- Pool migrations read: `0120_seed_room_pools_v1.py`, `0124_seed_step_and_inquiry_pools.py`, `0125_seed_carry_pools.py`.
- Master rows audited (en locale unless noted):
  - Mantras: 29 unique `item_id`s (room_stillness 4, room_connection 5, room_release 4, room_clarity 6, room_growth 5, room_joy 6; overlap `soham` in stillness+connection is 1 of the 29).
  - Practices: 22 unique `item_id`s across stillness/connection/release/clarity/growth pools.
  - Sankalps: 19 unique `item_id`s across room_joy sankalp_gratitude / sankalp_blessings / sankalp_seva.
  - WisdomAssets (principles/banners/teachings/reflection): 31 unique `asset_id`s across clarity/growth principle + all rooms wisdom_banner + clarity/growth wisdom_teaching + growth wisdom_reflection + release wisdom_banner + stillness wisdom_banner + connection wisdom_banner + joy wisdom_banner.
  - Carry labels: 8 items (authored chip labels, not tradition-sourced; integrity-checked for semantic fit only).
  - Step templates referenced: 11 unique `template_id`s (action chips, not tradition-sourced; out of scope for tradition fidelity).
  - Inquiry moment anchors: `M_clarity_inquiry_seeds`, `M_growth_inquiry_seeds` (spot-checked header policy — clean).
- **Total item rows audited for content fidelity: ~80 distinct content rows.**
- Traditions referenced: Gītā (Bhagavad Gita), Yoga Sūtras, Saṅkhya, Brihadaranyaka Upanishad, Maṇḍūkya Upanishad, Nirvana Upanishad, Rigveda (7.59.12, 3.62.10), Nīti, Dharma, Bhakti (Vaiṣṇava, Śākta, Smārta, Śaiva), Pavamana (Vedic purification), Hatha Yoga Pradipika (Yogic pranayama), Patanjali Yoga Sutras (dhyāna/dhāraṇā), Śaiva Siddhānta, Kali Santarana Upanishad, generic Sanatan Dharma practice.

## Findings

### F1 — `mantra.pavamana_asato_ma` mis-attributes Pavamana mantra to Saraswati [FIX_TAG]
- **item_id**: `mantra.pavamana_asato_ma`
- **room / slot**: room_clarity / mantra (rotation)
- **issue**: The Pavamana mantra "asato mā sadgamaya..." is from Brihadaranyaka Upanishad 1.3.28. It is a Vedic purification (pavamana) prayer to Brahman / Divine Reality, addressed to no personal deity. The row lists `deity: Saraswati`, which contaminates the Vedantic sovereignty of the verse. Saraswati is a Śākta/post-Vedic iṣṭa-devatā; this mantra precedes that framing.
- **source file**: `core/data_seed/master_mantras.json` (id `mantra.pavamana_asato_ma`, locale=en), also present in `core/data_seed/mitra_v3/library_catalog_mantras.csv:row deity column`.
- **current content**: `deity: "Saraswati"`, `source: "Brihadaranyaka Upanishad (1.3.28)"`, iast `asato mā sadgamaya tamaso mā jyotirgamaya mṛtyormā amṛtaṃ gamaya`.
- **correct content / proposed fix**: `deity: "Universal"` (or `"Brahman"`). Keep `source` as-is. Consider also setting `tradition: ["vedic", "upanishad"]` (currently the row is served in clarity pool — clarity tradition mix is fine). Note: the companion row `mantra.asato_ma` already has `deity: Universal` for the same verse — that confirms the correct attribution.
- **tradition**: cited tradition fine (Upanishadic); deity field wrong.
- **founder escalation**: **yes** — misattributing an Upanishadic Vedic purification mantra to a specific post-Vedic iṣṭa-devatā is a tradition-integrity breach, not a typo.

### F2 — `mantra.vedanta_om_tat_sat` mis-attributes Gītā declaration to Saraswati [FIX_TAG]
- **item_id**: `mantra.vedanta_om_tat_sat`
- **room / slot**: room_growth / mantra (anchor)
- **issue**: `Oṃ Tat Sat` is declared in Bhagavad Gītā 17.23 by Krishna as the triple designation of Brahman. Attributing it to `deity: Saraswati` is doubly wrong — the verse is from Krishna's discourse, and the designation is of Brahman/Ultimate Reality, not a specific deity. The `meaning` field compounds this by saying "From the Bhagavad Gita, this mantra affirms the eternal truth... connecting the chanter to divine reality" — which contradicts the deity field.
- **source file**: `core/data_seed/master_mantras.json` (id `mantra.vedanta_om_tat_sat`, locale=en); same deity error replicated in `core/data_seed/mitra_v3/library_catalog_mantras.csv`.
- **current content**: `deity: "Saraswati"`, `source: "Bhagavad Gita (17.23)"`.
- **correct content / proposed fix**: `deity: "Krishna"` OR `deity: "Universal (Brahman)"`. Note: this is the **anchor** for room_growth — the mis-attribution is the most visible of all mantra rows since anchor is rendered first.
- **tradition**: cited tradition fine; deity field wrong.
- **founder escalation**: **yes** — room_growth anchor must not contradict its own source_text. High-visibility error.

### F3 — `mantra.krishna_govinda_joy` and `mantra.krishna_govinda_gratitude` are duplicate slugs for the same verse + missing en locale [REWRITE or RETIRE]
- **item_id**: `mantra.krishna_govinda_joy`, `mantra.krishna_govinda_gratitude`
- **room / slot**: room_joy / mantra (rotation, both refs)
- **issue**: Both rows carry identical sanskrit / iast / title: `गोविन्द जय जय गोपाल जय जय` / `govinda jaya jaya gopāla jaya jaya`. They exist ONLY in `locale=gu` — there is **no English master row for either id**. Room render for en users will mis-resolve or fall back. And the semantic split ("joy" vs "gratitude") is authored only via intent tags, not content.
- **source file**: `core/data_seed/master_mantras.json` (both ids, single row each, locale=gu only).
- **current content**: two distinct `item_id`s pointing to the same Vaiṣṇava kīrtana line; neither has an English row.
- **correct content / proposed fix**: EITHER (a) **RETIRE one of the two** (keep `mantra.krishna_govinda_joy` as the canonical, drop `mantra.krishna_govinda_gratitude` from the room_joy rotation AND collapse the master row); OR (b) **REWRITE as two genuinely distinct Govinda kīrtanas** (different verses for joy-framing vs gratitude-framing), and backfill en/hi locales before relying on them in the pool. Either way, **backfill en locale is non-negotiable** — pool currently references two en-missing rows.
- **tradition**: correct (Vaiṣṇava bhakti).
- **founder escalation**: **yes** — not for tradition distortion (the verse is correct) but because the duplicate-id pattern will cause selector to serve the same content under two rotation slots, and because a pool is referencing en-missing rows.

### F4 — `mantra.ganesha_om_gam_clarity` and `mantra.ganesha_om_gam_new_direction` are duplicate slugs [RETIRE one]
- **item_id**: `mantra.ganesha_om_gam_new_direction` (duplicate of `mantra.ganesha_om_gam_clarity`)
- **room / slot**: room_clarity / mantra (both are rotation entries)
- **issue**: Both are the same mantra `ॐ गं गणपतये नमः` / `oṃ gaṃ gaṇapataye namaḥ`, same deity (Ganesha), same Smārta tradition. They appear back-to-back in the room_clarity mantra rotation list. `mantra.ganesha_om_gam_new_direction` has no English row — only `gu`.
- **source file**: `core/data_seed/master_mantras.json`; rotation reference: `0120_seed_room_pools_v1.py:144-146` (room_clarity mantra rotation).
- **current content**: identical sanskrit + iast + title + deity for both ids.
- **correct content / proposed fix**: **RETIRE `mantra.ganesha_om_gam_new_direction` from the room_clarity rotation** and (separately) from the master_mantras seed. Keep `mantra.ganesha_om_gam_clarity` as the single canonical id. This removes an identical rotation candidate that would statistically double-serve the Ganesha mantra versus other clarity mantras.
- **tradition**: correct.
- **founder escalation**: no — this is a dedup, not a tradition error.

### F5 — `mantra.maha_mrityunjaya` and `mantra.shiva_maha_mrityunjaya` are duplicate verses [RETIRE one]
- **item_id**: `mantra.shiva_maha_mrityunjaya` (duplicate of `mantra.maha_mrityunjaya`)
- **room / slot**: room_release / mantra (anchor = `maha_mrityunjaya`, rotation = `shiva_maha_mrityunjaya`)
- **issue**: Identical verse (Rigveda 7.59.12, `oṃ tryambakaṃ yajāmahe...`). The curator pool deliberately includes both — anchor + rotation — so the user sees the **same verse twice** in the release pool of 4. This erodes the "slow rotation" design intent noted in the curator_note for release.
- **source file**: `core/data_seed/master_mantras.json` (both ids, both locale=en).
- **current content**: identical sanskrit; `mantra.shiva_maha_mrityunjaya` has a longer "meaning" field, `mantra.maha_mrityunjaya` has shorter.
- **correct content / proposed fix**: **RETIRE `mantra.shiva_maha_mrityunjaya` from the room_release rotation** (replace with a genuinely different Shiva release mantra, or shrink the pool from 4 to 3). Keep `mantra.maha_mrityunjaya` as the anchor. Leaving both in the pool violates the non-duplication intent of the rotation design.
- **tradition**: correct (Vedic/Śaiva).
- **founder escalation**: no — this is a pool dedup fix.

### F6 — `mantra.emotional_healing.vasudevaya` duplicates `mantra.om_namo_bhagavate_vasudevaya` in the same room [RETIRE or REWRITE]
- **item_id**: `mantra.emotional_healing.vasudevaya`
- **room / slot**: room_connection / mantra (rotation, alongside anchor `mantra.om_namo_bhagavate_vasudevaya`)
- **issue**: Identical mantra `ॐ नमो भगवते वासुदेवाय` in both rows (anchor AND rotation) of the same pool. Only the `meaning` differs (emotional-healing framing vs. universal-protection framing). That means the room_connection mantra pool of 5 effectively contains the **same Vasudevaya verse twice**, plus `hare_krishna` and `krishna_hare_krishna` (see F7), plus `soham` — giving minimal actual diversity.
- **source file**: `core/data_seed/master_mantras.json`; pool ref `0120_seed_room_pools_v1.py:74-82`.
- **current content**: identical sanskrit.
- **correct content / proposed fix**: **RETIRE `mantra.emotional_healing.vasudevaya` from the rotation** (it's a framing-duplicate of the anchor), OR keep it but document that it serves as an alternate-meaning wrapper for the same verse and surface that intent in the pool curator_note. Preferred fix: remove the rotation ref.
- **tradition**: correct (Vaiṣṇava).
- **founder escalation**: no — pool dedup.

### F7 — `mantra.hare_krishna` and `mantra.krishna_hare_krishna` are duplicate Maha Mantras in the same room [RETIRE one]
- **item_id**: `mantra.krishna_hare_krishna` (or `mantra.hare_krishna`)
- **room / slot**: room_connection / mantra (both in rotation)
- **issue**: Both rows contain the exact Hare Kṛṣṇa Mahāmantra — 16 names, identical sequence `hare kṛṣṇa hare kṛṣṇa kṛṣṇa kṛṣṇa hare hare / hare rāma hare rāma rāma rāma hare hare`. Only IAST casing and title format differ. In the same rotation, this is a double-serve.
- **source file**: `core/data_seed/master_mantras.json` (both en).
- **current content**: identical devanagari verse; one titled "Hare Krishna Maha Mantra", the other titled with the full IAST sequence.
- **correct content / proposed fix**: **RETIRE `mantra.krishna_hare_krishna` from the room_connection rotation** (and consider dropping the duplicate master row entirely — keep `mantra.hare_krishna` as canonical, since the title is cleaner and the source attribution cites Kali Santarana Upanishad).
- **tradition**: correct (Vaiṣṇava bhakti).
- **founder escalation**: no — dedup.

### F8 — `mantra.gayatri_om_tat_savitur` is a truncated partial Gayatri, not a "shorter form" [REWRITE meaning]
- **item_id**: `mantra.gayatri_om_tat_savitur`
- **room / slot**: room_growth / mantra (rotation alongside full `mantra.gayatri`)
- **issue**: The row's `devanagari` is only `ॐ तत्सवितुर्वरेण्यं` — i.e., Rigveda 3.62.10 line 2, roughly one-third of the Gayatri. The `meaning` calls this "a shorter form of the Gayatri Mantra" which is **tradition-incorrect**: the Gayatri is a triṣṭubh with a specific 24-syllable vyāhṛti + verse structure; truncating the vyāhṛtis and the latter two padas produces an incomplete utterance, not a "shorter Gayatri." Chanting just this line is not a recognized alternate form in any sampradāya.
- **source file**: `core/data_seed/master_mantras.json` (id `mantra.gayatri_om_tat_savitur`, locale=en); source cites Rig Veda 3.62.10.
- **current content**: devanagari `ॐ तत्सवितुर्वरेण्यं`; meaning "A shorter form of the Gayatri Mantra, it invokes divine wisdom and light..."
- **correct content / proposed fix**: EITHER (a) **RETIRE this row** and drop from the room_growth rotation (full `mantra.gayatri` already anchors); OR (b) **REWRITE**: expand `devanagari` + `iast` to the full Gayatri verse, and update the meaning to not claim it is a "shorter form." Preferred: retire (the full Gayatri is already in the pool).
- **tradition**: Vedic (correct); framing wrong.
- **founder escalation**: **yes** — publicly naming a truncated line as "the Gayatri mantra" is a tradition-fidelity violation that devoted users will catch.

### F9 — `mantra.gayatri` has empty `source` field [FIX_TAG]
- **item_id**: `mantra.gayatri`
- **room / slot**: room_growth / mantra (rotation)
- **issue**: `source` field is empty. The Gayatri is from Rigveda 3.62.10 (Ṛṣi: Viśvāmitra). Every other mantra in the growth pool has an explicit source; this omission is a data gap.
- **source file**: `core/data_seed/master_mantras.json`.
- **current content**: `source: ""`.
- **correct content / proposed fix**: `source: "Rig Veda (3.62.10) — Viśvāmitra"` (mirroring the style of `mantra.gayatri_om_tat_savitur`).
- **tradition**: correct.
- **founder escalation**: no — simple backfill.

### F10 — `mantra.hreem_shreem_kleem_mahalakshmi` has empty `source` field [FIX_TAG]
- **item_id**: `mantra.hreem_shreem_kleem_mahalakshmi`
- **room / slot**: room_growth / mantra (rotation)
- **issue**: Empty `source`. This is a Śākta / Tantric tri-bīja formula (Lakṣmī bīja mantra) traditionally sourced from the Lakṣmī Tantra / Śrī Sūkta commentarial literature.
- **source file**: `core/data_seed/master_mantras.json`.
- **current content**: `source: ""`, `deity: "Lakshmi"`.
- **correct content / proposed fix**: `source: "Śākta / Śrī Sūkta tradition"` (matches the attribution style of `mantra.rudra_om_namo_bhagavate` → "Śaiva tradition" and `mantra.saraswati_om_aim_wisdom` → "Śākta tradition").
- **tradition**: correct (Śākta/Tantric bhakti).
- **founder escalation**: no — backfill.

### F11 — `mantra.hanuman_buddhi_balam` has empty `source` field [FIX_TAG]
- **item_id**: `mantra.hanuman_buddhi_balam`
- **room / slot**: room_clarity / mantra (anchor)
- **issue**: Empty `source`. This is a well-known Hanuman Buddhi-Bala shloka traditionally attributed to post-Rāmāyaṇa devotional literature (often chanted in conjunction with Hanuman Chalisa / Sundara Kāṇḍa recitation context). It should not be sourceless, especially as the **anchor** of the clarity pool.
- **source file**: `core/data_seed/master_mantras.json`.
- **current content**: `source: ""`.
- **correct content / proposed fix**: `source: "Hanuman devotional tradition (post-Rāmāyaṇa recitational)"` or simply `source: "Vaiṣṇava Hanuman tradition"`. Needs curator sign-off on exact attribution since there is no single canonical textual source.
- **tradition**: correct (Vaiṣṇava/Hanuman bhakti).
- **founder escalation**: no — backfill; **needs_curator_review** on exact wording.

### F12 — `mantra.soham` placement in room_connection conflicts with curator's own "no Shiva-ascetic" note [needs_curator_review]
- **item_id**: `mantra.soham`
- **room / slot**: room_connection / mantra (rotation); also anchor in room_stillness.
- **issue**: The room_connection curator_note explicitly states: *"Relational/devotional bhakti; no Shiva-ascetic; pure Om belongs in stillness."* But the pool rotation includes `mantra.soham`, which is an Advaita/jñāna self-identity mantra ("I am That" — Atman, from the Yogic Meditation Tradition per the master row). Soham is neither relational nor devotional/bhakti — it is contemplative Advaita and closer to the "pure Om / ascetic-contemplative" family the curator says is excluded. This appears to be a **pool curation tension**: the mantra content is fine in isolation; the placement contradicts the pool's own stated contract.
- **source file**: `0120_seed_room_pools_v1.py:77-82` (room_connection mantra rotation + curator_note).
- **current content**: soham in room_connection rotation despite bhakti-only curator note.
- **correct content / proposed fix**: Either (a) **drop `mantra.soham` from the room_connection rotation** (leaving: `om_namo_bhagavate_vasudevaya` anchor, `hare_krishna`, `emotional_healing.vasudevaya`, `krishna_hare_krishna` — though dedup per F6+F7 further shrinks this); or (b) **amend the curator_note** to acknowledge that jñāna-path mantras are permitted alongside bhakti mantras in connection. Flagged as `needs_curator_review` because it's a curation call, not a tradition distortion.
- **tradition**: mantra tradition correct (Advaita/Yogic); placement question.
- **founder escalation**: no — curator review.

### F13 — Room_release and room_growth depend on missing-en-locale rows; cascading from F3 [ESCALATE operational]
- **item_id**s affected: `mantra.krishna_govinda_joy`, `mantra.krishna_govinda_gratitude`, `mantra.ganesha_om_gam_new_direction`, `mantra.shiva_om_tryambakam_healing`, `mantra.saraswati_om_saraswati_wisdom`.
- **room / slot**: room_joy mantra rotation (krishna_govinda_joy + krishna_govinda_gratitude); room_clarity mantra rotation (ganesha_om_gam_new_direction, saraswati_om_saraswati_wisdom); room_release mantra rotation (shiva_om_tryambakam_healing).
- **issue**: Five pool-referenced mantra ids have NO English master row (only gu / te). If the render endpoint does not gracefully fall back, these slots either 404 or serve non-English content to English users.
- **source file**: `core/data_seed/master_mantras.json` (all 5 ids, only non-en locales present).
- **current content**: en row absent.
- **correct content / proposed fix**: EITHER (a) **backfill en master_mantras row** for each (preferred if the curator intended these to be distinct from their english-present counterparts); OR (b) **RETIRE** each from its pool rotation. Of the 5, at least `ganesha_om_gam_new_direction` and `shiva_om_tryambakam_healing` are duplicates of other en-present rows (F4, F5) and should be retired. The Saraswati variant and the two krishna_govinda rows need curator decision.
- **tradition**: n/a — availability issue.
- **founder escalation**: **yes** — this is a live-rendering gap that affects en users.

## Clean verdict rows

Grouped by room. Count = pool rows that passed audit with no findings:

- **room_stillness**: 2 mantras clean (`mantra.peace_calm.om`, `mantra.om_shanti_om`), 6 practices clean, 2 wisdom_banner principles clean.
- **room_connection**: 1 mantra clean (`mantra.om_namo_bhagavate_vasudevaya`; others flagged F6/F7/F12), 4 practices clean, 4 wisdom_banner principles clean.
- **room_release**: 2 mantras clean (`mantra.maha_mrityunjaya`, `mantra.asato_ma`; others flagged F5/F13), 3 practices clean, 2 wisdom_banner principles clean.
- **room_clarity**: 3 mantras clean (`mantra.saraswati_om_aim_wisdom`, `mantra.ganesha_om_gam_clarity`, `mantra.pavamana_asato_ma` — latter has F1 fix_tag only), 5 practices clean, 4 principle/teaching principles clean (all Gita/Sankhya/Niti rows), 6 wisdom_banner principles clean (overlap with principle pool).
- **room_growth**: 2 mantras clean (`mantra.rudra_om_namo_bhagavate`, `mantra.gayatri` — F9 backfill only), 4 practices clean, 6 principles clean (Gita/Dharma/Yoga Sutras), 6 wisdom_banner principles clean (overlap), 5 teaching principles clean (overlap), 4 reflection principles clean (overlap).
- **room_joy**: 4 mantras clean (`mantra.purnamadah`, `mantra.lokah_samastah`, `mantra.sarve_bhavantu`, `mantra.lakshmi_om_shri_joy`), 19 sankalps clean (all gratitude/blessings/seva rows), 4 wisdom_banner principles clean.
- **All 22 practices** used across rooms: CLEAN (tradition attribution consistent, no distortion, appropriate curator_review not needed).
- **All 31 WisdomAsset principles / banners / teachings / reflections** referenced in pools: CLEAN on tradition attribution, plain_english, core_teaching — these were authored with care through Pass B/C in `core/data_seed/wisdom/passc_2026_04_18.csv` and show no shallow-paraphrase drift.
- **All 19 sankalps** in room_joy: CLEAN (first-person intentions, no tradition-source claim; `dana_practice` correctly tagged Sanatan Traditions).
- **All 8 carry labels** (stillness_named, connection_named, connection_reach_out, release_voice_note, clarity_journal, growth_journal, joy_carry, joy_named): CLEAN (authored chip labels, not tradition-sourced).

**Verdict summary** — of ~80 content rows audited, **13 findings** across the mantra set. Zero findings on practices, sankalps, WisdomAssets, carry labels.

## Patterns observed

1. **Mantra duplicate-id pattern (F3-F7)** — the mantra master has multiple item_ids resolving to the same Sanskrit verse (vasudevaya ×2, hare krishna ×2, ganesha om gam ×2, maha mrityunjaya ×2, govinda ×2). The pools then reference both copies in the same rotation, producing false diversity. Pattern cause: the master seems to have been seeded by category (peace_calm, careerprosperity, focusmotivation, emotional_healing, spiritualgrowth, gratitudepositivity) and the same verse got re-seeded under each category-qualified slug. Fix: dedupe the master + remove duplicate rotation refs. Five pool-edits + five master-row retirements recommended.

2. **Saraswati over-attribution for Vedantic / Upanishadic mantras (F1, F2)** — both `mantra.pavamana_asato_ma` (Brihadaranyaka Upanishad) and `mantra.vedanta_om_tat_sat` (Gītā 17.23) carry `deity: Saraswati`. These are Vedantic/Upanishadic texts pointing at Brahman / spoken by Krishna; neither is addressed to Saraswati. Pattern cause: likely auto-tagging drift where "focusmotivation / clarity / wisdom" categories pulled the Saraswati deity label. Fix: targeted deity correction on those two rows (and any similar Vedantic rows outside scope of this audit).

3. **Empty source fields on high-visibility mantras (F9, F10, F11)** — the Gayatri anchor, Hanuman Buddhi-Bala anchor, and Mahalakshmi tri-bīja all ship with empty `source`. Pattern cause: inconsistent seed authoring. Fix: fill per the canonical forms suggested above; fold into a single cleanup migration.

## Founder-escalated items (4)

- **F1** — Pavamana mantra (Brihadaranyaka Upanishad 1.3.28) mis-attributed to `deity: Saraswati`. Upanishadic sovereignty breach.
- **F2** — Gītā 17.23 declaration `Oṃ Tat Sat` mis-attributed to `deity: Saraswati`. This is the room_growth anchor — highest visibility mantra in the whole system.
- **F3** — `krishna_govinda_joy` and `krishna_govinda_gratitude` are two pool refs pointing at duplicate content, neither with an English master row; pool will fail en render.
- **F8** — `mantra.gayatri_om_tat_savitur` publicly named as "a shorter form of the Gayatri mantra" — truncated partial is not a recognized variant in any sampradāya; this will be caught by devoted users.
- **F13** — 5 pool-referenced mantra item_ids have no English locale row; live-rendering gap for en users.

## Rooms with high contamination density

None at the >20% threshold. Per-room mantra-row contamination:

- **room_joy**: 2/6 mantras (F3 pair) = 33% contamination — **DOES exceed the 20% threshold**. Driver: the two krishna_govinda rows both en-missing + duplicate. Recommended action: retire one, backfill en on the other.
- **room_clarity**: 2/6 mantras (F1 + F4) = 33% — **DOES exceed 20%**. Drivers: pavamana_asato_ma deity fix + ganesha_om_gam_new_direction duplicate retire.
- **room_connection**: 3/5 mantras flagged (F6+F7+F12) = 60% — **DOES exceed 20%**. Drivers: vasudevaya and hare_krishna duplicate pairs + soham placement tension. Note: findings here are pool-curation tension + dedup, not tradition distortion; all three mantras are individually tradition-correct.
- **room_release**: 2/4 mantras flagged (F5 + F13 `shiva_om_tryambakam_healing`) = 50% — **DOES exceed 20%**. Driver: duplicate Mahāmṛtyuñjaya entries + missing-en locale row.
- **room_growth**: 2/5 mantras flagged (F2 + F8) = 40% — **DOES exceed 20%**. Drivers: anchor deity wrong + truncated Gayatri variant.
- **room_stillness**: 0/4 findings = 0% clean.

**Summary**: 5 of 6 rooms exceed the 20% mantra contamination threshold. This is driven by one systemic pattern — duplicate-slug mantras in the master table propagated into pool rotations — plus two deity-attribution errors. A single consolidated cleanup (retire duplicate ids + fix two deity fields + backfill 3 empty `source` fields + decide on 5 en-missing rows) resolves all 13 findings.

## Findings count by verdict

- **RETIRE**: 5 (F3 partial, F4, F5, F6, F7; plus partial F8 / F13 depending on curator call)
- **REWRITE**: 1-2 (F3 if curator wants two genuinely different Govinda kīrtanas; F8 if curator wants the full Gayatri seeded under this id)
- **FIX_TAG**: 5 (F1, F2, F9, F10, F11)
- **ESCALATE (operational)**: 1 (F13 — en-locale backfill decision)
- **needs_curator_review**: 1 (F12 — soham in connection)

Total distinct findings: **13**. Total master rows recommended for retirement: **5** (the duplicate ids). Total deity corrections: **2**. Total source-field backfills: **3**. Total en-locale decisions: **5** (of which 2 are covered by the duplicate-retire above).
