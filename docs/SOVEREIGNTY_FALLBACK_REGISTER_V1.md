# Sovereignty Fallback Register V1

**Status:** living. Owner: Delivery Restoration program. Ticket: MDR-M-5.
**Purpose:** authoritative registry of FE hardcoded English fallbacks that violate the sovereignty rule (user-visible copy MUST come from backend ContentPack / envelope, not TSX literals). This register tracks known exceptions and their planned resolutions.

## Sovereignty rule

Every user-visible string in FE must be sourced from backend ContentPack or journey envelope. TSX literal fallbacks are acceptable ONLY for:
- TestIDs and a11y identifiers (not user-facing).
- Console / debug / dev-only strings.
- Structural UI labels explicitly grandfathered as "factual UI labels" (documented per-surface).

All other hardcoded fallbacks must be retired to ContentPack slots or enforced as required envelope fields.

## P1 — Dashboard + core runners (user sees every session)

| # | File:Line | Hardcoded string | Fix |
|---|---|---|---|
| P1-1 | `src/blocks/dashboard/GreetingCard.tsx:51` | `"You're here. Begin wherever feels right."` | Add `M_new_dashboard_greeting / fallback_context` slot; envelope-driven. |
| P1-2 | `src/blocks/CoreItemsList.tsx:37,38,44,45,51,52` | 6 triad title/description fallbacks: `"Today's anchor"`, `"Anchor when the mind gets loud."`, `"Today's vow"`, `"Today's quiet promise."`, `"Today's practice"`, `"A small act of steadiness."` | 6 envelope slots: `card_{mantra,sankalpa,ritual}_{title,description}_fallback`. Enforce backend to ship these non-empty. |
| P1-3 | `src/blocks/CycleProgressBlock.tsx:110-122` | 4 metric labels: `"Days engaged"`, `"Fully completed"`, `"Trigger sessions"`, `"Daily rhythm"` | Enforce `cycle_metrics` payload schema with required `*_label` fields; drop TSX fallbacks. |

## P2 — Support + onboarding + checkpoints

| # | File:Line | Hardcoded string | Fix |
|---|---|---|---|
| P2-1 | `src/blocks/HoldButtonBlock.tsx:93` | `"Hold to Confirm"` | Enforce `block.label` required; schema validation. |
| P2-2 | `src/blocks/TextInputBlock.tsx:41` | `"Type here..."` | Backend must provide `block.placeholder`; no TSX fallback. |
| P2-3 | `src/blocks/OptionPickerBlock.tsx:41,49` | `"Select an option..."`, `"Choose"` | Add `select_default_text` + `modal_title_fallback` ContentPack slots. |
| P2-4 | `src/blocks/TextareaBlock.tsx:40` | `"Write your intention..."` | Backend must provide `block.placeholder`; no TSX fallback. |
| P2-5 | `src/blocks/SankalpDisplayBlock.tsx:18` | `"Let me be present with what is."` | Require `companion.sankalp.core.line` non-null; backend validation. |
| P2-6 | `src/blocks/SeasonChangeBanner.tsx:37-39` | `"The season is shifting."`, `"Slower mornings land well now."` | Add `M44_season_signal / fallback_headline + fallback_message` slots. |

## Grandfathered (documented exceptions — NOT violations)

| File:Line | String | Justification |
|---|---|---|
| `src/blocks/dashboard/QuickSupportBlock.tsx:55,61` | `"I Feel Triggered"`, `"More support"` | Factual UI labels pre-Track 1 legacy. Documented per file docstring comment. |
| `src/blocks/ResilienceNarrativeCard.tsx:96-100` | Slot-driven tone-linted narratives | COMPLIANT — fallback sourced from ContentPack M26_resilience_narrative_card via `slot()` helper. |

## Minor (tech debt, P3)

| File:Line | Note |
|---|---|
| `src/blocks/AdditionalItemsSectionBlock.tsx:256` | `"Additional Practices"` section header — recommend move to slot or enforce via block schema. |
| `src/blocks/RepCounterBlock.tsx:99-108` | `"TAP THE BEAD"`, `"AFTER EACH MANTRA"` — functional labels, i18n tech debt. |

## Resolution tracking

- **Batch M-C M-5 (2026-04-19):** Audit produced this registry. Individual fixes deferred to Sprint 2/3 (estimated 8-12 story points to close all P1/P2 items).
- **Sprint 2 priority:** close all P1 items before broader Sprint 2 scope begins.
- **Sprint 3 priority:** close P2 + retire P3 tech debt.

## Sovereignty reviewer rule

Any new FE block/screen that adds TSX literal user-visible copy MUST:
1. Open an entry in this register at the time of PR.
2. Name the ContentPack slot or envelope field that will eventually source the string.
3. Get reviewed against the P1/P2/grandfathered rubric before merging.
