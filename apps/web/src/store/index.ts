import { configureStore } from '@reduxjs/toolkit';
import screenReducer from './screenSlice';
import mitraReducer from './mitraSlice';
import companionStateReducer from './companionStateSlice';
import preferencesReducer from './preferencesSlice';
import notificationsReducer from './notificationsSlice';
import snackBarReducer from './snackBarSlice';

export const store = configureStore({
  reducer: {
    screen: screenReducer,
    mitra: mitraReducer,
    companionState: companionStateReducer,
    preferences: preferencesReducer,
    notifications: notificationsReducer,
    snackBar: snackBarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
