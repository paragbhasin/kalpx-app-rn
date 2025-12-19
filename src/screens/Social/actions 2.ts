// src/screens/Social/actions.ts
import api from "../../Networks/axios";

export const EXPLORE_REQUEST = "EXPLORE_REQUEST";
export const EXPLORE_SUCCESS = "EXPLORE_SUCCESS";
export const EXPLORE_FAILURE = "EXPLORE_FAILURE";

export const fetchExplorePosts = () => async (dispatch) => {
  dispatch({ type: EXPLORE_REQUEST });

  try {
    const res = await api.get("/public/explore-posts/");
    console.log("🔥 THUNK RECEIVED:", res.data?.length);

    dispatch({
      type: EXPLORE_SUCCESS,
      payload: Array.isArray(res.data) ? res.data : [],
    });
  } catch (err) {
    dispatch({
      type: EXPLORE_FAILURE,
      payload: err?.message || "Something went wrong",
    });
  }
};
