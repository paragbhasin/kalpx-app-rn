import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export type PermissionStatus = 'granted' | 'denied' | 'unknown';

export interface NotificationsSlice {
  token: string | null;
  permission_status: PermissionStatus;
  last_registered_at: number | null;
  pending_deep_link: string | null;
}

const initialState: NotificationsSlice = {
  token: null,
  permission_status: 'unknown',
  last_registered_at: null,
  pending_deep_link: null,
};

export const registerForNotifications = createAsyncThunk(
  'notifications/register',
  async (): Promise<{ token: string | null; permission_status: PermissionStatus }> => {
    // Web Push API integration deferred. Stub for parity.
    return { token: null, permission_status: 'unknown' };
  },
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      state.last_registered_at = action.payload ? Date.now() : null;
    },
    setPermissionStatus(state, action: PayloadAction<PermissionStatus>) {
      state.permission_status = action.payload;
    },
    setPendingDeepLink(state, action: PayloadAction<string | null>) {
      state.pending_deep_link = action.payload;
    },
    clearPendingDeepLink(state) {
      state.pending_deep_link = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerForNotifications.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.permission_status = action.payload.permission_status;
      state.last_registered_at = Date.now();
    });
  },
});

export const { setToken, setPermissionStatus, setPendingDeepLink, clearPendingDeepLink } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
