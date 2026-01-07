// src/screens/Social/reducers.ts
import {
  EXPLORE_FAILURE,
  EXPLORE_REQUEST,
  EXPLORE_SUCCESS,
  FETCH_COMMUNITIES_REQUEST,
  FETCH_COMMUNITIES_SUCCESS,
  FETCH_COMMUNITIES_FAILURE,
  FETCH_TOP_COMMUNITIES_REQUEST,
  FETCH_TOP_COMMUNITIES_SUCCESS,
  FETCH_TOP_COMMUNITIES_FAILURE,
  FOLLOW_COMMUNITY_SUCCESS,
  UNFOLLOW_COMMUNITY_SUCCESS,
} from "./actions";

const initialState = {
  loading: false,
  data: [],
  error: null,
};

export const socialExploreReducer = (state = initialState, action) => {
  switch (action.type) {
    case EXPLORE_REQUEST:
      return { ...state, loading: true, error: null };

    case EXPLORE_SUCCESS:
      console.log("🔥 REDUCER RECEIVED ITEMS:", action.payload.length);
      return { ...state, loading: false, data: action.payload };

    case EXPLORE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

const initialCommunitiesState = {
  loading: false,
  data: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  },
  error: null,
};

export const communitiesReducer = (state = initialCommunitiesState, action) => {
  switch (action.type) {
    case FETCH_COMMUNITIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        data: action.payload.page === 1 ? [] : state.data
      };

    case FETCH_TOP_COMMUNITIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        data: [] // Always clear for page navigation in Top Communities
      };


    case FETCH_COMMUNITIES_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload.page === 1 ? action.payload.results : [...state.data, ...action.payload.results],
        pagination: {
          currentPage: action.payload.page,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.count
        }
      };

    case FETCH_TOP_COMMUNITIES_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload.results, // Always replace for Top Communities page navigation
        pagination: {
          currentPage: action.payload.page,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.count
        }
      };


    case FETCH_COMMUNITIES_FAILURE:
    case FETCH_TOP_COMMUNITIES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case FOLLOW_COMMUNITY_SUCCESS:
      return {
        ...state,
        data: state.data.map(c =>
          (c.id === action.payload.id || c.slug === action.payload.id)
            ? { ...c, is_followed: true, follower_count: (c.follower_count || 0) + 1 }
            : c
        )
      };

    case UNFOLLOW_COMMUNITY_SUCCESS:
      return {
        ...state,
        data: state.data.map(c =>
          (c.id === action.payload.id || c.slug === action.payload.id)
            ? { ...c, is_followed: false, follower_count: Math.max(0, (c.follower_count || 0) - 1) }
            : c
        )
      };

    default:
      return state;
  }
};
