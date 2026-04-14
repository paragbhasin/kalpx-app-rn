/**
 * ReflectionWeeklyContainer — Mitra v3 Moment 23 route container.
 *
 * Spec: /Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_reflection_weekly.md
 * Web parity: kalpx-frontend/src/containers/CycleTransitionsContainer.vue
 *   (reflection layout) and src/engine/ScreenRenderer.vue container routing.
 *
 * Single-route render. Delegates block rendering to BlockRenderer, with a
 * safe-area top and a neutral cream backdrop consistent with the letter's
 * reading tone.
 *
 * REG-016: child block (WeeklyReflectionBlock) is itself responsible for its
 * bottom thumb-zone CTA placement; container simply provides a
 * keyboard-aware full-height frame.
 */

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import BlockRenderer from "../engine/BlockRenderer";
import { getWeeklyReflectionData } from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";
import api from "../Networks/axios";

interface Props {
  schema: any;
}

const ReflectionWeeklyContainer: React.FC<Props> = ({ schema }) => {
  const { screenData } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const cycleDay = ss.cycle_day || ss.day_number;

  // G20 — letter is backend-generated. On mount: kick off generation (POST),
  // then poll GET. Spec §6: POST is 202 if already generating; GET returns
  // status=generating until ready. Poll every 2s up to 30s, then surface
  // error state via block's empty branch.
  useEffect(() => {
    let cancelled = false;
    const setVal = (key: string, value: any) =>
      store.dispatch(screenActions.setScreenValue({ key, value }));

    const fetchLetter = async () => {
      // Kick off generation if needed (idempotent on backend).
      try {
        await api.post("mitra/journey/weekly-reflection/", { cycle_day: cycleDay });
      } catch {
        /* already generating or flagged-off; GET will tell us the state */
      }

      const start = Date.now();
      while (!cancelled && Date.now() - start < 30000) {
        const letter = await getWeeklyReflectionData(cycleDay);
        if (cancelled) return;
        if (letter && letter.status && letter.status !== "generating" && letter.status !== "pending") {
          setVal("weekly_reflection_letter", letter);
          return;
        }
        if (letter) setVal("weekly_reflection_letter", letter); // keep generating state visible
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!cancelled) setVal("weekly_reflection_letter", { status: "error" });
    };

    if (!ss.weekly_reflection_letter || ss.weekly_reflection_letter.status === "generating") {
      fetchLetter();
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleDay]);

  return (
    <View style={styles.root}>
      {schema.blocks?.map((block: any, idx: number) => (
        <BlockRenderer
          key={block.id || `${block.type}-${idx}`}
          block={block}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fdf9ee" },
});

export default ReflectionWeeklyContainer;
