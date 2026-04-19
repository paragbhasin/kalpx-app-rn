# Additional Items on the Mitra Dashboard — disposition

**Status:** disposition locked 2026-04-18 (Metro-surfaced parity finding).
**Owner:** Delivery Restoration.
**Reference tickets:** Metro smoke of Sprint 1 dashboard (post-CP-1).

## Classification

**TEMPORARY PARITY GAP → RESTORED NOW.**

- Not "intentional product removal" — legacy `CompanionDashboardContainer` rendered `AdditionalItemsSectionBlock`; the new dashboard silently dropped it. No founder decision was recorded that mapped the legacy surface to a new equivalent.
- Not "regression" in the strict code sense — the surface was never ported in the Track 1 launch; the delta was noted in-comment but never tracked as an open ticket.
- Is "temporary parity gap" pending the eventual M30 `recommended_additional` ContentPack authoring.

## Decision

Restore `AdditionalItemsSectionBlock` on `NewDashboardContainer` immediately. The block self-hides when no items are seeded, so restoring it does not introduce user-visible empty state when the backend has nothing to serve. This closes the parity gap while M30 authoring continues.

## What changed

- `src/containers/NewDashboardContainer.tsx` — import + render `AdditionalItemsSectionBlock` after `QuickSupportBlock`, before the voice bar.
- Block reads `screenData.additional_items` per its existing contract (unchanged).
- No backend change; no new API endpoint.

## Follow-ups (open items — tracked, not blocking)

1. **M30 `recommended_additional` ContentPack authoring** — still the target content authority. When M30 ships, it replaces the generic list surface with a daily curated recommendation.
2. **Ensure seeded personas populate additional items** — current test personas may not have any additional content, which will render the block as empty. Fix via `seed_canonical_smoke_persona` or explicit dev-seed additions.
3. **Recommended additional card priority ranking** — `NewDashboardContainer.tsx:236` comment listed this as priority #7 of intelligence cards. Re-evaluate at M30 launch whether it lives above or below `QuickSupportBlock`.

## Why this is NOT "known gap, log it"

Per bug-fix rulebook (2026-04-18): *"document the decision and test accordingly. Do not leave it as 'known gap' without disposition."* The disposition is: **restore now**. The test: Maestro flow asserting block renders when `additional_items` is seeded, and self-hides when empty. That flow is added to `.maestro/silk-integrity/` in a follow-up commit.

## What WILL block prod rollout

- If M30 authoring changes the shape (e.g., replaces `additional_items` list with `recommended_additional_card`), `AdditionalItemsSectionBlock` must be retired at the same time. Do not let parity restoration become its own permanent pattern.
- Regression test: Silk Integrity pack includes a dashboard smoke that asserts the block's visibility state matches backend state.
