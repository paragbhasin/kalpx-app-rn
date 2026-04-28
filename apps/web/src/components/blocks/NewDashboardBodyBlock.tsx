/**
 * NewDashboardBodyBlock — Phase 7.
 * Smart block rendered by companion_dashboard_v3/day_active.
 * Composes all dashboard sub-components from screenData.
 * Manages WhyThis sheet open/close state locally.
 */

import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { updateScreenData } from "../../store/screenSlice";
import { AdditionalItemsSectionBlock } from "./dashboard/AdditionalItemsSectionBlock";
import { ContinuityBanner } from "./dashboard/ContinuityBanner";
import { CycleProgressBlock } from "./dashboard/CycleProgressBlock";
import { GreetingCard } from "./dashboard/GreetingCard";
import { PathChip } from "./dashboard/PathChip";
import { QuickSupportBlock } from "./dashboard/QuickSupportBlock";
import { SankalpCarryBlock } from "./dashboard/SankalpCarryBlock";
import { TriadCardsRow } from "./dashboard/TriadCardsRow";
import { WhyThisSheet } from "./dashboard/WhyThisSheet";

interface Props {
  block?: Record<string, any>;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function NewDashboardBodyBlock({ screenData, onAction }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [whyThisOpen, setWhyThisOpen] = useState(false);
  const sd = screenData || {};

  const handleBackFromL3 = useCallback(() => {
    dispatch(
      updateScreenData({ why_this_overlay_level: "l2", why_this_source: null }),
    );
  }, [dispatch]);

  const hasWhyThis =
    (Array.isArray(sd.why_this_l1_items) && sd.why_this_l1_items.length > 0) ||
    !!sd.why_this?.level1;

  const hasContinuity = sd.continuity?.tier && sd.continuity.tier !== "none";
  const hasSankalpCarry =
    Array.isArray(sd.sankalp_how_to_live) && sd.sankalp_how_to_live.length > 0;
  const hasAdditional =
    Array.isArray(sd.additional_items) && sd.additional_items.length > 0;

  return (
    <div>
      <GreetingCard sd={sd} />

      {/* Path chips row — focus phrase + journey path, mirrors RN */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,

          justifyContent: "space-between",
        }}
      >
        {sd.focus_phrase && (
          <span
            data-testid="focus-phrase-chip"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 10,
              padding: "5px 10px",
              borderRadius: 14,
              background: "#f7eed1",
              fontSize: 13,
              border: "1px solid var(--kalpx-gold-hairline)",
              fontStyle: "italic",
            }}
          >
            {sd.focus_phrase as string}
          </span>
        )}
        <PathChip sd={sd} />
      </div>

      <TriadCardsRow sd={sd} onAction={onAction} />

      {/* WHY THIS — simple text link matching RN; sheet opened below */}
      {hasWhyThis && (
        <button
          onClick={() => setWhyThisOpen(true)}
          data-testid="why-this-link"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#D4A017",
            fontSize: 18,
            fontFamily: "var(--kalpx-font-serif)",
            fontWeight: 600,
            padding: "4px 0",
            marginBottom: 16,
          }}
        >
          Why this was chosen →
        </button>
      )}

      {hasContinuity && <ContinuityBanner sd={sd} />}

      <CycleProgressBlock sd={sd} />

      {hasSankalpCarry && <SankalpCarryBlock sd={sd} />}

      <QuickSupportBlock onAction={onAction} />

      {hasAdditional && (
        <AdditionalItemsSectionBlock sd={sd} onAction={onAction} />
      )}

      {whyThisOpen && (
        <WhyThisSheet
          sd={sd}
          onClose={() => setWhyThisOpen(false)}
          onAction={onAction}
          onBackFromL3={handleBackFromL3}
        />
      )}
    </div>
  );
}
