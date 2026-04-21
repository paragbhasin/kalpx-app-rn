# P1-B Bhakti Breadth Authoring Report

**Date:** 2026-04-21
**Scope:** Wave 3 expansion — Gauḍīya / Ālvār / Sant lineage breadth for connection + joy rooms
**Founder lock basis:** F2 (2026-04-19) — single-lineage W2 accepted; Gauḍīya/Ālvār/Sant tracked as W3 requirement
**Status:** Draft — all rows CURATOR_GATE=true; founder review required before ingestion

---

## Lineage Coverage Before / After

| Lineage | Rows Before P1-B | Rows After P1-B | Notes |
|---|---|---|---|
| Vaiṣṇava (undifferentiated) | 18 (W1+W2 combined pool) | 18 | Base bhakti rows remain |
| Gauḍīya (Chaitanya line) | 0 | 5 | Net-new |
| Ālvār (Tamil Vaiṣṇava) | 0 | 4 | Net-new |
| Sant (Nirguṇa north Indian) | 0 | 5 | Net-new |
| **Total Bhakti authored** | **18** | **32** | +14 rows |

---

## Pool Assignment Summary

| room | slot | lineage | count | emotional_function |
|---|---|---|---|---|
| connection | wisdom_banner | Gauḍīya | 2 | deepen |
| connection | wisdom_teaching | Gauḍīya | 2 | deepen |
| connection | wisdom_teaching | Gauḍīya | 1 | deepen (dual: connection+joy) |
| joy | wisdom_banner | Gauḍīya | 2 | offer |
| connection | wisdom_banner | Ālvār | 2 | deepen |
| connection | wisdom_teaching | Ālvār | 1 | deepen |
| joy | wisdom_banner | Ālvār | 1 | offer |
| connection | wisdom_banner | Sant | 2 | deepen |
| connection | wisdom_teaching | Sant | 2 | deepen |
| joy | wisdom_banner | Sant | 1 | offer |

Connection-only vs joy-only vs dual:
- **Connection-only:** 9 rows (Gauḍīya: 3; Ālvār: 3; Sant: 3) — longing/surrender register native to connection
- **Joy-only:** 4 rows (Gauḍīya: 2; Ālvār: 1; Sant: 1) — ecstatic/fullness register native to joy
- **Dual (connection+joy):** 1 row (Gauḍīya: 1: viraha-bhakti that resolves in ānanda)

Dual-tag rationale: Gauḍīya viraha-bhakti (longing-toward-union) begins in the reaching register (connection) but resolves in the ecstatic register (joy). One row — `bhakti_gaudia_love_that_aches_is_already_meeting` — is doctrinally dual because Caitanya-caritāmṛta explicitly teaches viraha as the highest joy, not merely the prelude to it.

---

## Cross-room distinctness enforcement (per ROOM_TRADITION_ASSIGNMENT_V2 §Cross-room)

Connection register: *reaching toward* — longing, surrender, self-offering, relational devotion
Joy register: *celebrating what is* — ecstatic fullness, ānanda-bhakti, offering of delight

These rows maintain the `emotional_function` tag distinction:
- Connection rows: `deepen`
- Joy rows: `offer`

---

## Gauḍīya Vaiṣṇavism — 5 Rows

**Doctrinal register:** Rādhā-Kṛṣṇa divine love; mādhurya-bhāva; acintya-bhedābheda; viraha-bhakti (union-in-separation as the highest devotional register). Primary texts: Caitanya-caritāmṛta, Bhakti-rasāmṛta-sindhu (Rūpa Gosvāmī), Śrīmad-Bhāgavatam rāsa-pañcādhyāya.

---

### G-1: bhakti_gaudia_longing_itself_is_the_divine_nearness

| Field | Value |
|---|---|
| principle_id | bhakti_gaudia_longing_itself_is_the_divine_nearness |
| title | Longing itself is the Divine nearness |
| short_label | Viraha is sāmīpya |
| tradition_family | bhakti |
| room_fit | [connection] |
| life_context_bias | [relationships, self] |
| surface_eligibility | [wisdom_teaching, wisdom_banner] |
| pool_role | anchor |
| emotional_function_tag | deepen |
| action_family | teaching |
| intensity | medium |

