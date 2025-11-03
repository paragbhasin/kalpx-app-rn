import {
  COMPLETE_MANTRA_FAILURE,
  COMPLETE_MANTRA_REQUEST,
  COMPLETE_MANTRA_SUCCESS,
  POOJA_FAILURE,
  POOJA_REQUEST,
  POOJA_SUCCESS,
  PRACTICE_TODAY_FAILURE,
  PRACTICE_TODAY_REQUEST,
  PRACTICE_TODAY_SUCCESS,
  RETREAT_FAILURE,
  RETREAT_REQUEST,
  RETREAT_SUCCESS,
  START_MANTRA_FAILURE,
  START_MANTRA_REQUEST,
  START_MANTRA_SUCCESS,
  STREAKS_FAILURE,
  STREAKS_REQUEST,
  STREAKS_SUCCESS,
  SUBMIT_DHARMA_FAILURE,
  SUBMIT_DHARMA_REQUEST,
  SUBMIT_DHARMA_SUCCESS,
  TRACK_PRACTICE_FAILURE,
  TRACK_PRACTICE_REQUEST,
  TRACK_PRACTICE_SUCCESS,
  TRACKER_FAILURE,
  TRACKER_REQUEST,
  TRACKER_SUCCESS,
  TRAVEL_FAILURE,
  TRAVEL_REQUEST,
  TRAVEL_SUCCESS,
  VIDEO_CATEGORIES_FAILURE,
  VIDEO_CATEGORIES_REQUEST,
  VIDEO_CATEGORIES_SUCCESS,
  VIDEOS_FAILURE,
  VIDEOS_REQUEST,
  VIDEOS_RESET,
  VIDEOS_SUCCESS,
} from './actions';

const initialState = {
  loading: false,
  data: [],
  error: null,
  page: 1,
  hasMore: true,
};

const initialPracticeState = {
  loading: false,
  data: null,
  error: null,
};

const initialStartMantraState = {
  loading: false,
  data: null,
  error: null,
};

const initialCompleteMantraState = {
  loading: false,
  data: null,
  error: null,
};

const initialSubmitDharmaState = {
  loading: false,
  data: null,
  error: null,
};

const initialTrackPracticeState = {
  loading: false,
  data: null,
  error: null,
};


const initialTrackerState = {
  loading: false,
  data: null,
  error: null,
};

const initialStreaksState = {
  loading: false,
  data: { sankalp: 0, mantra: 0 },
  error: null,
};

const initialVideoCategoriesState = {
  loading: false,
  data: {
    categories: [],
    all_languages: [],
  },
  error: null,
};

const initialVideosState = {
  loading: false,
  data: [],
  error: null,
  page: 1,
  hasMore: true,
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

export const practiceTodayReducer = (state = initialPracticeState, action) => {
  switch (action.type) {
    case PRACTICE_TODAY_REQUEST:
      return { ...state, loading: true, error: null };
    case PRACTICE_TODAY_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case PRACTICE_TODAY_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const startMantraReducer = (state = initialStartMantraState, action) => {
  switch (action.type) {
    case START_MANTRA_REQUEST:
      return { ...state, loading: true, error: null };
    case START_MANTRA_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case START_MANTRA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const completeMantraReducer = (state = initialCompleteMantraState, action) => {
  switch (action.type) {
    case COMPLETE_MANTRA_REQUEST:
      return { ...state, loading: true, error: null };
    case COMPLETE_MANTRA_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case COMPLETE_MANTRA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const submitDharmaReducer = (state = initialSubmitDharmaState, action) => {
  switch (action.type) {
    case SUBMIT_DHARMA_REQUEST:
      return { ...state, loading: true, error: null };
    case SUBMIT_DHARMA_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case SUBMIT_DHARMA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const trackPracticeReducer = (state = initialTrackPracticeState, action) => {
  switch (action.type) {
    case TRACK_PRACTICE_REQUEST:
      return { ...state, loading: true, error: null };
    case TRACK_PRACTICE_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case TRACK_PRACTICE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const dailyDharmaTrackerReducer = (state = initialTrackerState, action) => {
  switch (action.type) {
    case TRACKER_REQUEST:
      return { ...state, loading: true, error: null };
    case TRACKER_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case TRACKER_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const practiceStreaksReducer = (state = initialStreaksState, action) => {
  switch (action.type) {
    case STREAKS_REQUEST:
      return { ...state, loading: true, error: null };
    case STREAKS_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case STREAKS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const videoCategoriesReducer = (state = initialVideoCategoriesState, action) => {
  switch (action.type) {
    case VIDEO_CATEGORIES_REQUEST:
      return { ...state, loading: true, error: null };
    case VIDEO_CATEGORIES_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case VIDEO_CATEGORIES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const videosReducer = (state = initialState, action) => {
  switch (action.type) {
    case VIDEOS_RESET:
      return initialState;
    case VIDEOS_REQUEST:
      return { ...state, loading: true, error: null };
    case VIDEOS_SUCCESS:
      const newData =
        action.payload.page === 1
          ? action.payload.data
          : [...state.data, ...action.payload.data];
      return {
        ...state,
        loading: false,
        data: newData,
        page: action.payload.page,
        hasMore: action.payload.data.length > 0,
      };
    case VIDEOS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
