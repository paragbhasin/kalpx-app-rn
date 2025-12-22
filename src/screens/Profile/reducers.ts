import {
  DELETE_ACCOUNT_FAILURE,
  DELETE_ACCOUNT_REQUEST,
  DELETE_ACCOUNT_SUCCESS,
  PROFILE_DETAILS_FAILURE,
  PROFILE_DETAILS_REQUEST,
  PROFILE_DETAILS_SUCCESS,
  PROFILE_OPTIONS_FAILURE,
  PROFILE_OPTIONS_REQUEST,
  PROFILE_OPTIONS_SUCCESS,
  UPDATE_PROFILE_FAILURE,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
} from "./actions";

// 🔹 Initial states
const initialOptionsState = {
  loading: false,
  data: null,
  error: null,
};

const initialDetailsState = {
  loading: false,
  data: null,
  error: null,
};

const initialUpdateState = {
  loading: false,
  success: false,
  error: null,
};

const initialDeleteAccountState = {
  loading: false,
  success: false,
  error: null,
};

// 🔹 Reducer for Profile Options
export const profileOptionsReducer = (state = initialOptionsState, action) => {
  switch (action.type) {
    case PROFILE_OPTIONS_REQUEST:
      return { ...state, loading: true, error: null };
    case PROFILE_OPTIONS_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case PROFILE_OPTIONS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// 🔹 Reducer for Profile Details
export const profileDetailsReducer = (state = initialDetailsState, action) => {
  switch (action.type) {
    case PROFILE_DETAILS_REQUEST:
      return { ...state, loading: true, error: null };
    case PROFILE_DETAILS_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case PROFILE_DETAILS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const updateProfileReducer = (state = initialUpdateState, action) => {
  switch (action.type) {
    case UPDATE_PROFILE_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case UPDATE_PROFILE_SUCCESS:
      return { ...state, loading: false, success: true, error: null };
    case UPDATE_PROFILE_FAILURE:
      return { ...state, loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

export const deleteAccountReducer = (state = initialDeleteAccountState, action) => {
  switch (action.type) {
    case DELETE_ACCOUNT_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case DELETE_ACCOUNT_SUCCESS:
      return { ...state, loading: false, success: true, error: null };
    case DELETE_ACCOUNT_FAILURE:
      return { ...state, loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};