**short_text (user-facing):**
> The Gauḍīya teachers say that longing for the Beloved is not the absence of the Beloved. It is the form the Beloved takes when closeness is most real. You do not have to wait for the ache to stop before you feel held.

**Doctrinal source / rationale:**
Caitanya-caritāmṛta, Madhya 2.45 on viraha-bhakti: mahābhāva, the highest devotional state, is experienced by Rādhā precisely as viraha — the pain of separation that is simultaneously the most intimate form of union. Rūpa Gosvāmī's Bhakti-rasāmṛta-sindhu (2.1.288) codifies this: viraha is the śṛṅgāra-rasa at its peak.

**Connection-only rationale:** The reaching register. Longing is the movement toward, not the arrival. Joy would be the arrival.

---

### G-2: bhakti_gaudia_the_name_holds_what_the_mind_cannot

| Field | Value |
|---|---|
| principle_id | bhakti_gaudia_the_name_holds_what_the_mind_cannot |
| title | The Name holds what the mind cannot |
| short_label | Nāma-saṅkīrtana is the refuge |
| tradition_family | bhakti |
| room_fit | [connection] |
| life_context_bias | [daily_life, self] |
| surface_eligibility | [wisdom_teaching, wisdom_banner] |
| pool_role | rotation |
| emotional_function_tag | deepen |
| action_family | teaching |
| intensity | low |

**short_text (user-facing):**
> When the mind cannot hold itself together, the Name of the Beloved does it instead. This is what Chaitanya discovered: not a technique, but a companionship. Say the Name until the Name carries you.

**Doctrinal source / rationale:**
Caitanya Mahāprabhu's Śikṣāṣṭakam, verse 1 (ceto-darpaṇa-mārjanam) teaches that the Name cleans the mirror of consciousness. The Gauḍīya tradition's emphasis on nāma-saṅkīrtana treats the Name not as a mantra-technique but as the actual presence of Kṛṣṇa — nāma and nāmī (the name and the named) are non-different. Source: Śikṣāṣṭakam 1; also Bhāg. 2.1.11 on the Name as the foremost sādhana in Kali.

**Connection-only rationale:** The practice of taking shelter in the Name is a relational-devotional act (reaching toward). Not ecstatic arrival (joy).

---

### G-3: bhakti_gaudia_love_that_aches_is_already_meeting

| Field | Value |
|---|---|
| principle_id | bhakti_gaudia_love_that_aches_is_already_meeting |
| title | Love that aches is already a meeting |
| short_label | Viraha resolves in ānanda |
| tradition_family | bhakti |
| room_fit | [connection, joy] |
| life_context_bias | [relationships, self] |
| surface_eligibility | [wisdom_banner] |
| pool_role | rotation |
| emotional_function_tag | offer |
| action_family | teaching |
| intensity | low |

**short_text (user-facing):**
> The Gauḍīya saints teach that the ache of love is not the opposite of its joy — it is how the joy deepens. Rādhā's longing is described as the highest bliss. What you feel as reaching is already the fullness arriving.

**Doctrinal source / rationale:**
Caitanya-caritāmṛta Ādi 4.68 and Rūpa Gosvāmī's Ujjvala-nīlamaṇi on mādhurya-bhāva: the separation (viraha) between Rādhā and Kṛṣṇa is itself the highest expression of union because it is the form love takes when it is most complete. Viraha-in-mādhurya is simultaneously the greatest pain and the greatest ānanda — it is doctrinally dual-registered.

**Dual-tag rationale:** This is the one row where Gauḍīya doctrine explicitly collapses the connection/joy distinction. Viraha is both the longing (connection) and the highest joy (joy). The banner format (not teaching) supports this: a teaching-slot needs single-register instruction; a banner can hold the paradox.

---

### G-4: bhakti_gaudia_serve_the_beloved_through_every_ordinary_act

