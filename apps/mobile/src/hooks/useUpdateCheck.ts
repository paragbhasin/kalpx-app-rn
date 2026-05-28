import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import VersionCheck from "react-native-version-check-expo";

const DISMISSED_KEY = "update_popup_dismissed_date";

// "1.2.3" → [1, 2, 3]
function parseVersion(v: string): number[] {
  return String(v)
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
}

// Returns true when `latest` is strictly newer than `current`
function isNewer(current: string, latest: string): boolean {
  const c = parseVersion(current);
  const l = parseVersion(latest);
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

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const dismissedDate = await AsyncStorage.getItem(DISMISSED_KEY);
        if (dismissedDate === todayDateString()) return; // user dismissed today

        const current =
          Constants.expoConfig?.version ??
          (await VersionCheck.getCurrentVersion());

        const options =
          Platform.OS === "android"
            ? { packageName: "com.kalpx.app", country: "in" }
            : { bundleId: "com.kalpx.app", country: "in" };
        const latest = await VersionCheck.getLatestVersion(options);

        if (!active) return;
        if (latest && isNewer(String(current), String(latest))) {
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
    try {
      await AsyncStorage.setItem(DISMISSED_KEY, todayDateString());
    } catch {
      // Ignore storage errors
    }
  }, []);

  return { showUpdate, dismissUpdate };
}
