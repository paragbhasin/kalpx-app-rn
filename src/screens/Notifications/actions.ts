import api from "../../Networks/axios";

export const NOTIFICATIONS_REQUEST = "NOTIFICATIONS_REQUEST";
export const NOTIFICATIONS_SUCCESS = "NOTIFICATIONS_SUCCESS";
export const NOTIFICATIONS_FAILURE = "NOTIFICATIONS_FAILURE";

export const MARK_READ_REQUEST = "MARK_READ_REQUEST";
export const MARK_READ_SUCCESS = "MARK_READ_SUCCESS";
export const MARK_READ_FAILURE = "MARK_READ_FAILURE";

export const fetchNotifications = (page = 1, limit = 20) => async (dispatch) => {
  dispatch({ type: NOTIFICATIONS_REQUEST });

  try {
    const res = await api.get(`/notifications/?page=${page}&page_size=${limit}`);

    console.log("noti data 222 >>>>>",res.data?.results?.notifications)

    dispatch({
      type: NOTIFICATIONS_SUCCESS,
      payload: {
        data: res.data?.results?.notifications || [],
        count: res.data?.results?.count || 0,
        page,
      },
    });
  } catch (error) {
    dispatch({
      type: NOTIFICATIONS_FAILURE,
      payload: error.message,
    });
  }
};



// export const fetchNotifications = (page = 1, limit = 20) => async (dispatch) => {
//   dispatch({ type: NOTIFICATIONS_REQUEST });

//   try {
//     const res = await api.get(`/notifications/?page=${page}&page_size=${limit}`);

//     dispatch({
//       type: NOTIFICATIONS_SUCCESS,
//       payload: {
//         data: res.data,
//         page,
//       },
//     });
//   } catch (error) {
//     dispatch({
//       type: NOTIFICATIONS_FAILURE,
//       payload: error.message,
//     });
//   }
// };

export const markNotificationsRead = (ids) => async (dispatch) => {
  dispatch({ type: MARK_READ_REQUEST });

  try {
    await api.post("/notifications/mark-read/", { ids });

    dispatch({
      type: MARK_READ_SUCCESS,
      payload: ids,
    });
  } catch (error) {
    dispatch({
      type: MARK_READ_FAILURE,
      payload: error.message,
    });
  }
};
