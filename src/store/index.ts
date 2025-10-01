
import { configureStore } from '@reduxjs/toolkit';
import { loginReducer } from '../screens/Login/reducers';
import snackBarReducer from './snackBarSlice';


export const store = configureStore({
  reducer: {
    login: loginReducer,
    snackBar: snackBarReducer,
  },
});

export default store;
