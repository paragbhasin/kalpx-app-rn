# Room System Final Closeout
**Status:** ARCHITECTURALLY LOCKED, SELECTIVELY PROVEN, OPERATIONALLY ALMOST CLOSED  
**Date:** 2026-04-21  
**Owner:** Founder  
**Canonical architecture:** `LIFE_CONTEXT_ARCHITECTURE_LOCKED.md`  
**Canonical strategy:** `ROOM_SYSTEM_STRATEGY_V1.md`

---

## Ship Truth (read this first)

| Room | State |
|---|---|
| **Clarity** | Context-responsive, proven |
| **Growth** | Banner context-responsive, proven. Sankalp not yet proven. |
| **Connection** | Operational. Not yet context-responsive. |
| **Release** | Operational. Not yet context-responsive. |
| **Joy** | Universal by design. Register-first is permanent. |
| **Stillness** | Universal by design. Permanent. |

This is the only authoritative description of what is live. No document in this set may claim more.

---

## 1. What is live (dev, migration 0144 applied)

- **Room render endpoint** (`/api/mitra/rooms/<room_id>/render/`) — 6 rooms operational, gated behind `MITRA_ROOMS_V31` + per-room flags
- **Sacred-write endpoint** (`/api/mitra/rooms/<room_id>/sacred/`) — gated on `MITRA_ROOM_SACRED_KEY`
- **Dashboard chips** (`/api/mitra/rooms/dashboard-chips/`) — aggregate chip strip, all 6 rooms
- **Telemetry** (`/api/mitra/rooms/telemetry/`) — non-sacred event write
- **Path B life-context routing** for clarity (teaching) and growth (banner) — proven via 80-render proof, C1–C5 pass
- **Provenance block** — `life_context_applied`, `lc_applied_item_ids` correctly populated
- **Picker suppression** — picker hidden globally except clarity and growth (Phase 1 proven)
- **Wave 2 content** — 169 new rows (migrations 0132–0143) + 363 tag operations + pool format (0144)
- **F1 applied** — shivoham removed from stillness (0139)
- **BG cap** — 10.6% in clarity, below 15% ceiling (0134/0135 cap logic)
- **12/12 smoke** — passing on dev (post Bug A + Bug B fix, commit `aa8acbbe`)

---

## 2. What is intentionally not live

**By design (permanent — not phases):**
- Stillness context shaping — pre-cognitive regulation space; `life_context_bias: []` on all refs
- Joy Path A/B context shaping — register/subslot-led is the permanent architecture
- Mantra life_context scoring (any room) — state-driven permanently
- Practice life_context scoring (any room) — state-driven permanently

**By phase (future gates exist):**
- Growth sankalp context-responsiveness — Phase 2 gate; pool and Rule 5 wired but proof not run; anchor fix required first
- Connection sankalp (Phase 2) — after growth sankalp proves the pattern
- Connection banner Layer 1 (future) — not in current scope
- Release context shaping (Phase 3) — only if Phase 1 proof justifies it; not a committed phase
- Joy light context tinting (Phase 3 if ever) — register-first is permanent; revisit only with evidence

**By deferral (content work):**
- P1-B Bhakti ingestion migration — authored and reviewed; blocked on S-3/S-5 source verify
- P1-C connection practice ingestion — authored; blocked on C-PD-2 rewrite
- Sankhya/YS balancing in clarity — P2 work item
- Growth × relationships principle fill — P2 work item
- Stillness mantra +1–2 Vedanta-sākṣin rows — Wave 3 / HY3 commission

---

## 3. What is permitted to ship

**Ship now (dev → prod, pending prod gate checklist in §4):**
- All 6 room render/sacred/telemetry endpoints
- Dashboard chips endpoint
- Clarity and growth with picker visible
- All other rooms with picker hidden
- Provenance block including `life_context_applied`

**Do not ship until gate passes:**
- Growth sankalp context claims — anchor fix (P1) + dedicated proof run (P2) required
- P1-B/P1-C content — Track B content gates not yet cleared; content ships separately from core system
- Connection/release/joy context claims — no proof run; phase gates not open

---

## 4. Prod gate checklist

Gates are split into two tracks. Track A must pass before any prod flip of the core room system. Track B is required only before P1-B/P1-C content ingestion migrations are applied to prod — the core system can go to prod without P1-B/P1-C content.

### Track A — Core system prod flip (all must pass)

| # | Gate | Status |
|---|---|---|
| A1 | `MITRA_ROOM_SACRED_KEY` provisioned in prod environment | **OPEN** — P0 blocker |
| A2 | Migration chain 0130 → 0144 applied on prod in order (see `P1_FINAL_SYNTHESIS` for full sequence) | **OPEN** — Note: `models.py` `WisdomPrinciple` class must declare `life_context_bias` field before 0144 runs, or principle pool rotation_refs will be seeded with empty bias and Rule 5 will be silent for principle slots. This does not affect Path B (clarity teaching / growth banner), which reads `WisdomAsset` refs directly. |
| A3 | D-01–D-08 audit: confirm or deny 8 joy-register sankalps in growth pool (read 0132 migration output) | **OPEN** — if confirmed present, write and apply migration 0145 to remove them before prod flip |
| A4 | FE passes `life_context` parameter in room render API calls | **OPEN** — integration contract between FE and `select_room_actions` |
| A5 | Dev 12/12 smoke with fresh salt | **DONE** (post-fix commit `aa8acbbe`) |
| A6 | Prod 12/12 smoke after migration chain applied | **OPEN** — must pass before claiming prod-live |

### Track B — P1-B / P1-C content ingestion gates (separate timing)

These gates block ingesting the 14 Bhakti rows (P1-B) and the 9 connection practice/banner rows (P1-C) only. The core system ships without this content if Track B is incomplete.

