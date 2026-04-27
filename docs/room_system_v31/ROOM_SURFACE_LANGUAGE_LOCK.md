# Room Surface Language Lock

**Locked:** 2026-04-22  
**Authority:** Founder-locked. Do not revise without explicit decision.

---

## Canonical Term Definitions

### "teaching"
The wisdom surface in **room_clarity only**.  
Rendered as `RoomActionTeachingPill` — a tappable pill in `actions[]` with `action_type: "teaching"` and an authored `teaching_payload`.  
Tap opens `WhyThisL2Sheet` with full principle body + optional "Go deeper" CTA.  
**Only use this term for the clarity pill.**

### "banner wisdom" (or "principle banner")
The wisdom surface in **stillness, growth, connection, release, and joy**.  
Rendered as `RoomPrincipleBanner` — a tappable element above `actions[]`, sourced from `envelope.principle_banner` (not in `actions[]`).  
Tap opens `WhyThisL2Sheet` using `principle_id` from the banner object.  
`wisdom_anchor_line` is the one-line quote displayed inline. Full body loads via fetch.  
**Only use this term for the 5-room banner.**

### "step/practice" (or just "step")
The guided practice surface in **all 6 rooms**.  
Rendered as `RoomActionStepPill` → `StepModal`.  
Step IS the practice surface. There is no separate "practice" user-facing surface.  
Template variants: breathe, walk_timer, grounding, hand_on_heart, text_input_name_short, text_input_name_full.  
**Do not call this "practice" in product copy. Use "step" or the specific action label.**

### "practice fallback"
An internal backend lane in `room_selection.py`.  
Fires only when the step pool returns empty — which does not happen in any active room.  
**Never product-facing. Never user-visible. Do not use in product copy or FE code.**

### "carry"
A sacred-write surface present in growth (journal), connection (named), and joy (carry/named).  
Rendered as `RoomActionCarryPill`.  
Tap writes a `writes_event` sacred trace to BE + Redux session store.  
No modal — the tap itself is the gesture.

### "inquiry"
A reflective branching surface present in clarity and growth only.  
Rendered as `RoomActionInquiryPill` → `InquiryModal`.  
2-screen flow: category list → detail with anchor line + practice prompt.

### "runner"
The main practice/offering surface. All 6 rooms have at least one runner.  
Rendered as `RoomActionRunnerPill`.  
Types: `runner_mantra` (all rooms), `runner_sankalp` (joy only).  
Tap navigates to `cycle_transitions/offering_reveal`.

---

## Locked Rules

| Rule | Statement |
|------|-----------|
| Wisdom visibility | Wisdom surfaces appear only where tapping produces real content. No cosmetic-only wisdom. |
| Teaching pill scope | Clarity only. Other rooms use banner wisdom. |
| Banner wisdom scope | Stillness, growth, connection, release, joy. Clarity uses teaching pill instead. |
| Step = practice | Step is the practice surface. "Practice fallback" is internal only. |
| No animation | No opening animation. No stagger. No delayed reveal. Immediate render. |
| Dead taps | Zero tolerance. Any user-visible tap target must produce a real result. |

---

## Anti-patterns (Do not use)

| Banned phrase | Why | Use instead |
|--------------|-----|-------------|
| "practice surface" as separate from step | Practice and step are the same surface | "step" or the specific label |
| "opening animation", "stagger", "delayed reveal" | Not implemented, not planned | "immediate render" |
| "Phase 4 animation driver" | Animation is off permanently | — (omit entirely) |
| "practice fallback" in product copy | Internal only | — (omit entirely) |
| "principle banner tap is a stub" | No longer true | "banner wisdom opens WhyThisL2Sheet" |
