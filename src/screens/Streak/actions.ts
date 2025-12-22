import api from "../../Networks/axios"; // your axios instance

// 🔹 Action Types
export const FETCH_PRACTICE_HISTORY_REQUEST = "FETCH_PRACTICE_HISTORY_REQUEST";
export const FETCH_PRACTICE_HISTORY_SUCCESS = "FETCH_PRACTICE_HISTORY_SUCCESS";
export const FETCH_PRACTICE_HISTORY_FAILURE = "FETCH_PRACTICE_HISTORY_FAILURE";
export const FETCH_DAILY_PRACTICE_REQUEST = "FETCH_DAILY_PRACTICE_REQUEST";
export const FETCH_DAILY_PRACTICE_SUCCESS = "FETCH_DAILY_PRACTICE_SUCCESS";
export const FETCH_DAILY_PRACTICE_FAILURE = "FETCH_DAILY_PRACTICE_FAILURE";

// 🔹 Action Creators
export const fetchStreakRequest = () => ({
  type: FETCH_PRACTICE_HISTORY_REQUEST,
});

export const fetchStreakSuccess = (res) => ({
  type: FETCH_PRACTICE_HISTORY_SUCCESS,
  payload: res, // ✅ should be full response, not res.user
});

export const fetchStreakFailure = (error) => ({
  type: FETCH_PRACTICE_HISTORY_FAILURE,
  payload: error,
});

// 🔹 Action Creators
export const fetchDailyPracticeRequest = () => ({
  type: FETCH_DAILY_PRACTICE_REQUEST,
});

export const fetchDailyPracticeSuccess = (res) => ({
  type: FETCH_DAILY_PRACTICE_SUCCESS,
  payload: res,
});

export const fetchDailyPracticeFailure = (error) => ({
  type: FETCH_DAILY_PRACTICE_FAILURE,
  payload: error,
});

// 🔹 Thunk Action
export const fetchPracticeHistory = (timezone) => async (dispatch) => {
  try {
    dispatch(fetchStreakRequest());
    const response = await api.get(`/practice/history/?tz=${encodeURIComponent(timezone)}`);
    console.log("✅ API Response before dispatch:", response.data);
    dispatch(fetchStreakSuccess(response.data));
  } catch (error) {
    console.log("❌ API Error:", error.message);
    dispatch(fetchStreakFailure(error.message || "Something went wrong"));
  }
};

export const fetchDailyPractice = (date: string, timezone: string) => async (dispatch) => {
  try {
    dispatch(fetchDailyPracticeRequest());
    const response = await api.get(
      `/daily-dharma/tracker/?date=${date}&timezone=${encodeURIComponent(timezone)}`
    );
    console.log("✅ Daily Practice API Response:", response.data);
    dispatch(fetchDailyPracticeSuccess(response.data));
  } catch (error: any) {
    console.log("❌ Daily Practice API Error:", error.message);
    dispatch(fetchDailyPracticeFailure(error.message || "Something went wrong"));
  }
};