| # | Gate | Blocks |
|---|---|---|
| B1 | C-PD-2 `practice.connection_guru_breath` rewrite (guru-lineage assumption removal) | P1-C ingestion |
| B2 | S-3 Tukaram first-line source verify against Tukaram Gāthā | P1-B ingestion |
| B3 | S-5 Nāmdeva first-line source verify against Nāmdeva Gāthā | P1-B ingestion |
| B4 | F-3 founder decision: G-3 dual-tag (accept with rule-hardening OR connection-only) | P1-B ingestion |
| B5 | F-4 S-2 Mirabai: add `exclude_from_contexts: [grief_acute, relationship_rupture_acute]` | P1-B ingestion |

---

## 5. Copy and product truth rules

### What we can say now (dev-proven)

- "Clarity delivers teachings chosen for your life context."
- "Growth opens with a banner chosen for where you actually are."
- "Your session reflects your context." (clarity and growth only)
- Internal team: "Path B is proven for clarity teaching and growth banner. Phase 1 is complete."

### What we must not say (not yet true)

- "All rooms are personalized to your context." — False. Only clarity and growth are proven.
- "KalpX adapts your entire practice to your life situation." — False.
- "Your connection session is shaped by your relationships context." — Not proven.
- "Growth is fully personalized." — Banner is proven. Sankalp is not.
- "Your mantra is chosen for your life context." — Never true. Mantra is state-driven by design.

### What we can only say after a future phase

- "Connection reflects your relational context." — After Phase 2 gate passes.
- "Growth's daily intention is chosen for your context." — After growth sankalp proof.
- "Release is tailored to what you're holding." — After Phase 3 (if justified); not a committed claim.

### What we must never say

- "Stillness is personalized." — Permanent. Never.
- "Your mantra or practice is chosen for your life context." — Permanent. Never.
- "Joy is shaped by your life situation." — Permanent. Register-first is the design.

---

## 6. Open items — P0/P1/P2/P3

**P0 — core prod flip (Track A gates):**
- Provision `MITRA_ROOM_SACRED_KEY` on prod (A1)
- `models.py` WisdomPrinciple class: add `life_context_bias = ArrayField(...)` matching 0135b schema — required before 0144, or principle pool rotation_refs are seeded with empty bias. Does NOT affect Path B (clarity teaching / growth banner). (A2)
- Migration chain 0130–0144 on prod (clean, in order) (A2)
- D-01–D-08 growth sankalp audit (read 0132 output, write 0145 if confirmed) (A3)
- FE integration: pass `life_context` in render requests (A4)
- Prod 12/12 smoke (A6)

**P1 — required before next feature claims (content gates + anchor fix):**
- Growth sankalp anchor swap: migrate `anchor_ref` from `sankalp.honor_my_skill` to `sankalp.effort_over_outcome` in `room_growth/sankalp` pool. Move `honor_my_skill` to rotation. Write as migration 0145 or combine with D-01–D-08 cleanup. Required before the sankalp slot can be claimed context-neutral on cold_start.
- Track B content gates: C-PD-2 rewrite, S-3/S-5 source verify, F-3 founder decision, F-4 Mirabai exclusion tags (see §4 Track B)

**P2 — next build cycle:**
- Growth sankalp dedicated proof (after anchor fix on dev)
- Sankhya/YS pool fill in clarity (20+ Sankhya, 15+ YS rows → bring Nīti below 45%)
- Growth × relationships/self_devotion principle fill (5–8 rows each)
- P1-B ingestion migration (14 Bhakti rows, after Track B S-3/S-5/F-4 clear)
- P1-C ingestion migration (9 connection practice/banner rows + 14 Nīti Phase 2 + 18 growth bias patches, after Track B C-PD-2 clear)

**P3 — post-proof evaluation:**
- Connection Phase 2 (sankalp bias tagging + Layer 2 Rule 5 proof) — after growth sankalp proves the pattern
- Stillness mantra +1–2 Vedanta-sākṣin rows (Wave 3 / HY3 commission)
- Release Phase 3 context shaping — evaluate only after Phase 1 proof data justifies it. Not a committed phase.

---

## 7. Architecture lock

The life-context architecture is locked. The canonical source is `LIFE_CONTEXT_ARCHITECTURE_LOCKED.md`.

**Any change to the life-context architecture requires:**
1. Explicit founder sign-off
2. `LIFE_CONTEXT_ARCHITECTURE_LOCKED.md` updated in the same change set
3. This closeout document updated if the ship-truth section changes

**Structural room/content changes require founder escalation** (new cross-surface overrides, room identity exceptions, anchor swaps, principle-family expansion into a new room, content-fork conflicts). Governed by `ROOM_SYSTEM_STRATEGY_V1.md` §11.

**Self-service content operations** (normal rotation updates, typo fixes, pool-version bumps, non-controversial relabels within approved tone and room doctrine) do not require escalation.

---

## Reconciliation note — 0144 and Phase 1 proof

Migration 0144 converts pool `rotation_refs` from bare strings to dicts carrying `life_context_bias`. Without 0144, `_parse_rotation_refs` sees bare strings and returns `bias=[]` for every ref — context matching cannot fire, and C3 (60%+ bias-matched items) cannot pass.

The Phase 1 proof (C1–C5, 80 renders) was run on dev **with 0144 applied**. The proof is therefore valid and binding for dev.

0144 is not yet applied on prod. Therefore:
- Phase 1 is **dev-proven**
- The picker claim is valid on dev
- The picker claim is **not yet valid on prod** until 0144 (and the full migration chain) is applied there
- The two statements "Phase 1 proof is declared" and "0144 remains a prod gate" are both true and are not in conflict

This reconciliation is final. There is no ambiguity in the document set.
