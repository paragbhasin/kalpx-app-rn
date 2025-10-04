import {
    POOJA_FAILURE,
    POOJA_REQUEST,
    POOJA_SUCCESS,
    RETREAT_FAILURE,
    RETREAT_REQUEST,
    RETREAT_SUCCESS,
    TRAVEL_FAILURE,
    TRAVEL_REQUEST,
    TRAVEL_SUCCESS
} from './actions';

const initialState = {
  loading: false,
  user: null,
  error: null,
};

export const travelReducer = (state = initialState, action) => {
  switch (action.type) {
    case TRAVEL_REQUEST:
      return { ...state, loading: true, error: null };
    case TRAVEL_SUCCESS:
      return { ...state, loading: false, user: action.payload };
    case TRAVEL_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const poojaReducer = (state = initialState, action) => {
  switch (action.type) {
    case POOJA_REQUEST:
      return { ...state, loading: true, error: null };
    case POOJA_SUCCESS:
      return { ...state, loading: false, user: action.payload };
    case POOJA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const verifyOtpReducer = (state = initialState, action) => {
  switch (action.type) {
    case RETREAT_REQUEST:
      return { ...state, loading: true, error: null };
    case RETREAT_SUCCESS:
      return { ...state, loading: false, user: action.payload };
    case RETREAT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
