/**
 * NewDashboardContainer
 *
 * Current Mitra dashboard entry point. The previous dashboard body was removed:
 * the default dashboard surface is now InnerPathScreen.
 */

import React from "react";
import InnerPathDashboardScreen from "../screens/Mitra/InnerPathScreen";
import RhythmHomeScreen from "../screens/Mitra/RhythmHomeScreen";
import RhythmSetupScreen from "../screens/Mitra/RhythmSetupScreen";
import { useScreenStore } from "../engine/useScreenBridge";

type Schema = {
  blocks?: any[];
  dashboard_config?: Record<string, any>;
};

type Props = {
  schema?: Schema;
};

const NewDashboardContainer: React.FC<Props> = () => {
  const screenData = useScreenStore((state) => state.screenData);
  const sd = (screenData ?? {}) as Record<string, any>;

  if (sd.dashboard_entry_surface === "my_rhythm") {
    return <RhythmHomeScreen embedded />;
  }

  if (sd.dashboard_entry_surface === "my_rhythm_setup") {
    return <RhythmSetupScreen embedded />;
  }

  if (sd.dashboard_entry_surface === "my_rhythm_edit") {
    return <RhythmSetupScreen editMode embedded />;
  }

  return <InnerPathDashboardScreen embedded />;
};

export default NewDashboardContainer;
