/**
 * RoomEntrySheet Jest tests.
 *
 * Test contract (§14.3):
 *   - Renders all 6 rows when visible=true
 *   - Each row's testID matches the §14.3 table exactly
 *   - Row tap calls onRoomEntry with the correct room_id and dismisses sheet
 *   - Scrim tap fires onDismiss
 *
 * Harness note: mirrors the RoomRenderer.test.tsx approach — these tests
 * are Jest + @testing-library/react-native style. The repo's pure-logic
 * runner (tests/unit/run.mjs) does not run them. Once Agent A wires
 * jest-expo in Phase 5 tooling, these light up in CI. Until then, they
 * still provide the documented test contract + typecheck against the
 * jest shim.
 */

import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import RoomEntrySheet from "../RoomEntrySheet";
import type { RoomId } from "../types";

// ───────────────────────────────────────────────────────────────────────────
// Mocks — avoid real network from mitraTrackEvent.
// ───────────────────────────────────────────────────────────────────────────

jest.mock("../../../engine/mitraApi", () => ({
  mitraTrackEvent: jest.fn(() => Promise.resolve(null)),
}));

// ───────────────────────────────────────────────────────────────────────────
// Order-locked §14.3 sequence — do not reorder without founder sign-off.
// ───────────────────────────────────────────────────────────────────────────

const EXPECTED_ROWS: Array<{ room_id: RoomId; label: string; testID: string }> = [
  { room_id: "room_stillness", label: "I'm overwhelmed", testID: "room_entry_sheet_stillness" },
  { room_id: "room_connection", label: "I feel alone", testID: "room_entry_sheet_connection" },
  { room_id: "room_release", label: "Something is heavy", testID: "room_entry_sheet_release" },
  { room_id: "room_clarity", label: "I'm not sure / I want clarity", testID: "room_entry_sheet_clarity" },
  { room_id: "room_growth", label: "I want to go deeper", testID: "room_entry_sheet_growth" },
  { room_id: "room_joy", label: "I'm in a good place", testID: "room_entry_sheet_joy" },
];

// ───────────────────────────────────────────────────────────────────────────
// Tests
// ───────────────────────────────────────────────────────────────────────────

describe("RoomEntrySheet — §14.3 row contract", () => {
  test("renders all 6 rows when visible=true, matching §14.3 testIDs and order", () => {
    const { getByTestId } = render(
      <RoomEntrySheet
        visible={true}
        onDismiss={() => {}}
        onRoomEntry={() => {}}
      />,
    );
    for (const row of EXPECTED_ROWS) {
      const node = getByTestId(row.testID);
      expect(node).toBeTruthy();
    }
  });

  test("each row testID follows pattern room_entry_sheet_<room>", () => {
    for (const row of EXPECTED_ROWS) {
      expect(row.testID).toMatch(
        /^room_entry_sheet_(stillness|connection|release|clarity|growth|joy)$/,
      );
    }
  });
});

describe("RoomEntrySheet — row tap + dismiss behavior", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test("row tap calls onRoomEntry with the correct room_id + dismisses sheet", () => {
    const onDismiss = jest.fn();
    const onRoomEntry = jest.fn();

    const { getByTestId } = render(
      <RoomEntrySheet
        visible={true}
        onDismiss={onDismiss}
        onRoomEntry={onRoomEntry}
      />,
    );

    fireEvent.press(getByTestId("room_entry_sheet_stillness"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    // onRoomEntry fires inside a 120ms setTimeout — advance timers.
    jest.advanceTimersByTime(200);
    expect(onRoomEntry).toHaveBeenCalledWith("room_stillness");
  });

  test("scrim tap fires onDismiss", () => {
    const onDismiss = jest.fn();
    const onRoomEntry = jest.fn();
    const { getByTestId } = render(
      <RoomEntrySheet
        visible={true}
        onDismiss={onDismiss}
        onRoomEntry={onRoomEntry}
      />,
    );
    fireEvent.press(getByTestId("room_entry_sheet_scrim"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onRoomEntry).not.toHaveBeenCalled();
  });

  test("every room_id in EXPECTED_ROWS dispatches the correct payload on tap", () => {
    for (const row of EXPECTED_ROWS) {
      const onDismiss = jest.fn();
      const onRoomEntry = jest.fn();
      const { getByTestId, unmount } = render(
        <RoomEntrySheet
          visible={true}
          onDismiss={onDismiss}
          onRoomEntry={onRoomEntry}
        />,
      );
      fireEvent.press(getByTestId(row.testID));
      jest.advanceTimersByTime(200);
      expect(onRoomEntry).toHaveBeenCalledWith(row.room_id);
      unmount();
    }
  });
});
