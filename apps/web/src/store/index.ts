import { configureStore, createAction, combineReducers } from '@reduxjs/toolkit';
import screenReducer from './screenSlice';
import mitraReducer from './mitraSlice';
import companionStateReducer from './companionStateSlice';
import preferencesReducer from './preferencesSlice';
import notificationsReducer from './notificationsSlice';
import snackBarReducer from './snackBarSlice';
import notificationsInboxReducer from './notificationsInboxSlice';
import doorReducer from './doorSlice';

export const resetStore = createAction('store/reset');

const combinedReducer = combineReducers({
  screen: screenReducer,
  mitra: mitraReducer,
  companionState: companionStateReducer,
  preferences: preferencesReducer,
  notifications: notificationsReducer,
  snackBar: snackBarReducer,
  notificationsInbox: notificationsInboxReducer,
  door: doorReducer,
});

type CombinedState = ReturnType<typeof combinedReducer>;

function rootReducer(state: CombinedState | undefined, action: { type: string }) {
  if (action.type === resetStore.type) {
    return combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
}

export const store = configureStore({ reducer: rootReducer });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
