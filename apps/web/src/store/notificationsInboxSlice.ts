import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { NotificationsInboxState } from '@kalpx/types';
import { fetchNotifications, markNotificationsRead } from '../lib/notificationsApi';

const initialState: NotificationsInboxState = {
  loading: false,
  data: [],
  error: null,
  page: 1,
  hasMore: true,
};

export const loadNotifications = createAsyncThunk(
  'notificationsInbox/load',
  async ({ page, reset }: { page: number; reset?: boolean }) => {
    const result = await fetchNotifications(page);
    return { ...result, page, reset: reset ?? false };
  },
);

export const markRead = createAsyncThunk(
  'notificationsInbox/markRead',
  async (ids: number[]) => {
    await markNotificationsRead(ids);
    return ids;
  },
);

const notificationsInboxSlice = createSlice({
  name: 'notificationsInbox',
  initialState,
  reducers: {
    reset() { return initialState; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotifications.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.page = action.payload.page;
        state.data = action.payload.reset
          ? action.payload.items
          : [...state.data, ...action.payload.items];
        state.hasMore = action.payload.items.length > 0;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load notifications';
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const ids = new Set(action.payload);
        state.data = state.data.map((n) => ids.has(n.id) ? { ...n, read: true } : n);
      });
  },
});

export const { reset: resetNotificationsInbox } = notificationsInboxSlice.actions;
export default notificationsInboxSlice.reducer;
