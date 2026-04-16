/**
 * useContentSlots — Phase D shared FE call-site helper.
 *
 * One hook consolidates the pattern that Phase C pilots inlined in each
 * block: on mount, resolve a moment's slots via
 * `mitraResolveMoment(momentId, ctx)` and stash the response under
 * `screenData[screenDataKey]` so the component's readSlot() helpers
 * return real strings.
 *
 * Contract (CONTENT_CONTRACT_V1.md §5, ORCHESTRATION_CONTRACT_V1.md §4):
 *   - Null-safe: on resolver failure (404 / offline / malformed ctx),
 *     the hook stores nothing. readSlot() returns "" and the UI renders
 *     blank rather than falling back to TSX English.
 *   - Fire-once: a ref guards against duplicate dispatches on re-mount.
 *   - Early-return when screenData[screenDataKey] is already an object
 *     (e.g. server-side injection or prior mount).
 *
 * Ctx builder: callers pass a function that receives the current
 * `screenData` and returns the MomentContextShape for their surface.
 * This keeps the fixed PresentationContext fields (user_attention_state,
 * emotional_weight) co-located with each block — they are declared, not
 * inferred.
 *
 * Usage:
 *
 *   useContentSlots({
 *     momentId: "M23_weekly_reflection",
 *     screenDataKey: "weekly_reflection",
 *     buildCtx: (ss) => ({
 *       path: "support",
 *       guidance_mode: ss.guidance_mode || "hybrid",
 *       locale: ss.locale || "en",
 *       user_attention_state: "reflective_exposed",
 *       emotional_weight: "moderate",
 *       cycle_day: Number(ss.day_number) || 0,
 *       entered_via: ss._entered_via || "dashboard_card",
 *       stage_signals: {},
 *       today_layer: {},
 *       life_layer: {
 *         cycle_id: ss.journey_id || ss.cycle_id || "",
 *         life_kosha: ss.life_kosha || ss.scan_focus || "",
 *         scan_focus: ss.scan_focus || "",
 *       },
 *     }),
 *   });
 *
 * The 4 Phase C pilots (M35/M46/M24/M47) keep their inlined
 * useEffect bodies for historical traceability; all new migrations use
 * this hook.
 */

import { useEffect, useRef } from "react";

import { mitraResolveMoment, type MomentContextShape } from "../engine/mitraApi";
import store from "../store";
import { screenActions } from "../store/screenSlice";
import { useScreenStore } from "../engine/useScreenBridge";

export interface UseContentSlotsArgs {
  /** Moment id as declared in the registry (e.g. "M23_weekly_reflection"). */
  momentId: string;
  /** Key under screenData where slots will be stored. */
  screenDataKey: string;
  /** Builds the context payload from current screenData. */
  buildCtx: (screenData: Record<string, any>) => MomentContextShape;
  /** Optional request id for correlating with MitraDecisionLog. */
  requestId?: string;
}

export function useContentSlots({
  momentId,
  screenDataKey,
  buildCtx,
  requestId,
}: UseContentSlotsArgs): void {
  const { screenData } = useScreenStore();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    const ss = screenData as Record<string, any>;
    if (ss[screenDataKey] && typeof ss[screenDataKey] === "object") {
      // Already populated (prior mount or server-side seed).
      firedRef.current = true;
      return;
    }
    firedRef.current = true;

    let cancelled = false;
    (async () => {
      const ctx = buildCtx(ss);
      const payload = await mitraResolveMoment(momentId, ctx, requestId);
      if (cancelled || !payload) return;
      store.dispatch(
        screenActions.setScreenValue({
          key: screenDataKey,
          value: payload.slots,
        }),
      );
    })();

    return () => {
      cancelled = true;
    };
    // deliberately empty deps — fire-once per block mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Null-safe slot read helper matching the Phase C pattern. Returns ""
 * when the slot is missing — no English fallback allowed per the
 * sovereignty rule.
 */
export function readMomentSlot(
  screenData: Record<string, any>,
  screenDataKey: string,
  slotName: string,
): string {
  const moment = screenData?.[screenDataKey];
  if (moment && typeof moment === "object" && typeof moment[slotName] === "string") {
    return moment[slotName];
  }
  return "";
}