| Field | Value |
|---|---|
| principle_id | bhakti_gaudia_serve_the_beloved_through_every_ordinary_act |
| title | Serve the Beloved through every ordinary act |
| short_label | Sevā transforms the ordinary |
| tradition_family | bhakti |
| room_fit | [connection] |
| life_context_bias | [daily_life, relationships] |
| surface_eligibility | [wisdom_teaching, wisdom_banner] |
| pool_role | rotation |
| emotional_function_tag | deepen |
| action_family | teaching |
| intensity | medium |

**short_text (user-facing):**
> The Gauḍīya path teaches that every act done with love for the Beloved becomes a form of worship. Cooking, cleaning, speaking gently — none of it is too small to be sevā. The ordinary life is already the devotional life when the heart is turned right.

**Doctrinal source / rationale:**
Rūpa Gosvāmī's Bhakti-rasāmṛta-sindhu 1.2.187-195 on the nine forms of bhakti lists śravaṇa, kīrtana, smaraṇa, pāda-sevana, arcana, vandana, dāsya, sakhya, ātma-nivedana — the dāsya (service) and pāda-sevana forms explicitly include the mundane acts of tending. The Gauḍīya practice of deity-sevā extends this into all relational care.

**Connection-only rationale:** This is the devotional transformation of dailiness — the reaching-toward that connection carries. Not ecstatic arrival.

---

### G-5: bhakti_gaudia_ecstatic_love_is_a_form_of_knowing

| Field | Value |
|---|---|
| principle_id | bhakti_gaudia_ecstatic_love_is_a_form_of_knowing |
| title | Ecstatic love is a form of knowing |
| short_label | Bhāva as epistemology |
| tradition_family | bhakti |
| room_fit | [joy] |
| life_context_bias | [self, daily_life] |
| surface_eligibility | [wisdom_banner] |
| pool_role | rotation |
| emotional_function_tag | offer |
| action_family | teaching |
| intensity | medium |

**short_text (user-facing):**
> Chaitanya wept and danced and could not hold still — not because he had lost his mind, but because he had found something the mind could not hold. Joy that overflows the container is not irrationality. In the Gauḍīya teaching, it is the truest sight.

**Doctrinal source / rationale:**
Caitanya-caritāmṛta Ādi 7.83-95 on the phenomenon of mahābhāva — the ecstatic state — as the natural response of the purified heart to Kṛṣṇa's presence. Rūpa Gosvāmī codifies sāttvika-bhāvas (ecstatic symptoms: tears, trembling, horripilation) as involuntary responses that are signs of genuine bhakti, not of excess. Ecstasy in this tradition is not noise but the highest signal.

**Joy-only rationale:** Pure ānanda register — the arriving, not the reaching.

---

## Ālvār Tradition — 4 Rows

**Doctrinal register:** Tamil Vaiṣṇava prapatti (surrender); self as daas/servant of Perumāḷ (Viṣṇu/Nārāyaṇa); divine love without distance; total self-offering. Primary texts: Divya Prabandham, especially Tiruvāymoḻi (Nammāḷvār), Āṇḍāḷ's Tiruppāvai, Tirumangai Ālvār's Periya Tirumoli.

---

### A-1: bhakti_alvar_i_am_yours_completely_and_that_is_the_rest

| Field | Value |
|---|---|
| principle_id | bhakti_alvar_i_am_yours_completely_and_that_is_the_rest |
| title | I am yours completely, and that is the rest |
| short_label | Prapatti as total ease |
| tradition_family | bhakti |
| room_fit | [connection] |
| life_context_bias | [self, relationships] |
| surface_eligibility | [wisdom_teaching, wisdom_banner] |
| pool_role | anchor |
| emotional_function_tag | deepen |
| action_family | teaching |
| intensity | low |

**short_text (user-facing):**
> Nammāḷvār sings: I have no self to protect, nothing of my own to hold back. I am Yours entirely, and in that giving-over, I find I no longer need to carry myself. This is what the Ālvār teachers call the rest that is deeper than sleep.

