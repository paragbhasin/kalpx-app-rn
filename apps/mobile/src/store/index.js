import { configureStore } from '@reduxjs/toolkit';
import { cancelBookingReducer, classesBookingsReducer, classesExploreReducer, fetchFilteredExploreBookings, myBookingsFilterReducer, practiceReducer, rescheduleReducer, searchBookingsReducer, searchClassesReducer, slotsListReducer } from '../screens/Classes/reducers';
import { loginReducer } from '../screens/Login/reducers';
import snackBarReducer from './snackBarSlice';

export const store = configureStore({
  reducer: {
    login: loginReducer,
    snackBar: snackBarReducer,
    classesExploreReducer,
    classesBookingsReducer,
    slotsListReducer,
    rescheduleReducer, 
    cancelBookingReducer,
    myBookingsFilterReducer,
    fetchFilteredExploreBookings,
    searchClassesReducer,
    searchBookingsReducer,
    practiceReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
