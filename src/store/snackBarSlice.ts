import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  visible: false,
  message: "",
};

const snackBarSlice = createSlice({
  name: "snackBar",
  initialState,
  reducers: {
    showSnackBar: (state, action) => {
      state.visible = true;
      state.message = action.payload;
    },
    hideSnackBar: (state) => {
      state.visible = false;
      state.message = "";
    },
  },
});

export const { showSnackBar, hideSnackBar } = snackBarSlice.actions;
export default snackBarSlice.reducer;