**Doctrinal source / rationale:**
Tiruvāymoḻi 6.10 (Nammāḷvār) on complete prapatti — *āḷvarēn nilaiyē āḷvarēn* — "I belong, and in belonging I rest." Nammāḷvār's theology of "absolute belonging" (śeṣatva: the self's complete belonging to the Lord) is the foundation of Śrīvaiṣṇava surrender doctrine, codified by Rāmānuja as the sixth aṅga of prapatti: ātma-nikṣepa (self-placement). Source: Tiruvāymoḻi 6.10; Rāmānuja's Gadya-traya.

**Connection-only rationale:** Self-offering as relational reaching. Not ecstatic celebration.

---

### A-2: bhakti_alvar_the_divine_is_not_far_it_is_waiting_at_the_door

| Field | Value |
|---|---|
| principle_id | bhakti_alvar_the_divine_is_not_far_it_is_waiting_at_the_door |
| title | The Divine is not far — it waits at your door |
| short_label | Perumāḷ's closeness |
| tradition_family | bhakti |
| room_fit | [connection] |
| life_context_bias | [daily_life, self] |
| surface_eligibility | [wisdom_teaching, wisdom_banner] |
| pool_role | rotation |
| emotional_function_tag | deepen |
| action_family | teaching |
| intensity | low |

**short_text (user-facing):**
> The Ālvārs did not teach that God is distant and must be approached through elaborate discipline. They taught the opposite: Perumāḷ is already here, standing at the threshold of the ordinary day, closer than the next breath, easier to meet than we have been told.

**Doctrinal source / rationale:**
Āṇḍāḷ's Tiruppāvai, verse 21-22: the Ālvār calls out to Kṛṣṇa as one who is immediately present — "ēlōr empāvāy" — the divine is not remote but intimate. Tirumangai Ālvār's Periya Tirumoli repeatedly invokes Viṣṇu as tirumeṉi (the beautiful form that is right here). The theological grounding is Rāmānuja's doctrine of the world as the body of God — the divine is not spatially distant because the divine pervades all.

**Connection-only rationale:** Relational nearness — the devotional meeting at the threshold. Not ecstatic arrival.

---

### A-3: bhakti_alvar_no_ego_remains_when_the_beloved_fills_the_room

| Field | Value |
|---|---|
| principle_id | bhakti_alvar_no_ego_remains_when_the_beloved_fills_the_room |
| title | No ego remains when the Beloved fills the room |
| short_label | The self empties into love |
| tradition_family | bhakti |
| room_fit | [connection] |
| life_context_bias | [self, daily_life] |
| surface_eligibility | [wisdom_banner] |
| pool_role | rotation |
| emotional_function_tag | deepen |
| action_family | teaching |
| intensity | medium |

**short_text (user-facing):**
> Nammāḷvār describes the moment when he stopped being a person and became only the love. The Ālvārs are not shy about this: when the Divine enters, the small self does not argue or analyze. It dissolves. What remains is not emptiness but fullness — a fullness that is the Beloved's, not the self's.

**Doctrinal source / rationale:**
Nammāḷvār's Tiruvāymoḻi 10.10, the final decade known as the "parama-padam sequence," where the ālvār describes the dissolution of the separate self into divine love (mokṣa as bhakti-completion, not as jñāna-achievement). The Ālvār tradition's understanding of mukti as ānanda-service rather than as knowledge-liberation grounds this in relational register. Source: Tiruvāymoḻi 10.10.1-11.

**Connection-only rationale:** This is the deepening-toward — the self releasing into love. Connection's reaching. Not joy's celebrating.

---

### A-4: bhakti_alvar_the_whole_world_shines_when_love_is_real

| Field | Value |
|---|---|
| principle_id | bhakti_alvar_the_whole_world_shines_when_love_is_real |
| title | The whole world shines when love is real |
| short_label | Bhakti illuminates the ordinary |
| tradition_family | bhakti |
| room_fit | [joy] |
| life_context_bias | [daily_life, self] |
| surface_eligibility | [wisdom_banner] |
| pool_role | rotation |
| emotional_function_tag | offer |
| action_family | teaching |
| intensity | low |

