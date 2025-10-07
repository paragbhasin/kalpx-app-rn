import {
    BOOKINGS_FAILURE,
    BOOKINGS_REQUEST,
    BOOKINGS_SUCCESS,
    EXPLORE_FAILURE,
    EXPLORE_REQUEST,
    EXPLORE_SUCCESS
} from './actions';

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
};

export const classesExploreReducer = (state = initialState.exploreClasses, action) => {
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

export const classesBookingsReducer = (state = initialState.bookings, action) => {
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
