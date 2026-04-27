// src/screens/Social/reducers.ts
import {
    EXPLORE_FAILURE,
    EXPLORE_REQUEST,
    EXPLORE_SUCCESS,
} from "./actions";

const initialState = {
  loading: false,
  data: [],
  error: null,
};

export const socialExploreReducer = (state = initialState, action) => {
  switch (action.type) {
    case EXPLORE_REQUEST:
      return { ...state, loading: true, error: null };

    case EXPLORE_SUCCESS:
      console.log("🔥 REDUCER RECEIVED ITEMS:", action.payload.length);
      return { ...state, loading: false, data: action.payload };

    case EXPLORE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