**short_text (user-facing):**
> The Ālvārs moved through temples and rivers and ordinary Tamil streets and everywhere they looked they saw the Lord's beauty looking back at them. The world was not an obstacle to the devotional life — it was the devotional life itself. This is what love does: it turns the ordinary into the luminous.

**Doctrinal source / rationale:**
Tirumangai Ālvār's Periya Tirumoli and Nammāḷvār's Tiruvāymoḻi consistently depict divine beauty (tirumeṉi, divya-maṅgala-vigraha) reflected in the natural world — rivers, mountains, temples, the human form — as the devotee with opened eyes perceives it. The theological basis is the Ālvār insight that kalyāṇa-guṇas (auspicious qualities) of the Lord pervade and illuminate created things. Seeing beauty everywhere is not sentiment but devotional vision. Source: Tiruvāymoḻi 3.3.1-11.

**Joy-only rationale:** The delight-in-the-luminous is ānanda-register, not the reaching of connection. Celebrating what is.

---

## Sant Tradition — 5 Rows

**Doctrinal register:** North Indian nirguṇa bhakti (Kabīr, Mirabai, Tukaram, Nāmdeva, Surdas); direct experience without intermediary; raw devotional authenticity; personal address to the divine; love that breaks form and caste-ritual. Two sub-registers: Kabīr's cutting universal clarity; Mirabai's personal divine-marriage surrender.

---

### S-1: bhakti_sant_kabir_the_divine_has_no_address_look_inside

| Field | Value |
|---|---|
| principle_id | bhakti_sant_kabir_the_divine_has_no_address_look_inside |
| title | The Divine has no address — look inside |
| short_label | Kabīr's inward turn |
| tradition_family | bhakti |
| room_fit | [connection] |
| life_context_bias | [self, daily_life] |
| surface_eligibility | [wisdom_teaching, wisdom_banner] |
| pool_role | anchor |
| emotional_function_tag | deepen |
| action_family | teaching |
| intensity | medium |

**short_text (user-facing):**
> Kabīr said: you have been going to the mosque and the temple and the river, searching everywhere outside. The One you seek is the only one who has never left. Stop going out. Go in. The address was always your own chest.

**Doctrinal source / rationale:**
Kabīr's doha: *"Moko kahan dhundhe re bande, main to tere paas mein"* (Where do you search for me, O seeker? I am right beside you). This doha is among the most widely cited in the Sant corpus. Kabīr's nirguṇa bhakti cuts across pilgrimage-as-solution with surgical clarity: the divine is not locatable in external forms because it is formless and interior. The inward turn is not quiet but direct and urgent.

**Connection-only rationale:** The seeking/finding movement is connection's reaching. Not joy's arrival.

---

### S-2: bhakti_sant_mira_i_have_chosen_the_path_that_cannot_be_taken_back

| Field | Value |
|---|---|
| principle_id | bhakti_sant_mira_i_have_chosen_the_path_that_cannot_be_taken_back |
| title | I have chosen the path that cannot be taken back |
| short_label | Mirabai's irrevocable love |
| tradition_family | bhakti |
| room_fit | [connection] |
| life_context_bias | [relationships, self] |
| surface_eligibility | [wisdom_teaching, wisdom_banner] |
| pool_role | rotation |
| emotional_function_tag | deepen |
| action_family | teaching |
| intensity | high |

**short_text (user-facing):**
> Mirabai sang: *Main toh Giridhar ke ghar jāun* — I am going to the house of the One who holds the mountain. She had left the palace. She had left convention. There was no return because she had given herself entirely, and the giving was complete. The path of complete love has no backward door.

**Doctrinal source / rationale:**
Mirabai's pada "Main toh Giridhar ke ghar jāun" (I will go to Giridhar's house) expresses irreversible surrender to Kṛṣṇa/Giridhar as her divine husband. Mirabai's theology of divine marriage (kṛṣṇa-bhakti-as-svayambara — the soul's self-choosing of the Lord) treats complete surrender not as loss of self but as the truest form of self-recognition. The irrevocability is a mark of the surrender's authenticity, not its desperation.

