/**
 * resumePendingIfAny — navigate to the appropriate post-login screen
 * based on any pending intent stored in AsyncStorage before the user
 * was authenticated.
 *
 * Extracted from LoginScreen so PhoneOtpVerifyScreen can share it.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import store from "../store";
import { loadScreenWithData, screenActions } from "../store/screenSlice";
import { navigate as rootNavigate } from "../Shared/Routes/NavigationService";
import { mitraJourneyHomeV3 } from "../engine/mitraApi";
import { setSkipMitraStart } from "./postLoginGuard";

export const resumePendingIfAny = async (navigation: any) => {
  try {
    // Program Distribution OS: check for pending program code FIRST
    // so a join deep link captured before login is claimed immediately post-auth.
    const pendingProgramCode = await AsyncStorage.getItem("pending_program_code");
    const pendingProgramSource = await AsyncStorage.getItem("pending_program_source");
    if (pendingProgramCode) {
      navigation.navigate("AppDrawer" as any);
      setTimeout(() => {
        navigation.navigate("ProgramInviteClaimScreen" as any, {
          code: pendingProgramCode,
          source: pendingProgramSource ?? "deep_link",
        });
      }, 400);
      return;
    }

    const mitraIntentionPending = await AsyncStorage.getItem("mitra_intention_pending");
    if (mitraIntentionPending) {
      await AsyncStorage.removeItem("mitra_intention_pending");

      let isReturningUser = false;
      try {
        const homeResp = await mitraJourneyHomeV3({ forceFresh: true });
        const ss = homeResp?.user_surface_state;
        isReturningUser =
          ss?.has_rhythm === true ||
          ss?.has_inner_path === true ||
          ss?.has_quick_chant_mantra === true ||
          ss?.has_quick_chant_history === true ||
          ss?.has_tell_mitra_history === true ||
          ss?.has_quick_checkin_history === true ||
          homeResp?.companion_rhythm?.has_rhythm === true ||
          homeResp?.inner_path_summary?.has_active_path === true;
      } catch {}

      if (isReturningUser) {
        navigation.navigate("AppDrawer" as any);
        return;
      }

      setSkipMitraStart();

      if (mitraIntentionPending === "inner_path") {
        store.dispatch(screenActions.setScreenValue({ key: "onboarding_turn", value: "turn_2" }));
        store.dispatch(screenActions.setScreenValue({ key: "onboarding_draft_state", value: { started_at: Date.now(), entry_intention: "inner_path" } }));
        store.dispatch(loadScreenWithData({ containerId: "welcome_onboarding", stateId: "turn_2", replace: true }) as any);
        navigation.navigate("AppDrawer" as any);
        setTimeout(() => rootNavigate("DynamicEngine"), 400);
        return;
      }

      const screenMap: Record<string, string> = {
        daily_rhythm: "RhythmSetup",
        quick_chant: "QuickReset",
        tell_mitra: "TellMitra",
      };
      const targetScreen = screenMap[mitraIntentionPending];
      if (targetScreen) {
        navigation.navigate("AppDrawer" as any, {
          screen: "HomePage",
          params: { screen: "HomePage", params: { screen: targetScreen } },
        });
        return;
      }
    }

    const pendingKeys = [
      "pending_pooja_data",
      "pending_retreat_data",
      "pending_travel_data",
      "pending_astrology_data",
      "pending_classes_data",
      "pending_daily_practice_data",
      "pending_tracker_edit_data",
    ];

    for (const key of pendingKeys) {
      const pending = await AsyncStorage.getItem(key);
      if (pending) {
        const data = JSON.parse(pending);
        await AsyncStorage.removeItem(key);

        if (key === "pending_tracker_edit_data") {
          navigation.navigate("AppDrawer", {
            screen: "HomePage",
            params: { screen: "HomePage", params: { screen: "TrackerTabs", params: { screen: "History", resumeData: data } } },
          });
          return;
        }

        if (key === "pending_classes_data") {
          navigation.navigate("AppDrawer", {
            screen: "HomePage",
            params: { screen: "HomePage", params: { screen: "ClassBookingScreen", params: { resumeData: data, data: data.classData, reschedule: false } } },
          });
          return;
        }

        const targetScreenMap: Record<string, string> = {
          pending_pooja_data: "Pooja",
          pending_retreat_data: "Retreat",
          pending_travel_data: "Travel",
          pending_astrology_data: "Astrology",
          pending_daily_practice_data: "DailyPracticeSelectList",
        };
        const targetScreen = targetScreenMap[key];
        if (targetScreen) {
          navigation.navigate("AppDrawer", {
            screen: "HomePage",
            params: { screen: "HomePage", params: { screen: targetScreen, params: { resumeData: data } } },
          });
          return;
        }
      }
    }

    navigation.navigate("AppDrawer");
  } catch (err) {
    console.error("resumePendingIfAny error:", err);
    navigation.navigate("AppDrawer");
  }
};
