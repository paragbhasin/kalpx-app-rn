/**
 * notificationsSlice — push notification state.
 *
 * NOTE (Week 8 handoff): `registerForNotifications` currently stubs the native
 * APNs/FCM bridge. Week 8 will wire in @react-native-firebase/messaging and
 * resolve the real token; interface stays the same.
 *
 * Not persisted — token should be re-acquired on every app launch.
 */

import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from '@reduxjs/toolkit';

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

// ---------------------------------------------------------------------------
// Thunk — stub only. Week 8 will replace the body with actual native bridge.
// ---------------------------------------------------------------------------

export const registerForNotifications = createAsyncThunk(
  'notifications/register',
  async (): Promise<{
    token: string | null;
    permission_status: PermissionStatus;
  }> => {
    // Interface stub — no native bridge yet.
    console.log(
      '[notifications] registerForNotifications stub — Week 8 will wire native',
    );
    return { token: null, permission_status: 'unknown' };
  },
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

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

export const {
  setToken,
  setPermissionStatus,
  setPendingDeepLink,
  clearPendingDeepLink,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