**Connection-only rationale:** Complete surrender and the leaving of ordinary life is relational-devotional reaching at its most intense. Not ecstatic celebration.

---

### S-3: bhakti_sant_tukaram_grace_finds_the_one_who_stops_performing

| Field | Value |
|---|---|
| principle_id | bhakti_sant_tukaram_grace_finds_the_one_who_stops_performing |
| title | Grace finds the one who stops performing |
| short_label | Tukaram's nakedness before the Divine |
| tradition_family | bhakti |
| room_fit | [connection] |
| life_context_bias | [self, daily_life] |
| surface_eligibility | [wisdom_teaching, wisdom_banner] |
| pool_role | rotation |
| emotional_function_tag | deepen |
| action_family | teaching |
| intensity | medium |

**short_text (user-facing):**
> Tukaram was a failed merchant, a social nobody by the standards of his time. He went to Viṭṭhal not dressed in piety but collapsed in honesty. He sang his confusion and his despair and his ordinary mess. And Viṭṭhal came. Grace is not attracted to performance. It finds the one who shows up as they actually are.

**Doctrinal source / rationale:**
Tukaram's abhangas (Marathi devotional poems to Viṭṭhal, the form of Kṛṣṇa at Pandharpur) repeatedly address his own unworthiness and confusion as the very medium of prayer. His abhanga beginning *"Āhān to mi deva"* (I am this before you, God) is a paradigmatic expression of naked honesty as devotional virtue. The Sant tradition prizes naïve directness over sophisticated performance as the mark of genuine bhakti.

**Connection-only rationale:** Honest self-presentation before the divine is relational reaching. Not celebration.

---

### S-4: bhakti_sant_kabir_love_does_not_ask_what_caste_you_belong_to

| Field | Value |
|---|---|
| principle_id | bhakti_sant_kabir_love_does_not_ask_what_caste_you_belong_to |
| title | Love does not ask what caste you belong to |
| short_label | Kabīr's universal access |
| tradition_family | bhakti |
| room_fit | [joy] |
| life_context_bias | [self, daily_life, relationships] |
| surface_eligibility | [wisdom_banner] |
| pool_role | rotation |
| emotional_function_tag | offer |
| action_family | teaching |
| intensity | low |

**short_text (user-facing):**
> Kabīr said: God did not make castes. Love made no such list. The weaver from Varanasi and the Brahmin from the Ganges bank both arrive at the same door, and the door opens the same way for both — not through credentials, but through the simple turning of the heart. The divine is freely available. This is the joy.

**Doctrinal source / rationale:**
Kabīr's doha: *"Jāti na pūcho sādhu kī, pūch lijiye jñān"* (Do not ask the caste of a holy person, ask for their wisdom). Kabīr's consistent polemic against caste-based gatekeeping of the divine is not merely social but theologically grounded: the nirguṇa divine (without qualities, without form) cannot be the possession of any community. Universal access is not a political position for Kabīr but a consequence of the divine's own formlessness.

**Joy-only rationale:** The delight in divine availability — the freedom of love — is ānanda-register. Celebrating what is freely given.

---

### S-5: bhakti_sant_nāmdeva_the_divine_is_in_the_work_of_your_hands

| Field | Value |
|---|---|
| principle_id | bhakti_sant_namdeva_the_divine_is_in_the_work_of_your_hands |
| title | The Divine is in the work of your hands |
| short_label | Nāmdeva's craft-bhakti |
| tradition_family | bhakti |
| room_fit | [connection] |
| life_context_bias | [daily_life, purpose_direction] |
| surface_eligibility | [wisdom_teaching, wisdom_banner] |
| pool_role | rotation |
| emotional_function_tag | deepen |
| action_family | teaching |
| intensity | low |

**short_text (user-facing):**
> Nāmdeva was a tailor. He stitched cloth and sang to Viṭṭhal and in his teaching the two were never separate. The devotional life was not other than the working life. Every garment stitched with attention was a stitch toward the Lord. Your ordinary skilled work can be this: not distraction from the sacred, but the shape it takes today.

