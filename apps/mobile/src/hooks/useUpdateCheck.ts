import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import VersionCheck from "react-native-version-check-expo";

export type UpdateType = "soft" | "force";

const DISMISSED_KEY = "update_popup_dismissed_date";

// true = force update (no Later button), false = soft update (Later button shows)
const FORCE_UPDATE = true;

function parseVersion(v: string): number[] {
  return String(v)
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
}

// Returns true when `candidate` is strictly newer than `current`
function isNewer(current: string, candidate: string): boolean {
  const c = parseVersion(current);
  const l = parseVersion(candidate);
  for (let i = 0; i < 3; i++) {
    const cv = c[i] ?? 0;
    const lv = l[i] ?? 0;
    if (lv > cv) return true;
    if (lv < cv) return false;
  }
  return false;
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export function useUpdateCheck() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateType, setUpdateType] = useState<UpdateType>("soft");

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const current =
          Constants.expoConfig?.version ??
          (await VersionCheck.getCurrentVersion());
        const currentStr = String(current);

        const options =
          Platform.OS === "android"
            ? { packageName: "com.kalpx.app", country: "in" }
            : { bundleId: "com.kalpx.app", country: "in" };
        const latest = await VersionCheck.getLatestVersion(options);

        if (!active || !latest) return;

        const latestStr = String(latest);

        if (FORCE_UPDATE) {
          setUpdateType("force");
          setShowUpdate(true);
          return;
        }

        if (isNewer(currentStr, latestStr)) {
          // Newer version available but not critical — soft update with daily snooze
          const dismissedDate = await AsyncStorage.getItem(DISMISSED_KEY);
          if (dismissedDate === todayDateString()) return;
          if (!active) return;
          setUpdateType("soft");
          setShowUpdate(true);
        }
      } catch {
        // Never crash on version check failure (offline, store error, etc.)
      }
    };

    check();
    return () => {
      active = false;
    };
  }, []);

  const dismissUpdate = useCallback(async () => {
    setShowUpdate(false);
    // Force updates are not snoozable — re-check every launch
    if (updateType === "soft") {
      try {
        await AsyncStorage.setItem(DISMISSED_KEY, todayDateString());
      } catch {
        // Ignore storage errors
      }
    }
  }, [updateType]);

  return { showUpdate, updateType, dismissUpdate };
}
