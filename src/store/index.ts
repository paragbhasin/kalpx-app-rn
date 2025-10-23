import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  cancelBookingReducer,
  classesBookingsReducer,
  classesExploreReducer,
  myBookingsFilterReducer,
  rescheduleReducer,
  searchBookingsReducer,
  searchClassesReducer,
  slotsListReducer,
} from "../screens/Classes/reducers";
import {
  completeMantraReducer,
  dailyDharmaTrackerReducer,
  practiceStreaksReducer,
  practiceTodayReducer,
  startMantraReducer,
  submitDharmaReducer,
  trackPracticeReducer,
} from "../screens/Home/reducers";
import { loginReducer } from "../screens/Login/reducers";
import { profileDetailsReducer, profileOptionsReducer, updateProfileReducer } from "../screens/Profile/reducers";
import { dailyPracticeReducer, practiceReducer } from "../screens/Streak/reducers";
import snackBarReducer from "./snackBarSlice";

// 1️⃣ Combine all reducers normally
const appReducer = combineReducers({
  login: loginReducer,
  snackBar: snackBarReducer,
  classesExploreReducer,
  classesBookingsReducer,
  slotsListReducer,
  rescheduleReducer,
  cancelBookingReducer,
  myBookingsFilterReducer,
  searchClassesReducer,
  searchBookingsReducer,
  practiceReducer,
  dailyPracticeReducer,
  practiceTodayReducer,
  startMantraReducer,
  completeMantraReducer,
  submitDharmaReducer,
  trackPracticeReducer,
  dailyDharmaTrackerReducer,
  practiceStreaksReducer,
  profileOptionsReducer,
  profileDetailsReducer,
  updateProfileReducer
});

// 2️⃣ Add a root reducer that can reset everything on logout
const rootReducer = (state: any, action: any) => {
  if (action.type === "RESET_APP") {
    state = undefined; // clears all slices
  }
  return appReducer(state, action);
};

// 3️⃣ Create the store
export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;



// import { configureStore } from '@reduxjs/toolkit';
// import { cancelBookingReducer, classesBookingsReducer, classesExploreReducer, myBookingsFilterReducer, rescheduleReducer, searchBookingsReducer, searchClassesReducer, slotsListReducer } from '../screens/Classes/reducers';
// import { completeMantraReducer, dailyDharmaTrackerReducer, practiceStreaksReducer, practiceTodayReducer, startMantraReducer, submitDharmaReducer, trackPracticeReducer } from '../screens/Home/reducers';
// import { loginReducer } from '../screens/Login/reducers';
// import { dailyPracticeReducer, practiceReducer } from '../screens/Streak/reducers';
// import snackBarReducer from './snackBarSlice';

// export const store = configureStore({
//   reducer: {
//     login: loginReducer,
//     snackBar: snackBarReducer,
//     classesExploreReducer,
//     classesBookingsReducer,
//     slotsListReducer,
//     rescheduleReducer, 
//     cancelBookingReducer,
//     myBookingsFilterReducer,
//     searchClassesReducer,
//     searchBookingsReducer,
//     practiceReducer,
//     dailyPracticeReducer,
//     practiceTodayReducer,
//     startMantraReducer,
//     completeMantraReducer,
//     submitDharmaReducer,
//     trackPracticeReducer,
//     dailyDharmaTrackerReducer,
//     practiceStreaksReducer
//   },
// });

// export type RootState = ReturnType<typeof store.getState>;
// export default store;
