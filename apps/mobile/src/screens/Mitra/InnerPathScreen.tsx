/**
 * InnerPathScreen — S11 mobile parity of the web InnerPathPage.
 *
 * Entry-view routing on mount:
 *   daily_view              → render focused inner-path layout
 *   day_7_view / day_14_view → ingest + load checkpoint, replace with DynamicEngine
 *   welcome_back_surface     → replace with DynamicEngine
 *   onboarding_start / null  → replace with DynamicEngine
 *   unknown                  → replace with DynamicEngine (safe fallback)
 *
 * Common engine: uses the same mitraJourneyEntryView + mitraJourneyDailyView +
 * ingestDailyView pipeline as the web InnerPathPage. TriadCardsRow is the
 * shared zero-props block that reads from Redux screenData and fires start_runner
 * via the existing actionExecutor. Runner containers are rendered by DynamicEngine
 * (ScreenRenderer); InnerPathScreen detects the container transition via a Redux
 * selector and hands off to DynamicEngine automatically.
 *
 * Do NOT render:
 *   - greeting.headline ("Good morning")
 *   - Four-Door invitation copy
 *   - QuickSupportBlock / AdditionalItems / Room menus
 */

import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import CycleProgressBlock from "../../blocks/dashboard/CycleProgressBlock";
import PathChip from "../../blocks/dashboard/PathChip";
import SankalpCarryBlock from "../../blocks/dashboard/SankalpCarryBlock";
import TriadCardsRow from "../../blocks/dashboard/TriadCardsRow";
import { mitraJourneyDailyView, mitraJourneyEntryView } from "../../engine/mitraApi";
import { ingestDay14View, ingestDay7View, ingestDailyView } from "../../engine/v3Ingest";
import type { RootState } from "../../store";
import { loadScreenWithData, screenActions } from "../../store/screenSlice";

// Runner containers that require DynamicEngine to render.
// When TriadCardsRow fires start_runner → loadScreen({ container_id: "cycle_transitions" }),
// the selector below detects the change and navigates to DynamicEngine.
const RUNNER_CONTAINERS = new Set(["cycle_transitions"]);

export default function InnerPathScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // After daily-view data is loaded, watch for runner container transitions.
  const watchRunnerRef = useRef(false);
  const currentContainerId = useSelector(
    (state: RootState) => state.screen.currentContainerId,
  );

  useEffect(() => {
    if (!watchRunnerRef.current) return;
    if (RUNNER_CONTAINERS.has(currentContainerId)) {
      navigation.navigate("DynamicEngine" as any);
    }
  }, [currentContainerId, navigation]);

  // Common engine — same pipeline as web InnerPathPage.
  useEffect(() => {
    let cancelled = false;

    const writeAll = (flat: Record<string, any>) => {
      for (const [k, v] of Object.entries(flat)) {
        if (v !== undefined) {
          dispatch(screenActions.setScreenValue({ key: k, value: v }));
        }
      }
    };

    (async () => {
      try {
        const entryResult = await mitraJourneyEntryView();
        if (cancelled) return;

        const target = entryResult.envelope?.target;
        const viewKey = target?.view_key;
        const payload = target?.payload ?? {};

        if (viewKey === "day_7_view") {
          writeAll(ingestDay7View(payload as any));
          dispatch(screenActions.setScreenValue({ key: "checkpoint_day", value: 7 }));
          dispatch(loadScreenWithData({ containerId: "checkpoint_reflection", stateId: "day_7" }) as any);
          navigation.replace("DynamicEngine" as any);
          return;
        }

        if (viewKey === "day_14_view") {
          writeAll(ingestDay14View(payload as any));
          dispatch(screenActions.setScreenValue({ key: "checkpoint_day", value: 14 }));
          dispatch(loadScreenWithData({ containerId: "checkpoint_reflection", stateId: "day_14" }) as any);
          navigation.replace("DynamicEngine" as any);
          return;
        }

        if (!viewKey || viewKey === "onboarding_start" || viewKey === "welcome_back_surface") {
          navigation.replace("DynamicEngine" as any);
          return;
        }

        if (viewKey !== "daily_view") {
          navigation.replace("DynamicEngine" as any);
          return;
        }

        // daily_view — fetch and ingest daily data.
        const dailyResult = await mitraJourneyDailyView(null);
        if (cancelled) return;

        if (dailyResult.notModified || !dailyResult.envelope) {
          setError("Your path is preparing — try again in a moment.");
          setLoading(false);
          return;
        }

        const flat = ingestDailyView(dailyResult.envelope);
        writeAll(flat);

        // Arm the runner-container watcher only after data is safely in Redux.
        watchRunnerRef.current = true;
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Could not load your path.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigation]);

  const sd = useSelector((state: any) => state.screen?.screenData ?? {});

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="small" color="#C99317" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.retryBtn}
          >
            <Text style={styles.retryBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inner Path</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Path identity — Day X of 14 · path label */}
        <View style={styles.identityBlock}>
          <Text style={styles.dayLabel}>
            Day {sd.day_number} of {sd.total_days}
            {sd.journey_path_label ? ` · ${sd.journey_path_label}` : ""}
          </Text>
          {!!sd.greeting_context && (
            <Text style={styles.supportingLine}>{sd.greeting_context}</Text>
          )}
        </View>

        {/* Triad — mantra / sankalp / practice */}
        <TriadCardsRow />

        {/* Path identity chip */}
        <PathChip screenData={sd} />

        {/* Cycle / day progress */}
        <CycleProgressBlock screenData={sd} />

        {/* Sankalp carry-over */}
        <SankalpCarryBlock screenData={sd} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF8EF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(201,168,76,0.2)",
  },
  backText: {
    fontSize: 15,
    color: "#C99317",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#432104",
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 80,
  },
  identityBlock: {
    marginBottom: 20,
  },
  dayLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: "#432104",
    marginBottom: 6,
    lineHeight: 28,
  },
  supportingLine: {
    fontSize: 15,
    color: "#7B6550",
    lineHeight: 22,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: "#7B6550",
    textAlign: "center",
    marginBottom: 20,
  },
  retryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: "#C99317",
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
