import {
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  SOCIAL_LOGIN_FAILURE,
  SOCIAL_LOGIN_REQUEST,
  SOCIAL_LOGIN_SUCCESS
} from './actions';

const initialState = {
  loading: false,
  user: null,
  error: null,
};

export const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, loading: true, error: null };
    case LOGIN_SUCCESS:
      return { ...state, loading: false, user: action.payload };
    case LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const socialLoginReducer = (state = initialState, action) => {
  switch (action.type) {
    case SOCIAL_LOGIN_REQUEST:
      return { ...state, loading: true, error: null };
    case SOCIAL_LOGIN_SUCCESS:
      return { ...state, loading: false, user: action.payload };
    case SOCIAL_LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
