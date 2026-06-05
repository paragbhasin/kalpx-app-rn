import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MitraHomeV3Response, DoorId } from '@kalpx/types';

export interface DoorSliceState {
  homeData: MitraHomeV3Response | null;
  hydratedAt: string | null;
  activeDoor: DoorId | null;
}

const initialState: DoorSliceState = {
  homeData: null,
  hydratedAt: null,
  activeDoor: null,
};

const doorSlice = createSlice({
  name: 'door',
  initialState,
  reducers: {
    setHomeData(state, action: PayloadAction<MitraHomeV3Response>) {
      state.homeData = action.payload;
      state.hydratedAt = new Date().toISOString();
    },
    clearHomeData(state) {
      state.homeData = null;
      state.hydratedAt = null;
    },
    setActiveDoor(state, action: PayloadAction<DoorId | null>) {
      state.activeDoor = action.payload;
    },
    clearDoorState() {
      return initialState;
    },
  },
});

export const { setHomeData, clearHomeData, setActiveDoor, clearDoorState } = doorSlice.actions;
export default doorSlice.reducer;
