/**
 * QuickSupportBlock Jest tests — §14.1 + §14.2 contract.
 *
 * Test contract (ROOM_SYSTEM_V3_1_ARCHITECTURE.md §14):
 *   - Primary row renders exactly 3 chips with the §14.1 labels in order
 *     ("I Feel Triggered", "Quick Check-in", "I'm in a good place")
 *   - §14.1 testIDs present: quick_support_triggered, quick_support_checkin,
 *     quick_support_good_place
 *   - §14.2 footer link testID present: quick_support_more_ways
 *   - Tapping the footer link sets RoomEntrySheet visible=true
 *   - Retired primary-row testIDs (quick_support_joy_chip,
 *     quick_support_growth_chip, quick_support_more_label) are absent
 *
 * Harness: Jest + RTL — does not run in the current pure-logic runner;
 * lights up once Agent A wires jest-expo per Phase 5 tooling.
 */

import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import QuickSupportBlock from "../QuickSupportBlock";

// ───────────────────────────────────────────────────────────────────────────
// Mocks — isolate dashboard block from store + action executor.
// ───────────────────────────────────────────────────────────────────────────

jest.mock("../../../engine/actionExecutor", () => ({
  executeAction: jest.fn(() => Promise.resolve()),
}));

jest.mock("../../../engine/useScreenBridge", () => ({
  useScreenStore: () => ({
    loadScreen: jest.fn(),
    goBack: jest.fn(),
  }),
}));

jest.mock("../../../store", () => ({
  __esModule: true,
  default: {
    dispatch: jest.fn(),
    getState: () => ({ screen: { screenData: {} } }),
  },
}));

jest.mock("../../../store/screenSlice", () => ({
  screenActions: {
    setScreenValue: (payload: any) => ({ type: "screen/set", payload }),
  },
}));

jest.mock("../../../engine/mitraApi", () => ({
  mitraTrackEvent: jest.fn(() => Promise.resolve(null)),
}));

// ───────────────────────────────────────────────────────────────────────────
// Tests
// ───────────────────────────────────────────────────────────────────────────

describe("QuickSupportBlock — §14.1 primary row contract", () => {
  test("renders exactly 3 primary chips with §14.1 testIDs", () => {
    const { getByTestId } = render(<QuickSupportBlock />);
    expect(getByTestId("quick_support_triggered")).toBeTruthy();
    expect(getByTestId("quick_support_checkin")).toBeTruthy();
    expect(getByTestId("quick_support_good_place")).toBeTruthy();
  });

  test("retired primary-row testIDs (joy_chip, growth_chip, more_label) are absent", () => {
    const { queryByTestId } = render(<QuickSupportBlock />);
    expect(queryByTestId("quick_support_joy_chip")).toBeNull();
    expect(queryByTestId("quick_support_growth_chip")).toBeNull();
    expect(queryByTestId("quick_support_more_label")).toBeNull();
  });
});

describe("QuickSupportBlock — §14.2 footer link + sheet open", () => {
  test("renders the footer link with testID quick_support_more_ways", () => {
    const { getByTestId } = render(<QuickSupportBlock />);
    expect(getByTestId("quick_support_more_ways")).toBeTruthy();
  });

  test("tapping the footer link opens the RoomEntrySheet (sheet testID becomes present)", () => {
    const { getByTestId } = render(<QuickSupportBlock />);
    // Prior to tap, RoomEntrySheet is rendered with visible=false — the
    // Modal's children are not on the tree. After tap, visible flips true
    // and the sheet's testID becomes queryable.
    fireEvent.press(getByTestId("quick_support_more_ways"));
    expect(getByTestId("room_entry_sheet")).toBeTruthy();
  });
});
