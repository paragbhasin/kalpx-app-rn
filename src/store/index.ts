import { combineReducers, configureStore } from "@reduxjs/toolkit";

// ================= CLASSES MODULE =================
import {
  cancelBookingReducer,
  classesBookingsReducer,
  classesExploreReducer,
  classesFilterExploreReducer,
  myBookingsFilterReducer,
  releaseHoldReducer,
  rescheduleReducer,
  searchBookingsReducer,
  searchClassesReducer,
  slotsListReducer,
} from "../screens/Classes/reducers";

// ================= HOME MODULE =================
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

// ================= LOGIN MODULE =================
import { loginReducer, socialLoginReducer } from "../screens/Login/reducers";

// ================= PROFILE MODULE =================
import {
  deleteAccountReducer,
  profileDetailsReducer,
  profileOptionsReducer,
  updateProfileReducer,
} from "../screens/Profile/reducers";

// ================= STREAK MODULE =================
import {
  dailyPracticeReducer,
  practiceReducer,
} from "../screens/Streak/reducers";

// ================= COMMON =================
import snackBarReducer from "./snackBarSlice";

// =============================================================
// 🧩 COMBINE ALL REDUCERS
// =============================================================
const appReducer = combineReducers({
  // Auth & global
  login: loginReducer,
  snackBar: snackBarReducer,

  // Classes Module
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

  // Streak & Practice
  practiceReducer,
  dailyPracticeReducer,
  practiceTodayReducer,
  startMantraReducer,
  completeMantraReducer,
  submitDharmaReducer,
  trackPracticeReducer,
  dailyDharmaTrackerReducer,
  practiceStreaksReducer,

  // Profile
  profileOptionsReducer,
  profileDetailsReducer,
  updateProfileReducer,
  deleteAccountReducer,

  // Videos
  videoCategoriesReducer,
  videosReducer,

  // Login
  socialLoginReducer,
});

// =============================================================
// 🔄 ROOT REDUCER (for global reset on logout)
// =============================================================
const rootReducer = (state: any, action: any) => {
  if (action.type === "RESET_APP") {
    state = undefined; // clears all slices
  }
  return appReducer(state, action);
};

// =============================================================
// 🏪 CONFIGURE STORE — THUNK IS INCLUDED BY DEFAULT
// =============================================================
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true, // ✅ RTK includes redux-thunk by default
      serializableCheck: false, // ✅ disable serializable warnings
    }),
});

// =============================================================
// 🔎 TYPES
// =============================================================
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;





// import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import {
//   cancelBookingReducer,
//   classesBookingsReducer,
//   classesExploreReducer,
//   classesFilterExploreReducer,
//   myBookingsFilterReducer,
//   releaseHoldReducer,
//   rescheduleReducer,
//   searchBookingsReducer,
//   searchClassesReducer,
//   slotsListReducer,
// } from "../screens/Classes/reducers";
// import {
//   completeMantraReducer,
//   dailyDharmaTrackerReducer,
//   practiceStreaksReducer,
//   practiceTodayReducer,
//   startMantraReducer,
//   submitDharmaReducer,
//   trackPracticeReducer,
//   videoCategoriesReducer,
//   videosReducer,
// } from "../screens/Home/reducers";
// import { loginReducer, socialLoginReducer } from "../screens/Login/reducers";
// import {
//   deleteAccountReducer,
//   profileDetailsReducer,
//   profileOptionsReducer,
//   updateProfileReducer,
// } from "../screens/Profile/reducers";
// import { dailyPracticeReducer, practiceReducer } from "../screens/Streak/reducers";
// import snackBarReducer from "./snackBarSlice";
// const appReducer = combineReducers({
//   // Auth & global
//   login: loginReducer,
//   snackBar: snackBarReducer,
//   classesExploreReducer,
//   classesBookingsReducer,
//   classesFilterExploreReducer,
//   myBookingsFilterReducer,
//   searchClassesReducer,
//   searchBookingsReducer,
//   slotsListReducer,
//   rescheduleReducer,
//   cancelBookingReducer,
//   releaseHoldReducer,
//   practiceReducer,
//   dailyPracticeReducer,
//   practiceTodayReducer,
//   startMantraReducer,
//   completeMantraReducer,
//   submitDharmaReducer,
//   trackPracticeReducer,
//   dailyDharmaTrackerReducer,
//   practiceStreaksReducer,
//   profileOptionsReducer,
//   profileDetailsReducer,
//   updateProfileReducer,
//   deleteAccountReducer,
//   videoCategoriesReducer,
//   videosReducer,
//   socialLoginReducer
// });
// const rootReducer = (state: any, action: any) => {
//   if (action.type === "RESET_APP") {
//     state = undefined; // clears all slices
//   }
//   return appReducer(state, action);
// };

// export const store = configureStore({
//   reducer: rootReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false, 
//     }),
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// export default store;





// import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import {
//   cancelBookingReducer,
//   classesBookingsReducer,
//   classesExploreReducer,
//   classesFilterExploreReducer,
//   myBookingsFilterReducer,
//   releaseHoldReducer,
//   rescheduleReducer,
//   searchBookingsReducer,
//   searchClassesReducer,
//   slotsListReducer,
// } from "../screens/Classes/reducers";
// import {
//   completeMantraReducer,
//   dailyDharmaTrackerReducer,
//   practiceStreaksReducer,
//   practiceTodayReducer,
//   startMantraReducer,
//   submitDharmaReducer,
//   trackPracticeReducer,
//   videoCategoriesReducer,
//   videosReducer,
// } from "../screens/Home/reducers";
// import { loginReducer } from "../screens/Login/reducers";
// import { deleteAccountReducer, profileDetailsReducer, profileOptionsReducer, updateProfileReducer } from "../screens/Profile/reducers";
// import { dailyPracticeReducer, practiceReducer } from "../screens/Streak/reducers";
// import snackBarReducer from "./snackBarSlice";

// // 1️⃣ Combine all reducers normally
// const appReducer = combineReducers({
//   login: loginReducer,
//   snackBar: snackBarReducer,
//   classesExploreReducer,
//   classesBookingsReducer,
//   slotsListReducer,
//   rescheduleReducer,
//   cancelBookingReducer,
//   myBookingsFilterReducer,
//   searchClassesReducer,
//   searchBookingsReducer,
//   practiceReducer,
//   dailyPracticeReducer,
//   practiceTodayReducer,
//   startMantraReducer,
//   completeMantraReducer,
//   submitDharmaReducer,
//   trackPracticeReducer,
//   dailyDharmaTrackerReducer,
//   practiceStreaksReducer,
//   profileOptionsReducer,
//   profileDetailsReducer,
//   updateProfileReducer,
//   deleteAccountReducer,
//   videoCategoriesReducer,
//   videosReducer,
//   releaseHoldReducer,
//   classesFilterExploreReducer
// });

// // 2️⃣ Add a root reducer that can reset everything on logout
// const rootReducer = (state: any, action: any) => {
//   if (action.type === "RESET_APP") {
//     state = undefined; // clears all slices
//   }
//   return appReducer(state, action);
// };

// // 3️⃣ Create the store
// export const store = configureStore({
//   reducer: rootReducer,
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
// export default store;



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
