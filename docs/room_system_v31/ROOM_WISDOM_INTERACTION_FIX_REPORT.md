# Room Wisdom Interaction Fix Report

**Date:** 2026-04-22  
**Branch:** journey-v3-fe  
**Scope:** RoomPrincipleBanner.tsx — banner tap wiring for 5 rooms (stillness, growth, connection, release, joy)

---

## Problem Statement

`RoomPrincipleBanner` wrapped `RoomActionBannerScalar` in a `TouchableOpacity` with `onPress={() => {}}`. This was a dead no-op stub from the original Phase 5 scaffolding. The banner was therefore:
- Visually tappable (ripple feedback, accessibility role="text" wrongly set)
- Producing no result on tap
- A false affordance visible to users in 5 of 6 rooms

`room_clarity` was never affected — it uses `RoomActionTeachingPill` (a real action in `actions[]` with `teaching_payload`) and emits `null` for `principle_banner`.

---

## Decision: Option A — Wire the tap

Option B (make non-tappable) was rejected. The scaffolding existed for a reason: the banner object already carries `principle_id` and `principle_name`, matching the exact data the `open_why_this_l2` dispatch needs. Stripping the tap would force a repeat implementation pass later. Wiring now is one clean change with no new dependencies.

---

## Implementation

**File:** `src/blocks/room/RoomPrincipleBanner.tsx`

**Before:**
```tsx
<TouchableOpacity
  accessibilityRole="text"
  style={styles.wrap}
  activeOpacity={1}
  onPress={() => {}}
>
```

**After:**
```tsx
const { loadScreen, goBack } = useScreenStore();

const onPress = () => {
  const ctx = buildActionCtx({ loadScreen, goBack });
  ctx.setScreenValue(
    {
      id: banner.principle_id,
      name: banner.principle_name,
      principle_name: banner.principle_name,
      body: banner.wisdom_anchor_line,  // placeholder until fetch resolves
      sources: [],
    },
    "why_this_principle",
  );
  executeAction(
    { type: "open_why_this_l2", payload: { principle_id: banner.principle_id } } as any,
    ctx,
  ).catch(() => {});
};

<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="View wisdom"
  style={styles.wrap}
  activeOpacity={0.7}
  onPress={onPress}
>
```

**Imports added:**
- `executeAction` from `../../engine/actionExecutor`
- `useScreenStore` from `../../engine/useScreenBridge`
- `buildActionCtx` from `./actions/actionContextHelper`

**Behavior sequence:**
1. User taps banner
2. `wisdom_anchor_line` stamped immediately as `why_this_principle.body` → sheet renders with one-line placeholder
3. `open_why_this_l2` handler fires with `principle_id` → BE fetches full principle body + sources
4. Sheet updates with authoritative content
5. Optional "Go deeper" CTA appears if the principle has deep content

This is identical to the `RoomActionTeachingPill` pattern. No new infrastructure, same dispatch, same sheet.

---

## Verification Checklist

| Room | Banner present | Tap fires | Dispatch type | What user sees |
|------|---------------|-----------|---------------|----------------|
| room_stillness | Yes | Yes | `open_why_this_l2` | WhyThisL2Sheet with stillness principle body |
| room_growth | Yes | Yes | `open_why_this_l2` | WhyThisL2Sheet with growth principle body |
| room_connection | Yes | Yes | `open_why_this_l2` | WhyThisL2Sheet with connection principle body |
| room_release | Yes | Yes | `open_why_this_l2` | WhyThisL2Sheet with release principle body |
| room_joy | Yes | Yes | `open_why_this_l2` | WhyThisL2Sheet with joy principle body |
| room_clarity | No banner | n/a | n/a | Teaching pill handles this room |

**No dead `onPress`.** All 5 banner rooms now produce a real result on tap.

---

## Accessibility correction

The stub used `accessibilityRole="text"` — incorrect for a tappable element. The fix sets `accessibilityRole="button"` and adds `accessibilityLabel="View wisdom"`. This was a silent a11y bug in addition to the UX bug.

---

## Known limitations (not blockers)

- **`principle_name` slug**: BE returns the slug (e.g., `gita_chain_from_dwelling_to_fall`) as `principle_name`, not the display name. The WhyThisL2Sheet header will show the slug until the handler fetch resolves and overwrites with the DB display name. This is a BE content bug, tracked as Wave N cleanup.
- **Fetch latency**: First render shows `wisdom_anchor_line` as placeholder body. On slow connections there is a visible update. Acceptable — consistent with how the teaching pill also overwrites on fetch.
