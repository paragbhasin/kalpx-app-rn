# Room Context Final Contract
**Status:** LOCKED 2026-04-21  
**Owner:** Founder  
**Canonical source:** `LIFE_CONTEXT_ARCHITECTURE_LOCKED.md` + `ROOM_SYSTEM_STRATEGY_V1.md`

---

## Operating Matrix

| Room | Picker | Primary context-responsive surface | Secondary context-responsive surface | Must remain universal | Proof status | What product may claim | What product must NOT claim |
|---|---|---|---|---|---|---|---|
| **room_clarity** | **SHOWN** (Phase 1 proven) | Teaching lane — `_fetch_wisdom_asset_for_teaching` selects from pool rotation_refs, preferring context-exclusive items. Proven via 80-render proof (C1–C5 PASS). | — | Mantra: state-driven (Saraswati/Gayatri register). Practice: state-driven. | **PROVEN on dev (0144 applied, Path B live)** | "Teachings are chosen for your life context." "Your clarity session reflects where you actually are." | "Your entire session is personalized." "Mantra is chosen for your context." |
| **room_growth** | **SHOWN** (Phase 1 proven) | Wisdom banner lane — `_fetch_wisdom_asset_for_banner` selects from pool rotation_refs, same mechanism as clarity teaching. Proven via 80-render proof. | Sankalp (Phase 2 gate — pool exists, Layer 2 Rule 5 not yet proven separately) | Mantra: state-driven. Practice: state-driven. Sankalp cold-start anchor: currently universal (see anchor gap note). | **BANNER PROVEN on dev. Sankalp not yet proven.** | "Your growth session opens with a banner chosen for your life context." | "Your entire growth session is personalized." "Sankalp is context-proven." |
| **room_connection** | **HIDDEN** (Phase 2 gate) | Sankalp (Phase 2 — not yet implemented). Banner may receive Layer 1 in a later phase; not in current scope. | — | Mantra: state-driven. Practice: state-driven. Banner: currently universal. | **NOT PROVEN. Operational but not context-responsive.** | "Connection is a space for relating." "Practices support presence and care." | "Connection is personalized to your relationships context." "Your connection session reflects your life situation." |
| **room_release** | **HIDDEN** (Phase 3 gate, if justified) | Possible light banner shaping (register-compatible only: burden/letting-go/surrender). Not in current scope. | — | Mantra: state-driven (Shiva dissolution register). Practice: state-driven (Ayurveda embodied). All selection: register-first. | **NOT PROVEN. Operational but not context-responsive.** | "Release is a space for letting go." "Practices support embodied release." | "Release is personalized to your context." "This session is tailored to what you're holding." |
| **room_joy** | **HIDDEN** (permanent — register-first is the design) | None. Joy is shaped by register (gratitude/blessing/delight/offering/celebration) and subslot. This is permanent architecture, not a phase gap. | — | All surfaces: register/subslot-led permanently. | **UNIVERSAL BY DESIGN. No proof needed or sought.** | "Joy opens in the register of gratitude, blessings, and offering." | "Joy is personalized to your context." "Your joy session reflects your life situation." |
| **room_stillness** | **HIDDEN** (permanent — never) | None. Stillness is pre-cognitive regulation. Life-context differentiation is doctrinally harmful here. Permanent, not a phase gap. | — | All surfaces: universal permanently. `life_context_bias: []` on all refs — confirmed on dev after 0144; prod gate still open. | **UNIVERSAL BY DESIGN. Permanent.** | "Stillness is a space beyond context and circumstance." | "Stillness is personalized." "Your stillness session reflects your life context." Anything implying responsiveness. |

---

## Notes

**Picker logic:** Picker is visible if and only if the room has a PROVEN context-responsive surface. Currently: clarity and growth only. All other rooms: picker hidden. This is enforced in FE until further phase gates pass.

**Growth anchor gap (pending migration):** The growth sankalp pool's cold-start anchor (`sankalp.honor_my_skill`) is biased toward skill/mastery/work_career register. This anchor is served to all users on first visit regardless of context. The fix (migrate anchor to `sankalp.effort_over_outcome`, karma-yoga register) is documented in `ROOM_SYSTEM_FINAL_CLOSEOUT.md §6`. Must complete before the sankalp slot can be declared context-neutral on cold_start.

**Path B mechanism:** Direct pool-ref selection via `_pick_asset_from_refs`. Sorts context-matched candidates by `(len(life_context_bias), asset_id)` ascending — most context-exclusive item wins. Falls back to alphabetical if no context-matched candidates found. This is independent of the wisdom selector's ranking pipeline.

**0144 and prod:** Migration 0144 (bare-string → dict format for pool rotation_refs) was applied on dev before the Phase 1 proof. 0144 is a prod gate — claims are dev-proven only until 0144 is applied on prod.

**Sign-off rules:**
- Life-context architecture change → explicit founder sign-off required; `LIFE_CONTEXT_ARCHITECTURE_LOCKED.md` must be updated in the same change set. No exceptions.
- Structural room/content change (new cross-surface override, room-identity exception, anchor swap, principle-family expansion into a new room, content-fork conflict) → escalate to founder.
- Routine content operations (rotation updates, typo fixes, pool-version bumps, relabels within approved tone and room doctrine) → self-service.
