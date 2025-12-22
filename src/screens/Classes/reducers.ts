import {
  BOOK_SLOT_FAILURE,
  BOOK_SLOT_REQUEST,
  BOOK_SLOT_SUCCESS,
  BOOKINGS_FAILURE,
  BOOKINGS_REQUEST,
  BOOKINGS_SUCCESS,
  CANCEL_BOOKING_FAILURE,
  CANCEL_BOOKING_REQUEST,
  CANCEL_BOOKING_SUCCESS,
  EXPLORE_FAILURE,
  EXPLORE_REQUEST,
  EXPLORE_SUCCESS,
  FILTERED_EXPLORE_FAILURE,
  FILTERED_EXPLORE_REQUEST,
  FILTERED_EXPLORE_SUCCESS,
  MY_BOOKINGS_FAILURE,
  MY_BOOKINGS_REQUEST,
  MY_BOOKINGS_SUCCESS,
  RELEASE_HOLD_FAILURE,
  RELEASE_HOLD_REQUEST,
  RELEASE_HOLD_SUCCESS,
  RESCHEDULE_FAILURE,
  RESCHEDULE_REQUEST,
  RESCHEDULE_SUCCESS,
  SEARCH_BOOKINGS_FAILURE,
  SEARCH_BOOKINGS_REQUEST,
  SEARCH_BOOKINGS_SUCCESS,
  SEARCH_CLASSES_FAILURE,
  SEARCH_CLASSES_REQUEST,
  SEARCH_CLASSES_SUCCESS,
  SLOTS_FAILURE,
  SLOTS_REQUEST,
  SLOTS_SUCCESS,
  TUTOR_LIST_FAILURE,
  TUTOR_LIST_REQUEST,
  TUTOR_LIST_SUCCESS,
} from "./actions";

// ======================
// Common Initial States
// ======================
const listState = {
  data: [],
  loading: false,
  error: null,
  hasMore: true,
};
const singleState = {
  data: null,
  loading: false,
  error: null,
};

const tutorList = {
    data: [],
    loading: false,
    error: null,
    hasMore: true,
  }

export const classesExploreReducer = (state = listState, action: any) => {
  switch (action.type) {
    case EXPLORE_REQUEST:
      return { ...state, loading: true, error: null };
    case EXPLORE_SUCCESS:
      return {
        ...state,
        loading: false,
        data:
          action.payload.page === 1
            ? action.payload.data
            : [...state.data, ...action.payload.data],
        hasMore: action.payload.hasMore,
      };
    case EXPLORE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const classesBookingsReducer = (state = listState, action: any) => {
  switch (action.type) {
    case BOOKINGS_REQUEST:
      return { ...state, loading: true, error: null };
    case BOOKINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        data:
          action.payload.page === 1
            ? action.payload.data
            : [...state.data, ...action.payload.data],
        hasMore: action.payload.hasMore,
      };
    case BOOKINGS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};


export const classesFilterExploreReducer = (state = listState, action: any) => {
  switch (action.type) {
    case FILTERED_EXPLORE_REQUEST:
      return { ...state, loading: true, error: null };
    case FILTERED_EXPLORE_SUCCESS:
      return {
        ...state,
        loading: false,
        data:
          action.payload.page === 1
            ? action.payload.data
            : [...state.data, ...action.payload.data],
        hasMore: action.payload.hasMore,
      };
    case FILTERED_EXPLORE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// =============================================================
// FILTERED MY BOOKINGS
// =============================================================
export const myBookingsFilterReducer = (state = listState, action: any) => {
  switch (action.type) {
    case MY_BOOKINGS_REQUEST:
      return { ...state, loading: true, error: null };
    case MY_BOOKINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        data:
          action.payload.page === 1
            ? action.payload.data
            : [...state.data, ...action.payload.data],
        hasMore: action.payload.hasMore,
      };
    case MY_BOOKINGS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// =============================================================
// SEARCH CLASSES
// =============================================================
export const searchClassesReducer = (state = listState, action: any) => {
  switch (action.type) {
    case SEARCH_CLASSES_REQUEST:
      return { ...state, loading: true, error: null };
    case SEARCH_CLASSES_SUCCESS:
      return {
        ...state,
        loading: false,
        data:
          action.payload.page === 1
            ? action.payload.data
            : [...state.data, ...action.payload.data],
        hasMore: action.payload.hasMore,
      };
    case SEARCH_CLASSES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// =============================================================
// SEARCH BOOKINGS
// =============================================================
export const searchBookingsReducer = (state = listState, action: any) => {
  switch (action.type) {
    case SEARCH_BOOKINGS_REQUEST:
      return { ...state, loading: true, error: null };
    case SEARCH_BOOKINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        data:
          action.payload.page === 1
            ? action.payload.data
            : [...state.data, ...action.payload.data],
        hasMore: action.payload.hasMore,
      };
    case SEARCH_BOOKINGS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// =============================================================
// SLOTS
// =============================================================
export const slotsListReducer = (state = listState, action: any) => {
  switch (action.type) {
    case SLOTS_REQUEST:
      return { ...state, loading: true, error: null };
    case SLOTS_SUCCESS:
      return { ...state, loading: false, data: action.payload.data || [] };
    case SLOTS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// =============================================================
// BOOK SLOT
// =============================================================
export const bookSlotReducer = (state = singleState, action: any) => {
  switch (action.type) {
    case BOOK_SLOT_REQUEST:
      return { ...state, loading: true, error: null };
    case BOOK_SLOT_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case BOOK_SLOT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// =============================================================
// RESCHEDULE
// =============================================================
export const rescheduleReducer = (state = singleState, action: any) => {
  switch (action.type) {
    case RESCHEDULE_REQUEST:
      return { ...state, loading: true, error: null };
    case RESCHEDULE_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case RESCHEDULE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// =============================================================
// CANCEL BOOKING
// =============================================================
export const cancelBookingReducer = (state = singleState, action: any) => {
  switch (action.type) {
    case CANCEL_BOOKING_REQUEST:
      return { ...state, loading: true, error: null };
    case CANCEL_BOOKING_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case CANCEL_BOOKING_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// =============================================================
// RELEASE HOLD
// =============================================================
export const releaseHoldReducer = (state = singleState, action: any) => {
  switch (action.type) {
    case RELEASE_HOLD_REQUEST:
      return { ...state, loading: true, error: null };
    case RELEASE_HOLD_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case RELEASE_HOLD_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const classesTutorListReducer = (
  state = tutorList,
  action
) => {
  switch (action.type) {
    case TUTOR_LIST_REQUEST:
      return { ...state, loading: true, error: null };
  case TUTOR_LIST_SUCCESS:
  return {
    ...state,
    loading: false,
    data: [
      ...state.data,
      ...((action.payload.data?.classes?.results) || [])
    ],
    hasMore: action.payload.hasMore,
  };
    case TUTOR_LIST_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};