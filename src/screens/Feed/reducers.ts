import {
    FETCH_FEED_REQUEST,
    FETCH_FEED_SUCCESS,
    FETCH_FEED_FAILURE,
    FETCH_POPULAR_REQUEST,
    FETCH_POPULAR_SUCCESS,
    FETCH_POPULAR_FAILURE,
    FETCH_FEATURED_REQUEST,
    FETCH_FEATURED_SUCCESS,
    FETCH_FEATURED_FAILURE,
    UPVOTE_POST_SUCCESS,
    DOWNVOTE_POST_SUCCESS,
    SAVE_POST_SUCCESS,
    UNSAVE_POST_SUCCESS,
    HIDE_POST_SUCCESS,
    UNHIDE_POST_SUCCESS
} from "./actions";

const initialFeedState = {
    posts: [],
    loading: false,
    loadingMore: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
    },
    popularPosts: [],
    loadingPopular: false, // loadingMore logic for popular can reuse loadingMore or adding specific one logic
    // user hook had 'loading' and 'loadingMore' shared or distinct? 
    // "loading" was shared unless specifically guarded. 
    // In Redux it's cleaner to separate if needed.
    popularPagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
    },
    featuredPosts: [],
    loadingFeatured: false,
};

// Helper for vote update
const updateVote = (posts, id, type) => {
    return posts.map(p => {
        if (p.id === id) {
            let change = 0;
            if (type === 'upvote') {
                // If already upvoted, no change (or toggle off?). Assuming naive toggle ON here
                // Logic in Vue: toggle based on current state.
                // Simplified: Just mark as upvoted, increment count if not already
                return { ...p, is_upvoted: true, is_downvoted: false, upvote_count: (p.upvote_count || 0) + 1 };
            } else {
                return { ...p, is_upvoted: false, is_downvoted: true, upvote_count: Math.max(0, (p.upvote_count || 0) - 1) };
            }
        }
        return p;
    });
};

export const feedReducer = (state = initialFeedState, action) => {
    switch (action.type) {
        case FETCH_FEED_REQUEST:
            return {
                ...state,
                loading: !action.payload.isAppend,
                loadingMore: action.payload.isAppend,
                error: null
            };
        case FETCH_FEED_SUCCESS:
            return {
                ...state,
                loading: false,
                loadingMore: false,
                posts: action.payload.page === 1 ? action.payload.results : [...state.posts, ...action.payload.results],
                pagination: {
                    currentPage: action.payload.page,
                    totalPages: action.payload.totalPages,
                    totalCount: action.payload.count
                }
            };
        case FETCH_FEED_FAILURE:
            return { ...state, loading: false, loadingMore: false, error: action.payload };

        case FETCH_POPULAR_REQUEST:
            return { ...state, loadingPopular: true };
        case FETCH_POPULAR_SUCCESS:
            return {
                ...state,
                loadingPopular: false,
                popularPosts: action.payload.page === 1 ? action.payload.results : [...state.popularPosts, ...action.payload.results],
                popularPagination: {
                    currentPage: action.payload.page,
                    totalPages: action.payload.totalPages,
                    totalCount: action.payload.count
                }
            };
        case FETCH_POPULAR_FAILURE:
            return { ...state, loadingPopular: false }; // Error handling?

        case FETCH_FEATURED_REQUEST:
            return { ...state, loadingFeatured: true };
        case FETCH_FEATURED_SUCCESS:
            return { ...state, loadingFeatured: false, featuredPosts: action.payload };
        case FETCH_FEATURED_FAILURE:
            return { ...state, loadingFeatured: false };

        case UPVOTE_POST_SUCCESS:
            return {
                ...state,
                posts: updateVote(state.posts, action.payload.id, 'upvote'),
                popularPosts: updateVote(state.popularPosts, action.payload.id, 'upvote'),
            };
        case DOWNVOTE_POST_SUCCESS:
            return {
                ...state,
                posts: updateVote(state.posts, action.payload.id, 'downvote'),
                popularPosts: updateVote(state.popularPosts, action.payload.id, 'downvote'),
            };
        case SAVE_POST_SUCCESS:
            return {
                ...state,
                posts: state.posts.map(p => p.id === action.payload.id ? { ...p, is_saved: true } : p),
                popularPosts: state.popularPosts.map(p => p.id === action.payload.id ? { ...p, is_saved: true } : p),
            };
        case UNSAVE_POST_SUCCESS:
            return {
                ...state,
                posts: state.posts.map(p => p.id === action.payload.id ? { ...p, is_saved: false } : p),
                popularPosts: state.popularPosts.map(p => p.id === action.payload.id ? { ...p, is_saved: false } : p),
            };
        case HIDE_POST_SUCCESS:
            return {
                ...state,
                posts: state.posts.filter(p => p.id !== action.payload.id),
                popularPosts: state.popularPosts.filter(p => p.id !== action.payload.id),
            };
        default:
            return state;
    }
};
