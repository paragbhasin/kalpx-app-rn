# Room × Tradition Assignment V2

**Status:** Founder-proposed doctrine; locks after 2026-04-21 review.
**Baseline:** ROOM_SYSTEM_STRATEGY_V1.md §1 §5; founder-locked 7 decisions (2026-04-20); CONTENT_CLASS_AUDIT_V2 + LIBRARY_UTILIZATION_AUDIT_V2 + CONTENT_INTEGRITY_V2.

---

## Assignment principle

Each room has (1) a dominant-traditions axis, (2) a light-support set, (3) an excluded set. Rooms stay distinct by tradition × emotional-register × primary-content-class, **not by variance in practice mechanics alone**.

---

## Stillness

- **Dominant:** Yoga-Sūtras (prāṇāyāma, dhyāna, cittavṛtti-nirodhaḥ, 1.2, 2.46–48), Vedanta-witness (sākṣī-bhāva)
- **Light support:** Ayurveda (vāta-pacifying body regulation); BG 6.10–15 banner only
- **Avoid / exclude:** Bhakti, Niti, Sankhya, Dharma-principles, Tantric-Shaiva
- **BG placement:** LIGHT — Ch 6.10–15 banner only; never primary
- **Why:** Stillness is pre-cognitive anchoring. Yoga-Sūtra dhyāna-terrain and Vedanta-witness are native; any cognitive/moral/devotional content violates the room's posture.

---

## Connection

- **Dominant:** Bhakti (Nārada Bhakti Sūtras, Bhāgavata rasa; deity anchors Kṛṣṇa/Rāma/Viṣṇu)
- **Light support:** Dinacharya (devotional-mundane), Yamas (ahiṃsā-as-connection); BG Ch 12 (bhakti-yoga) as secondary
- **Avoid / exclude:** Niti (transactional), Sankhya (analytical-cold), Shaiva/Tantric release-register
- **BG placement:** SECONDARY — Ch 12 only; never primary. Pure Bhakti (Nārada, Bhāgavata) leads.
- **Why:** Connection is anāhata / relational-heart / japa-medium. BG bhakti is jñāna-inflected — valid but cooler than connection's native warmth.

---

## Release

- **Dominant:** Shaiva/Tantric (Maha-Mrityunjaya, Rudra, Om Namaḥ Śivāya), Ayurveda (vāta/pitta-pacifying somatic release)
- **Light support:** Yamas/Niyamas (aparigraha specifically for money_security-release); Vedanta-witness (witness-to-contraction)
- **Sparse banner only:** BG 2.11–30 (death/grief endurance, "endure like seasons")
- **Avoid / exclude:** Bhakti (grief-bypass risk), Niti (problem-solving grief), Sankhya (too analytical), Dinacharya (wrong register for catharsis)
- **BG placement:** SPARSE BANNER ONLY (Ch 2.14); never teaching, never principle-anchor
- **Why:** Release metabolizes contraction. Somatic-primacy is native. Scriptural teaching of any kind risks re-contracting the user by intellectualizing grief.

---

## Clarity

- **Dominant:** Sankhya (*viveka-khyāti*, guṇa-analysis), Yoga-Sūtras (kleśa-analysis, citta-vṛtti identification), Niti (pragmatic discernment)
- **Light support:** BG (specific verse set: 2.47, 3.35, 18.47 karma-yoga detachment); Dharma (relationships/purpose); Dinacharya (rhythm-before-decision)
- **Avoid / exclude:** Bhakti (emotional certainty ≠ viveka), Tantric-Shaiva (wrong register)
- **BG placement:** STRONG SECONDARY — tight verse subset (2.47, 3.35, 18.47) only; **primary stays Sankhya/YS/Niti**
- **Why:** Viveka is universal but room-tradition must stay analytical. BG would dominate easily (32 principles, 7 already pooled) if allowed — must be kept secondary.

---

## Growth

- **Dominant:** BG (svadharma, karma-yoga, sthita-prajña — Ch 2–3, 12, 18), Dharma (Tier 2 principles), Yamas/Niyamas (cultivation substrate)
- **Light support:** Yoga-Sūtras (abhyāsa, tapas, svādhyāya), Ayurveda (constitution-aware growth), Dinacharya (rhythm), Vedanta (svādhyāya)
- **Avoid / exclude:** Tantric-Shaiva (wrong register), pure Bhakti-without-discipline (directionless), Niti-dominant (too tactical)
- **BG placement:** **PRIMARY TRADITION — this is BG's native home**
- **Why:** Growth is *svadharma → becoming*. BG is the cultivation text. Dharma + Yamas/Niyamas are the lived substrate. Growth is where sankalp belongs co-primary (currently missing from pool).

---

## Joy

- **Dominant:** Bhakti (Kṛṣṇa, Rāma, Lakṣmī, rasa), Upaniṣad-ānanda-maya (Taittirīya *ānando brahma*), Vedic stotras
- **Light support:** Dinacharya (everyday gratitude)
- **Very sparse:** BG 2.47 — joy × work_career (karma-yoga-joy-of-the-craft) ONLY
- **Avoid / exclude:** Niti, Sankhya, Tantric-Shaiva, Yamas/Niyamas (cultivation register wrong for ānanda), BG as dominant
- **BG placement:** NEAR-EXCLUDED — Ch 2.47 for joy × work_career (secondary context) only
- **Why:** Joy is ānanda, not dharma-as-outcome. BG is action/detachment-inflected. Only karma-yoga-joy-of-the-craft earns a place; the rest of BG desiccates joy.

---

## Cross-room distinctness enforcement

Rules that must hold in pool authoring:

1. **Stillness ≠ Release:** Yoga-Sūtra/Vedanta vs Shaiva/Tantric. If any mantra/practice can serve both, it should serve only one. Current violation: `mantra.soham` in stillness+connection (not release, but same structural issue); `yoga_sutras_one_anchor_when_scattered` in stillness+clarity.
2. **Growth ≠ Joy:** Gita/Dharma/Yamas vs Bhakti/Upaniṣad/rasa. Sankalps in growth = "I practice / I return / I honor." Sankalps in joy = "I notice / I bless / I offer." The verb-register must hold.
3. **Connection ≠ Joy:** Both use Bhakti but connection is *reaching toward* (relational-japa); joy is *celebrating what is* (offering). Mantras with deity = Viṣṇu/Kṛṣṇa/Rāma can serve both but must be tagged with different emotional_function (`deepen` vs `offer`).
4. **Clarity ≠ Growth:** Both accept 7 contexts but clarity = *viveka* (discriminating what is); growth = *abhyāsa* (practicing what becomes). Principle selection must keep this contrast.

---

## References

- `docs/room_system_v31/ROOM_SYSTEM_STRATEGY_V1.md` §1 §5 §8
- `docs/room_system_v31/audits/CONTENT_CLASS_AUDIT_V2.md`
- `docs/room_system_v31/audits/LIBRARY_UTILIZATION_AUDIT_V2.md`
- `docs/room_system_v31/audits/CONTENT_INTEGRITY_V2.md`
- `docs/room_system_v31/audits/SURFACE_ISOLATION_AUDIT_V2.md`
