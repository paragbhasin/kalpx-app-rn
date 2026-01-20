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
  FETCH_COMMUNITY_DETAIL_REQUEST,
  FETCH_COMMUNITY_DETAIL_SUCCESS,
  FETCH_COMMUNITY_DETAIL_FAILURE,
  FETCH_COMMUNITY_POSTS_REQUEST,
  FETCH_COMMUNITY_POSTS_SUCCESS,
  FETCH_COMMUNITY_POSTS_FAILURE,
} from "./actions";
import { POST_DETAIL_INTERACTION_SUCCESS } from "../PostDetail/actions";

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
  communityDetail: {
    loading: false,
    data: null,
    error: null,
  },
  communityPosts: {
    loading: false,
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    },
    error: null,
  }
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

    case FETCH_COMMUNITY_DETAIL_REQUEST:
      return {
        ...state,
        communityDetail: { ...state.communityDetail, loading: true, error: null }
      };
    case FETCH_COMMUNITY_DETAIL_SUCCESS:
      return {
        ...state,
        communityDetail: { loading: false, data: action.payload, error: null }
      };
    case FETCH_COMMUNITY_DETAIL_FAILURE:
      return {
        ...state,
        communityDetail: { ...state.communityDetail, loading: false, error: action.payload }
      };

    case FETCH_COMMUNITY_POSTS_REQUEST:
      return {
        ...state,
        communityPosts: {
          ...state.communityPosts,
          loading: true,
          error: null,
          data: action.payload.page === 1 ? [] : state.communityPosts.data
        }
      };
    case FETCH_COMMUNITY_POSTS_SUCCESS:
      return {
        ...state,
        communityPosts: {
          loading: false,
          data: action.payload.page === 1 ? action.payload.results : [...state.communityPosts.data, ...action.payload.results],
          pagination: {
            currentPage: action.payload.page,
            totalPages: action.payload.totalPages,
            totalCount: action.payload.count
          },
          error: null
        }
      };
    case FETCH_COMMUNITY_POSTS_FAILURE:
      return {
        ...state,
        communityPosts: { ...state.communityPosts, loading: false, error: action.payload }
      };

    case POST_DETAIL_INTERACTION_SUCCESS: {
      const { id, type: interaction } = action.payload;
      const updatePost = (p) => {
        if (p.id !== id) return p;
        let updatedPost = { ...p };

        if (interaction === 'upvote') {
          const currentVote = updatedPost.user_vote || 0;
          if (currentVote === 1) {
            updatedPost.upvote_count = Math.max(0, (updatedPost.upvote_count || 0) - 1);
            updatedPost.user_vote = 0;
          } else if (currentVote === -1) {
            updatedPost.upvote_count = (updatedPost.upvote_count || 0) + 2;
            updatedPost.user_vote = 1;
          } else {
            updatedPost.upvote_count = (updatedPost.upvote_count || 0) + 1;
            updatedPost.user_vote = 1;
          }
        } else if (interaction === 'downvote') {
          const currentVote = updatedPost.user_vote || 0;
          if (currentVote === -1) {
            updatedPost.upvote_count = (updatedPost.upvote_count || 0) + 1;
            updatedPost.user_vote = 0;
          } else if (currentVote === 1) {
            updatedPost.upvote_count = Math.max(0, (updatedPost.upvote_count || 0) - 2);
            updatedPost.user_vote = -1;
          } else {
            updatedPost.upvote_count = Math.max(0, (updatedPost.upvote_count || 0) - 1);
            updatedPost.user_vote = -1;
          }
        } else if (interaction === 'save') {
          updatedPost.is_saved = true;
        } else if (interaction === 'unsave') {
          updatedPost.is_saved = false;
        }
        return updatedPost;
      };

      return {
        ...state,
        communityPosts: {
          ...state.communityPosts,
          data: state.communityPosts.data.map(updatePost)
        }
      };
    }

    default:
      return state;
  }
};
