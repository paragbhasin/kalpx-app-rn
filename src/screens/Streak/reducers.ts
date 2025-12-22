import {
    FETCH_DAILY_PRACTICE_FAILURE,
    FETCH_DAILY_PRACTICE_REQUEST,
    FETCH_DAILY_PRACTICE_SUCCESS,
    FETCH_PRACTICE_HISTORY_FAILURE,
    FETCH_PRACTICE_HISTORY_REQUEST,
    FETCH_PRACTICE_HISTORY_SUCCESS,
} from "./actions";

const initialState = {
  loading: false,
  data: [],
  error: null,
};

export const practiceReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PRACTICE_HISTORY_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_PRACTICE_HISTORY_SUCCESS:
     setTimeout(() => {
    console.log("✅ Reducer received payload::::::::::::::", JSON.stringify(action.payload, null, 2));
  }, 0);
  return { ...state, loading: false, data: action.payload };
    case FETCH_PRACTICE_HISTORY_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const dailyPracticeReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DAILY_PRACTICE_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_DAILY_PRACTICE_SUCCESS:
      console.log("✅ Reducer received daily practice:", action.payload);
      return { ...state, loading: false, data: action.payload };
    case FETCH_DAILY_PRACTICE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