**Doctrinal source / rationale:**
Nāmdeva's abhangas (he was a contemporary and devotee-companion of Jñāneśvara in 13th–14th c. Maharashtra) address Viṭṭhal through the metaphor of his tailoring craft. His famous abhanga comparing the soul's relationship to God with cloth being prepared is a canonical expression of Sant bhakti's craft-devotion insight. The Sant tradition's democratization of bhakti through skilled work is doctrinally distinct from BG karma-yoga (action-without-fruit): it is bhakti through craft rather than detached action through craft.

**Connection-only rationale:** The meeting of the divine through skilled work is devotional reaching. Not ecstatic arrival. (Note: differs from BG 2.47 joy × work_career which is karma-yoga-detachment register, not bhakti-craft register.)

---

## What's Present Now vs Before

### Connection pool (wisdom_banner + wisdom_teaching combined)

**Before P1-B:** All bhakti rows were undifferentiated Vaiṣṇava or Bhāgavata-tradition, primarily Nārada Bhakti Sūtra / Rāmānuja / Dhanvantari register.

**After P1-B — lineage breakdown:**
- Nārada / Rāmānuja / Bhāgavata (existing W1+W2): 18 rows
- Gauḍīya (new): 3 connection rows (G-1, G-2, G-4)
- Ālvār (new): 3 connection rows (A-1, A-2, A-3)
- Sant (new): 4 connection rows (S-1, S-2, S-3, S-5)

### Joy pool (wisdom_banner)

**Before P1-B:** 5 Bhakti joy banner rows, all undifferentiated Vaiṣṇava register.

**After P1-B — lineage breakdown:**
- Existing W1+W2: 5 rows
- Gauḍīya (new): 2 joy rows (G-3 dual, G-5)
- Ālvār (new): 1 joy row (A-4)
- Sant (new): 1 joy row (S-4)

---

## Register Differentiation Table

| Lineage | Emotional key | Deity anchor | Devotional mode |
|---|---|---|---|
| Gauḍīya | Longing / ecstatic love / viraha-ānanda | Rādhā-Kṛṣṇa | Mādhurya-bhāva |
| Ālvār | Total surrender / divine nearness / illuminated ordinary | Viṣṇu / Perumāḷ | Prapatti / daas |
| Sant | Direct address / honest presenting / universal access | Kṛṣṇa/Giridhar / Rāma / Viṭṭhal / Rāma (nirguṇa) | Nirguṇa / raw-personal |
| Existing W1+W2 | Devotional remembrance / body-bhakti / guru-bhakti / relational sevā | Kṛṣṇa / Nārāyaṇa / Dhanvantari | Saguṇa-Vaiṣṇava |

Registers are kept distinct. Gauḍīya rows use viraha / mādhurya vocabulary. Ālvār rows use prapatti / daas / Tamil-Vaiṣṇava register. Sant rows use direct-address and craft-bhakti vocabulary. No row bleeds lineage-voice into another lineage.

---

## Notes for Curator Review

1. **G-3 dual-tag** (connection + joy): This is the only dual-tagged row. The doctrinal basis (viraha-ānanda in Gauḍīya teaching) is specific and non-repeatable — do not extend dual-tagging to other rows without comparable doctrinal grounding.

2. **S-2 intensity=high** (Mirabai): The irreversible-surrender register is genuinely high-intensity. Do not serve this row to users in early grief or acute loss (connection room's release-adjacent moments). Consider `exclude_from_contexts: [grief_acute]` at curator review.

3. **Kabīr rows (S-1, S-4)**: Both use Kabīr's nirguṇa register. S-1 is connection-inward-turn; S-4 is joy-universal-access. These are doctrinally distinct but the same voice. Stagger their rotation to avoid Kabīr-saturation in a single session.

4. **A-3 banner-only**: The self-dissolution register of Nammāḷvār 10.10 is too complete a paradox for a teaching slot (which needs instructional clarity). Banner-only is correct.

5. **No Sant row in joy teaching slot**: The Sant register in joy is banners only. The nirguṇa directness of Kabīr/Tukaram lands better as a one-line truth (banner) than as extended instruction (teaching) in the ānanda-register of joy. This is intentional.
