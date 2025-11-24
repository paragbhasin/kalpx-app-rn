import {
  MARK_READ_SUCCESS,
  NOTIFICATIONS_FAILURE,
  NOTIFICATIONS_REQUEST,
  NOTIFICATIONS_SUCCESS,
} from "./actions";

const initialState = {
  loading: false,
  data: [],
  error: null,
  page: 1,
  hasMore: true,
};

export const notificationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case NOTIFICATIONS_REQUEST:
      return { ...state, loading: true };

  case NOTIFICATIONS_SUCCESS:
  return {
    ...state,
    loading: false,
    data:
      action.payload.page === 1
        ? action.payload.data
        : [...state.data, ...action.payload.data],
    page: action.payload.page,
    hasMore: action.payload.data.length > 0,
  };


    case NOTIFICATIONS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case MARK_READ_SUCCESS:
      return {
        ...state,
        data: state.data.map((n) =>
          action.payload.includes(n.id)
            ? { ...n, read: true }
            : n
        ),
      };

    default:
      return state;
  }
};
