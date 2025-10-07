import { configureStore } from '@reduxjs/toolkit';
import { classesBookingsReducer, classesExploreReducer } from '../screens/Classes/reducers';
import { loginReducer } from '../screens/Login/reducers';
import snackBarReducer from './snackBarSlice';

export const store = configureStore({
  reducer: {
    login: loginReducer,
    snackBar: snackBarReducer,
    classesExploreReducer,
    classesBookingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
