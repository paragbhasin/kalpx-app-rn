import { useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  mitraTrackEvent,
  postGratitudeLedger,
} from "../../../engine/mitraApi";
import type { CompletionVariant } from "../../../constants/completionCopy";

/**
 * Saves a post-completion reflection the same way CommunityCompletionReturn
 * does — analytics event + gratitude ledger. Returns the onSubmit handler to
 * pass to RunnerCompletionView's reflection input.
 */
export function useCompletionReflection(
  itemType: CompletionVariant,
  itemId?: string,
) {
  const { showToast } = useToast();

  return useCallback(
    (text: string, responseType: "text" | "voice") => {
      const trimmed = text.trim();
      if (!trimmed) return;

      mitraTrackEvent("post_completion_reflection", {
        meta: {
          item_type: itemType,
          item_id: itemId ?? null,
          text: trimmed.slice(0, 120),
          response_type: responseType,
        },
      }).catch(() => {});

      postGratitudeLedger({
        signal_type: "post_completion_reflection",
        text: trimmed,
        meta: { item_type: itemType, item_id: itemId ?? null },
        logged_at: new Date().toISOString(),
      }).catch(() => {});

      showToast("Reflection saved", 2500, "success");
    },
    [itemType, itemId, showToast],
  );
}
