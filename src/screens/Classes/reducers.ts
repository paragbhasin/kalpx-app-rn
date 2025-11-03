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

const initialState = {
  exploreClasses: {
    data: [],
    loading: false,
    error: null,
    hasMore: true,
  },
  bookings: {
    data: [],
    loading: false,
    error: null,
    hasMore: true,
  },
  tutorList: {
    data: [],
    loading: false,
    error: null,
    hasMore: true,
  },
  slots: {
    data: [],
    loading: false,
    error: null,
  },
};

const initialSearchBookingState = {
  data: [],
  loading: false,
  error: null,
  hasMore: false,
};

const initialSearchState = {
  data: [],
  loading: false,
  error: null,
  hasMore: false,
};


const initialMyBookingsState = {
  data: [],
  loading: false,
  error: null,
  hasMore: false,
};

const initialCancelState = {
  data: null,
  loading: false,
  error: null,
};

const initialReleaseHoldState = {
  data: null,
  loading: false,
  error: null,
};

// ✅ Explore Reducer
export const classesExploreReducer = (
  state = initialState.exploreClasses,
  action
) => {
  switch (action.type) {
    case EXPLORE_REQUEST:
      return { ...state, loading: true, error: null };
    case EXPLORE_SUCCESS:
      return {
        ...state,
        loading: false,
        data: [...state.data, ...action.payload.data],
        hasMore: action.payload.hasMore,
      };
    case EXPLORE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// ✅ Bookings Reducer
export const classesBookingsReducer = (
  state = initialState.bookings,
  action
) => {
  switch (action.type) {
    case BOOKINGS_REQUEST:
      return { ...state, loading: true, error: null };
    case BOOKINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        data: [...state.data, ...action.payload.data],
        hasMore: action.payload.hasMore,
      };
    case BOOKINGS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// ✅ Tutor List Reducer
export const classesTutorListReducer = (
  state = initialState.tutorList,
  action
) => {
  switch (action.type) {
    case TUTOR_LIST_REQUEST:
      return { ...state, loading: true, error: null };
    case TUTOR_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        data: [...state.data, ...(action.payload.data || [])],
        hasMore: action.payload.hasMore,
      };
    case TUTOR_LIST_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// ✅ Slots Reducer (fixed)
export const slotsListReducer = (state = initialState.slots, action) => {
  switch (action.type) {
    case SLOTS_REQUEST:
      return { ...state, loading: true, error: null };
    case SLOTS_SUCCESS:
      return {
        ...state,
        loading: false,
        data: Array.isArray(action.payload.data) ? action.payload.data : [],
      };
    case SLOTS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const bookSlotReducer = (state = initialState, action) => {
  switch (action.type) {
    case BOOK_SLOT_REQUEST:
      return { ...state, loading: true, error: null };
    case BOOK_SLOT_SUCCESS:
      return { ...state, loading: false, user: action.payload };
    case BOOK_SLOT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const rescheduleReducer = (state = initialState, action) => {
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

export const cancelBookingReducer = (state = initialCancelState, action) => {
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

export const classesFilterExploreReducer = (
  state = initialState.exploreClasses,
  action
) => {
  switch (action.type) {
    case EXPLORE_REQUEST:
    case FILTERED_EXPLORE_REQUEST:
      return { ...state, loading: true, error: null };

    case EXPLORE_SUCCESS:
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

    case EXPLORE_FAILURE:
    case FILTERED_EXPLORE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export const myBookingsFilterReducer = (state = initialMyBookingsState, action) => {
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

export const searchClassesReducer = (state = initialSearchState, action) => {
  switch (action.type) {
    case SEARCH_CLASSES_REQUEST:
      return { ...state, loading: true, error: null };

    case SEARCH_CLASSES_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload.data, // Always replace with new results
        hasMore: action.payload.hasMore,
      };

    case SEARCH_CLASSES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export const searchBookingsReducer = (
  state = initialSearchBookingState,
  action
) => {
  switch (action.type) {
    case SEARCH_BOOKINGS_REQUEST:
      return { ...state, loading: true, error: null };

    case SEARCH_BOOKINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload.data, // Replace (don’t append)
        hasMore: action.payload.hasMore,
      };

    case SEARCH_BOOKINGS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export const releaseHoldReducer = (state = initialReleaseHoldState, action) => {
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
