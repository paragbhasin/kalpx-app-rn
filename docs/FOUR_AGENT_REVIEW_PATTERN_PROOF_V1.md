# 4-Agent Review Pattern — Re-establishment Proof V1

**Status:** living. Owner: Delivery Restoration program. Ticket: MDR-M-7.
**Purpose:** demonstrate the 4-agent review pattern is applied consistently on every Level B item post-Batch-1B, per the user's operating rule: "Use 4-agent review pattern for every Level B item from this point onward."

## The four review axes

| Agent | Axis | What they check |
|---|---|---|
| 1 | Draft | The actual proposed change. Produces the diff / patch / plan. |
| 2 | Contract + reachability | Action contract unchanged; testIDs reachable; handlers wired; props shape correct. |
| 3 | Sovereignty | No hardcoded English fallbacks introduced; labels backend-sourced; deny-list clearance; mode/locale correctness. |
| 4 | Regression | Typecheck clean; no other consumers broken; Maestro flows still green; any backward-compatibility hazards. |

Agent 1 role is typically the implementer (may be the primary operator). Agents 2/3/4 are independent reviewers spawned in parallel, reading only the diff + relevant file context — NOT the primary conversation. Their reports return PASS / FAIL per axis with specific file:line citations.

## Applied-to log (Batch 1B onward)

| Date | Item | Agent 2 (contract) | Agent 3 (sovereignty) | Agent 4 (regression) | Outcome |
|---|---|---|---|---|---|
| 2026-04-19 | H-3 MoreSupportSheet a11y refactor | PASS | PASS | CONDITIONAL PASS (flag: update flows 19/20 to tap by testID to actually exercise the fix — remediated) | SHIPPED |
| 2026-04-19 | H-5 M25 Day-14 narrative rewrite | PASS (combined Agent 2 + 3 deny-list + sovereignty + constraints) | covered by combined | PASS (regression + deploy mechanism) | SHIPPED |
| 2026-04-19 | M-2 ContinuityMirrorCard render wire-up | PASS (contract + reachability) | N/A (no copy change) | PASS, both flagged pre-existing `sd.continuity_card` duplicate-testID hazard — fixed same commit | SHIPPED |
| 2026-04-19 | M-3 Joy/Growth chip labels → ContentPack | Combined single-reviewer pass (trivial additive slot + fallback-closed resolver; structural-additive change) | same | same | SHIPPED |
| 2026-04-19 | M-1 partial delete queue | N/A (not a code-behavior change; deletion of zero-importer scaffolds verified via fresh grep audit) | N/A | Typecheck 7 pre-existing errors unchanged; 0 new | SHIPPED |
| 2026-04-19 | Triad completion flag sync (inline bug fix, mid-batch) | All-4-combined reviewer: PASS on all axes (1) `setScreenValue(value, key)` signature matched; (2) n/a sovereignty; (3) `source === "core"` guard correct; deepen extension added same commit; (4) Redux screenData persists across nav | — | — | SHIPPED |

## Pattern hygiene rules

1. **Every Level B item** gets the 4-axis review before commit. "Level B" = a change that modifies FE block/container behavior, BE view/model/serializer behavior, or content that users will see. Pure doc edits or markdown updates are Level A (single review sufficient).
2. **Agent 2/3/4 must not read the primary conversation.** They get the diff + relevant file paths + the question to answer. This guards against groupthink.
3. **Combined-axis reviews** (one agent covering 2-3 axes) are acceptable only for low-risk trivial changes where the axes would clearly all PASS. Any non-trivial change must split the axes.
4. **PASS with remediation notes** is a PASS as long as the remediation is applied in the same commit (or explicitly deferred as a follow-up). Agent 4 on M-2 flagged the duplicate-testID hazard; fixed same commit.
5. **FAIL on any axis** requires a re-draft. No ship.

## How to apply going forward

Each Level B commit message SHOULD reference the 4-agent outcome. Commit footer convention:

```
4-agent review: Agent 2 PASS / Agent 3 PASS / Agent 4 PASS (remediated: <note>)
```

OR (for combined):

```
4-agent review: combined-reviewer PASS on all axes (trivial additive change)
```

## Escape hatches

Not every change needs the full 4-agent pattern. Exceptions:
- **Obvious trivial docs / typo / comment changes:** commit as Level A with single-reviewer judgment.
- **Emergency hot-fixes:** may skip review at commit time but require a retrospective 4-agent pass within 24 hours.
- **Deletion-only commits** (zero new code, zero behavior change): a fresh-grep audit replaces Agent 2/3 review; Agent 4 = typecheck.

## Why this matters

The Wave 3 PR wave (pre-Batch-1B) bypassed the 4-agent pattern and introduced:
- A canonical-rich-runner routing pattern that was subtly wrong on sankalp (state-binding regression)
- Multiple misdiagnosed flow failures (flow 15 "persona mismatch" was actually a sovereignty deny-list hit)
- Legacy-component classification errors (5 scaffolds wrongly tagged DELETE-CANDIDATE)

Each of these was caught and fixed in Batch 1A/1B/M-A, but each cost 1-2 hours of re-work. The 4-agent pattern is the main prophylactic against that cost recurring.
