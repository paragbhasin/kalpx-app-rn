import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MitraHomeV3Response, DoorId, VerifiedRoomId } from '@kalpx/types';

interface TellMitraLocalState {
  inputDraft: string;
  lastResult: {
    suggested_room_id: VerifiedRoomId | null;
    door: DoorId | null;
    response_copy: string;
    suggested_action: string;
  } | null;
}

interface DoorSliceState {
  homeData: MitraHomeV3Response | null;
  hydratedAt: string | null;
  activeDoor: DoorId | null;
  quickReset: {
    source_item_id: string | null;
  };
  tellMitra: TellMitraLocalState;
  pranaContext: {
    prana_type: string;
    opener_text: string;
    chips: string[];
  } | null;
}

const initialState: DoorSliceState = {
  homeData: null,
  hydratedAt: null,
  activeDoor: null,
  quickReset: { source_item_id: null },
  tellMitra: { inputDraft: "", lastResult: null },
  pranaContext: null,
};

const doorSlice = createSlice({
  name: 'door',
  initialState,
  reducers: {
    setHomeData(state, action: PayloadAction<MitraHomeV3Response>) {
      state.homeData = action.payload;
      state.hydratedAt = new Date().toISOString();
      state.quickReset.source_item_id =
        action.payload.quick_reset_summary?.source_item_id ?? null;
    },
    setActiveDoor(state, action: PayloadAction<DoorId | null>) {
      state.activeDoor = action.payload;
    },
    setTellMitraDraft(state, action: PayloadAction<string>) {
      state.tellMitra.inputDraft = action.payload;
    },
    setTellMitraResult(state, action: PayloadAction<TellMitraLocalState['lastResult']>) {
      state.tellMitra.lastResult = action.payload;
      state.tellMitra.inputDraft = "";
    },
    clearDoorState() {
      return initialState;
    },
    setPranaContext(state, action: PayloadAction<{ prana_type: string; opener_text: string; chips: string[] }>) {
      state.pranaContext = action.payload;
    },
    clearPranaContext(state) {
      state.pranaContext = null;
    },
  },
});

export const {
  setHomeData, setActiveDoor,
  setTellMitraDraft, setTellMitraResult, clearDoorState,
  setPranaContext, clearPranaContext,
} = doorSlice.actions;
export default doorSlice.reducer;
