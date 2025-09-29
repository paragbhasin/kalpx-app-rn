import {
    GENERATE_OTP_FAILURE,
    GENERATE_OTP_REQUEST,
    GENERATE_OTP_SUCCESS,
    SIGNUP_FAILURE,
    SIGNUP_REQUEST,
    SIGNUP_SUCCESS,
    VERIFY_OTP_FAILURE,
    VERIFY_OTP_REQUEST,
    VERIFY_OTP_SUCCESS
} from './actions';

const initialState = {
  loading: false,
  user: null,
  error: null,
};

export const signupReducer = (state = initialState, action) => {
  switch (action.type) {
    case SIGNUP_REQUEST:
      return { ...state, loading: true, error: null };
    case SIGNUP_SUCCESS:
      return { ...state, loading: false, user: action.payload };
    case SIGNUP_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const generateOtpReducer = (state = initialState, action) => {
  switch (action.type) {
    case GENERATE_OTP_REQUEST:
      return { ...state, loading: true, error: null };
    case GENERATE_OTP_SUCCESS:
      return { ...state, loading: false, user: action.payload };
    case GENERATE_OTP_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const verifyOtpReducer = (state = initialState, action) => {
  switch (action.type) {
    case VERIFY_OTP_REQUEST:
      return { ...state, loading: true, error: null };
    case VERIFY_OTP_SUCCESS:
      return { ...state, loading: false, user: action.payload };
    case VERIFY_OTP_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
