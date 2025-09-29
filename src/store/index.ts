import { configureStore } from '@reduxjs/toolkit';
// import your reducers
import { loginReducer } from '../screens/Login/reducers';

export const store = configureStore({
  reducer: {
    login: loginReducer,
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware().concat(thunk),
});

export default store;
