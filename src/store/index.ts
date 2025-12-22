import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  cancelBookingReducer,
  classesBookingsReducer,
  classesExploreReducer,
  classesFilterExploreReducer,
  classesTutorListReducer,
  myBookingsFilterReducer,
  releaseHoldReducer,
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
  videoCategoriesReducer,
  videosReducer,
} from "../screens/Home/reducers";
import { loginReducer, socialLoginReducer } from "../screens/Login/reducers";
import { notificationsReducer } from "../screens/Notifications/reducers";
import {
  deleteAccountReducer,
  profileDetailsReducer,
  profileOptionsReducer,
  updateProfileReducer,
} from "../screens/Profile/reducers";
import { socialExploreReducer } from "../screens/Social/reducers";
import {
  dailyPracticeReducer,
  practiceReducer,
} from "../screens/Streak/reducers";
import snackBarReducer from "./snackBarSlice";

const appReducer = combineReducers({
  login: loginReducer,
  snackBar: snackBarReducer,
  classesExploreReducer,
  classesBookingsReducer,
  classesFilterExploreReducer,
  myBookingsFilterReducer,
  searchClassesReducer,
  searchBookingsReducer,
  slotsListReducer,
  rescheduleReducer,
  cancelBookingReducer,
  releaseHoldReducer,
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
  updateProfileReducer,
  deleteAccountReducer,
  videoCategoriesReducer,
  videosReducer,
  socialLoginReducer,
  classesTutorListReducer,
  notificationsReducer,
  socialExplore: socialExploreReducer,
});
const rootReducer = (state: any, action: any) => {
  if (action.type === "RESET_APP") {
    state = undefined; // clears all slices
  }
  return appReducer(state, action);
};
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true, // ✅ RTK includes redux-thunk by default
      serializableCheck: false, // ✅ disable serializable warnings
    }),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;